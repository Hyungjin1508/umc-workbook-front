import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // 기존 포스터·아이콘의 표시 크기와 로딩 동작을 유지해요.
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([".next/**", "dist/**", ".tanstack/**", "next-env.d.ts"]),
]);
