import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { Country, CountryMedia } from '../../../../core/models/country.interface';

import { CountryService } from '../../../../core/service/country.service';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import {
  FilterTab,
  FilterTabsComponent,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { MediaCardComponent } from '../../../../shared/components/media-card/media-card';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import {
  FilterOption,
  SelectFilterComponent,
} from '../../../../shared/components/select-filter/select-filter';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';

type CountryMediaType = 'movie' | 'tv';

type CountrySortOption = 'rating-desc' | 'rating-asc' | 'date-desc' | 'date-asc';

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [
    PageLoadingComponent,
    FilterTabsComponent,
    PaginationComponent,
    MediaCardComponent,
    EmptyStateComponent,
    SelectFilterComponent,
    ErrorStateComponent,
    ResultsHeaderComponent,
  ],
  templateUrl: './country-detail.html',
  styleUrl: './country-detail.css',
})
export class CountryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly countryService = inject(CountryService);

  readonly country = signal<Country | null>(null);

  readonly media = signal<CountryMedia[]>([]);

  readonly selectedType = signal<CountryMediaType>('movie');

  readonly selectedSort = signal<CountrySortOption>('rating-desc');

  readonly loading = signal<boolean>(true);

  readonly errorMessage = signal<string>('');

  readonly currentPage = signal<number>(1);

  readonly totalPages = signal<number>(1);

  readonly totalResults = signal<number>(0);

  // Si la imagen de la bandera falla, se usa el emoji.
  readonly flagFailed = signal<boolean>(false);

  private countryCode = '';

  private requestVersion = 0;

  readonly mediaTabs: FilterTab[] = [
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];

  readonly sortedMedia = computed(() => {
    const items = [...this.media()];

    const getDate = (item: CountryMedia): string => {
      return this.selectedType() === 'movie'
        ? (item.release_date ?? '')
        : (item.first_air_date ?? '');
    };

    switch (this.selectedSort()) {
      // Mejor valoración
      case 'rating-desc':
        return items.sort((a, b) => b.vote_average - a.vote_average);

      // Peor valoración
      case 'rating-asc':
        return items.sort((a, b) => a.vote_average - b.vote_average);

      // Más recientes
      case 'date-desc':
        return items.sort((a, b) => {
          const dateA = getDate(a);
          const dateB = getDate(b);

          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;

          return dateB.localeCompare(dateA);
        });

      // Más antiguas
      case 'date-asc':
        return items.sort((a, b) => {
          const dateA = getDate(a);
          const dateB = getDate(b);

          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;

          return dateA.localeCompare(dateB);
        });
    }
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code');

      if (!code || !/^[a-z]{2}$/i.test(code)) {
        this.country.set(null);

        this.errorMessage.set('El código del país no es válido.');

        this.loading.set(false);

        return;
      }

      this.countryCode = code.toUpperCase();

      this.selectedType.set('movie');

      this.selectedSort.set('rating-desc');

      this.currentPage.set(1);

      this.country.set(null);

      this.media.set([]);

      this.errorMessage.set('');

      // Reintenta cargar la bandera al cambiar de país
      this.flagFailed.set(false);

      this.loadCountry();

      this.loadMedia();
    });
  }

  loadCountry(): void {
    const code = this.countryCode;

    this.countryService.getCountries().subscribe({
      next: (countries) => {
        if (code !== this.countryCode) {
          return;
        }

        const selectedCountry = countries.find((item) => item.iso_3166_1.toUpperCase() === code);

        if (!selectedCountry) {
          this.errorMessage.set('No se encontró información para este país.');

          return;
        }

        this.country.set(selectedCountry);
      },

      error: (error) => {
        console.error('Error cargando información del país:', error);

        if (code === this.countryCode) {
          this.errorMessage.set('No se pudo cargar la información del país.');
        }
      },
    });
  }

  loadMedia(): void {
    const version = ++this.requestVersion;

    this.loading.set(true);

    this.errorMessage.set('');

    this.media.set([]);

    const request =
      this.selectedType() === 'movie'
        ? this.countryService.getMoviesByCountry(this.countryCode, this.currentPage())
        : this.countryService.getSeriesByCountry(this.countryCode, this.currentPage());

    request.subscribe({
      next: (response) => {
        if (version !== this.requestVersion) {
          return;
        }

        this.media.set(response.results);

        this.totalPages.set(Math.max(1, Math.min(response.total_pages, 500)));

        this.totalResults.set(response.total_results);

        this.loading.set(false);
      },

      error: (error) => {
        if (version !== this.requestVersion) {
          return;
        }

        console.error('Error cargando contenido del país:', error);

        this.errorMessage.set('No se pudo cargar el contenido de este país.');

        this.loading.set(false);
      },
    });
  }

  changeType(type: FilterType): void {
    if (type !== 'movie' && type !== 'tv') {
      return;
    }

    if (this.selectedType() === type || this.loading()) {
      return;
    }

    this.selectedType.set(type);
    this.currentPage.set(1);
    this.loadMedia();
  }

  readonly sortOptions: FilterOption[] = [
    { label: 'Mejor valoración', value: 'rating-desc' },
    { label: 'Peor valoración', value: 'rating-asc' },
    { label: 'Más recientes', value: 'date-desc' },
    { label: 'Más antiguas', value: 'date-asc' },
  ];

  onSortChange(value: string): void {
    if (
      value === 'rating-desc' ||
      value === 'rating-asc' ||
      value === 'date-desc' ||
      value === 'date-asc'
    ) {
      this.selectedSort.set(value);
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || this.loading()) {
      return;
    }

    this.currentPage.set(page);

    this.loadMedia();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  getPoster(path: string | null): string {
    return this.countryService.getImageUrl(path, 'w500');
  }

  getMediaTitle(item: CountryMedia): string {
    return item.title ?? item.name ?? 'Sin título';
  }

  getMediaDate(item: CountryMedia): string {
    const date = this.selectedType() === 'movie' ? item.release_date : item.first_air_date;

    if (!date) {
      return 'Fecha no disponible';
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Fecha no disponible';
    }

    return parsedDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getMediaRoute(item: CountryMedia): string[] {
    return this.selectedType() === 'movie'
      ? ['/movies', String(item.id)]
      : ['/series', String(item.id)];
  }

  getFlagUrl(): string {
    return `https://flagcdn.com/${this.countryCode.toLowerCase()}.svg`;
  }

  getFlag(): string {
    if (!/^[A-Z]{2}$/i.test(this.countryCode)) {
      return '🌍';
    }

    return this.countryCode
      .split('')
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join('');
  }
}
