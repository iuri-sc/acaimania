
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';

import { ClientesService } from './clientes.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Controller('clientes')
export class ClientesController {
    constructor(
        private readonly clientesService: ClientesService,
    ) {}

    // POST /clientes
    @Post()
    create(@Body() data: CreateClienteDto) {
        return this.clientesService.create(data);
    }

    // GET /clientes
    @Get()
    findAll() {
        return this.clientesService.findAll();
    }

    // GET /clientes/:id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.clientesService.findOne(id);
    }

    // PATCH /clientes/:id
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateClienteDto,
    ) {
        return this.clientesService.update(id, data);
    }

    // DELETE /clientes/:id
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.clientesService.remove(id);
    }
}
