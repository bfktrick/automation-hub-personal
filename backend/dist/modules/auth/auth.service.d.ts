import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        email: string;
        userId: string;
    }>;
    validateUser(userId: string): Promise<{
        email: string;
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    ensureAdminExists(): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map