export interface FavoriteWatchlistItem {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  overview: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string;
}

// ==========================================
// RESPUESTA GENERAL DE PELÍCULAS Y SERIES
// ==========================================

export interface CatalogMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  original_language?: string;
  release_date?: string;
  first_air_date?: string;
}

export interface CatalogResponse {
  page: number;
  results: CatalogMedia[];
  total_pages: number;
  total_results: number;
}

// ==========================================
// STREAMING
// ==========================================

export interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface StreamingProviderResponse {
  results: StreamingProvider[];
}

// ==========================================
// COLECCIONES Y SAGAS
// ==========================================

export interface MovieCollection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface CollectionDetails extends MovieCollection {
  parts: CatalogMedia[];
}

export interface CollectionResponse {
  page: number;
  results: MovieCollection[];
  total_pages: number;
  total_results: number;
}

// ==========================================
// TRAILERS Y VIDEOS
// ==========================================

export interface MediaVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface VideoResponse {
  id: number;
  results: MediaVideo[];
}

// ==========================================
// CRÍTICAS Y RESEÑAS
// ==========================================

export interface MediaReview {
  id: string;
  author: string;

  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };

  content: string;
  created_at: string;
  url: string;
}

export interface ReviewResponse {
  id: number;
  results: MediaReview[];
  page: number;
  total_pages: number;
  total_results: number;
}

// ==========================================
// IDIOMAS
// ==========================================

export interface TmdbLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

// ==========================================
// FAVORITOS Y WATCHLIST
// ==========================================

export interface FavoriteWatchlistItem {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  overview: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string;
}

export interface WatchProviderAvailability {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface WatchProviderRegion {
  link?: string;
  flatrate?: WatchProviderAvailability[];
  rent?: WatchProviderAvailability[];
  buy?: WatchProviderAvailability[];
  free?: WatchProviderAvailability[];
  ads?: WatchProviderAvailability[];
}

export interface WatchProviderAvailabilityResponse {
  id: number;
  results: Record<string, WatchProviderRegion>;
}

export interface TmdbPerson {
  id: number;
  name: string;
  profile_path: string | null;
  popularity: number;
  known_for?: CatalogMedia[];
}

export interface PersonSearchResponse {
  page: number;
  results: TmdbPerson[];
  total_pages: number;
  total_results: number;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country?: string;
  headquarters?: string | null;
  homepage?: string | null;
}

export interface CompanySearchResponse {
  page: number;
  results: ProductionCompany[];
  total_pages: number;
  total_results: number;
}

export type WatchlistStatus = 'pending' | 'watched';

export interface FavoriteWatchlistItem {
  id: number;
  userId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  overview: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string;

  // Datos personales del usuario
  status?: WatchlistStatus;
  personalRating?: number | null;
}