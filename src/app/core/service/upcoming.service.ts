import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';
import { UpcomingResponse } from '../models/upcoming.interface';

@Injectable({
  providedIn: 'root'
})
export class UpcomingService {

  private readonly tmdb = inject(TmdbService);

  getUpcomingMovies(page: number = 1): Observable<UpcomingResponse> {
    return this.tmdb.get<UpcomingResponse>('/movie/upcoming', {
      page,
      region: 'PE'
    });
  }

  getUpcomingSeries(page: number = 1): Observable<UpcomingResponse> {
    return this.tmdb.get<UpcomingResponse>('/tv/on_the_air', {
      page
    });
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }
}