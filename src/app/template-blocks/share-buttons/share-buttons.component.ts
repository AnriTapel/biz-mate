import {AfterViewInit, Component, Input} from '@angular/core';
import {AppService} from "../../services/app/app.service";

@Component({
  selector: 'app-share-buttons',
  template: `
    <div class="share-buttons-container">
      <button data-sharer="facebook">
        <img src="/assets/img/socials/facebook_share.svg" (click)="sendYMGoal()" alt="Поделиться в Facebook"/>
      </button>
      <button data-sharer="twitter">
        <img src="/assets/img/socials/twitter_share.svg" (click)="sendYMGoal()" alt="Поделиться в Twitter"/>
      </button>
      <button data-sharer="vk">
        <img src="/assets/img/socials/vk_share.svg" (click)="sendYMGoal()" alt="Поделиться в VK"/>
      </button>
      <button data-sharer="whatsapp">
        <img src="/assets/img/socials/whatsapp_share.svg" (click)="sendYMGoal()" alt="Поделиться в WhatsApp"/>
      </button>
      <button *ngIf="isMobile" data-sharer="telegram">
        <img src="/assets/img/socials/telegram_share.svg" (click)="sendYMGoal()" alt="Поделиться в Telegram"/>
      </button>
      <button *ngIf="isMobile" data-sharer="viber">
        <img src="/assets/img/socials/viber_share.svg" (click)="sendYMGoal()" alt="Поделиться в Viber"/>
      </button>
    </div>
  `,
  styles: [`    
    .share-buttons-container {
      position: fixed;
      left: 0;
      top: 40%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
    }
    .share-buttons-container button {
      width: 30px;
      height: 30px;
      border: unset;
      cursor: pointer;
      background: transparent;
      padding: 0;
    }
    `]
})
export class ShareButtonsComponent implements AfterViewInit {

  static readonly OFFER_TYPE_TITLE: string = 'Делюсь оффером с сервиса BizMate - поиск партнеров и инвестиций для бизнеса\n';
  static readonly WAIT_FOR_BUTTONS_RENDER_TIMEOUT: number = 500;
  static readonly SHARER_PATH: string = '/assets/libs/sharer.min.js';

  @Input() isOffer?: boolean;
  private shareButtons: any;
  public readonly isMobile: boolean;

  constructor() {
    this.isMobile = AppService.isMobile();
  }

  ngAfterViewInit(): void {
    if (!this.isOffer) {
      return;
    }
    //@ts-ignore
    if (!window.Sharer) {
      const script = document.createElement('script');
      script.onload = this.defineShareButtonsData.bind(this);
      script.src = ShareButtonsComponent.SHARER_PATH;
      document.body.appendChild(script);
    } else {
      this.defineShareButtonsData();
    }
  }

  private defineShareButtonsData(): void {
    setTimeout(() => {
      this.shareButtons = document.querySelectorAll('div.share-buttons-container > button');
      if (!this.shareButtons || !this.shareButtons.length) {
        return;
      }

      if (this.isOffer) {
        this.setOfferData();
      }
    }, ShareButtonsComponent.WAIT_FOR_BUTTONS_RENDER_TIMEOUT);
  }

  private setOfferData(): void {
    for (let i = 0; i < this.shareButtons.length; i++) {
      this.shareButtons[i].setAttribute('data-url', window.location.href);
      this.shareButtons[i].setAttribute('data-title', ShareButtonsComponent.OFFER_TYPE_TITLE);
    }
  }

  public sendYMGoal(): void {
    //@ts-ignore
    ym(65053642,'reachGoal','shareSocials');
  }
}
