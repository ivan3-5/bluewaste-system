// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'schedule_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CleanupSchedule {

 String get id; String get title; String get description; String get barangay; double get latitude; double get longitude; DateTime get scheduledAt; CleanupScheduleStatus get status; String? get notes; String get createdById; String? get verifiedById; DateTime? get verifiedAt; List<ScheduleWorker> get workers; List<String> get equipment; DateTime get createdAt; DateTime get updatedAt;
/// Create a copy of CleanupSchedule
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CleanupScheduleCopyWith<CleanupSchedule> get copyWith => _$CleanupScheduleCopyWithImpl<CleanupSchedule>(this as CleanupSchedule, _$identity);

  /// Serializes this CleanupSchedule to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CleanupSchedule&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.description, description) || other.description == description)&&(identical(other.barangay, barangay) || other.barangay == barangay)&&(identical(other.latitude, latitude) || other.latitude == latitude)&&(identical(other.longitude, longitude) || other.longitude == longitude)&&(identical(other.scheduledAt, scheduledAt) || other.scheduledAt == scheduledAt)&&(identical(other.status, status) || other.status == status)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.createdById, createdById) || other.createdById == createdById)&&(identical(other.verifiedById, verifiedById) || other.verifiedById == verifiedById)&&(identical(other.verifiedAt, verifiedAt) || other.verifiedAt == verifiedAt)&&const DeepCollectionEquality().equals(other.workers, workers)&&const DeepCollectionEquality().equals(other.equipment, equipment)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,title,description,barangay,latitude,longitude,scheduledAt,status,notes,createdById,verifiedById,verifiedAt,const DeepCollectionEquality().hash(workers),const DeepCollectionEquality().hash(equipment),createdAt,updatedAt);

@override
String toString() {
  return 'CleanupSchedule(id: $id, title: $title, description: $description, barangay: $barangay, latitude: $latitude, longitude: $longitude, scheduledAt: $scheduledAt, status: $status, notes: $notes, createdById: $createdById, verifiedById: $verifiedById, verifiedAt: $verifiedAt, workers: $workers, equipment: $equipment, createdAt: $createdAt, updatedAt: $updatedAt)';
}


}

