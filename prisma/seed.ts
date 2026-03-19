import "dotenv/config"

import { seedDemoData } from "../src/lib/demo/seed-demo-data.ts"
import { prisma } from "../src/lib/prisma.ts"

function assertSeedExecutionAllowed() {
  const isProduction = process.env.NODE_ENV === "production"
  const allowProdDemoSeed = process.env.ALLOW_PROD_DEMO_SEED === "true"

  if (isProduction && !allowProdDemoSeed) {
    throw new Error(
      "[seed] Demo seed bloqueado en produccion. Si necesitas ejecutarlo temporalmente, define ALLOW_PROD_DEMO_SEED=true solo para esa corrida.",
    )
  }
}

async function main() {
  assertSeedExecutionAllowed()
  const summary = await seedDemoData(prisma)

  console.log(`[seed] Legacy propiedades procesadas: ${summary.propertiesProcessed}`)
  console.log(`[seed] Legacy imagenes procesadas: ${summary.imagesProcessed}`)
  console.log(`[seed] Legacy leads creados: ${summary.leadsCreated}`)
  console.log(`[seed] Categorias procesadas: ${summary.categoriesProcessed}`)
  console.log(`[seed] Productos procesados: ${summary.productsProcessed}`)
  console.log(`[seed] Imagenes de productos procesadas: ${summary.productImagesProcessed}`)
  console.log(`[seed] Consultas creadas: ${summary.inquiriesCreated}`)
  console.log(
    `[seed] Admin de desarrollo ${
      summary.adminSeeded ? "configurado desde variables SEED_ADMIN_*." : "omitido."
    }`,
  )

  console.log("[seed] Carga demo finalizada correctamente.")
}

main()
  .catch((error) => {
    console.error("[seed] Error en la carga demo:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
