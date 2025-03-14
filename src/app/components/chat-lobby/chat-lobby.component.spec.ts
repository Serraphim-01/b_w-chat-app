import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLobbyComponent } from './chat-lobby.component';

describe('ChatLobbyComponent', () => {
  let component: ChatLobbyComponent;
  let fixture: ComponentFixture<ChatLobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatLobbyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
