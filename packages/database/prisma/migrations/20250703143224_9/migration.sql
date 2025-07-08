/*
  Warnings:

  - Added the required column `commitHash` to the `Deployments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logs` to the `Deployments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deployments" ADD COLUMN     "commitHash" TEXT NOT NULL,
ADD COLUMN     "logs" TEXT NOT NULL;
