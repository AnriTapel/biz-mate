import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AppService} from "../../services/app/app.service";
import {GoogleAnalyticsEvent} from "../../events/GoogleAnalyticsEvent";
import {EventObserver} from "../../services/event-observer/event-observer.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {

  constructor(private eventObserver: EventObserver) {
  }

  ngOnInit(): void {
  }

  public scrollToHeader(): void {
    AppService.scrollPageToTop();
  }

  public getCurrentYearString(): string {
    return new Date().getFullYear().toString();
  }

  public sendVkGroupYmGoal(): void {
    this.eventObserver.dispatchEvent(new GoogleAnalyticsEvent('footer_vk_group_clicked'));
  }

  public sendEmailYmGoal(): void {
    this.eventObserver.dispatchEvent(new GoogleAnalyticsEvent('footer_email_clicked'));
  }
}
