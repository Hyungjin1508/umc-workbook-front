import type { Metadata } from "next";
import { EditProfilePage } from "@/screens/profile/edit-profile-page";

export const metadata: Metadata = { title: "내 정보 수정" };

export default function Page() {
  return <EditProfilePage />;
}
