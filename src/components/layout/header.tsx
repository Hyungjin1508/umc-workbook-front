import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="flex h-[91px] w-full items-center justify-between bg-white px-[80px] py-[24px]">
      <div className="flex items-center gap-[42px]">
        {/* 1. 로고 클릭 시 메인(/)으로 이동 */}
        <Link className="flex items-center gap-[10px] text-[#17191e] no-underline" to="/" aria-label="UMCine 홈">
          <span className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border-2 border-[#17191e]" aria-hidden="true">
            <img className="h-[24px] w-[24px]" src="/icons/movie-icons/movie.svg" alt="" />
          </span>
          <span className="text-[20px] font-black leading-[24px] tracking-[-0.7px]">UMCine</span>
        </Link>

        <nav className="flex items-center gap-[30px] [&_a]:text-[14px] [&_a]:font-bold [&_a]:leading-[17px] [&_a]:text-[#606774] [&_a]:no-underline [&_a.active]:text-[#17191e] [&_a.active]:underline [&_a.active]:underline-offset-2" aria-label="주요 메뉴">
          {/* 2. 기존 href="#movies" -> to="/" 로 변경 */}
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "active", "aria-current": "page" }}>
            영화
          </Link>
          {/* 3. 기존 href="#search" -> to="/search" 로 변경 */}
          <Link to="/search" activeProps={{ className: "active", "aria-current": "page" }}>검색</Link>
          <Link to="/my-page" activeProps={{ className: "active", "aria-current": "page" }}>내 정보</Link>
        </nav>
      </div>

      <div className="flex items-center gap-[10px]">
        {/* 우측 검색 아이콘 버튼 클릭 시에도 검색 페이지로 이동하게 만드시려면 
            button 대신 Link로 감싸거나 바꿔주실 수 있습니다. */}
        <Link to="/search" className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[8px] border border-[#e3e6eb] bg-white p-0 [&_img]:h-[24px] [&_img]:w-[24px] [&_img]:opacity-[0.62]" aria-label="영화 검색">
          <img src="/icons/movie-icons/search.svg" alt="" />
        </Link>
        <Link to="/login" className="flex h-[42px] w-[71px] cursor-pointer items-center justify-center rounded-[8px] border border-white bg-[#2563eb] text-[14px] font-extrabold leading-[17px] text-white">
          로그인
        </Link>
      </div>
    </header>
  );
}

export default Header;
