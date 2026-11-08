import { Link } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // 화면 퍼블리싱 단계: 실제 로그인 API/인증 상태는 아직 연결하지 않습니다.
    setMessage("로그인 기능은 준비 중이에요.");
  }

  return (
    <main className="flex min-h-[calc(1024px-91px)] min-w-[1024px] items-center justify-center bg-[#f6f7f9] px-[80px] py-[48px] text-[#17191e]">
      <section className="w-[430px]" aria-labelledby="login-heading">
        <h1 id="login-heading" className="mb-[20px] text-[32px] font-extrabold leading-[38px] tracking-[-1px]">로그인</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-[16px]">
            <label htmlFor="login-email" className="mb-[8px] block text-[12px] font-bold leading-[16px]">이메일</label>
            <div className="flex h-[48px] items-center gap-[8px] rounded-[8px] border border-[#e3e6eb] bg-white px-[14px] focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]">
              <img src="/icons/movie-icons/mail.svg" alt="" />
              <input id="login-email" type="email" autoComplete="email" required placeholder="name@example.com" value={email} onChange={(event) => { setEmail(event.target.value); setMessage(""); }} className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#969da8]" />
            </div>
          </div>
          <div>
            <label htmlFor="login-password" className="mb-[8px] block text-[12px] font-bold leading-[16px]">비밀번호</label>
            <div className="flex h-[48px] items-center gap-[8px] rounded-[8px] border border-[#e3e6eb] bg-white px-[14px] focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]">
              <img src="/icons/movie-icons/lock.svg" alt="" />
              <input id="login-password" type="password" autoComplete="current-password" required placeholder="비밀번호" value={password} onChange={(event) => { setPassword(event.target.value); setMessage(""); }} className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#969da8]" />
            </div>
          </div>
          <button type="submit" className="mt-[18px] flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#2563eb] text-[14px] font-bold text-white hover:bg-[#1d4ed8]">로그인</button>
          {message && <p className="mt-[10px] text-[12px] text-[#606774]" role="status">{message}</p>}
        </form>
        <p className="mt-[22px] text-center text-[12px] leading-[18px] text-[#606774]">처음이신가요? <Link to="/signup" className="font-bold text-[#2563eb] hover:underline">회원가입</Link></p>
      </section>
    </main>
  );
}
