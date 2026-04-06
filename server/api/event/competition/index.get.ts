// Get competition order / defaultMedia

import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const [err, data] = await catchError(
    prisma.bracketSchedule.findMany({
      orderBy: {
        order: "asc",
      },
      include: {
        bracket: {
          select: {
            id: true,
            title: true,
            administrativeTitle: true,
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
    brackets: data,
  };
});
