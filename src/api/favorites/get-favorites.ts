import { authApi } from "../auth-api";
import { readResult, type ApiResponse } from "../response";
import type { Favorite } from "./models";

export async function getFavorites() {
  return readResult(await authApi.get("favorites").json<ApiResponse<Favorite[]>>());
}
