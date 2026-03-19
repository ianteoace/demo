import bcrypt from "bcryptjs"
import type {
  Currency,
  InquiryStatus,
  OperationType,
  PrismaClient,
  PropertyType,
} from "@prisma/client"

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

type DemoCategorySeed = {
  slug: string
  name: string
  description?: string
  sortOrder: number
  isActive: boolean
}

type DemoProductSeed = {
  slug: string
  name: string
  shortDescription: string
  description: string
  brand: string
  presentation: string
  categorySlug: string
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
  images: Array<{
    url: string
    alt?: string
  }>
}

type DemoInquirySeed = {
  productSlug?: string
  name: string
  company?: string
  phone: string
  email?: string
  message: string
  status?: InquiryStatus
}

export type SeedDemoDataSummary = {
  propertiesProcessed: number
  imagesProcessed: number
  leadsCreated: number
  categoriesProcessed: number
  productsProcessed: number
  productImagesProcessed: number
  inquiriesCreated: number
  adminSeeded: boolean
}

export type SeedDemoDataResult = SeedDemoDataSummary

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
      { category: "superficie", key: "cubierta", value: "78 m2" },
      { category: "instalaciones", key: "expensas", value: "AR$ 95.000" },
      { category: "servicios", key: "gas", value: "Gas natural" },
      { category: "caracteristicas", key: "balcon", value: "Si" },
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
      { category: "superficie", key: "lote", value: "240 m2" },
      { category: "caracteristicas", key: "jardin", value: "Si" },
      { category: "caracteristicas", key: "patio", value: "Si" },
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
      { category: "superficie", key: "cubierta", value: "52 m2" },
      { category: "instalaciones", key: "tipo_piso", value: "Porcelanato" },
      { category: "servicios", key: "internet", value: "Fibra optica" },
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
      { category: "superficie", key: "cubierta", value: "132 m2" },
      { category: "caracteristicas", key: "patio", value: "Si" },
      { category: "caracteristicas", key: "cochera", value: "Si" },
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
      { category: "superficie", key: "cubierta", value: "43 m2" },
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

const DEMO_CATEGORIES: DemoCategorySeed[] = [
  {
    slug: "mayonesa",
    name: "Mayonesas",
    description: "Mayonesas clasicas y livianas para uso gastronomico intensivo.",
    sortOrder: 1,
    isActive: true,
  },
  {
    slug: "ketchup",
    name: "Ketchups",
    description: "Ketchups para alto consumo y salida rapida en cocina.",
    sortOrder: 2,
    isActive: true,
  },
  {
    slug: "mostaza",
    name: "Mostazas",
    description: "Mostazas clasicas y premium para cartas de hamburgueseria.",
    sortOrder: 3,
    isActive: true,
  },
  {
    slug: "salsas-especiales",
    name: "Salsas especiales",
    description: "Linea especial para rotiserias, food trucks y cocinas profesionales.",
    sortOrder: 4,
    isActive: true,
  },
]

