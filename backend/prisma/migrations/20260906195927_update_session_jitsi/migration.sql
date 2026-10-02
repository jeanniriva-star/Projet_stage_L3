/*
  Warnings:

  - You are about to drop the column `lienJitsi` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomName]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomName` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Session_lienJitsi_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "lienJitsi",
ADD COLUMN     "roomName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_roomName_key" ON "Session"("roomName");
