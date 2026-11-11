import { Component, OnInit, inject, signal } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { forkJoin } from 'rxjs';

import { CompanyDetails } from '../../../../core/models/company.interface';

import { CompanyMovie } from '../../../../core/models/company-movie.interface';

import { CompanyService } from '../../../../core/service/company.service';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { StatItem, StatsComponent } from '../../../../shared/components/stats/stats';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { MediaCardComponent } from '../../../../shared/components/media-card/media-card';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    RouterLink,
    PageLoadingComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    StatsComponent,
    ResultsHeaderComponent,
    MediaCardComponent,
  ],
  templateUrl: './company-detail.html',
  styleUrl: './company-detail.css',
})
export class CompanyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly companyService = inject(CompanyService);

  // =========================================
  // ESTADOS
  // =========================================

  company = signal<CompanyDetails | null>(null);

  movies = signal<CompanyMovie[]>([]);

  loading = signal<boolean>(true);

  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (!id || Number.isNaN(id)) {
        this.errorMessage.set('El identificador de la productora no es válido.');

        this.loading.set(false);

        return;
      }

      this.loadCompany(id);
    });
  }

  // =========================================
  // CARGAR PRODUCTORA
  // =========================================

  loadCompany(id: number): void {
    this.loading.set(true);

    this.errorMessage.set('');

    this.company.set(null);

    this.movies.set([]);

    forkJoin({
      company: this.companyService.getCompanyDetails(id),
      movies: this.companyService.getCompanyMovies(id, 1),
    }).subscribe({
      next: (response) => {
        this.company.set(response.company);

        this.movies.set(response.movies.results);

        this.loading.set(false);
      },

      error: (error) => {
        console.error('Error cargando productora:', error);

        this.errorMessage.set('No se pudo cargar la información de la productora.');

        this.loading.set(false);
      },
    });
  }

  get companyStats(): StatItem[] {
    const company = this.company();

    if (!company) {
      return [];
    }

    return [
      {
        icon: 'fa-flag',
        value: company.origin_country || 'No disponible',
        label: 'País de origen',
      },
      {
        icon: 'fa-location-dot',
        value: company.headquarters || 'No disponible',
        label: 'Ubicación principal',
      },
      {
        icon: 'fa-building',
        value: company.parent_company?.name || 'No disponible',
        label: 'Empresa matriz',
      },
      {
        icon: 'fa-fingerprint',
        value: company.id,
        label: 'Identificador TMDB',
      },
    ];
  }
  // =========================================
  // LOGOTIPO
  // =========================================

  getLogo(path: string | null): string {
    return this.companyService.getLogoUrl(path, 'w500');
  }

  // =========================================
  // POSTER DE PELÍCULA
  // =========================================

  getPoster(path: string | null): string {
    return this.companyService.getMoviePoster(path, 'w500');
  }

  // =========================================
  // FORMATEAR FECHA
  // =========================================

  formatDate(date: string): string {
    if (!date) {
      return 'Fecha no disponible';
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Fecha no disponible';
    }

    return parsedDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
