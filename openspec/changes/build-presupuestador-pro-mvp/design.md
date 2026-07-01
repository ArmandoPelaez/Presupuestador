## Context

Presupuestador Pro parte de un repositorio sin implementación y debe cubrir el flujo diario de un pequeño negocio: mantener clientes y conceptos frecuentes, preparar un presupuesto, revisar sus totales, cambiar su estado y compartirlo como PDF. La primera versión será usada por propietarios individuales desde web y móvil. Debe priorizar velocidad de entrega, claridad y bajo costo operativo sin cerrar la futura migración de SQLite a PostgreSQL.

## Goals / Non-Goals

**Goals:**

- Separar frontend y backend en proyectos desplegables de manera independiente.
- Mantener reglas, autorización y cálculos críticos en una API REST modular.
- Ofrecer una UI responsive, accesible y rápida para los flujos frecuentes.
- Modelar importes y relaciones de forma compatible con SQLite y PostgreSQL.
- Dividir el MVP en incrementos verificables con tareas pequeñas.

**Non-Goals:**

- Multiempresa, equipos, roles avanzados o colaboración simultánea.
- Facturación fiscal, cobros, inventario, contabilidad o integraciones externas.
- Envío de correos/WhatsApp desde el sistema y firma electrónica.
- Personalización avanzada de plantillas, monedas múltiples, idiomas múltiples o modo offline.
- Microservicios, colas, eventos distribuidos, GraphQL o infraestructura Kubernetes.

## Decisions

### 1. Arquitectura general

Se usarán dos aplicaciones independientes en un mismo repositorio:

```text
Navegador
   |
   v
frontend/ (Next.js, React, TypeScript, Tailwind, shadcn/ui)
   | HTTPS + JSON + JWT
   v
backend/ (NestJS, módulos REST, validación y reglas de negocio)
   |
   v
Prisma ORM -> SQLite (MVP) / PostgreSQL (futuro)
```

El frontend no accederá a la base de datos ni recalculará totales autoritativos. Podrá mostrar una previsualización inmediata, pero guardará y presentará como definitivos los valores devueltos por la API. Se elige un backend modular monolítico porque el dominio y la escala inicial no justifican microservicios.

### 2. Estructura de carpetas recomendada

```text
/
├─ frontend/
│  ├─ src/app/
│  │  ├─ (auth)/login/ y register/
│  │  └─ (app)/dashboard/, clients/, catalog/ y quotes/
│  ├─ src/components/{ui,layout,forms,quotes}/
│  ├─ src/lib/{api,auth,formatters,validators}/
│  ├─ src/hooks/
│  └─ src/types/
├─ backend/
│  ├─ src/
│  │  ├─ common/{decorators,filters,guards,pipes}/
│  │  ├─ config/
│  │  ├─ prisma/
│  │  └─ modules/{auth,users,customers,catalog,quotes,pdf,dashboard}/
│  │     └─ <module>/{dto,entities,<module>.controller.ts,<module>.service.ts,<module>.module.ts}
│  ├─ prisma/{schema.prisma,migrations/,seed.ts}
│  └─ test/
├─ openspec/
├─ .env.example
└─ README.md
```

Los proyectos tendrán `package.json`, configuración y variables de entorno propias. No se agregará una biblioteca compartida en el MVP; los contratos se mantendrán pequeños y los tipos de frontend representarán las respuestas públicas de la API.

### 3. Modelo de datos inicial

- `User`: `id`, `name`, `email` único, `passwordHash`, `businessName` opcional, `taxId` opcional, `createdAt`, `updatedAt`.
- `Customer`: `id`, `userId`, `name`, `businessName` opcional, `email` opcional, `phone` opcional, `taxId` opcional, `address` opcional, `notes` opcional, `isActive`, timestamps.
- `CatalogItem`: `id`, `userId`, `type` (`PRODUCT` o `SERVICE`), `name`, `description` opcional, `unit`, `unitPrice` decimal, `taxRate` decimal, `isActive`, timestamps.
- `Quote`: `id`, `userId`, `customerId`, `number`, `status` (`DRAFT`, `SENT`, `APPROVED`, `REJECTED`), `issueDate`, `validUntil` opcional, `currency` fija inicialmente en `ARS`, `notes` opcional, `discountType` (`NONE`, `PERCENTAGE`, `FIXED`), `discountValue`, `subtotal`, `discountTotal`, `taxTotal`, `total`, timestamps.
- `QuoteItem`: `id`, `quoteId`, `catalogItemId` opcional, `description`, `quantity`, `unit`, `unitPrice`, `taxRate`, `lineSubtotal`, `lineTax`, `lineTotal`, `position`.

