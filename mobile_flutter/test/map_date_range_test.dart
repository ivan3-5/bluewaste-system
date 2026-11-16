import "package:bluewaste_mobile_flutter/src/features/reports/data/report_service.dart";
import "package:bluewaste_mobile_flutter/src/features/reports/domain/report_map_date_range.dart";
import "package:bluewaste_mobile_flutter/src/features/reports/presentation/widgets/map_date_range_filter.dart";
import "package:dio/dio.dart";
import "package:flutter/material.dart";
import "package:flutter_test/flutter_test.dart";

void main() {
  final now = DateTime.utc(2027, 1, 14, 16, 15);
  final starts = [
    DateTime.utc(2026, 12, 16, 16),
    DateTime.utc(2026, 12, 31, 16),
    DateTime.utc(2026, 10, 31, 16),
    DateTime.utc(2026, 7, 31, 16),
    DateTime.utc(2025, 12, 31, 16),
    DateTime.utc(2026, 12, 31, 16),
  ];

  test("uses Panabo calendar boundaries for all six map ranges", () {
    for (final (index, range) in ReportMapDateRange.values.indexed) {
      final window = range.window(now);
      expect(window.start, starts[index]);
      expect(
        window.end,
        range == ReportMapDateRange.lastYear
            ? DateTime.utc(2026, 12, 31, 16)
            : DateTime.utc(2027, 1, 15, 16),
      );
      expect(window.contains(window.start), isTrue);
      expect(window.contains(window.end), isFalse);
    }
  });

  test(
    "sends the date window to raw, grouped and assigned map queries",
    () async {
      final requests = <RequestOptions>[];
      final dio = Dio(BaseOptions(baseUrl: "https://example.test"));
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            requests.add(options);
            handler.resolve(
              Response(
                requestOptions: options,
                data: options.path.endsWith("/assigned")
                    ? {
                        "data": [],
                        "pagination": {
                          "page": 1,
                          "limit": 20,
                          "total": 0,
                          "totalPages": 0,
                        },
                      }
                    : [],
              ),
            );
          },
        ),
      );
      final service = ReportService(dio);
      final range = ReportMapDateRange.lastYear.window(now);
      await service.getMapReports(dateWindow: range);
      await service.getIncidentMapData(dateWindow: range);
      await service.getAssignedReports(dateWindow: range);

      expect(requests.map((request) => request.path), [
        "/reports/map",
        "/reports/incidents/map",
        "/reports/assigned",
      ]);
      for (final request in requests) {
        expect(
          request.queryParameters,
          containsPair("createdFrom", "2025-12-31T16:00:00.000Z"),
        );
        expect(
          request.queryParameters,
          containsPair("createdBefore", "2026-12-31T16:00:00.000Z"),
        );
      }
    },
  );

  testWidgets("the shared map picker offers all six ranges", (tester) async {
    ReportMapDateRange? selected;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: MapDateRangeFilter(
            value: ReportMapDateRange.last30Days,
            onSelected: (range) => selected = range,
          ),
        ),
      ),
    );
    await tester.tap(find.text("Last 30 Days"));
    await tester.pumpAndSettle();
    for (final range in ReportMapDateRange.values) {
      expect(
        find.widgetWithText(PopupMenuItem<ReportMapDateRange>, range.label),
        findsOneWidget,
      );
    }
    await tester.tap(find.text("Last Year"));
    await tester.pumpAndSettle();
    expect(selected, ReportMapDateRange.lastYear);
  });
}
