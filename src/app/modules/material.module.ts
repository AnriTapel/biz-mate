import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatDialogModule} from "@angular/material/dialog";
import {MatCheckboxModule} from "@angular/material/checkbox";



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatCheckboxModule
  ], exports: [
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatCheckboxModule
  ]
})
export class MaterialModule { }
