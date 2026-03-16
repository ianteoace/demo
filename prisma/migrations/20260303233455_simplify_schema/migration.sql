/*
  Warnings:

  - You are about to drop the column `inmobiliariaId` on the `Propiedad` table. All the data in the column will be lost.
  - You are about to drop the column `inmobiliariaId` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inmobiliaria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `operacion` to the `Propiedad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Propiedad` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Propiedad" DROP CONSTRAINT "Propiedad_inmobiliariaId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_inmobiliariaId_fkey";

-- AlterTable
ALTER TABLE "Propiedad" DROP COLUMN "inmobiliariaId",
ADD COLUMN     "estado" "EstadoPropiedad" NOT NULL DEFAULT 'DISPONIBLE',
ADD COLUMN     "operacion" "Operacion" NOT NULL,
ADD COLUMN     "publicada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tipo" "TipoPropiedad" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "inmobiliariaId",
ALTER COLUMN "password" SET NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Inmobiliaria";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";
