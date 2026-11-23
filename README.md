# UMCine — Next.js

기존 Vite + TanStack Router 영화 앱을 Next.js 16.4 App Router로 옮긴 프로젝트예요. 영화 목록·검색·상세, 회원가입·로그인, 내 정보 조회·수정, 즐겨찾기와 평점 API 흐름을 유지해요.

## 실행

```powershell
cd C:\UMC\Front\umcine
pnpm install
pnpm dev
```

주소는 **http://localhost:5173**이에요. 기존 Vite 앱과 같은 포트를 사용하므로 같은 브라우저의 localStorage와 백엔드의 기존 개발용 CORS 주소를 계속 사용할 수 있어요. 실행 중인 이전 Vite 프로세스가 있으면 해당 터미널에서 Ctrl+C로 종료한 뒤 실행해요.

`.env.example`을 참고해 프로젝트 루트의 `.env.local`에 아래 값을 설정해요. 기존 `.env.local`의 값은 유지하면서 `VITE_` 이름을 `NEXT_PUBLIC_`로 변경했어요.

```dotenv
NEXT_PUBLIC_TMDB_API_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_ACCESS_TOKEN=발급받은_API_READ_ACCESS_TOKEN
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/
```

클라이언트 요청을 유지하므로 위 환경 변수는 브라우저 코드에 포함돼요. `.env.local`은 Git에서 제외해요. 회원·즐겨찾기·평점 요청을 확인할 때는 기존 백엔드 서버도 실행해야 해요.

## 페이지 구조

| URL | Next.js 경로 파일 | 화면 컴포넌트 |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | `src/screens/movies/movie-list-page.tsx` |
| `/search?query=검색어` | `src/app/search/page.tsx` | `src/screens/movies/search-page.tsx` |
| `/movies/550` | `src/app/movies/[movieId]/page.tsx` | `src/screens/movies/movie-detail-page.tsx` |
| `/login` | `src/app/login/page.tsx` | `src/screens/auth/login-page.tsx` |
| `/signup` | `src/app/signup/page.tsx` | `src/screens/auth/signup-page.tsx` |
| `/my-page` | `src/app/(protected)/my-page/page.tsx` | `src/screens/profile/my-page.tsx` |
| `/my-page/edit` | `src/app/(protected)/my-page/edit/page.tsx` | `src/screens/profile/edit-profile-page.tsx` |

Next.js는 `src/pages`를 Pages Router 경로로도 해석하므로 기존 화면 파일 7개를 `src/screens`로 옮겼어요. `(protected)`는 URL에 나타나지 않는 Route Group이에요.

## 바뀐 라이브러리 설정과 코드

