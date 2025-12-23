/*
  Warnings:

  - Changed the type of `hookId` on the `Projects` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "hookId",
ADD COLUMN     "hookId" INTEGER NOT NULL;
