-- DropForeignKey
ALTER TABLE "BracketPart" DROP CONSTRAINT "BracketPart_bracketPartScheduleId_fkey";

-- AddForeignKey
ALTER TABLE "BracketPart" ADD CONSTRAINT "BracketPart_bracketPartScheduleId_fkey" FOREIGN KEY ("bracketPartScheduleId") REFERENCES "BracketPartSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
