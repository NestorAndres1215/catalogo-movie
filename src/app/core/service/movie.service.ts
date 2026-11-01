import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';

import { Movie, MovieFilters, MovieResponse } from '../models/movie.interface';

import { GenreResponse } from '../models/genre.interface';

import { MovieCredits } from '../models/movie-credits.interface';
import { Collection, CollectionResponse } from '../models/collection.interface';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly tmdb = inject(TmdbService);

  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    return this.tmdb.get<MovieResponse>('/movie/popular', { page });
  }

  getMovieDetails(id: number): Observable<Movie> {
    return this.tmdb.get<Movie>(`/movie/${id}`);
  }

  getMovieGenres(): Observable<GenreResponse> {
    return this.tmdb.get<GenreResponse>('/genre/movie/list');
  }

  discoverMovies(page: number, filters: MovieFilters): Observable<MovieResponse> {
    const parameters: Record<string, string | number | boolean> = {
      page,
      sort_by: filters.sortBy,
    };

    if (filters.genreId !== null) {
      parameters['with_genres'] = filters.genreId;
    }

    if (filters.year !== null) {
      parameters['primary_release_year'] = filters.year;
    }

    if (filters['vote_count.gte'] !== undefined) {
      parameters['vote_count.gte'] = filters['vote_count.gte'];
    }

    if (filters.include_adult !== undefined) {
      parameters['include_adult'] = filters.include_adult;
    }

    return this.tmdb.get<MovieResponse>('/discover/movie', parameters);
  }

  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    return this.tmdb.get<MovieResponse>('/search/movie', {
      query,
      page,
      include_adult: false,
    });
  }

  getMovieCredits(id: number): Observable<MovieCredits> {
    return this.tmdb.get<MovieCredits>(`/movie/${id}/credits`);
  }

  getMovieRecommendations(id: number): Observable<MovieResponse> {
    return this.tmdb.get<MovieResponse>(`/movie/${id}/recommendations`);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }

  getMoviesByDecade(
    startYear: number,
    endYear: number,
    page: number = 1,
  ): Observable<MovieResponse> {
    return this.tmdb.get<MovieResponse>('/discover/movie', {
      page,
      sort_by: 'popularity.desc',
      'primary_release_date.gte': `${startYear}-01-01`,
      'primary_release_date.lte': `${endYear}-12-31`,
    });
  }

  searchCollections(query: string, page: number = 1): Observable<CollectionResponse> {
    return this.tmdb.get<CollectionResponse>('/search/collection', {
      query,
      page,
    });
  }

  getCollectionDetails(id: number): Observable<Collection> {
    return this.tmdb.get<Collection>(`/collection/${id}`);
  }

  getTrendingMovies(page: number = 1): Observable<MovieResponse> {
  return this.tmdb.get<MovieResponse>('/trending/movie/week', { page });
}

getUpcomingMovies(page: number = 1): Observable<MovieResponse> {
  return this.tmdb.get<MovieResponse>('/movie/upcoming', { page });
}

getTopRatedMovies(page: number = 1): Observable<MovieResponse> {
  return this.tmdb.get<MovieResponse>('/movie/top_rated', { page });
}
}
