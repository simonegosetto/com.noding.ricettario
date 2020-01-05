import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'foodcost'
})
export class FoodcostPipe implements PipeTransform {

  transform(value: any[], search: string): any {
    return value.filter(item => item.Ali_desc.toString().toLowerCase().indexOf(search.toLowerCase()) > -1);
  }

}
