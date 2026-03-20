import { prisma } from "~~/db/prismaClient";
import adminCheck from "#server/utils/adminCheck";
import createNotification from "#server/utils/createNotification";
import { logEventAction } from "#server/utils/logger";
import { SeatType } from "~~/generated/prisma/enums";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const seats = [{ name: "SWAP", public: false, type: "Admin" as SeatType }];

  const publicPrefixes = ["A-", "B-", "C-", "D-", "E-"];
  const privatePrefixes = ["HIDDEN-"];
  const minNum = 1;
  const maxNum = 18;

  fillSeatArray(seats, publicPrefixes, minNum, maxNum, true, "Normal");
  fillSeatArray(seats, privatePrefixes, minNum, maxNum, false, "Admin");
  fillSeatArray(seats, ["REG-"], 1, 90, false, "Registration");

  const newSeats = await prisma.seat.createMany({
    data: seats,
  });

  logEventAction(event, {
    category: "OPTION",
    severity: "INFO",
    message: `User ${event.context.user?.username} has generated seats.`,
  });

  return {
    notification: createNotification("SUCCESS", {
      message: "Ülőhelyek sikeresen létrehozva!",
    }),
  };
});

function fillSeatArray(
  array: { name: string; public: boolean; type: SeatType }[],
  prefixList: string[],
  minNum: number,
  maxNum: number,
  isPublic: boolean,
  seatType: SeatType,
) {
  for (let i = 0; i < prefixList.length; i++) {
    const prefix = prefixList[i];
    for (let j = minNum; j <= maxNum; j++) {
      array.push({
        name: `${prefix}${j.toString().padStart(2, "0")}`,
        public: isPublic,
        type: seatType,
      });
    }
  }
}
