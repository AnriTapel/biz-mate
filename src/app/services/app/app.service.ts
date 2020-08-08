import {Injectable} from '@angular/core';
import {City} from "../../models/City";
import {BusinessArea} from "../../models/BusinessArea";
import {Offer} from "../../models/Offer";
import {OfferTypes} from "../../models/OfferTypes";
import {AbstractControl, ValidatorFn} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private static _isOverlayVisible: boolean = false;
  private static _platformId: Object = undefined;

  static readonly offerTypes: Array<any> = [
    { id: OfferTypes.NEED_INVESTMENTS, title: 'Ищу инвестиции' },
    { id: OfferTypes.HAVE_INVESTMENTS, title: 'Предлагаю инвестиции' },
    { id: OfferTypes.NEED_PARTNER, title: 'Ищу партнера' },
    { id: OfferTypes.SEARCH_BUSINESS, title: 'Войду в бизнес' },
    { id: OfferTypes.SELL_BUSINESS, title: 'Продам бизнес'}
  ];

  static readonly cities: Array<City> = [{"id":0,"name":"Абакан"},{"id":1,"name":"Альметьевск"},{"id":2,"name":"Ангарск"},{"id":3,"name":"Арзамас"},{"id":4,"name":"Армавир"},{"id":5,"name":"Артем"},{"id":6,"name":"Архангельск"},{"id":7,"name":"Астрахань"},{"id":8,"name":"Ачинск"},{"id":9,"name":"Балаково"},{"id":10,"name":"Балашиха"},{"id":11,"name":"Барнаул"},{"id":12,"name":"Батайск"},{"id":13,"name":"Белгород"},{"id":14,"name":"Бердск"},{"id":15,"name":"Березники"},{"id":16,"name":"Бийск"},{"id":17,"name":"Благовещенск"},{"id":18,"name":"Братск"},{"id":19,"name":"Брянск"},{"id":20,"name":"Великий Новгород"},{"id":21,"name":"Владивосток"},{"id":22,"name":"Владикавказ"},{"id":23,"name":"Владимир"},{"id":24,"name":"Волгоград"},{"id":25,"name":"Волгодонск"},{"id":26,"name":"Волжский"},{"id":27,"name":"Вологда"},{"id":28,"name":"Воронеж"},{"id":29,"name":"Грозный"},{"id":30,"name":"Дербент"},{"id":31,"name":"Дзержинск"},{"id":32,"name":"Димитровград"},{"id":33,"name":"Долгопрудный"},
    {"id":34,"name":"Домодедово"},{"id":35,"name":"Евпатория"},{"id":36,"name":"Екатеринбург"},{"id":37,"name":"Елец"},{"id":38,"name":"Ессентуки"},{"id":39,"name":"Железногорск"},{"id":40,"name":"Жуковский"},{"id":41,"name":"Златоуст"},{"id":42,"name":"Иваново"},{"id":43,"name":"Ижевск"},{"id":44,"name":"Иркутск"},{"id":45,"name":"Йошкар-Ола"},{"id":46,"name":"Казань"},{"id":47,"name":"Калининград"},{"id":48,"name":"Калуга"},{"id":49,"name":"Каменск - Уральский"},{"id":50,"name":"Камышин"},{"id":51,"name":"Каспийск"},{"id":52,"name":"Кемерово"},{"id":53,"name":"Керчь"},{"id":54,"name":"Киров"},{"id":55,"name":"Кисловодск"},{"id":56,"name":"Ковров"},{"id":57,"name":"Коломна"},{"id":58,"name":"Комсомольск-на-Амуре"},{"id":59,"name":"Копейск"},{"id":60,"name":"Королёв"},{"id":61,"name":"Кострома"},{"id":62,"name":"Красногорск"},{"id":63,"name":"Краснодар"},{"id":64,"name":"Красноярск"},{"id":65,"name":"Курган"},{"id":66,"name":"Курск"},
    {"id":67,"name":"Кызыл"},{"id":68,"name":"Липецк"},{"id":69,"name":"Люберцы"},{"id":70,"name":"Магнитогорск"},{"id":71,"name":"Майкоп"},{"id":72,"name":"Махачкала"},{"id":73,"name":"Миасс"},{"id":74,"name":"Москва"},{"id":75,"name":"Мурманск"},{"id":76,"name":"Муром"},{"id":77,"name":"Мытищи"},{"id":78,"name":"Набережные Челны"},{"id":79,"name":"Назрань"},{"id":80,"name":"Нальчик"},{"id":81,"name":"Находка"},{"id":82,"name":"Невинномысск"},{"id":83,"name":"Нефтекамск"},{"id":84,"name":"Нефтеюганск"},{"id":85,"name":"Нижневартовск"},{"id":86,"name":"Нижнекамск"},{"id":87,"name":"Нижний Новгород"},{"id":88,"name":"Нижний Тагил"},{"id":89,"name":"Новокузнецк"},{"id":90,"name":"Новокуйбышевск"},{"id":91,"name":"Новомосковск"},{"id":92,"name":"Новороссийск"},{"id":93,"name":"Новосибирск"},{"id":94,"name":"Новочебоксарск"},{"id":95,"name":"Новочеркасск"},{"id":96,"name":"Новошахтинск"},{"id":97,"name":"Новый Уренгой"},{"id":98,"name":"Ногинск"},
    {"id":99,"name":"Норильск"},{"id":100,"name":"Ноябрьск"},{"id":101,"name":"Обнинск"},{"id":102,"name":"Одинцово"},{"id":103,"name":"Октябрьский"},{"id":104,"name":"Омск"},{"id":105,"name":"Орёл"},{"id":106,"name":"Оренбург"},{"id":107,"name":"Орехово-Зуево"},{"id":108,"name":"Орск"},{"id":109,"name":"Пенза"},{"id":110,"name":"Первоуральск"},{"id":111,"name":"Пермь"},{"id":112,"name":"Петрозаводск"},{"id":113,"name":"Петропавловск-Камчатский"},{"id":114,"name":"Подольск"},{"id":115,"name":"Прокопьевск"},{"id":116,"name":"Псков"},{"id":117,"name":"Пушкино"},{"id":118,"name":"Пятигорск"},{"id":119,"name":"Раменское"},{"id":120,"name":"Реутов"},{"id":121,"name":"Ростов-на-Дону"},{"id":122,"name":"Рубцовск"},{"id":123,"name":"Рыбинск"},{"id":124,"name":"Рязань"},{"id":125,"name":"Салават"},{"id":126,"name":"Самара"},{"id":127,"name":"Санкт-Петербург"},{"id":128,"name":"Саранск"},{"id":129,"name":"Саратов"},{"id":130,"name":"Севастополь"},{"id":131,"name":"Северодвинск"},{"id":132,"name":"Северск"},{"id":133,"name":"Сергиев Посад"},{"id":134,"name":"Серпухов"},{"id":135,"name":"Симферополь"},{"id":136,"name":"Смоленск"},{"id":137,"name":"Сочи"},{"id":138,"name":"Ставрополь"},{"id":139,"name":"Старый Оскол"},{"id":140,"name":"Стерлитамак"},{"id":141,"name":"Сургут"},{"id":142,"name":"Сызрань"},{"id":143,"name":"Сыктывкар"},{"id":144,"name":"Таганрог"},{"id":145,"name":"Тамбов"},{"id":146,"name":"Тверь"},{"id":147,"name":"Тольятти"},{"id":148,"name":"Томск"},{"id":149,"name":"Тула"},{"id":150,"name":"Тюмень"},{"id":151,"name":"Улан-Удэ"},{"id":152,"name":"Ульяновск"},{"id":153,"name":"Уссурийск"},{"id":154,"name":"Уфа"},{"id":155,"name":"Хабаровск"},{"id":156,"name":"Хасавюрт"},{"id":157,"name":"Химки"},{"id":158,"name":"Чебоксары"},{"id":159,"name":"Челябинск"},{"id":160,"name":"Череповец"},{"id":161,"name":"Черкесск"},{"id":162,"name":"Чита"},{"id":163,"name":"Шахты"},{"id":164,"name":"Щёлково"},{"id":165,"name":"Электросталь"},{"id":166,"name":"Элиста"},{"id":167,"name":"Энгельс"},{"id":168,"name":"Южно-Сахалинск"},{"id":169,"name":"Якутск"},{"id":170,"name":"Ярославль"}];

  static readonly businessArea: Array<BusinessArea> = [{id:0,"name":"Любая"},{"id":1,"name":"Деятельность домашних хозяйств"},{"id":2,"name":"Деятельность отелей и ресторанов"},{"id":3,"name":"Деятельность транспорта и связи"},{"id":4,"name":"Добыча полезных ископаемых"},{"id":5,"name":"Лесное хозяйство"},{"id":6,"name":"Научная деятельность"},{"id":7,"name":"Образование"},{"id":8,"name":"Операции с недвижимостью, арендные операции"},{"id":9,"name":"Охрана здоровья"},{"id":10,"name":"Перерабатывающая промышленность"},{"id":11,"name":"Предоставление услуг"},{"id":12,"name":"Производство и перераспределение электроэнергии"},{"id":13,"name":"Производство машин и оборудования"},{"id":14,"name":"Рыболовство и разведение рыбы"},{"id":15,"name":"Сельское хозяйство и охота"},{"id":16,"name":"Строительство"},{"id":17,"name":"Торговля"},{"id":18,"name":"Финансовая деятельность"}];

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
    'https://firebasestorage.googleapis.com/v0/b/bizmate-5f9a4.appspot.com/o/default_avatar_purple.svg?alt=media&token=23fc0f91-fc72-4a14-b2c7-18c0b33695f4',
    'https://firebasestorage.googleapis.com/v0/b/bizmate-5f9a4.appspot.com/o/default_avatar_red.svg?alt=media&token=af29412e-544d-4ea7-aaa0-2259d0833d35'
  ];

  constructor() {
  }

  public static getDefaultAvatar(): string {
    const index: number = Math.floor(Math.random() * 5);
    return this.defaultAvatars[index];
  }

  public static getOfferDate(offer: Offer): string {
    const date = new Date(offer.date);

    const day = date.getDate() >= 10 ? date.getDate().toString() : `0${date.getDate()}`;
    const month = date.getMonth() + 1 >= 10 ? (date.getMonth() + 1).toString() : `0${date.getMonth() + 1}`;
    return `${day}.${month}.${date.getFullYear()}`;
  }

  public static getCityByFiledValue(field: string, value: any): City {
    return AppService.cities.filter(it => it[field] == value)[0] || null;
  }

  public static getBusinessAreaByFiledValue(field: string, value: any): BusinessArea {
    return AppService.businessArea.filter(it => it[field] == value)[0] || null;
  }

  public static getOfferTypeByFiledValue(field: string, value: any): any {
    return AppService.offerTypes.filter(it => it[field] == value)[0] || null;
  }

  public static _filterCities(value: string): any[] {
    if (value === null)
      value = '';

    const filterValue = value.toLowerCase();
    return AppService.cities.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  public static _filterCategories(value: string): any[] {
    if (value === null)
      value = '';

    const filterValue = value.toLowerCase();
    return AppService.businessArea.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  public static _filterOfferTypes(value: string): any[] {
    if (value === null)
      value = '';

    const filterValue = value.toLowerCase();
    return AppService.offerTypes.filter(option => option.title.toLowerCase().includes(filterValue));
  }

  public static cityFieldValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = AppService.cities.filter(it => it.name === control.value).length == 1;
      return !control.value ? null : !valid ? {'validCity': {value: control.value}} : null;
    };
  }

  public static businessAreaFieldValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = AppService.businessArea.filter(it => it.name === control.value).length == 1;
      return !control.value ? null : !valid ? {'validArea': {value: control.value}} : null;
    };
  }

  public static offerTypeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = AppService.offerTypes.filter(it => it.title === control.value).length == 1;
      return !control.value ? null : !valid ? {'validArea': {value: control.value}} : null;
    };
  }

  public static showOverlay(): void {
    this._isOverlayVisible = true;
  }

  public static hideOverlay(): void {
    this._isOverlayVisible = false;
  }

  static get isOverlayVisible(): boolean {
    return this._isOverlayVisible;
  }
}
