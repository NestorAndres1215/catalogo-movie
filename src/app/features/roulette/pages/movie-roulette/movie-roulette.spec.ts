import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieRoulette } from './movie-roulette';

describe('MovieRoulette', () => {
  let component: MovieRoulette;
  let fixture: ComponentFixture<MovieRoulette>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieRoulette],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieRoulette);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
