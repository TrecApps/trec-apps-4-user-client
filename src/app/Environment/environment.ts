// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //user_service_url: 'https://azurewebsites.net/'
  //user_service_url: 'https://trecappsusertest.azurewebsites.net/',
  user_admin_url: 'https://trec-apps-test-admin.azurewebsites.net/',
  //user_service_url: 'http://localhost:4200/User-api/',
  user_service_url: 'https://test.trecapps.com/User-api/',
  //user_admin_url: 'http://localhost:4200/admin/',
  user_subscription_url: 'http://localhost:4200/sub/',
  user_tenant_url: '@trecappstest.onmicrosoft.com',
  user_tenent_id: 'f39a0b26-67a9-4f7a-9020-dd9126eec668',
  user_client_id: '43ac483f-360e-4686-8a43-2543f71b33ee',
  //image_service_url: "http://localhost:4200/Images-api/"
  image_service_url: "https://test.trecapps.com/Images-api/",

  
  app_name: "Trec-Apps-User-Service"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
