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
