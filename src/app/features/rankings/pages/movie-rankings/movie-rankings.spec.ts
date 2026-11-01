import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieRankings } from './movie-rankings';

describe('MovieRankings', () => {
  let component: MovieRankings;
  let fixture: ComponentFixture<MovieRankings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieRankings],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieRankings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
