import { prisma } from "~~/db/prismaClient";
import adminCheck from "#server/utils/adminCheck";
import { catchError } from "#server/utils/catchError";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const [teamError, teams] = await catchError(
    prisma.team.findMany({
      include: {
        competition: {
          select: {
            title: true,
          },
        },
      },
      where: {
        competition: {
          teamCompetition: true,
        },
      },
    }),
  );

  if (teamError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  const output = teams.map((t) => {
    const logoUrl = t.logo ? `/logo/${t.logo}.webp` : null;

    return {
      id: t.id,
      name: t.name,
      competitionName: t.competition.title,
      competitionId: t.competitionId,
      logoUrl: logoUrl,
      logoApproved: t.logoApproved,
      logoFullUrl: `${useRuntimeConfig().public.siteName}${logoUrl}`,
    };
  });

  return output;
});
