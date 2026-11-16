export const DASHBOARD_PERIODS = {
  "30days": "Last 30 Days",
  thisMonth: "This Month",
  "3months": "Last 3 Months",
  "6months": "Last 6 Months",
  lastYear: "Last Year",
  thisYear: "This Year",
} as const;

export type DashboardRange = keyof typeof DASHBOARD_PERIODS;
export const DEFAULT_DASHBOARD_RANGE: DashboardRange = "30days";

export type DashboardPeriod = {
  startDate: string;
  endDate: string;
  bucket: "day" | "month";
};

const panaboDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function isDashboardRange(value: unknown): value is DashboardRange {
  return typeof value === "string" && Object.hasOwn(DASHBOARD_PERIODS, value);
}

export function getDashboardPeriod(
  range: DashboardRange | "12months",
  now = new Date(),
): DashboardPeriod {
  const [year, month, day] = panaboDate.format(now).split("-").map(Number);
  const date = (y: number, m: number, d: number) =>
    new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
  const endDate = date(year, month, day + 1);
  switch (range) {
    case "30days":
      return { startDate: date(year, month, day - 29), endDate, bucket: "day" };
    case "thisMonth":
      return { startDate: date(year, month, 1), endDate, bucket: "day" };
    case "3months":
    case "6months":
    case "12months":
      return { startDate: date(year, month - (parseInt(range, 10) - 1), 1), endDate, bucket: "month" };
    case "lastYear":
      return { startDate: date(year - 1, 1, 1), endDate: date(year, 1, 1), bucket: "month" };
    case "thisYear":
      return { startDate: date(year, 1, 1), endDate, bucket: "month" };
  }
}
