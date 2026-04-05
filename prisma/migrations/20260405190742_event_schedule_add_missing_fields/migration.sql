/*
  Warnings:

  - Added the required column `startTime` to the `EventSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeZone` to the `EventSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventSchedule" ADD COLUMN     "startTime" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "timeZone" TEXT NOT NULL;
