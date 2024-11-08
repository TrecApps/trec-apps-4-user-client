import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'masker',
  standalone: true
})
export class MaskerPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
