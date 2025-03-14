import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFriendsComponent } from './add-friends.component';

describe('AddFriendsComponent', () => {
  let component: AddFriendsComponent;
  let fixture: ComponentFixture<AddFriendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFriendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFriendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
