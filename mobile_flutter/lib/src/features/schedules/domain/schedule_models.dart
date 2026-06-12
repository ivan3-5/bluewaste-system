import 'package:freezed_annotation/freezed_annotation.dart';

part 'schedule_models.freezed.dart';
part 'schedule_models.g.dart';

enum CleanupScheduleStatus {
  @JsonValue('UPCOMING')
  upcoming,
  @JsonValue('ONGOING')
  ongoing,
  @JsonValue('COMPLETED')
  completed,
  @JsonValue('CANCELLED')
  cancelled,
}

@freezed
class CleanupSchedule with _$CleanupSchedule {
  const factory CleanupSchedule({
    required String id,
    required String title,
    required String description,
    required String barangay,
    required double latitude,
    required double longitude,
    required DateTime scheduledAt,
    required CleanupScheduleStatus status,
    String? notes,
    required String createdById,
    String? verifiedById,
    DateTime? verifiedAt,
    @Default([]) List<ScheduleWorker> workers,
    @Default([]) List<String> equipment,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _CleanupSchedule;

  factory CleanupSchedule.fromJson(Map<String, dynamic> json) =>
      _$CleanupScheduleFromJson(json);
}

@freezed
class ScheduleWorker with _$ScheduleWorker {
  const factory ScheduleWorker({
    required String id,
    required String workerId,
    required ScheduleWorkerUser worker,
    required DateTime assignedAt,
  }) = _ScheduleWorker;

  factory ScheduleWorker.fromJson(Map<String, dynamic> json) =>
      _$ScheduleWorkerFromJson(json);
}

@freezed
class ScheduleWorkerUser with _$ScheduleWorkerUser {
  const factory ScheduleWorkerUser({
    required String id,
    required String firstName,
    required String lastName,
    String? email,
    String? phone,
  }) = _ScheduleWorkerUser;

  factory ScheduleWorkerUser.fromJson(Map<String, dynamic> json) =>
      _$ScheduleWorkerUserFromJson(json);
}
