import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface RankingMedia {
  id: number;
  name?: string;
  title?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  first_air_date?: string;
  release_date?: string;
  overview?: string | null;
  vote_count?: number;
  vote_average?: number;
  popularity?: number;
  movieCount?: number;
}

@Component({
  selector: 'app-ranking-card',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './ranking-card.html',
  styleUrl: './ranking-card.css',
})
export class RankingCardComponent {
  readonly serie = input.required<RankingMedia>();
  readonly position = input.required<number>();
  readonly posterUrl = input.required<string>();
  readonly rating = input.required<number | string>();

  readonly ranking = input<boolean>(false);
readonly isActor = input<boolean>(false);
  readonly showPopularity = input<boolean>(false);
  readonly popularity = input<number | string>(0);

  get title(): string {
    return this.serie().name || this.serie().title || 'Sin título';
  }

  get year(): string {
    const date = this.serie().first_air_date || this.serie().release_date;

    return date ? date.substring(0, 4) : 'Año no disponible';
  }

  get overview(): string {
    return this.serie().overview || 'Sin descripción disponible.';
  }
}