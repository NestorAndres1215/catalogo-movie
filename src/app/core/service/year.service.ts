import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';
import { YearMediaResponse } from '../models/year.interface';

@Injectable({
  providedIn: 'root'
})
export class YearService {

  private readonly tmdb = inject(TmdbService);

  getMoviesByYear(year: number, page: number = 1): Observable<YearMediaResponse> {
    return this.tmdb.get<YearMediaResponse>('/discover/movie', {
      primary_release_year: year,
      sort_by: 'popularity.desc',
      page,
      include_adult: false
    });
  }

  getSeriesByYear(year: number, page: number = 1): Observable<YearMediaResponse> {
    return this.tmdb.get<YearMediaResponse>('/discover/tv', {
      first_air_date_year: year,
      sort_by: 'popularity.desc',
      page,
      include_adult: false
    });
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }
}