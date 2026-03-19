import { prisma } from "~~/db/prismaClient";
import adminCheck from "#server/utils/adminCheck";
import createNotification from "#server/utils/createNotification";
import { logEventAction } from "#server/utils/logger";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const deleted = await prisma.seat.deleteMany({
    where: {
      owner: null,
    },
  });

  logEventAction(event, {
    category: "OPTION",
    severity: "INFO",
    message: `User ${event.context.user?.username} has deleted ${deleted.count} seats.`,
  });

  return {
    notification: createNotification("SUCCESS", {
      message: `${deleted.count} db ülőhely sikeresen törölve!`,
    }),
  };
});
