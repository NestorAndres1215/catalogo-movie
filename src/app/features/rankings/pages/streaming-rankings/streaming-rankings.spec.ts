import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreamingRankings } from './streaming-rankings';

describe('StreamingRankings', () => {
  let component: StreamingRankings;
  let fixture: ComponentFixture<StreamingRankings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingRankings],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingRankings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
