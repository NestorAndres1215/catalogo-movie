import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface RankingDetailsMedia {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  vote_count?: number;
  popularity?: number;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
}

@Component({
  selector: 'app-movie-card-ranking-details',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './movie-card-ranking-details.html',
  styleUrl: './movie-card-ranking-details.css'
})
export class MovieCardRankingDetailsComponent {

  readonly media = input.required<RankingDetailsMedia>();
  readonly position = input.required<number>();
  readonly mediaType = input.required<'movie' | 'tv'>();
  readonly route = input.required<string>();

  get title(): string {
    return this.media().title || this.media().name || 'Sin título';
  }

  get date(): string {
    return this.media().release_date ||
      this.media().first_air_date || '';
  }

  get imageUrl(): string {
    const path = this.media().poster_path;

    return path
      ? `https://image.tmdb.org/t/p/w500${path}`
      : '';
  }

  get formattedDate(): string {
    if (!this.date) {
      return 'Fecha no disponible';
    }

    return new Date(`${this.date}T00:00:00`).toLocaleDateString(
      'es-PE',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );
  }
}