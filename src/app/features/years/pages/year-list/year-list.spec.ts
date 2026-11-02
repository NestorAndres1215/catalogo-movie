import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YearListComponent } from './year-list';

describe('YearList', () => {
  let component: YearListComponent;
  let fixture: ComponentFixture<YearListComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(YearListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
