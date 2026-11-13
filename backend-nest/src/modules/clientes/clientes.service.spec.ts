import { vi, describe, it, expect, beforeEach } from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { ClientesService } from './clientes.service.js';
import { PrismaService } from '../../database/prisma.service.js';

type ClienteMock = {
  id: number;
  nome: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
};

describe('ClientesService', () => {
  let service: ClientesService;

  const prismaMock = {
    cliente: {
      create:
        vi.fn<
          (args: {
            data: { nome: string; telefone: string };
          }) => Promise<ClienteMock>
        >(),

      findMany:
        vi.fn<
          (args: { orderBy: { createdAt: 'desc' } }) => Promise<ClienteMock[]>
        >(),

      findUnique:
        vi.fn<
          (args: { where: { id: number } }) => Promise<ClienteMock | null>
        >(),

      update:
        vi.fn<
          (args: {
            where: { id: number };
            data: { nome?: string; telefone?: string };
          }) => Promise<ClienteMock>
        >(),

      delete:
        vi.fn<(args: { where: { id: number } }) => Promise<ClienteMock>>(),
    },
  };

  const clienteMock: ClienteMock = {
    id: 1,
    nome: 'Cliente Teste',
    telefone: '5599999999999',
    createdAt: new Date('2026-11-13T06:34:55.591Z'),
    updatedAt: new Date('2026-11-13T06:34:55.591Z'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
  });

  it('deve cadastrar um cliente', async () => {
    const data = {
      nome: 'Cliente Teste',
      telefone: '5599999999999',
    };

    prismaMock.cliente.create.mockResolvedValue(clienteMock);

    const resultado = await service.create(data);

    expect(resultado.id).toBe(1);
    expect(resultado.nome).toBe('Cliente Teste');

    expect(prismaMock.cliente.create).toHaveBeenCalledWith({
      data,
    });
  });

  it('deve listar clientes', async () => {
    prismaMock.cliente.findMany.mockResolvedValue([clienteMock]);

    const resultado = await service.findAll();

    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.nome).toBe('Cliente Teste');

    expect(prismaMock.cliente.findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('deve lançar erro quando cliente não existir', async () => {
    prismaMock.cliente.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);

    expect(prismaMock.cliente.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
    });
  });

  it('deve atualizar um cliente', async () => {
    const data = {
      nome: 'Cliente Atualizado',
    };

    prismaMock.cliente.findUnique.mockResolvedValue(clienteMock);

    prismaMock.cliente.update.mockResolvedValue({
      ...clienteMock,
      ...data,
    });

    const resultado = await service.update(1, data);

    expect(resultado.nome).toBe('Cliente Atualizado');

    expect(prismaMock.cliente.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        nome: 'Cliente Atualizado',
        telefone: undefined,
      },
    });
  });

  it('deve excluir um cliente', async () => {
    prismaMock.cliente.findUnique.mockResolvedValue(clienteMock);
    prismaMock.cliente.delete.mockResolvedValue(clienteMock);

    const resultado = await service.remove(1);

    expect(resultado.id).toBe(1);

    expect(prismaMock.cliente.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
