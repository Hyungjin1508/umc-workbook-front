import { authApi } from "../auth-api";
import { readResult, type ApiResponse } from "../response";
import type { Rating, RatingFields } from "./models";

export async function updateRating(ratingId: number, body: RatingFields) {
  return readResult(await authApi.patch(`ratings/${ratingId}`, { json: body }).json<ApiResponse<Rating>>());
}
