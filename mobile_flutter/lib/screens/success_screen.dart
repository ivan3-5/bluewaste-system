import "package:flutter/material.dart";

import "camera_screen.dart";
import "../models/report.dart";

class SuccessScreen extends StatelessWidget {
  const SuccessScreen({super.key, required this.report});

  final Report report;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.verified_rounded,
                      size: 88, color: Colors.green),
                  const SizedBox(height: 16),
                  Text(
                    "Report submitted successfully",
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Category: ${report.category}\nLocation: ${report.locationName}",
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: () {
                      Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute<void>(
                          builder: (_) => const CameraScreen(),
                        ),
                        (route) => false,
                      );
                    },
                    child: const Text("Report Another"),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
