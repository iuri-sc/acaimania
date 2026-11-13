import {
    vi,
    describe,
    it,
    expect,
    beforeEach
} from "vitest"

import { Test } from "@nestjs/testing"

import { ClientesController } from "./clientes.controller.js"
import { ClientesService } from "./clientes.service.js"

describe("ClientesController", () => {
    let controller: ClientesController

    const clienteMock = {
        id: 1,
        nome: "Cliente Teste",
        telefone: "5599999999999",
        createdAt: new Date("2026-11-13T06:34:55.591Z"),
        updatedAt: new Date("2026-11-13T06:34:55.591Z")
    }

    const clientesServiceMock = {
        create: vi.fn(),
        findAll: vi.fn(),
        findOne: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
    }

    beforeEach(async () => {
        vi.resetAllMocks()

        const module = await Test.createTestingModule({
            controllers: [ClientesController],
            providers: [
                {
                    provide: ClientesService,
                    useValue: clientesServiceMock
                }
            ]
        }).compile()

        controller = module.get<ClientesController>(ClientesController)
    })

    it("deve cadastrar um cliente", async () => {
        const data = {
            nome: "Cliente Teste",
            telefone: "5599999999999"
        }

        clientesServiceMock.create.mockResolvedValue(clienteMock)

        const resultado = await controller.create(data)

        expect(resultado).toEqual(clienteMock)
        expect(clientesServiceMock.create).toHaveBeenCalledWith(data)
    })

    it("deve listar clientes", async () => {
        clientesServiceMock.findAll.mockResolvedValue([clienteMock])

        const resultado = await controller.findAll()

        expect(resultado).toEqual([clienteMock])
        expect(resultado).toHaveLength(1)

        expect(clientesServiceMock.findAll).toHaveBeenCalledOnce()
    })

    it("deve buscar um cliente pelo ID", async () => {
        clientesServiceMock.findOne.mockResolvedValue(clienteMock)

        const resultado = await controller.findOne(1);

        expect(resultado).toEqual(clienteMock)
        expect(clientesServiceMock.findOne).toHaveBeenCalledWith(1)
    })

    it("deve atualizar um cliente", async () => {
        const data = { nome: "Cliente Atualizado" }
        const atualizado = { ...clienteMock, ...data }

        clientesServiceMock.update.mockResolvedValue(atualizado)

        const resultado = await controller.update(1, data)

        expect(resultado).toEqual(atualizado)
        expect(clientesServiceMock.update).toHaveBeenCalledWith(1, data)
    })

    it("deve excluir um cliente", async () => {
        clientesServiceMock.remove.mockResolvedValue(clienteMock)

        await controller.remove(1)

        expect(clientesServiceMock.remove).toHaveBeenCalledWith(1)
    })
})