export function generateColors(teamCount: number) {
  const cols: string[] = [];

  for (let i = 0; i < teamCount; i++) {
    const hue = Math.round((360 / teamCount) * i);
    cols.push(`hsl(${hue + 60} 60% 40%)`);
  }

  return cols;
}

export function multiColorGradientId(colors: string[]) {
  return btoa(colors.join(";;"))
    .replaceAll("+", "")
    .replaceAll("/", "")
    .replaceAll("=", "");
}

export function multiColorGradient(colors: string[]) {
  const stops: {
    location: string;
    color: string;
  }[] = [];
  const stepSize = 100 / colors.length;

  for (let i = 0; i < colors.length; i++) {
    const cur = colors[i];
    if (!cur) continue;

    stops.push({
      location: `${Math.round(i * stepSize)}`,
      color: cur,
    });
    stops.push({
      location: `${Math.round((i + 1) * stepSize) - 1}`,
      color: cur,
    });
  }

  return stops;
}
