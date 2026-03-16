import bcrypt from "bcryptjs"
import type { Currency, OperationType, PrismaClient, PropertyType } from "@prisma/client"

type DemoPropertySeed = {
  slug: string
  title: string
  description: string
  price: number
  currency: Currency
  propertyType: PropertyType
  operationType: OperationType
  city: string
  address: string
  rooms: number | null
  bedrooms: number
  bathrooms: number
  areaM2: number
  garage: boolean
  propertyFeatures: Array<{
    category: string
    key: string
    value: string
  }>
  featured: boolean
  images: string[]
}

type DemoLeadSeed = {
  propertySlug: string
  name: string
  email: string
  message: string
}

export type SeedDemoDataSummary = {
  propertiesProcessed: number
  imagesProcessed: number
  leadsCreated: number
  adminCreated: boolean
}

export type SeedDemoDataResult = SeedDemoDataSummary

const DEMO_ADMIN = {
  email: "admin@inmo.com",
  password: "123456",
  name: "Admin Demo",
}

const DEMO_PROPERTIES: DemoPropertySeed[] = [
  {
    slug: "departamento-premium-nueva-cordoba",
    title: "Departamento premium 2 dormitorios en Nueva Cordoba",
    description:
      "Unidad moderna con balcon corrido, excelente luminosidad y amenities. Ideal para vivienda o inversion en una de las zonas con mayor demanda.",
    price: 145000,
    currency: "USD",
    propertyType: "APARTMENT",
    operationType: "SALE",
    city: "Cordoba",
    address: "Obispo Trejo 1120",
    rooms: 3,
    bedrooms: 2,
    bathrooms: 2,
    areaM2: 86,
    garage: true,
    propertyFeatures: [
      { category: "datos_basicos", key: "estado", value: "Excelente" },
      { category: "superficie", key: "cubierta", value: "78 m²" },
      { category: "instalaciones", key: "expensas", value: "AR$ 95.000" },
      { category: "servicios", key: "gas", value: "Gas natural" },
      { category: "caracteristicas", key: "balcon", value: "Sí" },
    ],
    featured: true,
    images: [
      "https://picsum.photos/seed/inmo-demo-01/1600/1000",
      "https://picsum.photos/seed/inmo-demo-02/1600/1000",
      "https://picsum.photos/seed/inmo-demo-03/1600/1000",
    ],
  },
  {
    slug: "casa-familiar-jardin-ruta-20",
    title: "Casa familiar 3 dormitorios con jardin en zona Ruta 20",
    description:
      "Propiedad desarrollada en una planta, con patio verde, quincho y cochera doble. Excelente alternativa para familias que priorizan espacio y conectividad.",
    price: 178000,
    currency: "USD",
    propertyType: "HOUSE",
    operationType: "BOTH",
    city: "Cordoba",
    address: "Av. Fuerza Aerea 4580",
    rooms: 5,
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 168,
    garage: true,
    propertyFeatures: [
      { category: "datos_basicos", key: "estado", value: "Muy bueno" },
      { category: "superficie", key: "lote", value: "240 m²" },
      { category: "caracteristicas", key: "jardin", value: "Sí" },
      { category: "caracteristicas", key: "patio", value: "Sí" },
      { category: "servicios", key: "agua", value: "Red" },
    ],
    featured: false,
    images: [
      "https://picsum.photos/seed/inmo-demo-04/1600/1000",
      "https://picsum.photos/seed/inmo-demo-05/1600/1000",
      "https://picsum.photos/seed/inmo-demo-06/1600/1000",
    ],
  },
  {
    slug: "ph-reciclado-guemes-inversion",
    title: "PH reciclado en Guemes con perfil inversor",
    description:
      "Unidad reciclada con cocina integrada y patio interno. Ubicacion estrategica para alquiler temporal por cercania a polos gastronomicos y universitarios.",
    price: 680000,
    currency: "ARS",
    propertyType: "PH",
    operationType: "RENT",
    city: "Cordoba",
    address: "Belgrano 980",
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    areaM2: 58,
    garage: false,
    propertyFeatures: [
      { category: "datos_basicos", key: "estado", value: "Reciclado" },
      { category: "superficie", key: "cubierta", value: "52 m²" },
      { category: "instalaciones", key: "tipo_piso", value: "Porcelanato" },
      { category: "servicios", key: "internet", value: "Fibra óptica" },
    ],
    featured: true,
    images: [
      "https://picsum.photos/seed/inmo-demo-07/1600/1000",
      "https://picsum.photos/seed/inmo-demo-08/1600/1000",
      "https://picsum.photos/seed/inmo-demo-09/1600/1000",
    ],
  },
  {
    slug: "duplex-estrenar-zona-sur",
    title: "Duplex a estrenar 3 dormitorios en zona sur",
    description:
      "Unidad a estrenar en barrio residencial consolidado, con patio, cochera y excelente conectividad. Ideal para primera vivienda o mejora de categoria.",
    price: 212000,
    currency: "USD",
    propertyType: "HOUSE",
    operationType: "SALE",
    city: "Cordoba",
    address: "Av. Valparaiso 7200",
    rooms: 5,
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 174,
    garage: true,
    propertyFeatures: [
      { category: "datos_basicos", key: "estado", value: "A estrenar" },
      { category: "superficie", key: "cubierta", value: "132 m²" },
      { category: "caracteristicas", key: "patio", value: "Sí" },
      { category: "caracteristicas", key: "cochera", value: "Sí" },
      { category: "servicios", key: "gas", value: "Gas natural" },
    ],
    featured: false,
    images: [
      "https://picsum.photos/seed/inmo-demo-10/1600/1000",
      "https://picsum.photos/seed/inmo-demo-11/1600/1000",
      "https://picsum.photos/seed/inmo-demo-12/1600/1000",
    ],
  },
  {
    slug: "departamento-barrio-general-paz",
    title: "Departamento 1 dormitorio en Barrio General Paz",
    description:
      "Unidad funcional con balcon y excelente iluminacion natural, ubicada en un corredor con alta demanda de alquiler permanente.",
    price: 82000,
    currency: "USD",
    propertyType: "APARTMENT",
    operationType: "SALE",
    city: "Cordoba",
    address: "25 de Mayo 1640",
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    areaM2: 47,
    garage: false,
    propertyFeatures: [
      { category: "datos_basicos", key: "estado", value: "Muy bueno" },
      { category: "superficie", key: "cubierta", value: "43 m²" },
      { category: "instalaciones", key: "climatizacion", value: "Aire frio/calor" },
      { category: "caracteristicas", key: "balcon", value: "Si" },
      { category: "servicios", key: "agua", value: "Red" },
    ],
    featured: false,
    images: [
      "https://picsum.photos/seed/inmo-demo-13/1600/1000",
      "https://picsum.photos/seed/inmo-demo-14/1600/1000",
      "https://picsum.photos/seed/inmo-demo-15/1600/1000",
    ],
  },
]

