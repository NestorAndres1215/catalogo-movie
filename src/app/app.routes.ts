import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((m) => m.RegisterComponent),
  },

  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./shared/main-layout/main-layout').then((m) => m.MainLayoutComponent),

    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/pages/home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'movies',
        loadComponent: () =>
          import('./features/movies/pages/movie-list/movie-list').then((m) => m.MovieListComponent),
      },
      {
        path: 'movies/:id',
        loadComponent: () =>
          import('./features/movies/pages/movie-detail/movie-detail').then(
            (m) => m.MovieDetailComponent,
          ),
      },
      {
        path: 'series',
        loadComponent: () =>
          import('./features/series/pages/series-list/series-list').then(
            (m) => m.SeriesListComponent,
          ),
      },
      {
        path: 'series/:id',
        loadComponent: () =>
          import('./features/series/pages/series-detail/series-detail').then(
            (m) => m.SeriesDetailComponent,
          ),
      },

      {
        path: 'actors',
        loadComponent: () =>
          import('./features/actors/pages/actor-list/actor-list').then((m) => m.ActorListComponent),
      },
      {
        path: 'actors/:id',
        loadComponent: () =>
          import('./features/actors/pages/actor-detail/actor-detail').then(
            (m) => m.ActorDetailComponent,
          ),
      },
      {
        path: 'directors',
        loadComponent: () =>
          import('./features/directors/pages/director-list/director-list').then(
            (m) => m.DirectorListComponent,
          ),
      },
      {
        path: 'directors/:id',
        loadComponent: () =>
          import('./features/directors/pages/director-detail/director-detail').then(
            (m) => m.DirectorDetailComponent,
          ),
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/companies/pages/company-list/company-list').then(
            (m) => m.CompanyListComponent,
          ),
      },
      {
        path: 'companies/:id',
        loadComponent: () =>
          import('./features/companies/pages/company-detail/company-detail').then(
            (m) => m.CompanyDetailComponent,
          ),
      },
      {
        path: 'genres',
        loadComponent: () =>
          import('./features/genre/pages/genre-list/genre-list').then((m) => m.GenreListComponent),
      },
      {
        path: 'genres/:type/:id',
        loadComponent: () =>
          import('./features/genre/pages/genre-detail/genre-detail').then(
            (m) => m.GenreDetailComponent,
          ),
      },
      {
        path: 'countries',
        loadComponent: () =>
          import('./features/countries/pages/country-list/country-list').then(
            (m) => m.CountryListComponent,
          ),
      },
      {
        path: 'countries/:code',
        loadComponent: () =>
          import('./features/countries/pages/country-detail/country-detail').then(
            (m) => m.CountryDetailComponent,
          ),
      },
      {
        path: 'years',
        loadComponent: () =>
          import('./features/years/pages/year-list/year-list').then((m) => m.YearListComponent),
      },
      {
        path: 'recommendations',
        loadComponent: () =>
          import('./features/recommendations/pages/recommendation-list/recommendation-list').then(
            (m) => m.RecommendationListComponent,
          ),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./features/favorites/pages/favorite-list/favorite-list').then(
            (m) => m.FavoriteListComponent,
          ),
      },
      {
        path: 'watchlist',
        loadComponent: () =>
          import('./features/watchlist/pages/watchlist-list/watchlist-list').then(
            (m) => m.WatchlistListComponent,
          ),
      },
      {
        path: 'watched',
        loadComponent: () =>
          import('./features/watchlist/pages/watched-movies-list/watched-movies-list').then(
            (m) => m.WatchedMoviesListComponent,
          ),
      },
      {
        path: 'ratings',
        loadComponent: () =>
          import('./features/watchlist/pages/my-ratings-list/my-ratings-list').then(
            (m) => m.MyRatingsListComponent,
          ),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./features/library/pages/statistics/statistics').then(
            (m) => m.StatisticsComponent,
          ),
      },
      {
        path: 'trending',
        loadComponent: () =>
          import('./features/trending/pages/trending-list/trending-list').then(
            (m) => m.TrendingListComponent,
          ),
      },
      {
        path: 'top-rated',
        loadComponent: () =>
          import('./features/top-rated/pages/top-rated-list/top-rated-list').then(
            (m) => m.TopRatedListComponent,
          ),
      },
      {
        path: 'upcoming',
        loadComponent: () =>
          import('./features/upcoming/pages/upcoming-list/upcoming-list').then(
            (m) => m.UpcomingListComponent,
          ),
      },
      {
        path: 'collections',
        loadComponent: () =>
          import('./features/collections/pages/collection-list/collection-list').then(
            (m) => m.CollectionListComponent,
          ),
      },
      {
        path: 'videos',
        loadComponent: () =>
          import('./features/videos/pages/video-list/video-list').then((m) => m.VideoListComponent),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/reviews/pages/review-list/review-list').then(
            (m) => m.ReviewListComponent,
          ),
      },
      {
        path: 'streaming',
        loadComponent: () =>
          import('./features/streaming/pages/streaming-list/streaming-list').then(
            (m) => m.StreamingListComponent,
          ),
      },
      {
        path: 'decades',
        loadComponent: () =>
          import('./features/decades/pages/decades-list/decades-list').then(
            (m) => m.DecadesListComponent,
          ),
      },
      {
        path: 'platform-comparison',
        loadComponent: () =>
          import('./features/platform-comparison/pages/platform-comparison/platform-comparison').then(
            (m) => m.PlatformComparisonComponent,
          ),
      },
      {
        path: 'timeline',
        loadComponent: () =>
          import('./features/timeline/pages/timeline-list/timeline-list').then(
            (m) => m.TimelineListComponent,
          ),
      },
      {
        path: 'languages',
        loadComponent: () =>
          import('./features/languages/pages/language-list/language-list').then(
            (m) => m.LanguageListComponent,
          ),
      },
      {
        path: 'roulette',
        loadComponent: () =>
          import('./features/roulette/pages/movie-roulette/movie-roulette').then(
            (m) => m.MovieRouletteComponent,
          ),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/pages/release-calendar/release-calendar').then(
            (m) => m.ReleaseCalendarComponent,
          ),
      },
      {
        path: 'games/emoji',
        loadComponent: () =>
          import('./features/games/pages/emoji-game/emoji-game').then((m) => m.EmojiGameComponent),
      },
      {
        path: 'games/random-challenge',
        loadComponent: () =>
          import('./features/games/pages/random-challenge/random-challenge').then(
            (m) => m.RandomChallengeComponent,
          ),
      },
      {
        path: 'games/trivia',
        loadComponent: () =>
          import('./features/games/pages/movie-trivia/movie-trivia').then(
            (m) => m.MovieTriviaComponent,
          ),
      },
      {
        path: 'rankings/movies',
        loadComponent: () =>
          import('./features/rankings/pages/movie-rankings/movie-rankings').then(
            (m) => m.MovieRankingsComponent,
          ),
      },
      {
        path: 'rankings/series',
        loadComponent: () =>
          import('./features/rankings/pages/series-rankings/series-rankings').then(
            (m) => m.SeriesRankingsComponent,
          ),
      },
      {
        path: 'rankings/actors',
        loadComponent: () =>
          import('./features/rankings/pages/actor-rankings/actor-rankings').then(
            (m) => m.ActorRankingsComponent,
          ),
      },
      {
        path: 'rankings/sagas',
        loadComponent: () =>
          import('./features/rankings/pages/saga-rankings/saga-rankings').then(
            (m) => m.SagaRankingsComponent,
          ),
      },
      {
        path: 'rankings/streaming',
        loadComponent: () =>
          import('./features/rankings/pages/streaming-rankings/streaming-rankings').then(
            (m) => m.StreamingRankingsComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/cinematic-profile/cinematic-profile').then(
            (m) => m.CinematicProfile,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/pages/settings/settings').then((m) => m.Settings),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
