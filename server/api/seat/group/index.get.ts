import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const [groupError, group] = await catchError(
    prisma.seatingGroup.findMany({
      include: {
        seats: true,
        users: {
          select: {
            fullname: true,
            class: {
              select: {
                name: true,
              },
            },
            teams: {
              select: {
                team: {
                  select: {
                    id: true,
                    name: true,
                    competition: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
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
