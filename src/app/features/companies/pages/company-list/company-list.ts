
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  Company,
  CompanyResponse
} from '../../../../core/models/company.interface';

import { CompanyService } from '../../../../core/service/company.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, PageLoadingComponent, EmptyStateComponent],
  templateUrl: './company-list.html',
  styleUrl: './company-list.css'
})
export class CompanyListComponent implements OnInit {

  private readonly companyService = inject(CompanyService);

  // =========================================
  // ESTADOS
  // =========================================

  readonly companies = signal<Company[]>([]);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly searchQuery = signal<string>('');

  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly totalResults = signal<number>(0);

  private requestVersion = 0;

  // =========================================
  // PRODUCTORAS PARA DESCUBRIR
  // =========================================

  readonly popularSearches = [
    'Marvel Studios',
    'Warner Bros. Pictures',
    'Universal Pictures',
    'Pixar',
    'Walt Disney Pictures',
    'Paramount Pictures',
    'Columbia Pictures',
    'New Line Cinema',
    'Lionsgate',
    'Legendary Pictures',
    '20th Century Studios',
    'DreamWorks Pictures',
    'Metro-Goldwyn-Mayer',
    'Sony Pictures'
  ];

  ngOnInit(): void {
    this.loadRandomCompanies();
  }

  // =========================================
  // PRODUCTORAS ALEATORIAS
  // =========================================

  loadRandomCompanies(): void {

    const version = ++this.requestVersion;

    const randomNames = this.shuffleArray(
      this.popularSearches
    ).slice(0, 6);

    this.searchQuery.set('');
    this.currentPage.set(1);
    this.totalPages.set(1);
    this.totalResults.set(0);

    this.companies.set([]);
    this.errorMessage.set('');
    this.loading.set(true);

    forkJoin(
      randomNames.map(name =>
        this.companyService.searchCompanies(name, 1).pipe(
          map((response: CompanyResponse) =>
            response.results[0] ?? null
          ),
          catchError(() => of(null))
        )
      )
    ).subscribe({

      next: (results) => {

        if (version !== this.requestVersion) {
          return;
        }

        const uniqueCompanies = new Map<number, Company>();

        results.forEach(company => {
          if (company) {
            uniqueCompanies.set(company.id, company);
          }
        });

        const companies = Array.from(
          uniqueCompanies.values()
        );

        this.companies.set(companies);
        this.totalResults.set(companies.length);

        if (companies.length === 0) {
          this.errorMessage.set(
            'No se pudieron cargar las productoras. Inténtalo nuevamente.'
          );
        }

        this.loading.set(false);
      },

      error: (error: unknown) => {

        if (version !== this.requestVersion) {
          return;
        }

        console.error(
          'Error cargando productoras aleatorias:',
          error
        );

        this.errorMessage.set(
          'No se pudieron cargar las productoras. Verifica tu conexión.'
        );

        this.loading.set(false);
      }

    });
  }

  // =========================================
  // MEZCLAR PRODUCTORAS
  // =========================================

  private shuffleArray<T>(items: readonly T[]): T[] {

    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {

      const randomIndex = Math.floor(
        Math.random() * (i + 1)
      );

      [shuffled[i], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[i]
      ];
    }

    return shuffled;
  }

  // =========================================
  // BÚSQUEDA
  // =========================================

  onSearchInput(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.searchQuery.set(input.value);
  }

  searchCompanies(query: string, page: number = 1): void {

    const search = query.trim();

    if (!search) {
      this.loadRandomCompanies();
      return;
    }

    const version = ++this.requestVersion;

    this.searchQuery.set(search);
    this.currentPage.set(page);

    this.loading.set(true);
    this.errorMessage.set('');

    this.companyService
      .searchCompanies(search, page)
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

        error: (error: unknown) => {

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
  // LIMPIAR BÚSQUEDA
  // =========================================

  clearSearch(): void {

    this.loadRandomCompanies();
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
