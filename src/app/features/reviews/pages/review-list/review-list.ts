import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { MovieService } from '../../../../core/service/movie.service';
import { SeriesService } from '../../../../core/service/series.service';
import { CatalogService } from '../../../../core/service/catalog.service';

import { MediaReview } from '../../../../core/models/catalog.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

interface ReviewItem extends MediaReview {
  mediaTitle: string;
  mediaType: 'movie' | 'tv';
}

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [DatePipe, DecimalPipe, PageHeaderComponent],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewListComponent {
  private readonly movieService = inject(MovieService);
  private readonly seriesService = inject(SeriesService);
  private readonly catalogService = inject(CatalogService);

  readonly mediaType = signal<'movie' | 'tv'>('movie');

  readonly reviews = signal<ReviewItem[]>([]);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  private requestVersion = 0;

  constructor() {
    this.loadMovieReviews();
  }

  loadMovieReviews(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const currentVersion = ++this.requestVersion;

    this.movieService.getPopularMovies().subscribe({
      next: (response) => {
        if (currentVersion !== this.requestVersion) return;

        const requests = response.results.slice(0, 10).map((movie) =>
          this.catalogService.getReviews('movie', movie.id, 1).pipe(
            map((result) =>
              result.results.map((review) => ({
                ...review,
                mediaTitle: movie.title,
                mediaType: 'movie' as const,
              })),
            ),
            catchError(() => of([] as ReviewItem[])),
          ),
        );

        this.loadReviewResults(requests, currentVersion);
      },
      error: () => {
        if (currentVersion !== this.requestVersion) return;

        this.loading.set(false);
        this.errorMessage.set('No se pudieron cargar las películas.');
      },
    });
  }

  loadSeriesReviews(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const currentVersion = ++this.requestVersion;

    this.seriesService.getPopularSeries().subscribe({
      next: (response) => {
        if (currentVersion !== this.requestVersion) return;

        const requests = response.results.slice(0, 10).map((series) =>
          this.catalogService.getReviews('tv', series.id, 1).pipe(
            map((result) =>
              result.results.map((review) => ({
                ...review,
                mediaTitle: series.name,
                mediaType: 'tv' as const,
              })),
            ),
            catchError(() => of([] as ReviewItem[])),
          ),
        );

        this.loadReviewResults(requests, currentVersion);
      },
      error: () => {
        if (currentVersion !== this.requestVersion) return;

        this.loading.set(false);
        this.errorMessage.set('No se pudieron cargar las series.');
      },
    });
  }

  private loadReviewResults(requests: Observable<ReviewItem[]>[], currentVersion: number): void {
    if (requests.length === 0) {
      if (currentVersion !== this.requestVersion) return;

      this.reviews.set([]);
      this.loading.set(false);
      return;
    }

    forkJoin(requests).subscribe({
      next: (responses) => {
        if (currentVersion !== this.requestVersion) return;

        const allReviews = responses.flat();

        const sortedReviews = allReviews.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        this.reviews.set(sortedReviews);
        this.loading.set(false);
      },
      error: () => {
        if (currentVersion !== this.requestVersion) return;

        this.loading.set(false);
        this.errorMessage.set('No se pudieron cargar las críticas y reseñas.');
      },
    });
  }

  changeMediaType(type: 'movie' | 'tv'): void {
    if (this.mediaType() === type) return;

    this.mediaType.set(type);
    this.reviews.set([]);

    if (type === 'movie') {
      this.loadMovieReviews();
    } else {
      this.loadSeriesReviews();
    }
  }

  getAuthorName(review: ReviewItem): string {
    return review.author_details.name || review.author_details.username || review.author;
  }

  getAuthorRating(review: ReviewItem): number | null {
    return review.author_details.rating;
  }

  get filteredReviews(): ReviewItem[] {
    return this.reviews();
  }
}
