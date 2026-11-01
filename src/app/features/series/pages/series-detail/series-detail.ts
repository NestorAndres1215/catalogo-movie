
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SeriesService } from '../../../../core/service/series.service';
import {
  TvSeries,
  SeriesCreator,
  SeriesSeason
} from '../../../../core/models/series.interface';

import { SeriesCredits } from '../../../../core/models/series-credits.interface';

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './series-detail.html',
  styleUrl: './series-detail.css'
})
export class SeriesDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly seriesService = inject(SeriesService);

  series = signal<TvSeries | null>(null);
  credits = signal<SeriesCredits | null>(null);

  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('El identificador de la serie no es válido.');
      this.loading.set(false);
      return;
    }

    this.loadSeries(id);
    this.loadCredits(id);
  }

  loadSeries(id: number): void {
    this.seriesService.getSeriesDetails(id).subscribe({
      next: response => {
        this.series.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la información de la serie.');
        this.loading.set(false);
      }
    });
  }

  loadCredits(id: number): void {
    this.seriesService.getSeriesCredits(id).subscribe({
      next: response => {
        this.credits.set(response);
      }
    });
  }

  getBackdrop(path: string | null): string {
    return this.seriesService.getImageUrl(path, 'original');
  }

  getPoster(path: string | null): string {
    return this.seriesService.getImageUrl(path, 'w500');
  }

  getProfile(path: string | null): string {
    return this.seriesService.getImageUrl(path, 'w185');
  }

  getYear(date: string | undefined): string {
    return date ? date.substring(0, 4) : 'Sin fecha';
  }

  get creators(): SeriesCreator[] {
    return this.series()?.created_by ?? [];
  }

  get seasons(): SeriesSeason[] {
    return this.series()?.seasons ?? [];
  }

  get cast() {
    return this.credits()?.cast.slice(0, 12) ?? [];
  }
}
