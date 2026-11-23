import { authApi } from "../auth-api";
import { readResult, type ApiResponse } from "../response";
import type { CreateRatingRequest, Rating } from "./models";

export async function createRating(body: CreateRatingRequest) {
  return readResult(await authApi.post("ratings", { json: body }).json<ApiResponse<Rating>>());
}
