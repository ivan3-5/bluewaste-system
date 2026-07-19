import "dart:async";

import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:intl/intl.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "../data/report_service.dart";
import "../../../core/network/api_exception.dart";
import "../domain/report_models.dart";

class MyReportsScreen extends ConsumerStatefulWidget {
  const MyReportsScreen({super.key});

  @override
  ConsumerState<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends ConsumerState<MyReportsScreen> {
  final DateFormat _dateFormat = DateFormat("MMM d, yyyy");
  final DateFormat _detailFormat = DateFormat("MMM d, yyyy \u2022 h:mm a");

  List<ReportRecord> _reports = const [];
  bool _loading = true;
  String? _errorMessage;
  String _statusFilter = "";
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadReports();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _loadReports());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadReports() async {
    try {
      final service = ref.read(reportServiceProvider);
      final result = await service.getMyReports(
        page: 1,
        limit: 20,
        status: _statusFilter.isEmpty ? null : _statusFilter,
      );

      if (!mounted) {
        return;
      }
      setState(() {
        _reports = result.data;
        _loading = false;
        _errorMessage = null;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }

      String message;
      if (error is ApiException) {
        message = error.statusCode != null
            ? "${error.message} (HTTP ${error.statusCode})"
            : error.message;
      } else {
        message = error.toString();
      }

      setState(() {
        _loading = false;
        _errorMessage = message;
      });
    }
  }

  void _showReportDetail(ReportRecord report) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _ReportDetailSheet(
        report: report,
        detailFormat: _detailFormat,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final statuses = <DropdownMenuItem<String>>[
      const DropdownMenuItem(value: "", child: Text("All statuses")),
      ...statusLabels.entries.map(
        (entry) => DropdownMenuItem(value: entry.key, child: Text(entry.value)),
      ),
    ];

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.md,
            AppSpacing.sm,
            AppSpacing.md,
            AppSpacing.xs,
          ),
          child: AppSectionCard(
            child: Column(
              children: [
                DropdownButtonFormField<String>(
                  initialValue: _statusFilter,
                  items: statuses,
                  decoration: const InputDecoration(
                    labelText: "Filter by status",
                    prefixIcon: Icon(Icons.filter_list),
                  ),
                  onChanged: (value) {
                    setState(() {
                      _statusFilter = value ?? "";
                      _loading = true;
                    });
                    _loadReports();
                  },
                ),
                const SizedBox(height: AppSpacing.xs),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    "${_reports.length} report(s)",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.mutedForeground,
                        ),
                  ),
                ),
              ],
            ),
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _loadReports,
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage != null
                    ? ListView(
                        children: [
                          const SizedBox(height: 140),
                          AppEmptyState(
                            icon: Icons.cloud_off_outlined,
                            title: "Unable to load your reports",
                            subtitle: _errorMessage!,
                          ),
                        ],
                      )
                    : _reports.isEmpty
                        ? ListView(
                            children: const [
                              SizedBox(height: 140),
                              AppEmptyState(
                                icon: Icons.assignment_outlined,
                                title: "No reports found",
                                subtitle:
                                    "Try changing your filter or create your first report.",
                              ),
                            ],
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.fromLTRB(
                              AppSpacing.md,
                              0,
                              AppSpacing.md,
                              AppSpacing.md,
                            ),
                            itemCount: _reports.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: AppSpacing.xs),
                            itemBuilder: (context, index) {
                              final report = _reports[index];
                              final statusColor =
                                  AppColors.statusColor(report.status);
                              final categoryColor =
                                  AppColors.categoryColor(report.category);

                              return InkWell(
                                borderRadius: BorderRadius.circular(12),
                                onTap: () => _showReportDetail(report),
                                child: Card(
                                  child: Padding(
                                    padding:
                                        const EdgeInsets.all(AppSpacing.md),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                report.title,
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .titleMedium
                                                    ?.copyWith(
                                                        fontWeight:
                                                            FontWeight.w700),
                                              ),
                                            ),
                                            const Icon(
                                              Icons.chevron_right,
                                              size: 18,
                                              color: AppColors.mutedForeground,
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: AppSpacing.xs),
                                        Text(
                                          report.description,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodySmall
                                              ?.copyWith(
                                                color:
                                                    AppColors.mutedForeground,
                                              ),
                                        ),
                                        const SizedBox(height: AppSpacing.sm),
                                        Wrap(
                                          spacing: AppSpacing.xs,
                                          runSpacing: AppSpacing.xs,
                                          children: [
                                            AppStatusPill(
                                              label: statusLabels[
                                                      report.status] ??
                                                  report.status,
                                              color: statusColor,
                                            ),
                                            AppStatusPill(
                                              label: wasteCategoryLabels[
                                                      report.category] ??
                                                  report.category,
                                              color: categoryColor,
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: AppSpacing.sm),
                                        Text(
                                          "Created ${_dateFormat.format(report.createdAt)}",
                                          style: Theme.of(context)
                                              .textTheme
                                              .labelSmall
                                              ?.copyWith(
                                                color:
                                                    AppColors.mutedForeground,
                                              ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Detail Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────

class _ReportDetailSheet extends StatelessWidget {
  const _ReportDetailSheet({
    required this.report,
    required this.detailFormat,
  });

  final ReportRecord report;
  final DateFormat detailFormat;

  @override
  Widget build(BuildContext context) {
    final statusColor = AppColors.statusColor(report.status);
    final categoryColor = AppColors.categoryColor(report.category);
    final reportImages =
        report.images.where((i) => i.type == "REPORT").toList();
    final cleanupImages =
        report.images.where((i) => i.type == "CLEANUP").toList();

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Drag handle
              Container(
                margin: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    0,
                    AppSpacing.md,
                    AppSpacing.xxl,
                  ),
                  children: [
                    // Title
                    Text(
                      report.title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.4,
                          ),
                    ),
                    const SizedBox(height: AppSpacing.sm),

                    // Status / category / severity badges
                    Wrap(
                      spacing: AppSpacing.xs,
                      runSpacing: AppSpacing.xs,
                      children: [
                        AppStatusPill(
                          label:
                              statusLabels[report.status] ?? report.status,
                          color: statusColor,
                        ),
                        AppStatusPill(
                          label: wasteCategoryLabels[report.category] ??
                              report.category,
                          color: categoryColor,
                        ),
                        if (report.severity != null)
                          AppStatusPill(
                            label: report.severity!,
                            color: report.severity == "CRITICAL"
                                ? AppColors.destructive
                                : report.severity == "HIGH"
                                    ? AppColors.warning
                                    : AppColors.mutedForeground,
                          ),
                        if (report.isAnonymous)
                          const AppStatusPill(
                            label: "Anonymous",
                            color: AppColors.mutedForeground,
                          ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Description
                    Text(
                      "Description",
                      style: Theme.of(context)
                          .textTheme
                          .labelMedium
                          ?.copyWith(color: AppColors.mutedForeground),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      report.description,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Address
                    if ((report.address ?? "").isNotEmpty) ...[
                      Text(
                        "Location",
                        style: Theme.of(context)
                            .textTheme
                            .labelMedium
                            ?.copyWith(color: AppColors.mutedForeground),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.location_on_outlined,
                              size: 16, color: AppColors.mutedForeground),
                          const SizedBox(width: AppSpacing.xs),
                          Expanded(
                            child: Text(
                              report.address!,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),
                    ],

                    // Coordinates
                    Row(
                      children: [
                        const Icon(Icons.my_location_outlined,
                            size: 14, color: AppColors.mutedForeground),
                        const SizedBox(width: AppSpacing.xs),
                        Text(
                          "${report.latitude.toStringAsFixed(5)}, "
                          "${report.longitude.toStringAsFixed(5)}",
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.mutedForeground,
                              ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Timestamps
                    _DetailRow(
                      icon: Icons.calendar_today_outlined,
                      label: "Submitted",
                      value: detailFormat.format(report.createdAt),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    _DetailRow(
                      icon: Icons.update_outlined,
                      label: "Last updated",
                      value: detailFormat.format(report.updatedAt),
                    ),

                    // AI confidence
                    if (report.analysisConfidence != null) ...[
                      const SizedBox(height: AppSpacing.xs),
                      _DetailRow(
                        icon: Icons.psychology_outlined,
                        label: "AI confidence",
                        value:
                            "${(report.analysisConfidence! * 100).toStringAsFixed(1)}%",
                      ),
                    ],

                    // Report photos
                    if (reportImages.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.lg),
                      Text(
                        "Report Photos (${reportImages.length})",
                        style: Theme.of(context)
                            .textTheme
                            .labelMedium
                            ?.copyWith(color: AppColors.mutedForeground),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      SizedBox(
                        height: 140,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: reportImages.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: AppSpacing.xs),
                          itemBuilder: (_, i) => ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.network(
                              reportImages[i].imageUrl,
                              width: 140,
                              height: 140,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                width: 140,
                                height: 140,
                                color: AppColors.secondary,
                                child: const Icon(Icons.broken_image,
                                    color: AppColors.mutedForeground),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],

                    // Cleanup photos
                    if (cleanupImages.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.md),
                      Text(
                        "Cleanup Photos (${cleanupImages.length})",
                        style: Theme.of(context)
                            .textTheme
                            .labelMedium
                            ?.copyWith(color: AppColors.success),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      SizedBox(
                        height: 140,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: cleanupImages.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: AppSpacing.xs),
                          itemBuilder: (_, i) => ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.network(
                              cleanupImages[i].imageUrl,
                              width: 140,
                              height: 140,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                width: 140,
                                height: 140,
                                color: AppColors.secondary,
                                child: const Icon(Icons.broken_image,
                                    color: AppColors.mutedForeground),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared detail row widget
// ─────────────────────────────────────────────────────────────────────────────

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: AppColors.mutedForeground),
        const SizedBox(width: AppSpacing.xs),
        Text(
          "$label: ",
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(color: AppColors.mutedForeground),
        ),
        Expanded(
          child: Text(
            value,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }
}
