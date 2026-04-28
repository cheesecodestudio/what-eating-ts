# PRD - What Eating TS

## 1. Resumen ejecutivo
What Eating TS es una aplicacion web para planificar comidas en casa a partir de ingredientes disponibles. El producto actual permite administrar ingredientes y platos, y calcular automaticamente si un plato se puede preparar segun inventario (`CanMake`).

El objetivo de producto es evolucionar de un CRUD operativo a un planificador semanal/mensual con lista de compras y metas nutricionales.

## 2. Problema
Usuarios que cocinan en casa suelen tener tres fricciones:
1. No saber que cocinar con lo que ya tienen.
2. Falta de organizacion para planificar comidas por periodos.
3. No contar con una lista de compras derivada de un plan real.

## 3. Objetivos
### 3.1 Objetivos de negocio
1. Reducir desperdicio de alimentos al priorizar platos posibles con inventario existente.
2. Aumentar recurrencia de uso semanal con flujos de planificacion.
3. Crear base para futuras capacidades premium (metas nutricionales, recomendaciones, automatizaciones).

### 3.2 Objetivos de usuario
1. Registrar ingredientes y su disponibilidad rapidamente.
2. Definir platos y sus ingredientes con porciones.
3. Saber de inmediato que platos puede preparar hoy.
4. Evolucionar hacia plan diario/semanal y lista de compras.

## 4. Alcance del producto
### 4.1 En alcance (estado implementado)
1. Gestion de ingredientes (crear, editar, eliminar, buscar, ordenar, paginar).
2. Gestion de platos (crear, editar, eliminar, buscar, ordenar, paginar).
3. Asociacion plato-ingredientes con servings por ingrediente.
4. Calculo backend de `CanMake` segun stock de ingredientes.
5. Clasificacion de ingredientes por grupos alimenticios (primario y secundario).
6. Unidad de medida y porcion por ingrediente (g, ml, unidad, taza).
7. UI para seleccionar ingrediente con busqueda rapida y modal de servings.
8. Estructura de navegacion para modulos futuros (daily menus, weekly plans, monthly plan, shopping list, nutrition goals), actualmente en modo Coming Soon.

### 4.2 Fuera de alcance actual (pendiente)
1. Persistencia/uso real de ruleta en interfaz principal.
2. Gestion de planes diarios, semanales y mensuales.
3. Generacion automatica de lista de compras.
4. Metas nutricionales y calculo de macros/calorias.
5. Autenticacion/autorizacion por usuario.
6. Multi-tenant/perfiles de hogar.
7. Tests automatizados unitarios/integracion/e2e.

## 5. Usuarios y roles
### 5.1 Persona principal
- Cocinero/a del hogar: administra inventario y decide comidas del dia.

### 5.2 Persona secundaria
- Miembro del hogar: consulta que se puede cocinar y que falta comprar.

## 6. Estado actual del sistema (analisis tecnico)
### 6.1 Frontend
- Stack: React 18 + TypeScript + Vite + Tailwind + React Router.
- Modulos activos: Ingredients y Dishes.
- Modulos visibles pero no implementados funcionalmente: Daily Menus, Weekly Plans, Monthly Plan, Shopping List, Nutrition Goals.

### 6.2 Backend
- Stack: Express + TypeScript + Supabase JS.
- Endpoints activos:
  - `GET/POST/PUT/DELETE /api/ingredients`
  - `GET/POST/PUT/DELETE /api/dishes`
- Existe ruta `plates` en codigo backend pero no esta montada en el servidor principal.

### 6.3 Datos
- Base en Supabase PostgreSQL.
- Tablas principales:
  - `ingredients`
  - `dishes`
  - `dish_ingredients`
- Columnas relevantes en ingredientes: `food_group`, `food_groups`, `unit_of_measure`, `portion`, `in_stock`.

## 7. Requisitos funcionales
### 7.1 Inventario de ingredientes
1. El sistema debe permitir crear ingredientes con nombre, estado de stock, grupo alimenticio, unidad y porcion.
2. El sistema debe permitir editar y eliminar ingredientes.
3. El sistema debe permitir asignar hasta dos grupos alimenticios visibles en UI (primario y secundario), persistidos como arreglo en backend.
4. El sistema debe permitir busqueda por nombre.
5. El sistema debe permitir ordenar por nombre, fecha y stock.
6. El sistema debe permitir paginar resultados.

