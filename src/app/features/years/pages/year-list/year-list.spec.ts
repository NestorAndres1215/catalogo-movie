import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YearList } from './year-list';

describe('YearList', () => {
  let component: YearList;
  let fixture: ComponentFixture<YearList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearList],
    }).compileComponents();

    fixture = TestBed.createComponent(YearList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
