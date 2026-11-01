import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';
import { RecommendationResponse } from '../models/recommendation.interface';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  private readonly tmdb = inject(TmdbService);

  getPopularMovies(page: number = 1): Observable<RecommendationResponse> {
    return this.tmdb.get<RecommendationResponse>('/movie/popular', {
      page
    });
  }

  getPopularSeries(page: number = 1): Observable<RecommendationResponse> {
    return this.tmdb.get<RecommendationResponse>('/tv/popular', {
      page
    });
  }

  getMovieRecommendations(
    movieId: number,
    page: number = 1
  ): Observable<RecommendationResponse> {
    return this.tmdb.get<RecommendationResponse>(
      `/movie/${movieId}/recommendations`,
      { page }
    );
  }

  getSeriesRecommendations(
    seriesId: number,
    page: number = 1
  ): Observable<RecommendationResponse> {
    return this.tmdb.get<RecommendationResponse>(
      `/tv/${seriesId}/recommendations`,
      { page }
    );
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }
}