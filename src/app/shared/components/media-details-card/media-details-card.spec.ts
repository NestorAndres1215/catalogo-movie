import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaDetailsCard } from './media-details-card';

describe('MediaDetailsCard', () => {
  let component: MediaDetailsCard;
  let fixture: ComponentFixture<MediaDetailsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaDetailsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaDetailsCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
