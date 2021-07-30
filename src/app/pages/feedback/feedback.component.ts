import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {FeedbackMessage} from "../../models/FeedbackMessage";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";
import {DatabaseService} from "../../services/database/database.service";
import {Messages} from "../../models/Messages";
import {OverlayService} from "../../services/overlay/overlay.service";
import {ActivatedRoute} from "@angular/router";
import {GoogleAnalyticsEvent} from "../../events/GoogleAnalyticsEvent";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent extends ComponentBrowserAbstractClass implements OnInit{

  public readonly reportOfferId: string;

  public feedbackForm: FormGroup;

  constructor(protected authService: AuthService, private notificationService: NotificationBarService,
              private databaseService: DatabaseService, private seoService: SeoService, private route: ActivatedRoute) {
    super(authService);
    this.reportOfferId = this.route.snapshot.queryParamMap.get('offerId');
    this.metaTags = {
      title: 'Обратная связь | BizMate',
      description: 'Форма обратной связи, где Вы можете оставить свой отзыв по использованию сервиса, внести предложения по улучшению его работы и задать возникшие вопросы.',
      site: '/feedback'
    };
  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    this.feedbackForm = new FormGroup({
      name: new FormControl(this.userAuthData ? this.userAuthData.displayName : '', [Validators.required]),
      email: new FormControl(this.userAuthData ? this.userAuthData.email : '', [Validators.required, Validators.email]),
      text: new FormControl('', [Validators.required])
    });
  }

  public async sendForm(): Promise<void> {
    if (!this.feedbackForm.valid) {
      return;
    }

    OverlayService.showOverlay();
    try {
      let data = this.feedbackForm.getRawValue() as FeedbackMessage;
      if (this.reportOfferId) {
        data.reportOfferId = this.reportOfferId;
      }
      await this.databaseService.sendFeedback(data);
      document.dispatchEvent(new GoogleAnalyticsEvent('feedback_sent'));
      this.notificationService.showNotificationBar(Messages.FEEDBACK_SUCCESS, true);
    } catch(e) {
      this.notificationService.showNotificationBar(Messages.FEEDBACK_ERROR, false);
    }
    OverlayService.hideOverlay();
  }

}
