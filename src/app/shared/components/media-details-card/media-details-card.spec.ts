import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaDetailsCardComponent } from './media-details-card';

describe('MediaDetailsCard', () => {
  let component: MediaDetailsCardComponent;
  let fixture: ComponentFixture<MediaDetailsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaDetailsCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaDetailsCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
