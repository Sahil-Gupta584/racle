/*
  Warnings:

  - You are about to drop the column `projectsId` on the `Deployments` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `Deployments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Deployments" DROP CONSTRAINT "Deployments_projectsId_fkey";

-- AlterTable
ALTER TABLE "Deployments" DROP COLUMN "projectsId",
ADD COLUMN     "projectId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Deployments" ADD CONSTRAINT "Deployments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
