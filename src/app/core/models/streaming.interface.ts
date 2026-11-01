
export interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface StreamingProviderResponse {
  results: StreamingProvider[];
}

export interface StreamingMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
}

export interface StreamingSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  popularity: number;
}

export interface StreamingDiscoverResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface StreamingRanking extends StreamingProvider {
  averagePopularity: number;
  totalTitles: number;
  movieCount: number;
  seriesCount: number;
  topMovies: StreamingMovie[];
  topSeries: StreamingSeries[];
}
