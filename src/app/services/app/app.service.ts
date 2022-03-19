import {Injectable} from '@angular/core';
import {City} from "../../models/City";
import {BusinessArea} from "../../models/BusinessArea";
import {AbstractControl, ValidatorFn} from "@angular/forms";
import {DatabaseService} from "../database/database.service";
import {OfferType} from "../../models/IOfferType";
import {EventObserver} from "../event-observer/event-observer.service";
import {InitDataEvent} from "../../events/InitDataEvent";
import AppEventNames from "../../events/AppEventNames";
import {InitAuthEvent} from "../../events/InitAuthEvent";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  static readonly offerFieldsLabels: Array<any> = [
    {experience: 'О бизнесе', conditions: 'Предлагаемые условия', capital: 'Требуемый капитал'},
    {experience: 'Инвестиционный опыт', conditions: 'Условия партнерства', capital: 'Предлагаемый капитал'},
    {experience: 'О бизнесе', conditions: 'Условия партнерства'},
    {experience: 'Опыт партнерства', conditions: 'Условия партнерства'},
    {experience: 'О бизнесе', conditions: 'Условия продажи', capital: 'Запрашиваемая цена'}
  ];

  static readonly defaultAvatars = [
    'https://firebasestorage.googleapis.com/v0/b/bizmate-5f9a4.appspot.com/o/default_avatar_black.svg?alt=media&token=bb7300c4-0a2f-479f-ac74-a4c540482ff6',
    'https://firebasestorage.googleapis.com/v0/b/bizmate-5f9a4.appspot.com/o/default_avatar_blue.svg?alt=media&token=6ce9fc0a-86d2-4e0a-a549-d9098d4802da',
    'https://firebasestorage.googleapis.com/v0/b/bizmate-5f9a4.appspot.com/o/default_avatar_grey.svg?alt=media&token=02dc73d8-8bab-4329-a3d9-7a5b5f8ad318',
    'https://firebasestorage.googleapis.com/v0/b/bizmate-5f9a4.appspot.com/o/default_avatar_red.svg?alt=media&token=af29412e-544d-4ea7-aaa0-2259d0833d35'
  ];

  private _offerTypes: OfferType[] = undefined;
  private _businessAreas: BusinessArea[] = undefined;
  private _cities: City[] = undefined;
  public static isInitialSpinnerHidden: boolean = false;

  constructor(private databaseService: DatabaseService, private eventObserver: EventObserver) {
    //eventObserver.getEventObservable(AppEventNames.APP_ERROR).subscribe(() => AppService.onAppErrorEvent());
    eventObserver.getEventObservable(AppEventNames.INIT_APP_DATA).subscribe((event: InitDataEvent) => AppService.onInitEvents(event));
    eventObserver.getEventObservable(AppEventNames.INIT_APP_AUTH).subscribe((event: InitAuthEvent) => AppService.onInitEvents(event));
  }

  public appInit(): void {
    Promise.all([this.initCitiesCollection(), this.initBusinessAreasCollection(), this.initOfferTypesCollection()])
      .then(() => this.eventObserver.dispatchEvent(new InitDataEvent()))
      .catch(() => this.eventObserver.dispatchEvent(new InitDataEvent(false)));
  }

  private async initCitiesCollection(): Promise<void> {
    this._cities = await this.databaseService.getCitiesCollection();
  }

  private async initOfferTypesCollection(): Promise<void> {
    this._offerTypes = await this.databaseService.getOfferTypesCollection();
  }

  private async initBusinessAreasCollection(): Promise<void> {
    this._businessAreas = await this.databaseService.getBusinessAreasCollection();
  }

  private static onInitEvents(event: InitDataEvent | InitAuthEvent): void {
    if (!event.isSuccess) {
      this.hideInitialSpinner();
      this.showGlobalError();
    }
  }

  public static hideInitialSpinner(): void {
    if (this.isInitialSpinnerHidden) {
      return;
    }
    const initialSpinnerElement = document.getElementById('initial_spinner');
    if (initialSpinnerElement) {
      initialSpinnerElement.style.display = 'none';
    }
  }

  public static showGlobalError(): void {
    const errorMsgElement = document.getElementById('init_error_message');
    if (errorMsgElement) {
      errorMsgElement.removeAttribute('style');
    }
  }

  public static getDefaultAvatar(): string {
    const index: number = Math.floor(Math.random() * 4);
    return this.defaultAvatars[index];
  }

  public static getDateAsString(numberDate: number): string {
    const date = new Date(numberDate);

    const day = date.getDate() >= 10 ? date.getDate().toString() : `0${date.getDate()}`;
    const month = date.getMonth() + 1 >= 10 ? (date.getMonth() + 1).toString() : `0${date.getMonth() + 1}`;
    return `${day}.${month}.${date.getFullYear()}`;
  }

  public getCityByFiledValue(field: string, value: any): City {
    return this.cities.filter(it => it[field] == value)[0] || null;
  }

  public getBusinessAreaByFiledValue(field: string, value: any): BusinessArea {
    return this.businessAreas.filter(it => it[field] == value)[0] || null;
  }

  public getOfferTypeByFiledValue(field: string, value: any): OfferType {
    return this.offerTypes.filter(it => it[field] == value)[0] || null;
  }

  public _filterCities(value: string): any[] {
    if (value === null || value === '') {
      return;
    }

    const filterValue = value.toLowerCase();
    return this.cities.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  public _filterBusinessAreas(value: string): any[] {
    if (value === null) {
      value = '';
    }

    const filterValue = value.toLowerCase();
    return this.businessAreas.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  public _filterOfferTypes(value: string): OfferType[] {
    if (value === null) {
      value = '';
    }

    const filterValue = value.toLowerCase();
    return this.offerTypes.filter(option => option.title.toLowerCase().includes(filterValue));
  }

  public cityFieldValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = this.cities.filter(it => it.name === control.value).length === 1;
      return !control.value ? null : !valid ? {validCity: {value: control.value}} : null;
    };
  }

  public businessAreaFieldValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = this.businessAreas.filter(it => it.name === control.value).length === 1;
      return !control.value ? null : !valid ? {validArea: {value: control.value}} : null;
    };
  }

  public offerTypeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = this.offerTypes.filter(it => it.title === control.value).length === 1;
      return !control.value ? null : !valid ? {validArea: {value: control.value}} : null;
    };
  }

  public static scrollPageToHeader(): void {
    const headerEl = document.getElementById('header');
    if (headerEl) {
      headerEl.scrollIntoView({behavior: "smooth"});
    }
  }

  public static isMobile(): boolean {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  }

  public static isTouchableDevice(): boolean {
    return navigator.msMaxTouchPoints > 0 || 'ontouchstart' in window;
  }

  public static unsubscribeHandler(handlers: any[]): void {
    handlers.forEach(handler => {
      if (handler && handler.unsubscribe) {
        handler.unsubscribe();
      }
    });
  }

  get offerTypes(): OfferType[] {
    return this._offerTypes;
  }

  get businessAreas(): BusinessArea[] {
    return this._businessAreas;
  }

  get cities(): City[] {
    return this._cities;
  }
}
