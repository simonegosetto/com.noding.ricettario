import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noextension'
})
export class NoextensionPipe implements PipeTransform {

  transform(value: string): any {
    if (value === undefined || value === null) {
      return '';
    } else if (value.indexOf('.') === -1){
      return value;
    }
    const splitString = value.split(".");
    splitString.splice(splitString.length-1,1);
    return splitString.join(".");
  }

}
