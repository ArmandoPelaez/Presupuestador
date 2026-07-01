# Presupuestador Pro

Base técnica del MVP con un frontend Next.js y una API NestJS conectada a SQLite mediante Prisma.

## Requisitos

- Node.js 24 o una versión LTS compatible
- npm 11+

## Instalación

Copie `frontend/.env.example` a `frontend/.env.local` y `backend/.env.example` a `backend/.env`. No confirme archivos `.env` ni secretos en Git.

```powershell
cd frontend
npm.cmd install

cd ..\backend
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run prisma:migrate -- --name init
```

La URL SQLite es relativa a `backend/prisma/`. Para cargar el usuario de demostración opcional, defina `SEED_DEMO=true` y ejecute `npm.cmd run prisma:seed`. La cuenta queda deliberadamente inhabilitada hasta implementar autenticación en la Fase 1.

## Desarrollo

En dos terminales:

```powershell
cd frontend
npm.cmd run dev
```

```powershell
cd backend
npm.cmd run start:dev
```

El frontend queda en `http://localhost:3000`; la API usa el prefijo `/api`, escucha en `http://localhost:3001` y expone `GET /api/health`.

## Controles de calidad

Cada proyecto ofrece scripts independientes para `lint`, `format`, `format:check`, `type-check`, `test` y `build`. El backend también incluye `test:e2e`.

```powershell
npm.cmd run lint
npm.cmd run format:check
npm.cmd run type-check
npm.cmd test
npm.cmd run build
```

## Variables

El backend valida `NODE_ENV`, `PORT`, `DATABASE_URL` y `CORS_ORIGINS` al iniciar. `CORS_ORIGINS` acepta orígenes separados por comas. El frontend valida `NEXT_PUBLIC_API_URL`; por llevar el prefijo `NEXT_PUBLIC_`, su valor es público y nunca debe contener secretos.