/// @nodoc
abstract mixin class $CleanupScheduleCopyWith<$Res>  {
  factory $CleanupScheduleCopyWith(CleanupSchedule value, $Res Function(CleanupSchedule) _then) = _$CleanupScheduleCopyWithImpl;
@useResult
$Res call({
 String id, String title, String description, String barangay, double latitude, double longitude, DateTime scheduledAt, CleanupScheduleStatus status, String? notes, String createdById, String? verifiedById, DateTime? verifiedAt, List<ScheduleWorker> workers, List<String> equipment, DateTime createdAt, DateTime updatedAt
});




}
/// @nodoc
class _$CleanupScheduleCopyWithImpl<$Res>
    implements $CleanupScheduleCopyWith<$Res> {
  _$CleanupScheduleCopyWithImpl(this._self, this._then);

  final CleanupSchedule _self;
  final $Res Function(CleanupSchedule) _then;

/// Create a copy of CleanupSchedule
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? description = null,Object? barangay = null,Object? latitude = null,Object? longitude = null,Object? scheduledAt = null,Object? status = null,Object? notes = freezed,Object? createdById = null,Object? verifiedById = freezed,Object? verifiedAt = freezed,Object? workers = null,Object? equipment = null,Object? createdAt = null,Object? updatedAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,barangay: null == barangay ? _self.barangay : barangay // ignore: cast_nullable_to_non_nullable
as String,latitude: null == latitude ? _self.latitude : latitude // ignore: cast_nullable_to_non_nullable
as double,longitude: null == longitude ? _self.longitude : longitude // ignore: cast_nullable_to_non_nullable
as double,scheduledAt: null == scheduledAt ? _self.scheduledAt : scheduledAt // ignore: cast_nullable_to_non_nullable
as DateTime,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as CleanupScheduleStatus,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,createdById: null == createdById ? _self.createdById : createdById // ignore: cast_nullable_to_non_nullable
as String,verifiedById: freezed == verifiedById ? _self.verifiedById : verifiedById // ignore: cast_nullable_to_non_nullable
as String?,verifiedAt: freezed == verifiedAt ? _self.verifiedAt : verifiedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,workers: null == workers ? _self.workers : workers // ignore: cast_nullable_to_non_nullable
as List<ScheduleWorker>,equipment: null == equipment ? _self.equipment : equipment // ignore: cast_nullable_to_non_nullable
as List<String>,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [CleanupSchedule].
extension CleanupSchedulePatterns on CleanupSchedule {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CleanupSchedule value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CleanupSchedule() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CleanupSchedule value)  $default,){
final _that = this;
switch (_that) {
case _CleanupSchedule():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CleanupSchedule value)?  $default,){
final _that = this;
switch (_that) {
case _CleanupSchedule() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  String description,  String barangay,  double latitude,  double longitude,  DateTime scheduledAt,  CleanupScheduleStatus status,  String? notes,  String createdById,  String? verifiedById,  DateTime? verifiedAt,  List<ScheduleWorker> workers,  List<String> equipment,  DateTime createdAt,  DateTime updatedAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CleanupSchedule() when $default != null:
return $default(_that.id,_that.title,_that.description,_that.barangay,_that.latitude,_that.longitude,_that.scheduledAt,_that.status,_that.notes,_that.createdById,_that.verifiedById,_that.verifiedAt,_that.workers,_that.equipment,_that.createdAt,_that.updatedAt);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  String description,  String barangay,  double latitude,  double longitude,  DateTime scheduledAt,  CleanupScheduleStatus status,  String? notes,  String createdById,  String? verifiedById,  DateTime? verifiedAt,  List<ScheduleWorker> workers,  List<String> equipment,  DateTime createdAt,  DateTime updatedAt)  $default,) {final _that = this;
switch (_that) {
case _CleanupSchedule():
return $default(_that.id,_that.title,_that.description,_that.barangay,_that.latitude,_that.longitude,_that.scheduledAt,_that.status,_that.notes,_that.createdById,_that.verifiedById,_that.verifiedAt,_that.workers,_that.equipment,_that.createdAt,_that.updatedAt);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  String description,  String barangay,  double latitude,  double longitude,  DateTime scheduledAt,  CleanupScheduleStatus status,  String? notes,  String createdById,  String? verifiedById,  DateTime? verifiedAt,  List<ScheduleWorker> workers,  List<String> equipment,  DateTime createdAt,  DateTime updatedAt)?  $default,) {final _that = this;
switch (_that) {
case _CleanupSchedule() when $default != null:
return $default(_that.id,_that.title,_that.description,_that.barangay,_that.latitude,_that.longitude,_that.scheduledAt,_that.status,_that.notes,_that.createdById,_that.verifiedById,_that.verifiedAt,_that.workers,_that.equipment,_that.createdAt,_that.updatedAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CleanupSchedule implements CleanupSchedule {
  const _CleanupSchedule({required this.id, required this.title, required this.description, required this.barangay, required this.latitude, required this.longitude, required this.scheduledAt, required this.status, this.notes, required this.createdById, this.verifiedById, this.verifiedAt, final  List<ScheduleWorker> workers = const [], final  List<String> equipment = const [], required this.createdAt, required this.updatedAt}): _workers = workers,_equipment = equipment;
  factory _CleanupSchedule.fromJson(Map<String, dynamic> json) => _$CleanupScheduleFromJson(json);

@override final  String id;
@override final  String title;
@override final  String description;
@override final  String barangay;
@override final  double latitude;
@override final  double longitude;
@override final  DateTime scheduledAt;
@override final  CleanupScheduleStatus status;
@override final  String? notes;
@override final  String createdById;
@override final  String? verifiedById;
@override final  DateTime? verifiedAt;
 final  List<ScheduleWorker> _workers;
@override@JsonKey() List<ScheduleWorker> get workers {
  if (_workers is EqualUnmodifiableListView) return _workers;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_workers);
}

 final  List<String> _equipment;
@override@JsonKey() List<String> get equipment {
  if (_equipment is EqualUnmodifiableListView) return _equipment;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_equipment);
}

@override final  DateTime createdAt;
@override final  DateTime updatedAt;

/// Create a copy of CleanupSchedule
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CleanupScheduleCopyWith<_CleanupSchedule> get copyWith => __$CleanupScheduleCopyWithImpl<_CleanupSchedule>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CleanupScheduleToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CleanupSchedule&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.description, description) || other.description == description)&&(identical(other.barangay, barangay) || other.barangay == barangay)&&(identical(other.latitude, latitude) || other.latitude == latitude)&&(identical(other.longitude, longitude) || other.longitude == longitude)&&(identical(other.scheduledAt, scheduledAt) || other.scheduledAt == scheduledAt)&&(identical(other.status, status) || other.status == status)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.createdById, createdById) || other.createdById == createdById)&&(identical(other.verifiedById, verifiedById) || other.verifiedById == verifiedById)&&(identical(other.verifiedAt, verifiedAt) || other.verifiedAt == verifiedAt)&&const DeepCollectionEquality().equals(other._workers, _workers)&&const DeepCollectionEquality().equals(other._equipment, _equipment)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,title,description,barangay,latitude,longitude,scheduledAt,status,notes,createdById,verifiedById,verifiedAt,const DeepCollectionEquality().hash(_workers),const DeepCollectionEquality().hash(_equipment),createdAt,updatedAt);

