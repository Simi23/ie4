import z from "zod";
import { prisma } from "~~/db/prismaClient";
import { rejectSelfSeat } from "~~/server/data/selfseat";

const requestSchema = z.object({
  seatName: z.string(),
});

export default defineEventHandler(async (event) => {
  if (event.context.user === undefined) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "session-not-found",
    });
  }

  await rejectSelfSeat();

  const body = await readValidatedBody(event, requestSchema.safeParse);

  if (body.error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  const [userError, userInfo] = await catchError(
    prisma.user.findUnique({
      where: {
        id: event.context.user.id,
      },
      select: {
        seatingGroupId: true,
        seat: {
          select: {
            type: true,
          },
        },
      },
    }),
  );

  if (userError || !userInfo) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  if (userInfo.seat.type === "Normal") {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "self-seat-already-done",
    });
  }

  const [seatError, seatInfo] = await catchError(
    prisma.seat.findUnique({
      where: {
        name: body.data.seatName,
      },
      include: {
        owner: {
          select: {
            id: true,
          },
        },
      },
    }),
  );

  if (seatError || !seatInfo) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  if (seatInfo.owner !== null) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "seat-taken",
    });
  }

  if (
    seatInfo.seatingGroupId !== userInfo.seatingGroupId ||
    !seatInfo.seatingGroupId ||
    !userInfo.seatingGroupId
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "self-seat-not-here",
    });
  }

  const [connectError] = await catchError(
    prisma.user.update({
      where: {
        id: event.context.user.id,
      },
      data: {
        seat: {
          connect: {
            name: body.data.seatName,
          },
        },
      },
    }),
  );

  if (connectError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  return {
    notification: createNotification("SUCCESS", {
      message: "Ülőhely kiválasztása sikeres!",
    }),
  };
});
