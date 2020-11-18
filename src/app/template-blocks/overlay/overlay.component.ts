import {Component, OnInit} from '@angular/core';
import {OverlayService} from "../../services/overlay/overlay.service";

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
    return OverlayService.isOverlayVisible;
  }

}
