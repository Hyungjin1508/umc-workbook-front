# 백엔드 Codex에 전달할 프롬프트

아래 내용을 IntelliJ의 Codex에 전달하세요. `remaining-api-contract.md`도 함께 첨부하거나 내용을 붙여 넣으세요.

---

React 프론트의 마지막 API 연동 로직을 먼저 구현했습니다. 함께 전달한
`docs/remaining-api-contract.md`는 프론트 코드와 맞춘 요청·응답 계약입니다.
이 계약을 읽고 현재 Spring Boot 코드를 검토한 후 필요한 백엔드 구현을 진행해 주세요.
프론트 코드는 수정하지 마세요. 기존 로그인·회원가입·내 정보·평점 API의 동작을 보존하고,
명세와 다른 부분은 필요한 범위에서 보완하세요.

대상 API:
- GET /favorites
- GET /favorites/{movieId}
- POST /favorites
- DELETE /favorites/{movieId}
- GET /members/{memberId}/ratings
- POST /ratings
- PATCH /ratings/{ratingId}
- DELETE /ratings/{ratingId}

중요한 계약:
1. 기존 JWT의 문자열 sub에 회원 ID가 있습니다. 프론트가 이를 읽어 평점 조회 경로를 구성하므로
   로그인/내 정보 응답에 memberId를 추가할 필요는 없습니다.
2. 서버는 기존 JWT 검증·AuthInterceptor를 재사용하고 인증된 회원을 기준으로 변경합니다.
   프론트가 보낸 ID나 토큰 디코딩 결과를 검증 없이 신뢰하지 마세요.
3. GET /members/{memberId}/ratings는 기존처럼 공개 API이고 **Rating[] 원시 배열**입니다.
   나머지 대상 API는 ApiResponse<T> 공통 JSON 응답입니다.
4. 즐겨찾기 목록 result는 [{movieId}], 단건/추가 result는 {movieId,isFavorite}입니다.
   전체 목록을 movieId 오름차순으로 반환합니다. 페이지네이션은 프론트에서 합니다.
5. 즐겨찾기 추가는 같은 회원·영화에 대해 중복 생성하지 않고, 미등록 상태의 조회는 false,
   이미 없는 즐겨찾기 삭제도 성공으로 처리합니다.
6. 평점 생성/수정 result는 ratingId, movieId, score, comment, createdAt, updatedAt을 모두 포함하는 객체입니다.
   평점은 회원·영화별 하나이며 중복 생성은 409입니다. 1~5 정수와 최대 500자 후기를 검증하세요.
7. DELETE 성공은 200과 result:null인 JSON을 반환합니다. 프론트가 JSON을 읽으므로 204로 보내지 마세요.
8. 인증 실패401, 권한없음403, 없는 평점404, 잘못된 입력400 등 실제 HTTP 상태를 사용하세요.
9. CORS는 localhost:5173과 Authorization/Content-Type, GET/POST/PATCH/DELETE/OPTIONS를 허용하세요.
   OPTIONS는 인증 검사에서 제외하세요.
10. 기존 스키마 관리 방식에 맞춰 즐겨찾기 저장과 회원·영화별 고유 제약을 구현하세요.
    평점 중복 제약도 확인하세요. 기존 데이터를 삭제하는 방식으로 해결하지 마세요.

즐겨찾기 로직이 없다면 기존 프로젝트 구조에 맞는 Entity/Repository/Service/Controller/DTO를 구현하세요.
TMDB 영화 ID만 저장하면 됩니다. 서버에 TMDB 키나 포스터 저장 로직을 추가하지 마세요.
단, 문서보다 우선하는 기존 공식 워크북 계약이 있다면 차이를 먼저 설명하고 임의로 덮어쓰지 마세요.

검증할 것:
- 두 회원의 즐겨찾기가 분리되는지
- 즐겨찾기 추가/조회/해제와 중복 처리
- 평점 생성/조회/수정/삭제와 중복 처리
- 타인 평점 변경 차단, 미인증/만료 토큰 처리
- 입력값 경계와 요청/응답 JSON·HTTP 상태가 문서와 일치하는지

완료 후 수정 파일, DB 반영·실행 방법, 테스트 결과, 실제 요청/응답 예시,
프론트에 알려야 할 차이점을 정리해 주세요. 실제 비밀번호·JWT·비밀 설정은 출력하지 마세요.
