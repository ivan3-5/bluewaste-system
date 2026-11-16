import "package:flutter/material.dart";

import "../../../../core/theme/app_colors.dart";
import "../../domain/report_map_date_range.dart";

class MapDateRangeFilter extends StatelessWidget {
  const MapDateRangeFilter({
    super.key,
    required this.value,
    required this.onSelected,
    this.enabled = true,
  });

  final ReportMapDateRange value;
  final ValueChanged<ReportMapDateRange> onSelected;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<ReportMapDateRange>(
      initialValue: value,
      enabled: enabled,
      tooltip: "Filter map by date range",
      onSelected: onSelected,
      itemBuilder: (context) => [
        for (final range in ReportMapDateRange.values)
          PopupMenuItem(value: range, child: Text(range.label)),
      ],
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: AppColors.secondary,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.date_range_outlined,
              size: 15,
              color: AppColors.primary,
            ),
            const SizedBox(width: 6),
            Text(
              value.label,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.foreground,
              ),
            ),
            const Icon(Icons.arrow_drop_down, size: 18),
          ],
        ),
      ),
    );
  }
}
