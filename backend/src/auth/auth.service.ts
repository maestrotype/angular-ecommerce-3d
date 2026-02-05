
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Observable, from, throwError, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) { }

  register(registerDto: RegisterDto): Observable<{ user: any; token: string; expiresIn: number }> {
    // 1. Check if email already exists
    return from(this.userRepository.findOne({ where: { email: registerDto.email } })).pipe(
      switchMap(existingUser => {
        if (existingUser) {
          return throwError(() => new ConflictException('Email already registered'));
        }
        // 2. Hash password
        return from(bcrypt.hash(registerDto.password, 12));
      }),
      switchMap(hashedPassword => {
        // 3. Create and save user
        const user = this.userRepository.create({
          ...registerDto,
          password: hashedPassword,
        });
        return from(this.userRepository.save(user));
      }),
      switchMap(savedUser => {
        // 4. Create notification for new user registration
        return from(this.notificationsService.createNewUserNotification(
          savedUser.name,
          savedUser.email
        )).pipe(
          map(() => savedUser)
        );
      }),
      switchMap(savedUser => {
        // 5. Generate JWT token
        const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
        const token = this.jwtService.sign(payload);

        // 6. Return AuthResponse format
        return of({
          user: {
            id: savedUser.id,
            email: savedUser.email,
            name: savedUser.name,
            role: savedUser.role,
          },
          token,
          expiresIn: 604800, // 7 days in seconds
        });
      }),
      catchError(error => {
        console.error('[AuthService] Registration error:', error);
        // Handle database unique constraint errors
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          return throwError(() => new ConflictException('Email already registered'));
        }
        return throwError(() => error);
      })
    );
  }

  login(loginDto: LoginDto): Observable<{ user: any; token: string; expiresIn: number }> {
    return from(this.userRepository.findOne({
      where: { email: loginDto.email },
    })).pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new UnauthorizedException('Invalid credentials'));
        }

        return from(bcrypt.compare(loginDto.password, user.password)).pipe(
          map(isValid => ({ user, isValid }))
        );
      }),
      switchMap(({ user, isValid }) => {
        if (!isValid) {
          return throwError(() => new UnauthorizedException('Invalid credentials'));
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        return of({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
          expiresIn: 604800, // 7 days in seconds
        });
      }),
      catchError(error => {
        console.error('[AuthService] Login error:', error);
        return throwError(() => error);
      })
    );
  }

  findById(id: number): Observable<User> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      catchError(error => {
        console.error('[AuthService] Find by ID error:', error);
        return throwError(() => error);
      })
    );
  }

  createAdminUser(): Observable<User> {
    return from(this.userRepository.findOne({
      where: { email: 'admin@example.com' },
    })).pipe(
      switchMap(existingAdmin => {
        if (existingAdmin) {
          return of(existingAdmin);
        }

        return from(bcrypt.hash('admin123', 12)).pipe(
          switchMap(hashedPassword => {
            const adminUser = this.userRepository.create({
              email: 'admin@example.com',
              name: 'Admin User',
              password: hashedPassword,
              role: UserRole.ADMIN,
            });
            return from(this.userRepository.save(adminUser));
          })
        );
      }),
      catchError(error => {
        console.error('[AuthService] Create admin error:', error);
        return throwError(() => error);
      })
    );
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      catchError(error => {
        console.error('[AuthService] Find all error:', error);
        return throwError(() => error);
      })
    );
  }

  findAllPaginated(page: number = 1, limit: number = 10): Observable<{ users: User[]; total: number }> {
    return from(this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' }
    })).pipe(
      map(([users, total]) => ({ users, total })),
      catchError(error => {
        console.error('[AuthService] Find all paginated error:', error);
        return throwError(() => error);
      })
    );
  }

  updateUser(id: number, dto: UpdateUserDto): Observable<User> {
    return from(this.userRepository.update(id, dto)).pipe(
      switchMap(() => from(this.userRepository.findOne({ where: { id } }))),
      catchError(error => {
        console.error('[AuthService] Update user error:', error);
        return throwError(() => error);
      })
    );
  }

  removeUser(id: number): Observable<void> {
    return from(this.userRepository.delete(id)).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('[AuthService] Remove user error:', error);
        return throwError(() => error);
      })
    );
  }
}
