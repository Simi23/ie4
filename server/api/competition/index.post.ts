import { prisma } from "~~/db/prismaClient";
import adminCheck from "#server/utils/adminCheck";
import { catchError } from "#server/utils/catchError";
import createNotification from "#server/utils/createNotification";
import { logEventAction } from "#server/utils/logger";
import { competitionSchema } from "#shared/schemas/competitionSchema";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const body = await readValidatedBody(event, (body) =>
    competitionSchema.safeParse(body),
  );

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  const [error, newData] = await catchError(
    prisma.competition.create({
      data: {
        title: body.data.title,
        description: body.data.description,
        teamCompetition: body.data.teamCompetition,
        teamLimit: body.data.teamLimit,
        image: {
          connect: {
            id: body.data.image,
          },
        },
      },
    }),
  );

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "unknown-error",
    });
  }

  logEventAction(event, {
    category: "COMPETITION",
    severity: "INFO",
    message: `User ${event.context.user?.username} created competition ${newData.id}.`,
  });

  return {
    notification: createNotification("SUCCESS", {
      message: "Verseny léthozása sikeres!",
    }),
  };
});
