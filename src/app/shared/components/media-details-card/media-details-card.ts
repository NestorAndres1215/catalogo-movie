import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface RatedMedia {
  id: number;
  title: string;
  posterPath: string | null;
  mediaType: 'movie' | 'tv';
  personalRating?: number | null;
  voteAverage: number;
  releaseDate: string;
  overview: string | null;
}

@Component({
  selector: 'app-media-details-card',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './media-details-card.html',
  styleUrl: './media-details-card.css',
})
export class MediaDetailsCardComponent {
  item = input.required<RatedMedia>();

  showRatingComparison = input(false);

  detailsRequested = output<{
    id: number;
    mediaType: 'movie' | 'tv';
  }>();

  get imageUrl(): string {
    const posterPath = this.item().posterPath;

    return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '';
  }

  get releaseYear(): string {
    const date = this.item().releaseDate;

    return date ? date.substring(0, 4) : 'Sin fecha';
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

  get releaseDate(): string {
    const date = this.item().releaseDate;

    if (!date) return 'Fecha no disponible';

    const parsedDate = new Date(`${date}T00:00:00`);

    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
  }
}
