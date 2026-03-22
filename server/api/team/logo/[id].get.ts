import { prisma } from "~~/db/prismaClient";
import { catchError } from "#server/utils/catchError";

export default defineEventHandler(async (event) => {
  const teamId = event.context.params?.id;

  if (!event.context.user || !teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  const [logoError, logo] = await catchError(
    prisma.team.findUnique({
      where: {
        id: teamId,
      },
    }),
  );

  if (logoError || !logo) {
    throw createError({
      statusCode: 404,
      statusMessage: "Resource Not Found",
      message: "team-not-found",
    });
  }

  const logoUrl = logo.logo ? `/logo/${logo.logo}.webp` : null;

  return {
    teamId: logo.id,
    logoUrl: logoUrl,
    logoApproved: logo.logoApproved,
    logoFullUrl: `${useRuntimeConfig().public.siteName}${logoUrl}`,
  };
});
