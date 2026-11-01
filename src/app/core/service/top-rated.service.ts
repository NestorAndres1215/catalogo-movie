import { Injectable, Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';
import { TopRatedResponse } from '../models/top-rated.interface';

@Service()
export class TopRatedService {

  private readonly tmdb = inject(TmdbService);

  getTopRatedMovies(page: number = 1): Observable<TopRatedResponse> {
    return this.tmdb.get<TopRatedResponse>('/movie/top_rated', {
      page
    });
  }

  getTopRatedSeries(page: number = 1): Observable<TopRatedResponse> {
    return this.tmdb.get<TopRatedResponse>('/tv/top_rated', {
      page
    });
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }
}