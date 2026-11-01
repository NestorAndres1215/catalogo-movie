import { Injectable, Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';
import {
  StreamingProviderResponse,
  CatalogResponse,
  CollectionResponse,
  CollectionDetails,
  VideoResponse,
  ReviewResponse,
  TmdbLanguage,
  WatchProviderAvailabilityResponse,
  PersonSearchResponse,
  CompanySearchResponse,
  ProductionCompany,
} from '../models/catalog.interface';

@Service()
export class CatalogService {
  private readonly tmdb = inject(TmdbService);

  // ==========================================
  // STREAMING
  // ==========================================

  getStreamingProviders(
    type: 'movie' | 'tv',
    region: string = 'PE',
  ): Observable<StreamingProviderResponse> {
    return this.tmdb.get<StreamingProviderResponse>(`/watch/providers/${type}`, {
      watch_region: region,
    });
  }

  getContentByProvider(
    type: 'movie' | 'tv',
    providerId: number,
    region: string = 'PE',
    page: number = 1,
  ): Observable<CatalogResponse> {
    return this.tmdb.get<CatalogResponse>(`/discover/${type}`, {
      page,
      watch_region: region,
      with_watch_providers: providerId,
      sort_by: 'vote_average.desc',
      'vote_count.gte': 100,
    });
  }

  // ==========================================
  // COLECCIONES Y SAGAS
  // ==========================================

  searchCollections(query: string, page: number = 1): Observable<CollectionResponse> {
    return this.tmdb.get<CollectionResponse>('/search/collection', {
      query,
      page,
    });
  }

  getCollectionDetails(id: number): Observable<CollectionDetails> {
    return this.tmdb.get<CollectionDetails>(`/collection/${id}`);
  }

  // ==========================================
  // BÚSQUEDA DE PELÍCULAS Y SERIES
  // ==========================================

  searchMedia(type: 'movie' | 'tv', query: string, page: number = 1): Observable<CatalogResponse> {
    return this.tmdb.get<CatalogResponse>(`/search/${type}`, {
      query,
      page,
      include_adult: false,
    });
  }

  // ==========================================
  // TRAILERS Y VIDEOS
  // ==========================================

  getVideos(type: 'movie' | 'tv', id: number): Observable<VideoResponse> {
    return this.tmdb.get<VideoResponse>(`/${type}/${id}/videos`);
  }

  getMoviesByReleaseDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    region: string = 'PE',
  ): Observable<CatalogResponse> {
    return this.tmdb.get<CatalogResponse>('/discover/movie', {
      page,
      region,
      'release_date.gte': startDate,
      'release_date.lte': endDate,
      sort_by: 'release_date.asc',
      include_adult: false,
      include_video: false,
    });
  }
  // ==========================================
  // CRÍTICAS Y RESEÑAS
  // ==========================================

  getReviews(type: 'movie' | 'tv', id: number, page: number = 1): Observable<ReviewResponse> {
    return this.tmdb.get<ReviewResponse>(`/${type}/${id}/reviews`, { page });
  }

  // ==========================================
  // IDIOMAS
  // ==========================================

  getLanguages(): Observable<TmdbLanguage[]> {
    return this.tmdb.get<TmdbLanguage[]>('/configuration/languages');
  }

  getContentByLanguage(
    type: 'movie' | 'tv',
    language: string,
    page: number = 1,
  ): Observable<CatalogResponse> {
    return this.tmdb.get<CatalogResponse>(`/discover/${type}`, {
      page,
      with_original_language: language,
      sort_by: 'popularity.desc',
    });
  }

  // ==========================================
  // IMÁGENES
  // ==========================================

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }

  getBackdropUrl(path: string | null, size: string = 'w1280'): string {
    return this.tmdb.getImageUrl(path, size);
  }

  getMediaWatchProviders(
    type: 'movie' | 'tv',
    id: number,
  ): Observable<WatchProviderAvailabilityResponse> {
    return this.tmdb.get<WatchProviderAvailabilityResponse>(`/${type}/${id}/watch/providers`);
  }

  // Buscar actores por nombre.
  searchPeople(query: string, page: number = 1): Observable<PersonSearchResponse> {
    return this.tmdb.get<PersonSearchResponse>('/search/person', {
      query,
      page,
      include_adult: false,
    });
  }

  // Obtener actores populares de TMDB.
  getPopularPeople(page: number = 1): Observable<PersonSearchResponse> {
    return this.tmdb.get<PersonSearchResponse>('/person/popular', {
      page,
    });
  }

  // Obtener películas o series para el reto aleatorio.
  getRandomCandidates(type: 'movie' | 'tv', page: number): Observable<CatalogResponse> {
    return this.tmdb.get<CatalogResponse>(`/discover/${type}`, {
      page,
      sort_by: 'popularity.desc',
      include_adult: false,
      include_video: false,
    });
  }

  // Buscar productoras por nombre.
  searchCompanies(query: string, page: number = 1): Observable<CompanySearchResponse> {
    return this.tmdb.get<CompanySearchResponse>('/search/company', {
      query,
      page,
    });
  }

  // Obtener información de una productora.
  getCompanyDetails(id: number): Observable<ProductionCompany> {
    return this.tmdb.get<ProductionCompany>(`/company/${id}`);
  }
}
