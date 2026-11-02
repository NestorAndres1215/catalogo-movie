import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MovieService } from '../../../../core/service/movie.service';
import { SeriesService } from '../../../../core/service/series.service';

import { Movie } from '../../../../core/models/movie.interface';
import { TvSeries } from '../../../../core/models/series.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private readonly movieService = inject(MovieService);
  private readonly seriesService = inject(SeriesService);

  trendingMovies = signal<Movie[]>([]);
  trendingSeries = signal<TvSeries[]>([]);
  upcomingMovies = signal<Movie[]>([]);
  topRatedMovies = signal<Movie[]>([]);
  topRatedSeries = signal<TvSeries[]>([]);

  error = signal<string | null>(null);

  featuredMovie = computed(() => this.trendingMovies()[0] ?? null);

  ngOnInit(): void {
    this.loadHome();
  }

  loadHome(): void {
    this.error.set(null);

    forkJoin({
      trendingMovies: this.movieService.getTrendingMovies(),
      trendingSeries: this.seriesService.getTrendingSeries(),
      upcomingMovies: this.movieService.getUpcomingMovies(),
      topRatedMovies: this.movieService.getTopRatedMovies(),
      topRatedSeries: this.seriesService.getTopRatedSeries(),
    }).subscribe({
      next: (response) => {
        this.trendingMovies.set(response.trendingMovies.results);
        this.trendingSeries.set(response.trendingSeries.results);
        this.upcomingMovies.set(response.upcomingMovies.results);
        this.topRatedMovies.set(response.topRatedMovies.results);
        this.topRatedSeries.set(response.topRatedSeries.results);
      },
      error: () => {
        this.error.set('No se pudo cargar el contenido. Inténtalo nuevamente.');
      },
    });
  }

  getMovieImage(path: string | null, size: string = 'w500'): string {
    return this.movieService.getImageUrl(path, size);
  }

  getSeriesImage(path: string | null, size: string = 'w500'): string {
    return this.seriesService.getImageUrl(path, size);
  }

  getBackdrop(path: string | null): string {
    return this.movieService.getImageUrl(path, 'original');
  }

  getYear(date: string): string {
    return date ? date.substring(0, 4) : 'Sin fecha';
  }

  getRating(rating: number): string {
    return rating.toFixed(1);
  }

  trackMovie(_: number, movie: Movie): number {
    return movie.id;
  }

  trackSeries(_: number, series: TvSeries): number {
    return series.id;
  }
}
