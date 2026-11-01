import { Injectable, Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';
import { TrendingResponse } from '../models/trending.interface';

@Service()
export class TrendingService {
  private readonly tmdb = inject(TmdbService);

  getTrending(
    mediaType: 'all' | 'movie' | 'tv' = 'all',
    timeWindow: 'day' | 'week' = 'day',
    page: number = 1,
  ): Observable<TrendingResponse> {
    return this.tmdb.get<TrendingResponse>(`/trending/${mediaType}/${timeWindow}`, { page });
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }
}
