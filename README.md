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

## Guardrail visual

La paleta oficial de la aplicación está centralizada en `frontend/src/app/globals.css`, dentro de la sección `:root` que comienza en la línea 53. Todas las pantallas nuevas y componentes visuales deben consumir esos tokens; no deben introducir colores hardcodeados, gradientes propios ni clases Tailwind de color directo fuera de esa paleta.

Si hace falta un color nuevo, primero debe agregarse como token en `globals.css` y luego reutilizarse desde componentes y pantallas. Antes de entregar cambios de UI, verificar que `frontend/src/app` y `frontend/src/components` no tengan colores fuera de paleta.

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

Para habilitar el acceso con Google, cree un cliente OAuth 2.0 de tipo **Aplicación web** en Google Cloud, autorice `http://localhost:3000` como origen JavaScript y configure el mismo identificador público en ambos proyectos:

```env
# backend/.env
GOOGLE_CLIENT_ID=su-id.apps.googleusercontent.com

# frontend/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=su-id.apps.googleusercontent.com
```

El frontend obtiene el ID token mediante Google Identity Services y el backend verifica firma, vencimiento, emisor y audiencia antes de aceptar la sesión. El secreto OAuth no es necesario para este flujo y no debe agregarse al frontend.

## Producción

Usar `backend/.env.production.example` como referencia, con secretos administrados fuera del repositorio, `JWT_SECRET` aleatorio y `CORS_ORIGINS` restringido. En backend ejecutar `npm ci`, `npm run prisma:deploy`, `npm run build` y `npm run start:prod`. En frontend ejecutar `npm ci`, `npm run build` y `npm start` con la URL HTTPS de la API. No registrar Authorization, contraseñas, hashes ni cuerpos de autenticación.

SQLite requiere una única instancia del backend y un volumen persistente; no debe compartirse el archivo entre réplicas.

## Enlaces públicos de presupuestos

Configure `PUBLIC_APP_URL` con el origen HTTPS del frontend, `QUOTE_SHARE_DEFAULT_DAYS` con una vigencia acotada y `QUOTE_SHARE_COMMENT_MAX_LENGTH` con el límite admitido para comentarios. El backend genera un único enlace al guardar, conserva su hash para validación pública y cifra el token para que el propietario autenticado pueda recuperar la misma URL.

El enlace es una credencial bearer: compártalo solo con el destinatario, no lo registre en logs, analítica, tickets ni capturas, y no lo trate como firma digital. La ruta pública usa `no-referrer` y no requiere JWT. Un enlace vencido, respondido o desconocido responde con el mismo mensaje para evitar enumeración.

Guardar mantiene el presupuesto en borrador. Copiar el link o descargar el PDF lo cambia a enviado sin reemplazar la URL. El enlace permanece vigente hasta la primera aceptación, rechazo o fecha de vencimiento.

Para desplegar, aplique primero `npm.cmd run prisma:deploy` en backend y luego publique backend y frontend con `PUBLIC_APP_URL`, `CORS_ORIGINS` y `NEXT_PUBLIC_API_URL` apuntando a sus orígenes HTTPS reales. Para deshabilitar temporalmente la función, retire sus controles del frontend o bloquee las rutas de compartir/públicas en el proxy; no borre la tabla ni revierta estados ya respondidos.

## Backup y restauración

Detener escrituras antes de copiar `backend/prisma/dev.db`. Guardar la copia fuera del despliegue. Para restaurar, detener el backend, conservar el archivo actual, reemplazarlo por el backup, ejecutar `npm run prisma:deploy`, reiniciar y comprobar `/api/health`. Ensayar periódicamente la restauración en un entorno separado.

## Entrega

GitHub Actions instala, ejecuta lint, type-check, pruebas y build de ambos proyectos. Antes de desplegar desde cero, aplicar migraciones a una base vacía y recorrer registro, clientes, catálogo, presupuestos, estados y PDF.
