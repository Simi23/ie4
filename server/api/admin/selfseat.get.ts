import { getSelfSeat } from "~~/server/data/selfseat";

export default defineEventHandler(async (event) => {
  const selfSeat = await getSelfSeat();

  return {
    selfSeat,
  };
});
