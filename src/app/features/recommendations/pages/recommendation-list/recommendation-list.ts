import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { RecommendationService } from '../../../../core/service/recommendation.service';
import { RecommendationMedia } from '../../../../core/models/recommendation.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import {
  FilterTab,
  FilterTabsComponent,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { FilterOption, SelectFilterComponent } from '../../../../shared/components/select-filter/select-filter';

@Component({
  selector: 'app-recommendation-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    PageHeaderComponent,
    PageLoadingComponent,
    EmptyStateComponent,
    FilterTabsComponent,
    PaginationComponent,
    SelectFilterComponent
],
  templateUrl: './recommendation-list.html',
  styleUrl: './recommendation-list.css',
})
export class RecommendationListComponent implements OnInit {
  private readonly recommendationService = inject(RecommendationService);

  readonly mediaType = signal<'movie' | 'tv'>('movie');

  readonly popularMedia = signal<RecommendationMedia[]>([]);
  readonly recommendations = signal<RecommendationMedia[]>([]);

  readonly selectedId = signal<number | null>(null);

  readonly loading = signal(false);
  readonly loadingSources = signal(false);
  readonly errorMessage = signal('');

  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalResults = signal(0);

  private requestVersion = 0;

  ngOnInit(): void {
    this.loadPopularMedia();
  }

  readonly mediaTabs: FilterTab[] = [
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];
readonly sourceOptions = computed<FilterOption[]>(() =>
  this.popularMedia().map(item => ({
    label: this.getMediaTitle(item),
    value: item.id
  }))
);
  loadPopularMedia(): void {
    this.loadingSources.set(true);
    this.errorMessage.set('');

    const request =
      this.mediaType() === 'movie'
        ? this.recommendationService.getPopularMovies()
        : this.recommendationService.getPopularSeries();

    request.subscribe({
      next: (response) => {
        this.popularMedia.set(response.results);
        this.loadingSources.set(false);

        if (response.results.length > 0) {
          this.selectedId.set(response.results[0].id);
          this.currentPage.set(1);
          this.loadRecommendations();
        } else {
          this.selectedId.set(null);
          this.recommendations.set([]);
        }
      },
      error: (error) => {
        console.error('Error al cargar producciones populares:', error);
        this.loadingSources.set(false);
        this.recommendations.set([]);
        this.errorMessage.set('No se pudieron cargar las producciones. Inténtalo nuevamente.');
      },
    });
  }

  loadRecommendations(): void {
    const id = this.selectedId();

    if (id === null) return;

    const version = ++this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    const request =
      this.mediaType() === 'movie'
        ? this.recommendationService.getMovieRecommendations(id, this.currentPage())
        : this.recommendationService.getSeriesRecommendations(id, this.currentPage());

    request.subscribe({
      next: (response) => {
        if (version !== this.requestVersion) return;

        this.recommendations.set(response.results);
        this.totalPages.set(Math.min(response.total_pages, 500));
        this.totalResults.set(response.total_results);
        this.loading.set(false);
      },
      error: (error) => {
        if (version !== this.requestVersion) return;

        console.error('Error al cargar recomendaciones:', error);
        this.recommendations.set([]);
        this.totalPages.set(1);
        this.totalResults.set(0);
        this.errorMessage.set('No se pudieron cargar las recomendaciones. Inténtalo nuevamente.');
        this.loading.set(false);
      },
    });
  }

  changeMediaType(type: FilterType): void {
    if (type !== 'movie' && type !== 'tv') return;
    if (this.mediaType() === type) return;

    this.requestVersion++;
    this.mediaType.set(type);
    this.selectedId.set(null);
    this.recommendations.set([]);
    this.currentPage.set(1);
    this.totalPages.set(1);

    this.loadPopularMedia();
  }

onSourceChange(value: string): void {
  const id = Number(value);

  if (!Number.isFinite(id) || id <= 0) return;

  this.selectedId.set(id);
  this.currentPage.set(1);
  this.loadRecommendations();
}
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || this.loading()) {
      return;
    }

    this.currentPage.set(page);
    this.loadRecommendations();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  getImageUrl(path: string | null): string {
    return this.recommendationService.getImageUrl(path);
  }

  getMediaTitle(item: RecommendationMedia): string {
    return item.title || item.name || 'Sin título';
  }

  getMediaDate(item: RecommendationMedia): string {
    return item.release_date || item.first_air_date || '';
  }

  getMediaRoute(item: RecommendationMedia): string[] {
    return this.mediaType() === 'movie'
      ? ['/movies', String(item.id)]
      : ['/series', String(item.id)];
  }

  getSelectedTitle(): string {
    const selected = this.popularMedia().find((item) => item.id === this.selectedId());

    return selected ? this.getMediaTitle(selected) : '';
  }
}
