# 즐겨찾기·평점 API 계약

이 문서는 프론트에서 먼저 정의한 연동 계약입니다. 실제 서버 구현·통신 성공을 뜻하지 않습니다.
즐겨찾기는 신규 제안이며, 평점은 확인한 기존 서버의 경로·DTO·응답 구조를 유지했습니다.

## 공통 규칙

- 개발 서버: 프론트 `http://localhost:5173`, 백엔드 `http://localhost:8080`.
- 프론트의 `VITE_API_BASE_URL`로 백엔드 주소를 설정합니다.
- JSON 요청은 `Content-Type: application/json`입니다.
- 인증 요청은 `Authorization: Bearer <accessToken>` 헤더를 보냅니다.
- 아래 공개 평점 조회를 제외한 모든 요청은 인증이 필요합니다.
- 회원 ID는 서버가 검증한 JWT에서 결정합니다. POST/PATCH body에 memberId를 받지 않습니다.
- 프론트는 JWT의 문자열 `sub`를 양의 안전한 정수로 읽어 평점 조회 경로와 회원별 캐시 키에 사용합니다. 서명·만료·권한 검증은 서버의 책임입니다.
- movieId는 TMDB 영화 ID인 양의 정수입니다. ratingId와 memberId도 양의 정수입니다. JS 안전 정수 범위 이내의 ID를 사용합니다.
- 오류는 올바른 HTTP 오류 상태와 함께 반환합니다. 오류를 HTTP 200 성공으로 감싸지 않습니다.
- 프론트가 수정할 수 있는 것은 본인의 즐겨찾기·평점입니다. 서버에서 소유권을 검증합니다.
- 모든 날짜는 ISO 8601 문자열입니다. 기존 평점 DTO의 시간대 없는 LocalDateTime도 허용합니다.

### 공통 응답 형식

공개 평점 조회를 제외한 성공 응답은 다음 형식입니다.

```json
{
  "isSuccess": true,
  "code": "COMMON200",
  "message": "요청에 성공했습니다.",
  "result": null
}
```

`result`는 아래 API별 타입으로 대체됩니다. 신규 생성은 `COMMON201`을 사용할 수 있습니다.
실패 응답은 `isSuccess: false`, 문자열 code/message, `result: null`로 통일합니다.
프론트는 새 API에서 HTTP 오류와 isSuccess=false를 모두 실패로 처리합니다.

| 상태 | 의미 |
| --- | --- |
| 400 | ID, 점수, 후기 등 입력값 오류 |
| 401 | 인증 토큰 누락·만료·위조 |
| 403 | 다른 회원의 평점 변경 시도 |
| 404 | 존재하지 않는 회원·평점 |
| 409 | 같은 회원·영화의 평점 중복 등록 |
| 500 | 서버 내부 오류 |

즐겨찾기 미등록은 정상 상태이며 404로 처리하지 않습니다.
DELETE는 아래 계약상 **200 + JSON**입니다. 프론트가 JSON을 읽으므로 204로 응답하지 않습니다.
CORS는 localhost:5173의 GET/POST/PATCH/DELETE/OPTIONS와 Authorization/Content-Type을 허용하고 OPTIONS를 인증에서 제외해야 합니다.

## 1. GET /favorites

- 인증: 필요. 로그인한 회원의 전체 즐겨찾기를 반환합니다.
- body/query: 없음. 서버 페이지네이션 없이 전체 배열을 반환하며 화면에서 10개씩 표시합니다.
- 상태: 200.
- result: `Array<{ movieId: number }>`.
- 중복 없이 movieId 오름차순으로 반환합니다. 비어 있으면 `[]`입니다.

```json
{
  "isSuccess": true,
  "code": "COMMON200",
  "message": "즐겨찾기를 조회했습니다.",
  "result": [{ "movieId": 123 }, { "movieId": 456 }]
}
```

제목·포스터는 프론트가 TMDB API로 가져옵니다. 서버에 영화 이미지·제목을 저장할 필요는 없습니다.

## 2. GET /favorites/{movieId}

- 인증: 필요. 해당 회원이 해당 영화를 즐겨찾기했는지 반환합니다.
- 상태: 200. 미등록도 200입니다.
- result: `{ movieId: number, isFavorite: boolean }`.

```json
{
  "isSuccess": true,
  "code": "COMMON200",
  "message": "즐겨찾기 상태를 조회했습니다.",
  "result": { "movieId": 123, "isFavorite": false }
}
```

## 3. POST /favorites

- 인증: 필요.
- body: `{ "movieId": 123 }`.
- 신규 등록: 201. 이미 등록됨: 200이며 중복 행을 만들지 않습니다.
- result: `{ "movieId": 123, "isFavorite": true }`.
- DB에도 `(memberId, movieId)` 고유 제약을 적용합니다.

## 4. DELETE /favorites/{movieId}

- 인증: 필요. 본인의 해당 영화 즐겨찾기만 삭제합니다.
- body: 없음.
- 상태: 200. 이미 없어도 200으로 처리합니다.
- result: `null`인 공통 JSON 응답입니다.

## 5. GET /members/{memberId}/ratings

- 기존 서버와 동일하게 **공개 API**입니다. 토큰 없이 호출합니다.
- body/query: 없음. 해당 회원의 전체 평점 목록을 반환합니다.
- 상태: 200. 존재하는 회원에게 평점이 없으면 `[]`입니다. 회원 자체가 없으면 404입니다.
- **공통 응답으로 감싸지 않은 Rating[] 배열**입니다. 다른 API와 구별해야 합니다.

