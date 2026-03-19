"use client"

import { useMemo, useState } from "react"

type ProductGalleryImage = {
  id: string
  url: string
  alt: string | null
}

type ProductGalleryProps = {
  images: ProductGalleryImage[]
  title: string
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  if (images.length === 0) return null

  const [selectedImageId, setSelectedImageId] = useState(images[0]?.id)
  const selectedImage = useMemo(
    () => images.find((image) => image.id === selectedImageId) || images[0],
    [images, selectedImageId],
  )

  return (
    <section className="grid gap-3">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <img
          src={selectedImage.url}
          alt={selectedImage.alt || title}
          className="h-[360px] w-full object-cover md:h-[480px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((image) => {
          const isActive = image.id === selectedImage.id

          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImageId(image.id)}
              className={`overflow-hidden rounded-xl border transition ${
                isActive
                  ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
                  : "border-[var(--color-border)] hover:border-[#3a3d44]"
              }`}
              aria-label={`Ver imagen ${title}`}
            >
              <img
                src={image.url}
                alt={image.alt || title}
                className="h-28 w-full object-cover md:h-36"
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
