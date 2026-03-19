import { expect, test, type Page } from "@playwright/test"

async function goToFirstProductDetail(page: Page) {
  await page.goto("/productos")
  await page.locator('a[href^="/producto/"]').first().click()
}

test.describe("Flujo principal MVP", () => {
  test("catalogo -> carrito -> checkout -> confirmacion", async ({ page }) => {
    await goToFirstProductDetail(page)

    await page.locator("aside input[type='number']").first().fill("50")
    await page.getByRole("button", { name: "Agregar" }).first().click()
    await page.locator("aside a[href='/carrito']").first().click()

    await expect(page).toHaveURL(/\/carrito$/)
    await expect(page.getByText("Unidades totales:")).toBeVisible()
    await expect(page.getByRole("button", { name: "Continuar al checkout" })).toBeEnabled()

    await page.locator('a[href="/checkout"]').click()
    await expect(page).toHaveURL(/\/checkout$/)

    await page.getByLabel("Nombre y apellido").fill("Cliente QA")
    await page.getByLabel("Telefono de contacto").fill("+5491112345678")
    await page.getByLabel("Email (opcional)").fill("qa@soloaderezos.com")
    await page.getByLabel("Empresa (opcional)").fill("SoloAderezos QA")
    await page.getByLabel("Notas adicionales (opcional)").fill("Pedido generado por test e2e")

    await page.getByRole("button", { name: "Confirmar pedido" }).click()

    await expect(page).toHaveURL(/\/checkout\/confirmacion\/[^?]+\?token=/)
    await expect(page.getByText("Pedido recibido")).toBeVisible()
  })

  test("impide avanzar a checkout con menos de 50 unidades", async ({ page }) => {
    await goToFirstProductDetail(page)

    await page.locator("aside input[type='number']").first().fill("10")
    await page.getByRole("button", { name: "Agregar" }).first().click()
    await page.locator("aside a[href='/carrito']").first().click()

    await expect(page).toHaveURL(/\/carrito$/)
    await expect(page.getByRole("button", { name: "Continuar al checkout" })).toBeDisabled()
  })

  test("checkout muestra estado vacio si carrito esta vacio", async ({ page }) => {
    await page.goto("/checkout")
    await expect(page.getByText("No hay items en el carrito para confirmar.")).toBeVisible()
  })
})
