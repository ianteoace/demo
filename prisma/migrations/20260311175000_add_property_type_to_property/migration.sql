CREATE TYPE "PropertyType" AS ENUM (
  'APARTMENT',
  'HOUSE',
  'PH',
  'LAND',
  'COMMERCIAL',
  'OFFICE'
);

ALTER TABLE "Property"
ADD COLUMN "propertyType" "PropertyType" NOT NULL DEFAULT 'APARTMENT';
