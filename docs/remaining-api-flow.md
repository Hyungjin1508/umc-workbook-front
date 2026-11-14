# 프론트 구현 흐름과 핵심 코드

## 파일별 역할

| 위치 | 역할 |
| --- | --- |
| src/api/favorites | 즐겨찾기 요청 4개와 응답 타입 |
| src/api/ratings | 평점 요청 4개와 요청·응답 타입 |
| src/api/response.ts | 공통 응답 타입과 업무 실패 처리 |
| src/utils/auth/get-member-id.ts | JWT sub를 읽어 회원 ID 반환 |
| src/hooks/use-member-id.ts | Zustand 토큰 변경을 구독해서 회원 ID 제공 |
| src/utils/query-keys.ts | 회원별 즐겨찾기·평점 캐시 키 정의 |
| src/hooks/use-favorites-query.ts | 즐겨찾기 전체 조회와 공유 캐시 |
| src/hooks/use-favorite.ts | 단건 즐겨찾기 조회·추가·해제와 캐시 갱신 |
| src/hooks/use-rating-mutation.ts | 평점 등록·수정·삭제와 목록 캐시 갱신 |
| src/utils/ratings/update-rating-list.ts | 응답 Rating으로 목록 추가·교체·삭제 |
| src/components/bookmark-button.tsx | 목록·검색·상세의 서버 즐겨찾기 버튼 |
| src/components/movies/movie-rating-section.tsx | 상세의 내 평점 조회와 등록·수정·삭제 폼 |
| src/pages/profile/my-page.tsx | 서버 즐겨찾기 목록과 TMDB 포스터 연결 |
| src/pages/movies/movie-detail-page.tsx | 기존 영화 상세에 평점 영역 연결 |
| scripts/remaining-api.test.mjs | 실제 요청 함수와 캐시 로직을 가짜 HTTP 응답으로 검증 |

## 1. 요청 함수

`src/api/favorites/add-favorite.ts`

```ts
export async function addFavorite(movieId: number) {
  return readResult(await authApi.post("favorites", {
    json: { movieId },
  }).json<ApiResponse<FavoriteStatus>>());
}
```

`authApi`가 토큰을 붙이고, `readResult`는 실패 응답을 예외로 바꾸거나 성공한 result를 꺼냅니다.
마이페이지의 포스터는 즐겨찾기 응답의 movieId로 기존 TMDB 상세 요청을 재사용합니다.

## 2. 즐겨찾기 변경 결과 공유

`src/hooks/use-favorite.ts`

```ts
onSuccess: async (status) => {
  queryClient.setQueryData(favoriteKeys.detail(memberId, movieId), status);
  await queryClient.invalidateQueries({
    queryKey: favoriteKeys.list(memberId), exact: true,
  });
},
```

단건 상태는 받은 응답으로 즉시 교체합니다. 전체 목록은 다시 최신화해서 마이페이지와 목록/검색 카드가 함께 바뀝니다.
영화별 mutation key와 useIsMutating으로 같은 영화의 중복 요청도 막습니다.
기존 localStorage 북마크 파일은 보존하지만 현재 화면에서는 더 이상 사용하지 않습니다.

## 3. 평점 제출

`src/components/movies/movie-rating-section.tsx`

```ts
const fields = { score, comment: comment.trim() };
mutation.mutate(rating
  ? { type: "update", ratingId: rating.ratingId, fields }
  : { type: "create", fields });
```

현재 영화에 대한 내 평점이 있으면 수정, 없으면 등록합니다.
별점은 1~5점의 정수, 후기는 선택 입력이며 최대 500자입니다.
삭제는 확인 창을 거친 후 ratingId로 요청합니다.
진행 중에는 입력·버튼을 비활성화하고, 실패하면 입력값을 유지합니다.

## 4. 평점 캐시 반영

`src/hooks/use-rating-mutation.ts`

```ts
queryClient.setQueryData<Rating[]>(queryKey, (previous) => updateRatingList(
  previous, action.type === "create" ? null : action.ratingId, rating,
));
```

등록은 배열에 추가, 수정은 같은 ratingId 항목 교체, 삭제는 해당 항목 제거입니다.
화면이 같은 Query를 읽으므로 별도 새로고침 없이 결과가 표시됩니다.
기존 목록이 캐시에 있으면 추가 GET은 필요하지 않습니다. 목록이 없으면 invalidate로 조회를 유도합니다.
변경 전에 진행 중인 해당 조회를 취소해 늦은 응답이 수정 결과를 덮어쓰지 않게 합니다.

## 5. JWT와 사용자 분리

토큰 payload의 문자열 sub를 양의 정수로 읽습니다.
토큰은 서명을 검증하는 데 필요한 비밀키 없이 프론트에서 읽을 수 있지만, 읽었다고 진짜 로그인임이 보장되지는 않습니다.
실제 권한은 서버가 검증합니다. 캐시 키에 memberId를 넣어 서로 다른 회원의 즐겨찾기·평점이 섞이지 않게 했습니다.
토큰 누락 또는 잘못된 sub는 조회를 비활성화하고 로그인 안내를 표시합니다.

## 확인 범위

모의 응답 테스트: JWT 해석, 8개 요청의 주소/메서드/body/인증 헤더, 성공·실패, 401 토큰 삭제,
평점 캐시 변경과 새 조회 없는 재사용, 회원별 키 분리를 확인합니다.
평점 UI는 로그인한 회원 ID를 가정한 서버 렌더링으로 로딩·오류·빈 결과·기존 평점 상태를 확인합니다.
실제 서버 DB 저장, CORS, 브라우저 클릭과 Network 인증은 백엔드 구현 후 API 계약 문서의 순서로 확인해야 합니다.

이번 작업은 프론트 파일만 변경했습니다. 백엔드 코드, 의존성, 기존 전역 CSS는 수정하지 않았습니다.
