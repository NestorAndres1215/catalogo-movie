import { Injectable, Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';

import { GenreResponse, GenreMediaResponse } from '../models/genre.interface';

@Service()
export class GenreService {
  private readonly tmdb = inject(TmdbService);

  // =========================================
  // OBTENER GÉNEROS DE PELÍCULAS
  // =========================================

  getMovieGenres(): Observable<GenreResponse> {
    return this.tmdb.get<GenreResponse>('/genre/movie/list');
  }

  // =========================================
  // OBTENER GÉNEROS DE SERIES
  // =========================================

  getTvGenres(): Observable<GenreResponse> {
    return this.tmdb.get<GenreResponse>('/genre/tv/list');
  }

  // =========================================
  // OBTENER PELÍCULAS POR GÉNERO
  // =========================================

  getMoviesByGenre(genreId: number, page: number = 1): Observable<GenreMediaResponse> {
    return this.tmdb.get<GenreMediaResponse>('/discover/movie', {
      with_genres: genreId,
      sort_by: 'popularity.desc',
      page,
      include_adult: false,
    });
  }

  // =========================================
  // OBTENER SERIES POR GÉNERO
  // =========================================

  getSeriesByGenre(genreId: number, page: number = 1): Observable<GenreMediaResponse> {
    return this.tmdb.get<GenreMediaResponse>('/discover/tv', {
      with_genres: genreId,
      sort_by: 'popularity.desc',
      page,
      include_adult: false,
    });
  }

  // =========================================
  // OBTENER IMÁGENES
  // =========================================

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }
}
