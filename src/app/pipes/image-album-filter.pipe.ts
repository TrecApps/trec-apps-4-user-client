import { Pipe, PipeTransform } from '@angular/core';
import { ImageEntry } from '../services/image-v2.service';

@Pipe({
  name: 'imageAlbumFilter'
})
export class ImageAlbumFilterPipe implements PipeTransform {

  transform(value: ImageEntry[], by: string): ImageEntry[] {

    if("*" == by)
      return value;
    return value.filter((entry: ImageEntry) => entry.record.album.includes(by));
  }

}
