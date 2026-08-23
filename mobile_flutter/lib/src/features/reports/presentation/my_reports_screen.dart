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

IconData _getStatusIcon(String status) {
  switch (status) {
    case "CLEANED":
      return Icons.check_circle_rounded;
    case "IN_PROGRESS":
      return Icons.sync_rounded;
    case "VERIFIED":
      return Icons.verified_rounded;
    case "CLEANUP_SCHEDULED":
      return Icons.event_available_rounded;
    case "REJECTED":
      return Icons.cancel_rounded;
    default:
      return Icons.hourglass_top_rounded;
  }
}

IconData _getCategoryIcon(String category) {
  switch (category) {
    case "PLASTIC_WASTE":
    case "plastic_bottle":
    case "plastic_bag":
    case "with_waste":
      return Icons.recycling_rounded;
    case "ORGANIC_WASTE":
      return Icons.eco_outlined;
    case "GLASS_WASTE":
    case "glass":
      return Icons.wine_bar_outlined;
    case "METAL_WASTE":
    case "can":
      return Icons.build_circle_outlined;
    case "PAPER_WASTE":
      return Icons.description_outlined;
    case "no_waste":
      return Icons.task_alt_rounded;
    default:
      return Icons.delete_outline_rounded;
  }
}

class MyReportsScreen extends ConsumerStatefulWidget {
  const MyReportsScreen({super.key});

