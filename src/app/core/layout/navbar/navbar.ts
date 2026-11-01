import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
} from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { TmdbService } from '../../service/tmdb.service';

type SearchMediaType = 'movie' | 'tv' | 'person';

interface GlobalSearchResult {
  id: number;
  media_type: SearchMediaType;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  known_for_department?: string;
}

interface GlobalSearchResponse {
  results: GlobalSearchResult[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {

  private readonly authService = inject(AuthService);
  private readonly tmdbService = inject(TmdbService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  profileMenuOpen = signal(false);

  searchResults = signal<GlobalSearchResult[]>([]);
  searching = signal(false);
  searchOpen = signal(false);

  private readonly searchTerms = new Subject<string>();

  constructor() {
    this.searchTerms
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((query) => {
          this.searching.set(true);

          return this.tmdbService
            .get<GlobalSearchResponse>('/search/multi', {
              query,
              include_adult: false,
              page: 1,
            })
            .pipe(catchError(() => of({ results: [] })));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.searchResults.set(
          response.results
            .filter(
              (result) =>
                result.media_type === 'movie' ||
                result.media_type === 'tv' ||
                result.media_type === 'person',
            )
            .slice(0, 8),
        );

        this.searching.set(false);
      });
  }

  getUserInitial(): string {
    return this.currentUser()?.name.charAt(0).toUpperCase() ?? 'U';
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update((open) => !open);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  logout(): void {
    this.closeProfileMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch(query: string): void {
    const value = query.trim();

    if (value.length < 2) {
      this.searchResults.set([]);
      this.searching.set(false);
      this.searchOpen.set(false);
      return;
    }

    this.searchOpen.set(true);
    this.searchTerms.next(value);
  }

  onSearchFocus(): void {
    if (this.searchResults().length > 0) {
      this.searchOpen.set(true);
    }
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }

  getSearchTitle(result: GlobalSearchResult): string {
    return result.title ?? result.name ?? 'Sin título';
  }

  getSearchType(result: GlobalSearchResult): string {
    switch (result.media_type) {
      case 'movie':
        return 'Película';

      case 'tv':
        return 'Serie';

      case 'person':
        return result.known_for_department || 'Actor';
    }
  }

  getSearchImage(result: GlobalSearchResult): string {
    const path =
      result.media_type === 'person'
        ? result.profile_path
        : result.poster_path;

    return this.tmdbService.getImageUrl(
      path ?? null,
      result.media_type === 'person' ? 'w185' : 'w200',
    );
  }

  openSearchResult(result: GlobalSearchResult): void {
    let route: string;

    switch (result.media_type) {
      case 'movie':
        route = `/movies/${result.id}`;
        break;

      case 'tv':
        route = `/series/${result.id}`;
        break;

      case 'person':
        route = `/actors/${result.id}`;
        break;
    }

    this.searchOpen.set(false);
    this.searchResults.set([]);

    this.router.navigateByUrl(route);
  }
  sidebarOpen = input<boolean>(false);
toggleSidebar = output<void>();
}