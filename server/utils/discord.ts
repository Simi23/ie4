import { REST, Routes } from "discord.js";
import { prisma } from "~~/db/prismaClient";

const rest = new REST({ version: "10" }).setToken(
  useRuntimeConfig().discord.botToken,
);

export async function assignDcRole(
  guildId: string,
  userId: string,
  roleId: string,
) {
  try {
    await rest.put(Routes.guildMemberRole(guildId, userId, roleId));
    return { success: true };
  } catch (error) {
    console.error("Failed to assign role:", error);
    return { success: false, error };
  }
}

export async function getRoleId() {
  const [error, data] = await catchError(
    prisma.option.findUnique({
      where: {
        name: "discordRoleId",
      },
    }),
  );

  if (error) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "option-not-found",
    });
  }

  return data ? String(data.value) : null;
}

export async function setRoleId(roleId: string) {
  const [error, data] = await catchError(
    prisma.option.upsert({
      where: {
        name: "discordRoleId",
      },
      update: {
        value: roleId,
      },
      create: {
        name: "discordRoleId",
        value: roleId,
      },
    }),
  );

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  return String(data.value);
}

export async function getGuildId() {
  const [error, data] = await catchError(
    prisma.option.findUnique({
      where: {
        name: "discordGuildId",
      },
    }),
  );

  if (error) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "option-not-found",
    });
  }

  return data ? String(data.value) : null;
}

export async function setGuildId(guildId: string) {
  const [error, data] = await catchError(
    prisma.option.upsert({
      where: {
        name: "discordGuildId",
      },
      update: {
        value: guildId,
      },
      create: {
        name: "discordGuildId",
        value: guildId,
      },
    }),
  );

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  return String(data.value);
}
