const panaboDateTime = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatScheduleDateTime(value: string | Date): string {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? panaboDateTime.format(date).replace(" ", "T")
    : "";
}

export function parseScheduleDateTime(value: string): Date {
  return new Date(`${value}:00+08:00`);
}
