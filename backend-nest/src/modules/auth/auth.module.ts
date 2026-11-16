
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../../database/prisma.module.js';
import { FuncionariosModule } from '../funcionarios/funcionarios.module.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        FuncionariosModule,

        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: '1h',
                    algorithm: 'HS256',
                },
                verifyOptions: {
                    algorithms: ['HS256'],
                },
            }),
        }),
    ],

    controllers: [AuthController],

    providers: [
        AuthService,
        JwtAuthGuard,
    ],

    exports: [
        AuthService,
        JwtAuthGuard,
        JwtModule,
    ],
})
export class AuthModule {}
