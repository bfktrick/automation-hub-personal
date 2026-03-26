import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      console.log('🔐 Attempting login for email:', email);

      let user;
      try {
        user = await this.prisma.user.findUnique({
          where: { email },
        });
      } catch (dbError) {
        console.error('❌ Database error in findUnique:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (!user) {
        console.log('❌ User not found:', email);
        throw new UnauthorizedException('Invalid email or password');
      }

      console.log('✅ User found, validating password');

      let passwordValid = false;
      try {
        passwordValid = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
        console.error('❌ Bcrypt error:', bcryptError);
        throw new Error(`Password validation error: ${bcryptError.message}`);
      }

      if (!passwordValid) {
        console.log('❌ Invalid password for user:', email);
        throw new UnauthorizedException('Invalid email or password');
      }

      console.log('✅ Password valid, generating JWT');

      const payload = { sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload);

      console.log('✅ Login successful for user:', email);

      return {
        access_token,
        email: user.email,
        userId: user.id,
      };
    } catch (error) {
      console.error('❌ Login service error:', error);
      throw error;
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async ensureAdminExists() {
    const adminCount = await this.prisma.user.count();

    if (adminCount === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.prisma.user.create({
        data: {
          email: 'admin@automation-hub.local',
          password: hashedPassword,
        },
      });

      console.log(
        '✅ Default admin user created: admin@automation-hub.local / admin123',
      );
    }
  }
}
