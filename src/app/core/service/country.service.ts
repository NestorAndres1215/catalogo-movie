import { Injectable, Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';

import { Country, CountryMediaResponse } from '../models/country.interface';

@Service()
export class CountryService {
  private readonly tmdb = inject(TmdbService);

  // =========================================
  // OBTENER TODOS LOS PAÍSES
  // =========================================

  getCountries(): Observable<Country[]> {
    return this.tmdb.get<Country[]>('/configuration/countries');
  }

  // =========================================
  // OBTENER PELÍCULAS POR PAÍS
  // =========================================

  getMoviesByCountry(countryCode: string, page: number = 1): Observable<CountryMediaResponse> {
    return this.tmdb.get<CountryMediaResponse>('/discover/movie', {
      with_origin_country: countryCode,
      sort_by: 'popularity.desc',
      page,
      include_adult: false,
    });
  }

  // =========================================
  // OBTENER SERIES POR PAÍS
  // =========================================

  getSeriesByCountry(countryCode: string, page: number = 1): Observable<CountryMediaResponse> {
    return this.tmdb.get<CountryMediaResponse>('/discover/tv', {
      with_origin_country: countryCode,
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
