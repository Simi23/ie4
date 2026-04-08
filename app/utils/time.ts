export function getTimeString(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  const sYear = year.toString();
  const sMonth = month.toString().padStart(2, "0");
  const sDay = day.toString().padStart(2, "0");
  const sHour = hour.toString().padStart(2, "0");
  const sMinute = minute.toString().padStart(2, "0");
  const sSecond = "00";

  return `${sYear}-${sMonth}-${sDay}T${sHour}:${sMinute}:${sSecond}`;
}
