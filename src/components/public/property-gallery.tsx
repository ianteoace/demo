"use client"

import { useEffect, useMemo, useState } from "react"

type PropertyGalleryImage = {
  id: string
  url: string
}

type PropertyGalleryProps = {
  images: PropertyGalleryImage[]
  title: string
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const totalImages = images.length

  const activeImage = useMemo(() => {
    return images[activeIndex]
  }, [images, activeIndex])

  function goToPreviousImage() {
    setActiveIndex((previous) => (previous - 1 + totalImages) % totalImages)
  }

  function goToNextImage() {
    setActiveIndex((previous) => (previous + 1) % totalImages)
  }

  useEffect(() => {
    if (!isLightboxOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false)
        return
      }

      if (event.key === "ArrowLeft") {
        goToPreviousImage()
        return
      }

      if (event.key === "ArrowRight") {
        goToNextImage()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isLightboxOpen, totalImages])

  useEffect(() => {
    if (!isLightboxOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isLightboxOpen])

  if (!activeImage) {
    return null
  }

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="block w-full overflow-hidden rounded-2xl border border-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          aria-label={`Ampliar imagen de ${title}`}
        >
          <img
            src={activeImage.url}
            alt={title}
            className="h-72 w-full object-cover transition duration-300 hover:scale-[1.01] sm:h-[420px]"
          />
        </button>

        {totalImages > 1 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {images.map((image, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`overflow-hidden rounded-xl border transition ${
                    isActive ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <img
                    src={image.url}
                    alt={`${title} - vista ${index + 1}`}
                    className="h-24 w-full object-cover sm:h-28"
                  />
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      {isLightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-8"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria de ${title}`}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="fixed right-4 top-4 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-lg font-semibold text-white hover:bg-black/80 md:right-6 md:top-6"
            aria-label="Cerrar galeria"
          >
            X
          </button>

          {totalImages > 1 ? (
            <>
              <button
                type="button"
                onClick={goToPreviousImage}
                className="fixed left-3 top-1/2 z-[60] inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-2xl text-white hover:bg-black/80 md:left-6"
                aria-label="Imagen anterior"
              >
                {"<"}
              </button>
              <button
                type="button"
                onClick={goToNextImage}
                className="fixed right-3 top-1/2 z-[60] inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-2xl text-white hover:bg-black/80 md:right-6"
                aria-label="Imagen siguiente"
              >
                {">"}
              </button>
            </>
          ) : null}

          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <img
              src={activeImage.url}
              alt={title}
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
