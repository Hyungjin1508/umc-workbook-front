import { useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite } from "@/api/favorites/add-favorite";
import { deleteFavorite } from "@/api/favorites/delete-favorite";
import { getFavorite } from "@/api/favorites/get-favorite";
import { favoriteKeys } from "@/utils/query-keys";
import { useFavoritesQuery } from "./use-favorites-query";
import { useMemberId } from "./use-member-id";

export function useFavorite(movieId: number, detail: boolean) {
  const memberId = useMemberId();
  const queryClient = useQueryClient();
  const listQuery = useFavoritesQuery(memberId, !detail);
  const detailQuery = useQuery({
    queryKey: favoriteKeys.detail(memberId, movieId),
    queryFn: () => getFavorite(movieId),
    enabled: memberId !== null && detail,
    staleTime: 60 * 1000,
    retry: false,
  });
  const mutationKey = ["favorites", "change", memberId, movieId] as const;
  const mutationCount = useIsMutating({ mutationKey, exact: true });
  const mutation = useMutation({
    mutationKey,
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: favoriteKeys.detail(memberId, movieId), exact: true }),
        queryClient.cancelQueries({ queryKey: favoriteKeys.list(memberId), exact: true }),
      ]);
    },
    mutationFn: async (isFavorite: boolean) => {
      if (memberId === null) throw new Error("로그인이 필요해요.");
      if (!isFavorite) return addFavorite(movieId);
      await deleteFavorite(movieId);
      return { movieId, isFavorite: false };
    },
    onSuccess: async (status) => {
      queryClient.setQueryData(favoriteKeys.detail(memberId, movieId), status);
      await queryClient.invalidateQueries({ queryKey: favoriteKeys.list(memberId), exact: true });
    },
  });
  const query = detail ? detailQuery : listQuery;
  const isFavorite = memberId !== null && (detail
    ? detailQuery.data?.isFavorite === true
    : listQuery.data?.some((favorite) => favorite.movieId === movieId) === true);

  return { memberId, query, isFavorite, mutation, isChanging: mutationCount > 0 };
}
