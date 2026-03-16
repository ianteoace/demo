import "dotenv/config"

import { seedDemoData, demoAdminCredentials } from "../src/lib/demo/seed-demo-data.ts"
import { prisma } from "../src/lib/prisma.ts"

async function main() {
  const summary = await seedDemoData(prisma)

  console.log(`[seed] Propiedades procesadas: ${summary.propertiesProcessed}`)
  console.log(`[seed] Imagenes procesadas: ${summary.imagesProcessed}`)
  console.log(`[seed] Leads creados: ${summary.leadsCreated}`)

  if (summary.adminCreated) {
    console.log(
      `[seed] Admin demo creado: ${demoAdminCredentials.email} / ${demoAdminCredentials.password}`,
    )
  } else {
    console.log(
      `[seed] Admin demo actualizado: ${demoAdminCredentials.email} / ${demoAdminCredentials.password}`,
    )
  }

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
