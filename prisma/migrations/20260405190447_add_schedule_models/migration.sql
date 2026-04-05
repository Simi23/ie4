-- AlterTable
ALTER TABLE "Bracket" ADD COLUMN     "bracketScheduleId" TEXT;

-- AlterTable
ALTER TABLE "BracketPart" ADD COLUMN     "bracketPartScheduleId" TEXT;

-- CreateTable
CREATE TABLE "BracketSchedule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "bracketId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "defaultMediaId" TEXT,

    CONSTRAINT "BracketSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BracketPartSchedule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "startTime" TIMESTAMPTZ NOT NULL,
    "timeZone" TEXT NOT NULL,
    "started" BOOLEAN NOT NULL,
    "mediaId" TEXT,

    CONSTRAINT "BracketPartSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSchedule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "smallTitle" TEXT,
    "description" TEXT,
    "mediaId" TEXT,

    CONSTRAINT "EventSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BracketSchedule_bracketId_key" ON "BracketSchedule"("bracketId");

-- AddForeignKey
ALTER TABLE "BracketPart" ADD CONSTRAINT "BracketPart_bracketPartScheduleId_fkey" FOREIGN KEY ("bracketPartScheduleId") REFERENCES "BracketPartSchedule"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketSchedule" ADD CONSTRAINT "BracketSchedule_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "Bracket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketSchedule" ADD CONSTRAINT "BracketSchedule_defaultMediaId_fkey" FOREIGN KEY ("defaultMediaId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketPartSchedule" ADD CONSTRAINT "BracketPartSchedule_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSchedule" ADD CONSTRAINT "EventSchedule_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
