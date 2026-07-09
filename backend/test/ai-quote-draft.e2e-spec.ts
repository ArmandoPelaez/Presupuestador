import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import { App } from 'supertest/types';
import { AiController } from '../src/modules/ai/ai.controller';
import { AiService } from '../src/modules/ai/ai.service';
import { JwtAuthGuard } from '../src/modules/auth/jwt-auth.guard';

describe('AI quote draft endpoint (e2e)', () => {
  let app: INestApplication<App>;
  const ai = {
    generateQuoteDraft: jest.fn(() => ({
      customerName: 'Juan Perez',
      customerMatchId: null,
      items: [
        {
          description: 'Instalacion de camara',
          quantity: 3,
          unit: 'unidad',
          catalogMatchId: null,
        },
      ],
      notes: '',
      validUntilDays: null,
      warnings: [],
    })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: ai }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest<{
            headers: Record<string, string | undefined>;
            user?: { id: string; email: string };
          }>();
          if (!req.headers.authorization) {
            throw new UnauthorizedException();
          }
          req.user = { id: req.headers['x-test-user'] ?? 'owner-1', email: '' };
          return true;
        },
      })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => jest.clearAllMocks());

  it('requiere autenticacion para generar un borrador', () =>
    request(app.getHttpServer())
      .post('/api/ai/quote-drafts')
      .send({ description: 'Presupuesto para instalar camaras' })
      .expect(401));

  it('genera borrador para el usuario autenticado', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/ai/quote-drafts')
      .set('Authorization', 'Bearer test-token')
      .set('x-test-user', 'owner-1')
      .send({ description: 'Presupuesto para instalar 3 camaras' })
      .expect(201);

    expect(response.body).toMatchObject({
      customerName: 'Juan Perez',
      items: [{ description: 'Instalacion de camara', quantity: 3 }],
    });
    expect(ai.generateQuoteDraft).toHaveBeenCalledWith('owner-1', {
      description: 'Presupuesto para instalar 3 camaras',
    });
  });

  it('rechaza descripcion demasiado larga antes de llamar al servicio', async () => {
    await request(app.getHttpServer())
      .post('/api/ai/quote-drafts')
      .set('Authorization', 'Bearer test-token')
      .send({ description: 'x'.repeat(2001) })
      .expect(400);

    expect(ai.generateQuoteDraft).not.toHaveBeenCalled();
  });

  afterAll(async () => {
    await app.close();
  });
});
