
export interface TvSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: SeriesGenre[];
  original_language: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  status?: string;
  tagline?: string;
  homepage?: string;
  created_by?: SeriesCreator[];
  seasons?: SeriesSeason[];
  networks?: SeriesNetwork[];
  origin_country?: string[];
}

export interface SeriesGenre {
  id: number;
  name: string;
}

export interface SeriesCreator {
  id: number;
  name: string;
  profile_path: string | null;
}

export interface SeriesSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
}

export interface SeriesNetwork {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface SeriesResponse {
  page: number;
  results: TvSeries[];
  total_pages: number;
  total_results: number;
}

export interface SeriesFilters {
  genreId: number | null;
  year: number | null;
  sortBy: string;

  'vote_count.gte'?: number;
  include_adult?: boolean;
}