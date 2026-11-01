
import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

import { WatchlistService } from '../../../../core/service/watchlist.service';

type RatingFilter = 'all' | 'movie' | 'tv';

@Component({
  selector: 'app-my-ratings-list',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './my-ratings-list.html',
  styleUrl: './my-ratings-list.css',
})
export class MyRatingsListComponent {

  private readonly watchlistService = inject(WatchlistService);
  private readonly router = inject(Router);

  readonly selectedFilter = signal<RatingFilter>('all');

  // Contenidos que tienen una puntuación personal.
  readonly ratedItems = computed(() => {
    const filter = this.selectedFilter();

    return this.watchlistService.watchlist()
      .filter(item =>
        item.personalRating !== null &&
        item.personalRating !== undefined &&
        (filter === 'all' || item.mediaType === filter)
      )
      .sort((a, b) =>
        (b.personalRating ?? 0) - (a.personalRating ?? 0)
      );
  });

  // Total de contenidos calificados.
  readonly totalRated = computed(
    () => this.ratedItems().length
  );

  // Total de películas calificadas.
  readonly totalMovies = computed(() =>
    this.ratedItems().filter(
      item => item.mediaType === 'movie'
    ).length
  );

  // Total de series calificadas.
  readonly totalSeries = computed(() =>
    this.ratedItems().filter(
      item => item.mediaType === 'tv'
    ).length
  );

  // Promedio de todas las puntuaciones personales.
  readonly averageRating = computed(() => {
    const items = this.ratedItems();

    if (items.length === 0) {
      return 0;
    }

    const total = items.reduce(
      (sum, item) => sum + (item.personalRating ?? 0),
      0
    );

    return total / items.length;
  });

  selectFilter(filter: RatingFilter): void {
    this.selectedFilter.set(filter);
  }

  openDetails(id: number, mediaType: 'movie' | 'tv'): void {
    if (mediaType === 'movie') {
      this.router.navigate(['/movies', id]);
      return;
    }

    this.router.navigate(['/series', id]);
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

  getMediaTypeLabel(mediaType: 'movie' | 'tv'): string {
    return mediaType === 'movie' ? 'Película' : 'Serie';
  }

  goToWatchlist(): void {
    this.router.navigate(['/watchlist']);
  }
}
