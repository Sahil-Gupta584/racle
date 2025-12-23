-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('Ready', 'Error', 'Building', 'Queued', 'Canceled');

-- CreateTable
CREATE TABLE "EnvironmentVariables" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "EnvironmentVariables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "repositoryUrl" TEXT NOT NULL,
    "installCmd" TEXT NOT NULL,
    "buildCmd" TEXT NOT NULL,
    "runCmd" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deployments" (
    "id" TEXT NOT NULL,
    "status" "DeploymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deployments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnvironmentVariables" ADD CONSTRAINT "EnvironmentVariables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