Cada registro de negocio pertenece a un usuario. `QuoteItem` guarda una instantánea de descripción, unidad, precio e impuesto para que cambios futuros del catálogo no alteren presupuestos existentes. Los importes usarán `Decimal` de Prisma con precisión definida y nunca `float`; la API serializará valores monetarios como strings decimales. La numeración será correlativa por usuario mediante una restricción única `(userId, number)` y una transacción.

### 4. API REST principal

Todas las rutas, excepto registro, login y health, requieren JWT.

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- `GET /customers`, `POST /customers`, `GET /customers/:id`, `PATCH /customers/:id`, `DELETE /customers/:id` (desactivación lógica).
- `GET /catalog-items`, `POST /catalog-items`, `GET /catalog-items/:id`, `PATCH /catalog-items/:id`, `DELETE /catalog-items/:id` (desactivación lógica).
- `GET /quotes`, `POST /quotes`, `GET /quotes/:id`, `PATCH /quotes/:id`, `DELETE /quotes/:id` (solo borradores), `PATCH /quotes/:id/status`.
- Los ítems se crean y actualizan dentro del payload de `POST/PATCH /quotes` para guardar el agregado en una transacción y evitar una API innecesariamente fragmentada.
- `GET /quotes/:id/pdf` devuelve `application/pdf` con nombre de archivo seguro.
- `GET /dashboard/summary` devuelve contadores, importes agregados y presupuestos recientes.
- `GET /health` permite comprobar la disponibilidad del backend.

Los listados admitirán `page`, `pageSize`, `search` y filtros relevantes (`status`, `type`, `isActive`) con límites razonables. Los errores usarán una forma consistente: código HTTP, identificador legible, mensaje y detalles de campos cuando corresponda.

### 5. Pantallas y navegación

- Registro e inicio de sesión.
- Shell autenticado con barra lateral en escritorio y navegación compacta en móvil.
- Dashboard con tarjetas de resumen y últimos presupuestos.
- Clientes: listado/búsqueda, alta, edición y detalle sencillo.
- Productos y servicios: listado/filtros, alta y edición.
- Presupuestos: listado con búsqueda/filtro de estado, editor, detalle y acciones de estado/PDF.
- Editor de presupuesto: cliente, fechas, ítems reordenables de forma simple, descuento, notas y resumen de totales siempre visible.

Se reutilizarán componentes shadcn/ui para formularios, tablas, diálogos, selectores, badges, toast y confirmaciones. En móvil, las tablas densas se transformarán en tarjetas o vistas con scroll controlado. Los formularios tendrán labels, mensajes de error junto al campo, estados de carga y foco visible.

### 6. Autenticación y autorización

Las contraseñas se almacenarán con hash robusto (Argon2 o bcrypt con costo configurable). El JWT de acceso tendrá expiración corta configurable. Para mantener acotado el MVP se utilizará un token bearer persistido por el cliente y se documentará el riesgo; no habrá refresh tokens. Cada consulta de negocio filtrará por `userId` derivado del JWT y responderá como no encontrado ante recursos ajenos. Variables secretas y URL de API se configurarán por entorno.

Alternativa considerada: autenticación administrada por un proveedor. Se descarta en el MVP para respetar NestJS + JWT y evitar dependencia comercial, aunque sería razonable reevaluarla al incorporar equipos o SSO.

### 7. Cálculos y validaciones

El backend validará DTOs con lista blanca y rechazo de propiedades desconocidas. Reglas principales:

