import { APP_VERSION } from './version';

export const environment = {
  production: true,
  baseUrl: 'http://200.200.200.10:3000',
  assets: '/VMD',
  version: APP_VERSION.version,
  tag: APP_VERSION.tag,
  buildTime: APP_VERSION.buildTime
};

