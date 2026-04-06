import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  const [err] = await catchError(
    prisma.bracketPartSchedule.delete({
      where: {
        id,
      },
    }),
  );

  if (err) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  return {
    notification: createNotification("SUCCESS", {
      message: "Esemény törölve",
    }),
  };
});
