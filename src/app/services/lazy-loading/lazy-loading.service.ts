import {Compiler, Injectable, Injector} from '@angular/core';
import AppEventNames from "../../events/AppEventNames";
import {ErrorsService} from "../errors/errors.service";

@Injectable({
  providedIn: 'root'
})
export class LazyLoadingService {

  static readonly LOGIN_MODULE_NAME = "LoginModule";
  static readonly DELETE_OFFER_MODULE_NAME = "DeleteOfferModule";
  static readonly EMAIL_VERIFY_MESSAGE_MODULE_NAME = "EmailVerifyModule";
  static readonly NEW_OFFERS_SUBSCRIPTION_MODULE_NAME = "NewOffersSubscriptionModule";
  static readonly NOTIFICATION_MODULE_NAME = "NotificationModule";
  static readonly OFFER_FORM_GUARD_MODULE_NAME = "OfferFormGuardModule";
  static readonly OFFERS_FILTER_FORM_MODULE_NAME = "OffersFilterFormModule";
  static readonly RESET_PASSWORD_MODULE_NAME = "ResetPasswordModule";
  static readonly CUSTOM_IMAGE_CROPPER_MODULE_NAME = "CustomImageCropperModule";

  constructor(private compiler: Compiler, private injector: Injector) {}

  public async getLazyLoadedComponent(moduleName: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let importModule = LazyLoadingService.getDialogModuleImportPath(moduleName);
      if (!importModule) {
        reject(new Error("LazyLoadingService:getLazyLoadedComponent - module with provided name is not found"));
        ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'LazyLoadingService:getLazyLoadedComponent', error: moduleName + 'module is not found'});
        return;
      }
      let component;
      importModule
        .then(mod => mod[moduleName])
        .then(lazyModule => {
          component = lazyModule.components['lazy'];
          resolve(component);
          return lazyModule;
        })
        .then(lazyModule => this.compiler.compileModuleAsync(lazyModule))
        .then(factory => {
          factory.create(this.injector);
        });
    });

  }

  private static getDialogModuleImportPath(moduleName: string): Promise<any> {
    switch (moduleName) {
      case LazyLoadingService.LOGIN_MODULE_NAME:
        return import("../../dialogs/login/login.module");
      case LazyLoadingService.DELETE_OFFER_MODULE_NAME:
        return import("../../dialogs/delete-offer/delete-offer.module");
      case LazyLoadingService.EMAIL_VERIFY_MESSAGE_MODULE_NAME:
        return import("../../dialogs/email-verify-message/email-verify.module");
      case LazyLoadingService.NEW_OFFERS_SUBSCRIPTION_MODULE_NAME:
        return import("../../dialogs/new-offers-subscription/new-offers-subscription.module");
      case LazyLoadingService.NOTIFICATION_MODULE_NAME:
        return import("../../dialogs/notification/notification.module");
      case LazyLoadingService.OFFER_FORM_GUARD_MODULE_NAME:
        return import("../../dialogs/offer-form-guard/offer-form-guard.module");
      case LazyLoadingService.OFFERS_FILTER_FORM_MODULE_NAME:
        return import("../../dialogs/offers-filter-form/offers-filter-form.module");
      case LazyLoadingService.RESET_PASSWORD_MODULE_NAME:
        return import("../../dialogs/reset-password/reset-password.module");
      case LazyLoadingService.CUSTOM_IMAGE_CROPPER_MODULE_NAME:
        return import("../../template-blocks/image-cropper/custom-image-cropper.module");
      default:
        return null;

    }
  }
}
