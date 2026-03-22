import { getRoleId } from "~~/server/utils/discord";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const roleId = await getRoleId();

  return {
    roleId,
  };
});