```json
[
  {
    "ratingId": 10,
    "movieId": 123,
    "score": 4,
    "comment": "재미있었어요.",
    "createdAt": "2026-11-13T10:00:00",
    "updatedAt": "2026-11-13T10:00:00"
  }
]
```

Rating: ratingId/movieId는 number, score는 1~5의 정수, comment는 string 또는 null,
createdAt/updatedAt은 string입니다. updatedAt은 생성 직후에도 생성 일시 등 문자열로 채웁니다.
프론트는 이 배열에서 현재 movieId에 맞는 **본인의 평점 하나**를 찾아 표시합니다.
다른 회원의 전체 영화 후기를 보여주는 기능은 이 API 범위에 포함하지 않습니다.

## 6. POST /ratings

- 인증: 필요. JWT 회원의 평점을 등록합니다.
- 요청:

```json
{ "movieId": 123, "score": 4, "comment": "재미있었어요." }
```

- score: 필수 정수 1~5.
- comment: 선택 후기. 프론트는 앞뒤 공백을 제거한 문자열을 보내며 미입력 시 `""`입니다. 최대 500자입니다.
- 같은 회원·영화 조합은 하나만 허용하고, 중복이면 409입니다. DB 고유 제약도 필요합니다.
- 상태: 201.
- result: 위 GET 예시와 동일한 **완전한 Rating 객체**입니다. ID만 반환하지 않습니다.

## 7. PATCH /ratings/{ratingId}

- 인증: 필요. 본인의 평점만 수정합니다.
- body: `{ "score": 5, "comment": "다시 보니 더 좋았어요." }`.
- movieId/memberId는 변경하지 않습니다. score/comment 검증은 등록과 동일합니다.
- 상태: 200. result: 수정된 완전한 Rating 객체이며 updatedAt을 반영합니다.
- 없는 평점은 404, 다른 회원의 평점은 403입니다.

## 8. DELETE /ratings/{ratingId}

- 인증: 필요. 본인의 평점만 삭제합니다.
- body: 없음.
- 상태: 200. result: null인 공통 JSON 응답입니다.
- 없는 평점은 404, 다른 회원의 평점은 403입니다.

## 프론트 데이터 흐름

| 데이터 | Query key | 사용 화면 |
| --- | --- | --- |
| 즐겨찾기 전체 | `["favorites", "list", memberId]` | 목록/검색 카드와 마이페이지 |
| 단건 즐겨찾기 | `["favorites", "detail", memberId, movieId]` | 영화 상세 버튼 |
| 회원 평점 전체 | `["ratings", "member", memberId]` | 상세의 내 평점·후기 |

- 동일 키 요청은 TanStack Query가 공유합니다. 카드마다 목록 요청을 따로 만들지 않습니다.
- 즐겨찾기 변경 성공: 단건 캐시를 응답으로 갱신하고 전체 목록을 invalidate합니다. 활성 목록이 있으면 GET /favorites가 발생할 수 있으며 정상입니다.
- 평점 변경 성공: 응답으로 목록 캐시에 추가/교체/삭제합니다. 기존 목록이 있으면 추가 GET 없이 화면에 반영합니다.
- 변경 전 진행 중인 관련 조회를 취소해 오래된 결과가 캐시를 덮지 않게 합니다.
- 회원마다 다른 캐시 키를 사용합니다. 요청 중 중복 제출을 막고 실패 시 입력값/기존 상태를 유지합니다.
- 기존 localStorage 북마크는 자동 업로드하지 않으며 새 화면의 데이터 원본으로 사용하지 않습니다. 이전 학습용 store 파일은 남겨 두었습니다.
- 로그인 전에는 즐겨찾기·내 평점 조회를 보내지 않고 로그인 안내를 표시합니다.
- 인증 요청 401은 기존 authApi에서 토큰을 지웁니다. 디코딩 결과만으로 서버 권한을 부여하면 안 됩니다.
- 프로필 이미지 업로드, 회원 탈퇴, 다른 회원 후기 목록은 이번 계약에 포함하지 않습니다.

## 서버 연결 후 수동 검증

1. 서버 실행·로그인 후 마이페이지 GET /favorites가 성공하고 빈 목록을 구분하는지 확인합니다.
2. 상세 GET /favorites/{movieId} → POST /favorites → 버튼 표시 변경 → 마이페이지 카드 표시를 확인합니다.
3. 목록/검색에서도 같은 즐겨찾기 표시인지 확인하고 DELETE로 해제합니다. 새로고침 후에도 서버 상태와 같아야 합니다.
4. 상세에서 GET /members/{sub}/ratings를 확인하고 1~5점·최대 500자 후기를 등록합니다.
5. POST/PATCH 성공 응답의 Rating이 표시되고, 기존 평점 목록 캐시가 있으면 추가 GET 없이 갱신되는지 확인합니다.
6. DELETE 성공 후 작성 폼으로 돌아오는지 확인하고 새로고침으로 삭제 상태를 재확인합니다.
7. 실패 시 입력이 유지되고 재시도 가능한지, 401 처리와 다른 계정의 데이터 분리를 확인합니다.
8. 서버 테스트에서 타인 평점 변경, 중복 평점, 중복 즐겨찾기, 음수 ID, 점수 0/6, 501자 후기를 검증합니다.

프론트의 모의 응답 테스트는 Node 24에서 `node --test --test-isolation=none scripts/remaining-api.test.mjs`로 실행합니다.
이 테스트는 실제 API 함수·JWT 해석·캐시 갱신을 가짜 HTTP 응답으로 확인하며 실제 서버/브라우저 검증을 대신하지 않습니다.
