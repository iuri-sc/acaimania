
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
} from 'vitest';

import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { AuthService } from './auth.service.js';
import { FuncionariosService } from '../funcionarios/funcionarios.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const funcionariosServiceMock = {
    buscarPorNome: vi.fn<
      (nome: string) => Promise<{
        id: number;
        nome: string;
        senhaHash: string;
      } | null>
    >(),
  };

  const jwtServiceMock = {
    signAsync: vi.fn<
      (payload: { sub: number }) => Promise<string>
    >(),
  };

  const senha = 'SenhaSegura123!';

  let funcionarioMock: {
    id: number;
    nome: string;
    senhaHash: string;
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    funcionarioMock = {
      id: 1,
      nome: 'João',
      senhaHash: await argon2.hash(senha, {
        type: argon2.argon2id,
      }),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FuncionariosService,
          useValue: funcionariosServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve autenticar funcionário com credenciais corretas', async () => {
    funcionariosServiceMock.buscarPorNome.mockResolvedValue(
      funcionarioMock,
    );

    jwtServiceMock.signAsync.mockResolvedValue(
      'token-jwt-simulado',
    );

    const resultado = await service.login({
      nomeFuncionario: 'João',
      senhaFuncionario: senha,
    });

    expect(resultado).toEqual({
      access_token: 'token-jwt-simulado',
      token_type: 'Bearer',
      funcionario: {
        id: 1,
        nome: 'João',
      },
    });
  });

  it('deve rejeitar uma senha incorreta', async () => {
    funcionariosServiceMock.buscarPorNome.mockResolvedValue(
      funcionarioMock,
    );

    await expect(
      service.login({
        nomeFuncionario: 'João',
        senhaFuncionario: 'SenhaErrada123',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtServiceMock.signAsync)
      .not.toHaveBeenCalled();
  });

  it('deve rejeitar funcionário inexistente', async () => {
    funcionariosServiceMock.buscarPorNome.mockResolvedValue(null);

    await expect(
      service.login({
        nomeFuncionario: 'Inexistente',
        senhaFuncionario: senha,
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtServiceMock.signAsync)
      .not.toHaveBeenCalled();
  });

  it('deve gerar JWT com o ID correto', async () => {
    funcionariosServiceMock.buscarPorNome.mockResolvedValue(
      funcionarioMock,
    );

    jwtServiceMock.signAsync.mockResolvedValue(
      'token-jwt-simulado',
    );

    await service.login({
      nomeFuncionario: 'João',
      senhaFuncionario: senha,
    });

    expect(jwtServiceMock.signAsync)
      .toHaveBeenCalledExactlyOnceWith({
        sub: funcionarioMock.id,
      });
  });
});
