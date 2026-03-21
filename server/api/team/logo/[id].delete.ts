import { prisma } from "~~/db/prismaClient";
import adminCheck from "#server/utils/adminCheck";
import { catchError } from "#server/utils/catchError";
import createNotification from "#server/utils/createNotification";
import { logEventAction } from "#server/utils/logger";

export default defineEventHandler(async (event) => {
  const teamId = event.context.params?.id;

  if (!event.context.user || !teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }
  const userId = event.context.user.id;

  const [leaderError, leader] = await catchError(
    prisma.userInTeam.findFirst({
      where: {
        team: {
          id: teamId,
        },
        user: {
          id: userId,
        },
      },
    }),
  );

  const isAdmin = adminCheck(event, 2, true);

  if (leaderError || (!leader && !isAdmin)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "error-in-process",
    });
  }

  if (!leader?.isLeader && !isAdmin) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "team-not-leader",
    });
  }

  const [teamError, team] = await catchError(
    prisma.team.findUnique({
      where: {
        id: teamId,
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

  if (!team.logo) {
    return {
      notification: createNotification("INFO", {
        message: "A csapatnak nincs logója!",
      }),
    };
  }

  const storage = useStorage("teamlogo");
  const [deleteError] = await catchError(
    storage.removeItem(`${team.logo}.webp`),
  );
  if (deleteError) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "error-in-process",
    });
  }

  const [updateError] = await catchError(
    prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        logo: null,
        logoApproved: false,
      },
    }),
  );

  if (updateError) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "error-in-process",
    });
  }

  logEventAction(event, {
    category: "TEAM",
    severity: "INFO",
    message: `User ${event.context.user.username} deleted team ${teamId} logo.`,
  });

  return {
    notification: createNotification("SUCCESS", {
      message: "Logó törlése sikeres!",
    }),
  };
});
