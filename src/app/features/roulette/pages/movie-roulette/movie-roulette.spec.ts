import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieRouletteComponent } from './movie-roulette';

describe('MovieRoulette', () => {
  let component: MovieRouletteComponent;
  let fixture: ComponentFixture<MovieRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieRouletteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieRouletteComponent);

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
