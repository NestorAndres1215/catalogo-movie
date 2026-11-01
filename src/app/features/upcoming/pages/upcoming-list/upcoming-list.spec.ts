import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingList } from './upcoming-list';

describe('UpcomingList', () => {
  let component: UpcomingList;
  let fixture: ComponentFixture<UpcomingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingList],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
