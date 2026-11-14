import { authApi } from "../auth-api";
import { readResult, type ApiResponse } from "../response";
import type { FavoriteStatus } from "./models";

export async function addFavorite(movieId: number) {
  return readResult(await authApi.post("favorites", { json: { movieId } }).json<ApiResponse<FavoriteStatus>>());
}
