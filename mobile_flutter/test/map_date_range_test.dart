import "package:bluewaste_mobile_flutter/src/features/reports/data/report_service.dart";
import "package:bluewaste_mobile_flutter/src/features/reports/domain/report_map_date_range.dart";
import "package:bluewaste_mobile_flutter/src/features/reports/domain/report_models.dart";
import "package:bluewaste_mobile_flutter/src/features/reports/presentation/widgets/map_date_range_filter.dart";
import "package:bluewaste_mobile_flutter/src/core/theme/app_colors.dart";
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

  test("report status colors match the web Waste Map palette", () {
    const expected = {
      "PENDING": Color(0xFFF97316),
      "VERIFIED": Color(0xFF2563EB),
      "CLEANUP_SCHEDULED": Color(0xFF8B5CF6),
      "IN_PROGRESS": Color(0xFFEAB308),
      "CLEANED": Color(0xFF22C55E),
      "REJECTED": Color(0xFFEF4444),
    };

    for (final entry in expected.entries) {
      expect(AppColors.statusColor(entry.key), entry.value);
      expect(AppColors.statusColor(entry.key.toLowerCase()), entry.value);
    }
    expect(AppColors.statusColor("unknown_status"), expected["PENDING"]);
  });

  test("radius group parser keeps backend center, radius and statuses", () {
    final group = RadiusReportGroup.fromJson({
      "id": "group-a",
      "center": {"latitude": 7.31, "longitude": 125.68},
      "radiusMeters": 50,
      "isGrouped": true,
      "reportCount": 2,
      "citizenCount": 2,
      "reports": [
        {
          "id": "report-1",
          "title": "Waste report one",
          "status": "CLEANED",
          "latitude": 7.31,
          "longitude": 125.68,
          "createdAt": "2026-11-01T00:00:00.000Z",
        },
        {
          "id": "report-2",
          "title": "Waste report two",
          "status": "CLEANED",
          "latitude": 7.311,
          "longitude": 125.681,
          "createdAt": "2026-11-01T00:00:00.000Z",
        },
      ],
    });

    expect(group.latitude, 7.31);
    expect(group.longitude, 125.68);
    expect(group.radiusMeters, 50);
    expect(group.isGrouped, isTrue);
    expect(group.statuses, ["CLEANED", "CLEANED"]);
    expect(group.reportCount, 2);
    expect(group.citizenCount, 2);
    expect(group.reports.map((report) => report.id), ["report-1", "report-2"]);
  });

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
                    : options.path.endsWith("/radius-groups")
                    ? {"groups": [], "radiusMeters": 50}
                    : options.path.endsWith("/counts")
                    ? {"PENDING": 0, "CLEANED": 2}
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
      await service.getRadiusGroups(
        dateWindow: range,
        status: "CLEANUP_SCHEDULED",
      );
      final statusCounts = await service.getMapStatusCounts(dateWindow: range);
      await service.getAssignedReports(dateWindow: range);

      expect(requests.map((request) => request.path), [
        "/reports/map",
        "/reports/incidents/map",
        "/reports/radius-groups",
        "/reports/map/counts",
        "/reports/assigned",
      ]);
      expect(statusCounts, {"PENDING": 0, "CLEANED": 2});
      expect(
        requests[2].queryParameters,
        containsPair("status", "CLEANUP_SCHEDULED"),
      );
      for (final request in requests.where(
        (request) => request.path != "/reports/assigned",
      )) {
        expect(
          request.queryParameters,
          containsPair("createdFrom", "2025-12-31T16:00:00.000Z"),
        );
        expect(
          request.queryParameters,
          containsPair("createdBefore", "2026-12-31T16:00:00.000Z"),
        );
      }
      for (final request in requests.where(
        (request) => request.path != "/reports/assigned",
      )) {
        expect(request.headers["Cache-Control"], "no-cache, no-store");
        expect(request.headers["Pragma"], "no-cache");
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
