import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesComponent extends ComponentBrowserAbstractClass implements OnInit {

  constructor(private seoService: SeoService) {
    super();
    this.metaTags = {title: 'Правила размещения предложений | BizMate'}
  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
  }
}
