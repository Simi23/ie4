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

  const [err, data] = await catchError(
    prisma.eventSchedule.findUnique({
      where: {
        id,
      },
      include: {
        media: {
          select: {
            url: true,
          },
        },
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

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "event-not-found",
    });
  }

  return {
    event: data,
  };
});
