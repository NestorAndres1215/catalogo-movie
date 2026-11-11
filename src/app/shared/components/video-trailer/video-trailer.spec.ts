import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoTrailer } from './video-trailer';

describe('VideoTrailer', () => {
  let component: VideoTrailer;
  let fixture: ComponentFixture<VideoTrailer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoTrailer],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoTrailer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
