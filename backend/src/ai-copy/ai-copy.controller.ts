import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AiCopyService } from './ai-copy.service';
import { DescribeProductCopyDto } from './dto/describe-product-copy.dto';

@Controller('ai-copy')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AiCopyController {
  constructor(private readonly aiCopyService: AiCopyService) {}

  @Post('describe')
  @HttpCode(HttpStatus.OK)
  describe(@Body() dto: DescribeProductCopyDto) {
    return this.aiCopyService.describe(dto);
  }
}
