export function calculateBracketSize(numberOfCompetitors: number) {
  const rounds = nLog(2, numberOfCompetitors);
  const roundCount = Math.ceil(rounds);
  const fullRoundCount = Math.floor(rounds);
  return {
    roundCount,
    fullRoundCount,
  };
}

export function nLog(n: number, x: number) {
  return Math.log(x) / Math.log(n);
}

const roundNames = ["Döntő", "Elődöntő", "Negyeddöntő", "Nyolcaddöntő"];

export function roundNameFromRoundCount(
  roundCount: number,
  currentRound: number,
) {
  const idx = roundCount - currentRound - 1;
  const roundName =
    idx < roundNames.length ? roundNames[idx]! : `${currentRound + 1}. kör`;

  return roundName;
}

export function roundNameFromNumberOfCompetitors(
  numberOfCompetitors: number,
  currentRound: number,
) {
  const { roundCount } = calculateBracketSize(numberOfCompetitors);
  return roundNameFromRoundCount(roundCount, currentRound);
}
