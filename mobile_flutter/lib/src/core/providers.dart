import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "config/app_env.dart";
import "../features/reports/data/detect_service.dart";
import "storage/session_storage.dart";

final sessionStorageProvider = Provider<SessionStorage>((ref) {
  return SessionStorage();
});

/// Incremented when the server rejects the refresh token and the session is cleared.
final sessionExpiredProvider = StateProvider<int>((ref) => 0);

const _authPaths = ["/auth/login", "/auth/register", "/auth/refresh"];

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(sessionStorageProvider);

  BaseOptions buildOptions() => BaseOptions(
    baseUrl: AppEnv.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 30),
    sendTimeout: const Duration(seconds: 45),
    headers: const {"Content-Type": "application/json"},
  );

  final dio = Dio(buildOptions());
  // No interceptors: used for refresh and replay so the queued onError below cannot deadlock.
  final plainDio = Dio(buildOptions());

  /// New access token, or null if the refresh token is missing or rejected.
  /// Network/server failures rethrow so the session is kept.
  Future<String?> refreshAccessToken() async {
    final refreshToken = await storage.readRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) return null;
    try {
      final response = await plainDio.post<Map<String, dynamic>>(
        "/auth/refresh",
        options: Options(headers: {"Cookie": "refresh_token=$refreshToken"}),
      );
      final token = response.data?["token"]?.toString();
      if (token == null || token.isEmpty) return null;
      await storage.writeToken(token);
      return token;
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      if (status == 401 || status == 403) return null;
      rethrow;
    }
  }

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
        final request = error.requestOptions;
        if (error.response?.statusCode != 401 ||
            _authPaths.any(request.path.startsWith)) {
          handler.next(error);
          return;
        }

        try {
          final sentToken = request.headers["Authorization"]
              ?.toString()
              .replaceFirst("Bearer ", "");
          var token = await storage.readToken();
          // A queued request may already have refreshed the token.
          if (token == null || token == sentToken) {
            token = await refreshAccessToken();
          }

          if (token == null) {
            await storage.clearSession();
            ref.read(sessionExpiredProvider.notifier).state++;
            handler.next(error);
            return;
          }

          request.headers["Authorization"] = "Bearer $token";
          final data = request.data;
          if (data is FormData) request.data = data.clone();
          handler.resolve(await plainDio.fetch<dynamic>(request));
        } on DioException catch (retryError) {
          handler.next(retryError);
        }
      },
    ),
  );

  return dio;
});

final detectServiceProvider = Provider<DetectService>((ref) {
  return DetectService();
});
