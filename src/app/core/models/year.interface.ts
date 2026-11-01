export interface YearMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface YearMediaResponse {
  page: number;
  results: YearMedia[];
  total_pages: number;
  total_results: number;
}