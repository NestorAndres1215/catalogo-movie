import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

import { MovieService } from '../../../../core/service/movie.service';
import { SeriesService } from '../../../../core/service/series.service';
import { VideoService } from '../../../../core/service/video.service';

import { MediaVideo } from '../../../../core/models/video.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent],
  templateUrl: './video-list.html',
  styleUrl: './video-list.css',
})
export class VideoListComponent {
  private readonly movieService = inject(MovieService);
  private readonly seriesService = inject(SeriesService);
  private readonly videoService = inject(VideoService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly mediaType = signal<'movie' | 'tv'>('movie');

  readonly videos = signal<MediaVideo[]>([]);
  readonly selectedVideo = signal<MediaVideo | null>(null);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly selectedFilter = signal('all');

  constructor() {
    this.loadPopularMovies();
  }

  loadPopularMovies(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.movieService.getPopularMovies().subscribe({
      next: (response) => {
        const requests = response.results
          .slice(0, 10)
          .map((movie) => this.videoService.getVideos('movie', movie.id));

        this.loadVideoResults(requests);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudieron cargar las películas.');
      },
    });
  }

  loadPopularSeries(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.seriesService.getPopularSeries().subscribe({
      next: (response) => {
        const requests = response.results
          .slice(0, 10)
          .map((series) => this.videoService.getVideos('tv', series.id));

        this.loadVideoResults(requests);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudieron cargar las series.');
      },
    });
  }

  private loadVideoResults(requests: ReturnType<VideoService['getVideos']>[]): void {
    if (requests.length === 0) {
      this.videos.set([]);
      this.loading.set(false);
      return;
    }

    forkJoin(requests).subscribe({
      next: (responses) => {
        const allVideos = responses.flatMap((response) => response.results);

        const youtubeVideos = allVideos.filter((video) => video.site === 'YouTube');

        const uniqueVideos = Array.from(
          new Map(youtubeVideos.map((video) => [video.id, video])).values(),
        );

        this.videos.set(uniqueVideos);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No se pudieron cargar los trailers y videos.');
      },
    });
  }

  changeMediaType(type: 'movie' | 'tv'): void {
    this.mediaType.set(type);
    this.selectedVideo.set(null);
    this.selectedFilter.set('all');
    this.videos.set([]);

    if (type === 'movie') {
      this.loadPopularMovies();
    } else {
      this.loadPopularSeries();
    }
  }

  filterVideos(filter: string): void {
    this.selectedFilter.set(filter);
  }

  get filteredVideos(): MediaVideo[] {
    const filter = this.selectedFilter();

    if (filter === 'all') {
      return this.videos();
    }

    if (filter === 'official') {
      return this.videos().filter((video) => video.official);
    }

    return this.videos().filter((video) => video.type === filter);
  }

  playVideo(video: MediaVideo): void {
    this.selectedVideo.set(video);
  }

  closeVideo(): void {
    this.selectedVideo.set(null);
  }

  getYoutubeUrl(key: string): string {
    return this.videoService.getYoutubeUrl(key);
  }

  getSafeYoutubeUrl(key: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.getYoutubeUrl(key));
  }

  getYoutubeThumbnail(key: string): string {
    return `https://img.youtube.com/vi/${key}/hqdefault.jpg`;
  }
}
