import { fromZonedTime } from "date-fns-tz";
import z from "zod";
import { prisma } from "~~/db/prismaClient";

const requestSchema = z.object({
  startTime: z.string(),
  timeZone: z.string(),
  started: z.boolean(),
  show: z.boolean(),
  mediaId: z.string().optional(),
  bracketPartIds: z.array(z.string()).length(2),
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

  const date = fromZonedTime(body.data.startTime, body.data.timeZone);

  const [err] = await catchError(
    prisma.bracketPartSchedule.create({
      data: {
        startTime: date,
        timeZone: body.data.timeZone,
        started: body.data.started,
        show: body.data.show,
        mediaId: body.data.mediaId,
        bracketParts: {
          connect: body.data.bracketPartIds.map((bpid) => ({ id: bpid })),
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
    notification: createNotification("SUCCESS", {
      message: "Esemény létrehozva",
    }),
  };
});
