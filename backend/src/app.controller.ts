
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get('health')
    healthHandle() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    @Get()
    root() {
        return { message: '3D E-commerce API is running' };
    }
}
