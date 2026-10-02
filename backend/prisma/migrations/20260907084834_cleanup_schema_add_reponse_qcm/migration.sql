/*
  Warnings:

  - You are about to drop the column `userId` on the `ProgressionCours` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SoumissionEvaluation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[formationId,ordre]` on the table `Cours` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProgressionCours" DROP CONSTRAINT "ProgressionCours_userId_fkey";

-- DropForeignKey
ALTER TABLE "SoumissionEvaluation" DROP CONSTRAINT "SoumissionEvaluation_userId_fkey";

-- AlterTable
ALTER TABLE "ProgressionCours" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "SoumissionEvaluation" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "ReponseQCM" (
    "id" TEXT NOT NULL,
    "soumissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choixId" TEXT NOT NULL,

    CONSTRAINT "ReponseQCM_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReponseQCM_soumissionId_questionId_key" ON "ReponseQCM"("soumissionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Cours_formationId_ordre_key" ON "Cours"("formationId", "ordre");

-- AddForeignKey
ALTER TABLE "ReponseQCM" ADD CONSTRAINT "ReponseQCM_soumissionId_fkey" FOREIGN KEY ("soumissionId") REFERENCES "SoumissionEvaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReponseQCM" ADD CONSTRAINT "ReponseQCM_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReponseQCM" ADD CONSTRAINT "ReponseQCM_choixId_fkey" FOREIGN KEY ("choixId") REFERENCES "Choix"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
