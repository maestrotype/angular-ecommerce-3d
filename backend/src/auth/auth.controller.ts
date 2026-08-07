
import { Controller, Post, Body, Get, UseGuards, Request, ForbiddenException, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('create-admin')
  createAdmin(@Headers('x-admin-bootstrap-token') bootstrapToken?: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN?.trim();
      if (!expectedToken || bootstrapToken !== expectedToken) {
        throw new ForbiddenException(
          'Admin bootstrap requires a valid x-admin-bootstrap-token header in production.',
        );
      }
    }

    return this.authService.createAdminUser();
  }
}
