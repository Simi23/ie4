import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const [regSeatError, regSeats] = await catchError(
    prisma.seat.findMany({
      where: {
        OR: [
          {
            type: "Registration",
            NOT: {
              owner: null,
            },
          },
          {
            type: "Normal",
          },
        ],
      },
      include: {
        owner: {
          include: {
            teams: {
              include: {
                team: {
                  include: {
                    competition: true,
                  },
                },
              },
            },
          },
          omit: {
            passwordHash: true,
          },
        },
      },
    }),
  );

  if (regSeatError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  return {
    regSeats,
  };
});
