import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { YearService } from '../../../../core/service/year.service';
import { YearMedia } from '../../../../core/models/year.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import {
  FilterTab,
  FilterTabsComponent,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import {
  FilterOption,
  SelectFilterComponent,
} from '../../../../shared/components/select-filter/select-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { MediaCardComponent } from '../../../../shared/components/media-card/media-card';

@Component({
  selector: 'app-year-list',
  standalone: true,
  imports: [

    PageHeaderComponent,
    PageLoadingComponent,
    EmptyStateComponent,
    FilterTabsComponent,
    SelectFilterComponent,
    PaginationComponent,
    MediaCardComponent
],
  templateUrl: './year-list.html',
  styleUrl: './year-list.css',
})
export class YearListComponent implements OnInit {
  private readonly yearService = inject(YearService);

  readonly currentYear = new Date().getFullYear();

  readonly year = signal(this.currentYear);
  readonly mediaType = signal<'movie' | 'tv'>('movie');

  readonly media = signal<YearMedia[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalResults = signal(0);

  readonly years = Array.from(
    { length: this.currentYear - 1949 },
    (_, index) => this.currentYear - index,
  );

  ngOnInit(): void {
    this.loadMedia();
  }

  loadMedia(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const request =
      this.mediaType() === 'movie'
        ? this.yearService.getMoviesByYear(this.year(), this.currentPage())
        : this.yearService.getSeriesByYear(this.year(), this.currentPage());

    request.subscribe({
      next: (response) => {
        this.media.set(response.results);
        this.totalPages.set(Math.min(response.total_pages, 500));
        this.totalResults.set(response.total_results);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar contenido por año:', error);
        this.errorMessage.set('No se pudo cargar el contenido. Inténtalo nuevamente.');
        this.media.set([]);
        this.loading.set(false);
      },
    });
  }
  readonly yearOptions: FilterOption[] = this.years.map((year) => ({
    label: String(year),
    value: year,
  }));
  onYearChange(value: string): void {
    this.year.set(Number(value));
    this.currentPage.set(1);
    this.loadMedia();
  }

  readonly mediaTabs: FilterTab[] = [
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];

  changeMediaType(type: FilterType): void {
    if (type !== 'movie' && type !== 'tv') return;

    if (this.mediaType() === type) return;

    this.mediaType.set(type);
    this.currentPage.set(1);
    this.loadMedia();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || this.loading()) return;

    this.currentPage.set(page);
    this.loadMedia();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  getImageUrl(path: string | null): string {
    return this.yearService.getImageUrl(path);
  }

  getMediaTitle(item: YearMedia): string {
    return item.title || item.name || 'Sin título';
  }

  getMediaDate(item: YearMedia): string {
    return item.release_date || item.first_air_date || '';
  }

  getMediaRoute(item: YearMedia): string[] {
    return this.mediaType() === 'movie'
      ? ['/movies', String(item.id)]
      : ['/series', String(item.id)];
  }
}
