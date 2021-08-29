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
    const uploadRes = await this.storageService.uploadUserImage(event.base64, this.fileName);
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
    this.fileName = !fileName || fileName === "" ? `${Date.now()}.png` : fileName;
  }

  imageLoaded() {
    this.isLoaded = true;
  }

  loadImageFailed() {
    this.isLoaded = false;
    this.errorMessage = Messages['image/could_not_load'] || Messages.DEFAULT_MESSAGE;
  }


}
