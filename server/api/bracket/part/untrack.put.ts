import z from "zod";
import { prisma } from "~~/db/prismaClient";
import adminCheck from "#server/utils/adminCheck";
import { catchError } from "#server/utils/catchError";
import createNotification from "#server/utils/createNotification";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const [error, data] = await catchError(
    prisma.bracketPart.updateMany({
      where: {
        isTracked: true,
      },
      data: {
        isTracked: false,
      },
    }),
  );

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "error-in-process",
    });
  }

  return {
    notification: createNotification("INFO", {
      message: "Megfigyelés sikeresen törölve.",
    }),
  };
});
