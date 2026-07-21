import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "config/app_env.dart";
import "../features/reports/data/detect_service.dart";
import "storage/session_storage.dart";

final sessionStorageProvider = Provider<SessionStorage>((ref) {
  return SessionStorage();
});

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(sessionStorageProvider);

  final dio = Dio(
    BaseOptions(
      baseUrl: AppEnv.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 60),
      sendTimeout: const Duration(seconds: 60),
      headers: const {"Content-Type": "application/json"},
    ),
  );

  // Debug log: show which API base URL the app is using on device.
  // This helps verify the installed app was built with the expected API URL.
  // Remove this in production.
  try {
    // ignore: avoid_print
    print("[DEBUG] AppEnv.apiBaseUrl = ${AppEnv.apiBaseUrl}");
  } catch (_) {}

  dio.interceptors.add(
    QueuedInterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.readToken();
        if (token != null && token.isNotEmpty) {
          options.headers["Authorization"] = "Bearer $token";
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await storage.clearSession();
        }
        handler.next(error);
      },
    ),
  );

  return dio;
});

final detectServiceProvider = Provider<DetectService>((ref) {
  return DetectService(ref.watch(dioProvider));
});
