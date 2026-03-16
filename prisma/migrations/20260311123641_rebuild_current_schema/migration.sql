/*
  Warnings:

  - You are about to drop the `ImagenPropiedad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Propiedad` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ImagenPropiedad" DROP CONSTRAINT "ImagenPropiedad_propiedadId_fkey";

-- DropIndex
DROP INDEX "Lead_propertyId_idx";

-- DropIndex
DROP INDEX "PropertyImage_propertyId_idx";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PropertyImage" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ImagenPropiedad";

-- DropTable
DROP TABLE "Propiedad";

-- DropEnum
DROP TYPE "EstadoPropiedad";

-- DropEnum
DROP TYPE "Operacion";

-- DropEnum
DROP TYPE "TipoPropiedad";

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
