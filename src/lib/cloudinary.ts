import { v2 as cloudinary } from "cloudinary"

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

const isProduction = process.env.NODE_ENV === "production"
const hasCloudName = Boolean(cloudName)
const hasApiKey = Boolean(apiKey)
const hasApiSecret = Boolean(apiSecret)
const cloudinaryConfigured = hasCloudName && hasApiKey && hasApiSecret

function maskValue(value: string | undefined) {
  if (!value) return null
  if (value.length <= 4) return "***"
  return `${value.slice(0, 2)}***${value.slice(-2)}`
}

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    "Cloudinary environment variables are missing. Uploads will fail until they are configured.",
  )
}

if (!isProduction) {
  console.info("[Cloudinary] env check", {
    configured: cloudinaryConfigured,
    cloudNameDefined: hasCloudName,
    apiKeyDefined: hasApiKey,
    apiSecretDefined: hasApiSecret,
    cloudName: maskValue(cloudName),
    apiKey: maskValue(apiKey),
  })
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

let lastPingAt = 0
let pingInFlight: Promise<void> | null = null
const PING_TTL_MS = 60_000

export function assertCloudinaryConfig() {
  if (!cloudinaryConfigured) {
    throw new Error(
      "Cloudinary no esta configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en el entorno del servidor.",
    )
  }
}

export async function verifyCloudinaryConnection() {
  assertCloudinaryConfig()

  if (Date.now() - lastPingAt < PING_TTL_MS) {
    return
  }

  if (!pingInFlight) {
    pingInFlight = cloudinary.api
      .ping()
      .then((result) => {
        if (result.status !== "ok") {
          throw new Error(`Cloudinary ping inesperado: ${result.status}`)
        }

        lastPingAt = Date.now()
        if (!isProduction) {
          console.info("[Cloudinary] ping ok")
        }
      })
      .catch((error) => {
        throw new Error(formatCloudinaryError(error, "No se pudo validar conexion con Cloudinary."))
      })
      .finally(() => {
        pingInFlight = null
      })
  }

  await pingInFlight
}

export function formatCloudinaryError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  if (normalized.includes("invalid signature")) {
    return "Cloudinary rechazo la firma (invalid signature). Verifica API_KEY/API_SECRET."
  }

  if (normalized.includes("api key")) {
    return "Cloudinary reporto problema de API key. Revisa CLOUDINARY_API_KEY."
  }

  if (normalized.includes("must supply api_key")) {
    return "Cloudinary requiere api_key. Revisa CLOUDINARY_API_KEY en el entorno del servidor."
  }

  if (normalized.includes("must supply api_secret")) {
    return "Cloudinary requiere api_secret. Revisa CLOUDINARY_API_SECRET en el entorno del servidor."
  }

  if (normalized.includes("cloud name")) {
    return "Cloudinary reporto cloud name invalido o ausente. Revisa CLOUDINARY_CLOUD_NAME."
  }

  return message || fallback
}

export { cloudinary }
