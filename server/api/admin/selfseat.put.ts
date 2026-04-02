import z from "zod";
import { setSelfSeat } from "~~/server/data/selfseat";

const requestSchema = z.object({
  selfSeat: z.boolean(),
});

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const body = await readValidatedBody(event, requestSchema.safeParse);

  if (body.error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "body-invalid",
    });
  }

  await setSelfSeat(body.data.selfSeat);

  return {
    notification: createNotification("SUCCESS", {
      message: "Önálló ültetés státusza mentésre került.",
    }),
  };
});
