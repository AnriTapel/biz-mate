import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {AngularFirestore} from "@angular/fire/firestore";
import {FeedbackMessage} from "../../models/FeedbackMessage";
import {Messages} from "../../models/Messages";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  feedbackForm: FormGroup;

  constructor(private authService: AuthService, private notificationService: NotificationBarService,
              private db: AngularFirestore) { }

  ngOnInit(): void {
    scroll(0,0);
    this.feedbackForm = new FormGroup({
      name: new FormControl(this.authService.user ? this.authService.user.displayName : '', [Validators.required]),
      email: new FormControl(this.authService.user ? this.authService.user.email : '', [Validators.required, Validators.email]),
      text: new FormControl('', [Validators.required])
    });
  }

  async sendForm(): Promise<void> {
    if (this.feedbackForm.status === 'INVALID')
      return;

    let message: FeedbackMessage = this.feedbackForm.getRawValue() as FeedbackMessage;
    let messagesRef = await this.db.collection('/messages');

    messagesRef.add(message)
      .then(() => this.notificationService.showNotificationBar(Messages.FEEDBACK_SUCCESS, true))
      .catch(() => this.notificationService.showNotificationBar(Messages.FEEDBACK_ERROR, false))
  }

}