const DEMO_PRODUCTS: DemoProductSeed[] = [
  {
    slug: "mayonesa-clasica-doypack-1kg",
    name: "Mayonesa Natura Clasica 1kg",
    shortDescription: "Textura estable para despacho rapido y alto volumen.",
    description: "Mayonesa Natura clasica para uso gastronomico profesional, ideal para sandwicherias y rotacion diaria.",
    brand: "Natura",
    presentation: "Doypack 1kg",
    categorySlug: "mayonesa",
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
    images: [
      { url: "https://picsum.photos/seed/aderezos-producto-01/1600/1000", alt: "Mayonesa clasica 1kg" },
      { url: "https://picsum.photos/seed/aderezos-producto-02/1600/1000", alt: "Doypack mayonesa clasica" },
    ],
  },
  {
    slug: "mayonesa-liviana-doypack-1kg",
    name: "Mayonesa Natura Liviana 1kg",
    shortDescription: "Perfil mas suave para ensaladas y menus balanceados.",
    description: "Mayonesa Natura liviana para locales que buscan una opcion mas suave sin perder rendimiento.",
    brand: "Natura",
    presentation: "Doypack 1kg",
    categorySlug: "mayonesa",
    isFeatured: true,
    isActive: true,
    sortOrder: 2,
    images: [
      { url: "https://picsum.photos/seed/aderezos-producto-03/1600/1000", alt: "Mayonesa liviana 1kg" },
    ],
  },
  {
    slug: "ketchup-clasico-botella-1kg",
    name: "Ketchup Natura Clasico 1kg",
    shortDescription: "Sabor balanceado y color uniforme para despacho continuo.",
    description: "Ketchup Natura clasico para cocinas de volumen, fast food y menu ejecutivo.",
    brand: "Natura",
    presentation: "Botella 1kg",
    categorySlug: "ketchup",
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
    images: [
      { url: "https://picsum.photos/seed/aderezos-producto-04/1600/1000", alt: "Ketchup clasico 1kg" },
      { url: "https://picsum.photos/seed/aderezos-producto-05/1600/1000", alt: "Botella ketchup" },
    ],
  },
  {
    slug: "ketchup-picante-botella-1kg",
    name: "Ketchup Natura Picante 1kg",
    shortDescription: "Toque picante para burgers, wraps y menu urbano.",
    description: "Variante picante Natura para locales que buscan diferenciar su propuesta.",
    brand: "Natura",
    presentation: "Botella 1kg",
    categorySlug: "ketchup",
    isFeatured: false,
    isActive: true,
    sortOrder: 2,
    images: [{ url: "https://picsum.photos/seed/aderezos-producto-06/1600/1000", alt: "Ketchup picante 1kg" }],
  },
  {
    slug: "mostaza-clasica-sachet-500g",
    name: "Mostaza Natura Clasica 500g",
    shortDescription: "Formato practico para linea de mostrador y despacho rapido.",
    description: "Mostaza Natura clasica para pancherias, kioscos y puntos de comida rapida.",
    brand: "Natura",
    presentation: "Sachet 500g",
    categorySlug: "mostaza",
    isFeatured: false,
    isActive: true,
    sortOrder: 1,
    images: [{ url: "https://picsum.photos/seed/aderezos-producto-07/1600/1000", alt: "Mostaza clasica 500g" }],
  },
  {
    slug: "mostaza-dijon-botella-500g",
    name: "Mostaza Natura Estilo Dijon 500g",
    shortDescription: "Perfil gourmet para sandwiches premium y cocina.",
    description: "Mostaza Natura estilo dijon para preparaciones de mayor valor agregado.",
    brand: "Natura",
    presentation: "Botella 500g",
    categorySlug: "mostaza",
    isFeatured: true,
    isActive: true,
    sortOrder: 2,
    images: [{ url: "https://picsum.photos/seed/aderezos-producto-08/1600/1000", alt: "Mostaza estilo dijon 500g" }],
  },
  {
    slug: "salsa-barbacoa-doypack-1kg",
    name: "Salsa Natura Barbacoa 1kg",
    shortDescription: "Ideal para burgers, ribs y carnes al plato.",
    description: "Salsa Natura barbacoa con perfil ahumado, pensada para cocinas de alta rotacion.",
    brand: "Natura",
    presentation: "Doypack 1kg",
    categorySlug: "salsas-especiales",
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
    images: [{ url: "https://picsum.photos/seed/aderezos-producto-09/1600/1000", alt: "Salsa barbacoa 1kg" }],
  },
  {
    slug: "salsa-alioli-doypack-1kg",
    name: "Salsa Natura Alioli 1kg",
    shortDescription: "Alta rotacion en papas, sandwiches y wraps.",
    description: "Alioli Natura listo para uso en linea de despacho gastronomica.",
    brand: "Natura",
    presentation: "Doypack 1kg",
    categorySlug: "salsas-especiales",
    isFeatured: true,
    isActive: true,
    sortOrder: 2,
    images: [{ url: "https://picsum.photos/seed/aderezos-producto-10/1600/1000", alt: "Salsa alioli 1kg" }],
  },
]

