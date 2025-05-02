import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, HttpContentType } from './auth.service';
import { ResponseObj } from '@tc/tc-ngx-general/lib/models/ResponseObj';
import { environment } from '../Environment/environment';
import { Observable } from 'rxjs';

export enum ImageState {
  UPLOADED, // Just uploaded, unsure what the status is, do nothing once analysis is performed
  ERROR, // Error in processing the image
  ADULT, // Image is considered adult material, DO NOT make public
  NON_ADULT, // Image is not adult, but not public either
  PRE_PUBLIC, // similar to UPLOADED, but make public once analysis is done (if not adult)
  PRE_PROFILE, // siilar to PRE_PUBLIC, but make the image the profile of the uploader
  PUBLIC, // Image is in the public repository, no access restrictions are in place
  NEW     // Just selected, not saved to TrecApps yet
}

export interface ImageRecord {
  id: string | undefined;
  album: string[]; // the Albums the image belongs to
  name: string; // Name of the image
  app: string; // the app that uploaded this image
  type: string; // the type of image
  state: ImageState; // The state of the image entry
  uploaded: Date | undefined; // when was the image uploaded
  defaultCrop: string | undefined;     // the type of cropping that should be applied
  width: number;
  height: number;
} 

export interface ImageEntry {
  record: ImageRecord;
  src: string;
}

export enum ImageUploadMode {
  uploaded,
  prePublic,
  preProfile
}

@Injectable({
  providedIn: 'root'
})
export class ImageV2Service {

  constructor(private client: HttpClient, private authService: AuthService) { }

  postImage(entry: ImageEntry, uploadMode: ImageUploadMode): Observable<ResponseObj>{
    let data = entry.src.split(',', 1);

    let type = data[0].replace("data:", "").replace(";base64", "");
    let params = new HttpParams().appendAll({
      mode: uploadMode,
      app: entry.record.app
    })

    if(entry.record.name.trim().length){
      params = params.append("name", entry.record.name.trim());
    }

    if(entry.record.defaultCrop){
      params = params.append("name", entry.record.defaultCrop.trim());
    }

    if(entry.record.album.length){
      params = params.append("album", entry.record.album[0].trim());
    }


    return this.client.post<ResponseObj>(`${environment.image_service_url_2}/Image-API`, data[1], {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE).append("Content-Type", entry.record.type),
      params
    })
  }

  setAsProfile(id: string, app: string): Observable<ResponseObj>{
    return this.client.put<ResponseObj>(`${environment.image_service_url_2}/Image-API/${id}`, null, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE),
      params: new HttpParams().append("app", app)
    })
  }

  updateCrop(id: string, crop: string | undefined): Observable<ResponseObj> {
    return this.client.patch<ResponseObj>(`${environment.image_service_url_2}/Image-API/${id}`, {
      field: "crop", crop
    }, {
      headers: this.authService.getHttpHeaders2(HttpContentType.JSON),
      params: new HttpParams().append("id", id)
    })
  }

  updateAlbum(id: string, album: string): Observable<ResponseObj> {
    return this.client.patch<ResponseObj>(`${environment.image_service_url_2}/Image-API/${id}`, {
      field: "album", album
    }, {
      headers: this.authService.getHttpHeaders2(HttpContentType.JSON),
      params: new HttpParams().append("id", id)
    })
  }

  retrieveImageList(page: number, size: number, app: string | undefined, album: string | undefined): Observable<ImageRecord[]> {
    let params = new HttpParams().appendAll({
      page, size
    });

    if(app){
      params = params.append("app", app);
    }
    if(album) {
      params = params.append("album", album);
    }

    return this.client.get<ImageRecord[]>(`${environment.image_service_url_2}/Image-API`, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE),
      params: new HttpParams()
    });
  }

  // Hint, use "whole" for the "crop" parameter to prevent any cropping
  retrieveImageAsBase64(id: string, crop: string | undefined, allowAdult: boolean = false): Observable<string> {
    let params = new HttpParams().append("allowAdult", allowAdult);
    if(crop){
      params = params.append("crop", crop);
    }
    return this.client.get<string>(`${environment.image_service_url_2}/Image-API/data/${id}`, {
      headers: this.authService.getHttpHeaders2(HttpContentType.NONE),
      params: new HttpParams()
    })
  }

  

}
