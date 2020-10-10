import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {AngularFirestore} from "@angular/fire/firestore";
import {FeedbackMessage} from "../../models/FeedbackMessage";
import {Messages} from "../../models/Messages";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent extends ComponentBrowserAbstractClass implements OnInit{

  public feedbackForm: FormGroup;
  private readonly metaTags = {
    title: 'Обратная связь | BizMate',
    description: 'Форма обратной связи, где Вы можете оставить свой отзыв по использованию сервиса, внести предложения по улучшению его работы и задать возникшие вопросы.',
    site: '/feedback'
  };

  constructor(private authService: AuthService, private notificationService: NotificationBarService,
              private db: AngularFirestore, private seoService: SeoService) {
    super();
  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    this.feedbackForm = new FormGroup({
      name: new FormControl(this.authService.user ? this.authService.user.displayName : '', [Validators.required]),
      email: new FormControl(this.authService.user ? this.authService.user.email : '', [Validators.required, Validators.email]),
      text: new FormControl('', [Validators.required])
    });
  }

  public async sendForm(): Promise<void> {
    if (this.feedbackForm.status === 'INVALID')
      return;

    let message: FeedbackMessage = this.feedbackForm.getRawValue() as FeedbackMessage;
    let messagesRef = await this.db.collection('/messages');

    messagesRef.add(message)
      .then(() => {
        this.notificationService.showNotificationBar(Messages.FEEDBACK_SUCCESS, true);
        //@ts-ignore
        ym(65053642,'reachGoal','feedbackSent');
      })
      .catch(() => this.notificationService.showNotificationBar(Messages.FEEDBACK_ERROR, false))
  }

}
