import { vi, describe, it, expect, beforeEach } from "vitest"

import { Test } from "@nestjs/testing"
import { ConflictException } from "@nestjs/common"
import * as argon2 from "argon2"

import { FuncionariosService } from "./funcionarios.service.js"
import { PrismaService } from "../../database/prisma.service.js"
import { Prisma } from "../../generated/prisma/client.js"


type FuncionarioMock = {
    id: number
    nome: string
    senhaHash: string
}

describe("FuncionariosService", () => {
    let service: FuncionariosService

    const funcionarioMock: FuncionarioMock = {
        id: 1,
        nome: "João",
        senhaHash: "$argon2id$hash-simulado"
    }

    const prismaMock = {
        funcionario: {
            findUnique: vi.fn<
                (args: { where: { nome: string } }) => 
                    Promise<FuncionarioMock | null>
            >(),

            create: vi.fn<
                (args: {
                    data: {
                        nome: string
                        senhaHash: string
                    },
                    select: {
                        id: true
                        nome: true
                    }
                }) => Promise<{ id: number; nome: string }>
            >(),

            findMany: vi.fn<
                (args: {
                    select: { id: true; nome: true }
                    orderBy: { nome: "asc" }
                }) => Promise<Array<{ id: number; nome: string }>>
            >(),
        }
    }

    beforeEach(async () => {
        vi.resetAllMocks()

        const module = await Test.createTestingModule({
            providers: [
                FuncionariosService,
                {
                    provide: PrismaService,
                    useValue: prismaMock
                }
            ]
        }).compile()

        service = module.get<FuncionariosService>(
            FuncionariosService
        )
    })

    it("deve cadastrar um funcionário com senha protegida", async () => {
        prismaMock.funcionario.findUnique.mockResolvedValue(null)

        prismaMock.funcionario.create.mockResolvedValue({
            id: 1,
            nome: "João"
        })

        const resultado = await service.criar({
            nomeFuncionario: "João",
            senhaFuncionario: "SenhaSegura123"
        })

        expect(resultado).toEqual({
            id: 1,
            nome: "João"
        })

        expect(prismaMock.funcionario.create)
            .toHaveBeenCalledOnce

        const chamada = prismaMock.funcionario.create.mock.calls[0]

        expect(chamada).toBeDefined()

        const senhaHash = chamada![0].data.senhaHash

        expect(senhaHash).not.toBe("SenhaSegura123")
        expect(senhaHash).toMatch(/^\$argon2id\$/)

        expect(
            await argon2.verify(senhaHash, "SenhaSegura123")
        ).toBe(true)
    })

    it("deve impedir nomes duplicados", async () => {
        prismaMock.funcionario.findUnique.mockResolvedValue(
            funcionarioMock
        )

        await expect(
            service.criar({
                nomeFuncionario: "João",
                senhaFuncionario: "SenhaSegura123"
            })
        ).rejects.toThrow(ConflictException)

        expect(prismaMock.funcionario.create)
            .not.toHaveBeenCalled()
    })

    it("deve buscar um funcionário pelo nome", async () => {
        prismaMock.funcionario.findUnique.mockResolvedValue(
            funcionarioMock
        )

        const resultado = await service.buscarPorNome(" João ")

        expect(resultado).toEqual(funcionarioMock)

        expect(prismaMock.funcionario.findUnique)
            .toHaveBeenCalledWith({
                where: { nome: "João" }
            })
    })

    it("deve listar funcionários sem expor senhas", async () => {
        prismaMock.funcionario.findMany.mockResolvedValue([
            {
                id: 1,
                nome: "João"
            }
        ])

        const resultado = await service.listar()

        expect(resultado).toEqual([
            {
                id: 1,
                nome: "João"
            }
        ])

        expect(prismaMock.funcionario.findMany)
            .toHaveBeenLastCalledWith({
                select: {
                    id: true,
                    nome: true,
                },
                orderBy: {
                    nome: "asc"
                }
            })
    })
})