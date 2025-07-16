import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPanelComponent } from './color-panel.component';

describe('ColorPanelComponent', () => {
  let component: ColorPanelComponent;
  let fixture: ComponentFixture<ColorPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
