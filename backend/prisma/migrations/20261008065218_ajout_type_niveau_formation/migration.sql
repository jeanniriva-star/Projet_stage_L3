-- CreateEnum
CREATE TYPE "TypeFormation" AS ENUM ('CONTINUE', 'PROFESSIONNELLE');

-- CreateEnum
CREATE TYPE "NiveauUniversitaire" AS ENUM ('L1', 'L2', 'L3', 'M1', 'M2');

-- AlterTable
ALTER TABLE "Formation" ADD COLUMN     "niveau" "NiveauUniversitaire",
ADD COLUMN     "type" "TypeFormation" NOT NULL DEFAULT 'PROFESSIONNELLE';
