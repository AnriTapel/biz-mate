import {Injectable} from '@angular/core';
import {City} from "../../models/City";
import {BusinessArea} from "../../models/BusinessArea";
import {AbstractControl, ValidatorFn} from "@angular/forms";
import {DatabaseService} from "../database/database.service";
import {AppInitEvents} from "../../app.module";

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

  private _offerTypes: any[] = undefined;
  private _businessAreas: BusinessArea[] = undefined;
  private _cities: City[] = undefined;

  constructor(private databaseService: DatabaseService) {
  }

  public appInit(): void {
    this.initCitiesCollection();
    this.initBusinessAreasCollection();
    this.initOfferTypesCollection();
  }

  private initCitiesCollection(): void {
    this.databaseService.getCitiesCollection()
      .then((res) => {
        this._cities = res;
        this.checkAppInitStatus();
      }).catch(this.initCitiesCollection.bind(this));
  }

  private initOfferTypesCollection(): void {
    this.databaseService.getOfferTypesCollection()
      .then((res) => {
        this._offerTypes = res;
        this.checkAppInitStatus();
      }).catch(this.initOfferTypesCollection.bind(this));
  }

  private initBusinessAreasCollection(): void {
    this.databaseService.getBusinessAreasCollection()
      .then((res) => {
        this._businessAreas = res;
        this.checkAppInitStatus();
      }).catch(this.initBusinessAreasCollection.bind(this));
  }

  private checkAppInitStatus(): void {
    if (this.cities && this.offerTypes && this.businessAreas) {
      document.dispatchEvent(new Event(AppInitEvents.INIT_APP_DATA_SUCCESS));
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

  public getOfferTypeByFiledValue(field: string, value: any): any {
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

  public _filterOfferTypes(value: string): any[] {
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

  get offerTypes(): any[] {
    return this._offerTypes;
  }

  get businessAreas(): BusinessArea[] {
    return this._businessAreas;
  }

  get cities(): City[] {
    return this._cities;
  }
}
