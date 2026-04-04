import z from "zod";
import { prisma } from "~~/db/prismaClient";

const requestSchema = z.object({
  competitionIds: z.array(z.string()),
});

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const body = await readValidatedBody(event, requestSchema.safeParse);

  if (body.error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  const [competitionError, competitions] = await catchError(
    prisma.competition.findMany({
      where: {
        id: {
          in: body.data.competitionIds,
        },
      },
      include: {
        teams: {
          select: {
            name: true,
          },
        },
      },
    }),
  );

  if (competitionError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  const comps = competitions.map((c) => c.title);

  const [chanError] = await catchError(deleteAllChildren(comps));

  if (chanError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  return {
    notification: createNotification("SUCCESS", {
      message: "Csatornák sikeresen törölve!",
    }),
  };
});
