import { Module, forwardRef } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [PrismaModule, forwardRef(() => JobsModule)],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
