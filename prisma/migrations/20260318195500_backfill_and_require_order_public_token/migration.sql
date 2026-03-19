-- Backfill publicToken for legacy orders, then make it required.
-- Uses a per-row random hash to avoid predictable tokens based only on id.
UPDATE "Order"
SET "publicToken" = md5(
  "id" || ':' || random()::text || ':' || clock_timestamp()::text || ':' || txid_current()::text
)
WHERE "publicToken" IS NULL;

ALTER TABLE "Order"
ALTER COLUMN "publicToken" SET NOT NULL;
