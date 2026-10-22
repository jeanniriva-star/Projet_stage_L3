-- CreateEnum
CREATE TYPE "StatutFormation" AS ENUM ('EN_COURS', 'TERMINEE');

-- AlterTable
ALTER TABLE "Formation" ADD COLUMN     "statut" "StatutFormation" NOT NULL DEFAULT 'EN_COURS',
ADD COLUMN     "termineeLe" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Certificat" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "inscriptionId" TEXT NOT NULL,
    "moyenne" DOUBLE PRECISION NOT NULL,
    "delivreLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certificat_numero_key" ON "Certificat"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Certificat_inscriptionId_key" ON "Certificat"("inscriptionId");

-- AddForeignKey
ALTER TABLE "Certificat" ADD CONSTRAINT "Certificat_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
