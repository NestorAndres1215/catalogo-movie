import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopRatedList } from './top-rated-list';

describe('TopRatedList', () => {
  let component: TopRatedList;
  let fixture: ComponentFixture<TopRatedList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopRatedList],
    }).compileComponents();

    fixture = TestBed.createComponent(TopRatedList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
