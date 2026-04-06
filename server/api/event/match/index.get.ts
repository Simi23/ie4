import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const [err, data] = await catchError(
    prisma.bracketPartSchedule.findMany({
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

  return {
    events: data,
  };
});
