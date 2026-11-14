import { authApi } from "../auth-api";
import { readResult, type ApiResponse } from "../response";
import type { FavoriteStatus } from "./models";

export async function getFavorite(movieId: number) {
  return readResult(await authApi.get(`favorites/${movieId}`).json<ApiResponse<FavoriteStatus>>());
}
