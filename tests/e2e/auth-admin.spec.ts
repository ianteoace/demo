import { expect, test } from "@playwright/test"

const adminEmail = process.env.E2E_ADMIN_EMAIL
const adminPassword = process.env.E2E_ADMIN_PASSWORD

test.beforeAll(() => {
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Missing E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD for auth-admin.spec.ts",
    )
  }
})

test.describe("Auth admin", () => {
  test("redirige a login cuando dashboard no tiene sesion", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })

  test("muestra error con login invalido", async ({ page }) => {
    await page.goto("/login")

    await page.getByLabel("Email").fill("usuario-invalido@soloaderezos.com")
    await page.getByLabel("Contrasena").fill("clave-invalida")
    await page.getByRole("button", { name: "Entrar al dashboard" }).click()

    await expect(page.getByText("Email o contrasena incorrectos.")).toBeVisible()
  })

  test("permite login valido y acceso a dashboard", async ({ page }) => {
    await page.goto("/login")

    await page.getByLabel("Email").fill(adminEmail!)
    await page.getByLabel("Contrasena").fill(adminPassword!)
    await page.getByRole("button", { name: "Entrar al dashboard" }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByText("Panel de administracion")).toBeVisible()
  })
})
