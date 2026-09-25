import { Pipe, PipeTransform } from '@angular/core';

/** Nome del file senza l'ultima estensione ("menu.v2.pdf" → "menu.v2"). */
@Pipe({ name: 'noextension' })
export class NoextensionPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const dot = value.lastIndexOf('.');
    return dot > 0 ? value.slice(0, dot) : value;
  }
}
