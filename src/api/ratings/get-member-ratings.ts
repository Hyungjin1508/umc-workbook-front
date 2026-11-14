import { apiClient } from "../api-client";
import type { Rating } from "./models";

// 기존 서버의 공개 조회 API는 ApiResponse 없이 배열을 반환합니다.
export function getMemberRatings(memberId: number) {
  return apiClient.get(`members/${memberId}/ratings`).json<Rating[]>();
}
