// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'schedule_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CleanupSchedule _$CleanupScheduleFromJson(Map<String, dynamic> json) =>
    _CleanupSchedule(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      barangay: json['barangay'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      scheduledAt: DateTime.parse(json['scheduledAt'] as String),
      status: $enumDecode(_$CleanupScheduleStatusEnumMap, json['status']),
      notes: json['notes'] as String?,
      createdById: json['createdById'] as String,
      verifiedById: json['verifiedById'] as String?,
      verifiedAt: json['verifiedAt'] == null
          ? null
          : DateTime.parse(json['verifiedAt'] as String),
      workers:
          (json['workers'] as List<dynamic>?)
              ?.map((e) => ScheduleWorker.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      equipment:
          (json['equipment'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$CleanupScheduleToJson(_CleanupSchedule instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'description': instance.description,
      'barangay': instance.barangay,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'scheduledAt': instance.scheduledAt.toIso8601String(),
      'status': _$CleanupScheduleStatusEnumMap[instance.status]!,
      'notes': instance.notes,
      'createdById': instance.createdById,
      'verifiedById': instance.verifiedById,
      'verifiedAt': instance.verifiedAt?.toIso8601String(),
      'workers': instance.workers,
      'equipment': instance.equipment,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

const _$CleanupScheduleStatusEnumMap = {
  CleanupScheduleStatus.upcoming: 'UPCOMING',
  CleanupScheduleStatus.ongoing: 'ONGOING',
  CleanupScheduleStatus.completed: 'COMPLETED',
  CleanupScheduleStatus.cancelled: 'CANCELLED',
};

_ScheduleWorker _$ScheduleWorkerFromJson(Map<String, dynamic> json) =>
    _ScheduleWorker(
      id: json['id'] as String,
      workerId: json['workerId'] as String,
      worker: ScheduleWorkerUser.fromJson(
        json['worker'] as Map<String, dynamic>,
      ),
      assignedAt: DateTime.parse(json['assignedAt'] as String),
    );

Map<String, dynamic> _$ScheduleWorkerToJson(_ScheduleWorker instance) =>
    <String, dynamic>{
      'id': instance.id,
      'workerId': instance.workerId,
      'worker': instance.worker,
      'assignedAt': instance.assignedAt.toIso8601String(),
    };

_ScheduleWorkerUser _$ScheduleWorkerUserFromJson(Map<String, dynamic> json) =>
    _ScheduleWorkerUser(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
    );

Map<String, dynamic> _$ScheduleWorkerUserToJson(_ScheduleWorkerUser instance) =>
    <String, dynamic>{
      'id': instance.id,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'email': instance.email,
      'phone': instance.phone,
    };
