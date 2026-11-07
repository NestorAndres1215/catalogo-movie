import { Component, input } from '@angular/core';

@Component({
  selector: 'app-results-header',
  standalone: true,
  templateUrl: './results-header.html',
  styleUrl: './results-header.css',
})
export class ResultsHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly totalResults = input<number | null>(null);
  readonly countLabel = input<string | null>(null);
  readonly loading = input(false);
  readonly errorMessage = input('');
}
