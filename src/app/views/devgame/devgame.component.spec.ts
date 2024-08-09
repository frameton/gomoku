import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevgameComponent } from './devgame.component';

describe('DevgameComponent', () => {
  let component: DevgameComponent;
  let fixture: ComponentFixture<DevgameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevgameComponent]
    });
    fixture = TestBed.createComponent(DevgameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
