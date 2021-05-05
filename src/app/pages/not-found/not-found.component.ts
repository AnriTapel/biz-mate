import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent extends ComponentBrowserAbstractClass implements OnInit {

  constructor(private router: Router, private seoService: SeoService) {
    super();
    this.metaTags = {
      title: '404 - Ничего не найдено...'
    };
  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
  }

  public previousPage(): void {
    history.back();
  }

  public navigateHomePage(): void {
    this.router.navigateByUrl('');
  }

}
