import { useState } from "react";
import { checkEmailDuplicate } from "@/api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "@/api/members/check-nickname-duplicate";
import { signup } from "@/api/members/signup";
import { Link } from "@tanstack/react-router";

// 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

type DefaultFormKey = keyof typeof DEFAULT_FORM;
type DefaultFormValue = (typeof DEFAULT_FORM)[DefaultFormKey];
type DuplicateCheckKey = "email" | "nickname";

const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const navigate = useNavigate();
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });

  // 입력값의 유효성 검사
  const isEmailValid = EMAIL_REGEX.test(form.email.trim());
  const isNicknameValid =
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  // 입력을 시작한 필드에만 오류 표시
  const showEmailError = form.email.length > 0 && !isEmailValid;
  const showNicknameError = form.nickname.length > 0 && !isNicknameValid;
  const showPasswordError = form.password.length > 0 && !isPasswordValid;
  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 && !isPasswordConfirmValid;

  // 모든 입력값이 유효하면 제출 버튼 활성화
  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  // 입력 조건과 두 중복 확인을 모두 통과해야 제출 가능
  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  const handleChangeField = (key: DefaultFormKey, value: DefaultFormValue) => {
    if (key === "email" || key === "nickname") {
      if (duplicateCheck[key].isChecking) return;
      // 확인한 값을 바꾸면 다시 중복 확인해야 함
      setDuplicateCheck((prev) => ({ ...prev, [key]: DEFAULT_DUPLICATE_CHECK }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === "email" ? isEmailValid : isNicknameValid;
    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = key === "email" ? "이메일" : "닉네임";
    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: { isChecking: true, isAvailable: false },
    }));

    try {
      const response =
        key === "email"
          ? await checkEmailDuplicate(form.email.trim())
          : await checkNicknameDuplicate(form.nickname.trim());
      const isAvailable = response.available;
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable },
      }));
      alert(
        isAvailable
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`,
      );
    } catch {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable: false },
      }));
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isChecking: false },
      }));
    }
  };
  
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await signup({
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
      });
      alert(response.message);
      // 로그인 페이지 연결 후 주석 해제
      // navigate({ to: "/login" });
    } catch {
      alert("회원가입에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // noValidate는 폼 제출 시 브라우저의 기본 유효성 검사를 끔
  return (
    <main className="flex min-h-[calc(1024px-91px)] min-w-[1024px] items-center justify-center bg-[#f6f7f9] px-[80px] py-[48px] text-[#17191e]">
      <section className="w-[430px]" aria-labelledby="signup-heading">
        <h1 id="signup-heading" className="m-0 mb-[20px] text-[32px] font-extrabold leading-[38px] tracking-[-1px]">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-[16px]">
            <div>
              <label htmlFor="signup-email" className="mb-[8px] block text-[12px] font-bold leading-[16px]">이메일</label>
              <div className="flex h-[48px] items-center rounded-[8px] border border-[#e3e6eb] bg-white focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]">
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="h-full min-w-0 flex-1 rounded-[8px] bg-transparent px-[16px] text-[14px] outline-none placeholder:text-[#969da8]"
                  value={form.email}
                  disabled={duplicateCheck.email.isChecking}
                  onChange={(e) => handleChangeField("email", e.target.value)}
                  aria-invalid={showEmailError}
                  aria-describedby={showEmailError ? "signup-email-error" : undefined}
                />
                <button type="button" className="h-full shrink-0 cursor-pointer px-[14px] text-[12px] font-bold text-[#2563eb] disabled:cursor-not-allowed" aria-label="이메일 중복 확인" aria-busy={duplicateCheck.email.isChecking} disabled={!isEmailValid || duplicateCheck.email.isChecking} onClick={() => handleCheckDuplicate("email")}>
                  {duplicateCheck.email.isChecking ? "확인 중" : "중복 확인"}
                </button>
              </div>
              {showEmailError && <p id="signup-email-error" className="mt-[6px] text-[12px] leading-[18px] text-red-600" role="alert">올바른 이메일 형식을 입력해 주세요.</p>}
            </div>

            <div>
              <label htmlFor="signup-nickname" className="mb-[8px] block text-[12px] font-bold leading-[16px]">닉네임</label>
              <div className="flex h-[48px] items-center rounded-[8px] border border-[#e3e6eb] bg-white focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]">
                <input
                  id="signup-nickname"
                  type="text"
                  autoComplete="nickname"
                  placeholder="2–12자"
                  className="h-full min-w-0 flex-1 rounded-[8px] bg-transparent px-[16px] text-[14px] outline-none placeholder:text-[#969da8]"
                  value={form.nickname}
                  disabled={duplicateCheck.nickname.isChecking}
                  onChange={(e) => handleChangeField("nickname", e.target.value)}
                  aria-invalid={showNicknameError}
                  aria-describedby={showNicknameError ? "signup-nickname-error" : undefined}
                />
                <button type="button" className="h-full shrink-0 cursor-pointer px-[14px] text-[12px] font-bold text-[#2563eb] disabled:cursor-not-allowed" aria-label="닉네임 중복 확인" aria-busy={duplicateCheck.nickname.isChecking} disabled={!isNicknameValid || duplicateCheck.nickname.isChecking} onClick={() => handleCheckDuplicate("nickname")}>
                  {duplicateCheck.nickname.isChecking ? "확인 중" : "중복 확인"}
                </button>
              </div>
              {showNicknameError && <p id="signup-nickname-error" className="mt-[6px] text-[12px] leading-[18px] text-red-600" role="alert">닉네임은 2~12자로 입력해 주세요.</p>}
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-[8px] block text-[12px] font-bold leading-[16px]">비밀번호</label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="8자 이상"
                className="h-[48px] w-full rounded-[8px] border border-[#e3e6eb] bg-white px-[16px] text-[14px] outline-none placeholder:text-[#969da8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                value={form.password}
                onChange={(e) => handleChangeField("password", e.target.value)}
                aria-invalid={showPasswordError}
                aria-describedby="signup-password-help"
              />
              <p id="signup-password-help" className={`mt-[6px] text-[11px] leading-[16px] ${showPasswordError ? "text-red-600" : "text-[#969da8]"}`}>
                영문 대·소문자, 숫자, 특수문자를 모두 포함해 8자 이상 입력해 주세요
              </p>
            </div>

            <div>
              <label htmlFor="signup-password-confirm" className="mb-[8px] block text-[12px] font-bold leading-[16px]">비밀번호 확인</label>
              <input
                id="signup-password-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="다시 입력"
                className="h-[48px] w-full rounded-[8px] border border-[#e3e6eb] bg-white px-[16px] text-[14px] outline-none placeholder:text-[#969da8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                value={form.passwordConfirm}
                onChange={(e) => handleChangeField("passwordConfirm", e.target.value)}
                aria-invalid={showPasswordConfirmError}
                aria-describedby={showPasswordConfirmError ? "signup-password-confirm-error" : undefined}
              />
              {showPasswordConfirmError && <p id="signup-password-confirm-error" className="mt-[6px] text-[12px] leading-[18px] text-red-600" role="alert">비밀번호가 일치하지 않아요.</p>}
            </div>
          </div>

          <button type="submit" disabled={!canSubmit || isSubmitting} className="mt-[18px] flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#2563eb] text-[14px] font-bold text-white transition-colors enabled:hover:bg-[#1d4ed8] disabled:cursor-not-allowed">
            {isSubmitting ? "가입 중" : "가입하기"}
          </button>
        </form>

        <p className="mt-[18px] text-center text-[12px] leading-[18px] text-[#606774]">
          이미 계정이 있나요?{" "}
          <Link to="/login" className="font-bold text-[#2563eb] hover:underline">로그인</Link>
        </p>
      </section>
    </main>
  );
}

