import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    scroll(0,0);
  }

  previousPage(): void {
    history.back();
  }

  navigateHomePage(): void {
    this.router.navigateByUrl('');
  }

}