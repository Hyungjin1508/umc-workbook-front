const BOOKMARK_STORAGE_KEY = "umcine-bookmarks";  // 고정된 key

export function readBookmarkIds(): number[] {   // 넘버배열 형태 함수
  const storedValue = localStorage.getItem(BOOKMARK_STORAGE_KEY);  // 로컬스트리지에서 BOOKMARK_STORAGE_KEY key가 달린 상자를 get해봐라
  if (!storedValue) return [];  // 근데 그 key가 붙여진 상자가 없다면? 빈 배열 반환

  try {  // 시도해라
    const parsedValue: unknown = JSON.parse(storedValue); // parsedValue라는 unknown타입(무슨 타입인지는 모름) 변수에 storedValue key가 담긴 상자를 자바스크립 값으로 변환
    if (!Array.isArray(parsedValue)) return [];  // 이거 진짜 배열 맞아? 를 검사해주는 타입 검사

    return parsedValue.filter(  // 우리가 원하는 정수형태 숫자인지 필터링해라
      (movieId): movieId is number =>  // parsedValue안에 있는 요소들을 movieId 라고 부를건데 이것들이 이 필터를 통과하면 확실한 Number타입이라고 못박을게 
        typeof movieId === "number" && // 타입이 진짜 숫자 맞아?
        Number.isInteger(movieId) && // 부동소수점 형태 아니고 정수야?
        movieId > 0, // 양수인 숫자야?
    );
  } catch {  // 예외발생시 빈 배열 리턴
    return [];
  }
}

export function saveBookmarkIds(movieIds: number[]) {
  localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(movieIds));
}  // stringify를 쓴거 보니까 자바스크립 값을 문자열로 변환해서 set하는거네