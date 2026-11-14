import { useAuthStore } from "@/stores/auth-store";
import { getMemberId } from "@/utils/auth/get-member-id";

export function useMemberId() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return getMemberId(accessToken);
}
