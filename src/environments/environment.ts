// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'https://riccardovalore.com',
  apiAuth: 'https://riccardovalore.com/BackEnd/FD_Login.php',
  apiDBox: 'https://riccardovalore.com/BackEnd/FD_DataServiceGatewayCrypt.php',
  apiUpload: 'https://riccardovalore.com/BackEnd/FD_Upload.php',
  apiDropbox: 'https://riccardovalore.com/BackEnd/FD_DropboxGateway.php',
  apiReport: 'https://riccardovalore.com/BackEnd/ReportService/FD_RicettaPrinter.php',
  TOKEN: '8F39D289C2D21ABA1D95845FF5F26BE1'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
