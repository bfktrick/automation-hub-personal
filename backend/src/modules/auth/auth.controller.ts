import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      properties: {
        access_token: { type: 'string' },
        email: { type: 'string' },
        userId: { type: 'string' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      console.error('❌ Login error in controller:', error);
      // Always return valid JSON for error responses
      if (error?.status === 401) {
        throw error; // Re-throw UnauthorizedException
      }
      // For any other error, throw a safe 500 error
      throw new Error(`Internal server error: ${error?.message || error}`);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Get current user',
    schema: {
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
      },
    },
  })
  async getMe(@Request() req: any) {
    return {
      id: req.user.sub,
      email: req.user.email,
    };
  }
}
