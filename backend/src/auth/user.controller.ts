import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    ParseIntPipe,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { AdminGuard } from './guards/admin.guard';
  
  @Controller('users')
  @UseGuards(AdminGuard)
  export class UserController {
    constructor(private readonly authService: AuthService) {}
  
    @Get()
    findAll() {
      return this.authService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.authService.findById(id);
    }
  
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
      return this.authService.updateUser(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.authService.removeUser(id);
    }
  }