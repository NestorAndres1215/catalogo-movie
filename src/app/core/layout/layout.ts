import { Component, inject, signal } from '@angular/core';
import { Sidebar } from './sidebar/sidebar';
import { AuthService } from '../service/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { TmdbService } from '../service/tmdb.service';
import { NavbarComponent } from './navbar/navbar';
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
  imports: [Sidebar, RouterOutlet, NavbarComponent],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
