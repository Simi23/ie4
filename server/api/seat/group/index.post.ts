import z from "zod";
import { prisma } from "~~/db/prismaClient";

const requestSchema = z.object({
  reason: z.string().optional(),
  userIds: z.array(z.string()),
  seatIds: z.array(z.string()),
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

  const [groupError, group] = await catchError(
    prisma.seatingGroup.create({
      data: {
        reason: body.data.reason,
        users: {
          connect: body.data.userIds.map((u) => ({
            id: u,
          })),
        },
        seats: {
          connect: body.data.seatIds.map((s) => ({
            id: s,
          })),
        },
      },
    }),
  );

  if (groupError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  return {
    notification: createNotification("SUCCESS", {
      message: "Ültetési csoport létrehozása sikeres!",
    }),
  };
});