@override
String toString() {
  return 'CleanupSchedule(id: $id, title: $title, description: $description, barangay: $barangay, latitude: $latitude, longitude: $longitude, scheduledAt: $scheduledAt, status: $status, notes: $notes, createdById: $createdById, verifiedById: $verifiedById, verifiedAt: $verifiedAt, workers: $workers, equipment: $equipment, createdAt: $createdAt, updatedAt: $updatedAt)';
}


}

/// @nodoc
abstract mixin class _$CleanupScheduleCopyWith<$Res> implements $CleanupScheduleCopyWith<$Res> {
  factory _$CleanupScheduleCopyWith(_CleanupSchedule value, $Res Function(_CleanupSchedule) _then) = __$CleanupScheduleCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, String description, String barangay, double latitude, double longitude, DateTime scheduledAt, CleanupScheduleStatus status, String? notes, String createdById, String? verifiedById, DateTime? verifiedAt, List<ScheduleWorker> workers, List<String> equipment, DateTime createdAt, DateTime updatedAt
});




}
/// @nodoc
class __$CleanupScheduleCopyWithImpl<$Res>
    implements _$CleanupScheduleCopyWith<$Res> {
  __$CleanupScheduleCopyWithImpl(this._self, this._then);

  final _CleanupSchedule _self;
  final $Res Function(_CleanupSchedule) _then;

/// Create a copy of CleanupSchedule
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? description = null,Object? barangay = null,Object? latitude = null,Object? longitude = null,Object? scheduledAt = null,Object? status = null,Object? notes = freezed,Object? createdById = null,Object? verifiedById = freezed,Object? verifiedAt = freezed,Object? workers = null,Object? equipment = null,Object? createdAt = null,Object? updatedAt = null,}) {
  return _then(_CleanupSchedule(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,barangay: null == barangay ? _self.barangay : barangay // ignore: cast_nullable_to_non_nullable
as String,latitude: null == latitude ? _self.latitude : latitude // ignore: cast_nullable_to_non_nullable
as double,longitude: null == longitude ? _self.longitude : longitude // ignore: cast_nullable_to_non_nullable
as double,scheduledAt: null == scheduledAt ? _self.scheduledAt : scheduledAt // ignore: cast_nullable_to_non_nullable
as DateTime,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as CleanupScheduleStatus,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,createdById: null == createdById ? _self.createdById : createdById // ignore: cast_nullable_to_non_nullable
as String,verifiedById: freezed == verifiedById ? _self.verifiedById : verifiedById // ignore: cast_nullable_to_non_nullable
as String?,verifiedAt: freezed == verifiedAt ? _self.verifiedAt : verifiedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,workers: null == workers ? _self._workers : workers // ignore: cast_nullable_to_non_nullable
as List<ScheduleWorker>,equipment: null == equipment ? _self._equipment : equipment // ignore: cast_nullable_to_non_nullable
as List<String>,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}


/// @nodoc
mixin _$ScheduleWorker {

 String get id; String get workerId; ScheduleWorkerUser get worker; DateTime get assignedAt;
/// Create a copy of ScheduleWorker
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ScheduleWorkerCopyWith<ScheduleWorker> get copyWith => _$ScheduleWorkerCopyWithImpl<ScheduleWorker>(this as ScheduleWorker, _$identity);

  /// Serializes this ScheduleWorker to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ScheduleWorker&&(identical(other.id, id) || other.id == id)&&(identical(other.workerId, workerId) || other.workerId == workerId)&&(identical(other.worker, worker) || other.worker == worker)&&(identical(other.assignedAt, assignedAt) || other.assignedAt == assignedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,workerId,worker,assignedAt);

@override
String toString() {
  return 'ScheduleWorker(id: $id, workerId: $workerId, worker: $worker, assignedAt: $assignedAt)';
}


}

/// @nodoc
abstract mixin class $ScheduleWorkerCopyWith<$Res>  {
  factory $ScheduleWorkerCopyWith(ScheduleWorker value, $Res Function(ScheduleWorker) _then) = _$ScheduleWorkerCopyWithImpl;
@useResult
$Res call({
 String id, String workerId, ScheduleWorkerUser worker, DateTime assignedAt
});


$ScheduleWorkerUserCopyWith<$Res> get worker;

}
/// @nodoc
class _$ScheduleWorkerCopyWithImpl<$Res>
    implements $ScheduleWorkerCopyWith<$Res> {
  _$ScheduleWorkerCopyWithImpl(this._self, this._then);

  final ScheduleWorker _self;
  final $Res Function(ScheduleWorker) _then;

/// Create a copy of ScheduleWorker
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? workerId = null,Object? worker = null,Object? assignedAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,workerId: null == workerId ? _self.workerId : workerId // ignore: cast_nullable_to_non_nullable
as String,worker: null == worker ? _self.worker : worker // ignore: cast_nullable_to_non_nullable
as ScheduleWorkerUser,assignedAt: null == assignedAt ? _self.assignedAt : assignedAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}
/// Create a copy of ScheduleWorker
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ScheduleWorkerUserCopyWith<$Res> get worker {
  
  return $ScheduleWorkerUserCopyWith<$Res>(_self.worker, (value) {
    return _then(_self.copyWith(worker: value));
  });
}
}


/// Adds pattern-matching-related methods to [ScheduleWorker].
extension ScheduleWorkerPatterns on ScheduleWorker {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ScheduleWorker value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ScheduleWorker() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ScheduleWorker value)  $default,){
final _that = this;
switch (_that) {
case _ScheduleWorker():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ScheduleWorker value)?  $default,){
final _that = this;
switch (_that) {
case _ScheduleWorker() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String workerId,  ScheduleWorkerUser worker,  DateTime assignedAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ScheduleWorker() when $default != null:
return $default(_that.id,_that.workerId,_that.worker,_that.assignedAt);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String workerId,  ScheduleWorkerUser worker,  DateTime assignedAt)  $default,) {final _that = this;
switch (_that) {
case _ScheduleWorker():
return $default(_that.id,_that.workerId,_that.worker,_that.assignedAt);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String workerId,  ScheduleWorkerUser worker,  DateTime assignedAt)?  $default,) {final _that = this;
switch (_that) {
case _ScheduleWorker() when $default != null:
return $default(_that.id,_that.workerId,_that.worker,_that.assignedAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ScheduleWorker implements ScheduleWorker {
  const _ScheduleWorker({required this.id, required this.workerId, required this.worker, required this.assignedAt});
  factory _ScheduleWorker.fromJson(Map<String, dynamic> json) => _$ScheduleWorkerFromJson(json);

@override final  String id;
@override final  String workerId;
@override final  ScheduleWorkerUser worker;
@override final  DateTime assignedAt;

/// Create a copy of ScheduleWorker
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ScheduleWorkerCopyWith<_ScheduleWorker> get copyWith => __$ScheduleWorkerCopyWithImpl<_ScheduleWorker>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ScheduleWorkerToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ScheduleWorker&&(identical(other.id, id) || other.id == id)&&(identical(other.workerId, workerId) || other.workerId == workerId)&&(identical(other.worker, worker) || other.worker == worker)&&(identical(other.assignedAt, assignedAt) || other.assignedAt == assignedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,workerId,worker,assignedAt);

@override
String toString() {
  return 'ScheduleWorker(id: $id, workerId: $workerId, worker: $worker, assignedAt: $assignedAt)';
}


}

/// @nodoc
abstract mixin class _$ScheduleWorkerCopyWith<$Res> implements $ScheduleWorkerCopyWith<$Res> {
  factory _$ScheduleWorkerCopyWith(_ScheduleWorker value, $Res Function(_ScheduleWorker) _then) = __$ScheduleWorkerCopyWithImpl;
@override @useResult
$Res call({
 String id, String workerId, ScheduleWorkerUser worker, DateTime assignedAt
});


@override $ScheduleWorkerUserCopyWith<$Res> get worker;

}
/// @nodoc
class __$ScheduleWorkerCopyWithImpl<$Res>
    implements _$ScheduleWorkerCopyWith<$Res> {
  __$ScheduleWorkerCopyWithImpl(this._self, this._then);

  final _ScheduleWorker _self;
  final $Res Function(_ScheduleWorker) _then;

/// Create a copy of ScheduleWorker
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? workerId = null,Object? worker = null,Object? assignedAt = null,}) {
  return _then(_ScheduleWorker(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,workerId: null == workerId ? _self.workerId : workerId // ignore: cast_nullable_to_non_nullable
as String,worker: null == worker ? _self.worker : worker // ignore: cast_nullable_to_non_nullable
as ScheduleWorkerUser,assignedAt: null == assignedAt ? _self.assignedAt : assignedAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

/// Create a copy of ScheduleWorker
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ScheduleWorkerUserCopyWith<$Res> get worker {
  
  return $ScheduleWorkerUserCopyWith<$Res>(_self.worker, (value) {
    return _then(_self.copyWith(worker: value));
  });
}
}


/// @nodoc
mixin _$ScheduleWorkerUser {

 String get id; String get firstName; String get lastName; String? get email; String? get phone;
/// Create a copy of ScheduleWorkerUser
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ScheduleWorkerUserCopyWith<ScheduleWorkerUser> get copyWith => _$ScheduleWorkerUserCopyWithImpl<ScheduleWorkerUser>(this as ScheduleWorkerUser, _$identity);

  /// Serializes this ScheduleWorkerUser to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ScheduleWorkerUser&&(identical(other.id, id) || other.id == id)&&(identical(other.firstName, firstName) || other.firstName == firstName)&&(identical(other.lastName, lastName) || other.lastName == lastName)&&(identical(other.email, email) || other.email == email)&&(identical(other.phone, phone) || other.phone == phone));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,firstName,lastName,email,phone);

@override
String toString() {
  return 'ScheduleWorkerUser(id: $id, firstName: $firstName, lastName: $lastName, email: $email, phone: $phone)';
}


}

/// @nodoc
abstract mixin class $ScheduleWorkerUserCopyWith<$Res>  {
  factory $ScheduleWorkerUserCopyWith(ScheduleWorkerUser value, $Res Function(ScheduleWorkerUser) _then) = _$ScheduleWorkerUserCopyWithImpl;
@useResult
$Res call({
 String id, String firstName, String lastName, String? email, String? phone
});




}
/// @nodoc
class _$ScheduleWorkerUserCopyWithImpl<$Res>
    implements $ScheduleWorkerUserCopyWith<$Res> {
  _$ScheduleWorkerUserCopyWithImpl(this._self, this._then);

  final ScheduleWorkerUser _self;
  final $Res Function(ScheduleWorkerUser) _then;

/// Create a copy of ScheduleWorkerUser
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? firstName = null,Object? lastName = null,Object? email = freezed,Object? phone = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,firstName: null == firstName ? _self.firstName : firstName // ignore: cast_nullable_to_non_nullable
as String,lastName: null == lastName ? _self.lastName : lastName // ignore: cast_nullable_to_non_nullable
as String,email: freezed == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String?,phone: freezed == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [ScheduleWorkerUser].
extension ScheduleWorkerUserPatterns on ScheduleWorkerUser {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ScheduleWorkerUser value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ScheduleWorkerUser() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ScheduleWorkerUser value)  $default,){
final _that = this;
switch (_that) {
case _ScheduleWorkerUser():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ScheduleWorkerUser value)?  $default,){
final _that = this;
switch (_that) {
case _ScheduleWorkerUser() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String firstName,  String lastName,  String? email,  String? phone)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ScheduleWorkerUser() when $default != null:
return $default(_that.id,_that.firstName,_that.lastName,_that.email,_that.phone);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String firstName,  String lastName,  String? email,  String? phone)  $default,) {final _that = this;
switch (_that) {
case _ScheduleWorkerUser():
return $default(_that.id,_that.firstName,_that.lastName,_that.email,_that.phone);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String firstName,  String lastName,  String? email,  String? phone)?  $default,) {final _that = this;
switch (_that) {
case _ScheduleWorkerUser() when $default != null:
return $default(_that.id,_that.firstName,_that.lastName,_that.email,_that.phone);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ScheduleWorkerUser implements ScheduleWorkerUser {
  const _ScheduleWorkerUser({required this.id, required this.firstName, required this.lastName, this.email, this.phone});
  factory _ScheduleWorkerUser.fromJson(Map<String, dynamic> json) => _$ScheduleWorkerUserFromJson(json);

@override final  String id;
@override final  String firstName;
@override final  String lastName;
@override final  String? email;
@override final  String? phone;

/// Create a copy of ScheduleWorkerUser
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ScheduleWorkerUserCopyWith<_ScheduleWorkerUser> get copyWith => __$ScheduleWorkerUserCopyWithImpl<_ScheduleWorkerUser>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ScheduleWorkerUserToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ScheduleWorkerUser&&(identical(other.id, id) || other.id == id)&&(identical(other.firstName, firstName) || other.firstName == firstName)&&(identical(other.lastName, lastName) || other.lastName == lastName)&&(identical(other.email, email) || other.email == email)&&(identical(other.phone, phone) || other.phone == phone));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,firstName,lastName,email,phone);

@override
String toString() {
  return 'ScheduleWorkerUser(id: $id, firstName: $firstName, lastName: $lastName, email: $email, phone: $phone)';
}


}

/// @nodoc
abstract mixin class _$ScheduleWorkerUserCopyWith<$Res> implements $ScheduleWorkerUserCopyWith<$Res> {
  factory _$ScheduleWorkerUserCopyWith(_ScheduleWorkerUser value, $Res Function(_ScheduleWorkerUser) _then) = __$ScheduleWorkerUserCopyWithImpl;
@override @useResult
$Res call({
 String id, String firstName, String lastName, String? email, String? phone
});




}
/// @nodoc
class __$ScheduleWorkerUserCopyWithImpl<$Res>
    implements _$ScheduleWorkerUserCopyWith<$Res> {
  __$ScheduleWorkerUserCopyWithImpl(this._self, this._then);

  final _ScheduleWorkerUser _self;
  final $Res Function(_ScheduleWorkerUser) _then;

/// Create a copy of ScheduleWorkerUser
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? firstName = null,Object? lastName = null,Object? email = freezed,Object? phone = freezed,}) {
  return _then(_ScheduleWorkerUser(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,firstName: null == firstName ? _self.firstName : firstName // ignore: cast_nullable_to_non_nullable
as String,lastName: null == lastName ? _self.lastName : lastName // ignore: cast_nullable_to_non_nullable
as String,email: freezed == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String?,phone: freezed == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
