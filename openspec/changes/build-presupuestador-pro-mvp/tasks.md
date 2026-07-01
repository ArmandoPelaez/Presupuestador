## 1. Fase 0 — Base técnica y contratos

- [x] 1.1 Crear `frontend/` con Next.js, React, TypeScript, App Router, Tailwind CSS y configuración estricta.
- [x] 1.2 Inicializar shadcn/ui e incorporar los componentes base de formularios, navegación, tablas, diálogos, badges y notificaciones.
- [x] 1.3 Crear `backend/` con NestJS, TypeScript estricto, prefijo de API, CORS configurable y endpoint `GET /health`.
- [x] 1.4 Configurar lint, format, type-check, test y build como scripts independientes en ambos proyectos.
- [x] 1.5 Crear `.env.example` por proyecto, validación de variables de entorno y exclusión segura de secretos.
- [x] 1.6 Instalar Prisma en backend y definir los modelos, enums, índices y relaciones iniciales del diseño.
- [x] 1.7 Generar y ejecutar la migración SQLite inicial y crear un seed mínimo opcional para desarrollo.
- [x] 1.8 Configurar validación global de DTOs, filtro uniforme de excepciones y serialización decimal.
- [x] 1.9 Documentar instalación, comandos, variables y cómo levantar frontend y backend en `README.md`.
- [x] 1.10 Verificar criterio de aceptación: ambos proyectos instalan, pasan lint/type-check/test/build y la API conecta a SQLite y responde health.

## 2. Fase 1 — Autenticación y shell responsive

- [ ] 2.1 Implementar módulo de usuarios y repositorio Prisma sin exponer hashes.
- [ ] 2.2 Implementar DTOs y servicio de registro con email normalizado, unicidad y hash seguro de contraseña.
- [ ] 2.3 Implementar login, emisión de JWT configurable, estrategia y guard de autenticación.
- [ ] 2.4 Implementar `POST /auth/register`, `POST /auth/login` y `GET /auth/me` con respuestas y errores consistentes.
- [ ] 2.5 Crear cliente HTTP tipado, manejo de sesión y protección de rutas en frontend.
- [ ] 2.6 Crear pantallas responsive de registro e inicio de sesión con estados de carga y errores accesibles.
- [ ] 2.7 Crear shell autenticado con sidebar de escritorio, navegación móvil, encabezado y cierre de sesión.
- [ ] 2.8 Agregar pruebas de registro, email duplicado, login válido/inválido, JWT vencido y ruta protegida.
- [ ] 2.9 Verificar criterio de aceptación: un usuario puede registrarse, iniciar sesión, recargar una ruta privada, consultar su perfil y cerrar sesión; un visitante no accede al shell.

## 3. Fase 2 — Clientes

- [ ] 3.1 Implementar DTOs, servicio y consultas Prisma de clientes siempre filtradas por propietario.
- [ ] 3.2 Implementar endpoints de alta, detalle, edición, desactivación y listado paginado con búsqueda.
- [ ] 3.3 Crear página responsive de clientes con búsqueda, paginación, estado vacío y acceso al alta.
- [ ] 3.4 Crear formulario reutilizable de alta/edición con validación cliente-servidor y mensajes por campo.
- [ ] 3.5 Crear vista de detalle sencilla y confirmación de desactivación.
- [ ] 3.6 Agregar pruebas de validación, búsqueda, desactivación con historial y aislamiento entre dos usuarios.
- [ ] 3.7 Verificar criterio de aceptación: cada usuario administra solo sus clientes, encuentra registros por búsqueda y desactiva sin pérdida física de datos.

## 4. Fase 3 — Productos y servicios

- [ ] 4.1 Implementar DTOs y servicio de catálogo con validación decimal, tipo, unidad, precio, tasa y propiedad.
- [ ] 4.2 Implementar endpoints de alta, detalle, edición, desactivación y listado con búsqueda, tipo y estado.
- [ ] 4.3 Crear listado responsive de productos/servicios con filtros, badges, paginación y estado vacío.
- [ ] 4.4 Crear formulario reutilizable de alta/edición con controles apropiados para importes y porcentajes.
- [ ] 4.5 Agregar pruebas de límites monetarios, filtros, desactivación y aislamiento por usuario.
- [ ] 4.6 Verificar criterio de aceptación: el usuario mantiene y filtra un catálogo propio, y los conceptos inactivos no se ofrecen para nuevas selecciones.

## 5. Fase 4 — Núcleo de presupuestos y cálculos

