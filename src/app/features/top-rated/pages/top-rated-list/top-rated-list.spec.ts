import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopRatedListComponent } from './top-rated-list';

describe('TopRatedList', () => {
  let component: TopRatedListComponent;
  let fixture: ComponentFixture<TopRatedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopRatedListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopRatedListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
