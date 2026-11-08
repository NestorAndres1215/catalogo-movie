import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardRankingDetailsComponent } from './movie-card-ranking-details';

describe('MovieCardRankingDetails', () => {
  let component: MovieCardRankingDetailsComponent;

  let fixture: ComponentFixture<MovieCardRankingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCardRankingDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardRankingDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
