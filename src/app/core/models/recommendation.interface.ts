export interface RecommendationMedia {
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

export interface RecommendationResponse {
  page: number;
  results: RecommendationMedia[];
  total_pages: number;
  total_results: number;
}