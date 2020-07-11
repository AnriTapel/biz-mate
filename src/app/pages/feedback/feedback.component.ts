import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {AngularFirestore} from "@angular/fire/firestore";
import {FeedbackMessage} from "../../models/FeedbackMessage";
import {Messages} from "../../models/Messages";
import {Meta, Title} from "@angular/platform-browser";
import {SeoService} from "../../services/seo/seo.service";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit, OnDestroy {

  public feedbackForm: FormGroup;
  private readonly metaTags = {
    title: 'Обратная связь | BizMate',
    description: 'Форма обратной связи, где Вы можете оставить свой отзыв по использованию сервиса, внести предложения по улучшению его работы и задать возникшие вопросы.',
    site: location.href
  };

  constructor(private authService: AuthService, private notificationService: NotificationBarService,
              private db: AngularFirestore, private seoService: SeoService) {
  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    this.feedbackForm = new FormGroup({
      name: new FormControl(this.authService.user ? this.authService.user.displayName : '', [Validators.required]),
      email: new FormControl(this.authService.user ? this.authService.user.email : '', [Validators.required, Validators.email]),
      text: new FormControl('', [Validators.required])
    });
  }

  ngOnDestroy(): void {
    window.scrollTo(0,0);
  }

  public async sendForm(): Promise<void> {
    if (this.feedbackForm.status === 'INVALID')
      return;

    let message: FeedbackMessage = this.feedbackForm.getRawValue() as FeedbackMessage;
    let messagesRef = await this.db.collection('/messages');

    messagesRef.add(message)
      .then(() => this.notificationService.showNotificationBar(Messages.FEEDBACK_SUCCESS, true))
      .catch(() => this.notificationService.showNotificationBar(Messages.FEEDBACK_ERROR, false))
  }

}
