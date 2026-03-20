-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('Normal', 'Admin', 'Registration');

-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "type" "SeatType" NOT NULL DEFAULT 'Normal';
