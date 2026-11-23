import { isHTTPError } from "ky";

export function getApiErrorCode(error: unknown): string | undefined {
  const data = getErrorData(error);
  return typeof data?.code === "string" ? data.code : undefined;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = getErrorData(error);
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }
  return fallback;
}

function getErrorData(error: unknown): Record<string, unknown> | undefined {
  // ky 2는 오류 본문을 미리 읽어서 data에 저장합니다.
  if (!isHTTPError(error)) return undefined;
  const data = error.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return undefined;
}
