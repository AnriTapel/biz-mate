import {NewOffer} from "../../models/NewOffer";
import {AngularFirestore} from "@angular/fire/firestore";
import * as firebase from "firebase";
import {OfferTypes} from "../../models/OfferTypes";
import {AppService} from "../../app.service";
import {AbstractControl, FormGroup, ValidatorFn} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {City} from "../../models/City";
import {BusinessArea} from "../../models/BusinessArea";

export abstract class NewOfferAbsClass {

  successText: string = "Ваше предложение успешно отправлено";
  errorText: string = "При отправке произошла ошибка. Попробуйте еще раз.";

  constructor(private db: AngularFirestore, private auth: AuthService) {
  }

  clearForm(form: FormGroup): void {
    form.reset();
  }

  getUserAccountData(): any {
    if (this.auth.user)
      return {
        name: this.auth.user.displayName,
        email: this.auth.user.email
      };
    else
      return null;
  }

  cityFiledValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const valid = AppService.cities.filter(it => it.name === control.value).length == 1;
      return !valid ? {'validCity': {value: control.value}} : null;
    };
  }

  businessAreaFieldValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const valid = AppService.businessArea.filter(it => it.name === control.value).length == 1;
      return !valid ? {'validArea': {value: control.value}} : null;
    };
  }

  sendOffer(offerData: NewOffer): Promise<string> {
    offerData.offer_id = this.db.createId();
    offerData.user_id = this.auth.user ? this.auth.user.uid : null;
    offerData.city = AppService.getCityByFiledValue('name', offerData.city).id;

    let selectedAreas: Array<number> = [];
    for (let area of offerData.business_areas)
      selectedAreas.push(AppService.getBusinessAreaByFiledValue('name', area).id);
    offerData.business_areas = selectedAreas;

    if (this.auth.user && this.auth.user.profilePhoto)
      offerData.profilePhoto = this.auth.user.profilePhoto;
    else
      offerData.profilePhoto = AppService.getDefaultAvatar();

    let ref = this.db.collection('/offers');

    return ref.doc(offerData.offer_id).set(offerData)
      .then(() => {
        return this.successText
      })
      .catch(() => {
        return this.errorText
      })
  }

  protected getFieldsLabels(offerType: OfferTypes): object {
    return AppService.offerFieldsLabels[offerType - 1];
  }
}
