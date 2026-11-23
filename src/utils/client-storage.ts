import type { StateStorage } from "zustand/middleware";

// 서버 렌더링에서는 브라우저 저장소에 접근하지 않아요.
export const clientStorage = {
  getItem(name) {
    if (typeof window === "undefined") return null;
    try {
      const value = window.localStorage.getItem(name);
      if (value !== null) JSON.parse(value);
      return value;
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // 저장소가 차단돼도 현재 화면의 상태는 사용할 수 있어요.
    }
  },
  removeItem(name) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // 저장소가 차단된 경우에는 저장된 값이 없다고 처리해요.
    }
  },
} satisfies StateStorage;
