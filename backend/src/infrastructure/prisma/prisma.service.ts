import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    await this.ensureAdminExists();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async ensureAdminExists() {
    try {
      const adminCount = await this.user.count();
      if (adminCount === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await this.user.create({
          data: {
            email: 'admin@automation-hub.local',
            password: hashedPassword,
          },
        });
        console.log('✅ Default admin user created: admin@automation-hub.local / admin123');
      }
    } catch (error) {
      console.error('Error ensuring admin exists:', error);
    }
  }
}
