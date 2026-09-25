// Configurazione dei test end-to-end (`ng serve -c e2e`): Playwright intercetta tutte le chiamate
// al backend, quindi le scritture sono permesse e nessuna richiesta raggiunge la produzione.
export const environment = {
  production: false,
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
  TOKEN: 'e2e-app-token',
};
