import { create } from "zustand";

interface Profile {
  nickname: string;
  email: string;
  profileImage: string | null;
}

interface ProfileStore {
  profile: Profile;
  updateProfile: (changes: Pick<Profile, "nickname" | "profileImage">) => void;
}

// 화면 퍼블리싱용 예시 데이터입니다. 실제 회원 조회/수정 API는 다음 단계에서 연결합니다.
// 비밀번호나 인증 정보는 저장하지 않습니다.
export const useProfileStore = create<ProfileStore>((set) => ({
  profile: {
    nickname: "gs0428",
    email: "gwangsoo@cinemalab.kr",
    profileImage: null,
  },
  updateProfile: (changes) =>
    set((state) => ({ profile: { ...state.profile, ...changes } })),
}));
