import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmojiGame } from './emoji-game';

describe('EmojiGame', () => {
  let component: EmojiGame;
  let fixture: ComponentFixture<EmojiGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojiGame],
    }).compileComponents();

    fixture = TestBed.createComponent(EmojiGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
