import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface MediaCard {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}

export type MediaType = 'movie' | 'tv';
export type MediaCardVariant = 'catalog' | 'description';

@Component({
  selector: 'app-media-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './media-card.html',
  styleUrl: './media-card.css'
})
export class MediaCardComponent {
  readonly media = input.required<MediaCard>();
  readonly mediaType = input<MediaType>('movie');
  readonly variant = input<MediaCardVariant>('catalog');
  readonly isUpcoming = input(false);

  readonly showRanking = input(false);
  readonly ranking = input<number | null>(null);

  private readonly months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  get title(): string {
    return this.media().title ?? this.media().name ?? 'Sin título';
  }

  get date(): string {
    return this.mediaType() === 'movie'
      ? this.media().release_date ?? ''
      : this.media().first_air_date ?? '';
  }

  get route(): string {
    return this.mediaType() === 'movie' ? '/movies' : '/series';
  }

  getPoster(posterPath: string | null): string {
    return posterPath
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : '';
  }

  getYear(date: string): string {
    return date ? date.substring(0, 4) : 'Fecha no disponible';
  }

  getLongDate(date: string): string {
    if (!date) {
      return 'Fecha no disponible';
    }

    const [year, month, day] = date.split('-');

    return `${Number(day)} de ${this.months[Number(month) - 1]} de ${year}`;
  }
}