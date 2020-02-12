import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'archiviodocumento'
})
export class ArchivioDocumentoPipe implements PipeTransform {

  transform(files: any[], search: string): any {
    return files.filter(item => item.arc_nome.toString().toLowerCase().indexOf(search.toLowerCase()) > -1);
  }

}
