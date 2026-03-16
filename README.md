# Inmobiliaria SaaS

Aplicacion inmobiliaria single-tenant con Next.js App Router, Prisma, NextAuth y Cloudinary.

## Desarrollo local

1. Copia `.env.local.example` a `.env.local` y completa valores.
2. Instala dependencias.
3. Ejecuta migraciones.
4. Opcional: carga datos demo.
5. Levanta la app.

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

## Variables de entorno

```env
DATABASE_URL=postgresql://...                 # Neon/PostgreSQL
NEXTAUTH_SECRET=<minimo-32-caracteres>       # secreto JWT
NEXTAUTH_URL=https://tu-dominio.com
APP_URL=https://tu-dominio.com               # base URL para metadata/enlaces absolutos

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

NEXT_PUBLIC_BUSINESS_EMAIL=contacto@inmobiliaria.com
NEXT_PUBLIC_BUSINESS_PHONE=+54 9 351 555 0000
NEXT_PUBLIC_WHATSAPP_NUMBER=5493515550000
```

## Deploy en Vercel

1. Conecta el repositorio en Vercel.
2. Configura todas las variables de entorno (Production y Preview).
3. Verifica que `DATABASE_URL` apunte a Neon productiva.
4. Configura `APP_URL` y `NEXTAUTH_URL` con tu dominio real.
5. Deploy.
6. Ejecuta migraciones en produccion:

```bash
npx prisma migrate deploy
```

7. Carga demo data desde dashboard o con:

```bash
npm run seed
```

## Credenciales demo

El seed demo deja un admin consistente:

- Email: `admin@inmo.com`
- Password: `123456`

## Checklist pre-demo

- Home publica (`/`) funciona.
- Listado (`/propiedades`) funciona.
- Detalle (`/propiedad/[id]`) funciona y carga imagenes.
- Boton WhatsApp funciona.
- Login admin (`/login`) funciona.
- Dashboard (`/dashboard`) funciona.
- Usuarios autorizados y activacion (`/dashboard/users`, `/activar-acceso`) funcionan.
