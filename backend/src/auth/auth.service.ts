
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      expiresIn: 604800, // 7 days in seconds
    };
  }

  async findById(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async createAdminUser(): Promise<User> {
    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = this.userRepository.create({
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    return await this.userRepository.save(adminUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findAllPaginated(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { id: 'ASC' }
    });
    return { users, total };
}

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, dto);
    return await this.findById(id);
  }

  async removeUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }     
}
