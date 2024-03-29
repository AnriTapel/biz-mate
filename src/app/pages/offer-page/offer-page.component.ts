import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Offer} from "../../models/Offer";
import {AppService} from "../../services/app/app.service";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";
import {OverlayService} from "../../services/overlay/overlay.service";
import {FormControl, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {OfferComment} from "../../models/OfferComment";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import {DatabaseService} from "../../services/database/database.service";
import {FilterFieldName} from "../../models/FilterFields";
import {AuthService} from "../../services/auth/auth.service";
import {GoogleAnalyticsEvent} from "../../events/GoogleAnalyticsEvent";
import {EventObserver} from "../../services/event-observer/event-observer.service";

@Component({
  selector: 'app-offer-page',
  templateUrl: './offer-page.component.html',
  styleUrls: ['./offer-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OfferPageComponent extends ComponentBrowserAbstractClass {

  static readonly URL_REGEX = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  public readonly COMMENT_TEXT_MAX_LENGTH: number = 1024;

  public offer: Offer = null;
  public offerComments$: Observable<OfferComment[]> = null;
  public commentInput: FormControl;

  constructor(private route: ActivatedRoute, private seoService: SeoService, private databaseService: DatabaseService,
              private router: Router, private notificationService: NotificationBarService, private eventObserver: EventObserver,
              private appService: AppService, protected authService: AuthService) {
    super(authService);
    OverlayService.showOverlay();
    this.commentInput = new FormControl('', [Validators.required, Validators.maxLength(this.COMMENT_TEXT_MAX_LENGTH)]);
    this.databaseService.getOfferByOfferId(route.snapshot.paramMap.get("id").toString())
      .then((res) => {
        this.offer = OfferPageComponent.searchForUrlsInText(res);
        this.getOfferComments();
        this.seoService.updateRouteMetaTagsByOffer(this.offer);
      })
      .catch(() => this.router.navigateByUrl('/not-found'))
      .finally(() => OverlayService.hideOverlay());
  }

  private getOfferComments(): void {
    try {
      this.offerComments$ = this.databaseService.getOfferCommentsByOfferId(this.offer.offerId);
    } catch (e) {
      this.notificationService.showNotificationBar(Messages.COULD_NOT_LOAD_OFFER_COMMENTS, false);
    }
  }

  private static searchForUrlsInText(offer: Offer): Offer {
    offer.desc = OfferPageComponent.replaceUrlsInText(offer.desc);

    if (offer.conditions && offer.conditions.length) {
      offer.conditions = OfferPageComponent.replaceUrlsInText(offer.conditions);
    }

    if (offer.experience && offer.experience.length) {
      offer.experience = OfferPageComponent.replaceUrlsInText(offer.experience);
    }
    return offer;
  }

  private static replaceUrlsInText(text: string): string {
    return text.replace(OfferPageComponent.URL_REGEX, function (url) {
      let urlText = url.length > 50 ? `${url.substring(0, 50)}...` : url;
      return '<a href="' + url + '" target="_blank">' + urlText + '</a>';
    });
  }

  public getOfferDate(): string {
    return AppService.getDateAsString(this.offer.date);
  }

  public getCommentDate(date: number): string {
    return AppService.getDateAsString(date);
  }

  public getOfferCity(): string {
    return this.appService.getCityByFiledValue('id', this.offer.city).name;
  }

  public getOfferMainBusinessArea(): string {
    return this.appService.getBusinessAreaByFiledValue('id', this.offer.businessArea[0]).name;
  }

  public getOfferSecondaryBusinessArea(): string {
    if (this.offer.businessArea.length === 1) {
      return null;
    }
    return this.appService.getBusinessAreaByFiledValue('id', this.offer.businessArea[1]).name;
  }

  public getOfferTypeTitle(): string {
    return this.appService.offerTypes.filter(it => it.id === this.offer.type)[0].title;
  }

  public getCapitalLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].capital;
  }

  public getCapitalValueAsString(): string {
    return this.offer.capital.toLocaleString('ru');
  }

  public getConditionsLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].conditions;
  }

  public getExperienceLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].experience;
  }

  public openImage(url: string): void {
    window.open(url, '_blank');
  }

  public onImageLoadError(event: any): void {
    event.target.parentElement.style.display = 'none';
  }

  public onOfferContactsClick(): void {
    this.eventObserver.dispatchEvent(new GoogleAnalyticsEvent('offer_contacts_clicked'));
  }

  public reportOnOffer(): void {
    this.router.navigate(['/feedback'], {queryParams: {offerId: this.offer.offerId}});
  }

  public openOffersPageByFilter(field: string): void {
    switch (field) {
      case 'city':
        this.router.navigate(['/offers-page'], {queryParams: {[FilterFieldName.CITY]: this.offer.city}});
        break;
      case 'type':
        this.router.navigate(['/offers-page'], {queryParams: {[FilterFieldName.OFFER_TYPE]: this.offer.type}});
        break;
      case 'mainBusinessArea':
        this.router.navigate(['/offers-page'], {queryParams: {[FilterFieldName.BUSINESS_AREA]: this.offer.businessArea[0]}});
        break;
      case 'secondaryBusinessArea':
        this.router.navigate(['/offers-page'], {queryParams: {[FilterFieldName.BUSINESS_AREA]: this.offer.businessArea[1]}});
        break;
      default:
        break;
    }
  }

  public isContactMethodSelected(): boolean {
    if (!this.offer.contactMethods)
      return false;

    for (let key of Object.keys(this.offer.contactMethods)) {
      if (this.offer.contactMethods[key])
        return true;
    }
    return false;
  }

  public sendOfferComment(): void {
    if (!this.commentInput.valid) {
      return;
    }

    OverlayService.showOverlay();
    let comment: OfferComment = {
      commentId: DatabaseService.createId(),
      offerId: this.offer.offerId,
      userId: this.userAuthData.uid,
      displayName: this.userAuthData.displayName,
      commentText: this.commentInput.value,
      date: Date.now(),
      userEmail: this.userAuthData.email
    };

    this.databaseService.sendOfferComment(comment)
      .then(() => {
        setTimeout(() => this.commentInput.reset(), 0);
      })
      .catch(() => this.notificationService.showNotificationBar(Messages.COMMENT_ERROR, false))
      .finally(() => OverlayService.hideOverlay());
  }

  public isCommentDeleteAllowed(comment: OfferComment): boolean {
    if (this.userAuthData) {
      return this.userAuthData.uid === comment.userId;
    } else {
      return false;
    }
  }

  public onDeleteCommentButtonClick(commentId: string): void {
    OverlayService.showOverlay();
    this.databaseService.deleteOfferComment(commentId)
      .catch(() => this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false))
      .finally(() => OverlayService.hideOverlay());
  }
}
