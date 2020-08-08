import {Component, OnInit} from '@angular/core';
import {AppService} from "../../services/app/app.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
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
}
