import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-delete-offer',
  templateUrl: './delete-offer.component.html',
  styleUrls: ['./delete-offer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteOfferComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DeleteOfferComponent>) { }

  ngOnInit(): void {
  }

  cancelDelete(): void {
    this.dialogRef.close(false);
  }

  deleteOffer(): void {
    this.dialogRef.close(true);
  }
}
