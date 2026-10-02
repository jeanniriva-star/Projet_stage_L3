-- CreateEnum
CREATE TYPE "StatutSession" AS ENUM ('NON_DEMARREE', 'EN_COURS', 'TERMINEE');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "statut" "StatutSession" NOT NULL DEFAULT 'NON_DEMARREE';
