import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ingredienti'
})
export class IngredientiPipe implements PipeTransform {

  transform(ingredienti: any[], search: string): any {
    return ingredienti.filter(item => item.descrizione.toString().toLowerCase().indexOf(search.toLowerCase()) > -1);
  }

}
