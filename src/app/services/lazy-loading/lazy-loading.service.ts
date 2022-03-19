import {Compiler, Injectable, Injector} from '@angular/core';
import {EventObserver} from "../event-observer/event-observer.service";
import {AppErrorEvent} from "../../events/AppErrorEvent";
import {DialogModuleNames} from "../../dialogs/DialogModuleNames";
import {ComponentType} from "@angular/cdk/portal";

@Injectable({
  providedIn: 'root'
})
export class LazyLoadingService {

  constructor(private compiler: Compiler, private injector: Injector, private eventObserver: EventObserver) {}

  public async getDialogComponent(moduleName: DialogModuleNames): Promise<ComponentType<any>> {
    return new Promise<any>((resolve, reject) => {
      let importModule = LazyLoadingService.resolveDialogModuleImportPath(moduleName);
      if (!importModule) {
        reject(new Error("LazyLoadingService:getDialogComponent - module with provided name is not found"));
        this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'LazyLoadingService:getDialogComponent', error: moduleName + 'module is not found'}));
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

  private static resolveDialogModuleImportPath(moduleName: DialogModuleNames | string): Promise<any> {
    switch (moduleName) {
      case DialogModuleNames.LOGIN_MODULE_NAME:
        return import("../../dialogs/login/login.module");
      case DialogModuleNames.DELETE_OFFER_MODULE_NAME:
        return import("../../dialogs/delete-offer/delete-offer.module");
      case DialogModuleNames.EMAIL_VERIFY_MESSAGE_MODULE_NAME:
        return import("../../dialogs/email-verify-message/email-verify.module");
      case DialogModuleNames.NEW_OFFERS_SUBSCRIPTION_MODULE_NAME:
        return import("../../dialogs/new-offers-subscription/new-offers-subscription.module");
      case DialogModuleNames.NOTIFICATION_MODULE_NAME:
        return import("../../dialogs/notification/notification.module");
      case DialogModuleNames.OFFER_FORM_GUARD_MODULE_NAME:
        return import("../../dialogs/offer-form-guard/offer-form-guard.module");
      case DialogModuleNames.OFFERS_FILTER_FORM_MODULE_NAME:
        return import("../../dialogs/offers-filter-form/offers-filter-form.module");
      case DialogModuleNames.RESET_PASSWORD_MODULE_NAME:
        return import("../../dialogs/reset-password/reset-password.module");
      case DialogModuleNames.CUSTOM_IMAGE_CROPPER_MODULE_NAME:
        return import("../../template-blocks/image-cropper/custom-image-cropper.module");
      default:
        return null;

    }
  }
}
