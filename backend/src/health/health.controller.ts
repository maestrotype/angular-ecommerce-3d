import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('test-history')
  testHistory() {
    console.log('HealthController: test-history called');
    return { message: 'Health test history works' };
  }

  @Get('tripo-history-test')
  async tripoHistoryTest() {
    console.log('HealthController: tripo-history-test called');
    return { message: 'If you see this, GET works in HealthController' };
  }
}




