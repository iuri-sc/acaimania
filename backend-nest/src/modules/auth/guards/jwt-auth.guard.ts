import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from "@nestjs/common"

import { JwtService } from "@nestjs/jwt"
import { PrismaService } from "../../../database/prisma.service.js"

type AuthRequest = {
    headers: {
        authorization?: string
    }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthRequest>()

        const authorization = request.headers.authorization

        const match = /^Bearer\s+(.+)$/i.exec(authorization ?? "")

        if (!match) {
            throw new UnauthorizedException("Token não informado.")
        }

        let payload: { sub: number }

        try {
            payload = await this.jwtService.verifyAsync<{
                sub: number
            }>(match[1]!)
        } catch {
            throw new UnauthorizedException(
                "Token inválido ou expirado."
            )
        }

        if (!Number.isSafeInteger(payload.sub) || payload.sub <= 0) {
            throw new UnauthorizedException("Token inválido.")
        }

        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id: payload.sub },
            select: { id: true }
        })

        if (!funcionario) {
            throw new UnauthorizedException(
                "Funcionário não encontrado"
            )
        }

        return true
    }
}