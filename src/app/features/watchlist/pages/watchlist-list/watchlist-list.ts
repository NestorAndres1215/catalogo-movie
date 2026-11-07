import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

import { WatchlistService } from '../../../../core/service/watchlist.service';
import { WatchlistStatus } from '../../../../core/models/catalog.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import {
  FilterTab,
  FilterType,
  FilterTabsComponent,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { StatItem, StatsComponent } from '../../../../shared/components/stats/stats';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import {
  FilterOption,
  SelectFilterComponent,
} from '../../../../shared/components/select-filter/select-filter';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';

@Component({
  selector: 'app-watchlist-list',
  standalone: true,
  imports: [
    DecimalPipe,
    PageHeaderComponent,
    FilterTabsComponent,
    StatsComponent,
    EmptyStateComponent,
    SelectFilterComponent,
    ButtonComponent,
    ResultsHeaderComponent
],
  templateUrl: './watchlist-list.html',
  styleUrl: './watchlist-list.css',
})
export class WatchlistListComponent {
  private readonly watchlistService = inject(WatchlistService);
  private readonly router = inject(Router);

  readonly selectedFilter = signal<FilterType>('all');

  readonly watchlistTabs: FilterTab[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];

  readonly stats = computed<StatItem[]>(() => [
    {
      icon: 'fa-clipboard-list',
      value: this.watchlist().length,
      label: 'En mi lista',
    },
    {
      icon: 'fa-film',
      value: this.totalMovies(),
      label: 'Películas',
    },
    {
      icon: 'fa-tv',
      value: this.totalSeries(),
      label: 'Series',
    },
  ]);
// PUNTUACIONES DISPONIBLES
readonly ratings = Array.from({ length: 10 }, (_, index) => index + 1);

// OPCIONES DE PUNTUACIÓN
readonly ratingOptions: FilterOption[] = this.ratings.map(rating => ({
  label: `${rating} / 10`,
  value: rating
}));

// OPCIONES DE ESTADO
readonly statusOptions: FilterOption[] = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Visto', value: 'watched' }
];
  // CAMBIAR FILTRO
  selectFilter(filter: FilterType): void {
    this.selectedFilter.set(filter);
  }

  // LISTA DEL USUARIO ACTUAL
  readonly watchlist = this.watchlistService.watchlist;

  // PUNTUACIONES DISPONIBLES


  // ELEMENTOS FILTRADOS
  readonly filteredItems = computed(() => {
    const filter = this.selectedFilter();

    if (filter === 'all') {
      return this.watchlist();
    }

    return this.watchlist().filter((item) => item.mediaType === filter);
  });

  // TOTAL DE PELÍCULAS
  readonly totalMovies = computed(
    () => this.watchlist().filter((item) => item.mediaType === 'movie').length,
  );

  // TOTAL DE SERIES
  readonly totalSeries = computed(
    () => this.watchlist().filter((item) => item.mediaType === 'tv').length,
  );

  // ACTUALIZAR ESTADO
  updateStatus(id: number, mediaType: 'movie' | 'tv', value: string): void {
    if (value !== 'pending' && value !== 'watched') {
      return;
    }

    const status: WatchlistStatus = value;

    this.watchlistService.updateStatus(id, mediaType, status);
  }

  // ACTUALIZAR PUNTUACIÓN PERSONAL
  updatePersonalRating(id: number, mediaType: 'movie' | 'tv', value: string): void {
    const rating = value === '' ? null : Number(value);

    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 10)) {
      return;
    }

    this.watchlistService.updatePersonalRating(id, mediaType, rating);
  }

  // ABRIR DETALLES
  openDetails(item: { id: number; mediaType: 'movie' | 'tv' }): void {
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
  removeItem(id: number, mediaType: 'movie' | 'tv'): void {
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
