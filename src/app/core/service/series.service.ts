import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';

import { TvSeries, SeriesResponse } from '../models/series.interface';

import { GenreResponse } from '../models/genre.interface';
import { SeriesCredits } from '../models/series-credits.interface';

import { SeriesFilters } from '../models/series.interface';
import { MovieVideoResponse } from '../models/movie.interface';

@Injectable({
  providedIn: 'root',
})
export class SeriesService {
  private readonly tmdb = inject(TmdbService);

  getPopularSeries(page: number = 1): Observable<SeriesResponse> {
    return this.tmdb.get<SeriesResponse>('/tv/popular', { page });
  }

  getSeriesDetails(id: number): Observable<TvSeries> {
    return this.tmdb.get<TvSeries>(`/tv/${id}`);
  }
getSeriesVideos(id: number): Observable<MovieVideoResponse> {
  return this.tmdb.get<MovieVideoResponse>(`/tv/${id}/videos`);
}
  getSeriesGenres(): Observable<GenreResponse> {
    return this.tmdb.get<GenreResponse>('/genre/tv/list');
  }

  discoverSeries(page: number, filters: SeriesFilters): Observable<SeriesResponse> {
    const parameters: Record<string, string | number | boolean> = {
      page,
      sort_by: filters.sortBy,
    };

    if (filters.genreId !== null) {
      parameters['with_genres'] = filters.genreId;
    }

    if (filters.year !== null) {
      parameters['first_air_date_year'] = filters.year;
    }

    if (filters['vote_count.gte'] !== undefined) {
      parameters['vote_count.gte'] = filters['vote_count.gte'];
    }

    if (filters.include_adult !== undefined) {
      parameters['include_adult'] = filters.include_adult;
    }

    return this.tmdb.get<SeriesResponse>('/discover/tv', parameters);
  }

  searchSeries(query: string, page: number = 1): Observable<SeriesResponse> {
    return this.tmdb.get<SeriesResponse>('/search/tv', {
      query,
      page,
      include_adult: false,
    });
  }

  getSeriesCredits(id: number): Observable<SeriesCredits> {
    return this.tmdb.get<SeriesCredits>(`/tv/${id}/credits`);
  }

  getSeriesRecommendations(id: number): Observable<SeriesResponse> {
    return this.tmdb.get<SeriesResponse>(`/tv/${id}/recommendations`);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }

  getTrendingSeries(page: number = 1): Observable<SeriesResponse> {
    return this.tmdb.get<SeriesResponse>('/trending/tv/week', { page });
  }

  getTopRatedSeries(page: number = 1): Observable<SeriesResponse> {
    return this.tmdb.get<SeriesResponse>('/tv/top_rated', { page });
  }
}
