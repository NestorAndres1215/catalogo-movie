import { Component, input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ResultsHeaderComponent } from '../results-header/results-header';

@Component({
  selector: 'app-video-trailer',
  standalone: true,
  templateUrl: './video-trailer.html',
  styleUrl: './video-trailer.css',
  imports: [ResultsHeaderComponent]
})
export class VideoTrailerComponent {
  readonly trailerUrl = input<SafeResourceUrl | null>(null);
  readonly title = input.required<string>();
  readonly description = input(
    'Mira el avance de este contenido directamente en CINEVERSE.'
  );
}