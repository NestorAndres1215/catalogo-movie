import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreamingList } from './streaming-list';

describe('StreamingList', () => {
  let component: StreamingList;
  let fixture: ComponentFixture<StreamingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingList],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
