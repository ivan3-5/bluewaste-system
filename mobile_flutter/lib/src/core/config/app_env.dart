class AppEnv {
  static const String apiBaseUrl = String.fromEnvironment(
    "API_BASE_URL",
    // Default to the production Vercel deployment. Override with
    // `--dart-define=API_BASE_URL=<url>` for local development/emulator.
    defaultValue: "https://bluewaste-management-system.vercel.app/api",
  );

  /// Base URL of the FastAPI YOLOv8 detection server.
  ///
  /// Override at build time:
  ///   Android emulator → default (10.0.2.2 routes to host machine localhost)
  ///   Physical device  → --dart-define=YOLO_BASE_URL=http://192.168.x.x:8000
  static const String yoloBaseUrl = String.fromEnvironment(
    "YOLO_BASE_URL",
    defaultValue: "https://bluewaste-system.onrender.com",
  );
}
