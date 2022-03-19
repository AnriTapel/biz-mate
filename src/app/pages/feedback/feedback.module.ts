import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FeedbackComponent} from "./feedback.component";
import {FeedbackRoutingModule} from "./feedback-routing.module";
import {MaterialModule} from "../../modules/material.module";
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [FeedbackComponent],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FeedbackRoutingModule
  ]
})
export class FeedbackModule { }
