
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
  UseGuards,
} from '@nestjs/common';

import { ClientesService } from './clientes.service.js';

import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
  ) {}

  // POST /clientes - público
  @Post()
  create(@Body() data: CreateClienteDto) {
    return this.clientesService.create(data);
  }

  // GET /clientes - protegido
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.clientesService.findAll();
  }

  // GET /clientes/:id - protegido
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  // PATCH /clientes/:id - protegido
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, data);
  }

  // DELETE /clientes/:id - protegido
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.clientesService.remove(id);
  }
}
