import z from "zod";
import { prisma } from "~~/db/prismaClient";
import { fromZonedTime } from "date-fns-tz";

const requestSchema = z.object({
  startTime: z.string(),
  timeZone: z.string(),
  started: z.boolean(),
  show: z.boolean(),
  title: z.string(),
  smallTitle: z.string().optional(),
  description: z.string().optional(),
  mediaId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

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
    prisma.eventSchedule.update({
      where: {
        id,
      },
      data: {
        startTime: date,
        timeZone: body.data.timeZone,
        started: body.data.started,
        show: body.data.show,
        title: body.data.title,
        smallTitle: body.data.smallTitle,
        description: body.data.description,
        mediaId: body.data.mediaId,
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
      message: "Esemény frissítve",
    }),
  };
});
