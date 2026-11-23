// 화면의 조회 경로를 정하기 위한 디코딩입니다. 토큰 검증은 서버가 담당합니다.
export function getMemberId(accessToken: string | null): number | null {
  if (!accessToken) return null;
  try {
    const parts = accessToken.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")), (char) => char.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!payload || typeof payload !== "object" || !("sub" in payload)) return null;
    if (typeof payload.sub !== "string" || !/^[1-9]\d*$/.test(payload.sub)) return null;
    const memberId = Number(payload.sub);
    return Number.isSafeInteger(memberId) ? memberId : null;
  } catch {
    return null;
  }
}
