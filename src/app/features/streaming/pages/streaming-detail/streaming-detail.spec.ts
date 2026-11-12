import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreamingDetail } from './streaming-detail';

describe('StreamingDetail', () => {
  let component: StreamingDetail;
  let fixture: ComponentFixture<StreamingDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
