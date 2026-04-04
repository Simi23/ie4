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
    prisma.seatingGroup.findUnique({
      where: {
        id: groupId,
      },
      include: {
        seats: {
          select: {
            name: true,
            id: true,
            owner: {
              select: {
                id: true,
                fullname: true,
                username: true,
              },
            },
          },
        },
        users: {
          select: {
            id: true,
            fullname: true,
            username: true,
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

  if (!group) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "not-found",
    });
  }

  return {
    group,
  };
});
