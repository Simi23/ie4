import { prisma } from "~~/db/prismaClient";
import { mailSettingSchema } from "#shared/schemas/mailSettingSchema";
import adminCheck from "#server/utils/adminCheck";
import createNotification from "#server/utils/createNotification";
import { logEventAction } from "#server/utils/logger";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const body = await readBody(event);
  body.from = decodeURIComponent(body.from);

  const validatedBody = mailSettingSchema.safeParse(body);

  if (!validatedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "validation-failed",
    });
  }

  await prisma.option.upsert({
    where: {
      name: "email",
    },
    update: {
      value: validatedBody.data,
    },
    create: {
      name: "email",
      value: validatedBody.data,
    },
  });

  logEventAction(event, {
    category: "OPTION",
    severity: "INFO",
    message: `User "${event.context.user?.username}" changed email settings.`,
  });

  return {
    notification: createNotification("SUCCESS", {
      message: "Email beállítások módosítása sikeres!",
    }),
  };
});
