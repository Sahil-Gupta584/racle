/*
  Warnings:

  - You are about to drop the `EnvironmentVariables` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EnvironmentVariables" DROP CONSTRAINT "EnvironmentVariables_projectId_fkey";

-- DropTable
DROP TABLE "EnvironmentVariables";
