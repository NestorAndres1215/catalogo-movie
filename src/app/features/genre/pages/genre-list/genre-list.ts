import { Component, OnInit, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';

import { Genre } from '../../../../core/models/genre.interface';

import { GenreService } from '../../../../core/service/genre.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

type GenreType = 'movie' | 'tv';

@Component({
  selector: 'app-genre-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  templateUrl: './genre-list.html',
  styleUrl: './genre-list.css',
})
export class GenreListComponent implements OnInit {
  private readonly genreService = inject(GenreService);

  genres = signal<Genre[]>([]);

  loading = signal<boolean>(true);

  errorMessage = signal<string>('');

  selectedType = signal<GenreType>('movie');

  private requestVersion = 0;

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    const version = ++this.requestVersion;

    this.loading.set(true);

    this.errorMessage.set('');

    this.genres.set([]);

    const request =
      this.selectedType() === 'movie'
        ? this.genreService.getMovieGenres()
        : this.genreService.getTvGenres();

    request.subscribe({
      next: (response) => {
        if (version !== this.requestVersion) {
          return;
        }

        this.genres.set(response.genres);

        this.loading.set(false);
      },

      error: (error) => {
        if (version !== this.requestVersion) {
          return;
        }

        console.error('Error cargando géneros:', error);

        this.errorMessage.set('No se pudieron cargar los géneros. Verifica tu conexión y API Key.');

        this.loading.set(false);
      },
    });
  }

  changeType(type: GenreType): void {
    if (this.selectedType() === type) {
      return;
    }

    this.selectedType.set(type);

    this.loadGenres();
  }

  getGenreIcon(genreName: string): string {
    const icons: Record<string, string> = {
      Acción: 'fa-khanda',
      Aventura: 'fa-compass',
      Animación: 'fa-palette',
      Comedia: 'fa-face-laugh',
      Crimen: 'fa-magnifying-glass',
      Documental: 'fa-video',
      Drama: 'fa-masks-theater',
      Familia: 'fa-people-roof',
      Fantasía: 'fa-wand-magic-sparkles',
      Historia: 'fa-landmark',
      Terror: 'fa-ghost',
      Música: 'fa-music',
      Misterio: 'fa-user-secret',
      Romance: 'fa-heart',
      'Ciencia ficción': 'fa-rocket',
      'Película de TV': 'fa-tv',
      Suspense: 'fa-user-secret',
      Bélica: 'fa-shield-halved',
      Western: 'fa-hat-cowboy',
      'Action & Adventure': 'fa-khanda',
      Kids: 'fa-child',
      News: 'fa-newspaper',
      Reality: 'fa-video',
      'Sci-Fi & Fantasy': 'fa-rocket',
      Soap: 'fa-heart',
      Talk: 'fa-microphone',
      'War & Politics': 'fa-earth-americas',
    };

    return icons[genreName] ?? 'fa-film';
  }
}
