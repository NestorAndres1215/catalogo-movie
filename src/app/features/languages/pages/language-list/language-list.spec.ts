import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageList } from './language-list';

describe('LanguageList', () => {
  let component: LanguageList;
  let fixture: ComponentFixture<LanguageList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageList],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
