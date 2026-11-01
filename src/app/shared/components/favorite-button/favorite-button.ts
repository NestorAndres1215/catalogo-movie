import { Component, Input, inject } from '@angular/core';

import { FavoriteService } from '../../../core/service/favorite.service';
import { Favorite } from '../../../core/models/favorite.interface';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  templateUrl: './favorite-button.html',
  styleUrl: './favorite-button.css'
})
export class FavoriteButtonComponent {

  private readonly favoriteService = inject(FavoriteService);

  @Input({ required: true }) mediaId!: number;
  @Input({ required: true }) mediaType!: 'movie' | 'tv';
  @Input({ required: true }) title!: string;

  @Input() overview = '';
  @Input() posterPath: string | null = null;
  @Input() voteAverage = 0;
  @Input() releaseDate = '';

  isFavorite(): boolean {
    return this.favoriteService.isFavorite(
      this.mediaId,
      this.mediaType
    );
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const favorite: Favorite = {
      id: this.mediaId,
      mediaType: this.mediaType,
      title: this.title,
      overview: this.overview,
      posterPath: this.posterPath,
      voteAverage: this.voteAverage,
      releaseDate: this.releaseDate
    };

    this.favoriteService.toggleFavorite(favorite);
  }
}