| 파일 | 변경 내용과 이유 |
| --- | --- |
| `package.json`, `pnpm-lock.yaml` | Vite·TanStack Router와 전용 플러그인을 제거하고 Next.js 16.4.6을 설치했어요. React, TanStack Query, Zustand, ky는 유지해요. `dev`, `build`, `start`는 Next.js 명령이에요. |
| `next.config.ts` | 예제 앱의 Cache Components·Partial Prefetching 설정을 사용해요. Tailwind의 Vite 플러그인은 `@tailwindcss/turbopack` CSS 로더로 교체했어요. 프로젝트 루트를 명시해 상위 폴더의 잠금 파일과 혼동하지 않게 했어요. |
| `tsconfig.json` | Vite 타입과 프로젝트 참조를 제거하고 Next 플러그인·생성 타입 경로를 추가했어요. `@/* → src/*` 별칭은 유지해요. |
| `eslint.config.js` | Vite Fast Refresh 규칙을 Next.js의 Core Web Vitals·TypeScript 규칙으로 교체했어요. ESLint는 예제 앱과 같은 9.39.5 계열로 맞췄어요. 기존 이미지·아이콘의 `img` 표현을 유지하도록 이미지 교체 권고 규칙만 껐어요. |
| `src/config/env.ts`, `.env.local`, `.env.example` | `import.meta.env.VITE_*`를 `process.env.NEXT_PUBLIC_*`로 변경했어요. `process.env`는 각 변수명을 명시해 Next.js가 브라우저 빌드에 반영하게 했어요. |
| `src/app/layout.tsx` | `index.html`, `main.tsx`, TanStack 루트 경로가 하던 역할을 공통 레이아웃·메타데이터로 옮겼어요. |
| `src/app/providers.tsx`, `src/utils/query-client.ts` | Query Provider를 Client Component로 분리했어요. 서버에서는 요청별 캐시를 만들고 브라우저에서는 페이지 이동 중 같은 캐시를 재사용해요. 기존 기본 staleTime 60초·상세 30초도 유지해요. |
| `src/screens/**`, `src/components/**`, `src/hooks/use-login-mutation.ts` | `Link to`는 `next/link`의 `href`, `useNavigate`는 `useRouter`, `useSearch`는 `useSearchParams`, `useParams`는 `next/navigation`으로 교체했어요. 메뉴 활성 표시는 `usePathname`으로 처리해요. |
| `src/app/search/page.tsx`, `src/app/movies/[movieId]/page.tsx`, `src/app/layout.tsx` | URL을 읽는 Client Component를 Suspense로 감쌌어요. Cache Components의 사전 렌더링 중 URL 값이 아직 없을 때 사용할 경계예요. |
| `src/utils/client-storage.ts`, `src/stores/auth-store.ts`, `src/stores/bookmark-store.ts` | 서버에서 localStorage를 읽지 않도록 접근을 보호했어요. persist의 `skipHydration`을 사용하고 Provider의 effect에서 저장값을 복원해 첫 렌더 불일치를 방지해요. |
| `src/hooks/use-auth-hydration.ts`, `src/components/auth/auth-guard.tsx` | 토큰 복원이 끝난 뒤 비로그인 사용자는 `/login`, 로그인 사용자의 `/login` 접근은 `/`로 이동해요. 토큰이 localStorage에 있으므로 이 접근 제어는 브라우저에서 수행하며 실제 인증은 기존 백엔드가 담당해요. |
| `scripts/remaining-api.test.mjs` | Node ESM에서 `next/link`를 찾지 못한 실제 테스트 오류를 수정했어요. 테스트 로더가 `next/link.js`를 해석하도록 하고 브라우저 저장소를 테스트할 때만 window 모형을 제공해요. 앱의 표준 `next/link` import는 유지해요. |

상호작용이 있는 화면·훅에는 `use client` 경계를 두고, App Router의 페이지·레이아웃·메타데이터는 Server Component로 작성했어요. `alert`, `FileReader`, 브라우저 저장소 복원은 이벤트 핸들러나 effect에서 실행해요.

기존 `src/routes`, `src/routeTree.gen.ts`, `src/main.tsx`, `vite.config.ts`, `index.html`, `tsconfig.app.json`, `tsconfig.node.json`은 Next.js에서 사용하지 않아 제거했어요. 기존 Tailwind UI와 백엔드 API 계약은 유지해요.

## 검증

```powershell
pnpm lint
pnpm test
pnpm build
```

- 기존 즐겨찾기·평점·JWT·캐시 테스트 9개와 Next.js 저장소 복원·서버 안전성·캐시 분리 테스트 6개가 통과했어요. API 테스트는 모의 응답을 사용해 실제 회원 데이터를 변경하지 않아요.
- 전체 Next.js 빌드와 TypeScript 검사, ESLint 검사가 통과했어요.
- 빌드 서버에서 모든 기존 URL의 직접 요청·반복 요청, 404, Tailwind CSS와 공개 아이콘 응답을 확인했어요.
- 변경한 환경 변수로 실제 TMDB 목록·검색·상세 요청의 응답 200을 확인했어요.
- 실제 계정의 로그인·즐겨찾기·평점·프로필 수정 흐름과 브라우저 Console은 백엔드를 켜고 브라우저에서 확인해야 해요. 작업 시점에는 회원 서버가 연결되지 않았고 브라우저 자동 조작 도구도 연결되지 않았어요.

직접 확인할 때는 검색 후 상세 이동, 새로고침, 로그인 후 홈 이동, 토큰 유지, `/login` 재접속 시 홈 이동, 비로그인 `/my-page` 접근 시 로그인 이동, 내 정보 수정과 즐겨찾기·평점 변경 순서로 확인해요.

## 롤백

작업 직전 파일 99개는 `C:\UMC\.rollback\umcine-nextjs-2026-11-23T07-15-29-381Z`에 보관했어요. manifest와 변경 목록으로 이번 작업 이전의 미커밋 수정까지 복구할 수 있어요. 커밋·푸시는 수행하지 않았어요.

참고: [Next.js Vite 마이그레이션](https://nextjs.org/docs/app/guides/migrating/from-vite), [TanStack Query의 Next.js 구성](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
