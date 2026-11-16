enum ReportMapDateRange {
  last30Days("Last 30 Days"),
  thisMonth("This Month"),
  last3Months("Last 3 Months"),
  last6Months("Last 6 Months"),
  lastYear("Last Year"),
  thisYear("This Year");

  const ReportMapDateRange(this.label);

  final String label;

  ReportMapDateWindow window([DateTime? now]) {
    // Panabo uses UTC+08:00. Use UTC for calendar arithmetic so the device's
    // time zone does not affect the requested date boundaries.
    const panaboOffset = Duration(hours: 8);
    final today = (now ?? DateTime.now()).toUtc().add(panaboOffset);
    final year = today.year;
    final month = today.month;
    final day = today.day;
    DateTime midnight(int y, int m, int d) =>
        DateTime.utc(y, m, d).subtract(panaboOffset);

    final start = switch (this) {
      last30Days => midnight(year, month, day - 29),
      thisMonth => midnight(year, month, 1),
      last3Months => midnight(year, month - 2, 1),
      last6Months => midnight(year, month - 5, 1),
      lastYear => midnight(year - 1, 1, 1),
      thisYear => midnight(year, 1, 1),
    };
    final end = this == lastYear
        ? midnight(year, 1, 1)
        : midnight(year, month, day + 1);
    return ReportMapDateWindow(start: start, end: end);
  }
}

class ReportMapDateWindow {
  const ReportMapDateWindow({required this.start, required this.end});

  final DateTime start;
  final DateTime end;

  Map<String, String> get queryParameters => {
    "createdFrom": start.toIso8601String(),
    "createdBefore": end.toIso8601String(),
  };

  bool contains(DateTime submittedAt) =>
      !submittedAt.isBefore(start) && submittedAt.isBefore(end);
}
