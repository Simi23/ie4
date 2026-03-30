import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const groupId = event.context.params?.id;

  if (!groupId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "body-invalid",
    });
  }

  const [groupError, group] = await catchError(
    prisma.seatingGroup.delete({
      where: {
        id: groupId,
      },
    }),
  );

  if (groupError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  return {
    notification: createNotification("SUCCESS", {
      message: "Ültetési csoport törölve.",
    }),
  };
});
