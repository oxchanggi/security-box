import { registerAs } from '@nestjs/config';
import fs from 'fs';
import path from 'path';
import * as process from 'process';

const clientCertStag = fs.readFileSync(
  path.join(__dirname, '../ssl/stag/client-cert.pem'),
);
const clientKeyStag = fs.readFileSync(
  path.join(__dirname, '../ssl/stag/client-key.pem'),
);
const serverCaStag = fs.readFileSync(
  path.join(__dirname, '../ssl/stag/server-ca.pem'),
);

const clientCertProd = fs.readFileSync(
  path.join(__dirname, '../ssl/prod/client-cert.pem'),
);
const clientKeyProd = fs.readFileSync(
  path.join(__dirname, '../ssl/prod/client-key.pem'),
);
const serverCaProd = fs.readFileSync(
  path.join(__dirname, '../ssl/prod/server-ca.pem'),
);

export const configDb = registerAs('db', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'test',
  synchronize: Boolean(Number(process.env.DB_SYNC || 0)),
  // synchronize: true,
  autoLoadEntities: true,
  logging: Boolean(Number(process.env.DB_DEBUG || 0)),
  ssl:
    process.env.APP_ENV == 'production' || process.env.APP_ENV == 'staging'
      ? {
          ca: process.env.APP_ENV == 'production' ? serverCaProd : serverCaStag,
          key:
            process.env.APP_ENV == 'production' ? clientKeyProd : clientKeyStag,
          cert:
            process.env.APP_ENV == 'production'
              ? clientCertProd
              : clientCertStag,
          rejectUnauthorized: false,
        }
      : null,
}));
