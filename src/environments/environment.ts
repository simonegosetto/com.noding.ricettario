// Configurazione di produzione (default di `ng build`).
// In `ng serve` e nella build development viene sostituita da environment.development.ts
// tramite `fileReplacements` (angular.json).
// Attenzione: non esiste un ambiente di test, anche lo sviluppo punta al backend di produzione.
export const environment = {
  production: true,
  /** Con readOnly attivo il readOnlyInterceptor blocca le scritture verso il backend (vedi README). */
  readOnly: false,
  apiAuth: 'https://ricettario.prodottidivalore.it/BackEnd/FD_Login.php',
  apiDBox: 'https://ricettario.prodottidivalore.it/BackEnd/FD_DataServiceGatewayCrypt.php',
  apiDropbox: 'https://ricettario.prodottidivalore.it/BackEnd/FD_DropboxGateway.php',
  apiReportRicetta:
    'https://ricettario.prodottidivalore.it/BackEnd/ReportService/FD_RicettaPrinter.php',
  apiReportSchedaTecnica:
    'https://ricettario.prodottidivalore.it/BackEnd/ReportService/FD_SchedaTecnicaPrinter.php',
  apiReportListino:
    'https://ricettario.prodottidivalore.it/BackEnd/ReportService/FD_ReportListino.php',
  apiReportMenuAllaCarta:
    'https://ricettario.prodottidivalore.it/BackEnd/ReportService/FD_ReportMenuAllaCarta.php',
  apiReportMenuEvento:
    'https://ricettario.prodottidivalore.it/BackEnd/ReportService/FD_ReportMenuEvento.php',
  /** Token applicativo statico richiesto da FD_Login.php: finisce nel bundle, non è un segreto. */
  TOKEN: '8F39D289C2D21ABA1D95845FF5F26BE1',
};
