import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  firstValueFrom,
  from,
  of,
  mergeMap,
  map,
  toArray,
  catchError
} from 'rxjs';

import { Person, PersonFilters } from '../../../../core/models/person.interface';
import { PersonService } from '../../../../core/service/person.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-director-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    PageHeaderComponent
],
  templateUrl: './director-list.html',
  styleUrl: './director-list.css'
})
export class DirectorListComponent implements OnInit {

  private readonly personService = inject(PersonService);

  // Directores que se muestran en la página actual.
  directors = signal<Person[]>([]);

  // Todos los directores encontrados hasta el momento.
  allDirectors = signal<Person[]>([]);

  // Estados de la pantalla.
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Búsqueda.
  searchQuery = signal<string>('');

  // Paginación de CINEVERSE.
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  // Cantidad de directores por página.
  readonly pageSize = 20;

  // Filtros y ordenamiento.
  filters = signal<PersonFilters>({
    department: 'Directing',
    sortBy: 'popularity.desc'
  });

  // Control de paginación de TMDB.
  private nextTmdbPage = 1;
  private tmdbTotalPages = 1;

  // Evita solicitudes simultáneas.
  private isLoadingMore = false;

  // Identifica la búsqueda actual para ignorar respuestas antiguas.
  private requestVersion = 0;

  ngOnInit(): void {
    this.loadDirectors();
  }

  // =====================================================
  // CARGAR DIRECTORES
  // =====================================================

  async loadDirectors(): Promise<void> {

    if (this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;

    const currentVersion = this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    try {

      // Necesitamos suficientes directores para la página actual.
      const requiredDirectors = this.currentPage() * this.pageSize;

      // Seguimos consultando TMDB hasta completar la página.
      while (
        this.allDirectors().length < requiredDirectors &&
        this.nextTmdbPage <= this.tmdbTotalPages
      ) {

        const query = this.searchQuery().trim();

        // Consultar personas populares o buscar por nombre.
        const response = await firstValueFrom(
          query
            ? this.personService.searchPeople(
                query,
                this.nextTmdbPage
              )
            : this.personService.getPopularPeople(
                this.nextTmdbPage
              )
        );

        if (currentVersion !== this.requestVersion) {
          return;
        }

        // Guardar el total de páginas de TMDB.
        this.tmdbTotalPages = Math.min(
          response.total_pages,
          500
        );

        // Preparar la siguiente página de TMDB.
        this.nextTmdbPage++;

        // Consultar los créditos de las personas.
        const verifiedDirectors = await firstValueFrom(
          from(response.results).pipe(

            // Máximo 5 consultas simultáneas.
            mergeMap(
              person =>
                this.personService
                  .getPersonCredits(person.id)
                  .pipe(

                    map(credits => {

                      // Comprobar si realmente es director.
                      const isDirector = credits.crew.some(
                        credit =>
                          credit.department === 'Directing' &&
                          credit.job === 'Director'
                      );

                      return isDirector ? person : null;
                    }),

                    // Si falla la consulta de una persona,
                    // continuamos con las demás.
                    catchError(() => of(null))
                  ),
              5
            ),

            toArray()
          )
        );

        if (currentVersion !== this.requestVersion) {
          return;
        }

        // Eliminar los valores nulos.
        const validDirectors = verifiedDirectors.filter(
          (person): person is Person => person !== null
        );

        // Evitar directores duplicados.
        const existingIds = new Set(
          this.allDirectors().map(person => person.id)
        );

        const newDirectors = validDirectors.filter(
          person => !existingIds.has(person.id)
        );

        // Acumular los nuevos directores.
        this.allDirectors.update(current => [
          ...current,
          ...newDirectors
        ]);
      }

      if (currentVersion === this.requestVersion) {
        this.applyPagination();
      }

    } catch (error) {

      console.error('Error cargando directores:', error);

      if (currentVersion === this.requestVersion) {

        this.errorMessage.set(
          'No se pudieron cargar los directores. Verifica tu conexión y API Key.'
        );
      }

    } finally {

      if (currentVersion === this.requestVersion) {
        this.loading.set(false);
      }

      this.isLoadingMore = false;
    }
  }

  // =====================================================
  // ORDENAR Y PAGINAR
  // =====================================================

  applyPagination(): void {

    let results = [...this.allDirectors()];

    // Ordenamiento.
    switch (this.filters().sortBy) {

      case 'popularity.asc':

        results.sort(
          (a, b) => a.popularity - b.popularity
        );

        break;

      case 'name.asc':

        results.sort(
          (a, b) => a.name.localeCompare(b.name)
        );

        break;

      case 'name.desc':

        results.sort(
          (a, b) => b.name.localeCompare(a.name)
        );

        break;

      default:

        results.sort(
          (a, b) => b.popularity - a.popularity
        );
    }

    // Calcular los elementos de la página actual.
    const start = (
      this.currentPage() - 1
    ) * this.pageSize;

    const end = start + this.pageSize;

    this.directors.set(
      results.slice(start, end)
    );

    // Comprobar si todavía existen páginas de TMDB.
    const hasMore = this.nextTmdbPage <= this.tmdbTotalPages;

    // Actualizar las páginas disponibles en CINEVERSE.
    const pagesWithResults = Math.ceil(
      results.length / this.pageSize
    );

    this.totalPages.set(
      Math.max(
        1,
        pagesWithResults + (hasMore ? 1 : 0)
      )
    );
  }

  // =====================================================
  // CAMBIAR DE PÁGINA
  // =====================================================

  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages() ||
      this.loading()
    ) {
      return;
    }

    this.currentPage.set(page);

    // Cargar más directores si todavía no hay suficientes.
    this.loadDirectors();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // =====================================================
  // BUSCAR DIRECTORES
  // =====================================================

  onSearch(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.searchQuery.set(input.value.trim());

    this.resetDirectors();
  }

  clearSearch(): void {

    this.searchQuery.set('');

    this.resetDirectors();
  }

  // =====================================================
  // REINICIAR RESULTADOS
  // =====================================================

  resetDirectors(): void {

    // Invalidar las solicitudes de búsquedas anteriores.
    this.requestVersion++;

    // Limpiar los resultados.
    this.allDirectors.set([]);
    this.directors.set([]);

    // Reiniciar la paginación.
    this.currentPage.set(1);
    this.totalPages.set(1);

    this.nextTmdbPage = 1;
    this.tmdbTotalPages = 1;

    // Cargar los nuevos resultados.
    this.loadDirectors();
  }

  // =====================================================
  // ORDENAMIENTO
  // =====================================================

  onSortChange(event: Event): void {

    const select = event.target as HTMLSelectElement;

    this.filters.update(current => ({
      ...current,
      sortBy: select.value
    }));

    // Ordenar los resultados acumulados sin consultar TMDB.
    this.applyPagination();
  }

  // =====================================================
  // IMÁGENES
  // =====================================================

  getProfile(path: string | null): string {

    return this.personService.getImageUrl(
      path,
      'w500'
    );
  }

  // =====================================================
  // TRABAJOS CONOCIDOS
  // =====================================================

  getKnownFor(person: Person): string {

    const titles = person.known_for
      ?.map(item => item.title ?? item.name)
      .filter(
        (title): title is string => Boolean(title)
      )
      .slice(0, 2);

    return titles?.join(', ') ||
      'Sin información disponible';
  }

}