/*
  Warnings:

  - Added the required column `projectsId` to the `Deployments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deployments" ADD COLUMN     "projectsId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Deployments" ADD CONSTRAINT "Deployments_projectsId_fkey" FOREIGN KEY ("projectsId") REFERENCES "Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
