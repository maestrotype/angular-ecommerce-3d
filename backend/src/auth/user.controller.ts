import {
    Controller,
    Get,
    Query,
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
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('users')
// @UseGuards(JwtAuthGuard, AdminGuard)
export class UserController {
    constructor(private readonly authService: AuthService) { }

    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.authService.findAllPaginated(page, limit);
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