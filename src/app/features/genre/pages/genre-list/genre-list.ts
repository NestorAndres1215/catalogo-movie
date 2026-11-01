import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';

import {
  Genre
} from '../../../../core/models/genre.interface';

import {
  GenreService
} from '../../../../core/service/genre.service';

type GenreType = 'movie' | 'tv';

@Component({
  selector: 'app-genre-list',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './genre-list.html',
  styleUrl: './genre-list.css'
})
export class GenreListComponent implements OnInit {

  private readonly genreService = inject(GenreService);

  // =========================================
  // ESTADOS
  // =========================================

  genres = signal<Genre[]>([]);

  loading = signal<boolean>(true);

  errorMessage = signal<string>('');

  selectedType = signal<GenreType>('movie');

  private requestVersion = 0;

  // =========================================
  // INICIALIZACIÓN
  // =========================================

  ngOnInit(): void {

    this.loadGenres();
  }

  // =========================================
  // CARGAR GÉNEROS
  // =========================================

  loadGenres(): void {

    const version = ++this.requestVersion;

    this.loading.set(true);

    this.errorMessage.set('');

    this.genres.set([]);

    const request = this.selectedType() === 'movie'
      ? this.genreService.getMovieGenres()
      : this.genreService.getTvGenres();

    request.subscribe({

      next: response => {

        if (version !== this.requestVersion) {
          return;
        }

        this.genres.set(response.genres);

        this.loading.set(false);
      },

      error: error => {

        if (version !== this.requestVersion) {
          return;
        }

        console.error(
          'Error cargando géneros:',
          error
        );

        this.errorMessage.set(
          'No se pudieron cargar los géneros. Verifica tu conexión y API Key.'
        );

        this.loading.set(false);
      }

    });
  }

  // =========================================
  // CAMBIAR TIPO
  // =========================================

  changeType(type: GenreType): void {

    if (this.selectedType() === type) {
      return;
    }

    this.selectedType.set(type);

    this.loadGenres();
  }

  // =========================================
  // ICONOS
  // =========================================

  getGenreIcon(genreName: string): string {

    const icons: Record<string, string> = {
      'Acción': '⚔',
      'Aventura': '🧭',
      'Animación': '🎨',
      'Comedia': '😂',
      'Crimen': '🔎',
      'Documental': '🎥',
      'Drama': '🎭',
      'Familia': '👨‍👩‍👧‍👦',
      'Fantasía': '🪄',
      'Historia': '🏛',
      'Terror': '👻',
      'Música': '🎵',
      'Misterio': '🔍',
      'Romance': '❤️',
      'Ciencia ficción': '🚀',
      'Película de TV': '📺',
      'Suspense': '🕵',
      'Bélica': '🪖',
      'Western': '🤠',
      'Action & Adventure': '⚔',
      'Kids': '🧸',
      'News': '📰',
      'Reality': '🎬',
      'Sci-Fi & Fantasy': '🚀',
      'Soap': '💞',
      'Talk': '🎙',
      'War & Politics': '🌍'
    };

    return icons[genreName] ?? '🎬';
  }

}