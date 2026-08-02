import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.getHttpAdapter().getInstance().set('trust proxy', 'loopback, linklocal, uniquelocal');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('R Core API')
    .setDescription(`⚠️ This API and documentation are for internal use only, do not disclose them via any communication channel. ⚠️<br>Application designed to serve as a tracking gateway in conjunction with an API that feeds a vehicle-tracking business model, utilizing equipment that employs the GT06 protocol.<br>The application requires the availability of two distinct ports: one for the API and another responsible for receiving TCP packets.`)
    .setVersion('1.0')
    .addTag('Auth')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(3000);
}
bootstrap();
