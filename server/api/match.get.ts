import { prisma } from "~~/db/prismaClient";

export default defineEventHandler(async (event) => {
  const [error, data] = await catchError(
    prisma.bracketPart.findMany({
      where: {
        isTracked: true,
      },
      include: {
        bracket: {
          select: {
            title: true,
          },
        },
        team: {
          select: {
            name: true,
            logo: true,
            logoApproved: true,
            users: {
              select: {
                user: {
                  select: {
                    fullname: true,
                    username: true,
                  },
                },
              },
              orderBy: {
                user: {
                  fullname: "asc",
                },
              },
            },
          },
        },
      },
      orderBy: {
        team: {
          name: "asc",
        },
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

  if (data.length != 2) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "event-not-found",
    });
  }

  const mapped = {
    competitionName: data[0]!.bracket.title,
    teams: data.map((t) => {
      const logoUrl = t.team?.logo ? `/logo/${t.team?.logo}.webp` : null;
      const fullLogoUrl = logoUrl
        ? `${useRuntimeConfig().public.siteName}${logoUrl}`
        : null;

      return {
        name: t.team?.name,
        logo: t.team?.logoApproved ? (fullLogoUrl ?? "") : "",
        fullnames: t.team?.users.map((u) => u.user.fullname),
        usernames: t.team?.users.map((u) => u.user.username),
      };
    }),
  };

  return mapped;
});
