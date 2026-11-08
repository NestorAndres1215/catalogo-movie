import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesRankingsComponent } from './series-rankings';

describe('SeriesRankings', () => {
  let component: SeriesRankingsComponent;
  let fixture: ComponentFixture<SeriesRankingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesRankingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesRankingsComponent);

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
