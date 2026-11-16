import "dotenv/config"

import { NestFactory } from "@nestjs/core"
import { createInterface } from "node:readline/promises"
import { stdin, stdout } from "node:process"

import { AppModule } from "../app.module.js"
import { FuncionariosService } from "../modules/funcionarios/funcionarios.service.js"

async function main(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule)

    try {
        const funcionariosService = app.get(FuncionariosService)

        const readline = createInterface({
            input: stdin,
            output: stdout
        })

        let nomeFuncionario: string
        let senhaFuncionario: string

        try {
            nomeFuncionario = await readline.question(
                "Nome do funcionário: "
            )

            senhaFuncionario = await readline.question(
                "Senha do funcionário: "
            )
        } finally {
            readline.close()
        }

        const funcionario = await funcionariosService.criar({
            nomeFuncionario,
            senhaFuncionario
        })

        console.log("Funcionário cadastrado: ", funcionario)
    } finally {
        await app.close()
    }
}

await main()