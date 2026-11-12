import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../../../../core/service/catalog.service';
import { StreamingProvider } from '../../../../core/models/catalog.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import {
  FilterTab,
  FilterTabsComponent,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-streaming-list',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    FilterTabsComponent,
    PageLoadingComponent,
    EmptyStateComponent,
    ResultsHeaderComponent,
    PaginationComponent,
  ],
  templateUrl: './streaming-list.html',
  styleUrl: './streaming-list.css',
})
export class StreamingListComponent {
  private readonly catalogService = inject(CatalogService);

  private readonly pageSize = 12;
  private requestVersion = 0;

  readonly mediaType = signal<'movie' | 'tv'>('movie');
  readonly providers = signal<StreamingProvider[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly currentPage = signal(1);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.providers().length / this.pageSize)),
  );

  // Plataformas de la página actual (la API las entrega todas juntas).
  readonly pagedProviders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.providers().slice(start, start + this.pageSize);
  });

  readonly mediaTabs: FilterTab[] = [
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];

  constructor() {
    this.loadProviders();
  }

  loadProviders(): void {
    const currentVersion = ++this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');
    this.providers.set([]);
    this.currentPage.set(1);

    this.catalogService.getStreamingProviders(this.mediaType(), 'PE').subscribe({
      next: (response) => {
        if (currentVersion !== this.requestVersion) return;

        this.providers.set(
          [...response.results].sort((a, b) => a.display_priority - b.display_priority),
        );
        this.loading.set(false);
      },
      error: () => {
        if (currentVersion !== this.requestVersion) return;

        this.loading.set(false);
        this.errorMessage.set('No se pudieron cargar las plataformas de streaming.');
      },
    });
  }

  changeMediaType(type: FilterType): void {
    if ((type !== 'movie' && type !== 'tv') || this.mediaType() === type) return;

    this.mediaType.set(type);
    this.loadProviders();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getProviderLogo(path: string): string {
    return this.catalogService.getImageUrl(path, 'w185');
  }

    readonly bannerImage = '/images/banners/streaming.jpg';
}