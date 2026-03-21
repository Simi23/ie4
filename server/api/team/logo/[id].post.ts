import { prisma } from "~~/db/prismaClient";
import { catchError } from "#server/utils/catchError";
import createNotification from "#server/utils/createNotification";
import { logEventAction } from "#server/utils/logger";
import sharp from "sharp";
import { createId } from "@paralleldrive/cuid2";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default defineEventHandler(async (event) => {
  const teamId = event.context.params?.id;

  if (!event.context.user || !teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }
  const userId = event.context.user.id;

  const [leaderError, leader] = await catchError(
    prisma.userInTeam.findFirst({
      where: {
        team: {
          id: teamId,
        },
        user: {
          id: userId,
        },
      },
    }),
  );

  if (leaderError || !leader) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "error-in-process",
    });
  }

  if (!leader.isLeader) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "team-not-leader",
    });
  }

  const [teamError, team] = await catchError(
    prisma.team.findUnique({
      where: {
        id: teamId,
      },
    }),
  );

  if (teamError || !team) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "error-in-process",
    });
  }

  if (team.logo) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "delete-logo-first",
    });
  }

  // User is now permitted to do the action
  const formData = await readMultipartFormData(event);

  // Validate upload
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  const file = formData[0];
  const storage = useStorage("teamlogo");

  // Validate file size
  if (!file || file.data.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "request-body-invalid",
    });
  }

  try {
    const image = sharp(file.data);
    const meta = await image.metadata();
    const minDim = Math.min(meta.width, meta.height);

    const output = await image
      .resize({
        width: minDim,
        height: minDim,
      })
      .webp()
      .toBuffer();

    const newId = createId();
    const filename = `${newId}.webp`;
    await storage.setItemRaw(filename, output);

    await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        logo: newId,
        logoApproved: false,
      },
    });
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "error-reading-file",
    });
  }

  logEventAction(event, {
    category: "TEAM",
    severity: "INFO",
    message: `User ${event.context.user.username} updated team ${teamId} logo.`,
  });

  return {
    notification: createNotification("SUCCESS", {
      message: "Logó feltöltése sikeres!",
    }),
  };
});