const DEMO_INQUIRIES: DemoInquirySeed[] = [
  {
    productSlug: "mayonesa-clasica-doypack-1kg",
    name: "Luca Fernandez",
    company: "Hamburgueseria El Punto",
    phone: "+54 9 351 555 3011",
    email: "compras@elpunto.com",
    message: "Necesito cotizacion de Mayonesa Natura clasica por caja cerrada y entrega semanal para sucursal centro.",
    status: "NEW",
  },
  {
    productSlug: "ketchup-clasico-botella-1kg",
    name: "Mara Orellana",
    company: "Food Service Sur",
    phone: "+54 9 351 555 3012",
    email: "mara.orellana@foodservicesur.com",
    message: "Podrian enviar lista completa de linea Natura para distribucion mayorista en zona sur?",
    status: "CONTACTED",
  },
  {
    productSlug: "salsa-barbacoa-doypack-1kg",
    name: "Nicolas Paz",
    company: "Rotiseria 24hs",
    phone: "+54 9 351 555 3013",
    message: "Buscamos proveedor Natura con reposicion cada 72hs. Quedo atento a condiciones comerciales y minimo por pedido.",
    status: "NEW",
  },
  {
    name: "Candela Soto",
    company: "Almacen Mayorista Atlas",
    phone: "+54 9 351 555 3014",
    email: "compras@atlas.com",
    message: "Queremos evaluar linea completa de aderezos para reventa. Necesitamos catalogo, minimo de compra y tiempos de entrega.",
    status: "CLOSED",
  },
]

export const DEMO_PROPERTY_SLUGS = DEMO_PROPERTIES.map((property) => property.slug)
export const DEMO_PRODUCT_SLUGS = DEMO_PRODUCTS.map((product) => product.slug)

function assertDemoSeedAllowed() {
  const isProduction = process.env.NODE_ENV === "production"
  const allowProdDemoSeed = process.env.ALLOW_PROD_DEMO_SEED === "true"

  if (isProduction && !allowProdDemoSeed) {
    throw new Error(
      "[seed-demo-data] Demo seeding bloqueado en produccion. Habilitalo solo de forma temporal con ALLOW_PROD_DEMO_SEED=true.",
    )
  }
}

async function ensureDevelopmentAdminUser(prisma: PrismaClient): Promise<boolean> {
  if (process.env.NODE_ENV === "production") {
    return false
  }

  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_ADMIN_PASSWORD?.trim()
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Admin Seed"

  if (!email || !password) {
    return false
  }

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD debe tener al menos 8 caracteres.")
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: "ADMIN",
      passwordHash,
      mustSetPassword: false,
      passwordSetupToken: null,
      passwordSetupExpiresAt: null,
    },
    create: {
      email,
      name,
      role: "ADMIN",
      passwordHash,
      mustSetPassword: false,
    },
  })

  return true
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

    await prisma.propertyImage.deleteMany({
      where: { propertyId: propertyRecord.id },
    })
    await prisma.propertyFeature.deleteMany({
      where: { propertyId: propertyRecord.id },
    })
    await prisma.propertyImage.createMany({
      data: property.images.map((url, index) => ({
        propertyId: propertyRecord.id,
        url,
        isPrimary: index === 0,
      })),
    })
    await prisma.propertyFeature.createMany({
      data: property.propertyFeatures.map((feature) => ({
        propertyId: propertyRecord.id,
        category: feature.category.trim().toLowerCase(),
        key: feature.key.trim().toLowerCase(),
        value: feature.value,
      })),
    })

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

