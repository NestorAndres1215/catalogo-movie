import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleaseCalendar } from './release-calendar';

describe('ReleaseCalendar', () => {
  let component: ReleaseCalendar;
  let fixture: ComponentFixture<ReleaseCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleaseCalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(ReleaseCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
