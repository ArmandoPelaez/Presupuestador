## Purpose

Define el tablero privado que resume la actividad comercial del propietario autenticado.

## Requirements

### Requirement: Resumen del negocio
El sistema SHALL mostrar al usuario autenticado cantidades de presupuestos por estado e importes agregados relevantes para una lectura rapida.

#### Scenario: Dashboard con actividad
- **WHEN** el usuario abre el dashboard y posee presupuestos
- **THEN** el sistema muestra metricas calculadas solo con sus datos y una lista de presupuestos recientes

#### Scenario: Dashboard inicial
- **WHEN** el usuario abre el dashboard sin presupuestos
- **THEN** el sistema muestra metricas en cero y una accion clara para crear el primer presupuesto

### Requirement: Navegacion desde actividad reciente
El sistema SHALL permitir abrir el detalle de un presupuesto reciente desde el dashboard.

#### Scenario: Abrir presupuesto reciente
- **WHEN** el usuario selecciona un presupuesto de la actividad reciente
- **THEN** la interfaz navega al detalle del presupuesto seleccionado
