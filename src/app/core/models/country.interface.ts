export interface Country {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}

export interface CountryMedia {
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

export interface CountryMediaResponse {
  page: number;
  results: CountryMedia[];
  total_pages: number;
  total_results: number;
}