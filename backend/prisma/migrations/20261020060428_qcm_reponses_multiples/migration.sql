/*
  Warnings:

  - A unique constraint covering the columns `[soumissionId,questionId,choixId]` on the table `ReponseQCM` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ReponseQCM_soumissionId_questionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ReponseQCM_soumissionId_questionId_choixId_key" ON "ReponseQCM"("soumissionId", "questionId", "choixId");
