import { getGuildId } from "~~/server/utils/discord";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const guildId = await getGuildId();

  return {
    guildId,
  };
});
