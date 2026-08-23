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
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 45),
      headers: const {"Content-Type": "application/json"},
    ),
  );

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
