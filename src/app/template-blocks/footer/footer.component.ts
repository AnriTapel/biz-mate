import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AppService} from "../../services/app/app.service";
import {GoogleAnalyticsEvent} from "../../events/GoogleAnalyticsEvent";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

  public scrollToHeader(): void {
    AppService.scrollPageToHeader();
  }

  public getCurrentYearString(): string {
    return new Date().getFullYear().toString();
  }

  public sendVkGroupYmGoal(): void {
    document.dispatchEvent(new GoogleAnalyticsEvent('footer_vk_group_clicked'));
  }

  public sendEmailYmGoal(): void {
    document.dispatchEvent(new GoogleAnalyticsEvent('footer_email_clicked'));
  }
}
