
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { PrismaModule } from './database/prisma.module.js';
import { ClientesModule } from './modules/clientes/clientes.module.js';
import { FuncionariosModule } from "./modules/funcionarios/funcionarios.module.js"
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        PrismaModule,
        ClientesModule,
        FuncionariosModule,
        AuthModule
    ],

    controllers: [AppController],

    providers: [AppService],
})
export class AppModule {}
