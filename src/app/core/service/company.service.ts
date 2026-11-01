import { Injectable, Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';

import { Company, CompanyDetails, CompanyResponse } from '../models/company.interface';

import { CompanyMovieResponse } from '../models/company-movie.interface';

@Service()
export class CompanyService {
  private readonly tmdb = inject(TmdbService);

  // =========================================
  // BUSCAR PRODUCTORAS
  // =========================================

  searchCompanies(query: string, page: number = 1): Observable<CompanyResponse> {
    return this.tmdb.get<CompanyResponse>('/search/company', {
      query,
      page,
    });
  }

  // =========================================
  // OBTENER DETALLE DE PRODUCTORA
  // =========================================

  getCompanyDetails(id: number): Observable<CompanyDetails> {
    return this.tmdb.get<CompanyDetails>(`/company/${id}`);
  }

  // =========================================
  // OBTENER PELÍCULAS DE UNA PRODUCTORA
  // =========================================

  getCompanyMovies(companyId: number, page: number = 1): Observable<CompanyMovieResponse> {
    return this.tmdb.get<CompanyMovieResponse>('/discover/movie', {
      with_companies: companyId,
      sort_by: 'popularity.desc',
      page,
      include_adult: false,
    });
  }

  // =========================================
  // OBTENER LOGOTIPO
  // =========================================

  getLogoUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }

  // =========================================
  // OBTENER POSTER DE PELÍCULA
  // =========================================

  getMoviePoster(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }
}
