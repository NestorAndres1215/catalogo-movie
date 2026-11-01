import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecommendationList } from './recommendation-list';

describe('RecommendationList', () => {
  let component: RecommendationList;
  let fixture: ComponentFixture<RecommendationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendationList],
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
