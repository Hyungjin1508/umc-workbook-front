export const favoriteKeys = {
  list: (memberId: number | null) => ["favorites", "list", memberId] as const,
  detail: (memberId: number | null, movieId: number) => ["favorites", "detail", memberId, movieId] as const,
};

export const ratingKeys = {
  member: (memberId: number | null) => ["ratings", "member", memberId] as const,
};
