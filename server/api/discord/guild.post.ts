import z from "zod";
import { setGuildId } from "~~/server/utils/discord";

const requestSchema = z.object({
  guildId: z.string(),
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

  const guildId = await setGuildId(body.data.guildId);

  return {
    guildId,
  };
});
