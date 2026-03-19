# SoloAderezos Web

Base inicial para una distribuidora mayorista de aderezos construida sobre:

- Next.js (App Router)
- TypeScript
- Prisma + PostgreSQL
- NextAuth
- Cloudinary

## Estado actual

- Ecommerce mayorista operativo: catalogo, detalle de producto, carrito, checkout, pedido y confirmacion protegida por token.
- Dashboard admin operativo: productos, categorias, pedidos, consultas y usuarios.
- Branding y UI alineados al sistema visual de SoloAderezos.
- QA minima automatica: unit tests de checkout + e2e de flujos criticos.
- Modulos legacy de inmobiliaria retirados de rutas activas y aislados del seed.

## Desarrollo local

1. Copia `.env.local.example` a `.env.local` y completa valores.
2. Instala dependencias.
3. Ejecuta migraciones.
4. Opcional: carga datos base de desarrollo (solo entorno no productivo).
5. Levanta la app.

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

## QA minima automatica (MVP)

Herramientas:

- `Vitest` para validaciones backend de checkout (server action).
- `Playwright` para flujos e2e criticos (catalogo, carrito, checkout, confirmacion y auth).

Preparacion recomendada:

```bash
cp .env.test.example .env.test
npx prisma migrate deploy
```

Ejecucion:

```bash
npm run test:unit
npm run test:e2e
```

Todo junto:

```bash
npm test
```

Credenciales admin e2e (si no se definen, `scripts/test-env.mjs` usa valores de `.env.test`):

```env
SEED_ADMIN_EMAIL=admin@soloaderezos.test
SEED_ADMIN_PASSWORD=TestAdmin123!
SEED_ADMIN_NAME=Admin Seed
E2E_ADMIN_EMAIL=admin@soloaderezos.test
E2E_ADMIN_PASSWORD=TestAdmin123!
```

## Variables de entorno

```env
SOLOADEREZOS_DATABASE_URL=postgresql://.../soloaderezos_prod_db
# DATABASE_URL solo fallback para desarrollo/compatibilidad (no se usa en production)
DATABASE_URL=postgresql://...

NEXTAUTH_SECRET=<minimo-32-caracteres>
AUTH_SECRET=<igual-a-nextauth-secret>
NEXTAUTH_URL=https://tu-dominio.com
APP_URL=https://tu-dominio.com

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

ENABLE_INITIAL_ADMIN_BOOTSTRAP=false
INITIAL_ADMIN_BOOTSTRAP_TOKEN=<token-unico-temporal>
ALLOW_PROD_DEMO_SEED=false

NEXT_PUBLIC_BUSINESS_EMAIL=comercial@soloaderezos.com
NEXT_PUBLIC_BUSINESS_PHONE=+54 9 351 555 0000
NEXT_PUBLIC_WHATSAPP_NUMBER=5493515550000

# Opcional, solo para seed de desarrollo/tests (ignorado en production)
SEED_ADMIN_EMAIL=admin@soloaderezos.test
SEED_ADMIN_PASSWORD=TestAdmin123!
SEED_ADMIN_NAME=Admin Seed
```

Recomendacion de aislamiento:
- Usa `SOLOADEREZOS_DATABASE_URL` para apuntar a una DB/schema exclusiva de este proyecto.
- En `production`, `SOLOADEREZOS_DATABASE_URL` es obligatorio y el fallback a `DATABASE_URL` queda deshabilitado.
- En `production`, `APP_URL` y `PRIMARY_ADMIN_EMAIL` son obligatorios.
- En `production`, `NEXTAUTH_SECRET`/`AUTH_SECRET` deben ser fuertes (>=32) y consistentes.

Bootstrap inicial seguro:
- `/register` y `/api/register` estan cerrados en `production` por defecto.
- Para bootstrap temporal en `production`, habilita `ENABLE_INITIAL_ADMIN_BOOTSTRAP=true` y define `INITIAL_ADMIN_BOOTSTRAP_TOKEN`.
- Usa `/register?bootstrapToken=<token>` o header `x-bootstrap-token` para `POST /api/register`, y vuelve a desactivar al finalizar.

Seed demo seguro:
- En `production`, `npm run seed` falla por defecto.
- Solo se habilita temporalmente si defines `ALLOW_PROD_DEMO_SEED=true` para esa ejecucion puntual.

Variables de test:
- Crea `.env.test` a partir de `.env.test.example`.
- `TEST_DATABASE_URL` debe apuntar a una DB de test dedicada.

## Proximas etapas sugeridas

- Hardening de seguridad y monitoreo operativo.
- Cobertura de tests para admin (productos/categorias/pedidos) y edge-cases UX.
- Refactor incremental de deuda tecnica remanente en dominio legacy a nivel Prisma, si se decide.
