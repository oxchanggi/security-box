import { registerAs } from '@nestjs/config';
import * as process from 'process';

export const configApp = registerAs('app', () => ({
  corsDomain: process.env.CORS_DOMAIN ? process.env.CORS_DOMAIN.split(',') : [],
  name: 'LootBot',
  prefixSecret: 'Lootbot@123',
  secretPk: process.env.SECRET_PK || 'i9GN91XU3G96GMIXXCeFfgs8',
}));
