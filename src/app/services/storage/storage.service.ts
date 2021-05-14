import {Injectable} from '@angular/core';
import {AngularFireStorage} from "@angular/fire/storage";
import {AppService} from "../app/app.service";
import {ErrorsService} from "../errors/errors.service";
import AppEventNames from "../../events/AppEventNames";

@Injectable({
  providedIn: 'root'
})
export class StorageService {


  constructor(private storage: AngularFireStorage) {
  }

  public async uploadUserImage(file: File, fileName: string): Promise<any> {
    if (!fileName) {
      fileName = Date.now().toString();
    }
    try {
      await this.storage.ref('user-images').child(fileName).getDownloadURL();
      fileName = `${Date.now()}_${fileName}`;
    } catch (err) {
      console.log(`File with name ${fileName} doesn't exist.`);
    }

    const imageRef = this.storage.ref('user-images').child(fileName);
    const uploadRef = await imageRef.put(file);
    if (uploadRef.state === 'success') {
      return await uploadRef.ref.getDownloadURL();
    }
    return false;
  }

  public deleteUserImage(url: string): void {
    try {
      if (AppService.defaultAvatars.includes(url)) {
        return;
      }
      this.storage.storage.refFromURL(url).delete();
    } catch (e) {
      console.error(`Couldn't remove image by url ${url}`);
    }
  }
}
