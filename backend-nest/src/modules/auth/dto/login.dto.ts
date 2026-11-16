import { Transform } from "class-transformer"
import { IsString, IsNotEmpty } from "class-validator"

export class LoginDto {
    @Transform(({ value }) => 
        typeof value === "string" ? value.trim() : value
    )
    @IsString()
    @IsNotEmpty()
    nomeFuncionario!: string

    @IsString()
    @IsNotEmpty()
    senhaFuncionario!: string
}