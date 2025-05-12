import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { ImageService, StylesService, UpSliderComponent } from '@tc/tc-ngx-general';
//import { ImageEntry } from '@tc/tc-ngx-general/lib/models/Image';
import { SortedList } from '../../models/SortedList';
import { ImageRecord, ImageState, ImageEntry, ImageV2Service, ImageUploadMode } from '../../services/image-v2.service';
import { CommonModule } from '@angular/common';
import { ImageAlbumFilterPipe } from '../../pipes/image-album-filter.pipe';
import { FormsModule } from '@angular/forms';
import { ResponseObj } from '@tc/tc-ngx-general/lib/models/ResponseObj';

interface ImageUploadModeOption {
  mode: ImageUploadMode;
  modeName: string;
  modeExplaination: string;
}

export enum ImageSelectionPurpose {
  BLANK,
  SELECT,
  PROFILE,
  COVER
}

const bytesInMB: number = 1000000;

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

  permittedFileTypes = [
    "gif",
    "jpeg",
    "png",
    "svg",
    "webp"];

  // Inputs and outputs
  @Input()
  baseUrl: string = "";   // the URL where the image service can be accessed

  @Input()
  app: string = "main";   // The app being represented ('main' stands for all apps)

  @Input()
  show: boolean = false;

  @Input()
  purpose: ImageSelectionPurpose = ImageSelectionPurpose.BLANK;   // If blank, there is no extra functionality. 

  @Input()
  mbLimit: number = 0;  // Limit for image analysis

  defaultPurpose: ImageSelectionPurpose = ImageSelectionPurpose.BLANK;
  

  @Output()
  onClose = new EventEmitter();

  @Output()
  onSelectImage = new EventEmitter<ImageEntry>();

  albumList: SortedList<string> = new SortedList((a: string, b: string) => {
    return a.localeCompare(b);
  });

  uploadModes: ImageUploadModeOption[] = [
    {
      mode: ImageUploadMode.uploaded,
      modeName: "Simple Upload",
      modeExplaination: "Simply upload your image! It will not be publicly accessible and nothing will be done post processing!"
    }, {
      mode: ImageUploadMode.prePublic,
      modeName: "Make Public",
      modeExplaination: "If public eligible, your image will be made public!"
    }, {
      mode: ImageUploadMode.preProfile,
      modeName: "Make Profile Picture",
      modeExplaination: "If public eligible, your image will be made public and set as your profile Picture!"
    }
  ]

  currentUploadMode: ImageUploadModeOption = this.uploadModes[0];

  onOpen(){
    this.albumList.clear();
    this.show = true;
    this.addedAlbum = false;
    this.imageEntries = [];
    this.currentImagePage = 0;
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

  selectImage() {
    if(!this.currentImage?.record.id) return;
    let useApp = this.app;
    switch(this.purpose){
      // @ts-ignore
      case ImageSelectionPurpose.SELECT:
        this.onSelectImage.emit(this.currentImage);
        this.currentImage = undefined;
        this.onClose.emit();
        return;
      case ImageSelectionPurpose.COVER:
        useApp = `cover-${useApp}`;
      case ImageSelectionPurpose.PROFILE:
        this.imageService.setAsProfile(this.currentImage.record.id, useApp).subscribe({
          next: (responseObj: ResponseObj) => {
            alert('Successfully set Profile!');
          },
          error: (response: Response) => {
            alert("failed to Set Profile!");
          }
        })
    }
  }



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

  albumChanged: boolean = false;

  onAssignAlbum(){
    if(!this.currentImage?.record.id) return;
    let album: string | undefined;
    if(Array.isArray(this.currentImage.record.album)){
      album = this.currentImage.record.album.length ? this.currentImage.record.album[0] : undefined;
    } else if(typeof this.currentImage.record.album === "string"){
      album = this.currentImage.record.album;
    }
    
    this.imageService.updateAlbum(this.currentImage.record.id, album).subscribe({
      next: (response: ResponseObj) => {
        this.albumChanged = false;
      }
    })
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
        this.imageService.retrieveImageAsBase64(record.id, "whole").subscribe({
          next: (obj: ResponseObj) => {
            ret.src = obj.message.toString()
          }
      })
    }
    return ret;

  }

  commenceImageUpload(){
    if(this.currentImage && !this.currentImage.record.id){
      this.imageService.postImage(this.currentImage, this.currentUploadMode.mode).subscribe({
        next: (resp: ResponseObj) => {
          if(this.currentImage?.record){
            this.currentImage.record.id = resp.id?.toString();
            this.imageEntries = [this.currentImage].concat(this.imageEntries);
            this.albumChanged = false;
          }
            
        }
      })
    }
    
  }

  onImageClick(image: ImageEntry){
    this.currentImage = image;

    if(this.currentImage.record.defaultCrop){
      this.isCropping = true;
      setTimeout(() => this.onCropCheck(), 400);
    }
  }

  imageFromDevice(event: any){
    this.selectedFile = event.target.files[0]
    if(!this.selectedFile)return;

    let t = this.selectedFile.type.toLowerCase().trim();
    for(let possibleType of this.permittedFileTypes) {
      if(t == `image/${possibleType}`)
      {
        this.selectedFileType = possibleType;
        break;
      }
    }

    if(this.mbLimit && this.selectedFile.size >= (this.mbLimit * bytesInMB) &&
      !confirm(`Your image exceeds the ${this.mbLimit} MB limit for moderation.\n You can still upload the image, but you'll need to contact\n
        the Administrator to use it as a Profile Image or Cover Photo`)){
          return;
    }

    this.selectedFile?.arrayBuffer().then((value: ArrayBuffer)=> {
      let buffer = new Uint8Array(value);

      const STRING_CHAR = buffer.reduce((data, byte)=> {return data + String.fromCharCode(byte);}, '');

      let data = btoa(STRING_CHAR);

      this.isCropping = false;

      this.currentImage = {
        src: `data:image/${this.selectedFileType};base64,${data}`,
        record: {
          id: undefined,
          name: this.selectedFile?.name || "",
          defaultCrop: undefined,
          album: [],
          app: this.app,
          type: t,
          state: ImageState.NEW,
          uploaded: undefined,
          deleteOn: undefined,
          width: 0,
          height: 0
        }
      }
    });
    
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
    } else {
      this.currentImage.record.defaultCrop = 
        `${this.squarePosition.left},${this.squarePosition.top},${this.squarePosition.left + this.squareSize},${this.squarePosition.top + this.squareSize}`
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

    onDeleteCall(){
      if(!this.currentImage) return;

      this.imageService.handleDeletion(this.currentImage.record).subscribe({
        next: (response: ResponseObj) => {
          if(this.currentImage?.record.deleteOn) {
            this.currentImage.record.deleteOn = undefined;
          } else if(this.currentImage?.record && response.id) {
            // if setting deletion, the id of the response should hold the deletion data
            this.currentImage.record.deleteOn = new Date(response.id.toString());
          }
        },
        error: (response: ResponseObj) => {
          alert(response.message);
        }
      })
    }

  // To be called when the user clicks on the check to crop checkbox
  onCropCheck(){
    if(!this.currentImage)return;
  
    if(this.isCropping && this.selectedImg){
        
      this.setImageParams();
  
      // if currently on the same image, no need to adjust the cropping
      if(this.currentImage == this.prevImage) return;

      if(this.currentImage.record.defaultCrop){

        let works = true;

        let strDimensions = this.currentImage.record.defaultCrop.split(',');
        try{
          let intDimensions = strDimensions.map(str => Number.parseInt(str));
          this.squarePosition.left = intDimensions[0];
          this.squarePosition.top = intDimensions[1];
          this.squareSize = intDimensions[3] - intDimensions[1];

          if(intDimensions[0] < 0 || intDimensions[1] < 0 || intDimensions[2] < 0 || intDimensions[3] < 0)
            throw Error("Negative number detected in default crop!");

          if(intDimensions[0] + intDimensions[2] > this.imageWidthReal)
            throw Error("Crop Overflow detected on x-axis");
          if(intDimensions[1] + intDimensions[3] > this.imageHeightReal)
            throw Error("Crop Overflow detected on y-axis");

        } catch(e){
          console.log(e);
          works = false;
        }

        if(works) return;
      }
  
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
  
        let tempSquareSize = Math.max(minSize, Math.min(maxSize, newWidth));
        

    
        // Update the square position to center it (optional)
        // this.squarePosition.left = Math.floor((this.imageWidth - this.squareSize) / 2 - sizeChange * 2);
        // this.squarePosition.top = Math.floor((this.imageHeight - this.squareSize) / 2 - sizeChange * 2);

        let tempSquarePosition = {
          left: this.squarePosition.left,
          top: this.squarePosition.top
        };
        tempSquarePosition.left -= sizeChange / 2;
        tempSquarePosition.top -= sizeChange / 2;

        if(tempSquarePosition.left < 0 || tempSquarePosition.top < 0)
          return;
        const maxLeft = this.imageWidth;
        const maxTop = this.imageHeight;

        if(tempSquarePosition.top + tempSquareSize > maxTop || tempSquarePosition.left + tempSquareSize > maxLeft)
          return;

        this.squarePosition = tempSquarePosition;
        this.squareSize = tempSquareSize;
    
        // if(this.squarePosition.left < 0)
        //   this.squarePosition.left = 0;
        // let overflow = this.imageWidth - (this.squarePosition.left + this.squareSize) 
        // if(overflow < 0)
        //   this.squarePosition.left -= overflow;
    
        // if(this.squarePosition.top < 0)
        //   this.squarePosition.top = 0;
        // overflow = this.imageHeight - (this.squarePosition.top + this.squareSize) 
        // if(overflow < 0)
        //   this.squarePosition.top -= overflow;
    
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
