import {Injectable} from '@angular/core';
import {AngularFireStorage} from "@angular/fire/storage";
import {AppService} from "../app/app.service";
import {DOC_ORIENTATION, NgxImageCompressService} from "ngx-image-compress";
import {ErrorsService} from "../errors/errors.service";
import AppEventNames from "../../events/AppEventNames";

@Injectable({
  providedIn: 'root'
})
export class StorageService {


  constructor(private storage: AngularFireStorage, private compressService: NgxImageCompressService) {
  }

  public async uploadUserImage(base64: string, fileName: string): Promise<any> {
    if (!fileName) {
      fileName = Date.now().toString();
    }
    try {
      await this.storage.ref('user-images').child(fileName).getDownloadURL();
      fileName = `${Date.now()}_${fileName}`;
    } catch (err) {
      console.info(`File with name ${fileName} doesn't exist.`);
    }

    const imageRef = this.storage.ref('user-images').child(fileName);

    try {
      base64 = await this.compressService.compressFile(base64, DOC_ORIENTATION.NotDefined, 30, 50)
    } catch (err) {
      ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'StorageService.uploadUserImage compressFile error', error: err});
    }

    const uploadRef = await imageRef.put(StorageService.base64toFile(base64, fileName));
    if (uploadRef.state === 'success') {
      return await uploadRef.ref.getDownloadURL();
    }
    return false;
  }

  public async deleteUserImage(url: string): Promise<void> {
    try {
      if (AppService.defaultAvatars.includes(url)) {
        return;
      }
      await this.storage.storage.refFromURL(url).delete();
    } catch (e) {
      console.error(`Couldn't remove image by url ${url}`);
    }
  }

  private static base64toFile(dataURL: string, fileName: string): File {
    let outputFile: File = null;
    try {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      outputFile = new File([u8arr], fileName, {type: mime});
    } catch (e) {
      console.error(e);
      outputFile = null;
    }

    return outputFile;
  }
}
