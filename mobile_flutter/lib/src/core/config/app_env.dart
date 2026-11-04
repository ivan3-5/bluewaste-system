class AppEnv {
  static const String apiBaseUrl = String.fromEnvironment(
    "API_BASE_URL",
    // Default to the production Vercel deployment. Override with
    // `--dart-define=API_BASE_URL=<url>` for local development/emulator.
    defaultValue: "https://bluewaste-system-project.vercel.app/api",
  );

  /// URL of the web analysis API, which may be separate from the backend API.
  static const String analysisApiBaseUrl = String.fromEnvironment(
    "ANALYSIS_API_BASE_URL",
    defaultValue: apiBaseUrl,
  );

  /// Use server-side analysis instead of on-device TFLite. The server selects
  /// Gemini or hosted YOLO with its own USE_GEMINI environment variable.
  /// Enable with `flutter run --dart-define=USE_GEMINI=true`.
  static const bool useGemini = bool.fromEnvironment("USE_GEMINI");
}
