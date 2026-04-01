import { getCompFreeze } from "~~/server/data/compfreeze";

export default defineEventHandler(async (event) => {
  const compFreeze = await getCompFreeze();

  return {
    compFreeze,
  };
});
