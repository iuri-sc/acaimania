import {
    Injectable,
    UnauthorizedException
} from "@nestjs/common"

import { JwtService } from "@nestjs/jwt"
import * as argon2 from "argon2"

import { FuncionariosService } from "../funcionarios/funcionarios.service.js"
import { LoginDto } from "./dto/login.dto.js"

@Injectable()
export class AuthService {
    constructor(
        private readonly funcionariosService: FuncionariosService,
        private readonly jwtService: JwtService
    ) {}

    async login(data: LoginDto) {
        // buscar funcionario pelo nome
        const funcionario = await this.funcionariosService.buscarPorNome(
            data.nomeFuncionario
        )

        if (!funcionario) {
            throw new UnauthorizedException(
                "Credenciais inválidas."
            )
        }

        // comparar a senha com o hash armazenado
        const senhaValida = await argon2.verify(
            funcionario.senhaHash,
            data.senhaFuncionario
        )

        if (!senhaValida) {
            throw new UnauthorizedException(
                "Credenciais inválidas."
            )
        }

        // gerar token jwt
        const accessToken = await this.jwtService.signAsync({
            sub: funcionario.id,
        })

        return {
            access_token: accessToken,
            token_type: "Bearer",
            funcionario: {
                id: funcionario.id,
                nome: funcionario.nome
            }
        }
    }
}