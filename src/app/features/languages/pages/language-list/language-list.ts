import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { CatalogService } from '../../../../core/service/catalog.service';
import {
  CatalogMedia,
  CatalogResponse,
  TmdbLanguage,
} from '../../../../core/models/catalog.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import {
  FilterTab,
  FilterTabsComponent,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import {
  FilterOption,
  SelectFilterComponent,
} from '../../../../shared/components/select-filter/select-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-language-list',
  standalone: true,
  imports: [
    DecimalPipe,
    PageHeaderComponent,
    PageLoadingComponent,
    FilterTabsComponent,
    EmptyStateComponent,
    SelectFilterComponent,
    PaginationComponent
],
  templateUrl: './language-list.html',
  styleUrl: './language-list.css',
})
export class LanguageListComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);

  readonly languages = signal<TmdbLanguage[]>([]);
  readonly movies = signal<CatalogMedia[]>([]);

  readonly selectedLanguage = signal('es');
  readonly mediaType = signal<'movie' | 'tv'>('movie');

  readonly page = signal(1);
  readonly totalPages = signal(1);

  readonly loadingLanguages = signal(false);
  readonly loadingContent = signal(false);
  readonly errorMessage = signal('');

  private requestVersion = 0;
  readonly mediaTabs: FilterTab[] = [
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];
  ngOnInit(): void {
    this.loadLanguages();
  }

  loadLanguages(): void {
    this.loadingLanguages.set(true);

    this.catalogService.getLanguages().subscribe({
      next: (response) => {
        const sortedLanguages = [...response].sort((a, b) => {
          const nameA = a.name || a.english_name;
          const nameB = b.name || b.english_name;

          return nameA.localeCompare(nameB);
        });

        this.languages.set(sortedLanguages);
        this.loadingLanguages.set(false);

        this.loadContent();
      },
      error: () => {
        this.loadingLanguages.set(false);
        this.errorMessage.set('No se pudieron cargar los idiomas.');
      },
    });
  }

  loadContent(): void {
    const currentVersion = ++this.requestVersion;

    this.loadingContent.set(true);
    this.errorMessage.set('');

    this.catalogService
      .getContentByLanguage(this.mediaType(), this.selectedLanguage(), this.page())
      .subscribe({
        next: (response: CatalogResponse) => {
          if (currentVersion !== this.requestVersion) {
            return;
          }

          this.movies.set(response.results);
          this.totalPages.set(Math.min(response.total_pages, 500));
          this.loadingContent.set(false);
        },
        error: () => {
          if (currentVersion !== this.requestVersion) {
            return;
          }

          this.movies.set([]);
          this.loadingContent.set(false);
          this.errorMessage.set('No se pudo cargar el contenido. Inténtalo nuevamente.');
        },
      });
  }

  changeLanguage(value: string): void {
    this.selectedLanguage.set(value);
    this.page.set(1);
    this.loadContent();
  }

  changeMediaType(type: FilterType): void {
    if (type !== 'movie' && type !== 'tv') {
      return;
    }

    if (this.mediaType() === type) {
      return;
    }

    this.mediaType.set(type);
    this.page.set(1);
    this.loadContent();
  }

  previousPage(): void {
    if (this.page() <= 1 || this.loadingContent()) {
      return;
    }

    this.page.update((current) => current - 1);
    this.loadContent();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  nextPage(): void {
    if (this.page() >= this.totalPages() || this.loadingContent()) {
      return;
    }

    this.page.update((current) => current + 1);
    this.loadContent();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
changePage(page: number): void {
  if (page < 1 || page > this.totalPages()) return;

  if (page < this.page()) {
    this.previousPage();
  } else if (page > this.page()) {
    this.nextPage();
  }
}
  getImageUrl(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/500x750/171717/ffffff?text=Sin+poster';
    }

    return this.catalogService.getImageUrl(path, 'w500');
  }

  getTitle(media: CatalogMedia): string {
    return media.title || media.name || 'Sin título';
  }
  readonly languageOptions = computed<FilterOption[]>(() =>
    this.languages().map((language) => ({
      label: `${language.name || language.english_name} (${language.iso_639_1})`,
      value: language.iso_639_1,
    })),
  );
  getReleaseDate(media: CatalogMedia): string {
    const date = media.release_date || media.first_air_date;

    return date ? date.substring(0, 4) : 'Sin fecha';
  }

  getSelectedLanguageName(): string {
    const language = this.languages().find((item) => item.iso_639_1 === this.selectedLanguage());

    if (!language) {
      return this.selectedLanguage();
    }

    return language.name || language.english_name;
  }
}
