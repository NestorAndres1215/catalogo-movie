import { Component, computed, inject, signal } from '@angular/core';

import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { TopRatedService } from '../../../../core/service/top-rated.service';

import { TopRatedMedia } from '../../../../core/models/top-rated.interface';
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
import { MovieCardRankingDetailsComponent } from '../../../../shared/components/movie-card-ranking-details/movie-card-ranking-details';

@Component({
  selector: 'app-top-rated-list',
  standalone: true,
  imports: [
    DecimalPipe,
    MovieCardRankingDetailsComponent,
    PageHeaderComponent,
    PageLoadingComponent,
    FilterTabsComponent,
    EmptyStateComponent,
    PaginationComponent,
    ResultsHeaderComponent,
  ],
  templateUrl: './top-rated-list.html',
  styleUrl: './top-rated-list.css',
})
export class TopRatedListComponent {
  private readonly topRatedService = inject(TopRatedService);
  private readonly router = inject(Router);

  readonly mediaType = signal<'movie' | 'tv'>('movie');

  readonly movies = signal<TopRatedMedia[]>([]);
  readonly series = signal<TopRatedMedia[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalResults = signal(0);

  // Mejor valorado: primer título de la página 1 con imagen horizontal.
  readonly topRated = signal<TopRatedMedia | null>(null);

  readonly bannerImage = computed(() => {
    const path = this.topRated()?.backdrop_path;
    return path ? this.topRatedService.getImageUrl(path, 'original') : null;
  });

  readonly topTitle = computed(() => {
    const item = this.topRated();
    return item ? this.getMediaTitle(item) : '';
  });

  readonly mediaTabs: FilterTab[] = [
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];

  private requestVersion = 0;

  constructor() {
    this.loadTopRated();
  }

  loadTopRated(): void {
    const requestId = ++this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    const request =
      this.mediaType() === 'movie'
        ? this.topRatedService.getTopRatedMovies(this.currentPage())
        : this.topRatedService.getTopRatedSeries(this.currentPage());

    request.subscribe({
      next: (response) => {
        if (requestId !== this.requestVersion) return;

        if (this.mediaType() === 'movie') {
          this.movies.set(response.results);
        } else {
          this.series.set(response.results);
        }

        // El banner solo se actualiza en la página 1 (el mejor del ranking).
        if (this.currentPage() === 1) {
          this.topRated.set(response.results.find((item) => item.backdrop_path) ?? null);
        }

        this.totalPages.set(Math.min(response.total_pages, 500));
        this.totalResults.set(response.total_results);
        this.loading.set(false);
      },
      error: () => {
        if (requestId !== this.requestVersion) return;

        this.errorMessage.set('No se pudo cargar el contenido. Inténtalo nuevamente.');
        this.loading.set(false);
      },
    });
  }

  changeMediaType(type: FilterType): void {
    if (type !== 'movie' && type !== 'tv') {
      return;
    }

    if (this.mediaType() === type) {
      return;
    }

    this.mediaType.set(type);
    this.currentPage.set(1);

    this.loadTopRated();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.loadTopRated();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  get items(): TopRatedMedia[] {
    return this.mediaType() === 'movie' ? this.movies() : this.series();
  }

  getMediaTitle(item: TopRatedMedia): string {
    return item.title || item.name || 'Sin título';
  }

  getMediaDate(item: TopRatedMedia): string {
    const date = item.release_date || item.first_air_date;

    if (!date) return 'Fecha desconocida';

    return date.substring(0, 4);
  }

  getImageUrl(path: string | null, size = 'w500'): string {
    return this.topRatedService.getImageUrl(path, size);
  }

  openDetail(id: number): void {
    const route = this.mediaType() === 'movie' ? '/movies' : '/series';

    this.router.navigate([route, id]);
  }

  getFavoriteReleaseDate(item: TopRatedMedia): string {
    return item.release_date || item.first_air_date || '';
  }
}