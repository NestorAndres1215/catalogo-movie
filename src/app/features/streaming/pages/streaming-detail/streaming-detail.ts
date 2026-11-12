import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';

import { CatalogService } from '../../../../core/service/catalog.service';
import { CatalogMedia, StreamingProvider } from '../../../../core/models/catalog.interface';
import {
  FilterTab,
  FilterTabsComponent,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { MediaCardComponent } from '../../../../shared/components/media-card/media-card';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-streaming-detail',
  standalone: true,
  imports: [
    
    FilterTabsComponent,
    PageLoadingComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    ResultsHeaderComponent,
    MediaCardComponent,
    PaginationComponent,
  ],
  templateUrl: './streaming-detail.html',
  styleUrl: './streaming-detail.css',
})
export class StreamingDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);

  // TMDB limita la paginación a 500 páginas.
  private readonly maxPages = 500;
  private requestVersion = 0;
  private providerId = 0;

  readonly mediaType = signal<'movie' | 'tv'>('movie');
  readonly provider = signal<StreamingProvider | null>(null);
  readonly contents = signal<CatalogMedia[]>([]);
  readonly heroBackdrop = signal<string | null>(null);

  readonly currentPage = signal(1);
  readonly totalPages = signal(1);

  readonly loadingProvider = signal(true);
  readonly loadingContents = signal(false);
  readonly errorMessage = signal('');

  readonly mediaTabs: FilterTab[] = [
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];

  readonly heroImage = computed(() => {
    const path = this.heroBackdrop();
    return path ? `url(${this.catalogService.getImageUrl(path, 'original')})` : 'none';
  });

  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed())
      .subscribe(([params, query]) => {
        const id = Number(params.get('id'));

        if (!Number.isInteger(id) || id <= 0) {
          this.errorMessage.set('El identificador de la plataforma no es válido.');
          this.loadingProvider.set(false);
          return;
        }

        this.providerId = id;
        this.mediaType.set(query.get('type') === 'tv' ? 'tv' : 'movie');
        this.loadProvider();
      });
  }

  private loadProvider(): void {
    const currentVersion = ++this.requestVersion;

    this.loadingProvider.set(true);
    this.errorMessage.set('');
    this.provider.set(null);
    this.contents.set([]);
    this.heroBackdrop.set(null);
    this.currentPage.set(1);
    this.totalPages.set(1);

    this.catalogService.getStreamingProviders(this.mediaType(), 'PE').subscribe({
      next: (response) => {
        if (currentVersion !== this.requestVersion) return;

        const found = response.results.find((p) => p.provider_id === this.providerId);

        this.loadingProvider.set(false);

        if (!found) {
          this.errorMessage.set('Esta plataforma no tiene catálogo para este tipo de contenido.');
          return;
        }

        this.provider.set(found);
        this.loadContents(1, true);
      },
      error: () => {
        if (currentVersion !== this.requestVersion) return;

        this.loadingProvider.set(false);
        this.errorMessage.set('No se pudo cargar la información de la plataforma.');
      },
    });
  }

  private loadContents(page: number, setHero = false): void {
    const currentVersion = ++this.requestVersion;

    this.loadingContents.set(true);
    this.currentPage.set(page);

    this.catalogService
      .getContentByProvider(this.mediaType(), this.providerId, 'PE', page)
      .subscribe({
        next: (response) => {
          if (currentVersion !== this.requestVersion) return;

          this.contents.set(response.results);
          this.totalPages.set(Math.min(response.total_pages || 1, this.maxPages));
          this.loadingContents.set(false);

          if (setHero) {
            const withBackdrop = response.results.find((m) => m.backdrop_path);
            this.heroBackdrop.set(withBackdrop?.backdrop_path ?? null);
          }
        },
        error: () => {
          if (currentVersion !== this.requestVersion) return;

          this.loadingContents.set(false);
          this.errorMessage.set('No se pudo cargar el contenido de esta plataforma.');
        },
      });
  }

  changeMediaType(type: FilterType): void {
    if ((type !== 'movie' && type !== 'tv') || this.mediaType() === type) return;

    // Cambia la URL; la suscripción del constructor recarga todo.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type },
    });
  }

  changePage(page: number): void {
    this.loadContents(page);
    document
      .querySelector('.catalog-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  isUpcoming(date: string | null | undefined): boolean {
    if (!date) return false;

    const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    return date > todayString;
  }

  getProviderLogo(path: string): string {
    return this.catalogService.getImageUrl(path, 'w185');
  }
}