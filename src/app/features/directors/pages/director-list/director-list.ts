import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { firstValueFrom, from, of, mergeMap, map, toArray, catchError } from 'rxjs';

import { Person, PersonFilters } from '../../../../core/models/person.interface';
import { PersonService } from '../../../../core/service/person.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import {
  FilterOption,
  SelectFilterComponent,
} from '../../../../shared/components/select-filter/select-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-director-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    PageHeaderComponent,
    PageLoadingComponent,
    EmptyStateComponent,
    SelectFilterComponent,
    PaginationComponent
],
  templateUrl: './director-list.html',
  styleUrl: './director-list.css',
})
export class DirectorListComponent implements OnInit {
  private readonly personService = inject(PersonService);

  directors = signal<Person[]>([]);
  allDirectors = signal<Person[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  readonly pageSize = 20;

  filters = signal<PersonFilters>({
    department: 'Directing',
    sortBy: 'popularity.desc',
  });

  private nextTmdbPage = 1;
  private tmdbTotalPages = 1;
  private isLoadingMore = false;
  private requestVersion = 0;

  ngOnInit(): void {
    this.loadDirectors();
  }

  async loadDirectors(): Promise<void> {
    if (this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;

    const currentVersion = this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const requiredDirectors = this.currentPage() * this.pageSize;

      while (
        this.allDirectors().length < requiredDirectors &&
        this.nextTmdbPage <= this.tmdbTotalPages
      ) {
        const query = this.searchQuery().trim();

        const response = await firstValueFrom(
          query
            ? this.personService.searchPeople(query, this.nextTmdbPage)
            : this.personService.getPopularPeople(this.nextTmdbPage),
        );

        if (currentVersion !== this.requestVersion) {
          return;
        }

        this.tmdbTotalPages = Math.min(response.total_pages, 500);

        this.nextTmdbPage++;

        const verifiedDirectors = await firstValueFrom(
          from(response.results).pipe(
            mergeMap(
              (person) =>
                this.personService.getPersonCredits(person.id).pipe(
                  map((credits) => {
                    const isDirector = credits.crew.some(
                      (credit) => credit.department === 'Directing' && credit.job === 'Director',
                    );

                    return isDirector ? person : null;
                  }),

                  catchError(() => of(null)),
                ),
              5,
            ),

            toArray(),
          ),
        );

        if (currentVersion !== this.requestVersion) {
          return;
        }

        const validDirectors = verifiedDirectors.filter(
          (person): person is Person => person !== null,
        );

        const existingIds = new Set(this.allDirectors().map((person) => person.id));

        const newDirectors = validDirectors.filter((person) => !existingIds.has(person.id));

        this.allDirectors.update((current) => [...current, ...newDirectors]);
      }

      if (currentVersion === this.requestVersion) {
        this.applyPagination();
      }
    } catch (error) {
      console.error('Error cargando directores:', error);

      if (currentVersion === this.requestVersion) {
        this.errorMessage.set(
          'No se pudieron cargar los directores. Verifica tu conexión y API Key.',
        );
      }
    } finally {
      if (currentVersion === this.requestVersion) {
        this.loading.set(false);
      }

      this.isLoadingMore = false;
    }
  }

  readonly sortOptions: FilterOption[] = [
    { label: 'Más populares', value: 'popularity.desc' },
    { label: 'Menos populares', value: 'popularity.asc' },
    { label: 'Nombre A - Z', value: 'name.asc' },
    { label: 'Nombre Z - A', value: 'name.desc' },
  ];

  applyPagination(): void {
    let results = [...this.allDirectors()];

    switch (this.filters().sortBy) {
      case 'popularity.asc':
        results.sort((a, b) => a.popularity - b.popularity);

        break;

      case 'name.asc':
        results.sort((a, b) => a.name.localeCompare(b.name));

        break;

      case 'name.desc':
        results.sort((a, b) => b.name.localeCompare(a.name));

        break;

      default:
        results.sort((a, b) => b.popularity - a.popularity);
    }

    const start = (this.currentPage() - 1) * this.pageSize;

    const end = start + this.pageSize;

    this.directors.set(results.slice(start, end));

    const hasMore = this.nextTmdbPage <= this.tmdbTotalPages;
    const pagesWithResults = Math.ceil(results.length / this.pageSize);

    this.totalPages.set(Math.max(1, pagesWithResults + (hasMore ? 1 : 0)));
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || this.loading()) {
      return;
    }

    this.currentPage.set(page);
    this.loadDirectors();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchQuery.set(input.value.trim());

    this.resetDirectors();
  }

  clearSearch(): void {
    this.searchQuery.set('');

    this.resetDirectors();
  }

  resetDirectors(): void {
    this.requestVersion++;

    this.allDirectors.set([]);
    this.directors.set([]);

    this.currentPage.set(1);
    this.totalPages.set(1);

    this.nextTmdbPage = 1;
    this.tmdbTotalPages = 1;

    this.loadDirectors();
  }

  onSortChange(value: string): void {
    this.filters.update((current) => ({
      ...current,
      sortBy: value,
    }));

    this.applyPagination();
  }

  getProfile(path: string | null): string {
    return this.personService.getImageUrl(path, 'w500');
  }

  getKnownFor(person: Person): string {
    const titles = person.known_for
      ?.map((item) => item.title ?? item.name)
      .filter((title): title is string => Boolean(title))
      .slice(0, 2);

    return titles?.join(', ') || 'Sin información disponible';
  }
}
