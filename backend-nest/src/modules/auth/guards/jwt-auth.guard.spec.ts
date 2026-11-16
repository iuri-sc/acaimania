
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
} from 'vitest';

import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../../../database/prisma.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const jwtServiceMock = {
    verifyAsync: vi.fn<
      (token: string) => Promise<{ sub: number }>
    >(),
  };

  const prismaMock = {
    funcionario: {
      findUnique: vi.fn<
        (args: {
          where: { id: number };
          select: { id: true };
        }) => Promise<{ id: number } | null>
      >(),
    },
  };

  // Simula o contexto HTTP do NestJS.
  function criarContexto(
    authorization?: string,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization },
        }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(async () => {
    vi.resetAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('deve rejeitar requisição sem token', async () => {
    const contexto = criarContexto();

    await expect(
      guard.canActivate(contexto),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtServiceMock.verifyAsync)
      .not.toHaveBeenCalled();
  });

  it('deve rejeitar token inválido ou expirado', async () => {
    const contexto = criarContexto(
      'Bearer token-invalido',
    );

    jwtServiceMock.verifyAsync.mockRejectedValue(
      new Error('jwt expired'),
    );

    await expect(
      guard.canActivate(contexto),
    ).rejects.toThrow(UnauthorizedException);

    expect(prismaMock.funcionario.findUnique)
      .not.toHaveBeenCalled();
  });

  it('deve rejeitar funcionário inexistente', async () => {
    const contexto = criarContexto(
      'Bearer token-valido',
    );

    jwtServiceMock.verifyAsync.mockResolvedValue({
      sub: 999,
    });

    prismaMock.funcionario.findUnique
      .mockResolvedValue(null);

    await expect(
      guard.canActivate(contexto),
    ).rejects.toThrow(UnauthorizedException);

    expect(prismaMock.funcionario.findUnique)
      .toHaveBeenCalledWith({
        where: { id: 999 },
        select: { id: true },
      });
  });

  it('deve permitir acesso com token válido', async () => {
    const contexto = criarContexto(
      'Bearer token-valido',
    );

    jwtServiceMock.verifyAsync.mockResolvedValue({
      sub: 1,
    });

    prismaMock.funcionario.findUnique
      .mockResolvedValue({ id: 1 });

    const resultado = await guard.canActivate(
      contexto,
    );

    expect(resultado).toBe(true);

    expect(jwtServiceMock.verifyAsync)
      .toHaveBeenCalledWith('token-valido');

    expect(prismaMock.funcionario.findUnique)
      .toHaveBeenCalledWith({
        where: { id: 1 },
        select: { id: true },
      });
  });
});
