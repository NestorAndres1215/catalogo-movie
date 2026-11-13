import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CatalogService } from '../../../../core/service/catalog.service';
import {
  CatalogMedia,
  WatchProviderAvailability,
  WatchProviderRegion,
} from '../../../../core/models/catalog.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import {
  FilterTab,
  FilterTabsComponent,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { Footer } from '../../../../shared/components/footer/footer';
import { SearchComponent } from '../../../../shared/components/search/search';

@Component({
  selector: 'app-platform-comparison',
  standalone: true,
  imports: [
    DecimalPipe,
    PageHeaderComponent,
    FilterTabsComponent,
   
    EmptyStateComponent,
    Footer,
    SearchComponent,
  ],
  templateUrl: './platform-comparison.html',
  styleUrl: './platform-comparison.css',
})
export class PlatformComparisonComponent {
  private readonly catalogService = inject(CatalogService);

  private searchVersion = 0;
  private providerVersion = 0;
    readonly bannerImage = '/images/banners/comparador.png';
  readonly mediaType = signal<'movie' | 'tv'>('movie');
  readonly searchQuery = signal('');
  readonly searchResults = signal<CatalogMedia[]>([]);
  readonly selectedMedia = signal<CatalogMedia | null>(null);

  readonly selectedRegion = signal<WatchProviderRegion | null>(null);

  readonly loadingSearch = signal(false);
  readonly loadingProviders = signal(false);
  readonly errorMessage = signal('');

  readonly regionCode = 'PE';
  readonly mediaTabs: FilterTab[] = [
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];
  setMediaType(type: FilterType): void {
    if (type !== 'movie' && type !== 'tv') {
      return;
    }

    if (this.mediaType() === type) {
      return;
    }
    this.mediaType.set(type);
    this.searchResults.set([]);
    this.selectedMedia.set(null);
    this.selectedRegion.set(null);
  }

  onSearchInput(query: string): void {
    this.searchQuery.set(query);
    this.searchMedia();
  }

  searchMedia(): void {
    const query = this.searchQuery().trim();

    if (!query) {
      this.searchResults.set([]);
      this.selectedMedia.set(null);
      this.selectedRegion.set(null);
      return;
    }

    const version = ++this.searchVersion;

    this.loadingSearch.set(true);
    this.errorMessage.set('');
    this.selectedMedia.set(null);
    this.selectedRegion.set(null);

    this.catalogService.searchMedia(this.mediaType(), query, 1).subscribe({
      next: (response) => {
        if (version !== this.searchVersion) {
          return;
        }

        this.searchResults.set(response.results);
        this.loadingSearch.set(false);

        if (response.results.length === 0) {
          this.errorMessage.set('No se encontraron resultados.');
        }
      },
      error: () => {
        if (version !== this.searchVersion) {
          return;
        }

        this.searchResults.set([]);
        this.loadingSearch.set(false);
        this.errorMessage.set('No se pudo realizar la búsqueda.');
      },
    });
  }

  selectMedia(media: CatalogMedia): void {
    this.selectedMedia.set(media);
    this.selectedRegion.set(null);

    const version = ++this.providerVersion;

    this.loadingProviders.set(true);
    this.errorMessage.set('');

    this.catalogService.getMediaWatchProviders(this.mediaType(), media.id).subscribe({
      next: (response) => {
        if (version !== this.providerVersion) {
          return;
        }

        const region = response.results[this.regionCode];

        this.selectedRegion.set(region ?? null);
        this.loadingProviders.set(false);

        if (!region || this.getTotalProviders(region) === 0) {
          this.errorMessage.set('No hay información de plataformas disponible para Perú.');
        }
      },
      error: () => {
        if (version !== this.providerVersion) {
          return;
        }

        this.selectedRegion.set(null);
        this.loadingProviders.set(false);
        this.errorMessage.set('No se pudo consultar la disponibilidad de plataformas.');
      },
    });
  }

  getProviders(
    category: 'flatrate' | 'rent' | 'buy' | 'free' | 'ads',
  ): WatchProviderAvailability[] {
    return this.selectedRegion()?.[category] ?? [];
  }

  getTotalProviders(region: WatchProviderRegion): number {
    return (
      (region.flatrate?.length ?? 0) +
      (region.rent?.length ?? 0) +
      (region.buy?.length ?? 0) +
      (region.free?.length ?? 0) +
      (region.ads?.length ?? 0)
    );
  }

  getImageUrl(path: string | null): string {
    return this.catalogService.getImageUrl(path, 'w500');
  }
  clearSearch(): void {
    this.searchVersion++;
    this.providerVersion++;

    this.searchQuery.set('');
    this.searchResults.set([]);
    this.selectedMedia.set(null);
    this.selectedRegion.set(null);

    this.loadingSearch.set(false);
    this.loadingProviders.set(false);
    this.errorMessage.set('');
  }
  getProviderLogo(path: string): string {
    return this.catalogService.getImageUrl(path, 'w92');
  }

  getTitle(media: CatalogMedia): string {
    return media.title ?? media.name ?? 'Sin título';
  }

  getReleaseDate(media: CatalogMedia): string {
    return media.release_date ?? media.first_air_date ?? 'Fecha desconocida';
  }
}
