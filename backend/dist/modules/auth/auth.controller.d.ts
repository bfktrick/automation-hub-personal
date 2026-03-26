import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        email: string;
        userId: string;
    }>;
    getMe(req: any): Promise<{
        id: any;
        email: any;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map