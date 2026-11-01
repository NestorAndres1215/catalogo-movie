import { Movie } from './movie.interface';

export interface CollectionSummary {
  id: number;
  name: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface Collection extends CollectionSummary {
  overview: string;
  parts: Movie[];
}

export interface CollectionResponse {
  page: number;
  results: CollectionSummary[];
  total_pages: number;
  total_results: number;
}

export interface RankedCollection extends CollectionSummary {
  popularity: number;
  movieCount: number;
}