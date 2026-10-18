import { APP_VERSION } from './version';

export const environment = {
  production: false,
  baseUrl: 'http://localhost:3000',
  hosFloorStockUrl: 'http://192.168.96.5/api/hos/item-floorstock',
  assets: '',
  version: APP_VERSION.version,
  tag: APP_VERSION.tag,
  buildTime: APP_VERSION.buildTime
};

