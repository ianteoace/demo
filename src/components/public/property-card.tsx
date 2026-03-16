import Link from "next/link"
import { Currency, OperationType, PropertyType } from "@prisma/client"

import StatusBadge from "@/components/public/status-badge"
import { Card } from "@/components/ui"
import { getOperationTypeLabel } from "@/lib/property-operation-type"
import { formatPropertyPrice } from "@/lib/property-price"
import { getPropertyFeatureSummary } from "@/lib/property-features"
import { getPropertyTypeLabel } from "@/lib/property-type"

type PropertyCardProps = {
  property: {
    id: string
    slug: string
    title: string
    city: string
    address: string
    price: number
    currency: Currency
    propertyType: PropertyType
    operationType: OperationType
    featured: boolean
    rooms: number | null
    bedrooms: number | null
    bathrooms: number | null
    areaM2: number | null
    garage: boolean
    images: Array<{
      url: string
    }>
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images[0]?.url
  const featureSummary = getPropertyFeatureSummary({
    rooms: property.rooms,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaM2: property.areaM2,
    garage: property.garage,
  }).slice(0, 4)

  return (
    <Card className="group overflow-hidden shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        {mainImage ? (
          <img
            src={mainImage}
            alt={property.title}
            className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid h-56 place-items-center bg-zinc-100 text-zinc-500">Sin imagen</div>
        )}
        {property.featured ? (
          <div className="absolute left-3 top-3">
            <StatusBadge tone="featured">Destacada</StatusBadge>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-5 md:p-6">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-zinc-950">
            {formatPropertyPrice(property.price, property.currency)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge>{getPropertyTypeLabel(property.propertyType)}</StatusBadge>
            <StatusBadge>{getOperationTypeLabel(property.operationType)}</StatusBadge>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-zinc-900">{property.title}</h3>
          <p className="mt-1 text-sm text-zinc-600">
            {property.city} · {property.address}
          </p>
        </div>

        {featureSummary.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {featureSummary.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"
              >
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          href={`/propiedad/${property.slug || property.id}`}
          className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Ver detalle
        </Link>
      </div>
    </Card>
  )
}
