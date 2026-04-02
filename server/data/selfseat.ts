import { prisma } from "~~/db/prismaClient";

export async function getSelfSeat() {
  const [vError, v] = await catchError(
    prisma.option.findUnique({
      where: {
        name: "selfseat",
      },
    }),
  );

  if (vError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  if (!v) {
    return false;
  }

  return v.value as boolean;
}

export async function setSelfSeat(newVal: boolean) {
  const [vError, v] = await catchError(
    prisma.option.upsert({
      where: {
        name: "selfseat",
      },
      update: {
        value: newVal,
      },
      create: {
        name: "selfseat",
        value: newVal,
      },
    }),
  );

  if (vError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  return v.value as boolean;
}

export async function rejectSelfSeat() {
  if (!(await getSelfSeat())) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "no-self-seat",
    });
  }
}
