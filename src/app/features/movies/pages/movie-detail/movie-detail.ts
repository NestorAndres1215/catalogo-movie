import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { Movie } from '../../../../core/models/movie.interface';
import { MovieCredits } from '../../../../core/models/movie-credits.interface';
import { MovieService } from '../../../../core/service/movie.service';

interface MovieResult {
  movie: Movie | null;
  error: string;
}

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
})
export class MovieDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly movieService = inject(MovieService);

  // ID reactivo: si la ruta cambia (/movies/1 -> /movies/2) todo se recarga solo
  private readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: Number(this.route.snapshot.paramMap.get('id')) },
  );

  // Película + error
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
          map((movie): MovieResult => ({ movie, error: '' })),
          catchError(() =>
            of<MovieResult>({
              movie: null,
              error: 'No se pudo encontrar la película.',
            }),
          ),
        );
      }),
    ),
    { initialValue: { movie: null, error: '' } as MovieResult },
  );

  // Créditos (se piden en paralelo; si fallan, simplemente no se muestran)
  readonly credits = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        Number.isInteger(id) && id > 0
          ? this.movieService.getMovieCredits(id).pipe(catchError(() => of(null)))
          : of(null),
      ),
    ),
    { initialValue: null as MovieCredits | null },
  );

  // Estado derivado
  readonly movie = computed(() => this.result().movie);
  readonly errorMessage = computed(() => this.result().error);

  readonly director = computed(() =>
    this.credits()?.crew.find((member) => member.job === 'Director'),
  );

  readonly cast = computed(() => this.credits()?.cast.slice(0, 12) ?? []);

  getBackdrop(path: string | null): string {
    return this.movieService.getImageUrl(path, 'original');
  }

  getPoster(path: string | null): string {
    return this.movieService.getImageUrl(path, 'w500');
  }

  getYear(date: string): string {
    return date ? date.substring(0, 4) : 'Sin fecha';
  }
}
