import { Component, inject, OnDestroy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../../core/service/auth.service';
import { CinematicPreferencesService } from '../../../../core/service/cinematic-preferences.service';

import type { CinematicPreferences } from '../../../../core/models/cinematic-preferences.model';
import type {
  Person,
  PersonCredit,
  PersonCombinedCredits,
} from '../../../../core/models/person.interface';

import { PersonService } from '../../../../core/service/person.service';
import { MovieService } from '../../../../core/service/movie.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { ButtonComponent } from '../../../../shared/components/button/button';
import {
  FilterTab,
  FilterTabsComponent,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { SearchComponent } from '../../../../shared/components/search/search';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { SavedMovie, SavedMoviesService } from '../../../../core/service/saved-movies.service';
import { FavoriteMovieCardComponent } from '../../../../shared/components/favorite-movie-card/favorite-movie-card';

@Component({
  selector: 'app-cinematic-profile',
  standalone: true,
  imports: [
    RouterLink,
    FavoriteMovieCardComponent,
    PageHeaderComponent,
    ButtonComponent,
    FilterTabsComponent,
    EmptyStateComponent,
    SearchComponent,
    ResultsHeaderComponent,
  ],
  templateUrl: './cinematic-profile.html',
  styleUrl: './cinematic-profile.css',
})
export class CinematicProfile implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly preferencesService = inject(CinematicPreferencesService);
  private readonly savedMoviesService = inject(SavedMoviesService);
  private readonly personService = inject(PersonService);
  private readonly movieService = inject(MovieService);
  private readonly router = inject(Router);

  private actorSearchSub?: Subscription;
  private directorSearchSub?: Subscription;
  private actorMoviesSub?: Subscription;
  private directorMoviesSub?: Subscription;

  readonly profileTabs: FilterTab[] = [
    { label: 'Mi perfil', value: 'profile' },
    { label: 'Mis preferencias', value: 'preferences' },
  ];

  readonly user = this.authService.currentUser;

  readonly availableGenres: string[] = [
    'Acción',
    'Aventura',
    'Animación',
    'Ciencia ficción',
    'Comedia',
    'Crimen',
    'Documental',
    'Drama',
    'Fantasía',
    'Misterio',
    'Romance',
    'Terror',
    'Suspenso',
    'Musical',
    'Historia',
    'Bélica',
  ];

  readonly preferences = signal<CinematicPreferences>({
    userId: '',
    favoriteGenres: [],
    favoriteActors: [],
    favoriteDirectors: [],
    updatedAt: '',
  });

  /** Películas guardadas (persistidas en localStorage) */
  readonly savedMovies = signal<SavedMovie[]>([]);

  readonly actorInput = signal('');
  readonly directorInput = signal('');

  readonly actorResults = signal<Person[]>([]);
  readonly directorResults = signal<Person[]>([]);

  readonly selectedActor = signal<Person | null>(null);
  readonly selectedDirector = signal<Person | null>(null);

  readonly actorMovies = signal<PersonCredit[]>([]);
  readonly directorMovies = signal<PersonCredit[]>([]);

  readonly loadingActors = signal(false);
  readonly loadingDirectors = signal(false);
  readonly loadingActorMovies = signal(false);
  readonly loadingDirectorMovies = signal(false);

  readonly activeSection = signal<'profile' | 'preferences'>('profile');
  readonly savedMessage = signal(false);

  constructor() {
    const currentUser = this.user();

    if (currentUser) {
      this.preferences.set(this.preferencesService.getPreferences(currentUser.id));
      this.savedMovies.set(this.savedMoviesService.getMovies(currentUser.id));
    }
  }

  // --------------------------------------------------
  // NAVEGACIÓN DEL PERFIL
  // --------------------------------------------------

  selectSection(section: FilterType): void {
    if (section !== 'profile' && section !== 'preferences') {
      return;
    }

    this.activeSection.set(section);
    this.savedMessage.set(false);
  }

  // --------------------------------------------------
  // GÉNEROS FAVORITOS
  // --------------------------------------------------

  isGenreSelected(genre: string): boolean {
    return this.preferences().favoriteGenres.includes(genre);
  }

  toggleGenre(genre: string): void {
    const current = this.preferences();

    const favoriteGenres = this.isGenreSelected(genre)
      ? current.favoriteGenres.filter((item) => item !== genre)
      : [...current.favoriteGenres, genre];

    this.updatePreferences({ favoriteGenres });
  }

  // --------------------------------------------------
  // ACTORES
  // --------------------------------------------------

  searchActors(): void {
    this.actorSearchSub?.unsubscribe();

    const query = this.actorInput().trim();

    if (!query) {
      this.actorResults.set([]);
      this.loadingActors.set(false);
      return;
    }

    this.loadingActors.set(true);

    this.actorSearchSub = this.personService.searchPeople(query).subscribe({
      next: (response) => {
        this.actorResults.set(
          response.results.filter((person) => person.known_for_department === 'Acting'),
        );
        this.loadingActors.set(false);
      },
      error: () => {
        this.actorResults.set([]);
        this.loadingActors.set(false);
      },
    });
  }

  selectActor(person: Person): void {
    this.actorMoviesSub?.unsubscribe();

    this.selectedActor.set(person);
    this.actorResults.set([]);
    this.actorMovies.set([]);
    this.loadingActorMovies.set(true);

    this.actorMoviesSub = this.personService.getPersonCredits(person.id).subscribe({
      next: (response: PersonCombinedCredits) => {
        const movies = response.cast.filter((credit) => credit.media_type === 'movie');

        this.actorMovies.set(this.uniqueById(movies));
        this.loadingActorMovies.set(false);
      },
      error: () => {
        this.actorMovies.set([]);
        this.loadingActorMovies.set(false);
      },
    });
  }

  addActor(): void {
    const actor = this.selectedActor();

    if (!actor) {
      return;
    }

    const current = this.preferences();
    const alreadyExists = current.favoriteActors.some(
      (item) => item.toLowerCase() === actor.name.toLowerCase(),
    );

    if (alreadyExists) {
      return;
    }

    this.updatePreferences({ favoriteActors: [...current.favoriteActors, actor.name] });
  }

  removeActor(actor: string): void {
    this.updatePreferences({
      favoriteActors: this.preferences().favoriteActors.filter((item) => item !== actor),
    });
  }

  // --------------------------------------------------
  // DIRECTORES
  // --------------------------------------------------

  searchDirectors(): void {
    this.directorSearchSub?.unsubscribe();

    const query = this.directorInput().trim();

    if (!query) {
      this.directorResults.set([]);
      this.loadingDirectors.set(false);
      return;
    }

    this.loadingDirectors.set(true);

    this.directorSearchSub = this.personService.searchPeople(query).subscribe({
      next: (response) => {
        this.directorResults.set(
          response.results.filter((person) => person.known_for_department === 'Directing'),
        );
        this.loadingDirectors.set(false);
      },
      error: () => {
        this.directorResults.set([]);
        this.loadingDirectors.set(false);
      },
    });
  }

  selectDirector(person: Person): void {
    this.directorMoviesSub?.unsubscribe();

    this.selectedDirector.set(person);
    this.directorResults.set([]);
    this.directorMovies.set([]);
    this.loadingDirectorMovies.set(true);

    this.directorMoviesSub = this.personService.getPersonCredits(person.id).subscribe({
      next: (response: PersonCombinedCredits) => {
        const movies = response.crew.filter(
          (credit) =>
            credit.media_type === 'movie' &&
            (credit.department === 'Directing' || credit.job === 'Director'),
        );

        this.directorMovies.set(this.uniqueById(movies));
        this.loadingDirectorMovies.set(false);
      },
      error: () => {
        this.directorMovies.set([]);
        this.loadingDirectorMovies.set(false);
      },
    });
  }

  addDirector(): void {
    const director = this.selectedDirector();

    if (!director) {
      return;
    }

    const current = this.preferences();
    const alreadyExists = current.favoriteDirectors.some(
      (item) => item.toLowerCase() === director.name.toLowerCase(),
    );

    if (alreadyExists) {
      return;
    }

    this.updatePreferences({ favoriteDirectors: [...current.favoriteDirectors, director.name] });
  }

  removeDirector(director: string): void {
    this.updatePreferences({
      favoriteDirectors: this.preferences().favoriteDirectors.filter((item) => item !== director),
    });
  }

  // --------------------------------------------------
  // PELÍCULAS GUARDADAS (localStorage)
  // --------------------------------------------------

  isMovieSaved(movieId: number): boolean {
    return this.savedMovies().some((movie) => movie.id === movieId);
  }

  toggleSavedMovie(credit: PersonCredit): void {
    if (this.isMovieSaved(credit.id)) {
      this.removeSavedMovie(credit.id);
      return;
    }

    const movie: SavedMovie = {
      id: credit.id,
      title: this.getCreditTitle(credit),
      posterPath: credit.poster_path,
      releaseDate: credit.release_date || '',
      savedAt: new Date().toISOString(),
    };

    this.persistSavedMovies([movie, ...this.savedMovies()]);
  }

  removeSavedMovie(movieId: number): void {
    this.persistSavedMovies(this.savedMovies().filter((movie) => movie.id !== movieId));
  }

  clearSavedMovies(): void {
    if (this.savedMovies().length === 0) {
      return;
    }

    if (!confirm('¿Eliminar todas tus películas guardadas?')) {
      return;
    }

    this.persistSavedMovies([]);
  }

  openSavedMovie(movie: SavedMovie): void {
    this.router.navigate(['/movie', movie.id]);
  }

  private persistSavedMovies(movies: SavedMovie[]): void {
    const currentUser = this.user();

    this.savedMovies.set(movies);

    if (currentUser) {
      this.savedMoviesService.saveMovies(currentUser.id, movies);
    }
  }

  // --------------------------------------------------
  // UTILIDADES E IMÁGENES
  // --------------------------------------------------

  private uniqueById(credits: PersonCredit[]): PersonCredit[] {
    const seen = new Set<number>();

    return credits.filter((credit) => {
      if (seen.has(credit.id)) {
        return false;
      }

      seen.add(credit.id);
      return true;
    });
  }

  getPersonImage(path: string | null): string {
    return this.personService.getImageUrl(path, 'w185');
  }

  getMovieImage(path: string | null): string {
    return this.movieService.getImageUrl(path, 'w500');
  }

  getCreditTitle(credit: PersonCredit): string {
    return credit.title || credit.name || 'Sin título';
  }

  openMovie(movie: PersonCredit): void {
    if (movie.media_type !== 'movie') {
      return;
    }

    this.router.navigate(['/movie', movie.id]);
  }

  // --------------------------------------------------
  // GUARDAR PREFERENCIAS
  // --------------------------------------------------

  savePreferences(): void {
    if (!this.user()) {
      return;
    }

    this.preferencesService.savePreferences(this.preferences());
    this.savedMessage.set(true);
  }

  private updatePreferences(changes: Partial<CinematicPreferences>): void {
    this.preferences.update((current) => ({ ...current, ...changes }));
    this.savedMessage.set(false);
  }

  // --------------------------------------------------
  // PERFIL
  // --------------------------------------------------

  getUserInitial(): string {
    const name = this.user()?.name?.trim();

    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  // --------------------------------------------------
  // LIMPIEZA
  // --------------------------------------------------

  ngOnDestroy(): void {
    this.actorSearchSub?.unsubscribe();
    this.directorSearchSub?.unsubscribe();
    this.actorMoviesSub?.unsubscribe();
    this.directorMoviesSub?.unsubscribe();
  }
}
