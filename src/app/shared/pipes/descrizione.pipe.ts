import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'descrizione'
})
export class DescrizionePipe implements PipeTransform {

  transform(lista: any[], search: string): any {
    return lista.filter(item => item.descrizione.toString().toLowerCase().indexOf(search.toLowerCase()) > -1);
  }

}
