import {
    IsString,
    Length,
    ValidateIf,
} from 'class-validator';

import { Transform } from 'class-transformer';

export class UpdateClienteDto {
    @ValidateIf((_object, value) => value !== undefined)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value
    )
    @IsString()
    @Length(2, 120)
    nome?: string;

    @ValidateIf((_object, value) => value !== undefined)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value
    )
    @IsString()
    @Length(8, 20)
    telefone?: string;
}