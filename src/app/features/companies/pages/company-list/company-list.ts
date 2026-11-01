import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';

import {
  Company,
  CompanyResponse
} from '../../../../core/models/company.interface';

import { CompanyService } from '../../../../core/service/company.service';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './company-list.html',
  styleUrl: './company-list.css'
})
export class CompanyListComponent implements OnInit {

  private readonly companyService = inject(CompanyService);

  // =========================================
  // ESTADOS
  // =========================================

  companies = signal<Company[]>([]);

  loading = signal<boolean>(false);

  errorMessage = signal<string>('');

  searchQuery = signal<string>('');

  currentPage = signal<number>(1);

  totalPages = signal<number>(1);

  totalResults = signal<number>(0);

  private requestVersion = 0;

  // Búsquedas rápidas.
  readonly popularSearches = [
    'Marvel Studios',
    'Warner Bros.',
    'Universal Pictures',
    'Pixar',
    'Walt Disney Pictures',
    'Paramount Pictures'
  ];

  ngOnInit(): void {
    // TMDB no ofrece un endpoint de productoras populares.
    // El usuario puede iniciar una búsqueda desde aquí.
  }

  // =========================================
  // BUSCAR PRODUCTORAS
  // =========================================

  onSearch(event: Event): void {

    const input = event.target as HTMLInputElement;

    const query = input.value.trim();

    this.searchCompanies(query);
  }

  searchCompanies(query: string, page: number = 1): void {

    if (!query.trim()) {

      this.companies.set([]);
      this.searchQuery.set('');
      this.currentPage.set(1);
      this.totalPages.set(1);
      this.totalResults.set(0);
      this.errorMessage.set('');

      return;
    }

    const version = ++this.requestVersion;

    this.searchQuery.set(query);
    this.currentPage.set(page);

    this.loading.set(true);
    this.errorMessage.set('');

    this.companyService
      .searchCompanies(query, page)
      .subscribe({

        next: (response: CompanyResponse) => {

          if (version !== this.requestVersion) {
            return;
          }

          this.companies.set(response.results);

          this.currentPage.set(response.page);

          this.totalPages.set(
            Math.max(1, response.total_pages)
          );

          this.totalResults.set(
            response.total_results
          );

          this.loading.set(false);
        },

        error: (error) => {

          if (version !== this.requestVersion) {
            return;
          }

          console.error(
            'Error buscando productoras:',
            error
          );

          this.companies.set([]);

          this.errorMessage.set(
            'No se pudieron cargar las productoras. Verifica tu conexión y API Key.'
          );

          this.loading.set(false);
        }

      });
  }

  // =========================================
  // BÚSQUEDAS RÁPIDAS
  // =========================================

  searchPopularCompany(name: string): void {

    this.searchCompanies(name);
  }

  // =========================================
  // PAGINACIÓN
  // =========================================

  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages() ||
      this.loading()
    ) {
      return;
    }

    this.searchCompanies(
      this.searchQuery(),
      page
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // =========================================
  // IMÁGENES
  // =========================================

  getLogo(path: string | null): string {

    return this.companyService.getLogoUrl(
      path,
      'w500'
    );
  }

}