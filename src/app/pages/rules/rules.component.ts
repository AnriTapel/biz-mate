import {Component, OnDestroy, OnInit} from '@angular/core';
import {SeoService} from "../../services/seo/seo.service";

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit, OnDestroy {

  constructor(private seoService: SeoService) { }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData({title: 'Правила размещения предложений | BizMate'});
  }

  ngOnDestroy(): void {
    window.scrollTo(0,0);
  }
}