  @override
  ConsumerState<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends ConsumerState<MyReportsScreen>
    with WidgetsBindingObserver {
  final DateFormat _dateFormat = DateFormat("MMM d, yyyy");
  final DateFormat _detailFormat = DateFormat("MMM d, yyyy \u2022 h:mm a");

  List<ReportRecord> _reports = const [];
  bool _loading = true;
  String? _errorMessage;
  String _statusFilter = "";
  Timer? _timer;

  static const List<Map<String, String>> _filterOptions = [
    {"value": "", "label": "All"},
    {"value": "PENDING", "label": "Pending"},
    {"value": "IN_PROGRESS", "label": "In Progress"},
    {"value": "CLEANUP_SCHEDULED", "label": "Scheduled"},
    {"value": "CLEANED", "label": "Cleaned"},
    {"value": "VERIFIED", "label": "Verified"},
    {"value": "REJECTED", "label": "Rejected"},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadReports();
    _startPolling();
  }

  void _startPolling() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _loadReports());
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _loadReports();
      _startPolling();
    } else if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.hidden) {
      _timer?.cancel();
      _timer = null;
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
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

      // Data-diff guard: skip setState when nothing changed to avoid
      // rebuilding the entire list on every poll.
      final newData = result.data;
      final same = newData.length == _reports.length &&
          !_loading &&
          _errorMessage == null &&
          (newData.isEmpty ||
              newData.first.id == _reports.first.id &&
                  newData.last.id == _reports.last.id);
      if (same) return;

      setState(() {
        _reports = newData;
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: AppSpacing.sm),
        // Filter Chips Horizontal Scroll View
        SizedBox(
          height: 38,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            itemCount: _filterOptions.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final option = _filterOptions[index];
              final isSelected = _statusFilter == option["value"];

              return FilterChip(
                label: Text(option["label"]!),
                selected: isSelected,
                showCheckmark: false,
                avatar: isSelected
                    ? const Icon(Icons.check_rounded, size: 14, color: Colors.white)
                    : null,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : AppColors.foreground,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  fontSize: 13,
                ),
                selectedColor: AppColors.primary,
                backgroundColor: AppColors.secondary.withValues(alpha: 0.8),
                side: BorderSide(
                  color: isSelected
                      ? AppColors.primary
                      : AppColors.border.withValues(alpha: 0.8),
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                onSelected: (selected) {
                  if (selected) {
                    setState(() {
                      _statusFilter = option["value"]!;
                      _loading = true;
                    });
                    _loadReports();
                  }
                },
              );
            },
          ),
        ),
        const SizedBox(height: AppSpacing.xs),

        // Subheader count & status text
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.md,
            AppSpacing.xs,
            AppSpacing.md,
            AppSpacing.xs,
          ),
          child: Row(
            children: [
              Text(
                _statusFilter.isEmpty
                    ? "All Reports"
                    : "${statusLabels[_statusFilter] ?? _statusFilter} Reports",
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground,
                    ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  "${_reports.length}",
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ),
              const Spacer(),
              if (_loading)
                const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                  ),
                )
              else
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      "Live updates",
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppColors.mutedForeground,
                            fontSize: 11,
                          ),
                    ),
                  ],
                ),
            ],
          ),
        ),

        // Main Content Area
        Expanded(
          child: RefreshIndicator(
            onRefresh: _loadReports,
            child: _loading && _reports.isEmpty
                ? ListView.separated(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.xs,
                    ),
                    itemCount: 5,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpacing.xs),
                    itemBuilder: (_, __) => const _ReportCardSkeleton(),
                  )
                : _errorMessage != null
                    ? ListView(
                        children: [
                          const SizedBox(height: 100),
                          AppEmptyState(
                            icon: Icons.cloud_off_outlined,
                            title: "Unable to load reports",
                            subtitle: _errorMessage!,
                            action: OutlinedButton.icon(
                              onPressed: () {
                                setState(() {
                                  _loading = true;
                                });
                                _loadReports();
                              },
                              icon: const Icon(Icons.refresh_rounded, size: 16),
                              label: const Text("Retry"),
                            ),
                          ),
                        ],
                      )
                    : _reports.isEmpty
                        ? ListView(
                            children: [
                              const SizedBox(height: 100),
                              AppEmptyState(
                                icon: Icons.assignment_outlined,
                                title: _statusFilter.isEmpty
                                    ? "No reports submitted yet"
                                    : "No ${_statusFilter.toLowerCase().replaceAll('_', ' ')} reports",
                                subtitle: _statusFilter.isEmpty
                                    ? "Create your first report to start tracking waste cleanup."
                                    : "Try changing your status filter to see other reports.",
                                action: _statusFilter.isNotEmpty
                                    ? OutlinedButton.icon(
                                        onPressed: () {
                                          setState(() {
                                            _statusFilter = "";
                                            _loading = true;
                                          });
                                          _loadReports();
                                        },
                                        icon: const Icon(
                                          Icons.filter_alt_off_outlined,
                                          size: 16,
                                        ),
                                        label: const Text("Clear Status Filter"),
                                      )
                                    : null,
                              ),
                            ],
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.fromLTRB(
                              AppSpacing.md,
                              AppSpacing.xs,
                              AppSpacing.md,
                              AppSpacing.md,
                            ),
                            itemCount: _reports.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: AppSpacing.xs),
                            itemBuilder: (context, index) {
                              final report = _reports[index];
                              return _ReportCardItem(
                                report: report,
                                dateFormat: _dateFormat,
                                onTap: () => _showReportDetail(report),
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
// Report Card Item Component
// ─────────────────────────────────────────────────────────────────────────────

class _ReportCardItem extends StatelessWidget {
  const _ReportCardItem({
    required this.report,
    required this.dateFormat,
    required this.onTap,
  });

  final ReportRecord report;
  final DateFormat dateFormat;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final statusColor = AppColors.statusColor(report.status);
    final categoryColor = AppColors.categoryColor(report.category);
    final reportImages =
        report.images.where((i) => i.type == "REPORT").toList();
    final hasImage = reportImages.isNotEmpty;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.8)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Thumbnail preview or category avatar icon
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: SizedBox(
                    width: 76,
                    height: 76,
                    child: hasImage
                        ? Image.network(
                            reportImages.first.imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              color: AppColors.tint(categoryColor, opacity: 0.12),
                              child: Icon(
                                _getCategoryIcon(report.category),
                                color: categoryColor,
                                size: 30,
                              ),
                            ),
                          )
                        : Container(
                            color: AppColors.tint(categoryColor, opacity: 0.12),
                            child: Icon(
                              _getCategoryIcon(report.category),
                              color: categoryColor,
                              size: 32,
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 12),

                // Main metadata details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top Row: Status & Category Badges + Chevron
                      Row(
                        children: [
                          Expanded(
                            child: SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: [
                                  AppStatusPill(
                                    label: statusLabels[report.status] ??
                                        report.status,
                                    color: statusColor,
                                    icon: _getStatusIcon(report.status),
                                  ),
                                  if (report.category != "with_waste") ...[
                                    const SizedBox(width: 6),
                                    AppStatusPill(
                                      label: wasteCategoryLabels[
                                              report.category] ??
                                          report.category,
                                      color: categoryColor,
                                    ),
                                  ],
                                  if (report.severity == "CRITICAL" ||
                                      report.severity == "HIGH") ...[
                                    const SizedBox(width: 6),
                                    AppStatusPill(
                                      label: report.severity!,
                                      color: report.severity == "CRITICAL"
                                          ? AppColors.destructive
                                          : AppColors.warning,
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                          const Icon(
                            Icons.chevron_right_rounded,
                            size: 20,
                            color: AppColors.mutedForeground,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),

                      // Report Title
                      Text(
                        report.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              letterSpacing: -0.2,
                            ),
                      ),
                      const SizedBox(height: 2),

                      // Description snippet
                      Text(
                        report.displayDescription,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.mutedForeground,
                              height: 1.25,
                              fontSize: 12,
                            ),
                      ),
                      const SizedBox(height: 8),

                      // Location & Date Row
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            size: 13,
                            color: AppColors.mutedForeground,
                          ),
                          const SizedBox(width: 3),
                          Expanded(
                            child: Text(
                              (report.address != null &&
                                      report.address!.isNotEmpty)
                                  ? report.address!
                                  : "${report.latitude.toStringAsFixed(4)}, ${report.longitude.toStringAsFixed(4)}",
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .labelSmall
                                  ?.copyWith(
                                    color: AppColors.mutedForeground,
                                    fontSize: 11,
                                  ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(
                            Icons.calendar_today_outlined,
                            size: 12,
                            color: AppColors.mutedForeground,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            dateFormat.format(report.createdAt),
                            style: Theme.of(context)
                                .textTheme
                                .labelSmall
                                ?.copyWith(
                                  color: AppColors.mutedForeground,
                                  fontSize: 11,
                                ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Shimmer Loading Placeholder Widget
// ─────────────────────────────────────────────────────────────────────────────

class _ReportCardSkeleton extends StatelessWidget {
  const _ReportCardSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 104,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.6)),
      ),
      child: Row(
        children: [
          Container(
            width: 76,
            height: 76,
            decoration: BoxDecoration(
              color: AppColors.muted.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  children: [
                    Container(
                      width: 65,
                      height: 18,
                      decoration: BoxDecoration(
                        color: AppColors.muted.withValues(alpha: 0.7),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      width: 75,
                      height: 18,
                      decoration: BoxDecoration(
                        color: AppColors.muted.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  width: double.infinity,
                  height: 14,
                  decoration: BoxDecoration(
                    color: AppColors.muted.withValues(alpha: 0.8),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  width: 140,
                  height: 12,
                  decoration: BoxDecoration(
                    color: AppColors.muted.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
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

  void _showImagePreview(BuildContext context, String url) {
    showDialog<void>(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(12),
        child: Stack(
          alignment: Alignment.topRight,
          children: [
            InteractiveViewer(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(url, fit: BoxFit.contain),
              ),
            ),
            IconButton(
              onPressed: () => Navigator.of(ctx).pop(),
              icon: const Icon(Icons.close, color: Colors.white, size: 28),
              style: IconButton.styleFrom(
                backgroundColor: Colors.black54,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = AppColors.statusColor(report.status);
    final categoryColor = AppColors.categoryColor(report.category);
    final reportImages =
        report.images.where((i) => i.type == "REPORT").toList();
    final cleanupImages =
        report.images.where((i) => i.type == "CLEANUP").toList();

    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Sheet Drag Handle
              Container(
                margin: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                width: 44,
                height: 5,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2.5),
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
                    // Status, category & severity pill row
                    Wrap(
                      spacing: AppSpacing.xs,
                      runSpacing: AppSpacing.xs,
                      children: [
                        AppStatusPill(
                          label:
                              statusLabels[report.status] ?? report.status,
                          color: statusColor,
                          icon: _getStatusIcon(report.status),
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
                            icon: Icons.visibility_off_outlined,
                          ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),

                    // Report Title
                    Text(
                      report.title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.4,
                          ),
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Description Section Card
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "ANALYSIS DETAILS",
                            style: Theme.of(context)
                                .textTheme
                                .labelSmall
                                ?.copyWith(
                                  color: AppColors.mutedForeground,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          Text(
                            report.displayDescription,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  height: 1.4,
                                ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Location Card
                    if ((report.address ?? "").isNotEmpty ||
                        report.latitude != 0) ...[
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.location_on,
                                    size: 18, color: AppColors.primary),
                                const SizedBox(width: AppSpacing.xs),
                                Text(
                                  "Location Details",
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleSmall
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            if ((report.address ?? "").isNotEmpty) ...[
                              const SizedBox(height: AppSpacing.xs),
                              Text(
                                report.address!,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                            const SizedBox(height: AppSpacing.xs),
                            Row(
                              children: [
                                const Icon(Icons.my_location_outlined,
                                    size: 14, color: AppColors.mutedForeground),
                                const SizedBox(width: AppSpacing.xs),
                                Text(
                                  "${report.latitude.toStringAsFixed(5)}, "
                                  "${report.longitude.toStringAsFixed(5)}",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: AppColors.mutedForeground,
                                      ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                    ],

                    // Timestamps & Metadata
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.card,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        children: [
                          _DetailRow(
                            icon: Icons.calendar_today_outlined,
                            label: "Submitted",
                            value: detailFormat.format(report.createdAt),
                          ),
                          const Divider(height: AppSpacing.md),
                          _DetailRow(
                            icon: Icons.update_outlined,
                            label: "Last updated",
                            value: detailFormat.format(report.updatedAt),
                          ),
                          if (report.analysisConfidence != null) ...[
                            const Divider(height: AppSpacing.md),
                            _DetailRow(
                              icon: Icons.psychology_outlined,
                              label: "AI Confidence",
                              value:
                                  "${(report.analysisConfidence! * 100).toStringAsFixed(1)}%",
                            ),
                          ],
                        ],
                      ),
                    ),

                    // Report photos section
                    if (reportImages.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.lg),
                      Row(
                        children: [
                          const Icon(Icons.photo_library_outlined,
                              size: 18, color: AppColors.foreground),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            "Report Photos (${reportImages.length})",
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      SizedBox(
                        height: 130,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: reportImages.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: AppSpacing.xs),
                          itemBuilder: (_, i) => GestureDetector(
                            onTap: () => _showImagePreview(
                                context, reportImages[i].imageUrl),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                reportImages[i].imageUrl,
                                width: 130,
                                height: 130,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  width: 130,
                                  height: 130,
                                  color: AppColors.secondary,
                                  child: const Icon(Icons.broken_image,
                                      color: AppColors.mutedForeground),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],

                    // Cleanup photos section
                    if (cleanupImages.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.lg),
                      Row(
                        children: [
                          const Icon(Icons.task_alt_rounded,
                              size: 18, color: AppColors.success),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            "Cleanup Proof Photos (${cleanupImages.length})",
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.success,
                                ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      SizedBox(
                        height: 130,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: cleanupImages.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: AppSpacing.xs),
                          itemBuilder: (_, i) => GestureDetector(
                            onTap: () => _showImagePreview(
                                context, cleanupImages[i].imageUrl),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                cleanupImages[i].imageUrl,
                                width: 130,
                                height: 130,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  width: 130,
                                  height: 130,
                                  color: AppColors.secondary,
                                  child: const Icon(Icons.broken_image,
                                      color: AppColors.mutedForeground),
                                ),
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
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(icon, size: 16, color: AppColors.mutedForeground),
        const SizedBox(width: AppSpacing.xs),
        Text(
          label,
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(color: AppColors.mutedForeground),
        ),
        const Spacer(),
        Text(
          value,
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
