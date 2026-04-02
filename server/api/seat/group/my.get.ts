import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  if (event.context.user === undefined) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "session-not-found",
    });
  }

  const [groupError, group] = await catchError(
    prisma.seatingGroup.findFirst({
      where: {
        users: {
          some: {
            id: event.context.user.id,
          },
        },
      },
      include: {
        seats: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                id: true,
              },
            },
          },
        },
        users: {
          select: {
            fullname: true,
            class: {
              select: {
                name: true,
              },
            },
          },
        },
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
    group,
  };
});
