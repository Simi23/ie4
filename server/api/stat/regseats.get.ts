import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  const freeSeats = await prisma.seat.count({
    where: {
      owner: null,
      type: "Registration",
    },
  });

  return { count: freeSeats };
});
