import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRating } from "@/api/ratings/create-rating";
import { updateRating } from "@/api/ratings/update-rating";
import { deleteRating } from "@/api/ratings/delete-rating";
import type { Rating, RatingFields } from "@/api/ratings/models";
import { ratingKeys } from "@/utils/query-keys";
import { updateRatingList } from "@/utils/ratings/update-rating-list";

type RatingAction =
  | { type: "create"; fields: RatingFields }
  | { type: "update"; ratingId: number; fields: RatingFields }
  | { type: "delete"; ratingId: number };

export function useRatingMutation(memberId: number, movieId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ratingKeys.member(memberId), exact: true });
    },
    mutationFn: async (action: RatingAction) => {
      if (action.type === "create") return createRating({ movieId, ...action.fields });
      if (action.type === "update") return updateRating(action.ratingId, action.fields);
      await deleteRating(action.ratingId);
      return null;
    },
    onSuccess: async (rating, action) => {
      const queryKey = ratingKeys.member(memberId);
      // 응답으로 완전한 평점 항목을 받아 기존 목록에 반영합니다.
      queryClient.setQueryData<Rating[]>(queryKey, (previous) => updateRatingList(
        previous, action.type === "create" ? null : action.ratingId, rating,
      ));
      if (!queryClient.getQueryData(queryKey)) await queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
}
