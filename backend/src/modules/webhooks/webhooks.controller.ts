import { Controller, Post, Param, Body, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('api/v1/webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post(':automationId')
  async trigger(
    @Param('automationId') automationId: string,
    @Body() payload: any = {},
  ) {
    if (!automationId) {
      throw new BadRequestException('Automation ID is required');
    }

    return this.webhooksService.executeAutomation(automationId, payload);
  }
}
