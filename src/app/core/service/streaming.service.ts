import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';

import {
  StreamingDiscoverResponse,
  StreamingMovie,
  StreamingProviderResponse,
  StreamingSeries,
} from '../models/streaming.interface';

@Injectable({
  providedIn: 'root',
})
export class StreamingService {
  private readonly tmdb = inject(TmdbService);

  private readonly region = 'PE';

  getMovieProviders(): Observable<StreamingProviderResponse> {
    return this.tmdb.get<StreamingProviderResponse>('/watch/providers/movie', {
      watch_region: this.region,
    });
  }

  getSeriesProviders(): Observable<StreamingProviderResponse> {
    return this.tmdb.get<StreamingProviderResponse>('/watch/providers/tv', {
      watch_region: this.region,
    });
  }

  discoverMoviesByProvider(
    providerId: number,
    page: number,
  ): Observable<StreamingDiscoverResponse<StreamingMovie>> {
    return this.tmdb.get<StreamingDiscoverResponse<StreamingMovie>>('/discover/movie', {
      with_watch_providers: providerId,
      watch_region: this.region,
      with_watch_monetization_types: 'flatrate',
      sort_by: 'popularity.desc',
      include_adult: false,
      page,
    });
  }

  discoverSeriesByProvider(
    providerId: number,
    page: number,
  ): Observable<StreamingDiscoverResponse<StreamingSeries>> {
    return this.tmdb.get<StreamingDiscoverResponse<StreamingSeries>>('/discover/tv', {
      with_watch_providers: providerId,
      watch_region: this.region,
      with_watch_monetization_types: 'flatrate',
      sort_by: 'popularity.desc',
      include_adult: false,
      page,
    });
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }
}
