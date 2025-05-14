import { Pipe, PipeTransform } from '@angular/core';
import { ImageRecord, ImageVisibilityOption } from '../services/image-v2.service';

@Pipe({
  name: 'imageVisibilityFilter'
})
export class ImageVisibilityFilterPipe implements PipeTransform {

  transform(value: ImageVisibilityOption[], image: ImageRecord): ImageVisibilityOption[] {
    console.log("Testing image state " + image.state + " and allow public " + image.allowPublic);
    return value.filter((option: ImageVisibilityOption) => {
      let ret = option.available(image)
      console.log("Result " + ret + " from " + option.optionName);
      return ret;
    });
  }

}
