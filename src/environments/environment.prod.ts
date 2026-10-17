import { APP_VERSION } from './version';

export const environment = {
  production: true,
  baseUrl: 'http://192.168.96.5/vmd-api-er',
  assets: '/vmd-web-er',
  version: APP_VERSION.version,
  tag: APP_VERSION.tag,
  buildTime: APP_VERSION.buildTime
};

