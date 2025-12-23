/*
  Warnings:

  - Added the required column `commitMessage` to the `Deployments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deployments" ADD COLUMN     "commitMessage" TEXT NOT NULL;
