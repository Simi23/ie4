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

export async function getAllChannels() {
  const guildId = await getGuildId();

  if (!guildId) return [];

  const channels = (await rest.get(Routes.guildChannels(guildId))) as any[];

  return channels;
}

export async function getCategories() {
  const channels = await getAllChannels();

  const categories = channels.filter((c) => c.type == 4);

  return categories;
}

type ChannelCreate = {
  parentName: string;
  name: string;
};
export async function createChannels(channels: ChannelCreate[]) {
  const guildId = await getGuildId();
  if (!guildId) return;

  let categories: any[] | undefined = undefined;

  const parentIds: Record<string, string> = {};

  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i]!;

    let pId: string | undefined = undefined;

    if (!parentIds[channel.parentName]) {
      if (!categories) {
        categories = await getCategories();
      }

      const parent = categories.find((c) => c.name == channel.parentName);
      if (parent) {
        parentIds[channel.parentName] = parent.id;
      }
    }
    pId = parentIds[channel.parentName];

    if (!pId) continue;

    const payload = {
      name: channel.name,
      type: 2,
      parent_id: pId,
    };

    await rest.post(Routes.guildChannels(guildId), {
      body: payload,
    });
  }
}

export async function deleteAllChildren(parentNames: string[]) {
  const channels = await getAllChannels();

  for (let i = 0; i < parentNames.length; i++) {
    const pName = parentNames[i]!;
    const children = channels.filter((c) => {
      if (c.parent_id == null) return false;

      const parent = channels.find(
        (cat) => cat.type == 4 && cat.id == c.parent_id,
      );

      if (!parent) return false;

      return parent.name == pName;
    });

    for (let j = 0; j < children.length; j++) {
      const channel = children[j]!;

      await rest.delete(Routes.channel(channel.id));
    }
  }
}
