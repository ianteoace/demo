type PropertyFeaturesProps = {
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  areaM2: number | null
  garage: boolean
  className?: string
}

function Feature({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm">
      <p className="text-zinc-500">{label}</p>
      <p className="font-medium text-zinc-900">{value}</p>
    </div>
  )
}

export default function PropertyFeatures({
  rooms,
  bedrooms,
  bathrooms,
  areaM2,
  garage,
  className,
}: PropertyFeaturesProps) {
  return (
    <div className={`grid grid-cols-2 gap-2 md:grid-cols-3 ${className ?? ""}`.trim()}>
      <Feature
        label="Ambientes"
        value={rooms !== null ? String(rooms) : "No informado"}
      />
      <Feature
        label="Dormitorios"
        value={bedrooms !== null ? String(bedrooms) : "No informado"}
      />
      <Feature
        label="Baños"
        value={bathrooms !== null ? String(bathrooms) : "No informado"}
      />
      <Feature
        label="Superficie"
        value={areaM2 !== null ? `${areaM2.toLocaleString("es-AR")} m²` : "No informada"}
      />
      <Feature
        label="Cochera"
        value={garage ? "Sí" : "No"}
      />
    </div>
  )
}
