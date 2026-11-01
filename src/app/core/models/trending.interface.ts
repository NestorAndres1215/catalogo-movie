export interface TrendingMedia {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface TrendingResponse {
  page: number;
  results: TrendingMedia[];
  total_pages: number;
  total_results: number;
}