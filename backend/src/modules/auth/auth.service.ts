import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const user = await this.users.create({
        name: dto.name.trim(),
        email: dto.email,
        passwordHash: await hash(
          dto.password,
          this.config.getOrThrow<number>('app.passwordRounds'),
        ),
      });
      return { user, accessToken: await this.sign(user.id, user.email) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const account = await this.users.findByEmailWithHash(dto.email);
    if (!account || !(await compare(dto.password, account.passwordHash))) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    const user = await this.users.findPublicById(account.id);
    return { user, accessToken: await this.sign(account.id, account.email) };
  }

  private sign(id: string, email: string) {
    return this.jwt.signAsync({ sub: id, email });
  }
}
