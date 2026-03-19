import { expect, test } from "@playwright/test"
async function createConfirmationUrl(page: import("@playwright/test").Page) {
  await page.goto("/productos")
  await page.locator('a[href^="/producto/"]').first().click()
  await page.locator("aside input[type='number']").first().fill("50")
  await page.getByRole("button", { name: "Agregar" }).first().click()
  await page.locator("aside a[href='/carrito']").first().click()
  await expect(page.getByRole("button", { name: "Continuar al checkout" })).toBeEnabled()
  await page.locator('a[href="/checkout"]').click()

  await page.getByLabel("Nombre y apellido").fill("Cliente QA Confirmacion")
  await page.getByLabel("Telefono de contacto").fill("+5491112345678")
  await page.getByLabel("Email (opcional)").fill("confirmacion.qa@soloaderezos.com")
  await page.getByRole("button", { name: "Confirmar pedido" }).click()

  await expect(page).toHaveURL(/\/checkout\/confirmacion\/[^?]+\?token=/)
  return page.url()
}

test.describe("Confirmacion protegida por token", () => {
  test("devuelve 404 si falta token", async ({ page }) => {
    const confirmationUrl = await createConfirmationUrl(page)
    const parsed = new URL(confirmationUrl)
    const orderId = parsed.pathname.split("/").pop()
    expect(orderId).toBeTruthy()

    const response = await page.request.get(`/checkout/confirmacion/${orderId}`)
    expect(response.status()).toBe(404)
  })

  test("devuelve 404 si token es invalido", async ({ page }) => {
    const confirmationUrl = await createConfirmationUrl(page)
    const parsed = new URL(confirmationUrl)
    const orderId = parsed.pathname.split("/").pop()
    expect(orderId).toBeTruthy()

    const response = await page.request.get(
      `/checkout/confirmacion/${orderId}?token=token-invalido`,
    )
    expect(response.status()).toBe(404)
  })

  test("permite acceso con id + token validos", async ({ page }) => {
    const confirmationUrl = await createConfirmationUrl(page)
    const response = await page.request.get(confirmationUrl)
    expect(response.status()).toBe(200)

    await page.goto(confirmationUrl)
    await expect(page.getByText("Pedido recibido")).toBeVisible()
  })
})
