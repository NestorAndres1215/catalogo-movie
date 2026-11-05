import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { UpcomingService } from '../../../../core/service/upcoming.service';
import { UpcomingMedia } from '../../../../core/models/upcoming.interface';
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

@Component({
  selector: 'app-upcoming-list',
  standalone: true,
  imports: [
    DecimalPipe,
    FavoriteButtonComponent,
    PageHeaderComponent,
    PageLoadingComponent,
    FilterTabsComponent,
    EmptyStateComponent,
    PaginationComponent
],
  templateUrl: './upcoming-list.html',
  styleUrl: './upcoming-list.css',
})
export class UpcomingListComponent {
  private readonly upcomingService = inject(UpcomingService);
  private readonly router = inject(Router);

  readonly mediaType = signal<'movie' | 'tv'>('movie');

  readonly movies = signal<UpcomingMedia[]>([]);
  readonly series = signal<UpcomingMedia[]>([]);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalResults = signal(0);
  readonly mediaTabs: FilterTab[] = [
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];
  private requestVersion = 0;

  constructor() {
    this.loadUpcoming();
  }

  loadUpcoming(): void {
    const requestId = ++this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    const request =
      this.mediaType() === 'movie'
        ? this.upcomingService.getUpcomingMovies(this.currentPage())
        : this.upcomingService.getUpcomingSeries(this.currentPage());

    request.subscribe({
      next: (response) => {
        if (requestId !== this.requestVersion) return;

        if (this.mediaType() === 'movie') {
          this.movies.set(response.results);
        } else {
          this.series.set(response.results);
        }

        this.totalPages.set(Math.max(1, Math.min(response.total_pages, 500)));
        this.totalResults.set(response.total_results);

        this.loading.set(false);
      },
      error: () => {
        if (requestId !== this.requestVersion) return;

        this.errorMessage.set('No se pudieron cargar los próximos estrenos.');

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

  this.loadUpcoming();
}

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.loadUpcoming();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  get items(): UpcomingMedia[] {
    return this.mediaType() === 'movie' ? this.movies() : this.series();
  }

  getMediaTitle(item: UpcomingMedia): string {
    return item.title || item.name || 'Sin título';
  }

  getMediaDate(item: UpcomingMedia): string {
    const date = item.release_date || item.first_air_date;

    if (!date) return 'Fecha por confirmar';

    return date;
  }

  getFormattedDate(item: UpcomingMedia): string {
    const date = this.getMediaDate(item);

    if (date === 'Fecha por confirmar') return date;

    const parsedDate = new Date(`${date}T00:00:00`);

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
  }

  getImageUrl(path: string | null): string {
    return this.upcomingService.getImageUrl(path);
  }

  getFavoriteReleaseDate(item: UpcomingMedia): string {
    return item.release_date || item.first_air_date || '';
  }

  openDetail(id: number): void {
    const route = this.mediaType() === 'movie' ? '/movies' : '/series';

    this.router.navigate([route, id]);
  }
}
