import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { CatalogService } from '../../../../core/service/catalog.service';
import {
  CatalogMedia,
  StreamingProvider
} from '../../../../core/models/catalog.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-streaming-list',
  standalone: true,
  imports: [DecimalPipe, PageHeaderComponent],
  templateUrl: './streaming-list.html',
  styleUrl: './streaming-list.css'
})
export class StreamingListComponent {

  private readonly catalogService = inject(CatalogService);

  readonly mediaType = signal<'movie' | 'tv'>('movie');

  readonly providers = signal<StreamingProvider[]>([]);
  readonly contents = signal<CatalogMedia[]>([]);

  readonly selectedProvider = signal<number | null>(null);

  readonly loadingProviders = signal(false);
  readonly loadingContents = signal(false);

  readonly errorMessage = signal('');

  private requestVersion = 0;

  constructor() {
    this.loadProviders();
  }

  loadProviders(): void {
    this.loadingProviders.set(true);
    this.loadingContents.set(false);

    this.errorMessage.set('');
    this.providers.set([]);
    this.contents.set([]);
    this.selectedProvider.set(null);

    const currentVersion = ++this.requestVersion;

    this.catalogService
      .getStreamingProviders(this.mediaType(), 'PE')
      .subscribe({
        next: response => {
          if (currentVersion !== this.requestVersion) return;

          const providers = [...response.results].sort(
            (a, b) => a.display_priority - b.display_priority
          );

          this.providers.set(providers);
          this.loadingProviders.set(false);

          if (providers.length > 0) {
            this.selectProvider(providers[0].provider_id);
          }
        },
        error: () => {
          if (currentVersion !== this.requestVersion) return;

          this.loadingProviders.set(false);
          this.errorMessage.set(
            'No se pudieron cargar las plataformas de streaming.'
          );
        }
      });
  }

  selectProvider(providerId: number): void {
    this.selectedProvider.set(providerId);
    this.contents.set([]);

    this.loadingContents.set(true);
    this.errorMessage.set('');

    const currentVersion = ++this.requestVersion;

    this.catalogService
      .getContentByProvider(
        this.mediaType(),
        providerId,
        'PE',
        1
      )
      .subscribe({
        next: response => {
          if (currentVersion !== this.requestVersion) return;

          this.contents.set(response.results);
          this.loadingContents.set(false);
        },
        error: () => {
          if (currentVersion !== this.requestVersion) return;

          this.loadingContents.set(false);
          this.errorMessage.set(
            'No se pudo cargar el contenido de esta plataforma.'
          );
        }
      });
  }

  changeMediaType(type: 'movie' | 'tv'): void {
    if (this.mediaType() === type) return;

    this.mediaType.set(type);
    this.loadProviders();
  }

  getProviderLogo(path: string): string {
    return this.catalogService.getImageUrl(path, 'w185');
  }

  getPoster(path: string | null): string {
    return this.catalogService.getImageUrl(path, 'w500');
  }

  getMediaTitle(media: CatalogMedia): string {
    return media.title || media.name || 'Sin título';
  }

  getReleaseDate(media: CatalogMedia): string {
    return media.release_date || media.first_air_date || 'Fecha no disponible';
  }
  @ViewChild('providersCarousel')
providersCarousel?: ElementRef<HTMLDivElement>;

scrollProviders(direction: 'left' | 'right'): void {
  const carousel = this.providersCarousel?.nativeElement;

  if (!carousel) {
    return;
  }

  const scrollAmount = 350;

  carousel.scrollBy({
    left: direction === 'right' ? scrollAmount : -scrollAmount,
    behavior: 'smooth'
  });
}
}