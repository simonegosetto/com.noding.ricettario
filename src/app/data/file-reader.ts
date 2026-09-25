import { Observable } from 'rxjs';

/** Contenuto base64 di un file (senza il prefisso `data:...;base64,`). */
export function readFileAsBase64(file: Blob): Observable<string> {
  return new Observable<string>((subscriber) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      subscriber.next(dataUrl.slice(dataUrl.indexOf(',') + 1));
      subscriber.complete();
    };
    reader.onerror = () =>
      subscriber.error(reader.error ?? new Error('Lettura del file non riuscita'));
    reader.readAsDataURL(file);
    return () => {
      if (reader.readyState === FileReader.LOADING) {
        reader.abort();
      }
    };
  });
}

/** Data URL nel formato atteso dal proxy Dropbox (lo stesso della versione legacy). */
export function toDataUrl(type: string, base64: string): string {
  return `data:${type};base64,${base64}`;
}
