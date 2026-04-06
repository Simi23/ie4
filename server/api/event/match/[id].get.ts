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
    prisma.bracketPartSchedule.findUnique({
      where: {
        id,
      },
      include: {
        media: {
          select: {
            url: true,
          },
        },
        bracketParts: {
          select: {
            id: true,
            won: true,
            started: true,
            ended: true,
            points: true,
            bracket: {
              select: {
                id: true,
                title: true,
                administrativeTitle: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
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
