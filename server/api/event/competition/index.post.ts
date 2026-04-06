// Set competition order and default medias

import z from "zod";
import { prisma } from "~~/db/prismaClient";

const requestSchema = z.object({
  brackets: z.array(
    z.object({
      bracketId: z.string(),
      order: z.number(),
      defaultMediaId: z.string().optional(),
    }),
  ),
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

  const [err, res] = await catchError(
    prisma.$transaction([
      prisma.bracketSchedule.deleteMany(),
      prisma.bracketSchedule.createMany({
        data: body.data.brackets.map((b) => ({
          order: b.order,
          bracketId: b.bracketId,
          defaultMediaId: b.defaultMediaId,
        })),
      }),
    ]),
  );

  if (err) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  return {
    notification: createNotification("SUCCESS", {
      message: "Versenymenetrend sikeresen mentve!",
    }),
  };
});
