import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SavedMovie } from '../../../core/service/saved-movies.service';

@Component({
  selector: 'app-favorite-movie-card',
  standalone: true,
  imports: [],
  templateUrl: './favorite-movie-card.html',
  styleUrl: './favorite-movie-card.css',
})
export class FavoriteMovieCardComponent {
  readonly movie = input.required<SavedMovie>();
  readonly imageUrl = input.required<string>();

  readonly open = output<SavedMovie>();
  readonly remove = output<number>();

  openMovie(): void {
    this.open.emit(this.movie());
  }

  removeMovie(): void {
    this.remove.emit(this.movie().id);
  }
}