const DEMO_LEADS: DemoLeadSeed[] = [
  {
    propertySlug: "departamento-premium-nueva-cordoba",
    name: "Valentina Sosa",
    email: "valentina.sosa.demo@gmail.com",
    message:
      "Me interesa coordinar una visita para esta semana. Tambien quisiera validar opciones de financiacion. Telefono: +54 9 351 555 0101",
  },
  {
    propertySlug: "ph-reciclado-guemes-inversion",
    name: "Martin Pereyra",
    email: "martin.pereyra.demo@gmail.com",
    message:
      "Estoy evaluando esta unidad para renta temporal. Podrian compartir gastos mensuales aproximados y rentabilidad estimada? Telefono: +54 9 351 555 0102",
  },
  {
    propertySlug: "duplex-estrenar-zona-sur",
    name: "Carolina Ruiz",
    email: "caro.ruiz.demo@gmail.com",
    message:
      "Nos gusto la propiedad y queremos consultar disponibilidad inmediata y condiciones de reserva. Telefono: +54 9 351 555 0103",
  },
  {
    propertySlug: "casa-familiar-jardin-ruta-20",
    name: "Federico Ledesma",
    email: "fede.ledesma.demo@gmail.com",
    message:
      "Quisiera saber si aceptan permuta parcial y cuando podriamos visitarla. Telefono: +54 9 351 555 0104",
  },
]

export const DEMO_PROPERTY_SLUGS = DEMO_PROPERTIES.map((property) => property.slug)

