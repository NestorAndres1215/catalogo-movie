import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { Movie, MovieVideoResponse } from '../../../../core/models/movie.interface';
import { MovieCredits } from '../../../../core/models/movie-credits.interface';

import { MovieService } from '../../../../core/service/movie.service';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { VideoTrailerComponent } from '../../../../shared/components/video-trailer/video-trailer';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { ActorCard } from '../../../../shared/components/actor-card/actor-card';

interface MovieResult {
  movie: Movie | null;
  error: string;
}

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [ErrorStateComponent, VideoTrailerComponent, ResultsHeaderComponent, ActorCard],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
})
export class MovieDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly movieService = inject(MovieService);
  private readonly sanitizer = inject(DomSanitizer);

  // ID reactivo: permite cargar otra película si cambia la ruta.
  private readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    {
      initialValue: Number(this.route.snapshot.paramMap.get('id')),
    },
  );

  // Información principal de la película.
  private readonly result = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => {
        if (!Number.isInteger(id) || id <= 0) {
          return of<MovieResult>({
            movie: null,
            error: 'El identificador de la película no es válido.',
          });
        }

        return this.movieService.getMovieDetails(id).pipe(
          map((movie): MovieResult => ({
            movie,
            error: '',
          })),
          catchError(() =>
            of<MovieResult>({
              movie: null,
              error: 'No se pudo encontrar la película.',
            }),
          ),
        );
      }),
    ),
    {
      initialValue: {
        movie: null,
        error: '',
      } as MovieResult,
    },
  );

  // Créditos de la película.
  readonly credits = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        Number.isInteger(id) && id > 0
          ? this.movieService.getMovieCredits(id).pipe(catchError(() => of(null)))
          : of(null),
      ),
    ),
    {
      initialValue: null as MovieCredits | null,
    },
  );

  // Todos los directores (a veces hay más de uno).
  readonly directors = computed(
    () => this.credits()?.crew.filter((member) => member.job === 'Director') ?? [],
  );
getProfile(path: string | null): string {
  return this.movieService.getImageUrl(path, 'w185');
}

getStatusLabel(status: string | undefined): string {
  const statuses: Record<string, string> = {
    Released: 'Estrenada',
    'In Production': 'En producción',
    'Post Production': 'En posproducción',
    Planned: 'Planeada',
    Rumored: 'Rumoreada',
    Canceled: 'Cancelada',
  };

  return status ? (statuses[status] ?? status) : 'No disponible';
}
  // Videos disponibles de la película.
  readonly videos = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        Number.isInteger(id) && id > 0
          ? this.movieService.getMovieVideos(id).pipe(catchError(() => of(null)))
          : of(null),
      ),
    ),
    {
      initialValue: null as MovieVideoResponse | null,
    },
  );

  // Busca el tráiler oficial o un video alternativo.
  readonly trailerUrl = computed<SafeResourceUrl | null>(() => {
    const availableVideos = this.videos()?.results ?? [];

    const officialTrailer = availableVideos.find(
      (video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official,
    );

    const anyTrailer = availableVideos.find(
      (video) => video.site === 'YouTube' && video.type === 'Trailer',
    );

    const teaser = availableVideos.find(
      (video) => video.site === 'YouTube' && video.type === 'Teaser',
    );

    const selectedVideo = officialTrailer ?? anyTrailer ?? teaser;

    if (!selectedVideo || !/^[a-zA-Z0-9_-]+$/.test(selectedVideo.key)) {
      return null;
    }

    const url = `https://www.youtube-nocookie.com/embed/${selectedVideo.key}`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  // Estados derivados.
  readonly movie = computed(() => this.result().movie);

  readonly errorMessage = computed(() => this.result().error);

  readonly director = computed(() =>
    this.credits()?.crew.find((member) => member.job === 'Director'),
  );

  readonly cast = computed(() => this.credits()?.cast.slice(0, 12) ?? []);

  // Imágenes.
  getBackdrop(path: string | null): string {
    return this.movieService.getImageUrl(path, 'original');
  }

  getPoster(path: string | null): string {
    return this.movieService.getImageUrl(path, 'w500');
  }

  // Año de estreno.
  getYear(date: string): string {
    return date ? date.substring(0, 4) : 'Sin fecha';
  }
}
