import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "package:hive_flutter/hive_flutter.dart";

import "src/app.dart";
import "src/features/auth/presentation/auth_controller.dart";
import "src/features/reports/data/offline_service.dart";

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  await Hive.openBox<String>("offline_reports");
  final container = ProviderContainer();
  final offlineService = container.read(offlineServiceProvider);
  offlineService.startSyncListener();
  container.listen(authControllerProvider, (previous, next) {
    if (next.isAuthenticated && !(previous?.isAuthenticated ?? false)) {
      offlineService.syncOfflineReports();
    }
  });

  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const BlueWasteApp(),
    ),
  );
}
