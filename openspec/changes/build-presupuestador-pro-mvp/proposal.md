## Why

Los pequeños negocios necesitan una forma simple y profesional de preparar presupuestos sin depender de planillas, cálculos manuales ni documentos difíciles de mantener. Presupuestador Pro cubrirá ese flujo esencial con una experiencia web moderna, usable desde escritorio y móvil, y una base técnica preparada para crecer sin agregar complejidad prematura.

## What Changes

- Crear dos proyectos independientes: una aplicación web en Next.js y una API en NestJS.
- Incorporar registro, inicio de sesión y acceso protegido mediante JWT.
- Permitir gestionar clientes y un catálogo reutilizable de productos y servicios.
- Permitir crear, editar, consultar y listar presupuestos con ítems personalizados o provenientes del catálogo.
- Calcular de forma consistente subtotal, descuento, impuestos y total en el backend.
- Gestionar el ciclo de estados borrador, enviado, aprobado y rechazado.
- Generar y descargar una versión PDF profesional de cada presupuesto.
- Mostrar un dashboard básico con indicadores y actividad reciente.
- Usar Prisma con SQLite para el MVP, manteniendo compatibilidad razonable con una futura migración a PostgreSQL.
- Entregar una interfaz responsive con Tailwind CSS y shadcn/ui, enfocada en claridad y rapidez de uso.

## Capabilities

### New Capabilities

- `user-authentication`: Registro, inicio de sesión, sesión JWT y aislamiento de los datos por usuario.
- `customer-management`: Alta, edición, consulta, listado y desactivación de clientes.
- `catalog-management`: Gestión de productos y servicios reutilizables con precio e impuestos predeterminados.
- `quote-management`: Creación, edición, listado, detalle, numeración y ciclo de estados de presupuestos e ítems.
- `quote-calculation`: Reglas autoritativas para cantidades, precios, descuentos, impuestos, redondeo y totales.
- `quote-pdf-export`: Generación y descarga de presupuestos en PDF con los datos vigentes.
- `business-dashboard`: Resumen básico de presupuestos, importes por estado y actividad reciente.

### Modified Capabilities

No existen capacidades previas que deban modificarse.

## Impact

- Se crearán `frontend/` y `backend/` como proyectos TypeScript independientes, con configuración y dependencias propias.
- La API REST será el contrato entre ambos proyectos y contendrá las reglas de negocio y autorización.
- Se incorporarán Next.js, React, Tailwind CSS, shadcn/ui, NestJS, Prisma, SQLite, JWT y una biblioteca de generación de PDF.
- Se definirá un esquema inicial de datos con usuarios, clientes, productos/servicios, presupuestos e ítems.
- El MVP será una aplicación para un único propietario por cuenta; colaboración, pagos, envíos automáticos e integraciones externas quedan fuera de alcance.
