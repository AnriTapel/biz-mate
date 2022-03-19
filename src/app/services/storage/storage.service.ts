import {Injectable} from '@angular/core';
import {deleteObject, getDownloadURL, ref, Storage, uploadBytes} from "@angular/fire/storage";
import {AppService} from "../app/app.service";
import {DOC_ORIENTATION, NgxImageCompressService} from "ngx-image-compress";
import {EventObserver} from "../event-observer/event-observer.service";
import {AppErrorEvent} from "../../events/AppErrorEvent";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  constructor(private storage: Storage, private compressService: NgxImageCompressService, private eventObserver: EventObserver) {
  }

  public async uploadUserImage(base64: string, fileName: string): Promise<any> {
    if (!fileName) {
      fileName = Date.now().toString();
    }
    try {
      await getDownloadURL(ref(this.storage, `user-images/${fileName}`));
      fileName = `${Date.now()}_${fileName}`;
    } catch (err) {
      console.info(`File with name ${fileName} doesn't exist.`);
    }

    const imageRef = ref(this.storage, `user-images/${fileName}`);

    try {
      base64 = await this.compressService.compressFile(base64, DOC_ORIENTATION.NotDefined, 30, 50)
    } catch (err) {
      this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'StorageService.uploadUserImage compressFile error', error: err}))
    }

    try {
      await uploadBytes(imageRef, StorageService.base64toFile(base64, fileName));
      return await getDownloadURL(imageRef);
    } catch {
      return false;
    }
  }

  public async deleteUserImage(url: string): Promise<void> {
    try {
      if (AppService.defaultAvatars.includes(url)) {
        return;
      }
      let imageUrl = new URL(url).pathname;
      await deleteObject(ref(this.storage, decodeURIComponent(imageUrl.substr(imageUrl.indexOf('/user-images')))));
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
