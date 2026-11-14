import type { Rating } from "@/api/ratings/models";

export function updateRatingList(previous: Rating[] | undefined, ratingId: number | null, rating: Rating | null) {
  if (!previous) return undefined;
  if (rating === null) return previous.filter((item) => item.ratingId !== ratingId);
  const exists = previous.some((item) => item.ratingId === rating.ratingId);
  return exists ? previous.map((item) => item.ratingId === rating.ratingId ? rating : item) : [...previous, rating];
}
