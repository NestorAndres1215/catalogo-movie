export interface CompanyMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
}

export interface CompanyMovieResponse {
  page: number;
  results: CompanyMovie[];
  total_pages: number;
  total_results: number;
}