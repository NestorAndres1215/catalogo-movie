import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { RouterLink } from '@angular/router';

import { Country } from '../../../../core/models/country.interface';
import { CountryService } from '../../../../core/service/country.service';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './country-list.html',
  styleUrl: './country-list.css',
})
export class CountryListComponent implements OnInit {
  private readonly countryService = inject(CountryService);

  // =========================================
  // ESTADOS
  // =========================================

  countries = signal<Country[]>([]);

  loading = signal<boolean>(true);

  errorMessage = signal<string>('');

  searchQuery = signal<string>('');

  currentPage = signal<number>(1);

  readonly pageSize = 20;

  // =========================================
  // FILTRAR PAÍSES
  // =========================================

  filteredCountries = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase();

    const results = [...this.countries()];

    if (!query) {
      return results;
    }

    return results.filter(
      (country) =>
        country.english_name.toLocaleLowerCase().includes(query) ||
        country.native_name.toLocaleLowerCase().includes(query) ||
        country.iso_3166_1.toLocaleLowerCase().includes(query),
    );
  });

  // =========================================
  // PAGINACIÓN
  // =========================================

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredCountries().length / this.pageSize));
  });

  paginatedCountries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;

    return this.filteredCountries().slice(start, start + this.pageSize);
  });

  // =========================================
  // INICIALIZACIÓN
  // =========================================

  ngOnInit(): void {
    this.loadCountries();
  }

  // =========================================
  // CARGAR PAÍSES
  // =========================================

  loadCountries(): void {
    this.loading.set(true);

    this.errorMessage.set('');

    this.countryService.getCountries().subscribe({
      next: (response) => {
        this.countries.set(
          [...response].sort((a, b) => a.english_name.localeCompare(b.english_name, 'es')),
        );

        this.currentPage.set(1);

        this.loading.set(false);
      },

      error: (error) => {
        console.error('Error cargando países:', error);

        this.errorMessage.set('No se pudieron cargar los países. Verifica tu conexión y API Key.');

        this.loading.set(false);
      },
    });
  }

  // =========================================
  // BUSCAR
  // =========================================

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchQuery.set(input.value);

    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery.set('');

    this.currentPage.set(1);
  }

  // =========================================
  // CAMBIAR PÁGINA
  // =========================================

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // =========================================
  // BANDERAS
  // =========================================

  getFlag(countryCode: string): string {
    if (!/^[A-Z]{2}$/i.test(countryCode)) {
      return '🌍';
    }

    return countryCode
      .toUpperCase()
      .split('')
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join('');
  }
}
