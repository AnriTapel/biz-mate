import {Component, ViewChild} from '@angular/core';
import {ImageCroppedEvent, ImageCropperComponent} from "ngx-image-cropper";
import {Messages} from "../../models/Messages";
import {MatDialogRef} from "@angular/material/dialog";
import {OverlayService} from "../../services/overlay/overlay.service";
import {StorageService} from "../../services/storage/storage.service";

@Component({
  selector: 'app-image-cropper',
  templateUrl: './custom-image-cropper.component.html',
  styleUrls: ['./custom-image-cropper.component.scss']
})
export class CustomImageCropperComponent {
  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;

  errorMessage: string = '';
  isLoaded: boolean = false;
  imageChangedEvent: any = '';
  fileName: string = null;

  constructor(private dialogRef: MatDialogRef<CustomImageCropperComponent>, private storageService: StorageService) {
  }

  fileChangeEvent(event: any): void {
    this.errorMessage = null;
    this.imageChangedEvent = event;
    if (!event || !event.target.files.length) {
      this.isLoaded = false;
      this.fileName = null;
      return;
    }
    this.getFileName(event.target.files[0]);
  }

  cropImage(): void {
    this.imageCropper.crop();
  }

  async imageCropped(event: ImageCroppedEvent) {
    //Find out if file with such fileName already exists
    OverlayService.showOverlay();
    let uploadRes = await this.storageService.uploadUserImage(this.base64toFile(event.base64), this.fileName);
    if (uploadRes) {
      this.dialogRef.close(uploadRes);
    } else {
      this.errorMessage = Messages["image/could_not_load"] || Messages.DEFAULT_MESSAGE;
      OverlayService.hideOverlay();
    }
  }

  getFileName(file: File): void {
    if (!file) {
      this.fileName = null;
      return;
    }

    const fileName = `${file.name.substr(0, file.name.lastIndexOf('.'))}.png`;
    if (!fileName || fileName === "")
      this.fileName = `${Date.now()}.png`;
    else
      this.fileName = fileName;
  }

  base64toFile(dataURL: string): File {
    let outputFile: File = null;
    try {
      let arr = dataURL.split(',');
      let mime = arr[0].match(/:(.*?);/)[1];
      let bstr = atob(arr[1]);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);

      while (n--)
        u8arr[n] = bstr.charCodeAt(n);

      outputFile = new File([u8arr], this.fileName, {type: mime});
    } catch (e) {
      console.error(e);
      outputFile = null;
    }

    return outputFile;
  }

  imageLoaded() {
    this.isLoaded = true;
  }

  loadImageFailed() {
    this.isLoaded = false;
    this.errorMessage = Messages['image/could_not_load'] || Messages.DEFAULT_MESSAGE;
  }


}
