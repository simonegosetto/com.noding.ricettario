import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'archiviodocumenti'
})
export class ArchivioDocumentiPipe implements PipeTransform {

  transform(categorie: any[], search: string): any {
    return categorie.filter(item => item.arc_tipo.toString().toLowerCase().indexOf(search.toLowerCase()) > -1);
  }

}
