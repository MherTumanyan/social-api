import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3000;

    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(1);
  }
}

bootstrap();
