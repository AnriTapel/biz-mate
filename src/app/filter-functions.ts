import {AppService} from "./app.service";

export class FilterFunctions{

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
}
