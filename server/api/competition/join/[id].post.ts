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

  await rejectCompFreeze();

  const [error, data] = await catchError(
    prisma.competition.findFirst({
      where: {
        id: id,
      },
      include: {
        teams: {
          where: {
            users: {
              some: {
                userId: event.context.user.id,
              },
            },
          },
        },
      },
    }),
  );

  if (error !== undefined || data === null) {
    throw createError({
      statusCode: 404,
      statusMessage: "Resource Not Found",
      message: "competition-not-found",
    });
  }

  if (data.teams.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  const teamName = data.teamCompetition
    ? "Új csapat"
    : event.context.user.username;
  const [joinError, joinData] = await catchError(
    prisma.team.create({
      data: {
        name: teamName,
        competition: {
          connect: {
            id: data.id,
          },
        },
        users: {
          create: {
            isLeader: true,
            user: {
              connect: {
                id: event.context.user.id,
              },
            },
          },
        },
      },
    }),
  );

  if (joinError !== undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  logEventAction(event, {
    category: "COMPETITION",
    severity: "INFO",
    message: `User ${event.context.user?.username} joined competition ${data.title}.`,
  });

  if (data.teamCompetition) {
    return {
      notification: createNotification("SUCCESS", {
        message: "Csapat létrehozása sikeres!",
      }),
    };
  }

  return {
    notification: createNotification("SUCCESS", {
      message: "Sikeresen jelentkeztél a versenyre!",
    }),
  };
});
