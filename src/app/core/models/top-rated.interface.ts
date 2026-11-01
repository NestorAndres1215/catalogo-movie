export interface TopRatedMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
}

export interface TopRatedResponse {
  page: number;
  results: TopRatedMedia[];
  total_pages: number;
  total_results: number;
}