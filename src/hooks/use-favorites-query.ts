import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "@/api/favorites/get-favorites";
import { favoriteKeys } from "@/utils/query-keys";

export function useFavoritesQuery(memberId: number | null, enabled = true) {
  return useQuery({
    queryKey: favoriteKeys.list(memberId),
    queryFn: getFavorites,
    enabled: memberId !== null && enabled,
    staleTime: 60 * 1000,
    retry: false,
  });
}
