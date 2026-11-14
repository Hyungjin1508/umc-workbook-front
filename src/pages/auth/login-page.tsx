import { Link } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { useLoginMutation } from "@/hooks/use-login-mutation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {

  const [form, setForm] = useState({ email: "", password: "" });
  const loginMutation = useLoginMutation();
  const canSubmit = EMAIL_REGEX.test(form.email.trim()) && form.password.length > 0;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loginMutation.isPending) return;

    loginMutation.mutate({
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <main className="flex min-h-[calc(1024px-91px)] min-w-[1024px] items-center justify-center bg-[#f6f7f9] px-[80px] py-[48px] text-[#17191e]">
      <section className="w-[430px]" aria-labelledby="login-heading">
        <h1 id="login-heading" className="mb-[20px] text-[32px] font-extrabold leading-[38px] tracking-[-1px]">로그인</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-[16px]">
            <label htmlFor="login-email" className="mb-[8px] block text-[12px] font-bold leading-[16px]">이메일</label>
            <div className="flex h-[48px] items-center gap-[8px] rounded-[8px] border border-[#e3e6eb] bg-white px-[14px] focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]">
              <img src="/icons/movie-icons/mail.svg" alt="" />
              <input id="login-email" type="email" autoComplete="email" required placeholder="name@example.com" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#969da8]" />
            </div>
          </div>
          <div>
            <label htmlFor="login-password" className="mb-[8px] block text-[12px] font-bold leading-[16px]">비밀번호</label>
            <div className="flex h-[48px] items-center gap-[8px] rounded-[8px] border border-[#e3e6eb] bg-white px-[14px] focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]">
              <img src="/icons/movie-icons/lock.svg" alt="" />
              <input id="login-password" type="password" autoComplete="current-password" required placeholder="비밀번호" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#969da8]" />
            </div>
          </div>
          <button type="submit" disabled={!canSubmit || loginMutation.isPending} className="mt-[18px] flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#2563eb] text-[14px] font-bold text-white enabled:hover:bg-[#1d4ed8] disabled:cursor-not-allowed">{loginMutation.isPending ? "로그인 중" : "로그인"}</button>
        </form>
        <p className="mt-[22px] text-center text-[12px] leading-[18px] text-[#606774]">처음이신가요? <Link to="/signup" className="font-bold text-[#2563eb] hover:underline">회원가입</Link></p>
      </section>
    </main>
  );
}
