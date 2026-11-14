// Node 24+: actual src modules are transpiled in memory; no server or real credentials are used.
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const srcRoot = resolve(projectRoot, "src");
registerHooks({
  resolve(specifier, context, nextResolve) {
    let candidate;
    if (specifier.startsWith("@/")) candidate = resolve(srcRoot, specifier.slice(2));
    else if (specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(srcRoot).href)) {
      candidate = resolve(dirname(fileURLToPath(context.parentURL)), specifier);
    }
    if (candidate) {
      for (const extension of ["", ".ts", ".tsx"]) {
        if (existsSync(candidate + extension) && /\.tsx?$/.test(candidate + extension)) {
          return nextResolve(pathToFileURL(candidate + extension).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(pathToFileURL(srcRoot).href) && /\.tsx?$/.test(url)) {
      if (url.endsWith("/config/env.ts")) {
        return { format: "module", shortCircuit: true, source: 'export const env = { apiBaseUrl: "https://mock.invalid/" };' };
      }
      // Provide a logged-in identity for the server-rendered component test.
      // JWT parsing and the real auth store are tested separately below.
      if (url.endsWith("/hooks/use-member-id.ts")) {
        return { format: "module", shortCircuit: true, source: 'export function useMemberId() { return 42; }' };
      }
      const source = readFileSync(fileURLToPath(url), "utf8");
      return { format: "module", shortCircuit: true, source: ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};
const pending = [];
globalThis.fetch = async (input) => {
  const expected = pending.shift();
  assert.ok(expected, "Unexpected request (real network is disabled)");
  const request = input instanceof Request ? input : new Request(input);
  assert.equal(new URL(request.url).pathname, expected.path);
  assert.equal(request.method, expected.method);
  assert.equal(request.headers.get("Authorization"), expected.auth === false ? null : "Bearer test-token");
  if (expected.body) assert.deepEqual(await request.json(), expected.body);
  return new Response(JSON.stringify(expected.response), {
    status: expected.status ?? 200,
    headers: { "Content-Type": "application/json" },
  });
};

const src = (path) => import(pathToFileURL(resolve(srcRoot, path)).href);
const { useAuthStore } = await src("stores/auth-store.ts");
const { getMemberId } = await src("utils/auth/get-member-id.ts");
const { favoriteKeys, ratingKeys } = await src("utils/query-keys.ts");
const { updateRatingList } = await src("utils/ratings/update-rating-list.ts");
const { getFavorites } = await src("api/favorites/get-favorites.ts");
const { getFavorite } = await src("api/favorites/get-favorite.ts");
const { addFavorite } = await src("api/favorites/add-favorite.ts");
const { deleteFavorite } = await src("api/favorites/delete-favorite.ts");
const { getMemberRatings } = await src("api/ratings/get-member-ratings.ts");
const { createRating } = await src("api/ratings/create-rating.ts");
const { updateRating } = await src("api/ratings/update-rating.ts");
const { deleteRating } = await src("api/ratings/delete-rating.ts");
const { MovieRatingSection } = await src("components/movies/movie-rating-section.tsx");

const envelope = (result) => ({ isSuccess: true, code: "COMMON200", message: "OK", result });
const rating = { ratingId: 10, movieId: 123, score: 4, comment: "후기", createdAt: "2026-11-13T10:00:00", updatedAt: "2026-11-13T10:00:00" };
const token = (payload) => `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;

test("JWT sub: unicode payload and malformed/unsafe IDs", () => {
  assert.equal(getMemberId(token({ sub: "42", nickname: "에코" })), 42);
  for (const invalid of [null, "broken", "a.@@.b", token({}), token({ sub: 42 }), token({ sub: "-1" }), token({ sub: "1.5" }), token({ sub: "9007199254740992" })]) {
    assert.equal(getMemberId(invalid), null);
  }
});

test("favorites: all four request methods, bodies, auth headers and result shapes", async () => {
  useAuthStore.getState().setAccessToken("test-token");
  pending.push({ method: "GET", path: "/favorites", response: envelope([]) });
  assert.deepEqual(await getFavorites(), []);
  pending.push({ method: "GET", path: "/favorites/123", response: envelope({ movieId: 123, isFavorite: false }) });
  assert.equal((await getFavorite(123)).isFavorite, false);
  pending.push({ method: "POST", path: "/favorites", body: { movieId: 123 }, status: 201, response: envelope({ movieId: 123, isFavorite: true }) });
  assert.equal((await addFavorite(123)).isFavorite, true);
  pending.push({ method: "DELETE", path: "/favorites/123", response: envelope(null) });
  await deleteFavorite(123);
  assert.equal(pending.length, 0);
});

test("ratings: raw public GET, authenticated create/update/delete and exact body fields", async () => {
  pending.push({ method: "GET", path: "/members/42/ratings", auth: false, response: [rating] });
  assert.deepEqual(await getMemberRatings(42), [rating]);
  pending.push({ method: "POST", path: "/ratings", body: { movieId: 123, score: 4, comment: "후기" }, status: 201, response: envelope(rating) });
  assert.deepEqual(await createRating({ movieId: 123, score: 4, comment: "후기" }), rating);
  const changed = { ...rating, score: 5, comment: "수정" };
  pending.push({ method: "PATCH", path: "/ratings/10", body: { score: 5, comment: "수정" }, response: envelope(changed) });
  assert.deepEqual(await updateRating(10, { score: 5, comment: "수정" }), changed);
  pending.push({ method: "DELETE", path: "/ratings/10", response: envelope(null) });
  await deleteRating(10);
  assert.equal(pending.length, 0);
});

test("API failures reject; 401 clears auth storage", async () => {
  pending.push({ method: "POST", path: "/favorites", body: { movieId: 123 }, response: { isSuccess: false, code: "FAILED", message: "실패", result: null } });
  await assert.rejects(addFavorite(123), /실패/);
  pending.push({ method: "POST", path: "/ratings", body: { movieId: 123, score: 6, comment: "" }, status: 400, response: { isSuccess: false } });
  await assert.rejects(createRating({ movieId: 123, score: 6, comment: "" }));
  pending.push({ method: "GET", path: "/favorites", status: 401, response: { isSuccess: false } });
  await assert.rejects(getFavorites());
  assert.equal(useAuthStore.getState().accessToken, null);
  assert.equal(JSON.parse(memory.get("umcine-auth-store")).state.accessToken, null);
});

test("rating cache: add/replace/delete, no extra fetch on fresh remount, member separation", () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false, gcTime: Infinity } } });
  const key = ratingKeys.member(42);
  client.setQueryData(key, []);
  client.setQueryData(key, (previous) => updateRatingList(previous, null, rating));
  assert.deepEqual(client.getQueryData(key), [rating]);
  const changed = { ...rating, score: 5 };
  client.setQueryData(key, (previous) => updateRatingList(previous, 10, changed));
  assert.deepEqual(client.getQueryData(key), [changed]);
  let requests = 0;
  const observer = new QueryObserver(client, { queryKey: key, queryFn: () => { requests += 1; return []; } });
  const unsubscribe = observer.subscribe(() => {});
  assert.equal(requests, 0);
  assert.equal(observer.getCurrentResult().data[0].score, 5);
  assert.equal(client.getQueryData(ratingKeys.member(43)), undefined);
  assert.notDeepEqual(favoriteKeys.list(42), favoriteKeys.list(43));
  assert.notDeepEqual(favoriteKeys.detail(42, 123), favoriteKeys.detail(42, 456));
  client.setQueryData(key, (previous) => updateRatingList(previous, 10, null));
  assert.deepEqual(client.getQueryData(key), []);
  assert.equal(updateRatingList(undefined, null, rating), undefined);
  unsubscribe();
  client.clear();
});

test("rating UI: loading/error/empty/existing rating states render from real query data", () => {
  useAuthStore.getState().setAccessToken(token({ sub: "42" }));
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retryOnMount: false, gcTime: Infinity } } });
  const key = ratingKeys.member(42);
  const render = () => renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(MovieRatingSection, { movieId: 123 })));
  assert.match(render(), /내 평점을 불러오는 중/);
  client.getQueryCache().find({ queryKey: key }).setState({ status: "error", error: new Error("mock failure") });
  assert.match(render(), /내 평점을 불러오지 못했어요/);
  client.setQueryData(key, []);
  const empty = render();
  assert.match(empty, /아직 작성한 평점이 없어요/);
  assert.match(empty, /disabled=""/);
  assert.match(empty, /등록<\/button>/);
  client.setQueryData(key, [rating]);
  const saved = render();
  assert.match(saved, /등록한 평점: 4점/);
  assert.match(saved, /후기<\/textarea>/);
  assert.match(saved, /수정<\/button>/);
  assert.match(saved, /삭제<\/button>/);
  assert.equal(pending.length, 0);
  client.clear();
  useAuthStore.getState().setAccessToken(null);
});
