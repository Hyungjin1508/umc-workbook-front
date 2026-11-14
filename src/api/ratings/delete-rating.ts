import { authApi } from "../auth-api";
import { readResult, type ApiResponse } from "../response";

export async function deleteRating(ratingId: number) {
  readResult(await authApi.delete(`ratings/${ratingId}`).json<ApiResponse<null>>());
}
