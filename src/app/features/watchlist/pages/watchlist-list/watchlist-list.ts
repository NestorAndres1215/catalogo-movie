import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WatchlistService } from '../../../../core/service/watchlist.service';
import { DecimalPipe } from '@angular/common';


type WatchlistFilter = 'all' | 'movie' | 'tv';

@Component({
  selector: 'app-watchlist-list',
  standalone: true,
    imports: [DecimalPipe],
  templateUrl: './watchlist-list.html',
  styleUrl: './watchlist-list.css',
})
export class WatchlistListComponent {
  private readonly watchlistService = inject(WatchlistService);
  private readonly router = inject(Router);

  readonly selectedFilter = signal<WatchlistFilter>('all');

  readonly watchlist = this.watchlistService.watchlist;

  readonly filteredItems = computed(() => {
    const filter = this.selectedFilter();

    if (filter === 'all') {
      return this.watchlist();
    }

    return this.watchlist().filter((item) => item.mediaType === filter);
  });

  readonly totalMovies = computed(
    () => this.watchlist().filter((item) => item.mediaType === 'movie').length,
  );

  readonly totalSeries = computed(
    () => this.watchlist().filter((item) => item.mediaType === 'tv').length,
  );

  selectFilter(filter: WatchlistFilter): void {
    this.selectedFilter.set(filter);
  }

  openDetails(item: { id: number; mediaType: 'movie' | 'tv' }): void {
    if (item.mediaType === 'movie') {
      this.router.navigate(['/movies', item.id]);
      return;
    }

    this.router.navigate(['/series', item.id]);
  }

  removeItem(id: number, mediaType: 'movie' | 'tv'): void {
    this.watchlistService.remove(id, mediaType);
  }

  clearWatchlist(): void {
    this.watchlistService.clear();
  }

  getImageUrl(path: string | null): string {
    if (!path) {
      return 'assets/images/no-poster.png';
    }

    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  getReleaseYear(date: string): string {
    if (!date) {
      return 'Sin fecha';
    }

    return date.substring(0, 4);
  }
}
