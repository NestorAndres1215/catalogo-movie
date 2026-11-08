import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RankingCard } from './ranking-card';

describe('RankingCard', () => {
  let component: RankingCard;
  let fixture: ComponentFixture<RankingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankingCard],
    }).compileComponents();

    fixture = TestBed.createComponent(RankingCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
