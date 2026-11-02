
import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

import { WatchlistService } from '../../../../core/service/watchlist.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-watched-movies-list',
  standalone: true,
  imports: [DecimalPipe, PageHeaderComponent],
  templateUrl: './watched-movies-list.html',
  styleUrl: './watched-movies-list.css',
})
export class WatchedMoviesListComponent {

  private readonly watchlistService = inject(WatchlistService);
  private readonly router = inject(Router);

  // Solo películas cuyo estado sea watched.
  readonly watchedMovies = computed(() =>
    this.watchlistService.watchlist().filter(
      item => item.mediaType === 'movie' && item.status === 'watched'
    )
  );

  readonly totalWatched = computed(
    () => this.watchedMovies().length
  );

  readonly ratedMovies = computed(() =>
    this.watchedMovies().filter(
      item => item.personalRating !== null &&
              item.personalRating !== undefined
    ).length
  );

  readonly averageRating = computed(() => {
    const rated = this.watchedMovies().filter(
      item => item.personalRating !== null &&
              item.personalRating !== undefined
    );

    if (rated.length === 0) {
      return 0;
    }

    const total = rated.reduce(
      (sum, item) => sum + (item.personalRating ?? 0),
      0
    );

    return total / rated.length;
  });

  openDetails(id: number): void {
    this.router.navigate(['/movies', id]);
  }

  getImageUrl(path: string | null): string {
    if (!path) {
      return 'assets/images/no-poster.png';
    }

    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  getReleaseYear(date: string): string {
    if (!date) {
      return 'Sin fecha';
    }

    return date.substring(0, 4);
  }

  debugWatchedMovies(): void {
    console.table(
      this.watchlistService.watchlist().map(item => ({
        title: item.title,
        status: item.status,
        shouldAppear:
          item.mediaType === 'movie' && item.status === 'watched'
      }))
    );
  }

  goToWatchlist(): void {
    this.router.navigate(['/watchlist']);
  }
}
