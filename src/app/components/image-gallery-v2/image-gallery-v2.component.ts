import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { StylesService, UpSliderComponent } from '@tc/tc-ngx-general';
//import { ImageEntry } from '@tc/tc-ngx-general/lib/models/Image';
import SortedList from '@tc/tc-ngx-general/lib/models/SortedList';
import { ImageRecord, ImageState, ImageEntry } from '../../services/image-v2.service';
import { CommonModule } from '@angular/common';
import { ImageAlbumFilterPipe } from '../../pipes/image-album-filter.pipe';

@Component({
    selector: 'app-image-gallery-v2',
    imports: [
        CommonModule, ImageAlbumFilterPipe,
        UpSliderComponent
    ],
    templateUrl: './image-gallery-v2.component.html',
    styleUrl: './image-gallery-v2.component.css',
    standalone: true
})
export class ImageGalleryV2Component {
  // Inputs and outputs
  @Input()
  baseUrl: string = "";   // the URL where the image service can be accessed

  @Input()
  app: string = "main";   // The app being represented ('main' stands for all apps)

  @Input()
  show: boolean = false;

  @Output()
  onClose = new EventEmitter();

  // Basic Image Management
  imageEntries: ImageEntry[] = [];   // Stores the actual images
  size: number = 20;                  // Number of images to retrieve when seeking them
  done: boolean = false;             // Whether there are more images to retrieve
  showAll: boolean = true;            // show all images (if app is not 'main', this can be set to false, at which point, only the app images will be shown)


  // Managing the current image
  currentImage: ImageEntry | undefined; // the current image

  selectedFile:File | undefined;        // Image File
  selectedFileType: string| undefined;  // Type of image to upload (if uploading new image)

  filterBy: string = "*"; // Show by the current album







  albumList: SortedList<string> = new SortedList((a: string, b: string) => {
    return a.localeCompare(b);
  });

  // Services
  ss: StylesService;

  constructor(ss: StylesService){
    this.ss = ss;
  }

  // Album Management

  updateAlbumList(record: ImageRecord) {
    for(let album of record.album){
      if(!this.albumList.contains(album)){
        this.albumList.add(album);
      }
    }
  }

  getAlbumImage(albumName: string): string {
    let firstRecord: string | undefined;
    for(let c = 0; c < this.imageEntries.length; c++){
      let cur = this.imageEntries[c];
      if(cur.record.album.includes(albumName)){
        firstRecord = cur.src;
        break;
      }
    }

    return firstRecord || "assets/icons/X-image.png";

  }

  selectingAlbum: boolean = false;
  showImages: boolean = true;

  onSelectAlbum(album: string){
    if(this.selectingAlbum) return;

    this.selectingAlbum = true;

    this.showImages = false;

    setTimeout(()=> {
      if(this.filterBy == album){
        this.filterBy = "*";
      } else {
        this.filterBy = album;
      }
      this.showImages = true;

      setTimeout(()=> this.selectingAlbum = false, 330)
    }, 330);
  }

  constructImageEntry(record: ImageRecord): ImageEntry {
    let src: string;
    if(record.state == ImageState.PUBLIC)
      src = `${this.baseUrl}/Images/public/${record.id}`;
    else src = "assets/icons/non-profile.png";

    let ret: ImageEntry = {
      record,
      src
    };

    if(record.state != ImageState.PUBLIC){
      this.getBase64Version(ret);
    }
    return ret;

  }

  getBase64Version(entry: ImageEntry){

  }







      //// Image Cropping Support ////

      isCropping: boolean = false;
      cropChanged: boolean = false;
      isCropDragging: boolean = false;
    
      // Track the image parameters
      imageWidth: number = 0;
      imageWidthReal: number = 0;
      imageHeight: number = 0;
      imageHeightReal: number = 0;
    
      offset: {x: number, y: number} = {x:0, y:0};
      squarePosition: {left: number, top: number} = {left: 50, top: 50};
    
      // Size Attributes
      squareSize: number = 150;
      isResizing: boolean = false;
    
      @ViewChild('selectedImg')
      selectedImg: ElementRef<HTMLImageElement> | undefined;
    
      selectedImagePrev: String| undefined;
}
