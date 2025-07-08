-- DropForeignKey
ALTER TABLE "Deployments" DROP CONSTRAINT "Deployments_projectId_fkey";

-- AddForeignKey
ALTER TABLE "Deployments" ADD CONSTRAINT "Deployments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
