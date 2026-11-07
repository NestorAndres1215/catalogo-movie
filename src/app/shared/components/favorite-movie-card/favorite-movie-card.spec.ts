import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoriteMovieCard } from './favorite-movie-card';

describe('FavoriteMovieCard', () => {
  let component: FavoriteMovieCard;
  let fixture: ComponentFixture<FavoriteMovieCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteMovieCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteMovieCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
