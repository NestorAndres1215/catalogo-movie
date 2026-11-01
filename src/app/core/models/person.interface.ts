export interface Person {
  id: number;
  name: string;
  original_name: string;
  known_for_department: string;
  profile_path: string | null;
  adult: boolean;
  gender: number;
  popularity: number;
  known_for?: KnownFor[];
}

export interface KnownFor {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv';
  poster_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface PersonResponse {
  page: number;
  results: Person[];
  total_pages: number;
  total_results: number;
}

export interface PersonFilters {
  department: string;
  sortBy: string;
}

export interface PersonDetails extends Person {
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  also_known_as: string[];
  homepage: string | null;
  imdb_id: string | null;
}

export interface PersonCredit {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv';
  character?: string;
  job?: string;
  department?: string; // Agregar esta propiedad
  poster_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface PersonCredits {
  id: number;
  cast: PersonCredit[];
  crew: PersonCredit[];
}

export interface PersonCombinedCredits {
  id: number;
  cast: PersonCredit[];
  crew: PersonCredit[];
}
