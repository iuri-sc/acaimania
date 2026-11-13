import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {

    constructor(configService: ConfigService) {
        const adapter = new PrismaPg({
            connectionString: configService.getOrThrow<string>(
                'DATABASE_URL',
            ),
        });

        super({ adapter });
    }

    // Executado quando o módulo é inicializado
    async onModuleInit(): Promise<void> {
        await this.$connect();

        console.log('Conexão com PostgreSQL estabelecida.');
    }

    // Executado quando o módulo é encerrado
    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();

        console.log('Conexão com PostgreSQL encerrada.');
    }
}