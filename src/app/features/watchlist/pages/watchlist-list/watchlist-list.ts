import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

import { WatchlistService } from '../../../../core/service/watchlist.service';
import { WatchlistStatus } from '../../../../core/models/catalog.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

type WatchlistFilter = 'all' | 'movie' | 'tv';

@Component({
  selector: 'app-watchlist-list',
  standalone: true,
  imports: [DecimalPipe, PageHeaderComponent],
  templateUrl: './watchlist-list.html',
  styleUrl: './watchlist-list.css',
})
export class WatchlistListComponent {
  private readonly watchlistService = inject(WatchlistService);
  private readonly router = inject(Router);

  // FILTRO
  readonly selectedFilter = signal<WatchlistFilter>('all');

  // LISTA DEL USUARIO ACTUAL
  readonly watchlist = this.watchlistService.watchlist;

  // PUNTUACIONES DISPONIBLES
  readonly ratings = Array.from(
    { length: 10 },
    (_, index) => index + 1,
  );

  // ELEMENTOS FILTRADOS
  readonly filteredItems = computed(() => {
    const filter = this.selectedFilter();

    if (filter === 'all') {
      return this.watchlist();
    }

    return this.watchlist().filter(
      (item) => item.mediaType === filter,
    );
  });

  // TOTAL DE PELÍCULAS
  readonly totalMovies = computed(
    () =>
      this.watchlist().filter(
        (item) => item.mediaType === 'movie',
      ).length,
  );

  // TOTAL DE SERIES
  readonly totalSeries = computed(
    () =>
      this.watchlist().filter(
        (item) => item.mediaType === 'tv',
      ).length,
  );

  // CAMBIAR FILTRO
  selectFilter(filter: WatchlistFilter): void {
    this.selectedFilter.set(filter);
  }

  // ACTUALIZAR ESTADO
  updateStatus(
    id: number,
    mediaType: 'movie' | 'tv',
    value: string,
  ): void {
    if (value !== 'pending' && value !== 'watched') {
      return;
    }

    const status: WatchlistStatus = value;

    this.watchlistService.updateStatus(
      id,
      mediaType,
      status,
    );
  }

  // ACTUALIZAR PUNTUACIÓN PERSONAL
  updatePersonalRating(
    id: number,
    mediaType: 'movie' | 'tv',
    value: string,
  ): void {
    const rating = value === '' ? null : Number(value);

    if (
      rating !== null &&
      (!Number.isInteger(rating) || rating < 1 || rating > 10)
    ) {
      return;
    }

    this.watchlistService.updatePersonalRating(
      id,
      mediaType,
      rating,
    );
  }

  // ABRIR DETALLES
  openDetails(
    item: { id: number; mediaType: 'movie' | 'tv' },
  ): void {
    if (item.mediaType === 'movie') {
      this.router.navigate(['/movies', item.id]);
      return;
    }

    this.router.navigate(['/series', item.id]);
  }

  // EXPLORAR PELÍCULAS
  exploreMovies(): void {
    this.router.navigate(['/movies']);
  }

  // ELIMINAR ELEMENTO
  removeItem(
    id: number,
    mediaType: 'movie' | 'tv',
  ): void {
    this.watchlistService.remove(id, mediaType);
  }

  // VACIAR LISTA
  clearWatchlist(): void {
    this.watchlistService.clear();
  }

  // OBTENER IMAGEN
  getImageUrl(path: string | null): string {
    if (!path) {
      return 'assets/images/no-poster.png';
    }

    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  // OBTENER AÑO
  getReleaseYear(date: string): string {
    if (!date) {
      return 'Sin fecha';
    }

    return date.substring(0, 4);
  }
}