### 7.2 Gestion de platos
1. El sistema debe permitir crear platos con nombre, tipo y lista de ingredientes con servings.
2. El sistema debe permitir editar y eliminar platos.
3. El sistema debe validar que solo ingredientes existentes se asocien al plato.
4. El sistema debe mostrar para cada plato su disponibilidad (`CanMake`) segun stock.
5. El sistema debe permitir buscar, ordenar y paginar platos.

### 7.3 Disponibilidad de preparacion
1. El backend debe calcular `CanMake` como verdadero solo si todos los ingredientes del plato estan en stock.
2. Si un plato no tiene ingredientes, `CanMake` debe ser falso.

### 7.4 Navegacion y modulos futuros
1. El sistema debe mostrar entradas de navegacion para planificacion y compras.
2. Cada modulo no implementado debe presentar estado claro de "Coming soon".

## 8. Requisitos no funcionales
1. La aplicacion debe responder en menos de 2 segundos para operaciones CRUD en entorno local estandar.
2. La interfaz debe ser usable en escritorio como minimo.
3. Las APIs deben devolver errores JSON claros con mensaje.
4. El sistema debe soportar datos UTF-8 en nombres de platos e ingredientes.
5. La arquitectura debe mantener separacion cliente-servidor y contrato tipado.

## 9. KPI y metricas de exito
1. Porcentaje de platos `CanMake=true` por semana.
2. Frecuencia de actualizacion de stock por usuario (acciones de inventario/semana).
3. Numero de platos creados por usuario activo.
4. Tiempo medio para decidir una comida (proxy: consultas de platos antes de seleccion).
5. Retencion semanal (WAU).

## 10. Riesgos y dependencias
### 10.1 Riesgos
1. Uso de `SUPABASE_SERVICE_ROLE_KEY` sin capa de autenticacion de usuario final.
2. Ausencia de tests automatizados puede introducir regresiones.
3. Modulos de roadmap visibles sin funcionalidad pueden afectar percepcion de madurez.

### 10.2 Dependencias
1. Supabase configurado con variables de entorno validas.
2. Datos semilla consistentes entre scripts y esquema activo.
3. Definicion funcional de planes (daily/weekly/monthly) antes de construir UI final.

## 11. Roadmap propuesto
### Fase 1 - Consolidacion MVP actual (1 a 2 semanas)
1. Endurecer validaciones de entrada (frontend y backend).
2. Agregar estados de loading/error visibles en UI.
3. Habilitar pruebas basicas de API y componentes criticos.

### Fase 2 - Planificacion semanal (2 a 4 semanas)
1. Implementar entidad Weekly Plan (dias, comidas, porciones).
2. Selector de platos sugeridos por disponibilidad y tipo.
3. Vista de calendario semanal editable.

### Fase 3 - Lista de compras (2 a 3 semanas)
1. Derivar faltantes desde plan semanal e inventario.
2. Agrupar por categoria/food group.
3. Permitir marcar items comprados.

### Fase 4 - Nutricion y objetivos (3 a 5 semanas)
1. Modelo nutricional basico por ingrediente/plato.
2. Objetivos diarios/semana y seguimiento.
3. Alertas de desviacion por meta.

## 12. Criterios de aceptacion del MVP actual
1. CRUD completo de ingredientes y platos funciona sin errores bloqueantes.
2. `CanMake` refleja correctamente el estado de inventario.
3. Busqueda, orden y paginacion operan en ambos modulos.
4. Asociacion de ingredientes con servings en platos se guarda y recupera correctamente.
5. Esquema SQL y API estan alineados para los campos usados por UI.

## 13. Preguntas abiertas para siguiente iteracion del PRD
1. El producto sera single-user por dispositivo o multiusuario por cuenta?
2. Se prioriza mobile-first en la siguiente fase?
3. Que reglas de negocio definen porcion/servings para lista de compras?
4. Habra recomendaciones automaticas o solo planificacion manual asistida?
5. Cual es el idioma oficial de la UI (actualmente mixto ES/EN)?
