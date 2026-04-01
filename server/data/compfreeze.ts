import { prisma } from "~~/db/prismaClient";

export async function getCompFreeze() {
  const [vError, v] = await catchError(
    prisma.option.findUnique({
      where: {
        name: "compfreeze",
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

export async function setCompFreeze(newVal: boolean) {
  const [vError, v] = await catchError(
    prisma.option.upsert({
      where: {
        name: "compfreeze",
      },
      update: {
        value: newVal,
      },
      create: {
        name: "compfreeze",
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

export async function rejectCompFreeze() {
  if (await getCompFreeze()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "comp-freeze",
    });
  }
}
