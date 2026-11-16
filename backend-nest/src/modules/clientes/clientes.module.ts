
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

import { ClientesController } from './clientes.controller.js';
import { ClientesService } from './clientes.service.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],

  controllers: [ClientesController],

  providers: [ClientesService],
})
export class ClientesModule {}
