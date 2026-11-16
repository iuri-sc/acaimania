
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module.js';
import { FuncionariosService } from './funcionarios.service.js';

@Module({
    imports: [PrismaModule],
    providers: [FuncionariosService],
    exports: [FuncionariosService],
})
export class FuncionariosModule {}
