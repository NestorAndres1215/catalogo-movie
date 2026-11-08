import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { CatalogService } from '../../../../core/service/catalog.service';
import { TmdbPerson } from '../../../../core/models/catalog.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { Footer } from '../../../../shared/components/footer/footer';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { FilterTab, FilterTabsComponent, FilterType } from '../../../../shared/components/filter-tabs/filter-tabs';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { RankingCardComponent } from '../../../../shared/components/ranking-card/ranking-card';


@Component({
  selector: 'app-actor-rankings',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, EmptyStateComponent, Footer, PageLoadingComponent, FilterTabsComponent, ButtonComponent, RankingCardComponent],
  templateUrl: './actor-rankings.html',
  styleUrl: './actor-rankings.css',
})
export class ActorRankingsComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);

  readonly activeRanking = signal<FilterType>('best');

  readonly bestActors = signal<TmdbPerson[]>([]);
  readonly worstActors = signal<TmdbPerson[]>([]);

  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.loadRankings();
  }
  readonly rankingTabs: FilterTab[] = [
    { label: 'Más populares', value: 'best' },
    { label: 'Menor popularidad', value: 'worst' },
  ];

  loadRankings(): void {
    this.loading.set(true);
    this.error.set('');

    // Consultamos las primeras 10 páginas de actores populares.
    const requests = Array.from({ length: 10 }, (_, index) =>
      this.catalogService.getPopularPeople(index + 1),
    );

    forkJoin(requests).subscribe({
      next: (responses) => {
        const actors = responses.flatMap((response) => response.results);

        // Eliminamos posibles duplicados por ID.
        const uniqueActors = Array.from(new Map(actors.map((actor) => [actor.id, actor])).values());

        const sortedActors = [...uniqueActors].sort((a, b) => b.popularity - a.popularity);

        this.bestActors.set(sortedActors.slice(0, 10));

        this.worstActors.set(
          [...uniqueActors].sort((a, b) => a.popularity - b.popularity).slice(0, 10),
        );

        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los rankings de actores.');
        this.loading.set(false);
      },
    });
  }

  changeRanking(type: FilterType): void {
    this.activeRanking.set(type);
  }

  getPoster(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/300x450/171717/ffffff?text=Sin+foto';
    }

    return this.catalogService.getImageUrl(path, 'w500');
  }

  getPopularity(popularity: number): string {
    return popularity.toFixed(2);
  }
}
