import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TrendingService } from '../../../../core/service/trending.service';
import { TrendingMedia } from '../../../../core/models/trending.interface';
import { FavoriteButtonComponent } from '../../../../shared/components/favorite-button/favorite-button';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-trending-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    FavoriteButtonComponent,
    PageHeaderComponent
],
  templateUrl: './trending-list.html',
  styleUrl: './trending-list.css'
})
export class TrendingListComponent implements OnInit {

  private readonly trendingService = inject(TrendingService);

  readonly mediaType = signal<'all' | 'movie' | 'tv'>('all');
  readonly timeWindow = signal<'day' | 'week'>('day');

  readonly trending = signal<TrendingMedia[]>([]);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalResults = signal(0);

  private requestVersion = 0;

  ngOnInit(): void {
    this.loadTrending();
  }

  loadTrending(): void {
    const version = ++this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    this.trendingService.getTrending(
      this.mediaType(),
      this.timeWindow(),
      this.currentPage()
    ).subscribe({
      next: (response) => {
        if (version !== this.requestVersion) return;

        this.trending.set(response.results);
        this.totalPages.set(Math.min(response.total_pages, 500));
        this.totalResults.set(response.total_results);
        this.loading.set(false);
      },
      error: (error) => {
        if (version !== this.requestVersion) return;

        console.error('Error al cargar tendencias:', error);

        this.trending.set([]);
        this.totalPages.set(1);
        this.totalResults.set(0);
        this.errorMessage.set(
          'No se pudieron cargar las tendencias. Inténtalo nuevamente.'
        );

        this.loading.set(false);
      }
    });
  }

  changeMediaType(type: 'all' | 'movie' | 'tv'): void {
    if (this.mediaType() === type) return;

    this.mediaType.set(type);
    this.currentPage.set(1);
    this.loadTrending();
  }

  changeTimeWindow(window: 'day' | 'week'): void {
    if (this.timeWindow() === window) return;

    this.timeWindow.set(window);
    this.currentPage.set(1);
    this.loadTrending();
  }

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages() ||
      this.loading()
    ) {
      return;
    }

    this.currentPage.set(page);
    this.loadTrending();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  getImageUrl(path: string | null): string {
    return this.trendingService.getImageUrl(path);
  }

  getMediaTitle(item: TrendingMedia): string {
    return item.title || item.name || 'Sin título';
  }

  getMediaDate(item: TrendingMedia): string {
    return item.release_date || item.first_air_date || '';
  }

  getMediaType(item: TrendingMedia): 'movie' | 'tv' {
    if (item.media_type) {
      return item.media_type;
    }

    return this.mediaType() === 'tv' ? 'tv' : 'movie';
  }

  getMediaRoute(item: TrendingMedia): string[] {
    const type = this.getMediaType(item);

    return type === 'movie'
      ? ['/movies', String(item.id)]
      : ['/series', String(item.id)];
  }

  getMediaLabel(item: TrendingMedia): string {
    return this.getMediaType(item) === 'movie'
      ? 'Película'
      : 'Serie';
  }
}
