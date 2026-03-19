import Link from "next/link"
import { notFound } from "next/navigation"

import { Container, PageHeader, Section } from "@/components/ui"
import { prisma } from "@/lib/prisma"

import ImagesManager from "./images-manager"

type ProductImagesPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ProductImagesPage({
  params,
}: ProductImagesPageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <main className="py-8 md:py-10">
      <Container size="wide">
        <PageHeader
          title={`Imagenes de ${product.name}`}
          description="Sube, elimina y reordena imagenes del producto."
          actions={
            <Link
              href="/dashboard/products"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[#3a3d44] hover:text-white"
            >
              Volver a productos
            </Link>
          }
        />

        <Section compact>
          <ImagesManager
            productId={product.id}
            productName={product.name}
            initialImages={product.images.map((image) => ({
              id: image.id,
              url: image.url,
              alt: image.alt,
              sortOrder: image.sortOrder,
            }))}
          />
        </Section>
      </Container>
    </main>
  )
}
