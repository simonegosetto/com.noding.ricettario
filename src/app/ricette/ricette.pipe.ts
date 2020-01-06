import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ricette'
})
export class RicettePipe implements PipeTransform {

  transform(ricette: any[], search: string): any {
    return ricette.filter(item => item.nome_ric.toString().toLowerCase().indexOf(search.toLowerCase()) > -1);
  }

}
