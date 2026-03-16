UPDATE "PropertyFeature"
SET
  "category" = LOWER(TRIM("category")),
  "key" = LOWER(TRIM("key"));

DELETE FROM "PropertyFeature" pf
USING "PropertyFeature" dup
WHERE pf."propertyId" = dup."propertyId"
  AND pf."category" = dup."category"
  AND pf."key" = dup."key"
  AND pf."id" > dup."id";

CREATE UNIQUE INDEX "PropertyFeature_propertyId_category_key_key"
ON "PropertyFeature"("propertyId", "category", "key");
