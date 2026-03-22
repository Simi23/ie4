import z from "zod";
import { setRoleId } from "~~/server/utils/discord";

const requestSchema = z.object({
  roleId: z.string(),
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

  const roleId = await setRoleId(body.data.roleId);

  return {
    roleId,
  };
});
