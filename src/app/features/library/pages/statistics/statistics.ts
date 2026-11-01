
import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { WatchlistService } from '../../../../core/service/watchlist.service';
import { TmdbService } from '../../../../core/service/tmdb.service';

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbCastMember {
  id: number;
  name: string;
  profile_path: string | null;
}

interface TmdbMovieDetails {
  genres: TmdbGenre[];
  credits: {
    cast: TmdbCastMember[];
  };
}

interface WatchedMovieStatistics {
  id: number;
  title: string;
  posterPath: string | null;
  personalRating: number;
  genres: TmdbGenre[];
  actors: TmdbCastMember[];
}

interface GenreStatistic {
  id: number;
  name: string;
  count: number;
}

interface ActorStatistic {
  id: number;
  name: string;
  profilePath: string | null;
  count: number;
  movies: string[];
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class StatisticsComponent {

  private readonly watchlistService = inject(WatchlistService);
  private readonly tmdb = inject(TmdbService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly watchedMovies = signal<WatchedMovieStatistics[]>([]);

  readonly totalMovies = computed(
    () => this.watchedMovies().length
  );

  readonly averageRating = computed(() => {
    const movies = this.watchedMovies();

    if (movies.length === 0) {
      return 0;
    }

    const total = movies.reduce(
      (sum, movie) => sum + movie.personalRating,
      0
    );

    return total / movies.length;
  });

  readonly topFiveMovies = computed(() =>
    [...this.watchedMovies()]
      .sort((a, b) => b.personalRating - a.personalRating)
      .slice(0, 5)
  );

  readonly genreStatistics = computed<GenreStatistic[]>(() => {
    const genres = new Map<number, GenreStatistic>();

    for (const movie of this.watchedMovies()) {
      for (const genre of movie.genres) {
        const current = genres.get(genre.id);

        if (current) {
          current.count++;
        } else {
          genres.set(genre.id, {
            id: genre.id,
            name: genre.name,
            count: 1
          });
        }
      }
    }

    return [...genres.values()].sort(
      (a, b) => b.count - a.count
    );
  });

  readonly topFiveActors = computed<ActorStatistic[]>(() => {
    const actors = new Map<number, ActorStatistic>();

    for (const movie of this.watchedMovies()) {
      for (const actor of movie.actors) {
        const current = actors.get(actor.id);

        if (current) {
          current.count++;

          if (!current.movies.includes(movie.title)) {
            current.movies.push(movie.title);
          }
        } else {
          actors.set(actor.id, {
            id: actor.id,
            name: actor.name,
            profilePath: actor.profile_path,
            count: 1,
            movies: [movie.title]
          });
        }
      }
    }

    return [...actors.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  constructor() {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading.set(true);
    this.error.set(null);

    const movies = this.watchlistService.watchlist().filter(
      item => item.mediaType === 'movie' && item.status === 'watched'
    );

    if (movies.length === 0) {
      this.watchedMovies.set([]);
      this.loading.set(false);
      return;
    }

    const requests = movies.map(movie =>
      this.tmdb.get<TmdbMovieDetails>(
        `/movie/${movie.id}`,
        { append_to_response: 'credits' }
      ).pipe(
        map(details => ({
          id: movie.id,
          title: movie.title,
          posterPath: movie.posterPath,
          personalRating: movie.personalRating ?? 0,
          genres: details.genres ?? [],
          actors: details.credits?.cast ?? []
        })),
        catchError(() => of(null))
      )
    );

    forkJoin(requests).subscribe({
      next: results => {
        this.watchedMovies.set(
          results.filter(
            (movie): movie is WatchedMovieStatistics => movie !== null
          )
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las estadísticas.');
        this.loading.set(false);
      }
    });
  }

  getImageUrl(path: string | null, size = 'w500'): string {
    if (!path) {
      return 'assets/images/no-poster.png';
    }

    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  getGenrePercentage(count: number): number {
    const total = this.totalMovies();

    if (total === 0) {
      return 0;
    }

    return (count / total) * 100;
  }
}
