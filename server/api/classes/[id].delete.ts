import { prisma } from "~~/db/prismaClient";
import adminCheck from "#server/utils/adminCheck";
import createNotification from "#server/utils/createNotification";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const id = getRouterParam(event, "id");

  if (id === undefined) {
    throw createError({
      statusCode: 404,
      statusMessage: "Resource Not Found",
      message: "class-not-found",
    });
  }

  try {
    await prisma.class.delete({
      where: {
        id: id,
      },
    });
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: "Resource Not Found",
      message: "class-not-found",
    });
  }

  return {
    notification: createNotification("SUCCESS", {
      message: "Az osztály sikeresen törlésre került!",
    }),
  };
});