- [ ] 5.1 Implementar una utilidad pura de cálculo decimal para líneas, descuento proporcional, impuestos, redondeo y total.
- [ ] 5.2 Cubrir el motor de cálculo con pruebas de cero impuesto, múltiples tasas, descuentos porcentual/fijo, fracciones y límites inválidos.
- [ ] 5.3 Implementar numeración correlativa segura por usuario con restricción única, transacción y reintento acotado.
- [ ] 5.4 Implementar DTOs anidados de presupuesto e ítems, validaciones de fecha, propiedad y reglas de edición.
- [ ] 5.5 Implementar creación transaccional de presupuesto e instantáneas de ítems, ignorando totales aportados por el cliente.
- [ ] 5.6 Implementar detalle, edición transaccional y eliminación exclusiva de borradores.
- [ ] 5.7 Implementar listado paginado con búsqueda y filtros por estado, cliente y rango de fechas.
- [ ] 5.8 Implementar transiciones borrador→enviado y enviado→aprobado/rechazado, rechazando transiciones inválidas.
- [ ] 5.9 Crear listado responsive de presupuestos con número, cliente, fecha, estado, total, filtros y estados vacío/error.
- [ ] 5.10 Crear editor de presupuesto con cliente, fechas, ítems, selector de catálogo, conceptos manuales, orden, descuento y notas.
- [ ] 5.11 Mostrar previsualización de totales en el editor y reconciliarla siempre con la respuesta autoritativa del backend.
- [ ] 5.12 Crear detalle responsive con ítems, totales, acciones permitidas por estado y confirmaciones.
- [ ] 5.13 Agregar pruebas e2e del flujo crear→editar→enviar→aprobar y de acceso cruzado entre usuarios.
- [ ] 5.14 Verificar criterio de aceptación: el usuario crea y administra presupuestos completos; numeración, snapshots, permisos, estados y totales permanecen consistentes tras recargar.

## 6. Fase 5 — Exportación a PDF

- [ ] 6.1 Evaluar una biblioteca PDF Node sin navegador pesado y registrar la elección y sus límites en la documentación técnica.
- [ ] 6.2 Implementar plantilla PDF con datos del negocio, cliente, presupuesto, ítems, estados, fechas, totales y notas.
- [ ] 6.3 Implementar `GET /quotes/:id/pdf` con autorización, content type y nombre de archivo seguro.
- [ ] 6.4 Agregar acción de descarga con estados de carga y error en listado y detalle.
- [ ] 6.5 Agregar pruebas de propiedad, cabeceras, texto esencial e igualdad entre importes persistidos y exportados.
- [ ] 6.6 Realizar una verificación visual del PDF con textos largos, varios ítems, salto de página y datos opcionales vacíos.
- [ ] 6.7 Verificar criterio de aceptación: el propietario descarga un PDF legible y consistente; ningún usuario puede exportar presupuestos ajenos.

## 7. Fase 6 — Dashboard y pulido del MVP

- [ ] 7.1 Implementar consulta agregada de contadores por estado, importes relevantes y presupuestos recientes filtrada por usuario.
- [ ] 7.2 Implementar `GET /dashboard/summary` y cubrir los casos con datos y sin datos.
- [ ] 7.3 Crear dashboard responsive con tarjetas, actividad reciente, estados vacíos y acceso a crear/ver presupuestos.
- [ ] 7.4 Revisar navegación por teclado, labels, foco, contraste, mensajes de error y tamaños táctiles en flujos principales.
- [ ] 7.5 Verificar layouts en anchos móvil, tablet y escritorio, eliminando desbordes y acciones inaccesibles.
- [ ] 7.6 Agregar un recorrido e2e web del camino feliz desde login hasta descarga del PDF.
- [ ] 7.7 Verificar criterio de aceptación: dashboard y recorridos principales son claros y operables en web y mobile, sin exponer datos de otra cuenta.

## 8. Fase 7 — Preparación de entrega

- [ ] 8.1 Configurar CI para instalar, lint, type-check, probar y compilar frontend y backend.
- [ ] 8.2 Crear configuración de producción con secretos externos, CORS restringido, logs seguros y migraciones controladas.
- [ ] 8.3 Documentar backup y restauración de SQLite y limitaciones de despliegue en instancia única.
- [ ] 8.4 Ejecutar migraciones desde cero y validar el flujo completo en un entorno limpio con datos de prueba.
- [ ] 8.5 Revisar que respuestas, logs, bundle frontend y repositorio no incluyan contraseñas, hashes, JWT ni secretos.
- [ ] 8.6 Verificar criterio de aceptación: una persona nueva puede desplegar el MVP siguiendo la documentación y todos los controles automatizados quedan verdes.

## 9. Fuera del MVP — Backlog futuro

- [ ] 9.1 Migrar a PostgreSQL con ensayo de datos, respaldo, restauración y pruebas de concurrencia.
- [ ] 9.2 Incorporar refresh tokens en cookies HttpOnly, recuperación de contraseña, verificación de email y sesiones revocables.
- [ ] 9.3 Diseñar organizaciones, múltiples usuarios, roles y permisos por negocio.
- [ ] 9.4 Incorporar configuración fiscal avanzada, múltiples monedas, idiomas y numeraciones configurables.
- [ ] 9.5 Incorporar plantillas PDF personalizables, logo, firma y envío por email o WhatsApp.
- [ ] 9.6 Incorporar duplicación de presupuestos, historial/auditoría, comentarios y conversión a factura u orden.
- [ ] 9.7 Incorporar pagos, inventario, contabilidad e integraciones con servicios externos solo tras validar demanda.
- [ ] 9.8 Incorporar reportes avanzados, exportación CSV/Excel, búsqueda global y analítica histórica.
- [ ] 9.9 Evaluar PWA/offline, notificaciones y aplicaciones móviles después de estabilizar el producto web.
