import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({ //Config. para bloquear o restringir el backend, //tiene que mandar la información como se espera, o la rechazo  
    whitelist: true,
    forbidNonWhitelisted: true,
    })
   );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
