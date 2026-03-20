import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  const freeSeats = await prisma.seat.count({
    where: {
      owner: null,
      type: "Registration",
    },
  });
  const totalSeats = await prisma.seat.count({
    where: {
      type: "Registration",
    },
  });

  return {
    totalSeats,
    freeSeats,
    occupiedSeats: totalSeats - freeSeats,
  };
});
