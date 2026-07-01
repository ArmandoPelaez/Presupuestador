/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { AuthService } from './auth.service';
import type { UsersService } from '../users/users.service';
import type { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  const users = {
    create: jest.fn(),
    findByEmailWithHash: jest.fn(),
    findPublicById: jest.fn(),
  };
  const jwt = new JwtService({
    secret: 'a-secure-test-secret-with-32-characters',
    signOptions: { expiresIn: '15m' },
  });
  const config = { getOrThrow: jest.fn().mockReturnValue(10) };
  const service = new AuthService(
    users as unknown as UsersService,
    jwt,
    config as unknown as ConfigService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('registra con email normalizado y nunca devuelve el hash', async () => {
    users.create.mockResolvedValue({
      id: 'u1',
      name: 'Ana',
      email: 'ana@example.com',
    });
    const result = await service.register({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'segura123',
    });
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ana@example.com',
        passwordHash: expect.not.stringMatching('segura123'),
      }),
    );
    expect(result).not.toHaveProperty('user.passwordHash');
    expect(result.accessToken).toBeTruthy();
  });

  it('acepta credenciales válidas y rechaza una contraseña inválida', async () => {
    users.findByEmailWithHash.mockResolvedValue({
      id: 'u1',
      email: 'ana@example.com',
      passwordHash: await hash('segura123', 10),
    });
    users.findPublicById.mockResolvedValue({
      id: 'u1',
      email: 'ana@example.com',
      name: 'Ana',
    });
    await expect(
      service.login({ email: 'ana@example.com', password: 'segura123' }),
    ).resolves.toHaveProperty('accessToken');
    await expect(
      service.login({ email: 'ana@example.com', password: 'incorrecta' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza emails duplicados', async () => {
    users.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicado', {
        code: 'P2002',
        clientVersion: '6.19.0',
      }),
    );
    await expect(
      service.register({
        name: 'Ana',
        email: 'ana@example.com',
        password: 'segura123',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('rechaza JWT vencidos', async () => {
    const expired = jwt.sign(
      { sub: 'u1', email: 'ana@example.com' },
      { expiresIn: -1 },
    );
    expect(() => jwt.verify(expired)).toThrow('jwt expired');
  });
});
