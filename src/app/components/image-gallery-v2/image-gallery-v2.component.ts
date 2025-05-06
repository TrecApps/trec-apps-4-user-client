import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { ImageService, StylesService, UpSliderComponent } from '@tc/tc-ngx-general';
//import { ImageEntry } from '@tc/tc-ngx-general/lib/models/Image';
import { SortedList } from '../../models/SortedList';
import { ImageRecord, ImageState, ImageEntry, ImageV2Service } from '../../services/image-v2.service';
import { CommonModule } from '@angular/common';
import { ImageAlbumFilterPipe } from '../../pipes/image-album-filter.pipe';
import { FormsModule } from '@angular/forms';
import { ResponseObj } from '@tc/tc-ngx-general/lib/models/ResponseObj';

@Component({
    selector: 'app-image-gallery-v2',
    imports: [
        CommonModule, ImageAlbumFilterPipe, FormsModule,
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

  albumList: SortedList<string> = new SortedList((a: string, b: string) => {
    return a.localeCompare(b);
  });


  onOpen(){
    this.albumList.clear();
    this.show = true;
    this.addedAlbum = false;
    this.retrieveImages();
  }

  retrieveImages(){
    this.imageService.retrieveImageList(this.currentImagePage, this.size, this.app === "main" ? undefined : this.app, undefined).subscribe(
      {
        next: (records: ImageRecord[]) => {
          if(records.length < this.size){
            this.done = true;
          }
          this.size++;
          let newEntries = records.map((ir: ImageRecord) => this.constructImageEntry(ir));
          this.imageEntries = this.imageEntries.concat(newEntries);
          records.forEach((record: ImageRecord) => this.updateAlbumList(record));
        }
      }
    )
  }

  // Basic Image Management
  imageEntries: ImageEntry[] = [];   // Stores the actual images
  size: number = 20;                  // Number of images to retrieve when seeking them
  currentImagePage: number = 0;
  done: boolean = false;             // Whether there are more images to retrieve
  showAll: boolean = true;            // show all images (if app is not 'main', this can be set to false, at which point, only the app images will be shown)


  // Managing the current image
  currentImage: ImageEntry | undefined; // the current image
  prevImage: ImageEntry | undefined; // the previously selected image (helps track Cropping)

  selectedFile:File | undefined;        // Image File
  selectedFileType: string| undefined;  // Type of image to upload (if uploading new image)

  filterBy: string = "*"; // Show by the current album


  // Services
  ss: StylesService;

  constructor(ss: StylesService, private imageService: ImageV2Service){
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
  addedAlbum: boolean = false;

  onAddAlbum(){
    let albumName = prompt("Enter Album Name");
    if(albumName === null) return;

    albumName = albumName.trim();
    console.log("Profile Name: ", albumName)
    console.log(this.albumList.items);

    if(this.albumList.contains(albumName))
    {
      alert("Album already exists!")
      
      return;
    }

    this.albumList.add(albumName);
    this.addedAlbum=true;
  }

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
      if(record.id !== undefined)
        this.imageService.retrieveImageAsBase64(record.id, "ignore").subscribe({
          next: (obj: ResponseObj) => {
            ret.src = obj.message.toString()
          }
      })
    }
    return ret;

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

  setCropInEntry(){
    if(!this.isCropping || !this.currentImage) return;

        // ration to account for the difference between the screen image size (frontend),
    // and the actual image size (as handled on the backend)
    let ratio = this.imageWidthReal / this.imageWidth;

    // Backend expects these values in integers, so do some rounding
    let actSize = Math.round(this.squareSize * ratio);
    let cropDetails: number[] = [
      Math.round(this.squarePosition.left * ratio),
      Math.round(this.squarePosition.top * ratio),
      actSize,
      actSize
    ];

    this.currentImage.record.defaultCrop = cropDetails.join(',');
  }

  onUpdateCrop(){
    
    if(!this.currentImage) return;
    
    this.setCropInEntry();

    if(!this.isCropping){
      this.currentImage.record.defaultCrop = undefined;
    }

    if(this.currentImage.record.id === undefined){


      return; // Nothing else to do, let user know to post the image
    }

    this.imageService.updateCrop(this.currentImage.record.id, this.currentImage.record.defaultCrop).subscribe({
      next: (v: ResponseObj) => {
        alert(v.message);
        this.cropChanged = false;
      },
      error: (v: ResponseObj) => alert(v.message)
    });

  }

    // Sets the image width and height stats, to be called before use and after window resizes
    setImageParams(){
      if(!this.selectedImg) return;
  
      this.imageWidth = this.selectedImg.nativeElement.width;
      this.imageWidthReal = this.selectedImg.nativeElement.naturalWidth;
      this.imageHeight = this.selectedImg.nativeElement.height;
      this.imageHeightReal = this.selectedImg.nativeElement.naturalHeight;
    }
  
    onDragMouseDown(event: MouseEvent){
      event.preventDefault();
      this.isCropDragging = true;
      this.offset.x = event.clientX - this.squarePosition.left;
      this.offset.y = event.clientY - this.squarePosition.top;
    }
  
    @HostListener("window:resize")
    onImageResize(){
      if(!this.selectedImg) return;
  
      let ratio = this.selectedImg.nativeElement.width / this.imageWidth;
      this.squareSize *= ratio;
      this.squarePosition.left *= ratio;
      this.squarePosition.top *= ratio;
  
      this.setImageParams();
  
    }

  // To be called when the user clicks on the check to crop checkbox
  onCropCheck(){
    if(!this.currentImage)return;
  
    if(this.isCropping && this.selectedImg){
        
      this.setImageParams();
  
      // if currently on the same image, no need to adjust the cropping
      if(this.currentImage == this.prevImage) return;
  
      this.squareSize = 150;
  
      let remainder = this.imageWidth - this.squareSize;
      if(remainder < 0) {
        this.squareSize = this.imageWidth;
        this.squarePosition.left = 0;
      } else {
        this.squarePosition.left = remainder / 2;
      }

      remainder = this.imageHeight - this.squareSize;
      if(remainder < 0) {
        this.squareSize = this.imageHeight;
        this.squarePosition.top = 0;
      } else {
        this.squarePosition.top = remainder / 2;
      }
    } else {
      this.currentImage.record.defaultCrop = undefined;
    }
  }


      onMoveCropBorders(event: MouseEvent): void {
        if (!this.isCropDragging) {
          return;
        }
    
        const newLeft = event.clientX - this.offset.x;
        const newTop = event.clientY - this.offset.y;
    
        // Check boundaries to prevent the square from going outside the image
        const squareElement = (event.target as HTMLElement).getBoundingClientRect();
    
        const minLeft = 0;
        const maxLeft = this.imageWidth - squareElement.width;
        const minTop = 0;
        const maxTop = this.imageHeight - squareElement.height;
  
        const curLeft = this.squarePosition.left;
        const curTop = this.squarePosition.top;
    
        this.squarePosition.left = Math.max(minLeft, Math.min(maxLeft, newLeft));
        this.squarePosition.top = Math.max(minTop, Math.min(maxTop, newTop));
  
        if(curLeft != this.squarePosition.left || curTop != this.squarePosition.top){
          this.cropChanged = true;
        } 
      }

      resizeOffset: { x: number, y: number } = { x: 0, y: 0 };
  
      onResizeStart(event: MouseEvent): void {
        event.stopPropagation();
        this.isResizing = true;
        this.isCropDragging = false;
        this.resizeOffset.x = event.clientX;
        this.resizeOffset.y = event.clientY;
      }


      onResizeMove(event: MouseEvent): void {
        if (!this.isResizing || this.isCropDragging) {
          return;
        }
    
        const sizeChange = (this.resizeOffset.y - event.clientY) * 2;
    
        const newWidth = this.squareSize + sizeChange;
    
        // Set minimum and maximum size constraints
        const minSize = 100;
        const maxSize = Math.min(this.imageWidth, this.imageHeight);
  
        this.squareSize = Math.max(minSize, Math.min(maxSize, newWidth));
    
        // Update the square position to center it (optional)
        // this.squarePosition.left = Math.floor((this.imageWidth - this.squareSize) / 2 - sizeChange * 2);
        // this.squarePosition.top = Math.floor((this.imageHeight - this.squareSize) / 2 - sizeChange * 2);
        this.squarePosition.left -= sizeChange / 2;
        this.squarePosition.top -= sizeChange / 2;
    
        if(this.squarePosition.left < 0)
          this.squarePosition.left = 0;
        let overflow = this.imageWidth - (this.squarePosition.left + this.squareSize) 
        if(overflow < 0)
          this.squarePosition.left -= overflow;
    
        if(this.squarePosition.top < 0)
          this.squarePosition.top = 0;
        overflow = this.imageHeight - (this.squarePosition.top + this.squareSize) 
        if(overflow < 0)
          this.squarePosition.top -= overflow;
    
        this.cropChanged = true;
    
        this.resizeOffset.x = event.clientX;
        this.resizeOffset.y = event.clientY;
      }
    
      @HostListener('mouseup', [])
      onResizeEnd(): void {
        this.isResizing = false;
        this.isCropDragging = false;
      }
}
