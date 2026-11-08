import { useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { checkNicknameDuplicate } from "@/api/members/check-nickname-duplicate";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { useProfileStore } from "@/stores/profile-store";

export function EditProfilePage() {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(profile.nickname);
  const [profileImage, setProfileImage] = useState(profile.profileImage);
  const [imageError, setImageError] = useState("");
  const [isReadingImage, setIsReadingImage] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState("");
  const [isNicknameTaken, setIsNicknameTaken] = useState(false);
  const [notice, setNotice] = useState("");
  const isNicknameValid = nickname.trim().length >= 2 && nickname.trim().length <= 12;

  async function handleCheckNickname() {
    if (!isNicknameValid || isChecking) return;
    if (nickname.trim() === profile.nickname) {
      setNicknameMessage("현재 사용 중인 닉네임이에요.");
      return;
    }
    setIsChecking(true);
    try {
      const response = await checkNicknameDuplicate(nickname.trim());
      setIsNicknameTaken(!response.available);
      setNicknameMessage(response.available ? "사용할 수 있는 닉네임이에요." : "이미 사용 중인 닉네임이에요.");
    } catch {
      setNicknameMessage("중복 확인에 실패했어요. 회원 서버 연결을 확인해 주세요.");
    } finally {
      setIsChecking(false);
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setImageError("PNG, JPG, WebP 이미지를 선택해 주세요.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("5MB 이하의 이미지를 선택해 주세요.");
      return;
    }
    setImageError("");
    setIsReadingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setProfileImage(reader.result);
      setIsReadingImage(false);
    };
    reader.onerror = () => { setImageError("이미지를 읽지 못했어요."); setIsReadingImage(false); };
    reader.readAsDataURL(file);
  }

  function handleSave(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isNicknameValid || isChecking || isNicknameTaken || isReadingImage) return;
    // 퍼블리싱 단계의 화면 간 값 반영입니다. 서버 변경 요청은 보내지 않습니다.
    updateProfile({ nickname: nickname.trim(), profileImage });
    navigate({ to: "/my-page" });
  }

  return (
    <main className="flex min-h-[calc(1024px-91px)] min-w-[1024px] flex-col bg-[#f6f7f9] px-[80px] pt-[24px] pb-[28px] text-[#17191e]">
      <form onSubmit={handleSave} className="flex-1">
        <div className="flex items-center justify-between">
          <div><h1 className="text-[32px] font-extrabold leading-[40px] tracking-[-1px]">내 정보 수정</h1><p className="mt-[8px] text-[13px] text-[#606774]">닉네임과 프로필 이미지만 변경할 수 있어요.</p></div>
          <button type="submit" disabled={!isNicknameValid || isChecking || isNicknameTaken || isReadingImage} className="h-[40px] cursor-pointer rounded-[6px] bg-[#2563eb] px-[16px] text-[13px] font-bold text-white enabled:hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50">변경사항 저장</button>
        </div>
        <div className="mt-[40px] grid grid-cols-2 gap-[40px]">
          <div className="flex flex-col items-center pt-[18px]">
            <label className="relative cursor-pointer rounded-full focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#2563eb]">
              <ProfileAvatar image={profileImage} />
              <span className="absolute right-0 bottom-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-[#17191e] bg-[#f6f7f9]"><img src="/icons/movie-icons/edit.svg" alt="" /></span>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="프로필 이미지 선택" disabled={isReadingImage} onChange={handleImageChange} />
            </label>
            <p className="mt-[8px] text-[14px] font-bold underline underline-offset-2">프로필 이미지</p>
            <p className="mt-[4px] text-[11px] text-[#969da8]">선택 사항 · 최대 5MB</p>
            {imageError && <p className="mt-[8px] text-[12px] text-red-600" role="alert">{imageError}</p>}
          </div>
          <div>
            <label htmlFor="profile-nickname" className="mb-[8px] block text-[12px] font-bold">닉네임</label>
            <div className="flex h-[48px] items-center rounded-[8px] border border-[#e3e6eb] bg-white focus-within:border-[#2563eb]">
              <input id="profile-nickname" value={nickname} disabled={isChecking} onChange={(event) => { setNickname(event.target.value); setNicknameMessage(""); setIsNicknameTaken(false); }} aria-invalid={!isNicknameValid || isNicknameTaken} className="h-full min-w-0 flex-1 bg-transparent px-[16px] text-[14px] outline-none" />
              <button type="button" disabled={!isNicknameValid || isChecking} onClick={handleCheckNickname} className="h-full shrink-0 cursor-pointer px-[14px] text-[12px] font-bold text-[#2563eb] disabled:cursor-not-allowed">{isChecking ? "확인 중" : "중복 확인"}</button>
            </div>
            {!isNicknameValid && <p className="mt-[6px] text-[12px] text-red-600" role="alert">닉네임은 2~12자로 입력해 주세요.</p>}
            {nicknameMessage && <p className={`mt-[6px] text-[12px] ${isNicknameTaken ? "text-red-600" : "text-[#606774]"}`} role="status">{nicknameMessage}</p>}
            <label htmlFor="profile-email" className="mt-[18px] mb-[8px] block text-[12px] font-bold">이메일</label>
            <input id="profile-email" type="email" readOnly value={profile.email} className="h-[48px] w-full rounded-[8px] border border-[#e3e6eb] bg-white px-[16px] text-[14px] outline-none" />
          </div>
        </div>
      </form>
      <section aria-labelledby="withdraw-heading" className="mt-[64px] flex items-center justify-between rounded-[10px] border border-[#ff5a4f] bg-[#ff5a4f]/10 px-[20px] py-[18px] text-[#ef4e43]">
        <div><h2 id="withdraw-heading" className="text-[13px] font-bold">회원 탈퇴</h2><p className="mt-[4px] text-[11px]">탈퇴하면 작성한 평점, 후기와 즐겨찾기가 모두 삭제되어 복구할 수 없습니다.</p></div>
        <button type="button" onClick={() => setNotice("회원 탈퇴 기능은 준비 중이에요.")} className="h-[42px] cursor-pointer rounded-[8px] border border-[#ff5a4f] bg-white px-[16px] text-[13px] font-bold">회원 탈퇴</button>
      </section>
      {notice && <p className="mt-[8px] text-[12px] text-[#606774]" role="status">{notice}</p>}
    </main>
  );
}
