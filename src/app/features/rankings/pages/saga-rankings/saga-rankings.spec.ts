import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SagaRankings } from './saga-rankings';

describe('SagaRankings', () => {
  let component: SagaRankings;
  let fixture: ComponentFixture<SagaRankings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SagaRankings],
    }).compileComponents();

    fixture = TestBed.createComponent(SagaRankings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
