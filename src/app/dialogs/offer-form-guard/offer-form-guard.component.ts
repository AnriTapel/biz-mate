import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-offer-form-guard',
  templateUrl: './offer-form-guard.component.html',
  styleUrls: ['./offer-form-guard.component.scss']
})
export class OfferFormGuardComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<OfferFormGuardComponent>) { }

  ngOnInit(): void {
  }

  doNotLeave(): void {
    this.dialogRef.close(false);
  }

  leave(): void {
    this.dialogRef.close(true);
  }

}
