import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopRankedRoomsComponent } from './top-ranked-rooms.component';

describe('TopRankedRoomsComponent', () => {
  let component: TopRankedRoomsComponent;
  let fixture: ComponentFixture<TopRankedRoomsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopRankedRoomsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopRankedRoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
