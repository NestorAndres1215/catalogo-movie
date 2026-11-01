
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: MovieGenre[];
  original_language: string;

  // Datos para rankings y sagas
  popularity: number;
  belongs_to_collection?: MovieCollection | null;

  runtime?: number;
  status?: string;
  tagline?: string;
  homepage?: string;
  production_countries?: ProductionCountry[];
}

export interface MovieCollection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface MovieGenre {
  id: number;
  name: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieFilters {
  genreId: number | null;
  year: number | null;
  sortBy: string;

  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'vote_count.gte'?: number;
  include_adult?: boolean;
}