async function upsertDemoCategories(prisma: PrismaClient) {
  const categories = await Promise.all(
    DEMO_CATEGORIES.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description ?? null,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        },
        create: {
          slug: category.slug,
          name: category.name,
          description: category.description ?? null,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        },
        select: { id: true, slug: true },
      }),
    ),
  )

  return {
    categoriesProcessed: categories.length,
    categoryBySlug: new Map(categories.map((category) => [category.slug, category.id])),
  }
}

async function upsertDemoProducts(prisma: PrismaClient, categoryBySlug: Map<string, string>) {
  const products = await Promise.all(
    DEMO_PRODUCTS.map(async (product) => {
      const categoryId = categoryBySlug.get(product.categorySlug)
      if (!categoryId) {
        throw new Error(`Categoria demo no encontrada para slug: ${product.categorySlug}`)
      }

      return prisma.product.upsert({
        where: { slug: product.slug },
        update: {
          name: product.name,
          shortDescription: product.shortDescription,
          description: product.description,
          brand: product.brand,
          presentation: product.presentation,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          sortOrder: product.sortOrder,
          categoryId,
        },
        create: {
          slug: product.slug,
          name: product.name,
          shortDescription: product.shortDescription,
          description: product.description,
          brand: product.brand,
          presentation: product.presentation,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          sortOrder: product.sortOrder,
          categoryId,
        },
        select: { id: true, slug: true },
      })
    }),
  )

  let productImagesProcessed = 0

  for (const product of DEMO_PRODUCTS) {
    const productRecord = products.find((item) => item.slug === product.slug)
    if (!productRecord) continue

    await prisma.productImage.deleteMany({
      where: { productId: productRecord.id },
    })
    await prisma.productImage.createMany({
      data: product.images.map((image, index) => ({
        productId: productRecord.id,
        url: image.url,
        alt: image.alt ?? null,
        sortOrder: index,
      })),
    })

    productImagesProcessed += product.images.length
  }

  return {
    productsProcessed: products.length,
    productImagesProcessed,
    productBySlug: new Map(products.map((product) => [product.slug, product.id])),
  }
}

async function createDemoInquiries(prisma: PrismaClient, productBySlug: Map<string, string>) {
  let inquiriesCreated = 0

  for (const inquiry of DEMO_INQUIRIES) {
    const productId = inquiry.productSlug ? productBySlug.get(inquiry.productSlug) ?? null : null

    const exists = await prisma.inquiry.findFirst({
      where: {
        name: inquiry.name,
        phone: inquiry.phone,
        message: inquiry.message,
        productId,
      },
      select: { id: true },
    })

    if (exists) continue

    await prisma.inquiry.create({
      data: {
        name: inquiry.name,
        company: inquiry.company ?? null,
        phone: inquiry.phone,
        email: inquiry.email ?? null,
        message: inquiry.message,
        status: inquiry.status ?? "NEW",
        productId,
      },
    })

    inquiriesCreated += 1
  }

  return inquiriesCreated
}

export async function seedDemoData(prisma: PrismaClient): Promise<SeedDemoDataResult> {
  assertDemoSeedAllowed()
  const adminSeeded = await ensureDevelopmentAdminUser(prisma)

  // Legacy inmobiliaria seeding is intentionally disabled to keep the
  // ecommerce dataset focused on categories/products/inquiries.
  const legacyResult = {
    propertiesProcessed: 0,
    imagesProcessed: 0,
  }
  const leadsCreated = 0

  const categoriesResult = await upsertDemoCategories(prisma)
  const productsResult = await upsertDemoProducts(prisma, categoriesResult.categoryBySlug)
  const inquiriesCreated = await createDemoInquiries(prisma, productsResult.productBySlug)

  return {
    propertiesProcessed: legacyResult.propertiesProcessed,
    imagesProcessed: legacyResult.imagesProcessed,
    leadsCreated,
    categoriesProcessed: categoriesResult.categoriesProcessed,
    productsProcessed: productsResult.productsProcessed,
    productImagesProcessed: productsResult.productImagesProcessed,
    inquiriesCreated,
    adminSeeded,
  }
}
