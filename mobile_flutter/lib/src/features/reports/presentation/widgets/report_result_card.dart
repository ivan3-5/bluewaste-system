import "package:flutter/material.dart";

import "../../../../core/theme/app_spacing.dart";
import "../../data/detect_service.dart";

class WasteAnalysisSummary extends StatelessWidget {
  const WasteAnalysisSummary({
    super.key,
    required this.hasWaste,
    required this.severity,
  });

  final bool hasWaste;
  final WasteSeverity severity;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Analysis Summary",
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(hasWaste ? "Waste detected" : "No waste detected"),
        const SizedBox(height: AppSpacing.xs),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text("Severity"),
            Text(hasWaste ? severity.label : "None"),
          ],
        ),
      ],
    );
  }
}

class ReportResultCard extends StatelessWidget {
  const ReportResultCard({
    super.key,
    required this.result,
    required this.onDismiss,
    this.comment = "",
  });

  final DetectResult result;
  final VoidCallback onDismiss;
  final String comment;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            WasteAnalysisSummary(
              hasWaste: result.hasWaste,
              severity: result.severity,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              "Citizen Comment: ${comment.trim().isEmpty ? 'None' : comment.trim()}",
            ),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: onDismiss,
                icon: const Icon(Icons.add_photo_alternate_outlined, size: 18),
                label: const Text("Submit Another Report"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
