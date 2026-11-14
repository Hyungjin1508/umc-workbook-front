export interface Favorite {
  movieId: number;
}

export interface FavoriteStatus extends Favorite {
  isFavorite: boolean;
}
