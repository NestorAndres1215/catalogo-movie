import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  Country,
  CountryMedia
} from '../../../../core/models/country.interface';

import {
  CountryService
} from '../../../../core/service/country.service';

type CountryMediaType = 'movie' | 'tv';

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './country-detail.html',
  styleUrl: './country-detail.css'
})
export class CountryDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly countryService = inject(CountryService);

  // =========================================
  // ESTADOS
  // =========================================

  country = signal<Country | null>(null);

  media = signal<CountryMedia[]>([]);

  selectedType = signal<CountryMediaType>('movie');

  loading = signal<boolean>(true);

  errorMessage = signal<string>('');

  currentPage = signal<number>(1);

  totalPages = signal<number>(1);

  totalResults = signal<number>(0);

  private countryCode = '';

  private requestVersion = 0;

  // =========================================
  // INICIALIZACIÓN
  // =========================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const code = params.get('code');

      if (!code || !/^[a-z]{2}$/i.test(code)) {

        this.errorMessage.set(
          'El código del país no es válido.'
        );

        this.loading.set(false);

        return;
      }

      this.countryCode = code.toUpperCase();

      this.selectedType.set('movie');

      this.currentPage.set(1);

      this.country.set(null);

      this.loadCountry();

      this.loadMedia();
    });
  }

  // =========================================
  // CARGAR INFORMACIÓN DEL PAÍS
  // =========================================

  loadCountry(): void {

    this.countryService.getCountries().subscribe({

      next: countries => {

        const selectedCountry = countries.find(
          item =>
            item.iso_3166_1.toUpperCase() === this.countryCode
        );

        if (!selectedCountry) {

          this.errorMessage.set(
            'No se encontró información para este país.'
          );

          return;
        }

        this.country.set(selectedCountry);
      },

      error: error => {

        console.error(
          'Error cargando información del país:',
          error
        );

      }

    });
  }

  // =========================================
  // CARGAR PELÍCULAS O SERIES
  // =========================================

  loadMedia(): void {

    const version = ++this.requestVersion;

    this.loading.set(true);

    this.errorMessage.set('');

    this.media.set([]);

    const request = this.selectedType() === 'movie'
      ? this.countryService.getMoviesByCountry(
          this.countryCode,
          this.currentPage()
        )
      : this.countryService.getSeriesByCountry(
          this.countryCode,
          this.currentPage()
        );

    request.subscribe({

      next: response => {

        if (version !== this.requestVersion) {
          return;
        }

        this.media.set(response.results);

        this.totalPages.set(
          Math.max(1, Math.min(response.total_pages, 500))
        );

        this.totalResults.set(response.total_results);

        this.loading.set(false);
      },

      error: error => {

        if (version !== this.requestVersion) {
          return;
        }

        console.error(
          'Error cargando contenido del país:',
          error
        );

        this.errorMessage.set(
          'No se pudo cargar el contenido de este país.'
        );

        this.loading.set(false);
      }

    });
  }

  // =========================================
  // CAMBIAR ENTRE PELÍCULAS Y SERIES
  // =========================================

  changeType(type: CountryMediaType): void {

    if (this.selectedType() === type) {
      return;
    }

    this.selectedType.set(type);

    this.currentPage.set(1);

    this.loadMedia();
  }

  // =========================================
  // CAMBIAR PÁGINA
  // =========================================

  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages() ||
      this.loading()
    ) {
      return;
    }

    this.currentPage.set(page);

    this.loadMedia();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // =========================================
  // IMÁGENES
  // =========================================

  getPoster(path: string | null): string {

    return this.countryService.getImageUrl(
      path,
      'w500'
    );
  }

  // =========================================
  // TÍTULO
  // =========================================

  getMediaTitle(item: CountryMedia): string {

    return item.title ?? item.name ?? 'Sin título';
  }

  // =========================================
  // FECHA
  // =========================================

  getMediaDate(item: CountryMedia): string {

    const date = this.selectedType() === 'movie'
      ? item.release_date
      : item.first_air_date;

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
      day: 'numeric'
    });
  }

  // =========================================
  // RUTA DEL CONTENIDO
  // =========================================

  getMediaRoute(item: CountryMedia): string[] {

    return this.selectedType() === 'movie'
      ? ['/movies', String(item.id)]
      : ['/series', String(item.id)];
  }

  // =========================================
  // BANDERA
  // =========================================

  getFlag(): string {

    if (!/^[A-Z]{2}$/i.test(this.countryCode)) {
      return '🌍';
    }

    return this.countryCode
      .split('')
      .map(char =>
        String.fromCodePoint(
          127397 + char.charCodeAt(0)
        )
      )
      .join('');
  }

}