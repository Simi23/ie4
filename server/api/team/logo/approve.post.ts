import { prisma } from "~~/db/prismaClient";
import adminCheck from "#server/utils/adminCheck";
import { catchError } from "#server/utils/catchError";
import createNotification from "#server/utils/createNotification";
import { logEventAction } from "#server/utils/logger";
import z from "zod";

const requestSchema = z.object({
  teamId: z.string().cuid(),
});

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const body = await readValidatedBody(event, (body) =>
    requestSchema.safeParse(body),
  );

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  const [teamError, team] = await catchError(
    prisma.team.update({
      where: {
        id: body.data.teamId,
      },
      data: {
        logoApproved: true,
      },
    }),
  );

  if (teamError || !team) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "error-in-process",
    });
  }

  logEventAction(event, {
    category: "TEAM",
    severity: "INFO",
    message: `User ${event.context.user?.username} approved team ${body.data.teamId} logo.`,
  });

  return {
    notification: createNotification("SUCCESS", {
      message: "Logó törlése sikeres!",
    }),
  };
});
