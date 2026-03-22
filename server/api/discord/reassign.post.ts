import { prisma } from "~~/db/prismaClient";
import { assignDcRole, getGuildId, getRoleId } from "~~/server/utils/discord";

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "access-denied",
    });
  }

  // Get the users discord id
  const [userError, user] = await catchError(
    prisma.user.findUnique({
      where: {
        id: event.context.user.id,
      },
    }),
  );

  if (userError || !user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "user-not-found",
    });
  }

  if (!user.dcConnected) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "dc-not-connected",
    });
  }

  const guildId = await getGuildId();
  const roleId = await getRoleId();

  if (!guildId || !roleId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  const result = await assignDcRole(guildId, user.dcId, roleId);

  if (!result.success) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-assigning-dc-role",
    });
  }

  return {
    notification: createNotification("SUCCESS", {
      title: "Discord rang sikeresen hozzárendelve!",
    }),
  };
});
