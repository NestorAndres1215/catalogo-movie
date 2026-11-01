export interface Favorite {
  id: number;
  userId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  overview: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string;
}