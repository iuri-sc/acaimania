
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NodeAdapter } from '@nestjs/platform-node';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(
        AppModule,
        new NodeAdapter(),
    );

    app.enableShutdownHooks();

    app.enableCors({
        origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const port = Number(process.env.PORT ?? 3000);

    await app.listen(port);

    console.log(`Açaimania API iniciada na porta ${port}`);
}

await bootstrap();