async function ensureAdminUser(prisma: PrismaClient): Promise<boolean> {
  const existingDemoAdmin = await prisma.user.findUnique({
    where: { email: DEMO_ADMIN.email },
    select: { id: true },
  })
  const hashedPassword = await bcrypt.hash(DEMO_ADMIN.password, 10)

  await prisma.user.upsert({
    where: { email: DEMO_ADMIN.email },
    update: {
      name: DEMO_ADMIN.name,
      role: "ADMIN",
      passwordHash: hashedPassword,
      mustSetPassword: false,
    },
    create: {
      email: DEMO_ADMIN.email,
      passwordHash: hashedPassword,
      name: DEMO_ADMIN.name,
      role: "ADMIN",
      mustSetPassword: false,
    },
  })

  return !existingDemoAdmin
}

async function upsertDemoProperties(prisma: PrismaClient) {
  const properties = await Promise.all(
    DEMO_PROPERTIES.map((property) =>
      prisma.property.upsert({
        where: { slug: property.slug },
        update: {
          title: property.title,
          description: property.description,
          price: property.price,
          currency: property.currency,
          propertyType: property.propertyType,
          operationType: property.operationType,
          city: property.city,
          address: property.address,
          rooms: property.rooms,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          areaM2: property.areaM2,
          garage: property.garage,
          published: true,
          featured: property.featured,
        },
        create: {
          slug: property.slug,
          title: property.title,
          description: property.description,
          price: property.price,
          currency: property.currency,
          propertyType: property.propertyType,
          operationType: property.operationType,
          city: property.city,
          address: property.address,
          rooms: property.rooms,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          areaM2: property.areaM2,
          garage: property.garage,
          published: true,
          featured: property.featured,
        },
        select: { id: true, slug: true },
      }),
    ),
  )

  let imagesProcessed = 0

  for (const property of DEMO_PROPERTIES) {
    const propertyRecord = properties.find((item) => item.slug === property.slug)

    if (!propertyRecord) {
      continue
    }

    // Deterministic demo dataset: each demo property ends with exactly 3 images
    // and a single primary image on every execution.
    await prisma.$transaction([
      prisma.propertyImage.deleteMany({
        where: { propertyId: propertyRecord.id },
      }),
      prisma.propertyFeature.deleteMany({
        where: { propertyId: propertyRecord.id },
      }),
      prisma.propertyImage.createMany({
        data: property.images.map((url, index) => ({
          propertyId: propertyRecord.id,
          url,
          isPrimary: index === 0,
        })),
      }),
      prisma.propertyFeature.createMany({
        data: property.propertyFeatures.map((feature) => ({
          propertyId: propertyRecord.id,
          category: feature.category.trim().toLowerCase(),
          key: feature.key.trim().toLowerCase(),
          value: feature.value,
        })),
      }),
    ])

    imagesProcessed += property.images.length
  }

  return {
    properties,
    propertiesProcessed: properties.length,
    imagesProcessed,
  }
}

async function createDemoLeads(prisma: PrismaClient, propertyBySlug: Map<string, string>) {
  let leadsCreated = 0

  for (const lead of DEMO_LEADS) {
    const propertyId = propertyBySlug.get(lead.propertySlug)
    if (!propertyId) continue

    const exists = await prisma.lead.findFirst({
      where: {
        propertyId,
        name: lead.name,
        email: lead.email,
        message: lead.message,
      },
      select: { id: true },
    })

    if (exists) continue

    await prisma.lead.create({
      data: {
        propertyId,
        name: lead.name,
        email: lead.email,
        message: lead.message,
      },
    })

    leadsCreated += 1
  }

  return leadsCreated
}

export async function seedDemoData(prisma: PrismaClient): Promise<SeedDemoDataResult> {
  const adminCreated = await ensureAdminUser(prisma)

  const upsertResult = await upsertDemoProperties(prisma)
  const propertyBySlug = new Map(
    upsertResult.properties.map((property) => [property.slug, property.id]),
  )

  const leadsCreated = await createDemoLeads(prisma, propertyBySlug)

  return {
    propertiesProcessed: upsertResult.propertiesProcessed,
    imagesProcessed: upsertResult.imagesProcessed,
    leadsCreated,
    adminCreated,
  }
}

export const demoAdminCredentials = {
  email: DEMO_ADMIN.email,
  password: DEMO_ADMIN.password,
}
