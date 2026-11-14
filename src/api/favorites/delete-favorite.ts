import { authApi } from "../auth-api";
import { readResult, type ApiResponse } from "../response";

export async function deleteFavorite(movieId: number) {
  readResult(await authApi.delete(`favorites/${movieId}`).json<ApiResponse<null>>());
}
