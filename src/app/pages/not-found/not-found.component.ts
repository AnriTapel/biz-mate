import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {SeoService} from "../../services/seo/seo.service";

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit, OnDestroy {

  private readonly metaTags = {
    title: '404 - Ничего не найдено...'
  };

  constructor(private router: Router, private seoService: SeoService) { }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
  }

  ngOnDestroy(): void {
    window.scrollTo(0,0);
  }

  public previousPage(): void {
    history.back();
  }

  public navigateHomePage(): void {
    this.router.navigateByUrl('');
  }

}
