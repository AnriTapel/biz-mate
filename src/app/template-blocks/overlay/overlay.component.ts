import { Component, OnInit } from '@angular/core';
import {AppService} from "../../services/app/app.service";

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public isOverlayVisible(): boolean {
    return AppService.isOverlayVisible;
  }

}
