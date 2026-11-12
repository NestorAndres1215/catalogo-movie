import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TrendingService } from '../../../../core/service/trending.service';
import { TrendingMedia } from '../../../../core/models/trending.interface';
import { FavoriteButtonComponent } from '../../../../shared/components/favorite-button/favorite-button';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import {
  FilterTab,
  FilterTabsComponent,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { MediaCardComponent } from '../../../../shared/components/media-card/media-card';

@Component({
  selector: 'app-trending-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    PageLoadingComponent,
    FilterTabsComponent,
    EmptyStateComponent,
    PaginationComponent,
    ResultsHeaderComponent,
    MediaCardComponent,
  ],
  templateUrl: './trending-list.html',
  styleUrl: './trending-list.css',
})
export class TrendingListComponent implements OnInit {
  private readonly trendingService = inject(TrendingService);

  readonly mediaType = signal<'all' | 'movie' | 'tv'>('all');
  readonly timeWindow = signal<'day' | 'week'>('day');

  readonly trending = signal<TrendingMedia[]>([]);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalResults = signal(0);

  private requestVersion = 0;

  ngOnInit(): void {
    this.loadTrending();
  }
  readonly mediaTabs: FilterTab[] = [
    { label: 'Todo', value: 'all' },
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];
  loadTrending(): void {
    const version = ++this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    this.trendingService
      .getTrending(this.mediaType(), this.timeWindow(), this.currentPage())
      .subscribe({
        next: (response) => {
          if (version !== this.requestVersion) return;

          this.trending.set(response.results);
          this.totalPages.set(Math.min(response.total_pages, 500));
          this.totalResults.set(response.total_results);
          this.loading.set(false);
        },
        error: (error) => {
          if (version !== this.requestVersion) return;

          console.error('Error al cargar tendencias:', error);

          this.trending.set([]);
          this.totalPages.set(1);
          this.totalResults.set(0);
          this.errorMessage.set('No se pudieron cargar las tendencias. Inténtalo nuevamente.');

          this.loading.set(false);
        },
      });
  }

  changeMediaType(type: FilterType): void {
    if (type !== 'all' && type !== 'movie' && type !== 'tv') {
      return;
    }

    if (this.mediaType() === type) {
      return;
    }

    this.mediaType.set(type);
    this.currentPage.set(1);
    this.loadTrending();
  }
  readonly timeTabs: FilterTab[] = [
    { label: 'Hoy', value: 'day' },
    { label: 'Esta semana', value: 'week' },
  ];
  changeTimeWindow(type: FilterType): void {
    if (type !== 'day' && type !== 'week') {
      return;
    }

    if (this.timeWindow() === type) {
      return;
    }

    this.timeWindow.set(type);
    this.currentPage.set(1);
    this.loadTrending();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || this.loading()) {
      return;
    }

    this.currentPage.set(page);
    this.loadTrending();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  getImageUrl(path: string | null): string {
    return this.trendingService.getImageUrl(path);
  }

  getMediaTitle(item: TrendingMedia): string {
    return item.title || item.name || 'Sin título';
  }

  getMediaDate(item: TrendingMedia): string {
    return item.release_date || item.first_air_date || '';
  }

  getMediaType(item: TrendingMedia): 'movie' | 'tv' {
    if (item.media_type) {
      return item.media_type;
    }

    return this.mediaType() === 'tv' ? 'tv' : 'movie';
  }

  getMediaRoute(item: TrendingMedia): string[] {
    const type = this.getMediaType(item);

    return type === 'movie' ? ['/movies', String(item.id)] : ['/series', String(item.id)];
  }

  getMediaLabel(item: TrendingMedia): string {
    return this.getMediaType(item) === 'movie' ? 'Película' : 'Serie';
  }

  // Primer título en tendencia que tenga imagen horizontal (backdrop)
readonly topTrending = computed(
  () => this.trending().find((item) => item.backdrop_path) ?? null,
);

readonly bannerImage = computed(() => {
  const path = this.topTrending()?.backdrop_path;
  return path ? this.trendingService.getImageUrl(path, 'original') : null;
});

readonly topTitle = computed(() => {
  const item = this.topTrending();
  return item ? this.getMediaTitle(item) : '';
});
}
