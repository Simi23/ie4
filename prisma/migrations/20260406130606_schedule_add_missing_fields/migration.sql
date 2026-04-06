/*
  Warnings:

  - Added the required column `show` to the `BracketPartSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `show` to the `EventSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `started` to the `EventSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BracketPartSchedule" ADD COLUMN     "show" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "EventSchedule" ADD COLUMN     "show" BOOLEAN NOT NULL,
ADD COLUMN     "started" BOOLEAN NOT NULL;
