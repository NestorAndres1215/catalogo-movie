
import { Component, input, output } from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';

export interface RatedMedia {
  id: number;
  title: string;
  posterPath: string | null;
  mediaType: 'movie' | 'tv';
  personalRating?: number | null;
  voteAverage: number;
  releaseDate: string;
}

@Component({
  selector: 'app-media-details-card',
  standalone: true,
  imports: [DecimalPipe, NgTemplateOutlet],
  templateUrl: './media-details-card.html',
  styleUrl: './media-details-card.css',
})
export class MediaDetailsCardComponent {
  readonly item = input.required<RatedMedia>();

  readonly showRatingComparison = input(false);

  readonly detailsRequested = output<{
    id: number;
    mediaType: 'movie' | 'tv';
  }>();

  get imageUrl(): string {
    const posterPath = this.item().posterPath;

    if (!posterPath) {
      return 'assets/images/no-poster.png';
    }

    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }

  get releaseDate(): string {
    const date = this.item().releaseDate;

    if (!date) {
      return 'Fecha no disponible';
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
  }

  get mediaTypeLabel(): string {
    return this.item().mediaType === 'movie' ? 'Película' : 'Serie';
  }

  openDetails(): void {
    this.detailsRequested.emit({
      id: this.item().id,
      mediaType: this.item().mediaType,
    });
  }
}
