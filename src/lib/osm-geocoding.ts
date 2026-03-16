import { getAppUrl } from "@/lib/app-url"

export type GeocodedCoordinates = {
  lat: number
  lon: number
}

export async function geocodeAddressWithOsm(
  addressLine: string,
): Promise<GeocodedCoordinates | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 1200)

  try {
    const params = new URLSearchParams({
      q: addressLine,
      format: "jsonv2",
      limit: "1",
    })

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": `inmobiliaria-saas/1.0 (+${getAppUrl()})`,
      },
      next: {
        revalidate: 60 * 60 * 24,
      },
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as Array<{ lat: string; lon: string }>
    const first = payload[0]
    if (!first) return null

    const lat = Number(first.lat)
    const lon = Number(first.lon)

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return null
    }

    return { lat, lon }
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

export function buildOpenStreetMapEmbedUrl(coordinates: GeocodedCoordinates): string {
  const delta = 0.006
  const left = coordinates.lon - delta
  const right = coordinates.lon + delta
  const top = coordinates.lat + delta
  const bottom = coordinates.lat - delta

  const bbox = `${left},${bottom},${right},${top}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lon}`
}