- Email válido y normalizado; contraseña de al menos 8 caracteres; nombres obligatorios con longitudes máximas.
- IDs con formato válido y pertenencia al usuario autenticado.
- Cantidad mayor que cero; precio unitario, tasas y descuentos no negativos; escalas decimales limitadas.
- Porcentaje de impuesto y descuento entre 0 y 100; descuento fijo no mayor al subtotal.
- Al menos un ítem por presupuesto; descripción obligatoria; posiciones únicas y ordenadas.
- `validUntil` igual o posterior a `issueDate`.
- Transiciones permitidas: borrador a enviado; enviado a aprobado o rechazado. Un presupuesto aprobado o rechazado no se edita en el MVP.
- Redondeo monetario consistente a dos decimales mediante aritmética decimal.

Orden de cálculo: subtotal de línea = cantidad × precio; subtotal general = suma de líneas; descuento general proporcional sobre las líneas; impuesto por línea sobre la base luego del descuento; total = subtotal − descuento + impuestos. Todos los valores calculados del cliente serán ignorados y regenerados en el servidor dentro de una transacción.

### 8. PDF

El backend generará el PDF desde datos persistidos para asegurar consistencia y evitar diferencias entre navegadores. La plantilla incluirá identidad básica del negocio, número/estado/fechas, cliente, detalle de ítems, totales y notas. Se elegirá una biblioteca Node mantenida que funcione sin navegador pesado; la decisión final se tomará durante el spike de implementación.

Alternativa considerada: imprimir HTML desde el frontend. Se descarta porque dificulta obtener resultados reproducibles y asegurar que el documento corresponda al estado autorizado.

### 9. Estrategia de calidad

- Pruebas unitarias del motor de cálculo y transiciones de estado.
- Pruebas de servicios para autorización por propietario y numeración.
- Pruebas e2e de API para autenticación y flujo principal del presupuesto.
- Pruebas de componentes/formularios críticos y un recorrido e2e web feliz si el tiempo del MVP lo permite.
- Lint, type-check y build de ambos proyectos en CI.

## Risks / Trade-offs

- [JWT almacenado en el cliente aumenta el impacto de XSS] → Evitar HTML no confiable, aplicar CSP, expiración corta y planificar cookies HttpOnly/refresh tokens para una versión posterior.
- [SQLite limita concurrencia y operación distribuida] → Mantener acceso vía Prisma, evitar SQL específico y preparar una migración probada a PostgreSQL antes de escalar.
- [Decimales pueden divergir entre UI, API y PDF] → Centralizar el cálculo autoritativo y redondeo en backend, serializar como strings y cubrir casos límite con pruebas.
- [Numeración correlativa puede sufrir carreras] → Asignarla en transacción con restricción única y reintento acotado.
- [El PDF puede variar entre entornos] → Fijar versiones, usar fuentes incluidas y probar contenido y una muestra visual.
- [Desactivar clientes o conceptos vinculados genera ambigüedad] → Conservarlos para historial, excluirlos de selectores nuevos y mantener snapshots en ítems.

## Migration Plan

1. Crear ambos proyectos, configuración de entorno y controles de calidad.
2. Definir el esquema Prisma, migración SQLite inicial y datos de demostración opcionales.
3. Implementar los módulos por fases, habilitando cada pantalla cuando su API esté estable.
4. Desplegar inicialmente como una única instancia del backend con volumen persistente para SQLite y frontend separado.
5. Antes de PostgreSQL, ejecutar pruebas contra ese proveedor, generar migración y realizar exportación/restauración ensayada. El rollback consistirá en volver a la versión anterior y restaurar el respaldo previo.

## Open Questions

- Confirmar nombre, CUIT, dirección y logo mínimos que aparecerán en el PDF; para el MVP se usarán los campos disponibles del usuario y un diseño neutro sin logo obligatorio.
- Confirmar si el impuesto predeterminado será IVA 21%; se propone comenzar en 0 y permitir que cada concepto indique su tasa para no imponer una regla fiscal incorrecta.
- Confirmar si la moneda inicial debe ser solo ARS; el diseño asume ARS para el MVP y conserva el campo para evolución futura.
