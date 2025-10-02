# Guía de Pruebas Automatizadas (90% Coverage)

Este documento define el plan, la arquitectura y los criterios para implementar pruebas automatizadas con un objetivo de cobertura ≥ 90% sin afectar el funcionamiento del proyecto.

## Objetivos
- Cobertura global ≥ 90% (branches, lines, functions, statements).
- Pruebas con buena arquitectura (AAA, FIRST, DAMP, BICEP, Trophy/Pyramid, BDD Given-When-Then cuando aplique).
- Uso correcto de dobles de prueba (Dummy, Fake, Stub, Mock, Spy) y de Mocks en front/back.
- Mantener el sistema estable: no modificar lógica de negocio para “hacer pasar” pruebas.

## Herramientas
- Backend: Jest + Supertest.
- Frontend: React Testing Library + Jest DOM + User Event. (MSW para mocks de red)
- Reporte de coverage: `lcov` (consumido por SonarCloud).

Comandos (ya configurados en `package.json`):
```bash
# Backend + cobertura (config actual)
npm run test:coverage

# SonarCloud (requiere que el coverage exista antes)
npm run sonar
```

## Principios y Patrones
- AAA (Arrange, Act, Assert): estructura obligatoria por test.
- FIRST: Fast, Isolated, Repeatable, Self‑validating, Timely/Thorough.
- DAMP: descripciones explícitas y legibles.
- BICEP: límites, relaciones inversas, cross-check, errores, performance (cuando aplique).
- Trophy/Pyramid: mayoría unitarias + una capa media de integración; E2E mínimos (opcional fuera de alcance inicial).
- BDD (Given-When-Then) para escenarios de negocio relevantes (checkout/reservas).

## Estructura de carpetas (propuesta)
```
backend/
  __tests__/
    auth/
    vendor/
    user/
    booking/
client/src/
  __tests__/
    pages/
    components/
    redux/
```

## Alcance de Cobertura (mapa)

### Backend (prioridad)
- controllers/authController.js
  - signIn (feliz y credenciales inválidas)
  - google / vendorSignin (escenarios felices + errores)
- controllers/userControllers/userBookingController.js
  - BookCar (validación y persistencia)
  - getVehiclesWithoutBooking (rango válido/ inválido)
  - findBookingsOfUser / latestbookings
- controllers/vendorControllers/vendorCrudController.js
  - showVendorVehicles (con y sin resultados)
- controllers/vendorControllers/vendorBookingsController.js
  - vendorBookings (con `vendorVehicles` y sin)
- services/checkAvailableVehicle.js (fechas y estados)
- utils/error.js y utils/verifyUser.js (rutas protegidas con token)

Dobles sugeridos:
- Stub/Mock de Mongoose (modelos) para aislar controladores.
- Supertest para validar rutas montadas en Express en tests de integración.

### Frontend (prioridad media)
- pages/user/CheckoutPage.jsx: flujo de éxito, validaciones, render de resumen.
- pages/vendor/pages (Dashboard/Bookings): render y llamadas fetch mockeadas (MSW).
- redux slices críticos: reducers puros (sortfilterSlice, selectRideSlice).
- components reutilizables (modales, tablas) con pruebas de accesibilidad básica (roles/labels).

Dobles sugeridos:
- MSW para API.
- Mocks de `globalThis.fetch` si procede.

## Criterios de Aceptación de las Pruebas
- Cada prueba debe:
  - Seguir AAA explícito en el cuerpo del test.
  - Nombrado DAMP: qué, cuándo, con qué condición.
  - No depender del orden de ejecución.
  - Dejar el entorno limpio (reset/clear mocks entre casos).
- Cobertura:
  - Meta 90% global. Archivos generados (índices, entradas de Vite, etc.) pueden excluirse.

## Política de Mocks y Dobles
- No mockear aquello que sea parte del “contrato” que queremos verificar.
- Backend: mock de Mongoose/DB por default; integración con Supertest cuando validemos middleware/rutas.
- Frontend: mock de red (MSW) y utilidades (e.g., `globalThis.Razorpay`).

## Reporte de Cobertura en CI
- El job de tests debe ejecutarse ANTES del análisis de Sonar.
- SonarCloud leerá `coverage/lcov.info` (ajustado en `sonar-project.properties`).

## Plan de Ejecución (iterativo)
1) Backend – lote 1 (autenticación + vendor vehicles)
2) Backend – lote 2 (booking + disponibilidad)
3) Frontend – lote 1 (Checkout + VendorDashboard)
4) Frontend – lote 2 (Redux + componentes UI)
5) Ajuste fino hasta ≥ 90% global

## Plantilla de Test (AAA)
```js
// Arrange
const req = { body: {/* datos */} };
const res = mockResponse();
const next = jest.fn();

// Act
await signIn(req, res, next);

// Assert
expect(res.status).toHaveBeenCalledWith(200);
```

## Reglas de Estilo
- Nombres significativos y descripciones claras.
- Sin lógica en `beforeAll` que afecte independencia.
- Evitar flakes: no depender de tiempo real ni procesos externos.

## Notas
- Este README es el contrato de pruebas. Los directorios y archivos de test se irán creando por lotes siguiendo este plan hasta alcanzar el 90%.
- No se altera funcionalidad para “forzar” coverage; se prioriza calidad y estabilidad.


