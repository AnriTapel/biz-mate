import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotificationComponent} from "./notification.component";
import {MaterialModule} from "../../modules/material.module";
import {RouterModule} from "@angular/router";


@NgModule({
  declarations: [
    NotificationComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ]
})
export class NotificationModule {
  static components = {
    lazy: NotificationComponent
  };
}
