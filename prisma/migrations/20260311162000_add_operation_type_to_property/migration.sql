CREATE TYPE "OperationType" AS ENUM ('SALE', 'RENT', 'BOTH');

ALTER TABLE "Property"
ADD COLUMN "operationType" "OperationType" NOT NULL DEFAULT 'SALE';
