import "package:flutter/material.dart";

import "../../../../core/theme/app_colors.dart";
import "../../../../core/theme/app_spacing.dart";
import "../../data/detect_service.dart";

/// Displayed after a successful report submission or detection analysis.
/// Shows:
///   • Waste detected / No waste badge
///   • Severity badge (color-coded)
///   • Confidence percentage + bar
///   • Detected waste labels
///   • "Submit Another Report" dismiss button
class ReportResultCard extends StatelessWidget {
  const ReportResultCard({
    super.key,
    required this.result,
    required this.onDismiss,
  });

  final DetectResult result;
  final VoidCallback onDismiss;

  Color _severityColor() {
    switch (result.severity) {
      case WasteSeverity.critical:
        return const Color(0xFFE74C3C);
      case WasteSeverity.high:
        return const Color(0xFFE67E22);
      case WasteSeverity.moderate:
        return const Color(0xFFF1C40F);
      case WasteSeverity.spam:
        return const Color(0xFF95A5A6);
      default:
        return const Color(0xFF7F8C8D);
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _severityColor();
    final confidencePct = (result.confidence * 100).clamp(0.0, 100.0);

    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: color.withValues(alpha: 0.5), width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ─ Header row ──────────────────────────────────────────────────
            Row(
              children: [
                Icon(
                  result.hasWaste
                      ? Icons.check_circle_rounded
                      : Icons.cancel_rounded,
                  color: result.hasWaste
                      ? const Color(0xFF27AE60)
                      : const Color(0xFFE74C3C),
                  size: 22,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    result.hasWaste ? "Waste Detected" : "No Waste Detected",
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                ),
                // Severity badge
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: color.withValues(alpha: 0.5)),
                  ),
                  child: Text(
                    result.severity.label,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: color,
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),

            // ─ Confidence bar ──────────────────────────────────────────────
            Row(
              children: [
                Text(
                  "Confidence",
                  style: Theme.of(context)
                      .textTheme
                      .labelMedium
                      ?.copyWith(color: Colors.grey[600]),
                ),
                const Spacer(),
                Text(
                  "${confidencePct.toStringAsFixed(1)}%",
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: color,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: confidencePct / 100,
                minHeight: 8,
                backgroundColor: color.withValues(alpha: 0.15),
                valueColor: AlwaysStoppedAnimation<Color>(color),
              ),
            ),
            const SizedBox(height: 6),

            // ─ Severity description ────────────────────────────────────────
            Text(
              result.severity.description,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: Colors.grey[600]),
            ),

            // ─ Detected labels ─────────────────────────────────────────────
            if (result.labels.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.sm),
              Text(
                "Detected Labels",
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: result.labels.map((lbl) {
                  final pct = (lbl.confidence * 100);
                  return Chip(
                    label: Text(
                      "${lbl.label}  ${pct.toStringAsFixed(0)}%",
                      style: const TextStyle(fontSize: 11),
                    ),
                    backgroundColor:
                        AppColors.primary.withValues(alpha: 0.1),
                    side: BorderSide(
                        color: AppColors.primary.withValues(alpha: 0.3)),
                    labelPadding: const EdgeInsets.symmetric(horizontal: 4),
                    visualDensity: VisualDensity.compact,
                  );
                }).toList(),
              ),
            ],

            const SizedBox(height: AppSpacing.md),

            // ─ Dismiss / submit another ────────────────────────────────────
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: onDismiss,
                icon: const Icon(Icons.add_photo_alternate_outlined,
                    size: 18),
                label: const Text("Submit Another Report"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
