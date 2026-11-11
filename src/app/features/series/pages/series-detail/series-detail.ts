import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { SeriesService } from '../../../../core/service/series.service';

import { TvSeries, SeriesCreator, SeriesSeason } from '../../../../core/models/series.interface';

import { SeriesCredits } from '../../../../core/models/series-credits.interface';
import { MovieVideoResponse } from '../../../../core/models/movie.interface';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { VideoTrailerComponent } from '../../../../shared/components/video-trailer/video-trailer';
import { ActorCard } from '../../../../shared/components/actor-card/actor-card';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [PageLoadingComponent, ErrorStateComponent, VideoTrailerComponent, ActorCard, ResultsHeaderComponent],
  templateUrl: './series-detail.html',
  styleUrl: './series-detail.css',
})
export class SeriesDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly seriesService = inject(SeriesService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly series = signal<TvSeries | null>(null);
  readonly credits = signal<SeriesCredits | null>(null);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  // URL segura del tráiler.
  readonly trailerUrl = signal<SafeResourceUrl | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('El identificador de la serie no es válido.');
      this.loading.set(false);
      return;
    }
console.log("hola")
    this.loadSeries(id);
    this.loadCredits(id);
    this.loadVideos(id);
  }

  // Información principal de la serie.
  loadSeries(id: number): void {
    this.seriesService.getSeriesDetails(id).subscribe({
      next: (response) => {
        this.series.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la información de la serie.');
        this.loading.set(false);
      },
    });
  }

  // Créditos de la serie.
  loadCredits(id: number): void {
    this.seriesService.getSeriesCredits(id).subscribe({
      next: (response) => {
        console.log(response)
        this.credits.set(response);
      },
      error: () => {
        this.credits.set(null);
      },
    });
  }

  // Videos y tráiler de la serie.
  loadVideos(id: number): void {
    this.trailerUrl.set(null);

    this.seriesService.getSeriesVideos(id).subscribe({
      next: (response) => {
        this.setTrailer(response);
      },
      error: () => {
        this.trailerUrl.set(null);
      },
    });
  }

  // Selecciona el mejor video disponible.
  private setTrailer(response: MovieVideoResponse): void {
    const videos = response.results ?? [];

    const officialTrailer = videos.find(
      (video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official,
    );

    const anyTrailer = videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer');

    const teaser = videos.find((video) => video.site === 'YouTube' && video.type === 'Teaser');

    const selectedVideo = officialTrailer ?? anyTrailer ?? teaser;

    if (!selectedVideo || !/^[a-zA-Z0-9_-]+$/.test(selectedVideo.key)) {
      this.trailerUrl.set(null);
      return;
    }

    const url = `https://www.youtube-nocookie.com/embed/${selectedVideo.key}`;

    this.trailerUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  // Imágenes.
  getBackdrop(path: string | null): string {
    return this.seriesService.getImageUrl(path, 'original');
  }

  getPoster(path: string | null): string {
    return this.seriesService.getImageUrl(path, 'w500');
  }

  getProfile(path: string | null): string {
    return this.seriesService.getImageUrl(path, 'w185');
  }

  // Año de estreno.
  getYear(date: string | undefined): string {
    return date ? date.substring(0, 4) : 'Sin fecha';
  }

  // Datos derivados.
  get creators(): SeriesCreator[] {
    return this.series()?.created_by ?? [];
  }

  get seasons(): SeriesSeason[] {
    return this.series()?.seasons ?? [];
  }

  get cast() {
    return this.credits()?.cast.slice(0, 12) ?? [];
  }

  getStatusLabel(status: string | undefined): string {
    const statuses: Record<string, string> = {
      Ended: 'Finalizado',
      'Returning Series': 'En emisión',
    };

    return status ? (statuses[status] ?? status) : 'No disponible';
  }

  readonly information = computed(() => {
    const item = this.series();

    if (!item) return [];

    return [
      { label: 'Estado', value: this.getStatusLabel(item.status) },
      { label: 'Primera emisión', value: item.first_air_date || 'No disponible' },
      { label: 'Temporadas', value: item.number_of_seasons ?? 0 },
      { label: 'Episodios', value: item.number_of_episodes ?? 0 },
      {
        label: 'Idioma original',
        value: item.original_language?.toUpperCase() || 'No disponible',
      },
      {
        label: 'País de origen',
        value: item.origin_country?.join(', ') || 'No disponible',
      },
    ];
  });
}
