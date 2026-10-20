class AppEnv {
  static const String apiBaseUrl = String.fromEnvironment(
    "API_BASE_URL",
    // Default to the production Vercel deployment. Override with
    // `--dart-define=API_BASE_URL=<url>` for local development/emulator.
    defaultValue: "https://bluewaste-system-project.vercel.app/api",
  );

  /// Analyze photos with Gemini (server-side) instead of on-device TFLite.
  /// Enable with `flutter run --dart-define=USE_GEMINI=true`.
  static const bool useGemini = bool.fromEnvironment("USE_GEMINI");
}
