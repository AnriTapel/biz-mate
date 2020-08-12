import {Component, OnInit} from '@angular/core';
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent extends ComponentBrowserAbstractClass implements OnInit {

  constructor(private seoService: SeoService) {
    super();
  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData({title: 'Правила размещения предложений | BizMate'});
  }
}
