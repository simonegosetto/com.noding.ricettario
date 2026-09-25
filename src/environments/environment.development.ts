// Configurazione di sviluppo (`ng serve`): stesso backend di produzione, ma in sola lettura.
// Per provare le scritture su record di test impostare temporaneamente readOnly: false.
export const environment = {
  production: false,
  /** Con readOnly attivo il readOnlyInterceptor blocca le scritture verso il backend (vedi README). */
  readOnly: true,
  apiAuth: 'https://ricettario.prodottidivalore.it/BackEnd/FD_Login.php',
  apiDBox: 'https://ricettario.prodottidivalore.it/BackEnd/FD_DataServiceGatewayCrypt.php',
  apiDropbox: 'https://ricettario.prodottidivalore.it/BackEnd/FD_DropboxGateway.php',
  apiReportRicetta: 'https://ricettario.prodottidivalore.it/BackEnd/ReportService/FD_RicettaPrinter.php',
  apiReportSchedaTecnica: 'https://ricettario.prodottidivalore.it/BackEnd/ReportService/FD_SchedaTecnicaPrinter.php',
  apiReportListino: 'https://ricettario.prodottidivalore.it/BackEnd/ReportService/FD_ReportListino.php',
  apiReportMenuAllaCarta: 'https://ricettario.prodottidivalore.it/BackEnd/ReportService/FD_ReportMenuAllaCarta.php',
  apiReportMenuEvento: 'https://ricettario.prodottidivalore.it/BackEnd/ReportService/FD_ReportMenuEvento.php',
  /** Token applicativo statico richiesto da FD_Login.php: finisce nel bundle, non è un segreto. */
  TOKEN: '8F39D289C2D21ABA1D95845FF5F26BE1',
};
