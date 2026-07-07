import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
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
    if (
      !account?.passwordHash ||
      !(await compare(dto.password, account.passwordHash))
    ) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    const user = await this.users.findPublicById(account.id);
    return { user, accessToken: await this.sign(account.id, account.email) };
  }

  async loginWithGoogle(credential: string) {
    const clientId = this.config.get<string>('app.googleClientId');
    if (!clientId) {
      throw new UnauthorizedException(
        'El acceso con Google no está configurado',
      );
    }

    try {
      const ticket = await new OAuth2Client().verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email || !payload.email_verified) {
        throw new UnauthorizedException('La cuenta de Google no es válida');
      }
      const user = await this.users.findOrCreateGoogleUser({
        googleSubject: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name?.trim() || payload.email.split('@')[0],
      });
      return { user, accessToken: await this.sign(user.id, user.email) };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('No se pudo validar la cuenta de Google');
    }
  }

  private sign(id: string, email: string) {
    return this.jwt.signAsync({ sub: id, email });
  }
}
