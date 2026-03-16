import Link from "next/link"
import { notFound } from "next/navigation"

import { Container, PageHeader, Section } from "@/components/ui"
import { prisma } from "@/lib/prisma"

import ImagesManager from "./images-manager"

type PropertyImagesPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function PropertyImagesPage({
  params,
}: PropertyImagesPageProps) {
  const { id } = await params

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
    },
  })

  if (!property) {
    notFound()
  }

  return (
    <main className="py-8 md:py-10">
      <Container size="wide">
        <PageHeader
          title={`Imágenes de ${property.title}`}
          description="Sube imágenes, define portada y elimina archivos obsoletos."
          actions={
            <Link
              href="/dashboard/properties"
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
            >
              Volver a propiedades
            </Link>
          }
        />

        <Section compact>
          <ImagesManager
            propertyId={property.id}
            propertyTitle={property.title}
            initialImages={property.images.map((image) => ({
              id: image.id,
              url: image.url,
              isPrimary: image.isPrimary,
            }))}
          />
        </Section>
      </Container>
    </main>
  )
}
