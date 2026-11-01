import { Injectable, Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';
import { MediaVideo, VideoResponse } from '../models/video.interface';

@Service()
export class VideoService {
  private readonly tmdbService = inject(TmdbService);

  getVideos(mediaType: 'movie' | 'tv', id: number): Observable<VideoResponse> {
    return this.tmdbService.get<VideoResponse>(`/${mediaType}/${id}/videos`);
  }

  getYoutubeUrl(key: string): string {
    return `https://www.youtube.com/embed/${key}`;
  }

  getYoutubeThumbnail(key: string): string {
    return `https://img.youtube.com/vi/${key}/hqdefault.jpg`;
  }

  getTrailers(videos: MediaVideo[]): MediaVideo[] {
    return videos.filter(
      (video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser'),
    );
  }
}
