import {Component, ViewChild} from '@angular/core';
import {ImageCroppedEvent, ImageCropperComponent} from "ngx-image-cropper";
import {Messages} from "../../models/Messages";
import {MatDialogRef} from "@angular/material/dialog";
import {AppService} from "../../services/app/app.service";
import {AngularFireStorage} from "@angular/fire/storage";
import {OverlayService} from "../../services/overlay/overlay.service";

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
  croppedImageFile: File = null;
  fileName: string = null;

  constructor(private dialogRef: MatDialogRef<CustomImageCropperComponent>, private db: AngularFireStorage) {
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
    try {
      await this.db.ref('/user-images/').child(this.fileName).getDownloadURL();
      this.fileName = `${Date.now()}_${this.fileName}`;
    } catch (err) {
      console.log(`File with name ${this.fileName} doesn't exist.`);
    }

    this.croppedImageFile = this.base64toFile(event.base64);
    let imageRef = this.db.ref('/user-images/').child(this.fileName);

    let uploadRef = await imageRef.put(this.croppedImageFile);
    if (uploadRef.state === 'success') {
      let photoURL = await uploadRef.ref.getDownloadURL();
      this.dialogRef.close(photoURL);
    } else
      this.errorMessage = Messages["image/could_not_load"] || Messages.DEFAULT_MESSAGE;
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
