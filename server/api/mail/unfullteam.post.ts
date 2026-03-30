import createNotification from "#server/utils/createNotification";
import { unfullTeamMail } from "#server/mail/mail";
import z from "zod";
import adminCheck from "#server/utils/adminCheck";
import { prisma } from "~~/db/prismaClient";
import { mailLimiter } from "#server/utils/limiter";

const schema = z.object({
  closeTime: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const body = await readValidatedBody(event, (uvbody) => {
    return schema.safeParse(uvbody);
  });

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "validation-failed",
    });
  }

  // Check if the player is a member of a non-full team
  const [tmError, tm] = await catchError(
    prisma.user.findMany({
      select: {
        teams: {
          select: {
            team: {
              select: {
                competition: {
                  select: {
                    teamLimit: true,
                  },
                },
                _count: {
                  select: {
                    users: true,
                  },
                },
              },
            },
          },
        },
        id: true,
        email: true,
      },
    }),
  );

  if (tmError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  const filtered = tm.filter((m) => {
    const smaller = m.teams.some((t) => {
      return t.team._count.users < t.team.competition.teamLimit;
    });
    return smaller;
  });

  console.log(`Sending email to ${filtered.length} users...`);
  sendAllMails(filtered, body.data.closeTime);

  return {
    notification: createNotification("SUCCESS", {
      message: "Email elküldve!",
    }),
  };
});

type UserList = {
  email: string;
}[];

async function sendAllMails(users: UserList, closeTime: string) {
  for (const user of users) {
    await mailLimiter.removeTokens(1);
    await unfullTeamMail(user.email, closeTime);
  }
}
