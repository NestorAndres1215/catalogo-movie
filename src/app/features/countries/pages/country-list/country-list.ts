import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { RouterLink } from '@angular/router';

import { Country } from '../../../../core/models/country.interface';
import { CountryService } from '../../../../core/service/country.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { SearchComponent } from '../../../../shared/components/search/search';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    PageLoadingComponent,
    PaginationComponent,
    SearchComponent,
    ResultsHeaderComponent
],
  templateUrl: './country-list.html',
  styleUrl: './country-list.css',
})
export class CountryListComponent implements OnInit {
  private readonly countryService = inject(CountryService);

  countries = signal<Country[]>([]);

  loading = signal<boolean>(true);

  errorMessage = signal<string>('');

  searchQuery = signal<string>('');

  currentPage = signal<number>(1);

  readonly pageSize = 20;

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

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredCountries().length / this.pageSize));
  });

  paginatedCountries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;

    return this.filteredCountries().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.loadCountries();
  }

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

  onSearch(value: string): void {
    this.searchQuery.set(value.trim());
    this.currentPage.set(1);
    this.loadCountries();
  }

  clearSearch(): void {
    this.searchQuery.set('');

    this.currentPage.set(1);
  }

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
