import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MovieService } from '../../../../core/service/movie.service';
import { SeriesService } from '../../../../core/service/series.service';

import { Movie } from '../../../../core/models/movie.interface';
import { TvSeries } from '../../../../core/models/series.interface';
import { Footer } from '../../../../shared/components/footer/footer';
import { MediaCardComponent } from '../../../../shared/components/media-card/media-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, Footer, MediaCardComponent],
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

  // Primeras 5 películas para el carrusel
  featuredMovies = computed(() => this.trendingMovies().slice(0, 5));

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

  getMovieGroups(): Movie[][] {
    const movies = this.trendingMovies();
    const groups: Movie[][] = [];
    const itemsPerSlide = 5;

    for (let i = 0; i < movies.length; i += itemsPerSlide) {
      groups.push(movies.slice(i, i + itemsPerSlide));
    }

    return groups;
  }

  quickAccess = [
    {
      title: 'Películas',
      description: 'Explora el catálogo',
      icon: 'fas fa-film',
      route: '/movies',
    },
    {
      title: 'Series',
      description: 'Descubre nuevas historias',
      icon: 'fas fa-tv',
      route: '/series',
    },
    {
      title: 'Universos',
      description: 'Explora tus sagas favoritas',
      icon: 'fas fa-globe',
      route: '/collections',
    },
    {
      title: 'Rankings',
      description: 'Descubre los mejores títulos',
      icon: 'fas fa-trophy',
      route: '/rankings/movies',
    },
  ];

  scrollRow(row: HTMLElement, direction: 1 | -1): void {
  const maxScroll = row.scrollWidth - row.clientWidth;
  const tolerance = 4;

  // Al final de la fila: vuelve al inicio
  if (direction === 1 && row.scrollLeft >= maxScroll - tolerance) {
    row.scrollTo({ left: 0, behavior: 'smooth' });
    return;
  }

  // Al inicio de la fila: salta al final
  if (direction === -1 && row.scrollLeft <= tolerance) {
    row.scrollTo({ left: maxScroll, behavior: 'smooth' });
    return;
  }

  row.scrollBy({ left: direction * row.clientWidth * 0.85, behavior: 'smooth' });
}
}
