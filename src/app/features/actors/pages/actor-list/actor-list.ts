import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Person, PersonFilters } from '../../../../core/models/person.interface';
import { ActorFiltersComponent } from '../actor-filters/actor-filters';
import { PersonService } from '../../../../core/service/person.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';


@Component({
  selector: 'app-actor-list',
  standalone: true,
  imports: [RouterLink, ActorFiltersComponent, PageHeaderComponent, PageLoadingComponent, EmptyStateComponent, PaginationComponent],
  templateUrl: './actor-list.html',
  styleUrl: './actor-list.css',
})
export class ActorListComponent implements OnInit {
  private readonly personService = inject(PersonService);

  actors = signal<Person[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  searchQuery = signal<string>('');

  filters = signal<PersonFilters>({
    department: '',
    sortBy: 'popularity.desc',
  });

  ngOnInit(): void {
    this.loadActors();
  }

  loadActors(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const query = this.searchQuery().trim();

    const request = query
      ? this.personService.searchPeople(query, this.currentPage())
      : this.personService.getPopularPeople(this.currentPage());

    request.subscribe({
      next: (response) => {
        let results = response.results;

        const department = this.filters().department;

        if (department) {
          results = results.filter((person) => person.known_for_department === department);
        }

        switch (this.filters().sortBy) {
          case 'popularity.asc':
            results = [...results].sort((a, b) => a.popularity - b.popularity);
            break;

          case 'name.asc':
            results = [...results].sort((a, b) => a.name.localeCompare(b.name));
            break;

          case 'name.desc':
            results = [...results].sort((a, b) => b.name.localeCompare(a.name));
            break;

          default:
            results = [...results].sort((a, b) => b.popularity - a.popularity);
        }

        this.actors.set(results);
        this.totalPages.set(Math.min(response.total_pages, 500));
        this.loading.set(false);
      },
      error: () => {
        this.actors.set([]);
        this.errorMessage.set(
          'No se pudieron cargar las personas. Verifica tu conexión y API Key.',
        );
        this.loading.set(false);
      },
    });
  }

  onFiltersChange(filters: PersonFilters): void {
    this.filters.set(filters);
    this.currentPage.set(1);
    this.loadActors();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchQuery.set(input.value.trim());
    this.currentPage.set(1);
    this.loadActors();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadActors();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    this.loadActors();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  getProfile(path: string | null): string {
    return this.personService.getImageUrl(path, 'w500');
  }

  getDepartment(department: string): string {
    const departments: Record<string, string> = {
      Acting: 'Actuación',
      Directing: 'Dirección',
      Writing: 'Guion',
      Production: 'Producción',
      Camera: 'Cámara',
      Editing: 'Edición',
      Sound: 'Sonido',
      Art: 'Arte',
    };

    return departments[department] ?? department;
  }

  getKnownFor(person: Person): string {
    const titles = person.known_for
      ?.map((item) => item.title ?? item.name)
      .filter((title): title is string => Boolean(title))
      .slice(0, 2);

    return titles?.join(', ') || 'Sin información disponible';
  }
}
