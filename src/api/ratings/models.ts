export interface Rating {
  ratingId: number;
  movieId: number;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RatingFields {
  score: number;
  comment: string;
}

export interface CreateRatingRequest extends RatingFields {
  movieId: number;
}
