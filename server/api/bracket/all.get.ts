import { prisma } from "~~/db/prismaClient";
import { roundNameFromNumberOfCompetitors } from "~~/server/utils/bracket";

export default defineEventHandler(async (event) => {
  adminCheck(event, 2);

  const [bracketError, brackets] = await catchError(
    prisma.bracket.findMany({
      where: {
        NOT: {
          bracketSchedule: null,
        },
      },
      orderBy: {
        bracketSchedule: {
          order: "asc",
        },
      },
      include: {
        bracketSchedule: true,
        parts: {
          include: {
            team: {
              include: {
                users: {
                  select: {
                    user: {
                      select: {
                        username: true,
                        fullname: true,
                        id: true,
                      },
                    },
                  },
                },
              },
            },
            bracketPartSchedule: true,
          },
        },
        competition: {
          select: {
            teamCompetition: true,
          },
        },
      },
    }),
  );

  if (bracketError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "error-in-process",
    });
  }

  // Create preliminary output
  const scheduleBrackets: ScheduledBracketInfo[] = brackets.map((b) => {
    const rounds: RoundInfo[] = [];

    // Fill in the rounds
    b.parts.forEach((part) => {
      // Get the round
      if (rounds.every((r) => r.id !== part.round)) {
        rounds.push({
          id: part.round,
          name: roundNameFromNumberOfCompetitors(
            b.numberOfCompetitors,
            part.round,
          ),
          matches: [],
        });
      }
      const round = rounds.find((r) => r.id === part.round)!;

      const partSchedule = part.bracketPartSchedule
        ? {
            id: part.bracketPartSchedule.id,
            startTime: part.bracketPartSchedule.startTime.getTime(),
            timeZone: part.bracketPartSchedule.timeZone,
          }
        : undefined;

      // Get the match
      if (round.matches.every((m) => m.roundLocation !== part.roundLocation)) {
        round.matches.push({
          roundLocation: part.roundLocation,
          started: part.started,
          ended: part.ended,
          canStart: true,
          waitReason: [],
          teams: [],
          schedule: partSchedule,
          tracked: part.isTracked,
        });
      }
      const match = round.matches.find(
        (m) => m.roundLocation === part.roundLocation,
      )!;

      // Create the team
      if (match.teams.every((t) => t.id !== part.teamId) && part.team) {
        match.teams.push({
          id: part.team.id,
          bracketPartId: part.id,
          name: part.team.name,
          won: part.won,
          points: part.points,
          order: part.upper ? 0 : 1,
          users: part.team.users.map((u) => ({
            id: u.user.id,
            fullname: u.user.fullname,
            username: u.user.username,
          })),
        });
      }
    });

    // Sort the rounds by round id
    rounds.sort((r1, r2) => r1.id - r2.id);

    // Sort the teams by order
    rounds.forEach((r) =>
      r.matches.forEach((m) => m.teams.sort((t1, t2) => t1.order - t2.order)),
    );

    return {
      id: b.id,
      title: b.title,
      administrativeTitle: b.administrativeTitle,
      numberOfCompetitors: b.numberOfCompetitors,
      scheduleOrder: b.bracketSchedule!.order,
      teamCompetition: b.competition.teamCompetition,
      defaultMediaId: b.bracketSchedule!.defaultMediaId,
      rounds: rounds,
    };
  });

  // Sort the brackets by schedule order
  scheduleBrackets.sort((sb1, sb2) => sb1.scheduleOrder - sb2.scheduleOrder);

  // Run checks if matches can be started
  scheduleBrackets.forEach((bracket, bracketIndex) => {
    bracket.rounds.forEach((round, roundIndex) => {
      round.matches.forEach((match, matchIndex) => {
        const matchUsers = match.teams.flatMap((t) => t.users);

        // A match cannot be started if the participants are not all known
        if (match.teams.length != 2) {
          match.canStart = false;
        }

        // A user cannot compete if: (OR)
        //  1. they have an unfinished match in the same bracket in a previous round
        //     - unfinished = !ended
        //  2. they haven't finished in a previous bracket:
        //     - the last appearance of the user: !ended
        matchUsers.forEach((user) => {
          // Check 1.
          // If 1. occurs, that means the user hasn't been promoted to this
          // bracketpart, which means that the teams aren't full
          // so this needs no checks

          // Check 2.
          // Get all previous brackets
          const prevBrackets = scheduleBrackets.slice(0, bracketIndex);
          // Go from back
          for (let i = prevBrackets.length - 1; i >= 0; i--) {
            const b = prevBrackets[i]!;
            // Loop through rounds backwards
            for (let j = b.rounds.length - 1; j >= 0; j--) {
              const r = b.rounds[j]!;
              // If the user can be found in a match that hasn't ended, add them
              // to the list of reasons
              const matches = r.matches.filter(
                (m) =>
                  m.teams.some((t) => t.users.some((u) => u.id === user.id)) &&
                  !m.ended,
              );
              if (matches.length == 0) continue;
              const offendingMatch = matches[0]!;
              const offendingTeam = offendingMatch.teams.find((t) =>
                t.users.some((u) => u.id === user.id),
              )!;
              match.canStart = false;
              match.waitReason.push({
                user: {
                  id: user.id,
                  fullname: user.fullname,
                },
                team: {
                  id: offendingTeam.id,
                  name: offendingTeam.name,
                },
                bracket: {
                  id: b.id,
                  title: b.title,
                },
                round: {
                  id: r.id,
                  location: offendingMatch.roundLocation,
                  name: r.name,
                },
              });
            }
          }
        });
      });
    });
  });

  return {
    scheduleBrackets,
  };
});

type Reason = {
  user: {
    id: string;
    fullname: string;
  };
  team: {
    id: string;
    name: string;
  };
  bracket: {
    id: string;
    title: string;
  };
  round: {
    id: number;
    location: number;
    name: string;
  };
};

// This is the type that is returned
type ScheduledBracketInfo = {
  id: string;
  title: string;
  administrativeTitle: string;
  numberOfCompetitors: number;
  scheduleOrder: number;
  teamCompetition: boolean;
  defaultMediaId: string | null;
  rounds: RoundInfo[];
};

type RoundInfo = {
  id: number; // zero-indexed
  name: string;
  matches: {
    schedule?: {
      id: string;
      startTime: number;
      timeZone: string;
    };
    roundLocation: number;
    started: boolean;
    ended: boolean;
    tracked: boolean;
    canStart: boolean;
    waitReason: Reason[];
    teams: {
      id: string;
      bracketPartId: string;
      order: number;
      name: string;
      won: boolean;
      points: number[];
      users: {
        id: string;
        fullname: string;
        username: string;
      }[];
    }[];
  }[];
};

// /bracket/all
//  - include all info related to all brackets: filter for schedule (order)!!
//    - schedule
//    - competition
//    - parts -> composed into "matches" on the server
//      - teams
//        - user names and ids
//      - schedule
//      - can be started? if no, reasons (who are we waiting for: Reason[], Reason = {userid, bracketId, round, roundLocation})
