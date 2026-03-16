/*
  Warnings:

  - You are about to drop the column `logo` on the `Inmobiliaria` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Inmobiliaria` table. All the data in the column will be lost.
  - You are about to drop the column `ciudad` on the `Propiedad` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `Propiedad` table. All the data in the column will be lost.
  - You are about to drop the column `operacion` on the `Propiedad` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Propiedad` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Propiedad` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Propiedad_slug_key";

-- AlterTable
ALTER TABLE "Inmobiliaria" DROP COLUMN "logo",
DROP COLUMN "plan";

-- AlterTable
ALTER TABLE "Propiedad" DROP COLUMN "ciudad",
DROP COLUMN "estado",
DROP COLUMN "operacion",
DROP COLUMN "slug",
DROP COLUMN "tipo",
ALTER COLUMN "descripcion" DROP NOT NULL,
ALTER COLUMN "precio" SET DATA TYPE DOUBLE PRECISION;
