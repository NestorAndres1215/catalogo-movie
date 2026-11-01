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
  Genre,
  GenreMedia
} from '../../../../core/models/genre.interface';

import {
  GenreService
} from '../../../../core/service/genre.service';

type GenreType = 'movie' | 'tv';

@Component({
  selector: 'app-genre-detail',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './genre-detail.html',
  styleUrl: './genre-detail.css'
})
export class GenreDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly genreService = inject(GenreService);

  // =========================================
  // ESTADOS
  // =========================================

  genre = signal<Genre | null>(null);

  media = signal<GenreMedia[]>([]);

  loading = signal<boolean>(true);

  errorMessage = signal<string>('');

  currentPage = signal<number>(1);

  totalPages = signal<number>(1);

  totalResults = signal<number>(0);

  selectedType = signal<GenreType>('movie');

  private genreId = 0;

  private requestVersion = 0;

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = Number(params.get('id'));

      const type = params.get('type');

      if (
        !id ||
        Number.isNaN(id) ||
        (type !== 'movie' && type !== 'tv')
      ) {

        this.errorMessage.set(
          'El género solicitado no es válido.'
        );

        this.loading.set(false);

        return;
      }

      this.genreId = id;

      this.selectedType.set(type);

      this.currentPage.set(1);

      this.loadGenre();
    });
  }

  // =========================================
  // CARGAR GÉNERO Y CONTENIDO
  // =========================================

  loadGenre(): void {

    const version = ++this.requestVersion;

    this.loading.set(true);

    this.errorMessage.set('');

    this.media.set([]);

    const genreRequest = this.selectedType() === 'movie'
      ? this.genreService.getMovieGenres()
      : this.genreService.getTvGenres();

    const mediaRequest = this.selectedType() === 'movie'
      ? this.genreService.getMoviesByGenre(
          this.genreId,
          this.currentPage()
        )
      : this.genreService.getSeriesByGenre(
          this.genreId,
          this.currentPage()
        );

    // Obtener el nombre del género y su contenido.
    genreRequest.subscribe({

      next: genreResponse => {

        if (version !== this.requestVersion) {
          return;
        }

        const selectedGenre = genreResponse.genres.find(
          item => item.id === this.genreId
        );

        this.genre.set(selectedGenre ?? null);

      },

      error: error => {

        console.error(
          'Error cargando información del género:',
          error
        );

      }

    });

    mediaRequest.subscribe({

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
          'Error cargando contenido del género:',
          error
        );

        this.errorMessage.set(
          'No se pudo cargar el contenido de este género.'
        );

        this.loading.set(false);
      }

    });
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

    this.loadGenre();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // =========================================
  // IMÁGENES
  // =========================================

  getPoster(path: string | null): string {

    return this.genreService.getImageUrl(
      path,
      'w500'
    );
  }

  // =========================================
  // TÍTULO
  // =========================================

  getMediaTitle(item: GenreMedia): string {

    return item.title ?? item.name ?? 'Sin título';
  }

  // =========================================
  // FECHA
  // =========================================

  getMediaDate(item: GenreMedia): string {

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
  // RUTA DE DETALLE
  // =========================================

  getMediaRoute(item: GenreMedia): string[] {

    return this.selectedType() === 'movie'
      ? ['/movies', String(item.id)]
      : ['/series', String(item.id)];
  }

}