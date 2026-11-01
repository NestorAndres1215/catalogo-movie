import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesRankings } from './series-rankings';

describe('SeriesRankings', () => {
  let component: SeriesRankings;
  let fixture: ComponentFixture<SeriesRankings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesRankings],
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesRankings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
