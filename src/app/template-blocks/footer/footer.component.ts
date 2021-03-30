import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

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
    document.querySelector('#header').scrollIntoView({
      behavior: "smooth"
    });
  }

  public getCurrentYearString(): string {
    return new Date().getFullYear().toString();
  }

  public sendVkGroupYmGoal(): void {
    //@ts-ignore
    ym(65053642,'reachGoal','vkGroup');
  }

  public sendEmailYmGoal(): void {
    //@ts-ignore
    ym(65053642,'reachGoal','emailLink');
  }
}
