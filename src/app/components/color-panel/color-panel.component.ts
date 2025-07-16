import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';


export interface ColorOption{
  colorStyle: string;
  styleName: string;
}

@Component({
  selector: 'app-color-panel',
  imports: [CommonModule],
  templateUrl: './color-panel.component.html',
  styleUrl: './color-panel.component.css'
})
export class ColorPanelComponent {

  @Input()
  colors: ColorOption[] = [];

  @Output()
  onColorSelect = new EventEmitter<string>();


}
