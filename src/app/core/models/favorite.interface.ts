export interface Favorite {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  overview: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string;
}