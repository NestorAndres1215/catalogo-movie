import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';

import { CompanyDetails, CompanyResponse } from '../models/company.interface';

import { CompanyMovieResponse } from '../models/company-movie.interface';

@Service()
export class CompanyService {
  private readonly tmdb = inject(TmdbService);

  searchCompanies(query: string, page: number = 1): Observable<CompanyResponse> {
    return this.tmdb.get<CompanyResponse>('/search/company', {
      query,
      page,
    });
  }

  getCompanyDetails(id: number): Observable<CompanyDetails> {
    return this.tmdb.get<CompanyDetails>(`/company/${id}`);
  }

  getCompanyMovies(companyId: number, page: number = 1): Observable<CompanyMovieResponse> {
    return this.tmdb.get<CompanyMovieResponse>('/discover/movie', {
      with_companies: companyId,
      sort_by: 'popularity.desc',
      page,
      include_adult: false,
    });
  }

  getLogoUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }

  getMoviePoster(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }
}
