import {
    Injectable,
    ConflictException
} from "@nestjs/common"

import * as argon2 from "argon2"

import { PrismaService } from "../../database/prisma.service.js"

import { CreateFuncionarioDto } from "./dto/create-funcionario.dto.js"

@Injectable()
export class FuncionariosService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    // cadastro interno: nao expor em rota publica
    async criar(data: CreateFuncionarioDto) {
        const nome = data.nomeFuncionario.trim()

        const existente = await this.prisma.funcionario.findUnique({
            where: { nome },
        })

        if (existente) {
            throw new ConflictException(
                "Já existe um funcionário com esse nome.",
            )
        }

        const senhaHash = await argon2.hash(
            data.senhaFuncionario,
            {
                type: argon2.argon2id
            }
        )

        return this.prisma.funcionario.create({
            data: {
                nome,
                senhaHash
            },
            select: {
                id: true,
                nome: true
            }
        })
    }

    // utilizado futuramente pelo AuthService
    async buscarPorNome(nome: string) {
        return this.prisma.funcionario.findUnique({
            where: {
                nome: nome.trim()
            }
        })
    }

    // consulta segura sem expor hashes
    async listar() {
        return this.prisma.funcionario.findMany({
            select: {
                id: true,
                nome: true
            },
            orderBy: {
                nome: "asc"
            }
        })
    }
}