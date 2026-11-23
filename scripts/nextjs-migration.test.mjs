// Actual store and cache modules run without a browser or real API credentials.
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";

const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
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
      return {
        format: "module", shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
        }).outputText,
      };
    }
    return nextLoad(url, context);
  },
});

const src = (file) => import(pathToFileURL(resolve(srcRoot, file)).href);
const { clientStorage } = await src("utils/client-storage.ts");
const { useAuthStore } = await src("stores/auth-store.ts");
const { useBookmarkStore } = await src("stores/bookmark-store.ts");
const { readBookmarkIds, saveBookmarkIds } = await src("utils/bookmark-storage.ts");
const { getQueryClient } = await src("utils/query-client.ts");

const memory = new Map();
function browser() {
  globalThis.window = { localStorage: {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  } };
}

test("server imports and storage calls need no window or localStorage", () => {
  assert.equal(typeof window, "undefined");
  assert.equal(useAuthStore.getState().accessToken, null);
  assert.deepEqual(useBookmarkStore.getState().bookmarkedMovieIds, []);
  assert.equal(useAuthStore.persist.hasHydrated(), false);
  assert.equal(useBookmarkStore.persist.hasHydrated(), false);
  assert.equal(clientStorage.getItem("anything"), null);
  assert.deepEqual(readBookmarkIds(), []);
  assert.doesNotThrow(() => saveBookmarkIds([123]));
});

test("browser hydration restores saved auth and filters invalid bookmark IDs", async () => {
  browser();
  memory.set("umcine-auth-store", JSON.stringify({ state: { accessToken: "saved-token" }, version: 0 }));
  memory.set("umcine-bookmark-store", JSON.stringify({ state: { bookmarkedMovieIds: [123, -1, "456", 456, 1.5] }, version: 0 }));
  await useAuthStore.persist.rehydrate();
  await useBookmarkStore.persist.rehydrate();
  assert.equal(useAuthStore.getState().accessToken, "saved-token");
  assert.equal(useAuthStore.persist.hasHydrated(), true);
  assert.deepEqual(useBookmarkStore.getState().bookmarkedMovieIds, [123, 456]);
  useAuthStore.getState().setAccessToken("new-token");
  assert.equal(JSON.parse(memory.get("umcine-auth-store")).state.accessToken, "new-token");
  useBookmarkStore.getState().toggleBookmark(123);
  assert.deepEqual(JSON.parse(memory.get("umcine-bookmark-store")).state.bookmarkedMovieIds, [456]);
});

test("malformed saved JSON still finishes hydration with initial auth", async () => {
  useAuthStore.getState().setAccessToken(null);
  memory.set("umcine-auth-store", "not JSON");
  await useAuthStore.persist.rehydrate();
  assert.equal(useAuthStore.getState().accessToken, null);
  assert.equal(useAuthStore.persist.hasHydrated(), true);
});

test("legacy bookmark data is restored only during browser hydration", async () => {
  memory.delete("umcine-bookmark-store");
  memory.set("umcine-bookmarks", JSON.stringify([99, "100", -1, 101]));
  await useBookmarkStore.persist.rehydrate();
  assert.deepEqual(useBookmarkStore.getState().bookmarkedMovieIds, [99, 101]);
  saveBookmarkIds([102]);
  assert.deepEqual(readBookmarkIds(), [102]);
});

test("blocked browser storage does not crash rendering or state changes", () => {
  globalThis.window = Object.defineProperty({}, "localStorage", {
    get() { throw new Error("Storage disabled"); },
  });
  assert.equal(clientStorage.getItem("anything"), null);
  assert.doesNotThrow(() => clientStorage.setItem("anything", "{}"));
  assert.doesNotThrow(() => clientStorage.removeItem("anything"));
  assert.doesNotThrow(() => useAuthStore.getState().setAccessToken(null));
});

test("QueryClient isolates server requests and reuses browser navigation cache", () => {
  delete globalThis.window;
  const first = getQueryClient();
  const second = getQueryClient();
  first.setQueryData(["members", "me"], { nickname: "first request" });
  assert.notEqual(first, second);
  assert.equal(second.getQueryData(["members", "me"]), undefined);
  browser();
  const browserClient = getQueryClient();
  browserClient.setQueryData(["movies", "detail", 123], { title: "cached movie" });
  assert.equal(getQueryClient(), browserClient);
  assert.equal(getQueryClient().getQueryData(["movies", "detail", 123]).title, "cached movie");
  assert.equal(browserClient.getDefaultOptions().queries.staleTime, 60_000);
  first.clear();
  second.clear();
  browserClient.clear();
  delete globalThis.window;
});
