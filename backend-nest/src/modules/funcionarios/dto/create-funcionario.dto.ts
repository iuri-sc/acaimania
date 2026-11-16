import { Transform } from "class-transformer"
import { IsString, Length } from "class-validator"

export class CreateFuncionarioDto {
    @Transform(({ value }) => 
        typeof value === "string" ? value.trim() : value
    )
    @IsString()
    @Length(2, 120)
    nomeFuncionario!: string

    @IsString()
    @Length(2, 120)
    senhaFuncionario!: string
}