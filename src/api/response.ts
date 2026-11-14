export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export function readResult<T>(response: ApiResponse<T>): T {
  if (!response.isSuccess) throw new Error(response.message || "요청에 실패했어요.");
  return response.result;
}
