
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service.js';

import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    // Cadastrar cliente
    async create(data: CreateClienteDto) {
        return this.prisma.cliente.create({
            data: {
                nome: data.nome,
                telefone: data.telefone,
            },
        });
    }

    // Listar todos os clientes
    async findAll() {
        return this.prisma.cliente.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    // Buscar cliente por ID
    async findOne(id: number) {
        const cliente = await this.prisma.cliente.findUnique({
            where: { id },
        });

        if (!cliente) {
            throw new NotFoundException(
                `Cliente com ID ${id} não encontrado.`,
            );
        }

        return cliente;
    }

    // Atualizar cliente
    async update(id: number, data: UpdateClienteDto) {
        if (Object.keys(data).length === 0) {
            throw new BadRequestException(
                'Informe pelo menos um campo para atualizar.',
            );
        }

        await this.findOne(id);

        return this.prisma.cliente.update({
            where: { id },
            data: {
                nome: data.nome,
                telefone: data.telefone,
            },
        });
    }

    // Excluir cliente
    async remove(id: number) {
        await this.findOne(id);

        return this.prisma.cliente.delete({
            where: { id },
        });
    }
}
