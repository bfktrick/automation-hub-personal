import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('automations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/automations')
export class AutomationsController {
  constructor(private automationsService: AutomationsService) {}

  @Post()
  create(@Body() createAutomationDto: CreateAutomationDto) {
    return this.automationsService.create(createAutomationDto);
  }

  @Get()
  findAll() {
    return this.automationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.automationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAutomationDto: UpdateAutomationDto,
  ) {
    return this.automationsService.update(id, updateAutomationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.automationsService.remove(id);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.automationsService.toggleActive(id);
  }

  @Post(':id/execute')
  executeNow(@Param('id') id: string) {
    return this.automationsService.executeNow(id);
  }
}
