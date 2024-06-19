import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import morgan from 'morgan';

const DEFAULT_API_VERSION = '1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  const options = new DocumentBuilder()
    .setTitle('API docs')
    .setVersion(DEFAULT_API_VERSION)
    .addBearerAuth()
    .build();
  app.setGlobalPrefix(globalPrefix);
  app.enableVersioning({
    defaultVersion: DEFAULT_API_VERSION,
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(helmet());
  app.use(morgan('tiny'));

  const configService = app.get(ConfigService);

  const allowlist = [configService.get<string>('app.corsDomain')];

  app.enableCors({
    origin: allowlist,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}/v${DEFAULT_API_VERSION}`,
  );
}

bootstrap();
