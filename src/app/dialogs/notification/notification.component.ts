import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import NotificationDataModel from "../../models/NotificationDataModel";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: NotificationDataModel) { }

  ngOnInit(): void {
  }

}
