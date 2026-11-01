import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyRatingsList } from './my-ratings-list';

describe('MyRatingsList', () => {
  let component: MyRatingsList;
  let fixture: ComponentFixture<MyRatingsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRatingsList],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRatingsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
