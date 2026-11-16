
import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { Test } from '@nestjs/testing';

import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';

import { NodeAdapter } from '@nestjs/platform-node';
import request from 'supertest';

import { ClientesController } from './clientes.controller.js';
import { ClientesService } from './clientes.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

describe('Clientes HTTP (e2e)', () => {
  let app: INestApplication;

  // Cliente utilizado nos testes
  const clienteMock = {
    id: 1,
    nome: 'Cliente Teste',
    telefone: '5599999999999',
    createdAt: new Date('2026-11-13T06:34:55.591Z'),
    updatedAt: new Date('2026-11-13T06:34:55.591Z'),
  };

  // Simula o ClientesService
  const clientesServiceMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  // Simula o JwtAuthGuard
  const guardMock = {
    canActivate: vi.fn<() => boolean>(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ClientesController],
      providers: [
        {
          provide: ClientesService,
          useValue: clientesServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(guardMock)
      .compile();

    app = moduleRef.createNestApplication(
      new NodeAdapter(),
    );

    // Mesma configuração utilizada na aplicação real
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  beforeEach(() => {
    // Limpar chamadas e comportamentos dos mocks
    vi.resetAllMocks();

    // Autorizar requisições por padrão
    guardMock.canActivate.mockReturnValue(true);
  });

  afterAll(async () => {
    await app?.close();
  });

  // =========================================
  // TESTE 1 - CADASTRO
  // =========================================

  it('POST /clientes deve cadastrar um cliente', async () => {
    const data = {
      nome: 'Cliente Teste',
      telefone: '5599999999999',
    };

    clientesServiceMock.create.mockResolvedValue(clienteMock);

    const response = await request(app.getHttpServer())
      .post('/clientes')
      .send(data)
      .expect(201);

    expect(response.body).toMatchObject({
      id: 1,
      nome: 'Cliente Teste',
      telefone: '5599999999999',
    });

    expect(clientesServiceMock.create)
      .toHaveBeenCalledWith(data);
  });

  // =========================================
  // TESTE 2 - VALIDAÇÃO DO NOME
  // =========================================

  it('POST /clientes deve rejeitar nome vazio', async () => {
    await request(app.getHttpServer())
      .post('/clientes')
      .send({
        nome: '',
        telefone: '5599999999999',
      })
      .expect(400);

    expect(clientesServiceMock.create)
      .not.toHaveBeenCalled();
  });

  // =========================================
  // TESTE 3 - PROPRIEDADES DESCONHECIDAS
  // =========================================

  it('POST /clientes deve rejeitar campo desconhecido', async () => {
    await request(app.getHttpServer())
      .post('/clientes')
      .send({
        nome: 'Cliente Teste',
        telefone: '5599999999999',
        administrador: true,
      })
      .expect(400);

    expect(clientesServiceMock.create)
      .not.toHaveBeenCalled();
  });

  // =========================================
  // TESTE 4 - LISTAGEM
  // =========================================

  it('GET /clientes deve retornar uma lista', async () => {
    clientesServiceMock.findAll.mockResolvedValue([
      clienteMock,
    ]);

    const response = await request(app.getHttpServer())
      .get('/clientes')
      .expect(200);

    expect(response.body).toHaveLength(1);

    expect(response.body[0]).toMatchObject({
      id: 1,
      nome: 'Cliente Teste',
      telefone: '5599999999999',
    });

    expect(clientesServiceMock.findAll)
      .toHaveBeenCalledOnce();

    expect(guardMock.canActivate)
      .toHaveBeenCalledOnce();
  });

  // =========================================
  // TESTE 5 - ACESSO NÃO AUTORIZADO
  // =========================================

  it('GET /clientes deve rejeitar acesso não autorizado', async () => {
    guardMock.canActivate.mockImplementationOnce(() => {
      throw new UnauthorizedException();
    });

    await request(app.getHttpServer())
      .get('/clientes')
      .expect(401);

    expect(clientesServiceMock.findAll)
      .not.toHaveBeenCalled();

    expect(guardMock.canActivate)
      .toHaveBeenCalledOnce();
  });

  // =========================================
  // TESTE 6 - ACESSO AUTORIZADO
  // =========================================

  it('GET /clientes deve permitir acesso autorizado', async () => {
    clientesServiceMock.findAll.mockResolvedValue([
      clienteMock,
    ]);

    guardMock.canActivate.mockReturnValue(true);

    const response = await request(app.getHttpServer())
      .get('/clientes')
      .expect(200);

    expect(response.body).toHaveLength(1);

    expect(response.body[0]).toMatchObject({
      id: 1,
      nome: 'Cliente Teste',
    });

    expect(clientesServiceMock.findAll)
      .toHaveBeenCalledOnce();

    expect(guardMock.canActivate)
      .toHaveBeenCalledOnce();
  });
});
