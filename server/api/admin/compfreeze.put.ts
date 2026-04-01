import z from "zod";
import { setCompFreeze } from "~~/server/data/compfreeze";

const requestSchema = z.object({
  compFreeze: z.boolean(),
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

  await setCompFreeze(body.data.compFreeze);

  return {
    notification: createNotification("SUCCESS", {
      message: "Versenyjelentkezés státusza mentésre került.",
    }),
  };
});
