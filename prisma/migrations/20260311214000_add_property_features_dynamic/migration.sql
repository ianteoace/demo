CREATE TABLE "PropertyFeature" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyFeature_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PropertyFeature_propertyId_category_idx" ON "PropertyFeature"("propertyId", "category");

ALTER TABLE "PropertyFeature"
ADD CONSTRAINT "PropertyFeature_propertyId_fkey"
FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
