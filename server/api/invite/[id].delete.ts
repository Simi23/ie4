import { prisma } from "~~/db/prismaClient";
import { catchError } from "#server/utils/catchError";
import createNotification from "#server/utils/createNotification";
import { logEventAction } from "#server/utils/logger";
import { rejectCompFreeze } from "~~/server/data/compfreeze";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (id === undefined || event.context.user === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  const userId = event.context.user.id;

  await rejectCompFreeze();

  const [error, data] = await catchError(
    prisma.invite.delete({
      where: {
        id: id,
        inviteeId: userId,
      },
    }),
  );

  if (error !== undefined) {
    throw createError({
      statusCode: 404,
      statusMessage: "Resource Not Found",
      message: "invite-not-found",
    });
  }

  logEventAction(event, {
    category: "INVITE",
    severity: "INFO",
    message: `User ${event.context.user.username} declined invite ${data.id}.`,
  });

  return {
    notification: createNotification("SUCCESS", {
      message: "Meghívó sikeresen elutasítva.",
    }),
  };
});
