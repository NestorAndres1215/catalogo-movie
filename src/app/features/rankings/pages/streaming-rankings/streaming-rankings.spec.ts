import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreamingRankingsComponent } from './streaming-rankings';

describe('StreamingRankings', () => {
  let component: StreamingRankingsComponent;
  let fixture: ComponentFixture<StreamingRankingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingRankingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingRankingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
