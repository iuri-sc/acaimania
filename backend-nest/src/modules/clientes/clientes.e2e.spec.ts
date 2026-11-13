import {
    beforeAll,
    beforeEach,
    afterAll,
    describe,
    expect,
    it,
    vi
} from "vitest"

import { Test } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import { NodeAdapter } from "@nestjs/platform-node"
import request from "supertest"

import { ClientesController } from "./clientes.controller.js"
import { ClientesService } from "./clientes.service.js"

describe("Clientes HTTP (e2e)", () => {
    let app: INestApplication

    const clienteMock = {
        id: 1,
        nome: 'Cliente Teste',
        telefone: '5599999999999',
        createdAt: new Date('2026-11-13T06:34:55.591Z'),
        updatedAt: new Date('2026-11-13T06:34:55.591Z'),
    }

    const clientesServiceMock = {
        create: vi.fn(),
        findAll: vi.fn(),
        findOne: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
    }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ClientesController],
            providers: [
                {
                    provide: ClientesService,
                    useValue: clientesServiceMock
                }
            ]
        }).compile()

        app = moduleRef.createNestApplication(
            new NodeAdapter()
        )

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true
            })
        )

        await app.init()
    })

    beforeEach(() => {
        vi.resetAllMocks()
    })

    afterAll(async () => {
        await app?.close()
    })

    it("POST /clientes deve cadastrar um cliente", async () => {
        const data = {
            nome: "Cliente Teste",
            telefone: "5599999999999"
        }

        clientesServiceMock.create.mockResolvedValue(clienteMock)

        const response = await request(app.getHttpServer())
            .post("/clientes")
            .send(data)
            .expect(201)

        expect(response.body).toMatchObject({
            id: 1,
            nome: "Cliente Teste",
            telefone: "5599999999999"
        })

        expect(clientesServiceMock.create)
            .toHaveBeenCalledWith(data)
    })

    it("POST /clientes deve rejeitar nome vazio", async () => {
        await request(app.getHttpServer())
            .post("/clientes")
            .send({
                nome: "",
                telefone: "5599999999999"
            })
            .expect(400)

        expect(clientesServiceMock.create)
            .not.toHaveBeenCalled()
    })

    it("/POST /clientes deve rejeitar campo desconhecido", async () => {
        await request(app.getHttpServer())
            .post("/clientes")
            .send({
                nome: "Cliente Teste",
                telefone: "5599999999999",
                administrador: true
            })
            .expect(400)

        expect(clientesServiceMock.create)
            .not.toHaveBeenCalledOnce()
    })

    it("/GET /clientes deve retornar uma lista", async () => {
        clientesServiceMock.findAll.mockResolvedValue([
            clienteMock
        ])

        const response = await request(app.getHttpServer())
            .get("/clientes")
            .expect(200)

        expect(response.body).toHaveLength(1)

        expect(response.body[0]).toMatchObject({
            id: 1,
            nome: "Cliente Teste"
        })

        expect(clientesServiceMock.findAll)
            .toHaveBeenCalledOnce()
    })
})