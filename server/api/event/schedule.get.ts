import { prisma } from "~~/db/prismaClient";
import { roundNameFromNumberOfCompetitors } from "~~/server/utils/bracket";

export default defineEventHandler(async (event) => {
  const [generalError, generalEvents] = await catchError(
    prisma.eventSchedule.findMany({
      where: {
        show: true,
      },
      include: {
        media: {
          select: {
            url: true,
          },
        },
      },
    }),
  );

  const [bracketError, bracketPartEvents] = await catchError(
    prisma.bracketPartSchedule.findMany({
      where: {
        show: true,
      },
      include: {
        bracketParts: {
          select: {
            team: {
              select: {
                name: true,
                users: {
                  select: {
                    user: {
                      select: {
                        fullname: true,
                      },
                    },
                  },
                  take: 1,
                },
              },
            },
            round: true,
            bracket: {
              select: {
                title: true,
                numberOfCompetitors: true,
                competition: {
                  select: {
                    teamCompetition: true,
                  },
                },
              },
            },
          },
        },
        media: {
          select: {
            url: true,
          },
        },
      },
    }),
  );

  if (generalError || bracketError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  const events: EventType[] = [];

  // Convert and add general events
  events.push(
    ...generalEvents.map((e) => ({
      id: e.id,
      startTime: e.startTime.getTime(),
      timeZone: e.timeZone,
      backgroundUrl: e.media?.url,
      started: e.started,
      type: "general" as const,
      data: {
        title: e.title,
        smallTitle: e.smallTitle ?? undefined,
        description: e.description ?? undefined,
      },
    })),
  );

  // Convert and add other events
  events.push(
    ...bracketPartEvents.map((e) => {
      const teamNames: string[] = e.bracketParts
        .map((b) => b.team)
        .filter((t) => t)
        .map((t) =>
          e.bracketParts[0]!.bracket.competition.teamCompetition
            ? t!.name
            : t!.users[0]!.user.fullname,
        );
      teamNames.sort();
      if (teamNames.length < 2) {
        teamNames.fill("?", teamNames.length, 1);
      }

      const currentRound = e.bracketParts[0]!.round;
      const noOfComp = e.bracketParts[0]!.bracket.numberOfCompetitors;
      const roundName = roundNameFromNumberOfCompetitors(
        noOfComp,
        currentRound,
      );
      const bracketTitle = e.bracketParts[0]!.bracket.title;
      const title = `${bracketTitle}: ${roundName}`;

      return {
        id: e.id,
        startTime: e.startTime.getTime(),
        timeZone: e.timeZone,
        backgroundUrl: e.media?.url,
        started: e.started,
        type: "match" as const,
        data: {
          title,
          teamA: teamNames[0]!,
          teamB: teamNames[1]!,
        },
      };
    }),
  );

  // Sort events by start time
  events.sort((a, b) => a.startTime - b.startTime);

  // Send events to client
  return {
    events,
  };
});

type EventType = {
  id: string;
  startTime: number;
  timeZone: string;
  started: boolean;
  backgroundUrl?: string;
} & (
  | {
      type: "general";
      data: GeneralEvent;
    }
  | {
      type: "match";
      data: MatchEvent;
    }
);

type GeneralEvent = {
  title: string;
  smallTitle?: string;
  description?: string;
};

type MatchEvent = {
  title: string;
  teamA: string;
  teamB: string;
};

// common:
//  - startTime
//  - timeZone
//  - backgroundUrl
//  - type
// type:general:
//  - title
//  - smallTitle
//  - description
// type:match:
//  - title (bracket name: round name)
//  - teamA
//  - teamB
