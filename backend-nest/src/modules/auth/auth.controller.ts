import {
    Controller,
    Post,
    Get,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards
} from "@nestjs/common"

import { AuthService } from "./auth.service.js"
import { LoginDto } from "./dto/login.dto.js"
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js"

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post("login")
    @HttpCode(HttpStatus.OK)
    login(@Body() data: LoginDto) {
        return this.authService.login(data)
    }

    @Get("verificar")
    @UseGuards(JwtAuthGuard)
    verificar() {
        return {
            autenticado: true
        }
    }
}