-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "seatingGroupId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "seatingGroupId" TEXT;

-- CreateTable
CREATE TABLE "SeatingGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SeatingGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_seatingGroupId_fkey" FOREIGN KEY ("seatingGroupId") REFERENCES "SeatingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_seatingGroupId_fkey" FOREIGN KEY ("seatingGroupId") REFERENCES "SeatingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
