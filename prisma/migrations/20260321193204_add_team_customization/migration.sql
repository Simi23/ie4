-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "color" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "logoApproved" BOOLEAN NOT NULL DEFAULT false;
