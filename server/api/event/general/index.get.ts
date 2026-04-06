import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const [err, data] = await catchError(
    prisma.eventSchedule.findMany({
      orderBy: {
        startTime: "asc",
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

  return {
    events: data,
  };
});
