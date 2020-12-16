import {Component} from '@angular/core';

@Component({
  selector: 'app-offer-card-skeleton',
  template: `
    <div class="offer-card-skeleton-container">
      <div class="offer-card-skeleton circle"></div>
      <div class="offer-card-skeleton title"></div>
      <div class="offer-card-skeleton desc"></div>
    </div>
  `,
  styles: [`
    .offer-card-skeleton-container {
      width: calc(100% - 2em);
      height: calc(100% - 2em);
      padding: 1em;
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      background-color: #FFF;
      border: 0.5px solid rgba(53, 166, 202, 0.41);
      box-shadow: inset -4px -4px 10px rgba(228, 246, 255, 0.2), inset 4px 4px 10px #FCFFFF, inset -4px 4px 10px rgba(228, 246, 255, 0.25), inset 4px -4px 10px #E4F6FF, inset -1px 4px 10px #E4F6FF, inset 1px -4px 10px #FCFFFF;
      border-radius: 5px;
    }

    .offer-card-skeleton {
      position: relative;
      background-color: rgb(235, 235, 235);
      width: 200px;
      height: 20px;
      /* background: #efefee; */
      overflow: hidden;
      border-radius: 4px;
      margin-bottom: 4px;
    }

    .offer-card-skeleton::after {
      display: block;
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      transform: translateX(-100%);
      /* background: linear-gradient(90deg, transparent, #f1f1f1, transparent); */
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .4), transparent);
      animation: skeleton-loading 1s infinite;
    }

    .circle {
      border-radius: 50%;
      width: 80px;
      height: 80px;
      margin-bottom: 1em;
    }

    .title {
      height: 30px;
      width: 70%;
    }

    .desc {
      height: 120px;
      width: 100%;
    }

    @keyframes skeleton-loading {
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class OfferCardSkeletonComponent {

  constructor() {
  }
}
