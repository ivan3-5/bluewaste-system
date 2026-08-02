
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Report
 * 
 */
export type Report = $Result.DefaultSelection<Prisma.$ReportPayload>
/**
 * Model ReportImage
 * 
 */
export type ReportImage = $Result.DefaultSelection<Prisma.$ReportImagePayload>
/**
 * Model StatusHistory
 * 
 */
export type StatusHistory = $Result.DefaultSelection<Prisma.$StatusHistoryPayload>
/**
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>
/**
 * Model ReportingZone
 * 
 */
export type ReportingZone = $Result.DefaultSelection<Prisma.$ReportingZonePayload>
/**
 * Model CleanupSchedule
 * 
 */
export type CleanupSchedule = $Result.DefaultSelection<Prisma.$CleanupSchedulePayload>
/**
 * Model CleanupScheduleWorker
 * 
 */
export type CleanupScheduleWorker = $Result.DefaultSelection<Prisma.$CleanupScheduleWorkerPayload>
/**
 * Model ReportWorker
 * 
 */
export type ReportWorker = $Result.DefaultSelection<Prisma.$ReportWorkerPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  CITIZEN: 'CITIZEN',
  LGU_ADMIN: 'LGU_ADMIN',
  FIELD_WORKER: 'FIELD_WORKER'
};

export type Role = (typeof Role)[keyof typeof Role]


export const ReportStatus: {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  CLEANUP_SCHEDULED: 'CLEANUP_SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  CLEANED: 'CLEANED',
  REJECTED: 'REJECTED'
};

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus]


export const WasteCategory: {
  with_waste: 'with_waste',
  no_waste: 'no_waste'
};

export type WasteCategory = (typeof WasteCategory)[keyof typeof WasteCategory]


export const ImageType: {
  REPORT: 'REPORT',
  CLEANUP: 'CLEANUP'
};

export type ImageType = (typeof ImageType)[keyof typeof ImageType]


export const NotificationType: {
  NEW_REPORT: 'NEW_REPORT',
  STATUS_CHANGE: 'STATUS_CHANGE',
  ASSIGNMENT: 'ASSIGNMENT',
  SYSTEM: 'SYSTEM',
  CLEANUP_SCHEDULE: 'CLEANUP_SCHEDULE'
};

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]


export const CleanupScheduleStatus: {
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export type CleanupScheduleStatus = (typeof CleanupScheduleStatus)[keyof typeof CleanupScheduleStatus]


export const WasteType: {
  PLASTIC: 'PLASTIC',
  ORGANIC: 'ORGANIC',
  GLASS: 'GLASS',
  METAL: 'METAL',
  PAPER: 'PAPER'
};

export type WasteType = (typeof WasteType)[keyof typeof WasteType]


export const AnalysisStatus: {
  DIRTY: 'DIRTY',
  CLEAN: 'CLEAN'
};

export type AnalysisStatus = (typeof AnalysisStatus)[keyof typeof AnalysisStatus]


export const Severity: {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MODERATE: 'MODERATE',
  SPAM: 'SPAM'
};

export type Severity = (typeof Severity)[keyof typeof Severity]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type ReportStatus = $Enums.ReportStatus

export const ReportStatus: typeof $Enums.ReportStatus

export type WasteCategory = $Enums.WasteCategory

export const WasteCategory: typeof $Enums.WasteCategory

export type ImageType = $Enums.ImageType

export const ImageType: typeof $Enums.ImageType

export type NotificationType = $Enums.NotificationType

export const NotificationType: typeof $Enums.NotificationType

export type CleanupScheduleStatus = $Enums.CleanupScheduleStatus

export const CleanupScheduleStatus: typeof $Enums.CleanupScheduleStatus

export type WasteType = $Enums.WasteType

export const WasteType: typeof $Enums.WasteType

export type AnalysisStatus = $Enums.AnalysisStatus

export const AnalysisStatus: typeof $Enums.AnalysisStatus

export type Severity = $Enums.Severity

export const Severity: typeof $Enums.Severity

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.report`: Exposes CRUD operations for the **Report** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Reports
    * const reports = await prisma.report.findMany()
    * ```
    */
  get report(): Prisma.ReportDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.reportImage`: Exposes CRUD operations for the **ReportImage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReportImages
    * const reportImages = await prisma.reportImage.findMany()
    * ```
    */
  get reportImage(): Prisma.ReportImageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.statusHistory`: Exposes CRUD operations for the **StatusHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StatusHistories
    * const statusHistories = await prisma.statusHistory.findMany()
    * ```
    */
  get statusHistory(): Prisma.StatusHistoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.reportingZone`: Exposes CRUD operations for the **ReportingZone** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReportingZones
    * const reportingZones = await prisma.reportingZone.findMany()
    * ```
    */
  get reportingZone(): Prisma.ReportingZoneDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cleanupSchedule`: Exposes CRUD operations for the **CleanupSchedule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CleanupSchedules
    * const cleanupSchedules = await prisma.cleanupSchedule.findMany()
    * ```
    */
  get cleanupSchedule(): Prisma.CleanupScheduleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cleanupScheduleWorker`: Exposes CRUD operations for the **CleanupScheduleWorker** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CleanupScheduleWorkers
    * const cleanupScheduleWorkers = await prisma.cleanupScheduleWorker.findMany()
    * ```
    */
  get cleanupScheduleWorker(): Prisma.CleanupScheduleWorkerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.reportWorker`: Exposes CRUD operations for the **ReportWorker** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReportWorkers
    * const reportWorkers = await prisma.reportWorker.findMany()
    * ```
    */
  get reportWorker(): Prisma.ReportWorkerDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Report: 'Report',
    ReportImage: 'ReportImage',
    StatusHistory: 'StatusHistory',
    Notification: 'Notification',
    ReportingZone: 'ReportingZone',
    CleanupSchedule: 'CleanupSchedule',
    CleanupScheduleWorker: 'CleanupScheduleWorker',
    ReportWorker: 'ReportWorker'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "report" | "reportImage" | "statusHistory" | "notification" | "reportingZone" | "cleanupSchedule" | "cleanupScheduleWorker" | "reportWorker"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Report: {
        payload: Prisma.$ReportPayload<ExtArgs>
        fields: Prisma.ReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload>
          }
          findFirst: {
            args: Prisma.ReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload>
          }
          findMany: {
            args: Prisma.ReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload>[]
          }
          create: {
            args: Prisma.ReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload>
          }
          createMany: {
            args: Prisma.ReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload>[]
          }
          delete: {
            args: Prisma.ReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload>
          }
          update: {
            args: Prisma.ReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload>
          }
          deleteMany: {
            args: Prisma.ReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReportUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload>[]
          }
          upsert: {
            args: Prisma.ReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportPayload>
          }
          aggregate: {
            args: Prisma.ReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReport>
          }
          groupBy: {
            args: Prisma.ReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReportCountArgs<ExtArgs>
            result: $Utils.Optional<ReportCountAggregateOutputType> | number
          }
        }
      }
      ReportImage: {
        payload: Prisma.$ReportImagePayload<ExtArgs>
        fields: Prisma.ReportImageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReportImageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReportImageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload>
          }
          findFirst: {
            args: Prisma.ReportImageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReportImageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload>
          }
          findMany: {
            args: Prisma.ReportImageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload>[]
          }
          create: {
            args: Prisma.ReportImageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload>
          }
          createMany: {
            args: Prisma.ReportImageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReportImageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload>[]
          }
          delete: {
            args: Prisma.ReportImageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload>
          }
          update: {
            args: Prisma.ReportImageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload>
          }
          deleteMany: {
            args: Prisma.ReportImageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReportImageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReportImageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload>[]
          }
          upsert: {
            args: Prisma.ReportImageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportImagePayload>
          }
          aggregate: {
            args: Prisma.ReportImageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReportImage>
          }
          groupBy: {
            args: Prisma.ReportImageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReportImageGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReportImageCountArgs<ExtArgs>
            result: $Utils.Optional<ReportImageCountAggregateOutputType> | number
          }
        }
      }
      StatusHistory: {
        payload: Prisma.$StatusHistoryPayload<ExtArgs>
        fields: Prisma.StatusHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StatusHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StatusHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload>
          }
          findFirst: {
            args: Prisma.StatusHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StatusHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload>
          }
          findMany: {
            args: Prisma.StatusHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload>[]
          }
          create: {
            args: Prisma.StatusHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload>
          }
          createMany: {
            args: Prisma.StatusHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StatusHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload>[]
          }
          delete: {
            args: Prisma.StatusHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload>
          }
          update: {
            args: Prisma.StatusHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload>
          }
          deleteMany: {
            args: Prisma.StatusHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StatusHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StatusHistoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload>[]
          }
          upsert: {
            args: Prisma.StatusHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusHistoryPayload>
          }
          aggregate: {
            args: Prisma.StatusHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStatusHistory>
          }
          groupBy: {
            args: Prisma.StatusHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<StatusHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.StatusHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<StatusHistoryCountAggregateOutputType> | number
          }
        }
      }
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NotificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
          }
        }
      }
      ReportingZone: {
        payload: Prisma.$ReportingZonePayload<ExtArgs>
        fields: Prisma.ReportingZoneFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReportingZoneFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReportingZoneFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload>
          }
          findFirst: {
            args: Prisma.ReportingZoneFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReportingZoneFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload>
          }
          findMany: {
            args: Prisma.ReportingZoneFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload>[]
          }
          create: {
            args: Prisma.ReportingZoneCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload>
          }
          createMany: {
            args: Prisma.ReportingZoneCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReportingZoneCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload>[]
          }
          delete: {
            args: Prisma.ReportingZoneDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload>
          }
          update: {
            args: Prisma.ReportingZoneUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload>
          }
          deleteMany: {
            args: Prisma.ReportingZoneDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReportingZoneUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReportingZoneUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload>[]
          }
          upsert: {
            args: Prisma.ReportingZoneUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportingZonePayload>
          }
          aggregate: {
            args: Prisma.ReportingZoneAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReportingZone>
          }
          groupBy: {
            args: Prisma.ReportingZoneGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReportingZoneGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReportingZoneCountArgs<ExtArgs>
            result: $Utils.Optional<ReportingZoneCountAggregateOutputType> | number
          }
        }
      }
      CleanupSchedule: {
        payload: Prisma.$CleanupSchedulePayload<ExtArgs>
        fields: Prisma.CleanupScheduleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CleanupScheduleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CleanupScheduleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload>
          }
          findFirst: {
            args: Prisma.CleanupScheduleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CleanupScheduleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload>
          }
          findMany: {
            args: Prisma.CleanupScheduleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload>[]
          }
          create: {
            args: Prisma.CleanupScheduleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload>
          }
          createMany: {
            args: Prisma.CleanupScheduleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CleanupScheduleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload>[]
          }
          delete: {
            args: Prisma.CleanupScheduleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload>
          }
          update: {
            args: Prisma.CleanupScheduleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload>
          }
          deleteMany: {
            args: Prisma.CleanupScheduleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CleanupScheduleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CleanupScheduleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload>[]
          }
          upsert: {
            args: Prisma.CleanupScheduleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupSchedulePayload>
          }
          aggregate: {
            args: Prisma.CleanupScheduleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCleanupSchedule>
          }
          groupBy: {
            args: Prisma.CleanupScheduleGroupByArgs<ExtArgs>
            result: $Utils.Optional<CleanupScheduleGroupByOutputType>[]
          }
          count: {
            args: Prisma.CleanupScheduleCountArgs<ExtArgs>
            result: $Utils.Optional<CleanupScheduleCountAggregateOutputType> | number
          }
        }
      }
      CleanupScheduleWorker: {
        payload: Prisma.$CleanupScheduleWorkerPayload<ExtArgs>
        fields: Prisma.CleanupScheduleWorkerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CleanupScheduleWorkerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CleanupScheduleWorkerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload>
          }
          findFirst: {
            args: Prisma.CleanupScheduleWorkerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CleanupScheduleWorkerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload>
          }
          findMany: {
            args: Prisma.CleanupScheduleWorkerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload>[]
          }
          create: {
            args: Prisma.CleanupScheduleWorkerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload>
          }
          createMany: {
            args: Prisma.CleanupScheduleWorkerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CleanupScheduleWorkerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload>[]
          }
          delete: {
            args: Prisma.CleanupScheduleWorkerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload>
          }
          update: {
            args: Prisma.CleanupScheduleWorkerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload>
          }
          deleteMany: {
            args: Prisma.CleanupScheduleWorkerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CleanupScheduleWorkerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CleanupScheduleWorkerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload>[]
          }
          upsert: {
            args: Prisma.CleanupScheduleWorkerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CleanupScheduleWorkerPayload>
          }
          aggregate: {
            args: Prisma.CleanupScheduleWorkerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCleanupScheduleWorker>
          }
          groupBy: {
            args: Prisma.CleanupScheduleWorkerGroupByArgs<ExtArgs>
            result: $Utils.Optional<CleanupScheduleWorkerGroupByOutputType>[]
          }
          count: {
            args: Prisma.CleanupScheduleWorkerCountArgs<ExtArgs>
            result: $Utils.Optional<CleanupScheduleWorkerCountAggregateOutputType> | number
          }
        }
      }
      ReportWorker: {
        payload: Prisma.$ReportWorkerPayload<ExtArgs>
        fields: Prisma.ReportWorkerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReportWorkerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReportWorkerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload>
          }
          findFirst: {
            args: Prisma.ReportWorkerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReportWorkerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload>
          }
          findMany: {
            args: Prisma.ReportWorkerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload>[]
          }
          create: {
            args: Prisma.ReportWorkerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload>
          }
          createMany: {
            args: Prisma.ReportWorkerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReportWorkerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload>[]
          }
          delete: {
            args: Prisma.ReportWorkerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload>
          }
          update: {
            args: Prisma.ReportWorkerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload>
          }
          deleteMany: {
            args: Prisma.ReportWorkerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReportWorkerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReportWorkerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload>[]
          }
          upsert: {
            args: Prisma.ReportWorkerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWorkerPayload>
          }
          aggregate: {
            args: Prisma.ReportWorkerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReportWorker>
          }
          groupBy: {
            args: Prisma.ReportWorkerGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReportWorkerGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReportWorkerCountArgs<ExtArgs>
            result: $Utils.Optional<ReportWorkerCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    report?: ReportOmit
    reportImage?: ReportImageOmit
    statusHistory?: StatusHistoryOmit
    notification?: NotificationOmit
    reportingZone?: ReportingZoneOmit
    cleanupSchedule?: CleanupScheduleOmit
    cleanupScheduleWorker?: CleanupScheduleWorkerOmit
    reportWorker?: ReportWorkerOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    reports: number
    assignedReports: number
    assignedReportWorkers: number
    statusChanges: number
    notifications: number
    reportingZones: number
    createdSchedules: number
    verifiedSchedules: number
    scheduleAssignments: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reports?: boolean | UserCountOutputTypeCountReportsArgs
    assignedReports?: boolean | UserCountOutputTypeCountAssignedReportsArgs
    assignedReportWorkers?: boolean | UserCountOutputTypeCountAssignedReportWorkersArgs
    statusChanges?: boolean | UserCountOutputTypeCountStatusChangesArgs
    notifications?: boolean | UserCountOutputTypeCountNotificationsArgs
    reportingZones?: boolean | UserCountOutputTypeCountReportingZonesArgs
    createdSchedules?: boolean | UserCountOutputTypeCountCreatedSchedulesArgs
    verifiedSchedules?: boolean | UserCountOutputTypeCountVerifiedSchedulesArgs
    scheduleAssignments?: boolean | UserCountOutputTypeCountScheduleAssignmentsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAssignedReportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAssignedReportWorkersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportWorkerWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountStatusChangesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StatusHistoryWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountNotificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReportingZonesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportingZoneWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCreatedSchedulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleanupScheduleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountVerifiedSchedulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleanupScheduleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountScheduleAssignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleanupScheduleWorkerWhereInput
  }


  /**
   * Count Type ReportCountOutputType
   */

  export type ReportCountOutputType = {
    assignedWorkers: number
    images: number
    statusHistory: number
    notifications: number
  }

  export type ReportCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assignedWorkers?: boolean | ReportCountOutputTypeCountAssignedWorkersArgs
    images?: boolean | ReportCountOutputTypeCountImagesArgs
    statusHistory?: boolean | ReportCountOutputTypeCountStatusHistoryArgs
    notifications?: boolean | ReportCountOutputTypeCountNotificationsArgs
  }

  // Custom InputTypes
  /**
   * ReportCountOutputType without action
   */
  export type ReportCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportCountOutputType
     */
    select?: ReportCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReportCountOutputType without action
   */
  export type ReportCountOutputTypeCountAssignedWorkersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportWorkerWhereInput
  }

  /**
   * ReportCountOutputType without action
   */
  export type ReportCountOutputTypeCountImagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportImageWhereInput
  }

  /**
   * ReportCountOutputType without action
   */
  export type ReportCountOutputTypeCountStatusHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StatusHistoryWhereInput
  }

  /**
   * ReportCountOutputType without action
   */
  export type ReportCountOutputTypeCountNotificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
  }


  /**
   * Count Type CleanupScheduleCountOutputType
   */

  export type CleanupScheduleCountOutputType = {
    workers: number
    reports: number
  }

  export type CleanupScheduleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workers?: boolean | CleanupScheduleCountOutputTypeCountWorkersArgs
    reports?: boolean | CleanupScheduleCountOutputTypeCountReportsArgs
  }

  // Custom InputTypes
  /**
   * CleanupScheduleCountOutputType without action
   */
  export type CleanupScheduleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleCountOutputType
     */
    select?: CleanupScheduleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CleanupScheduleCountOutputType without action
   */
  export type CleanupScheduleCountOutputTypeCountWorkersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleanupScheduleWorkerWhereInput
  }

  /**
   * CleanupScheduleCountOutputType without action
   */
  export type CleanupScheduleCountOutputTypeCountReportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    address: string | null
    role: $Enums.Role | null
    avatarUrl: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    address: string | null
    role: $Enums.Role | null
    avatarUrl: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    firstName: number
    lastName: number
    phone: number
    address: number
    role: number
    avatarUrl: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    firstName?: true
    lastName?: true
    phone?: true
    address?: true
    role?: true
    avatarUrl?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    firstName?: true
    lastName?: true
    phone?: true
    address?: true
    role?: true
    avatarUrl?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    firstName?: true
    lastName?: true
    phone?: true
    address?: true
    role?: true
    avatarUrl?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string | null
    address: string
    role: $Enums.Role
    avatarUrl: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    address?: boolean
    role?: boolean
    avatarUrl?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    reports?: boolean | User$reportsArgs<ExtArgs>
    assignedReports?: boolean | User$assignedReportsArgs<ExtArgs>
    assignedReportWorkers?: boolean | User$assignedReportWorkersArgs<ExtArgs>
    statusChanges?: boolean | User$statusChangesArgs<ExtArgs>
    notifications?: boolean | User$notificationsArgs<ExtArgs>
    reportingZones?: boolean | User$reportingZonesArgs<ExtArgs>
    createdSchedules?: boolean | User$createdSchedulesArgs<ExtArgs>
    verifiedSchedules?: boolean | User$verifiedSchedulesArgs<ExtArgs>
    scheduleAssignments?: boolean | User$scheduleAssignmentsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    address?: boolean
    role?: boolean
    avatarUrl?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    address?: boolean
    role?: boolean
    avatarUrl?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    address?: boolean
    role?: boolean
    avatarUrl?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "firstName" | "lastName" | "phone" | "address" | "role" | "avatarUrl" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reports?: boolean | User$reportsArgs<ExtArgs>
    assignedReports?: boolean | User$assignedReportsArgs<ExtArgs>
    assignedReportWorkers?: boolean | User$assignedReportWorkersArgs<ExtArgs>
    statusChanges?: boolean | User$statusChangesArgs<ExtArgs>
    notifications?: boolean | User$notificationsArgs<ExtArgs>
    reportingZones?: boolean | User$reportingZonesArgs<ExtArgs>
    createdSchedules?: boolean | User$createdSchedulesArgs<ExtArgs>
    verifiedSchedules?: boolean | User$verifiedSchedulesArgs<ExtArgs>
    scheduleAssignments?: boolean | User$scheduleAssignmentsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      reports: Prisma.$ReportPayload<ExtArgs>[]
      assignedReports: Prisma.$ReportPayload<ExtArgs>[]
      assignedReportWorkers: Prisma.$ReportWorkerPayload<ExtArgs>[]
      statusChanges: Prisma.$StatusHistoryPayload<ExtArgs>[]
      notifications: Prisma.$NotificationPayload<ExtArgs>[]
      reportingZones: Prisma.$ReportingZonePayload<ExtArgs>[]
      createdSchedules: Prisma.$CleanupSchedulePayload<ExtArgs>[]
      verifiedSchedules: Prisma.$CleanupSchedulePayload<ExtArgs>[]
      scheduleAssignments: Prisma.$CleanupScheduleWorkerPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string
      firstName: string
      lastName: string
      phone: string | null
      address: string
      role: $Enums.Role
      avatarUrl: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    reports<T extends User$reportsArgs<ExtArgs> = {}>(args?: Subset<T, User$reportsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    assignedReports<T extends User$assignedReportsArgs<ExtArgs> = {}>(args?: Subset<T, User$assignedReportsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    assignedReportWorkers<T extends User$assignedReportWorkersArgs<ExtArgs> = {}>(args?: Subset<T, User$assignedReportWorkersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    statusChanges<T extends User$statusChangesArgs<ExtArgs> = {}>(args?: Subset<T, User$statusChangesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    notifications<T extends User$notificationsArgs<ExtArgs> = {}>(args?: Subset<T, User$notificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    reportingZones<T extends User$reportingZonesArgs<ExtArgs> = {}>(args?: Subset<T, User$reportingZonesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    createdSchedules<T extends User$createdSchedulesArgs<ExtArgs> = {}>(args?: Subset<T, User$createdSchedulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    verifiedSchedules<T extends User$verifiedSchedulesArgs<ExtArgs> = {}>(args?: Subset<T, User$verifiedSchedulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    scheduleAssignments<T extends User$scheduleAssignmentsArgs<ExtArgs> = {}>(args?: Subset<T, User$scheduleAssignmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly address: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly avatarUrl: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.reports
   */
  export type User$reportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    where?: ReportWhereInput
    orderBy?: ReportOrderByWithRelationInput | ReportOrderByWithRelationInput[]
    cursor?: ReportWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReportScalarFieldEnum | ReportScalarFieldEnum[]
  }

  /**
   * User.assignedReports
   */
  export type User$assignedReportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    where?: ReportWhereInput
    orderBy?: ReportOrderByWithRelationInput | ReportOrderByWithRelationInput[]
    cursor?: ReportWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReportScalarFieldEnum | ReportScalarFieldEnum[]
  }

  /**
   * User.assignedReportWorkers
   */
  export type User$assignedReportWorkersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    where?: ReportWorkerWhereInput
    orderBy?: ReportWorkerOrderByWithRelationInput | ReportWorkerOrderByWithRelationInput[]
    cursor?: ReportWorkerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReportWorkerScalarFieldEnum | ReportWorkerScalarFieldEnum[]
  }

  /**
   * User.statusChanges
   */
  export type User$statusChangesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    where?: StatusHistoryWhereInput
    orderBy?: StatusHistoryOrderByWithRelationInput | StatusHistoryOrderByWithRelationInput[]
    cursor?: StatusHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StatusHistoryScalarFieldEnum | StatusHistoryScalarFieldEnum[]
  }

  /**
   * User.notifications
   */
  export type User$notificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    cursor?: NotificationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * User.reportingZones
   */
  export type User$reportingZonesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
    where?: ReportingZoneWhereInput
    orderBy?: ReportingZoneOrderByWithRelationInput | ReportingZoneOrderByWithRelationInput[]
    cursor?: ReportingZoneWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReportingZoneScalarFieldEnum | ReportingZoneScalarFieldEnum[]
  }

  /**
   * User.createdSchedules
   */
  export type User$createdSchedulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    where?: CleanupScheduleWhereInput
    orderBy?: CleanupScheduleOrderByWithRelationInput | CleanupScheduleOrderByWithRelationInput[]
    cursor?: CleanupScheduleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CleanupScheduleScalarFieldEnum | CleanupScheduleScalarFieldEnum[]
  }

  /**
   * User.verifiedSchedules
   */
  export type User$verifiedSchedulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    where?: CleanupScheduleWhereInput
    orderBy?: CleanupScheduleOrderByWithRelationInput | CleanupScheduleOrderByWithRelationInput[]
    cursor?: CleanupScheduleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CleanupScheduleScalarFieldEnum | CleanupScheduleScalarFieldEnum[]
  }

  /**
   * User.scheduleAssignments
   */
  export type User$scheduleAssignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    where?: CleanupScheduleWorkerWhereInput
    orderBy?: CleanupScheduleWorkerOrderByWithRelationInput | CleanupScheduleWorkerOrderByWithRelationInput[]
    cursor?: CleanupScheduleWorkerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CleanupScheduleWorkerScalarFieldEnum | CleanupScheduleWorkerScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Report
   */

  export type AggregateReport = {
    _count: ReportCountAggregateOutputType | null
    _avg: ReportAvgAggregateOutputType | null
    _sum: ReportSumAggregateOutputType | null
    _min: ReportMinAggregateOutputType | null
    _max: ReportMaxAggregateOutputType | null
  }

  export type ReportAvgAggregateOutputType = {
    latitude: number | null
    longitude: number | null
    analysisWasteCount: number | null
    analysisConfidence: number | null
    aiProcessingMs: number | null
    aiGeminiMs: number | null
  }

  export type ReportSumAggregateOutputType = {
    latitude: number | null
    longitude: number | null
    analysisWasteCount: number | null
    analysisConfidence: number | null
    aiProcessingMs: number | null
    aiGeminiMs: number | null
  }

  export type ReportMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    category: $Enums.WasteCategory | null
    status: $Enums.ReportStatus | null
    latitude: number | null
    longitude: number | null
    address: string | null
    isAnonymous: boolean | null
    isDeleted: boolean | null
    isSpam: boolean | null
    spamMarkedAt: Date | null
    spamReason: string | null
    analysisStatus: $Enums.AnalysisStatus | null
    analysisWasteCount: number | null
    analysisConfidence: number | null
    analyzedAt: Date | null
    severity: $Enums.Severity | null
    aiReason: string | null
    aiModel: string | null
    aiImageHash: string | null
    aiProcessingMs: number | null
    aiGeminiMs: number | null
    createdAt: Date | null
    updatedAt: Date | null
    reporterId: string | null
    assignedToId: string | null
    cleanupScheduleId: string | null
  }

  export type ReportMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    category: $Enums.WasteCategory | null
    status: $Enums.ReportStatus | null
    latitude: number | null
    longitude: number | null
    address: string | null
    isAnonymous: boolean | null
    isDeleted: boolean | null
    isSpam: boolean | null
    spamMarkedAt: Date | null
    spamReason: string | null
    analysisStatus: $Enums.AnalysisStatus | null
    analysisWasteCount: number | null
    analysisConfidence: number | null
    analyzedAt: Date | null
    severity: $Enums.Severity | null
    aiReason: string | null
    aiModel: string | null
    aiImageHash: string | null
    aiProcessingMs: number | null
    aiGeminiMs: number | null
    createdAt: Date | null
    updatedAt: Date | null
    reporterId: string | null
    assignedToId: string | null
    cleanupScheduleId: string | null
  }

  export type ReportCountAggregateOutputType = {
    id: number
    title: number
    description: number
    category: number
    status: number
    latitude: number
    longitude: number
    address: number
    isAnonymous: number
    isDeleted: number
    isSpam: number
    spamMarkedAt: number
    spamReason: number
    analysisStatus: number
    analysisWasteCount: number
    analysisConfidence: number
    analyzedAt: number
    severity: number
    aiCategories: number
    aiReason: number
    aiModel: number
    aiImageHash: number
    aiProcessingMs: number
    aiGeminiMs: number
    createdAt: number
    updatedAt: number
    reporterId: number
    assignedToId: number
    cleanupScheduleId: number
    _all: number
  }


  export type ReportAvgAggregateInputType = {
    latitude?: true
    longitude?: true
    analysisWasteCount?: true
    analysisConfidence?: true
    aiProcessingMs?: true
    aiGeminiMs?: true
  }

  export type ReportSumAggregateInputType = {
    latitude?: true
    longitude?: true
    analysisWasteCount?: true
    analysisConfidence?: true
    aiProcessingMs?: true
    aiGeminiMs?: true
  }

  export type ReportMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    category?: true
    status?: true
    latitude?: true
    longitude?: true
    address?: true
    isAnonymous?: true
    isDeleted?: true
    isSpam?: true
    spamMarkedAt?: true
    spamReason?: true
    analysisStatus?: true
    analysisWasteCount?: true
    analysisConfidence?: true
    analyzedAt?: true
    severity?: true
    aiReason?: true
    aiModel?: true
    aiImageHash?: true
    aiProcessingMs?: true
    aiGeminiMs?: true
    createdAt?: true
    updatedAt?: true
    reporterId?: true
    assignedToId?: true
    cleanupScheduleId?: true
  }

  export type ReportMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    category?: true
    status?: true
    latitude?: true
    longitude?: true
    address?: true
    isAnonymous?: true
    isDeleted?: true
    isSpam?: true
    spamMarkedAt?: true
    spamReason?: true
    analysisStatus?: true
    analysisWasteCount?: true
    analysisConfidence?: true
    analyzedAt?: true
    severity?: true
    aiReason?: true
    aiModel?: true
    aiImageHash?: true
    aiProcessingMs?: true
    aiGeminiMs?: true
    createdAt?: true
    updatedAt?: true
    reporterId?: true
    assignedToId?: true
    cleanupScheduleId?: true
  }

  export type ReportCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    category?: true
    status?: true
    latitude?: true
    longitude?: true
    address?: true
    isAnonymous?: true
    isDeleted?: true
    isSpam?: true
    spamMarkedAt?: true
    spamReason?: true
    analysisStatus?: true
    analysisWasteCount?: true
    analysisConfidence?: true
    analyzedAt?: true
    severity?: true
    aiCategories?: true
    aiReason?: true
    aiModel?: true
    aiImageHash?: true
    aiProcessingMs?: true
    aiGeminiMs?: true
    createdAt?: true
    updatedAt?: true
    reporterId?: true
    assignedToId?: true
    cleanupScheduleId?: true
    _all?: true
  }

  export type ReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Report to aggregate.
     */
    where?: ReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reports to fetch.
     */
    orderBy?: ReportOrderByWithRelationInput | ReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Reports
    **/
    _count?: true | ReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReportMaxAggregateInputType
  }

  export type GetReportAggregateType<T extends ReportAggregateArgs> = {
        [P in keyof T & keyof AggregateReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReport[P]>
      : GetScalarType<T[P], AggregateReport[P]>
  }




  export type ReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportWhereInput
    orderBy?: ReportOrderByWithAggregationInput | ReportOrderByWithAggregationInput[]
    by: ReportScalarFieldEnum[] | ReportScalarFieldEnum
    having?: ReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReportCountAggregateInputType | true
    _avg?: ReportAvgAggregateInputType
    _sum?: ReportSumAggregateInputType
    _min?: ReportMinAggregateInputType
    _max?: ReportMaxAggregateInputType
  }

  export type ReportGroupByOutputType = {
    id: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status: $Enums.ReportStatus
    latitude: number
    longitude: number
    address: string | null
    isAnonymous: boolean
    isDeleted: boolean
    isSpam: boolean
    spamMarkedAt: Date | null
    spamReason: string | null
    analysisStatus: $Enums.AnalysisStatus | null
    analysisWasteCount: number | null
    analysisConfidence: number | null
    analyzedAt: Date | null
    severity: $Enums.Severity | null
    aiCategories: string[]
    aiReason: string | null
    aiModel: string | null
    aiImageHash: string | null
    aiProcessingMs: number | null
    aiGeminiMs: number | null
    createdAt: Date
    updatedAt: Date
    reporterId: string | null
    assignedToId: string | null
    cleanupScheduleId: string | null
    _count: ReportCountAggregateOutputType | null
    _avg: ReportAvgAggregateOutputType | null
    _sum: ReportSumAggregateOutputType | null
    _min: ReportMinAggregateOutputType | null
    _max: ReportMaxAggregateOutputType | null
  }

  type GetReportGroupByPayload<T extends ReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReportGroupByOutputType[P]>
            : GetScalarType<T[P], ReportGroupByOutputType[P]>
        }
      >
    >


  export type ReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    category?: boolean
    status?: boolean
    latitude?: boolean
    longitude?: boolean
    address?: boolean
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: boolean
    spamReason?: boolean
    analysisStatus?: boolean
    analysisWasteCount?: boolean
    analysisConfidence?: boolean
    analyzedAt?: boolean
    severity?: boolean
    aiCategories?: boolean
    aiReason?: boolean
    aiModel?: boolean
    aiImageHash?: boolean
    aiProcessingMs?: boolean
    aiGeminiMs?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    reporterId?: boolean
    assignedToId?: boolean
    cleanupScheduleId?: boolean
    reporter?: boolean | Report$reporterArgs<ExtArgs>
    assignedTo?: boolean | Report$assignedToArgs<ExtArgs>
    assignedWorkers?: boolean | Report$assignedWorkersArgs<ExtArgs>
    cleanupSchedule?: boolean | Report$cleanupScheduleArgs<ExtArgs>
    images?: boolean | Report$imagesArgs<ExtArgs>
    statusHistory?: boolean | Report$statusHistoryArgs<ExtArgs>
    notifications?: boolean | Report$notificationsArgs<ExtArgs>
    _count?: boolean | ReportCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["report"]>

  export type ReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    category?: boolean
    status?: boolean
    latitude?: boolean
    longitude?: boolean
    address?: boolean
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: boolean
    spamReason?: boolean
    analysisStatus?: boolean
    analysisWasteCount?: boolean
    analysisConfidence?: boolean
    analyzedAt?: boolean
    severity?: boolean
    aiCategories?: boolean
    aiReason?: boolean
    aiModel?: boolean
    aiImageHash?: boolean
    aiProcessingMs?: boolean
    aiGeminiMs?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    reporterId?: boolean
    assignedToId?: boolean
    cleanupScheduleId?: boolean
    reporter?: boolean | Report$reporterArgs<ExtArgs>
    assignedTo?: boolean | Report$assignedToArgs<ExtArgs>
    cleanupSchedule?: boolean | Report$cleanupScheduleArgs<ExtArgs>
  }, ExtArgs["result"]["report"]>

  export type ReportSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    category?: boolean
    status?: boolean
    latitude?: boolean
    longitude?: boolean
    address?: boolean
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: boolean
    spamReason?: boolean
    analysisStatus?: boolean
    analysisWasteCount?: boolean
    analysisConfidence?: boolean
    analyzedAt?: boolean
    severity?: boolean
    aiCategories?: boolean
    aiReason?: boolean
    aiModel?: boolean
    aiImageHash?: boolean
    aiProcessingMs?: boolean
    aiGeminiMs?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    reporterId?: boolean
    assignedToId?: boolean
    cleanupScheduleId?: boolean
    reporter?: boolean | Report$reporterArgs<ExtArgs>
    assignedTo?: boolean | Report$assignedToArgs<ExtArgs>
    cleanupSchedule?: boolean | Report$cleanupScheduleArgs<ExtArgs>
  }, ExtArgs["result"]["report"]>

  export type ReportSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    category?: boolean
    status?: boolean
    latitude?: boolean
    longitude?: boolean
    address?: boolean
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: boolean
    spamReason?: boolean
    analysisStatus?: boolean
    analysisWasteCount?: boolean
    analysisConfidence?: boolean
    analyzedAt?: boolean
    severity?: boolean
    aiCategories?: boolean
    aiReason?: boolean
    aiModel?: boolean
    aiImageHash?: boolean
    aiProcessingMs?: boolean
    aiGeminiMs?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    reporterId?: boolean
    assignedToId?: boolean
    cleanupScheduleId?: boolean
  }

  export type ReportOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "category" | "status" | "latitude" | "longitude" | "address" | "isAnonymous" | "isDeleted" | "isSpam" | "spamMarkedAt" | "spamReason" | "analysisStatus" | "analysisWasteCount" | "analysisConfidence" | "analyzedAt" | "severity" | "aiCategories" | "aiReason" | "aiModel" | "aiImageHash" | "aiProcessingMs" | "aiGeminiMs" | "createdAt" | "updatedAt" | "reporterId" | "assignedToId" | "cleanupScheduleId", ExtArgs["result"]["report"]>
  export type ReportInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reporter?: boolean | Report$reporterArgs<ExtArgs>
    assignedTo?: boolean | Report$assignedToArgs<ExtArgs>
    assignedWorkers?: boolean | Report$assignedWorkersArgs<ExtArgs>
    cleanupSchedule?: boolean | Report$cleanupScheduleArgs<ExtArgs>
    images?: boolean | Report$imagesArgs<ExtArgs>
    statusHistory?: boolean | Report$statusHistoryArgs<ExtArgs>
    notifications?: boolean | Report$notificationsArgs<ExtArgs>
    _count?: boolean | ReportCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ReportIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reporter?: boolean | Report$reporterArgs<ExtArgs>
    assignedTo?: boolean | Report$assignedToArgs<ExtArgs>
    cleanupSchedule?: boolean | Report$cleanupScheduleArgs<ExtArgs>
  }
  export type ReportIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reporter?: boolean | Report$reporterArgs<ExtArgs>
    assignedTo?: boolean | Report$assignedToArgs<ExtArgs>
    cleanupSchedule?: boolean | Report$cleanupScheduleArgs<ExtArgs>
  }

  export type $ReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Report"
    objects: {
      reporter: Prisma.$UserPayload<ExtArgs> | null
      assignedTo: Prisma.$UserPayload<ExtArgs> | null
      assignedWorkers: Prisma.$ReportWorkerPayload<ExtArgs>[]
      cleanupSchedule: Prisma.$CleanupSchedulePayload<ExtArgs> | null
      images: Prisma.$ReportImagePayload<ExtArgs>[]
      statusHistory: Prisma.$StatusHistoryPayload<ExtArgs>[]
      notifications: Prisma.$NotificationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string
      category: $Enums.WasteCategory
      status: $Enums.ReportStatus
      latitude: number
      longitude: number
      address: string | null
      isAnonymous: boolean
      isDeleted: boolean
      isSpam: boolean
      spamMarkedAt: Date | null
      spamReason: string | null
      analysisStatus: $Enums.AnalysisStatus | null
      analysisWasteCount: number | null
      analysisConfidence: number | null
      analyzedAt: Date | null
      severity: $Enums.Severity | null
      aiCategories: string[]
      aiReason: string | null
      aiModel: string | null
      aiImageHash: string | null
      aiProcessingMs: number | null
      aiGeminiMs: number | null
      createdAt: Date
      updatedAt: Date
      reporterId: string | null
      assignedToId: string | null
      cleanupScheduleId: string | null
    }, ExtArgs["result"]["report"]>
    composites: {}
  }

  type ReportGetPayload<S extends boolean | null | undefined | ReportDefaultArgs> = $Result.GetResult<Prisma.$ReportPayload, S>

  type ReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReportFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReportCountAggregateInputType | true
    }

  export interface ReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Report'], meta: { name: 'Report' } }
    /**
     * Find zero or one Report that matches the filter.
     * @param {ReportFindUniqueArgs} args - Arguments to find a Report
     * @example
     * // Get one Report
     * const report = await prisma.report.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReportFindUniqueArgs>(args: SelectSubset<T, ReportFindUniqueArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Report that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReportFindUniqueOrThrowArgs} args - Arguments to find a Report
     * @example
     * // Get one Report
     * const report = await prisma.report.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReportFindUniqueOrThrowArgs>(args: SelectSubset<T, ReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Report that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportFindFirstArgs} args - Arguments to find a Report
     * @example
     * // Get one Report
     * const report = await prisma.report.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReportFindFirstArgs>(args?: SelectSubset<T, ReportFindFirstArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Report that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportFindFirstOrThrowArgs} args - Arguments to find a Report
     * @example
     * // Get one Report
     * const report = await prisma.report.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReportFindFirstOrThrowArgs>(args?: SelectSubset<T, ReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Reports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Reports
     * const reports = await prisma.report.findMany()
     * 
     * // Get first 10 Reports
     * const reports = await prisma.report.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reportWithIdOnly = await prisma.report.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReportFindManyArgs>(args?: SelectSubset<T, ReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Report.
     * @param {ReportCreateArgs} args - Arguments to create a Report.
     * @example
     * // Create one Report
     * const Report = await prisma.report.create({
     *   data: {
     *     // ... data to create a Report
     *   }
     * })
     * 
     */
    create<T extends ReportCreateArgs>(args: SelectSubset<T, ReportCreateArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Reports.
     * @param {ReportCreateManyArgs} args - Arguments to create many Reports.
     * @example
     * // Create many Reports
     * const report = await prisma.report.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReportCreateManyArgs>(args?: SelectSubset<T, ReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Reports and returns the data saved in the database.
     * @param {ReportCreateManyAndReturnArgs} args - Arguments to create many Reports.
     * @example
     * // Create many Reports
     * const report = await prisma.report.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Reports and only return the `id`
     * const reportWithIdOnly = await prisma.report.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReportCreateManyAndReturnArgs>(args?: SelectSubset<T, ReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Report.
     * @param {ReportDeleteArgs} args - Arguments to delete one Report.
     * @example
     * // Delete one Report
     * const Report = await prisma.report.delete({
     *   where: {
     *     // ... filter to delete one Report
     *   }
     * })
     * 
     */
    delete<T extends ReportDeleteArgs>(args: SelectSubset<T, ReportDeleteArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Report.
     * @param {ReportUpdateArgs} args - Arguments to update one Report.
     * @example
     * // Update one Report
     * const report = await prisma.report.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReportUpdateArgs>(args: SelectSubset<T, ReportUpdateArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Reports.
     * @param {ReportDeleteManyArgs} args - Arguments to filter Reports to delete.
     * @example
     * // Delete a few Reports
     * const { count } = await prisma.report.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReportDeleteManyArgs>(args?: SelectSubset<T, ReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Reports
     * const report = await prisma.report.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReportUpdateManyArgs>(args: SelectSubset<T, ReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reports and returns the data updated in the database.
     * @param {ReportUpdateManyAndReturnArgs} args - Arguments to update many Reports.
     * @example
     * // Update many Reports
     * const report = await prisma.report.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Reports and only return the `id`
     * const reportWithIdOnly = await prisma.report.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReportUpdateManyAndReturnArgs>(args: SelectSubset<T, ReportUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Report.
     * @param {ReportUpsertArgs} args - Arguments to update or create a Report.
     * @example
     * // Update or create a Report
     * const report = await prisma.report.upsert({
     *   create: {
     *     // ... data to create a Report
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Report we want to update
     *   }
     * })
     */
    upsert<T extends ReportUpsertArgs>(args: SelectSubset<T, ReportUpsertArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Reports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportCountArgs} args - Arguments to filter Reports to count.
     * @example
     * // Count the number of Reports
     * const count = await prisma.report.count({
     *   where: {
     *     // ... the filter for the Reports we want to count
     *   }
     * })
    **/
    count<T extends ReportCountArgs>(
      args?: Subset<T, ReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Report.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReportAggregateArgs>(args: Subset<T, ReportAggregateArgs>): Prisma.PrismaPromise<GetReportAggregateType<T>>

    /**
     * Group by Report.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReportGroupByArgs['orderBy'] }
        : { orderBy?: ReportGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Report model
   */
  readonly fields: ReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Report.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    reporter<T extends Report$reporterArgs<ExtArgs> = {}>(args?: Subset<T, Report$reporterArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    assignedTo<T extends Report$assignedToArgs<ExtArgs> = {}>(args?: Subset<T, Report$assignedToArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    assignedWorkers<T extends Report$assignedWorkersArgs<ExtArgs> = {}>(args?: Subset<T, Report$assignedWorkersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cleanupSchedule<T extends Report$cleanupScheduleArgs<ExtArgs> = {}>(args?: Subset<T, Report$cleanupScheduleArgs<ExtArgs>>): Prisma__CleanupScheduleClient<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    images<T extends Report$imagesArgs<ExtArgs> = {}>(args?: Subset<T, Report$imagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    statusHistory<T extends Report$statusHistoryArgs<ExtArgs> = {}>(args?: Subset<T, Report$statusHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    notifications<T extends Report$notificationsArgs<ExtArgs> = {}>(args?: Subset<T, Report$notificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Report model
   */
  interface ReportFieldRefs {
    readonly id: FieldRef<"Report", 'String'>
    readonly title: FieldRef<"Report", 'String'>
    readonly description: FieldRef<"Report", 'String'>
    readonly category: FieldRef<"Report", 'WasteCategory'>
    readonly status: FieldRef<"Report", 'ReportStatus'>
    readonly latitude: FieldRef<"Report", 'Float'>
    readonly longitude: FieldRef<"Report", 'Float'>
    readonly address: FieldRef<"Report", 'String'>
    readonly isAnonymous: FieldRef<"Report", 'Boolean'>
    readonly isDeleted: FieldRef<"Report", 'Boolean'>
    readonly isSpam: FieldRef<"Report", 'Boolean'>
    readonly spamMarkedAt: FieldRef<"Report", 'DateTime'>
    readonly spamReason: FieldRef<"Report", 'String'>
    readonly analysisStatus: FieldRef<"Report", 'AnalysisStatus'>
    readonly analysisWasteCount: FieldRef<"Report", 'Int'>
    readonly analysisConfidence: FieldRef<"Report", 'Float'>
    readonly analyzedAt: FieldRef<"Report", 'DateTime'>
    readonly severity: FieldRef<"Report", 'Severity'>
    readonly aiCategories: FieldRef<"Report", 'String[]'>
    readonly aiReason: FieldRef<"Report", 'String'>
    readonly aiModel: FieldRef<"Report", 'String'>
    readonly aiImageHash: FieldRef<"Report", 'String'>
    readonly aiProcessingMs: FieldRef<"Report", 'Int'>
    readonly aiGeminiMs: FieldRef<"Report", 'Int'>
    readonly createdAt: FieldRef<"Report", 'DateTime'>
    readonly updatedAt: FieldRef<"Report", 'DateTime'>
    readonly reporterId: FieldRef<"Report", 'String'>
    readonly assignedToId: FieldRef<"Report", 'String'>
    readonly cleanupScheduleId: FieldRef<"Report", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Report findUnique
   */
  export type ReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    /**
     * Filter, which Report to fetch.
     */
    where: ReportWhereUniqueInput
  }

  /**
   * Report findUniqueOrThrow
   */
  export type ReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    /**
     * Filter, which Report to fetch.
     */
    where: ReportWhereUniqueInput
  }

  /**
   * Report findFirst
   */
  export type ReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    /**
     * Filter, which Report to fetch.
     */
    where?: ReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reports to fetch.
     */
    orderBy?: ReportOrderByWithRelationInput | ReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Reports.
     */
    cursor?: ReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Reports.
     */
    distinct?: ReportScalarFieldEnum | ReportScalarFieldEnum[]
  }

  /**
   * Report findFirstOrThrow
   */
  export type ReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    /**
     * Filter, which Report to fetch.
     */
    where?: ReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reports to fetch.
     */
    orderBy?: ReportOrderByWithRelationInput | ReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Reports.
     */
    cursor?: ReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Reports.
     */
    distinct?: ReportScalarFieldEnum | ReportScalarFieldEnum[]
  }

  /**
   * Report findMany
   */
  export type ReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    /**
     * Filter, which Reports to fetch.
     */
    where?: ReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reports to fetch.
     */
    orderBy?: ReportOrderByWithRelationInput | ReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Reports.
     */
    cursor?: ReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reports.
     */
    skip?: number
    distinct?: ReportScalarFieldEnum | ReportScalarFieldEnum[]
  }

  /**
   * Report create
   */
  export type ReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    /**
     * The data needed to create a Report.
     */
    data: XOR<ReportCreateInput, ReportUncheckedCreateInput>
  }

  /**
   * Report createMany
   */
  export type ReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Reports.
     */
    data: ReportCreateManyInput | ReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Report createManyAndReturn
   */
  export type ReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * The data used to create many Reports.
     */
    data: ReportCreateManyInput | ReportCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Report update
   */
  export type ReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    /**
     * The data needed to update a Report.
     */
    data: XOR<ReportUpdateInput, ReportUncheckedUpdateInput>
    /**
     * Choose, which Report to update.
     */
    where: ReportWhereUniqueInput
  }

  /**
   * Report updateMany
   */
  export type ReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Reports.
     */
    data: XOR<ReportUpdateManyMutationInput, ReportUncheckedUpdateManyInput>
    /**
     * Filter which Reports to update
     */
    where?: ReportWhereInput
    /**
     * Limit how many Reports to update.
     */
    limit?: number
  }

  /**
   * Report updateManyAndReturn
   */
  export type ReportUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * The data used to update Reports.
     */
    data: XOR<ReportUpdateManyMutationInput, ReportUncheckedUpdateManyInput>
    /**
     * Filter which Reports to update
     */
    where?: ReportWhereInput
    /**
     * Limit how many Reports to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Report upsert
   */
  export type ReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    /**
     * The filter to search for the Report to update in case it exists.
     */
    where: ReportWhereUniqueInput
    /**
     * In case the Report found by the `where` argument doesn't exist, create a new Report with this data.
     */
    create: XOR<ReportCreateInput, ReportUncheckedCreateInput>
    /**
     * In case the Report was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReportUpdateInput, ReportUncheckedUpdateInput>
  }

  /**
   * Report delete
   */
  export type ReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    /**
     * Filter which Report to delete.
     */
    where: ReportWhereUniqueInput
  }

  /**
   * Report deleteMany
   */
  export type ReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Reports to delete
     */
    where?: ReportWhereInput
    /**
     * Limit how many Reports to delete.
     */
    limit?: number
  }

  /**
   * Report.reporter
   */
  export type Report$reporterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Report.assignedTo
   */
  export type Report$assignedToArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Report.assignedWorkers
   */
  export type Report$assignedWorkersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    where?: ReportWorkerWhereInput
    orderBy?: ReportWorkerOrderByWithRelationInput | ReportWorkerOrderByWithRelationInput[]
    cursor?: ReportWorkerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReportWorkerScalarFieldEnum | ReportWorkerScalarFieldEnum[]
  }

  /**
   * Report.cleanupSchedule
   */
  export type Report$cleanupScheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    where?: CleanupScheduleWhereInput
  }

  /**
   * Report.images
   */
  export type Report$imagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
    where?: ReportImageWhereInput
    orderBy?: ReportImageOrderByWithRelationInput | ReportImageOrderByWithRelationInput[]
    cursor?: ReportImageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReportImageScalarFieldEnum | ReportImageScalarFieldEnum[]
  }

  /**
   * Report.statusHistory
   */
  export type Report$statusHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    where?: StatusHistoryWhereInput
    orderBy?: StatusHistoryOrderByWithRelationInput | StatusHistoryOrderByWithRelationInput[]
    cursor?: StatusHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StatusHistoryScalarFieldEnum | StatusHistoryScalarFieldEnum[]
  }

  /**
   * Report.notifications
   */
  export type Report$notificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    cursor?: NotificationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Report without action
   */
  export type ReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
  }


  /**
   * Model ReportImage
   */

  export type AggregateReportImage = {
    _count: ReportImageCountAggregateOutputType | null
    _min: ReportImageMinAggregateOutputType | null
    _max: ReportImageMaxAggregateOutputType | null
  }

  export type ReportImageMinAggregateOutputType = {
    id: string | null
    imageUrl: string | null
    publicId: string | null
    type: $Enums.ImageType | null
    createdAt: Date | null
    reportId: string | null
  }

  export type ReportImageMaxAggregateOutputType = {
    id: string | null
    imageUrl: string | null
    publicId: string | null
    type: $Enums.ImageType | null
    createdAt: Date | null
    reportId: string | null
  }

  export type ReportImageCountAggregateOutputType = {
    id: number
    imageUrl: number
    publicId: number
    type: number
    createdAt: number
    reportId: number
    _all: number
  }


  export type ReportImageMinAggregateInputType = {
    id?: true
    imageUrl?: true
    publicId?: true
    type?: true
    createdAt?: true
    reportId?: true
  }

  export type ReportImageMaxAggregateInputType = {
    id?: true
    imageUrl?: true
    publicId?: true
    type?: true
    createdAt?: true
    reportId?: true
  }

  export type ReportImageCountAggregateInputType = {
    id?: true
    imageUrl?: true
    publicId?: true
    type?: true
    createdAt?: true
    reportId?: true
    _all?: true
  }

  export type ReportImageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReportImage to aggregate.
     */
    where?: ReportImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportImages to fetch.
     */
    orderBy?: ReportImageOrderByWithRelationInput | ReportImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReportImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReportImages
    **/
    _count?: true | ReportImageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReportImageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReportImageMaxAggregateInputType
  }

  export type GetReportImageAggregateType<T extends ReportImageAggregateArgs> = {
        [P in keyof T & keyof AggregateReportImage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReportImage[P]>
      : GetScalarType<T[P], AggregateReportImage[P]>
  }




  export type ReportImageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportImageWhereInput
    orderBy?: ReportImageOrderByWithAggregationInput | ReportImageOrderByWithAggregationInput[]
    by: ReportImageScalarFieldEnum[] | ReportImageScalarFieldEnum
    having?: ReportImageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReportImageCountAggregateInputType | true
    _min?: ReportImageMinAggregateInputType
    _max?: ReportImageMaxAggregateInputType
  }

  export type ReportImageGroupByOutputType = {
    id: string
    imageUrl: string
    publicId: string
    type: $Enums.ImageType
    createdAt: Date
    reportId: string
    _count: ReportImageCountAggregateOutputType | null
    _min: ReportImageMinAggregateOutputType | null
    _max: ReportImageMaxAggregateOutputType | null
  }

  type GetReportImageGroupByPayload<T extends ReportImageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReportImageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReportImageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReportImageGroupByOutputType[P]>
            : GetScalarType<T[P], ReportImageGroupByOutputType[P]>
        }
      >
    >


  export type ReportImageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    imageUrl?: boolean
    publicId?: boolean
    type?: boolean
    createdAt?: boolean
    reportId?: boolean
    report?: boolean | ReportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportImage"]>

  export type ReportImageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    imageUrl?: boolean
    publicId?: boolean
    type?: boolean
    createdAt?: boolean
    reportId?: boolean
    report?: boolean | ReportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportImage"]>

  export type ReportImageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    imageUrl?: boolean
    publicId?: boolean
    type?: boolean
    createdAt?: boolean
    reportId?: boolean
    report?: boolean | ReportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportImage"]>

  export type ReportImageSelectScalar = {
    id?: boolean
    imageUrl?: boolean
    publicId?: boolean
    type?: boolean
    createdAt?: boolean
    reportId?: boolean
  }

  export type ReportImageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "imageUrl" | "publicId" | "type" | "createdAt" | "reportId", ExtArgs["result"]["reportImage"]>
  export type ReportImageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | ReportDefaultArgs<ExtArgs>
  }
  export type ReportImageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | ReportDefaultArgs<ExtArgs>
  }
  export type ReportImageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | ReportDefaultArgs<ExtArgs>
  }

  export type $ReportImagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReportImage"
    objects: {
      report: Prisma.$ReportPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      imageUrl: string
      publicId: string
      type: $Enums.ImageType
      createdAt: Date
      reportId: string
    }, ExtArgs["result"]["reportImage"]>
    composites: {}
  }

  type ReportImageGetPayload<S extends boolean | null | undefined | ReportImageDefaultArgs> = $Result.GetResult<Prisma.$ReportImagePayload, S>

  type ReportImageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReportImageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReportImageCountAggregateInputType | true
    }

  export interface ReportImageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReportImage'], meta: { name: 'ReportImage' } }
    /**
     * Find zero or one ReportImage that matches the filter.
     * @param {ReportImageFindUniqueArgs} args - Arguments to find a ReportImage
     * @example
     * // Get one ReportImage
     * const reportImage = await prisma.reportImage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReportImageFindUniqueArgs>(args: SelectSubset<T, ReportImageFindUniqueArgs<ExtArgs>>): Prisma__ReportImageClient<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReportImage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReportImageFindUniqueOrThrowArgs} args - Arguments to find a ReportImage
     * @example
     * // Get one ReportImage
     * const reportImage = await prisma.reportImage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReportImageFindUniqueOrThrowArgs>(args: SelectSubset<T, ReportImageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReportImageClient<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReportImage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportImageFindFirstArgs} args - Arguments to find a ReportImage
     * @example
     * // Get one ReportImage
     * const reportImage = await prisma.reportImage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReportImageFindFirstArgs>(args?: SelectSubset<T, ReportImageFindFirstArgs<ExtArgs>>): Prisma__ReportImageClient<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReportImage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportImageFindFirstOrThrowArgs} args - Arguments to find a ReportImage
     * @example
     * // Get one ReportImage
     * const reportImage = await prisma.reportImage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReportImageFindFirstOrThrowArgs>(args?: SelectSubset<T, ReportImageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReportImageClient<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReportImages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportImageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReportImages
     * const reportImages = await prisma.reportImage.findMany()
     * 
     * // Get first 10 ReportImages
     * const reportImages = await prisma.reportImage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reportImageWithIdOnly = await prisma.reportImage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReportImageFindManyArgs>(args?: SelectSubset<T, ReportImageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReportImage.
     * @param {ReportImageCreateArgs} args - Arguments to create a ReportImage.
     * @example
     * // Create one ReportImage
     * const ReportImage = await prisma.reportImage.create({
     *   data: {
     *     // ... data to create a ReportImage
     *   }
     * })
     * 
     */
    create<T extends ReportImageCreateArgs>(args: SelectSubset<T, ReportImageCreateArgs<ExtArgs>>): Prisma__ReportImageClient<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReportImages.
     * @param {ReportImageCreateManyArgs} args - Arguments to create many ReportImages.
     * @example
     * // Create many ReportImages
     * const reportImage = await prisma.reportImage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReportImageCreateManyArgs>(args?: SelectSubset<T, ReportImageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReportImages and returns the data saved in the database.
     * @param {ReportImageCreateManyAndReturnArgs} args - Arguments to create many ReportImages.
     * @example
     * // Create many ReportImages
     * const reportImage = await prisma.reportImage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReportImages and only return the `id`
     * const reportImageWithIdOnly = await prisma.reportImage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReportImageCreateManyAndReturnArgs>(args?: SelectSubset<T, ReportImageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReportImage.
     * @param {ReportImageDeleteArgs} args - Arguments to delete one ReportImage.
     * @example
     * // Delete one ReportImage
     * const ReportImage = await prisma.reportImage.delete({
     *   where: {
     *     // ... filter to delete one ReportImage
     *   }
     * })
     * 
     */
    delete<T extends ReportImageDeleteArgs>(args: SelectSubset<T, ReportImageDeleteArgs<ExtArgs>>): Prisma__ReportImageClient<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReportImage.
     * @param {ReportImageUpdateArgs} args - Arguments to update one ReportImage.
     * @example
     * // Update one ReportImage
     * const reportImage = await prisma.reportImage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReportImageUpdateArgs>(args: SelectSubset<T, ReportImageUpdateArgs<ExtArgs>>): Prisma__ReportImageClient<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReportImages.
     * @param {ReportImageDeleteManyArgs} args - Arguments to filter ReportImages to delete.
     * @example
     * // Delete a few ReportImages
     * const { count } = await prisma.reportImage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReportImageDeleteManyArgs>(args?: SelectSubset<T, ReportImageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReportImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportImageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReportImages
     * const reportImage = await prisma.reportImage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReportImageUpdateManyArgs>(args: SelectSubset<T, ReportImageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReportImages and returns the data updated in the database.
     * @param {ReportImageUpdateManyAndReturnArgs} args - Arguments to update many ReportImages.
     * @example
     * // Update many ReportImages
     * const reportImage = await prisma.reportImage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReportImages and only return the `id`
     * const reportImageWithIdOnly = await prisma.reportImage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReportImageUpdateManyAndReturnArgs>(args: SelectSubset<T, ReportImageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReportImage.
     * @param {ReportImageUpsertArgs} args - Arguments to update or create a ReportImage.
     * @example
     * // Update or create a ReportImage
     * const reportImage = await prisma.reportImage.upsert({
     *   create: {
     *     // ... data to create a ReportImage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReportImage we want to update
     *   }
     * })
     */
    upsert<T extends ReportImageUpsertArgs>(args: SelectSubset<T, ReportImageUpsertArgs<ExtArgs>>): Prisma__ReportImageClient<$Result.GetResult<Prisma.$ReportImagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReportImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportImageCountArgs} args - Arguments to filter ReportImages to count.
     * @example
     * // Count the number of ReportImages
     * const count = await prisma.reportImage.count({
     *   where: {
     *     // ... the filter for the ReportImages we want to count
     *   }
     * })
    **/
    count<T extends ReportImageCountArgs>(
      args?: Subset<T, ReportImageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReportImageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReportImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportImageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReportImageAggregateArgs>(args: Subset<T, ReportImageAggregateArgs>): Prisma.PrismaPromise<GetReportImageAggregateType<T>>

    /**
     * Group by ReportImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportImageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReportImageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReportImageGroupByArgs['orderBy'] }
        : { orderBy?: ReportImageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReportImageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReportImageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReportImage model
   */
  readonly fields: ReportImageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReportImage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReportImageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    report<T extends ReportDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReportDefaultArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReportImage model
   */
  interface ReportImageFieldRefs {
    readonly id: FieldRef<"ReportImage", 'String'>
    readonly imageUrl: FieldRef<"ReportImage", 'String'>
    readonly publicId: FieldRef<"ReportImage", 'String'>
    readonly type: FieldRef<"ReportImage", 'ImageType'>
    readonly createdAt: FieldRef<"ReportImage", 'DateTime'>
    readonly reportId: FieldRef<"ReportImage", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ReportImage findUnique
   */
  export type ReportImageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
    /**
     * Filter, which ReportImage to fetch.
     */
    where: ReportImageWhereUniqueInput
  }

  /**
   * ReportImage findUniqueOrThrow
   */
  export type ReportImageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
    /**
     * Filter, which ReportImage to fetch.
     */
    where: ReportImageWhereUniqueInput
  }

  /**
   * ReportImage findFirst
   */
  export type ReportImageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
    /**
     * Filter, which ReportImage to fetch.
     */
    where?: ReportImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportImages to fetch.
     */
    orderBy?: ReportImageOrderByWithRelationInput | ReportImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReportImages.
     */
    cursor?: ReportImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportImages.
     */
    distinct?: ReportImageScalarFieldEnum | ReportImageScalarFieldEnum[]
  }

  /**
   * ReportImage findFirstOrThrow
   */
  export type ReportImageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
    /**
     * Filter, which ReportImage to fetch.
     */
    where?: ReportImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportImages to fetch.
     */
    orderBy?: ReportImageOrderByWithRelationInput | ReportImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReportImages.
     */
    cursor?: ReportImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportImages.
     */
    distinct?: ReportImageScalarFieldEnum | ReportImageScalarFieldEnum[]
  }

  /**
   * ReportImage findMany
   */
  export type ReportImageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
    /**
     * Filter, which ReportImages to fetch.
     */
    where?: ReportImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportImages to fetch.
     */
    orderBy?: ReportImageOrderByWithRelationInput | ReportImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReportImages.
     */
    cursor?: ReportImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportImages.
     */
    skip?: number
    distinct?: ReportImageScalarFieldEnum | ReportImageScalarFieldEnum[]
  }

  /**
   * ReportImage create
   */
  export type ReportImageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
    /**
     * The data needed to create a ReportImage.
     */
    data: XOR<ReportImageCreateInput, ReportImageUncheckedCreateInput>
  }

  /**
   * ReportImage createMany
   */
  export type ReportImageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReportImages.
     */
    data: ReportImageCreateManyInput | ReportImageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReportImage createManyAndReturn
   */
  export type ReportImageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * The data used to create many ReportImages.
     */
    data: ReportImageCreateManyInput | ReportImageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReportImage update
   */
  export type ReportImageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
    /**
     * The data needed to update a ReportImage.
     */
    data: XOR<ReportImageUpdateInput, ReportImageUncheckedUpdateInput>
    /**
     * Choose, which ReportImage to update.
     */
    where: ReportImageWhereUniqueInput
  }

  /**
   * ReportImage updateMany
   */
  export type ReportImageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReportImages.
     */
    data: XOR<ReportImageUpdateManyMutationInput, ReportImageUncheckedUpdateManyInput>
    /**
     * Filter which ReportImages to update
     */
    where?: ReportImageWhereInput
    /**
     * Limit how many ReportImages to update.
     */
    limit?: number
  }

  /**
   * ReportImage updateManyAndReturn
   */
  export type ReportImageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * The data used to update ReportImages.
     */
    data: XOR<ReportImageUpdateManyMutationInput, ReportImageUncheckedUpdateManyInput>
    /**
     * Filter which ReportImages to update
     */
    where?: ReportImageWhereInput
    /**
     * Limit how many ReportImages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReportImage upsert
   */
  export type ReportImageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
    /**
     * The filter to search for the ReportImage to update in case it exists.
     */
    where: ReportImageWhereUniqueInput
    /**
     * In case the ReportImage found by the `where` argument doesn't exist, create a new ReportImage with this data.
     */
    create: XOR<ReportImageCreateInput, ReportImageUncheckedCreateInput>
    /**
     * In case the ReportImage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReportImageUpdateInput, ReportImageUncheckedUpdateInput>
  }

  /**
   * ReportImage delete
   */
  export type ReportImageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
    /**
     * Filter which ReportImage to delete.
     */
    where: ReportImageWhereUniqueInput
  }

  /**
   * ReportImage deleteMany
   */
  export type ReportImageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReportImages to delete
     */
    where?: ReportImageWhereInput
    /**
     * Limit how many ReportImages to delete.
     */
    limit?: number
  }

  /**
   * ReportImage without action
   */
  export type ReportImageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportImage
     */
    select?: ReportImageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportImage
     */
    omit?: ReportImageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportImageInclude<ExtArgs> | null
  }


  /**
   * Model StatusHistory
   */

  export type AggregateStatusHistory = {
    _count: StatusHistoryCountAggregateOutputType | null
    _min: StatusHistoryMinAggregateOutputType | null
    _max: StatusHistoryMaxAggregateOutputType | null
  }

  export type StatusHistoryMinAggregateOutputType = {
    id: string | null
    previousStatus: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus | null
    notes: string | null
    createdAt: Date | null
    reportId: string | null
    changedById: string | null
  }

  export type StatusHistoryMaxAggregateOutputType = {
    id: string | null
    previousStatus: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus | null
    notes: string | null
    createdAt: Date | null
    reportId: string | null
    changedById: string | null
  }

  export type StatusHistoryCountAggregateOutputType = {
    id: number
    previousStatus: number
    newStatus: number
    notes: number
    createdAt: number
    reportId: number
    changedById: number
    _all: number
  }


  export type StatusHistoryMinAggregateInputType = {
    id?: true
    previousStatus?: true
    newStatus?: true
    notes?: true
    createdAt?: true
    reportId?: true
    changedById?: true
  }

  export type StatusHistoryMaxAggregateInputType = {
    id?: true
    previousStatus?: true
    newStatus?: true
    notes?: true
    createdAt?: true
    reportId?: true
    changedById?: true
  }

  export type StatusHistoryCountAggregateInputType = {
    id?: true
    previousStatus?: true
    newStatus?: true
    notes?: true
    createdAt?: true
    reportId?: true
    changedById?: true
    _all?: true
  }

  export type StatusHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StatusHistory to aggregate.
     */
    where?: StatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatusHistories to fetch.
     */
    orderBy?: StatusHistoryOrderByWithRelationInput | StatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatusHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StatusHistories
    **/
    _count?: true | StatusHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StatusHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StatusHistoryMaxAggregateInputType
  }

  export type GetStatusHistoryAggregateType<T extends StatusHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateStatusHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStatusHistory[P]>
      : GetScalarType<T[P], AggregateStatusHistory[P]>
  }




  export type StatusHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StatusHistoryWhereInput
    orderBy?: StatusHistoryOrderByWithAggregationInput | StatusHistoryOrderByWithAggregationInput[]
    by: StatusHistoryScalarFieldEnum[] | StatusHistoryScalarFieldEnum
    having?: StatusHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StatusHistoryCountAggregateInputType | true
    _min?: StatusHistoryMinAggregateInputType
    _max?: StatusHistoryMaxAggregateInputType
  }

  export type StatusHistoryGroupByOutputType = {
    id: string
    previousStatus: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus
    notes: string | null
    createdAt: Date
    reportId: string
    changedById: string
    _count: StatusHistoryCountAggregateOutputType | null
    _min: StatusHistoryMinAggregateOutputType | null
    _max: StatusHistoryMaxAggregateOutputType | null
  }

  type GetStatusHistoryGroupByPayload<T extends StatusHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StatusHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StatusHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StatusHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], StatusHistoryGroupByOutputType[P]>
        }
      >
    >


  export type StatusHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    previousStatus?: boolean
    newStatus?: boolean
    notes?: boolean
    createdAt?: boolean
    reportId?: boolean
    changedById?: boolean
    report?: boolean | ReportDefaultArgs<ExtArgs>
    changedBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["statusHistory"]>

  export type StatusHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    previousStatus?: boolean
    newStatus?: boolean
    notes?: boolean
    createdAt?: boolean
    reportId?: boolean
    changedById?: boolean
    report?: boolean | ReportDefaultArgs<ExtArgs>
    changedBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["statusHistory"]>

  export type StatusHistorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    previousStatus?: boolean
    newStatus?: boolean
    notes?: boolean
    createdAt?: boolean
    reportId?: boolean
    changedById?: boolean
    report?: boolean | ReportDefaultArgs<ExtArgs>
    changedBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["statusHistory"]>

  export type StatusHistorySelectScalar = {
    id?: boolean
    previousStatus?: boolean
    newStatus?: boolean
    notes?: boolean
    createdAt?: boolean
    reportId?: boolean
    changedById?: boolean
  }

  export type StatusHistoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "previousStatus" | "newStatus" | "notes" | "createdAt" | "reportId" | "changedById", ExtArgs["result"]["statusHistory"]>
  export type StatusHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | ReportDefaultArgs<ExtArgs>
    changedBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type StatusHistoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | ReportDefaultArgs<ExtArgs>
    changedBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type StatusHistoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | ReportDefaultArgs<ExtArgs>
    changedBy?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $StatusHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StatusHistory"
    objects: {
      report: Prisma.$ReportPayload<ExtArgs>
      changedBy: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      previousStatus: $Enums.ReportStatus | null
      newStatus: $Enums.ReportStatus
      notes: string | null
      createdAt: Date
      reportId: string
      changedById: string
    }, ExtArgs["result"]["statusHistory"]>
    composites: {}
  }

  type StatusHistoryGetPayload<S extends boolean | null | undefined | StatusHistoryDefaultArgs> = $Result.GetResult<Prisma.$StatusHistoryPayload, S>

  type StatusHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StatusHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StatusHistoryCountAggregateInputType | true
    }

  export interface StatusHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StatusHistory'], meta: { name: 'StatusHistory' } }
    /**
     * Find zero or one StatusHistory that matches the filter.
     * @param {StatusHistoryFindUniqueArgs} args - Arguments to find a StatusHistory
     * @example
     * // Get one StatusHistory
     * const statusHistory = await prisma.statusHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StatusHistoryFindUniqueArgs>(args: SelectSubset<T, StatusHistoryFindUniqueArgs<ExtArgs>>): Prisma__StatusHistoryClient<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one StatusHistory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StatusHistoryFindUniqueOrThrowArgs} args - Arguments to find a StatusHistory
     * @example
     * // Get one StatusHistory
     * const statusHistory = await prisma.statusHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StatusHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, StatusHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StatusHistoryClient<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StatusHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusHistoryFindFirstArgs} args - Arguments to find a StatusHistory
     * @example
     * // Get one StatusHistory
     * const statusHistory = await prisma.statusHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StatusHistoryFindFirstArgs>(args?: SelectSubset<T, StatusHistoryFindFirstArgs<ExtArgs>>): Prisma__StatusHistoryClient<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StatusHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusHistoryFindFirstOrThrowArgs} args - Arguments to find a StatusHistory
     * @example
     * // Get one StatusHistory
     * const statusHistory = await prisma.statusHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StatusHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, StatusHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__StatusHistoryClient<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more StatusHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StatusHistories
     * const statusHistories = await prisma.statusHistory.findMany()
     * 
     * // Get first 10 StatusHistories
     * const statusHistories = await prisma.statusHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const statusHistoryWithIdOnly = await prisma.statusHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StatusHistoryFindManyArgs>(args?: SelectSubset<T, StatusHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a StatusHistory.
     * @param {StatusHistoryCreateArgs} args - Arguments to create a StatusHistory.
     * @example
     * // Create one StatusHistory
     * const StatusHistory = await prisma.statusHistory.create({
     *   data: {
     *     // ... data to create a StatusHistory
     *   }
     * })
     * 
     */
    create<T extends StatusHistoryCreateArgs>(args: SelectSubset<T, StatusHistoryCreateArgs<ExtArgs>>): Prisma__StatusHistoryClient<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many StatusHistories.
     * @param {StatusHistoryCreateManyArgs} args - Arguments to create many StatusHistories.
     * @example
     * // Create many StatusHistories
     * const statusHistory = await prisma.statusHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StatusHistoryCreateManyArgs>(args?: SelectSubset<T, StatusHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StatusHistories and returns the data saved in the database.
     * @param {StatusHistoryCreateManyAndReturnArgs} args - Arguments to create many StatusHistories.
     * @example
     * // Create many StatusHistories
     * const statusHistory = await prisma.statusHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StatusHistories and only return the `id`
     * const statusHistoryWithIdOnly = await prisma.statusHistory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StatusHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, StatusHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a StatusHistory.
     * @param {StatusHistoryDeleteArgs} args - Arguments to delete one StatusHistory.
     * @example
     * // Delete one StatusHistory
     * const StatusHistory = await prisma.statusHistory.delete({
     *   where: {
     *     // ... filter to delete one StatusHistory
     *   }
     * })
     * 
     */
    delete<T extends StatusHistoryDeleteArgs>(args: SelectSubset<T, StatusHistoryDeleteArgs<ExtArgs>>): Prisma__StatusHistoryClient<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one StatusHistory.
     * @param {StatusHistoryUpdateArgs} args - Arguments to update one StatusHistory.
     * @example
     * // Update one StatusHistory
     * const statusHistory = await prisma.statusHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StatusHistoryUpdateArgs>(args: SelectSubset<T, StatusHistoryUpdateArgs<ExtArgs>>): Prisma__StatusHistoryClient<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more StatusHistories.
     * @param {StatusHistoryDeleteManyArgs} args - Arguments to filter StatusHistories to delete.
     * @example
     * // Delete a few StatusHistories
     * const { count } = await prisma.statusHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StatusHistoryDeleteManyArgs>(args?: SelectSubset<T, StatusHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StatusHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StatusHistories
     * const statusHistory = await prisma.statusHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StatusHistoryUpdateManyArgs>(args: SelectSubset<T, StatusHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StatusHistories and returns the data updated in the database.
     * @param {StatusHistoryUpdateManyAndReturnArgs} args - Arguments to update many StatusHistories.
     * @example
     * // Update many StatusHistories
     * const statusHistory = await prisma.statusHistory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more StatusHistories and only return the `id`
     * const statusHistoryWithIdOnly = await prisma.statusHistory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StatusHistoryUpdateManyAndReturnArgs>(args: SelectSubset<T, StatusHistoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one StatusHistory.
     * @param {StatusHistoryUpsertArgs} args - Arguments to update or create a StatusHistory.
     * @example
     * // Update or create a StatusHistory
     * const statusHistory = await prisma.statusHistory.upsert({
     *   create: {
     *     // ... data to create a StatusHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StatusHistory we want to update
     *   }
     * })
     */
    upsert<T extends StatusHistoryUpsertArgs>(args: SelectSubset<T, StatusHistoryUpsertArgs<ExtArgs>>): Prisma__StatusHistoryClient<$Result.GetResult<Prisma.$StatusHistoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of StatusHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusHistoryCountArgs} args - Arguments to filter StatusHistories to count.
     * @example
     * // Count the number of StatusHistories
     * const count = await prisma.statusHistory.count({
     *   where: {
     *     // ... the filter for the StatusHistories we want to count
     *   }
     * })
    **/
    count<T extends StatusHistoryCountArgs>(
      args?: Subset<T, StatusHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StatusHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StatusHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StatusHistoryAggregateArgs>(args: Subset<T, StatusHistoryAggregateArgs>): Prisma.PrismaPromise<GetStatusHistoryAggregateType<T>>

    /**
     * Group by StatusHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StatusHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StatusHistoryGroupByArgs['orderBy'] }
        : { orderBy?: StatusHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StatusHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStatusHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StatusHistory model
   */
  readonly fields: StatusHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StatusHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StatusHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    report<T extends ReportDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReportDefaultArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    changedBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the StatusHistory model
   */
  interface StatusHistoryFieldRefs {
    readonly id: FieldRef<"StatusHistory", 'String'>
    readonly previousStatus: FieldRef<"StatusHistory", 'ReportStatus'>
    readonly newStatus: FieldRef<"StatusHistory", 'ReportStatus'>
    readonly notes: FieldRef<"StatusHistory", 'String'>
    readonly createdAt: FieldRef<"StatusHistory", 'DateTime'>
    readonly reportId: FieldRef<"StatusHistory", 'String'>
    readonly changedById: FieldRef<"StatusHistory", 'String'>
  }
    

  // Custom InputTypes
  /**
   * StatusHistory findUnique
   */
  export type StatusHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which StatusHistory to fetch.
     */
    where: StatusHistoryWhereUniqueInput
  }

  /**
   * StatusHistory findUniqueOrThrow
   */
  export type StatusHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which StatusHistory to fetch.
     */
    where: StatusHistoryWhereUniqueInput
  }

  /**
   * StatusHistory findFirst
   */
  export type StatusHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which StatusHistory to fetch.
     */
    where?: StatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatusHistories to fetch.
     */
    orderBy?: StatusHistoryOrderByWithRelationInput | StatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StatusHistories.
     */
    cursor?: StatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatusHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StatusHistories.
     */
    distinct?: StatusHistoryScalarFieldEnum | StatusHistoryScalarFieldEnum[]
  }

  /**
   * StatusHistory findFirstOrThrow
   */
  export type StatusHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which StatusHistory to fetch.
     */
    where?: StatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatusHistories to fetch.
     */
    orderBy?: StatusHistoryOrderByWithRelationInput | StatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StatusHistories.
     */
    cursor?: StatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatusHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StatusHistories.
     */
    distinct?: StatusHistoryScalarFieldEnum | StatusHistoryScalarFieldEnum[]
  }

  /**
   * StatusHistory findMany
   */
  export type StatusHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which StatusHistories to fetch.
     */
    where?: StatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatusHistories to fetch.
     */
    orderBy?: StatusHistoryOrderByWithRelationInput | StatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StatusHistories.
     */
    cursor?: StatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatusHistories.
     */
    skip?: number
    distinct?: StatusHistoryScalarFieldEnum | StatusHistoryScalarFieldEnum[]
  }

  /**
   * StatusHistory create
   */
  export type StatusHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a StatusHistory.
     */
    data: XOR<StatusHistoryCreateInput, StatusHistoryUncheckedCreateInput>
  }

  /**
   * StatusHistory createMany
   */
  export type StatusHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StatusHistories.
     */
    data: StatusHistoryCreateManyInput | StatusHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StatusHistory createManyAndReturn
   */
  export type StatusHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * The data used to create many StatusHistories.
     */
    data: StatusHistoryCreateManyInput | StatusHistoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * StatusHistory update
   */
  export type StatusHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a StatusHistory.
     */
    data: XOR<StatusHistoryUpdateInput, StatusHistoryUncheckedUpdateInput>
    /**
     * Choose, which StatusHistory to update.
     */
    where: StatusHistoryWhereUniqueInput
  }

  /**
   * StatusHistory updateMany
   */
  export type StatusHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StatusHistories.
     */
    data: XOR<StatusHistoryUpdateManyMutationInput, StatusHistoryUncheckedUpdateManyInput>
    /**
     * Filter which StatusHistories to update
     */
    where?: StatusHistoryWhereInput
    /**
     * Limit how many StatusHistories to update.
     */
    limit?: number
  }

  /**
   * StatusHistory updateManyAndReturn
   */
  export type StatusHistoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * The data used to update StatusHistories.
     */
    data: XOR<StatusHistoryUpdateManyMutationInput, StatusHistoryUncheckedUpdateManyInput>
    /**
     * Filter which StatusHistories to update
     */
    where?: StatusHistoryWhereInput
    /**
     * Limit how many StatusHistories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * StatusHistory upsert
   */
  export type StatusHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the StatusHistory to update in case it exists.
     */
    where: StatusHistoryWhereUniqueInput
    /**
     * In case the StatusHistory found by the `where` argument doesn't exist, create a new StatusHistory with this data.
     */
    create: XOR<StatusHistoryCreateInput, StatusHistoryUncheckedCreateInput>
    /**
     * In case the StatusHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StatusHistoryUpdateInput, StatusHistoryUncheckedUpdateInput>
  }

  /**
   * StatusHistory delete
   */
  export type StatusHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
    /**
     * Filter which StatusHistory to delete.
     */
    where: StatusHistoryWhereUniqueInput
  }

  /**
   * StatusHistory deleteMany
   */
  export type StatusHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StatusHistories to delete
     */
    where?: StatusHistoryWhereInput
    /**
     * Limit how many StatusHistories to delete.
     */
    limit?: number
  }

  /**
   * StatusHistory without action
   */
  export type StatusHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusHistory
     */
    select?: StatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusHistory
     */
    omit?: StatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusHistoryInclude<ExtArgs> | null
  }


  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationMinAggregateOutputType = {
    id: string | null
    title: string | null
    message: string | null
    type: $Enums.NotificationType | null
    isRead: boolean | null
    createdAt: Date | null
    userId: string | null
    reportId: string | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: string | null
    title: string | null
    message: string | null
    type: $Enums.NotificationType | null
    isRead: boolean | null
    createdAt: Date | null
    userId: string | null
    reportId: string | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    title: number
    message: number
    type: number
    isRead: number
    createdAt: number
    userId: number
    reportId: number
    _all: number
  }


  export type NotificationMinAggregateInputType = {
    id?: true
    title?: true
    message?: true
    type?: true
    isRead?: true
    createdAt?: true
    userId?: true
    reportId?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    title?: true
    message?: true
    type?: true
    isRead?: true
    createdAt?: true
    userId?: true
    reportId?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    title?: true
    message?: true
    type?: true
    isRead?: true
    createdAt?: true
    userId?: true
    reportId?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: string
    title: string
    message: string
    type: $Enums.NotificationType
    isRead: boolean
    createdAt: Date
    userId: string
    reportId: string | null
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    isRead?: boolean
    createdAt?: boolean
    userId?: boolean
    reportId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    report?: boolean | Notification$reportArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    isRead?: boolean
    createdAt?: boolean
    userId?: boolean
    reportId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    report?: boolean | Notification$reportArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    isRead?: boolean
    createdAt?: boolean
    userId?: boolean
    reportId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    report?: boolean | Notification$reportArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectScalar = {
    id?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    isRead?: boolean
    createdAt?: boolean
    userId?: boolean
    reportId?: boolean
  }

  export type NotificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "message" | "type" | "isRead" | "createdAt" | "userId" | "reportId", ExtArgs["result"]["notification"]>
  export type NotificationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    report?: boolean | Notification$reportArgs<ExtArgs>
  }
  export type NotificationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    report?: boolean | Notification$reportArgs<ExtArgs>
  }
  export type NotificationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    report?: boolean | Notification$reportArgs<ExtArgs>
  }

  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      report: Prisma.$ReportPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      message: string
      type: $Enums.NotificationType
      isRead: boolean
      createdAt: Date
      userId: string
      reportId: string | null
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notifications and returns the data saved in the database.
     * @param {NotificationCreateManyAndReturnArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications and returns the data updated in the database.
     * @param {NotificationUpdateManyAndReturnArgs} args - Arguments to update many Notifications.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NotificationUpdateManyAndReturnArgs>(args: SelectSubset<T, NotificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    report<T extends Notification$reportArgs<ExtArgs> = {}>(args?: Subset<T, Notification$reportArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Notification model
   */
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'String'>
    readonly title: FieldRef<"Notification", 'String'>
    readonly message: FieldRef<"Notification", 'String'>
    readonly type: FieldRef<"Notification", 'NotificationType'>
    readonly isRead: FieldRef<"Notification", 'Boolean'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
    readonly userId: FieldRef<"Notification", 'String'>
    readonly reportId: FieldRef<"Notification", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification createManyAndReturn
   */
  export type NotificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification updateManyAndReturn
   */
  export type NotificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to delete.
     */
    limit?: number
  }

  /**
   * Notification.report
   */
  export type Notification$reportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    where?: ReportWhereInput
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
  }


  /**
   * Model ReportingZone
   */

  export type AggregateReportingZone = {
    _count: ReportingZoneCountAggregateOutputType | null
    _min: ReportingZoneMinAggregateOutputType | null
    _max: ReportingZoneMaxAggregateOutputType | null
  }

  export type ReportingZoneMinAggregateOutputType = {
    id: string | null
    name: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    createdById: string | null
  }

  export type ReportingZoneMaxAggregateOutputType = {
    id: string | null
    name: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    createdById: string | null
  }

  export type ReportingZoneCountAggregateOutputType = {
    id: number
    name: number
    coordinates: number
    isActive: number
    createdAt: number
    updatedAt: number
    createdById: number
    _all: number
  }


  export type ReportingZoneMinAggregateInputType = {
    id?: true
    name?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
  }

  export type ReportingZoneMaxAggregateInputType = {
    id?: true
    name?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
  }

  export type ReportingZoneCountAggregateInputType = {
    id?: true
    name?: true
    coordinates?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
    _all?: true
  }

  export type ReportingZoneAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReportingZone to aggregate.
     */
    where?: ReportingZoneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportingZones to fetch.
     */
    orderBy?: ReportingZoneOrderByWithRelationInput | ReportingZoneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReportingZoneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportingZones from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportingZones.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReportingZones
    **/
    _count?: true | ReportingZoneCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReportingZoneMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReportingZoneMaxAggregateInputType
  }

  export type GetReportingZoneAggregateType<T extends ReportingZoneAggregateArgs> = {
        [P in keyof T & keyof AggregateReportingZone]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReportingZone[P]>
      : GetScalarType<T[P], AggregateReportingZone[P]>
  }




  export type ReportingZoneGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportingZoneWhereInput
    orderBy?: ReportingZoneOrderByWithAggregationInput | ReportingZoneOrderByWithAggregationInput[]
    by: ReportingZoneScalarFieldEnum[] | ReportingZoneScalarFieldEnum
    having?: ReportingZoneScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReportingZoneCountAggregateInputType | true
    _min?: ReportingZoneMinAggregateInputType
    _max?: ReportingZoneMaxAggregateInputType
  }

  export type ReportingZoneGroupByOutputType = {
    id: string
    name: string
    coordinates: JsonValue
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    createdById: string
    _count: ReportingZoneCountAggregateOutputType | null
    _min: ReportingZoneMinAggregateOutputType | null
    _max: ReportingZoneMaxAggregateOutputType | null
  }

  type GetReportingZoneGroupByPayload<T extends ReportingZoneGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReportingZoneGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReportingZoneGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReportingZoneGroupByOutputType[P]>
            : GetScalarType<T[P], ReportingZoneGroupByOutputType[P]>
        }
      >
    >


  export type ReportingZoneSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    coordinates?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportingZone"]>

  export type ReportingZoneSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    coordinates?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportingZone"]>

  export type ReportingZoneSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    coordinates?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportingZone"]>

  export type ReportingZoneSelectScalar = {
    id?: boolean
    name?: boolean
    coordinates?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
  }

  export type ReportingZoneOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "coordinates" | "isActive" | "createdAt" | "updatedAt" | "createdById", ExtArgs["result"]["reportingZone"]>
  export type ReportingZoneInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ReportingZoneIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ReportingZoneIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ReportingZonePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReportingZone"
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      coordinates: Prisma.JsonValue
      isActive: boolean
      createdAt: Date
      updatedAt: Date
      createdById: string
    }, ExtArgs["result"]["reportingZone"]>
    composites: {}
  }

  type ReportingZoneGetPayload<S extends boolean | null | undefined | ReportingZoneDefaultArgs> = $Result.GetResult<Prisma.$ReportingZonePayload, S>

  type ReportingZoneCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReportingZoneFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReportingZoneCountAggregateInputType | true
    }

  export interface ReportingZoneDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReportingZone'], meta: { name: 'ReportingZone' } }
    /**
     * Find zero or one ReportingZone that matches the filter.
     * @param {ReportingZoneFindUniqueArgs} args - Arguments to find a ReportingZone
     * @example
     * // Get one ReportingZone
     * const reportingZone = await prisma.reportingZone.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReportingZoneFindUniqueArgs>(args: SelectSubset<T, ReportingZoneFindUniqueArgs<ExtArgs>>): Prisma__ReportingZoneClient<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReportingZone that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReportingZoneFindUniqueOrThrowArgs} args - Arguments to find a ReportingZone
     * @example
     * // Get one ReportingZone
     * const reportingZone = await prisma.reportingZone.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReportingZoneFindUniqueOrThrowArgs>(args: SelectSubset<T, ReportingZoneFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReportingZoneClient<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReportingZone that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportingZoneFindFirstArgs} args - Arguments to find a ReportingZone
     * @example
     * // Get one ReportingZone
     * const reportingZone = await prisma.reportingZone.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReportingZoneFindFirstArgs>(args?: SelectSubset<T, ReportingZoneFindFirstArgs<ExtArgs>>): Prisma__ReportingZoneClient<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReportingZone that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportingZoneFindFirstOrThrowArgs} args - Arguments to find a ReportingZone
     * @example
     * // Get one ReportingZone
     * const reportingZone = await prisma.reportingZone.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReportingZoneFindFirstOrThrowArgs>(args?: SelectSubset<T, ReportingZoneFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReportingZoneClient<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReportingZones that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportingZoneFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReportingZones
     * const reportingZones = await prisma.reportingZone.findMany()
     * 
     * // Get first 10 ReportingZones
     * const reportingZones = await prisma.reportingZone.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reportingZoneWithIdOnly = await prisma.reportingZone.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReportingZoneFindManyArgs>(args?: SelectSubset<T, ReportingZoneFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReportingZone.
     * @param {ReportingZoneCreateArgs} args - Arguments to create a ReportingZone.
     * @example
     * // Create one ReportingZone
     * const ReportingZone = await prisma.reportingZone.create({
     *   data: {
     *     // ... data to create a ReportingZone
     *   }
     * })
     * 
     */
    create<T extends ReportingZoneCreateArgs>(args: SelectSubset<T, ReportingZoneCreateArgs<ExtArgs>>): Prisma__ReportingZoneClient<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReportingZones.
     * @param {ReportingZoneCreateManyArgs} args - Arguments to create many ReportingZones.
     * @example
     * // Create many ReportingZones
     * const reportingZone = await prisma.reportingZone.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReportingZoneCreateManyArgs>(args?: SelectSubset<T, ReportingZoneCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReportingZones and returns the data saved in the database.
     * @param {ReportingZoneCreateManyAndReturnArgs} args - Arguments to create many ReportingZones.
     * @example
     * // Create many ReportingZones
     * const reportingZone = await prisma.reportingZone.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReportingZones and only return the `id`
     * const reportingZoneWithIdOnly = await prisma.reportingZone.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReportingZoneCreateManyAndReturnArgs>(args?: SelectSubset<T, ReportingZoneCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReportingZone.
     * @param {ReportingZoneDeleteArgs} args - Arguments to delete one ReportingZone.
     * @example
     * // Delete one ReportingZone
     * const ReportingZone = await prisma.reportingZone.delete({
     *   where: {
     *     // ... filter to delete one ReportingZone
     *   }
     * })
     * 
     */
    delete<T extends ReportingZoneDeleteArgs>(args: SelectSubset<T, ReportingZoneDeleteArgs<ExtArgs>>): Prisma__ReportingZoneClient<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReportingZone.
     * @param {ReportingZoneUpdateArgs} args - Arguments to update one ReportingZone.
     * @example
     * // Update one ReportingZone
     * const reportingZone = await prisma.reportingZone.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReportingZoneUpdateArgs>(args: SelectSubset<T, ReportingZoneUpdateArgs<ExtArgs>>): Prisma__ReportingZoneClient<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReportingZones.
     * @param {ReportingZoneDeleteManyArgs} args - Arguments to filter ReportingZones to delete.
     * @example
     * // Delete a few ReportingZones
     * const { count } = await prisma.reportingZone.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReportingZoneDeleteManyArgs>(args?: SelectSubset<T, ReportingZoneDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReportingZones.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportingZoneUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReportingZones
     * const reportingZone = await prisma.reportingZone.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReportingZoneUpdateManyArgs>(args: SelectSubset<T, ReportingZoneUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReportingZones and returns the data updated in the database.
     * @param {ReportingZoneUpdateManyAndReturnArgs} args - Arguments to update many ReportingZones.
     * @example
     * // Update many ReportingZones
     * const reportingZone = await prisma.reportingZone.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReportingZones and only return the `id`
     * const reportingZoneWithIdOnly = await prisma.reportingZone.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReportingZoneUpdateManyAndReturnArgs>(args: SelectSubset<T, ReportingZoneUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReportingZone.
     * @param {ReportingZoneUpsertArgs} args - Arguments to update or create a ReportingZone.
     * @example
     * // Update or create a ReportingZone
     * const reportingZone = await prisma.reportingZone.upsert({
     *   create: {
     *     // ... data to create a ReportingZone
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReportingZone we want to update
     *   }
     * })
     */
    upsert<T extends ReportingZoneUpsertArgs>(args: SelectSubset<T, ReportingZoneUpsertArgs<ExtArgs>>): Prisma__ReportingZoneClient<$Result.GetResult<Prisma.$ReportingZonePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReportingZones.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportingZoneCountArgs} args - Arguments to filter ReportingZones to count.
     * @example
     * // Count the number of ReportingZones
     * const count = await prisma.reportingZone.count({
     *   where: {
     *     // ... the filter for the ReportingZones we want to count
     *   }
     * })
    **/
    count<T extends ReportingZoneCountArgs>(
      args?: Subset<T, ReportingZoneCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReportingZoneCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReportingZone.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportingZoneAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReportingZoneAggregateArgs>(args: Subset<T, ReportingZoneAggregateArgs>): Prisma.PrismaPromise<GetReportingZoneAggregateType<T>>

    /**
     * Group by ReportingZone.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportingZoneGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReportingZoneGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReportingZoneGroupByArgs['orderBy'] }
        : { orderBy?: ReportingZoneGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReportingZoneGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReportingZoneGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReportingZone model
   */
  readonly fields: ReportingZoneFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReportingZone.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReportingZoneClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReportingZone model
   */
  interface ReportingZoneFieldRefs {
    readonly id: FieldRef<"ReportingZone", 'String'>
    readonly name: FieldRef<"ReportingZone", 'String'>
    readonly coordinates: FieldRef<"ReportingZone", 'Json'>
    readonly isActive: FieldRef<"ReportingZone", 'Boolean'>
    readonly createdAt: FieldRef<"ReportingZone", 'DateTime'>
    readonly updatedAt: FieldRef<"ReportingZone", 'DateTime'>
    readonly createdById: FieldRef<"ReportingZone", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ReportingZone findUnique
   */
  export type ReportingZoneFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
    /**
     * Filter, which ReportingZone to fetch.
     */
    where: ReportingZoneWhereUniqueInput
  }

  /**
   * ReportingZone findUniqueOrThrow
   */
  export type ReportingZoneFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
    /**
     * Filter, which ReportingZone to fetch.
     */
    where: ReportingZoneWhereUniqueInput
  }

  /**
   * ReportingZone findFirst
   */
  export type ReportingZoneFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
    /**
     * Filter, which ReportingZone to fetch.
     */
    where?: ReportingZoneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportingZones to fetch.
     */
    orderBy?: ReportingZoneOrderByWithRelationInput | ReportingZoneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReportingZones.
     */
    cursor?: ReportingZoneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportingZones from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportingZones.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportingZones.
     */
    distinct?: ReportingZoneScalarFieldEnum | ReportingZoneScalarFieldEnum[]
  }

  /**
   * ReportingZone findFirstOrThrow
   */
  export type ReportingZoneFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
    /**
     * Filter, which ReportingZone to fetch.
     */
    where?: ReportingZoneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportingZones to fetch.
     */
    orderBy?: ReportingZoneOrderByWithRelationInput | ReportingZoneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReportingZones.
     */
    cursor?: ReportingZoneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportingZones from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportingZones.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportingZones.
     */
    distinct?: ReportingZoneScalarFieldEnum | ReportingZoneScalarFieldEnum[]
  }

  /**
   * ReportingZone findMany
   */
  export type ReportingZoneFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
    /**
     * Filter, which ReportingZones to fetch.
     */
    where?: ReportingZoneWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportingZones to fetch.
     */
    orderBy?: ReportingZoneOrderByWithRelationInput | ReportingZoneOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReportingZones.
     */
    cursor?: ReportingZoneWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportingZones from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportingZones.
     */
    skip?: number
    distinct?: ReportingZoneScalarFieldEnum | ReportingZoneScalarFieldEnum[]
  }

  /**
   * ReportingZone create
   */
  export type ReportingZoneCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
    /**
     * The data needed to create a ReportingZone.
     */
    data: XOR<ReportingZoneCreateInput, ReportingZoneUncheckedCreateInput>
  }

  /**
   * ReportingZone createMany
   */
  export type ReportingZoneCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReportingZones.
     */
    data: ReportingZoneCreateManyInput | ReportingZoneCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReportingZone createManyAndReturn
   */
  export type ReportingZoneCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * The data used to create many ReportingZones.
     */
    data: ReportingZoneCreateManyInput | ReportingZoneCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReportingZone update
   */
  export type ReportingZoneUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
    /**
     * The data needed to update a ReportingZone.
     */
    data: XOR<ReportingZoneUpdateInput, ReportingZoneUncheckedUpdateInput>
    /**
     * Choose, which ReportingZone to update.
     */
    where: ReportingZoneWhereUniqueInput
  }

  /**
   * ReportingZone updateMany
   */
  export type ReportingZoneUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReportingZones.
     */
    data: XOR<ReportingZoneUpdateManyMutationInput, ReportingZoneUncheckedUpdateManyInput>
    /**
     * Filter which ReportingZones to update
     */
    where?: ReportingZoneWhereInput
    /**
     * Limit how many ReportingZones to update.
     */
    limit?: number
  }

  /**
   * ReportingZone updateManyAndReturn
   */
  export type ReportingZoneUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * The data used to update ReportingZones.
     */
    data: XOR<ReportingZoneUpdateManyMutationInput, ReportingZoneUncheckedUpdateManyInput>
    /**
     * Filter which ReportingZones to update
     */
    where?: ReportingZoneWhereInput
    /**
     * Limit how many ReportingZones to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReportingZone upsert
   */
  export type ReportingZoneUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
    /**
     * The filter to search for the ReportingZone to update in case it exists.
     */
    where: ReportingZoneWhereUniqueInput
    /**
     * In case the ReportingZone found by the `where` argument doesn't exist, create a new ReportingZone with this data.
     */
    create: XOR<ReportingZoneCreateInput, ReportingZoneUncheckedCreateInput>
    /**
     * In case the ReportingZone was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReportingZoneUpdateInput, ReportingZoneUncheckedUpdateInput>
  }

  /**
   * ReportingZone delete
   */
  export type ReportingZoneDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
    /**
     * Filter which ReportingZone to delete.
     */
    where: ReportingZoneWhereUniqueInput
  }

  /**
   * ReportingZone deleteMany
   */
  export type ReportingZoneDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReportingZones to delete
     */
    where?: ReportingZoneWhereInput
    /**
     * Limit how many ReportingZones to delete.
     */
    limit?: number
  }

  /**
   * ReportingZone without action
   */
  export type ReportingZoneDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportingZone
     */
    select?: ReportingZoneSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportingZone
     */
    omit?: ReportingZoneOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportingZoneInclude<ExtArgs> | null
  }


  /**
   * Model CleanupSchedule
   */

  export type AggregateCleanupSchedule = {
    _count: CleanupScheduleCountAggregateOutputType | null
    _avg: CleanupScheduleAvgAggregateOutputType | null
    _sum: CleanupScheduleSumAggregateOutputType | null
    _min: CleanupScheduleMinAggregateOutputType | null
    _max: CleanupScheduleMaxAggregateOutputType | null
  }

  export type CleanupScheduleAvgAggregateOutputType = {
    latitude: number | null
    longitude: number | null
  }

  export type CleanupScheduleSumAggregateOutputType = {
    latitude: number | null
    longitude: number | null
  }

  export type CleanupScheduleMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    barangay: string | null
    latitude: number | null
    longitude: number | null
    scheduledAt: Date | null
    status: $Enums.CleanupScheduleStatus | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdById: string | null
    verifiedById: string | null
    verifiedAt: Date | null
  }

  export type CleanupScheduleMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    barangay: string | null
    latitude: number | null
    longitude: number | null
    scheduledAt: Date | null
    status: $Enums.CleanupScheduleStatus | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdById: string | null
    verifiedById: string | null
    verifiedAt: Date | null
  }

  export type CleanupScheduleCountAggregateOutputType = {
    id: number
    title: number
    description: number
    barangay: number
    latitude: number
    longitude: number
    scheduledAt: number
    status: number
    notes: number
    createdAt: number
    updatedAt: number
    createdById: number
    verifiedById: number
    verifiedAt: number
    equipment: number
    _all: number
  }


  export type CleanupScheduleAvgAggregateInputType = {
    latitude?: true
    longitude?: true
  }

  export type CleanupScheduleSumAggregateInputType = {
    latitude?: true
    longitude?: true
  }

  export type CleanupScheduleMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    barangay?: true
    latitude?: true
    longitude?: true
    scheduledAt?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
    verifiedById?: true
    verifiedAt?: true
  }

  export type CleanupScheduleMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    barangay?: true
    latitude?: true
    longitude?: true
    scheduledAt?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
    verifiedById?: true
    verifiedAt?: true
  }

  export type CleanupScheduleCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    barangay?: true
    latitude?: true
    longitude?: true
    scheduledAt?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
    verifiedById?: true
    verifiedAt?: true
    equipment?: true
    _all?: true
  }

  export type CleanupScheduleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CleanupSchedule to aggregate.
     */
    where?: CleanupScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleanupSchedules to fetch.
     */
    orderBy?: CleanupScheduleOrderByWithRelationInput | CleanupScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CleanupScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleanupSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleanupSchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CleanupSchedules
    **/
    _count?: true | CleanupScheduleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CleanupScheduleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CleanupScheduleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CleanupScheduleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CleanupScheduleMaxAggregateInputType
  }

  export type GetCleanupScheduleAggregateType<T extends CleanupScheduleAggregateArgs> = {
        [P in keyof T & keyof AggregateCleanupSchedule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCleanupSchedule[P]>
      : GetScalarType<T[P], AggregateCleanupSchedule[P]>
  }




  export type CleanupScheduleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleanupScheduleWhereInput
    orderBy?: CleanupScheduleOrderByWithAggregationInput | CleanupScheduleOrderByWithAggregationInput[]
    by: CleanupScheduleScalarFieldEnum[] | CleanupScheduleScalarFieldEnum
    having?: CleanupScheduleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CleanupScheduleCountAggregateInputType | true
    _avg?: CleanupScheduleAvgAggregateInputType
    _sum?: CleanupScheduleSumAggregateInputType
    _min?: CleanupScheduleMinAggregateInputType
    _max?: CleanupScheduleMaxAggregateInputType
  }

  export type CleanupScheduleGroupByOutputType = {
    id: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date
    status: $Enums.CleanupScheduleStatus
    notes: string | null
    createdAt: Date
    updatedAt: Date
    createdById: string
    verifiedById: string | null
    verifiedAt: Date | null
    equipment: string[]
    _count: CleanupScheduleCountAggregateOutputType | null
    _avg: CleanupScheduleAvgAggregateOutputType | null
    _sum: CleanupScheduleSumAggregateOutputType | null
    _min: CleanupScheduleMinAggregateOutputType | null
    _max: CleanupScheduleMaxAggregateOutputType | null
  }

  type GetCleanupScheduleGroupByPayload<T extends CleanupScheduleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CleanupScheduleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CleanupScheduleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CleanupScheduleGroupByOutputType[P]>
            : GetScalarType<T[P], CleanupScheduleGroupByOutputType[P]>
        }
      >
    >


  export type CleanupScheduleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    barangay?: boolean
    latitude?: boolean
    longitude?: boolean
    scheduledAt?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    verifiedById?: boolean
    verifiedAt?: boolean
    equipment?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | CleanupSchedule$verifiedByArgs<ExtArgs>
    workers?: boolean | CleanupSchedule$workersArgs<ExtArgs>
    reports?: boolean | CleanupSchedule$reportsArgs<ExtArgs>
    _count?: boolean | CleanupScheduleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cleanupSchedule"]>

  export type CleanupScheduleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    barangay?: boolean
    latitude?: boolean
    longitude?: boolean
    scheduledAt?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    verifiedById?: boolean
    verifiedAt?: boolean
    equipment?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | CleanupSchedule$verifiedByArgs<ExtArgs>
  }, ExtArgs["result"]["cleanupSchedule"]>

  export type CleanupScheduleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    barangay?: boolean
    latitude?: boolean
    longitude?: boolean
    scheduledAt?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    verifiedById?: boolean
    verifiedAt?: boolean
    equipment?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | CleanupSchedule$verifiedByArgs<ExtArgs>
  }, ExtArgs["result"]["cleanupSchedule"]>

  export type CleanupScheduleSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    barangay?: boolean
    latitude?: boolean
    longitude?: boolean
    scheduledAt?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    verifiedById?: boolean
    verifiedAt?: boolean
    equipment?: boolean
  }

  export type CleanupScheduleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "barangay" | "latitude" | "longitude" | "scheduledAt" | "status" | "notes" | "createdAt" | "updatedAt" | "createdById" | "verifiedById" | "verifiedAt" | "equipment", ExtArgs["result"]["cleanupSchedule"]>
  export type CleanupScheduleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | CleanupSchedule$verifiedByArgs<ExtArgs>
    workers?: boolean | CleanupSchedule$workersArgs<ExtArgs>
    reports?: boolean | CleanupSchedule$reportsArgs<ExtArgs>
    _count?: boolean | CleanupScheduleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CleanupScheduleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | CleanupSchedule$verifiedByArgs<ExtArgs>
  }
  export type CleanupScheduleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    verifiedBy?: boolean | CleanupSchedule$verifiedByArgs<ExtArgs>
  }

  export type $CleanupSchedulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CleanupSchedule"
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs>
      verifiedBy: Prisma.$UserPayload<ExtArgs> | null
      workers: Prisma.$CleanupScheduleWorkerPayload<ExtArgs>[]
      reports: Prisma.$ReportPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string
      barangay: string
      latitude: number
      longitude: number
      scheduledAt: Date
      status: $Enums.CleanupScheduleStatus
      notes: string | null
      createdAt: Date
      updatedAt: Date
      createdById: string
      verifiedById: string | null
      verifiedAt: Date | null
      equipment: string[]
    }, ExtArgs["result"]["cleanupSchedule"]>
    composites: {}
  }

  type CleanupScheduleGetPayload<S extends boolean | null | undefined | CleanupScheduleDefaultArgs> = $Result.GetResult<Prisma.$CleanupSchedulePayload, S>

  type CleanupScheduleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CleanupScheduleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CleanupScheduleCountAggregateInputType | true
    }

  export interface CleanupScheduleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CleanupSchedule'], meta: { name: 'CleanupSchedule' } }
    /**
     * Find zero or one CleanupSchedule that matches the filter.
     * @param {CleanupScheduleFindUniqueArgs} args - Arguments to find a CleanupSchedule
     * @example
     * // Get one CleanupSchedule
     * const cleanupSchedule = await prisma.cleanupSchedule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CleanupScheduleFindUniqueArgs>(args: SelectSubset<T, CleanupScheduleFindUniqueArgs<ExtArgs>>): Prisma__CleanupScheduleClient<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CleanupSchedule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CleanupScheduleFindUniqueOrThrowArgs} args - Arguments to find a CleanupSchedule
     * @example
     * // Get one CleanupSchedule
     * const cleanupSchedule = await prisma.cleanupSchedule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CleanupScheduleFindUniqueOrThrowArgs>(args: SelectSubset<T, CleanupScheduleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CleanupScheduleClient<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CleanupSchedule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleFindFirstArgs} args - Arguments to find a CleanupSchedule
     * @example
     * // Get one CleanupSchedule
     * const cleanupSchedule = await prisma.cleanupSchedule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CleanupScheduleFindFirstArgs>(args?: SelectSubset<T, CleanupScheduleFindFirstArgs<ExtArgs>>): Prisma__CleanupScheduleClient<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CleanupSchedule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleFindFirstOrThrowArgs} args - Arguments to find a CleanupSchedule
     * @example
     * // Get one CleanupSchedule
     * const cleanupSchedule = await prisma.cleanupSchedule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CleanupScheduleFindFirstOrThrowArgs>(args?: SelectSubset<T, CleanupScheduleFindFirstOrThrowArgs<ExtArgs>>): Prisma__CleanupScheduleClient<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CleanupSchedules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CleanupSchedules
     * const cleanupSchedules = await prisma.cleanupSchedule.findMany()
     * 
     * // Get first 10 CleanupSchedules
     * const cleanupSchedules = await prisma.cleanupSchedule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cleanupScheduleWithIdOnly = await prisma.cleanupSchedule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CleanupScheduleFindManyArgs>(args?: SelectSubset<T, CleanupScheduleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CleanupSchedule.
     * @param {CleanupScheduleCreateArgs} args - Arguments to create a CleanupSchedule.
     * @example
     * // Create one CleanupSchedule
     * const CleanupSchedule = await prisma.cleanupSchedule.create({
     *   data: {
     *     // ... data to create a CleanupSchedule
     *   }
     * })
     * 
     */
    create<T extends CleanupScheduleCreateArgs>(args: SelectSubset<T, CleanupScheduleCreateArgs<ExtArgs>>): Prisma__CleanupScheduleClient<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CleanupSchedules.
     * @param {CleanupScheduleCreateManyArgs} args - Arguments to create many CleanupSchedules.
     * @example
     * // Create many CleanupSchedules
     * const cleanupSchedule = await prisma.cleanupSchedule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CleanupScheduleCreateManyArgs>(args?: SelectSubset<T, CleanupScheduleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CleanupSchedules and returns the data saved in the database.
     * @param {CleanupScheduleCreateManyAndReturnArgs} args - Arguments to create many CleanupSchedules.
     * @example
     * // Create many CleanupSchedules
     * const cleanupSchedule = await prisma.cleanupSchedule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CleanupSchedules and only return the `id`
     * const cleanupScheduleWithIdOnly = await prisma.cleanupSchedule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CleanupScheduleCreateManyAndReturnArgs>(args?: SelectSubset<T, CleanupScheduleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CleanupSchedule.
     * @param {CleanupScheduleDeleteArgs} args - Arguments to delete one CleanupSchedule.
     * @example
     * // Delete one CleanupSchedule
     * const CleanupSchedule = await prisma.cleanupSchedule.delete({
     *   where: {
     *     // ... filter to delete one CleanupSchedule
     *   }
     * })
     * 
     */
    delete<T extends CleanupScheduleDeleteArgs>(args: SelectSubset<T, CleanupScheduleDeleteArgs<ExtArgs>>): Prisma__CleanupScheduleClient<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CleanupSchedule.
     * @param {CleanupScheduleUpdateArgs} args - Arguments to update one CleanupSchedule.
     * @example
     * // Update one CleanupSchedule
     * const cleanupSchedule = await prisma.cleanupSchedule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CleanupScheduleUpdateArgs>(args: SelectSubset<T, CleanupScheduleUpdateArgs<ExtArgs>>): Prisma__CleanupScheduleClient<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CleanupSchedules.
     * @param {CleanupScheduleDeleteManyArgs} args - Arguments to filter CleanupSchedules to delete.
     * @example
     * // Delete a few CleanupSchedules
     * const { count } = await prisma.cleanupSchedule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CleanupScheduleDeleteManyArgs>(args?: SelectSubset<T, CleanupScheduleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CleanupSchedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CleanupSchedules
     * const cleanupSchedule = await prisma.cleanupSchedule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CleanupScheduleUpdateManyArgs>(args: SelectSubset<T, CleanupScheduleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CleanupSchedules and returns the data updated in the database.
     * @param {CleanupScheduleUpdateManyAndReturnArgs} args - Arguments to update many CleanupSchedules.
     * @example
     * // Update many CleanupSchedules
     * const cleanupSchedule = await prisma.cleanupSchedule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CleanupSchedules and only return the `id`
     * const cleanupScheduleWithIdOnly = await prisma.cleanupSchedule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CleanupScheduleUpdateManyAndReturnArgs>(args: SelectSubset<T, CleanupScheduleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CleanupSchedule.
     * @param {CleanupScheduleUpsertArgs} args - Arguments to update or create a CleanupSchedule.
     * @example
     * // Update or create a CleanupSchedule
     * const cleanupSchedule = await prisma.cleanupSchedule.upsert({
     *   create: {
     *     // ... data to create a CleanupSchedule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CleanupSchedule we want to update
     *   }
     * })
     */
    upsert<T extends CleanupScheduleUpsertArgs>(args: SelectSubset<T, CleanupScheduleUpsertArgs<ExtArgs>>): Prisma__CleanupScheduleClient<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CleanupSchedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleCountArgs} args - Arguments to filter CleanupSchedules to count.
     * @example
     * // Count the number of CleanupSchedules
     * const count = await prisma.cleanupSchedule.count({
     *   where: {
     *     // ... the filter for the CleanupSchedules we want to count
     *   }
     * })
    **/
    count<T extends CleanupScheduleCountArgs>(
      args?: Subset<T, CleanupScheduleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CleanupScheduleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CleanupSchedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CleanupScheduleAggregateArgs>(args: Subset<T, CleanupScheduleAggregateArgs>): Prisma.PrismaPromise<GetCleanupScheduleAggregateType<T>>

    /**
     * Group by CleanupSchedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CleanupScheduleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CleanupScheduleGroupByArgs['orderBy'] }
        : { orderBy?: CleanupScheduleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CleanupScheduleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCleanupScheduleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CleanupSchedule model
   */
  readonly fields: CleanupScheduleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CleanupSchedule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CleanupScheduleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    verifiedBy<T extends CleanupSchedule$verifiedByArgs<ExtArgs> = {}>(args?: Subset<T, CleanupSchedule$verifiedByArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    workers<T extends CleanupSchedule$workersArgs<ExtArgs> = {}>(args?: Subset<T, CleanupSchedule$workersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    reports<T extends CleanupSchedule$reportsArgs<ExtArgs> = {}>(args?: Subset<T, CleanupSchedule$reportsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CleanupSchedule model
   */
  interface CleanupScheduleFieldRefs {
    readonly id: FieldRef<"CleanupSchedule", 'String'>
    readonly title: FieldRef<"CleanupSchedule", 'String'>
    readonly description: FieldRef<"CleanupSchedule", 'String'>
    readonly barangay: FieldRef<"CleanupSchedule", 'String'>
    readonly latitude: FieldRef<"CleanupSchedule", 'Float'>
    readonly longitude: FieldRef<"CleanupSchedule", 'Float'>
    readonly scheduledAt: FieldRef<"CleanupSchedule", 'DateTime'>
    readonly status: FieldRef<"CleanupSchedule", 'CleanupScheduleStatus'>
    readonly notes: FieldRef<"CleanupSchedule", 'String'>
    readonly createdAt: FieldRef<"CleanupSchedule", 'DateTime'>
    readonly updatedAt: FieldRef<"CleanupSchedule", 'DateTime'>
    readonly createdById: FieldRef<"CleanupSchedule", 'String'>
    readonly verifiedById: FieldRef<"CleanupSchedule", 'String'>
    readonly verifiedAt: FieldRef<"CleanupSchedule", 'DateTime'>
    readonly equipment: FieldRef<"CleanupSchedule", 'String[]'>
  }
    

  // Custom InputTypes
  /**
   * CleanupSchedule findUnique
   */
  export type CleanupScheduleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    /**
     * Filter, which CleanupSchedule to fetch.
     */
    where: CleanupScheduleWhereUniqueInput
  }

  /**
   * CleanupSchedule findUniqueOrThrow
   */
  export type CleanupScheduleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    /**
     * Filter, which CleanupSchedule to fetch.
     */
    where: CleanupScheduleWhereUniqueInput
  }

  /**
   * CleanupSchedule findFirst
   */
  export type CleanupScheduleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    /**
     * Filter, which CleanupSchedule to fetch.
     */
    where?: CleanupScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleanupSchedules to fetch.
     */
    orderBy?: CleanupScheduleOrderByWithRelationInput | CleanupScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CleanupSchedules.
     */
    cursor?: CleanupScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleanupSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleanupSchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CleanupSchedules.
     */
    distinct?: CleanupScheduleScalarFieldEnum | CleanupScheduleScalarFieldEnum[]
  }

  /**
   * CleanupSchedule findFirstOrThrow
   */
  export type CleanupScheduleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    /**
     * Filter, which CleanupSchedule to fetch.
     */
    where?: CleanupScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleanupSchedules to fetch.
     */
    orderBy?: CleanupScheduleOrderByWithRelationInput | CleanupScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CleanupSchedules.
     */
    cursor?: CleanupScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleanupSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleanupSchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CleanupSchedules.
     */
    distinct?: CleanupScheduleScalarFieldEnum | CleanupScheduleScalarFieldEnum[]
  }

  /**
   * CleanupSchedule findMany
   */
  export type CleanupScheduleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    /**
     * Filter, which CleanupSchedules to fetch.
     */
    where?: CleanupScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleanupSchedules to fetch.
     */
    orderBy?: CleanupScheduleOrderByWithRelationInput | CleanupScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CleanupSchedules.
     */
    cursor?: CleanupScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleanupSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleanupSchedules.
     */
    skip?: number
    distinct?: CleanupScheduleScalarFieldEnum | CleanupScheduleScalarFieldEnum[]
  }

  /**
   * CleanupSchedule create
   */
  export type CleanupScheduleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    /**
     * The data needed to create a CleanupSchedule.
     */
    data: XOR<CleanupScheduleCreateInput, CleanupScheduleUncheckedCreateInput>
  }

  /**
   * CleanupSchedule createMany
   */
  export type CleanupScheduleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CleanupSchedules.
     */
    data: CleanupScheduleCreateManyInput | CleanupScheduleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CleanupSchedule createManyAndReturn
   */
  export type CleanupScheduleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * The data used to create many CleanupSchedules.
     */
    data: CleanupScheduleCreateManyInput | CleanupScheduleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CleanupSchedule update
   */
  export type CleanupScheduleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    /**
     * The data needed to update a CleanupSchedule.
     */
    data: XOR<CleanupScheduleUpdateInput, CleanupScheduleUncheckedUpdateInput>
    /**
     * Choose, which CleanupSchedule to update.
     */
    where: CleanupScheduleWhereUniqueInput
  }

  /**
   * CleanupSchedule updateMany
   */
  export type CleanupScheduleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CleanupSchedules.
     */
    data: XOR<CleanupScheduleUpdateManyMutationInput, CleanupScheduleUncheckedUpdateManyInput>
    /**
     * Filter which CleanupSchedules to update
     */
    where?: CleanupScheduleWhereInput
    /**
     * Limit how many CleanupSchedules to update.
     */
    limit?: number
  }

  /**
   * CleanupSchedule updateManyAndReturn
   */
  export type CleanupScheduleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * The data used to update CleanupSchedules.
     */
    data: XOR<CleanupScheduleUpdateManyMutationInput, CleanupScheduleUncheckedUpdateManyInput>
    /**
     * Filter which CleanupSchedules to update
     */
    where?: CleanupScheduleWhereInput
    /**
     * Limit how many CleanupSchedules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CleanupSchedule upsert
   */
  export type CleanupScheduleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    /**
     * The filter to search for the CleanupSchedule to update in case it exists.
     */
    where: CleanupScheduleWhereUniqueInput
    /**
     * In case the CleanupSchedule found by the `where` argument doesn't exist, create a new CleanupSchedule with this data.
     */
    create: XOR<CleanupScheduleCreateInput, CleanupScheduleUncheckedCreateInput>
    /**
     * In case the CleanupSchedule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CleanupScheduleUpdateInput, CleanupScheduleUncheckedUpdateInput>
  }

  /**
   * CleanupSchedule delete
   */
  export type CleanupScheduleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
    /**
     * Filter which CleanupSchedule to delete.
     */
    where: CleanupScheduleWhereUniqueInput
  }

  /**
   * CleanupSchedule deleteMany
   */
  export type CleanupScheduleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CleanupSchedules to delete
     */
    where?: CleanupScheduleWhereInput
    /**
     * Limit how many CleanupSchedules to delete.
     */
    limit?: number
  }

  /**
   * CleanupSchedule.verifiedBy
   */
  export type CleanupSchedule$verifiedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * CleanupSchedule.workers
   */
  export type CleanupSchedule$workersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    where?: CleanupScheduleWorkerWhereInput
    orderBy?: CleanupScheduleWorkerOrderByWithRelationInput | CleanupScheduleWorkerOrderByWithRelationInput[]
    cursor?: CleanupScheduleWorkerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CleanupScheduleWorkerScalarFieldEnum | CleanupScheduleWorkerScalarFieldEnum[]
  }

  /**
   * CleanupSchedule.reports
   */
  export type CleanupSchedule$reportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Report
     */
    select?: ReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Report
     */
    omit?: ReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportInclude<ExtArgs> | null
    where?: ReportWhereInput
    orderBy?: ReportOrderByWithRelationInput | ReportOrderByWithRelationInput[]
    cursor?: ReportWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReportScalarFieldEnum | ReportScalarFieldEnum[]
  }

  /**
   * CleanupSchedule without action
   */
  export type CleanupScheduleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupSchedule
     */
    select?: CleanupScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupSchedule
     */
    omit?: CleanupScheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleInclude<ExtArgs> | null
  }


  /**
   * Model CleanupScheduleWorker
   */

  export type AggregateCleanupScheduleWorker = {
    _count: CleanupScheduleWorkerCountAggregateOutputType | null
    _min: CleanupScheduleWorkerMinAggregateOutputType | null
    _max: CleanupScheduleWorkerMaxAggregateOutputType | null
  }

  export type CleanupScheduleWorkerMinAggregateOutputType = {
    id: string | null
    assignedAt: Date | null
    scheduleId: string | null
    workerId: string | null
  }

  export type CleanupScheduleWorkerMaxAggregateOutputType = {
    id: string | null
    assignedAt: Date | null
    scheduleId: string | null
    workerId: string | null
  }

  export type CleanupScheduleWorkerCountAggregateOutputType = {
    id: number
    assignedAt: number
    scheduleId: number
    workerId: number
    _all: number
  }


  export type CleanupScheduleWorkerMinAggregateInputType = {
    id?: true
    assignedAt?: true
    scheduleId?: true
    workerId?: true
  }

  export type CleanupScheduleWorkerMaxAggregateInputType = {
    id?: true
    assignedAt?: true
    scheduleId?: true
    workerId?: true
  }

  export type CleanupScheduleWorkerCountAggregateInputType = {
    id?: true
    assignedAt?: true
    scheduleId?: true
    workerId?: true
    _all?: true
  }

  export type CleanupScheduleWorkerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CleanupScheduleWorker to aggregate.
     */
    where?: CleanupScheduleWorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleanupScheduleWorkers to fetch.
     */
    orderBy?: CleanupScheduleWorkerOrderByWithRelationInput | CleanupScheduleWorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CleanupScheduleWorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleanupScheduleWorkers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleanupScheduleWorkers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CleanupScheduleWorkers
    **/
    _count?: true | CleanupScheduleWorkerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CleanupScheduleWorkerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CleanupScheduleWorkerMaxAggregateInputType
  }

  export type GetCleanupScheduleWorkerAggregateType<T extends CleanupScheduleWorkerAggregateArgs> = {
        [P in keyof T & keyof AggregateCleanupScheduleWorker]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCleanupScheduleWorker[P]>
      : GetScalarType<T[P], AggregateCleanupScheduleWorker[P]>
  }




  export type CleanupScheduleWorkerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CleanupScheduleWorkerWhereInput
    orderBy?: CleanupScheduleWorkerOrderByWithAggregationInput | CleanupScheduleWorkerOrderByWithAggregationInput[]
    by: CleanupScheduleWorkerScalarFieldEnum[] | CleanupScheduleWorkerScalarFieldEnum
    having?: CleanupScheduleWorkerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CleanupScheduleWorkerCountAggregateInputType | true
    _min?: CleanupScheduleWorkerMinAggregateInputType
    _max?: CleanupScheduleWorkerMaxAggregateInputType
  }

  export type CleanupScheduleWorkerGroupByOutputType = {
    id: string
    assignedAt: Date
    scheduleId: string
    workerId: string
    _count: CleanupScheduleWorkerCountAggregateOutputType | null
    _min: CleanupScheduleWorkerMinAggregateOutputType | null
    _max: CleanupScheduleWorkerMaxAggregateOutputType | null
  }

  type GetCleanupScheduleWorkerGroupByPayload<T extends CleanupScheduleWorkerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CleanupScheduleWorkerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CleanupScheduleWorkerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CleanupScheduleWorkerGroupByOutputType[P]>
            : GetScalarType<T[P], CleanupScheduleWorkerGroupByOutputType[P]>
        }
      >
    >


  export type CleanupScheduleWorkerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assignedAt?: boolean
    scheduleId?: boolean
    workerId?: boolean
    schedule?: boolean | CleanupScheduleDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cleanupScheduleWorker"]>

  export type CleanupScheduleWorkerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assignedAt?: boolean
    scheduleId?: boolean
    workerId?: boolean
    schedule?: boolean | CleanupScheduleDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cleanupScheduleWorker"]>

  export type CleanupScheduleWorkerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assignedAt?: boolean
    scheduleId?: boolean
    workerId?: boolean
    schedule?: boolean | CleanupScheduleDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cleanupScheduleWorker"]>

  export type CleanupScheduleWorkerSelectScalar = {
    id?: boolean
    assignedAt?: boolean
    scheduleId?: boolean
    workerId?: boolean
  }

  export type CleanupScheduleWorkerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "assignedAt" | "scheduleId" | "workerId", ExtArgs["result"]["cleanupScheduleWorker"]>
  export type CleanupScheduleWorkerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schedule?: boolean | CleanupScheduleDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CleanupScheduleWorkerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schedule?: boolean | CleanupScheduleDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CleanupScheduleWorkerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schedule?: boolean | CleanupScheduleDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CleanupScheduleWorkerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CleanupScheduleWorker"
    objects: {
      schedule: Prisma.$CleanupSchedulePayload<ExtArgs>
      worker: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      assignedAt: Date
      scheduleId: string
      workerId: string
    }, ExtArgs["result"]["cleanupScheduleWorker"]>
    composites: {}
  }

  type CleanupScheduleWorkerGetPayload<S extends boolean | null | undefined | CleanupScheduleWorkerDefaultArgs> = $Result.GetResult<Prisma.$CleanupScheduleWorkerPayload, S>

  type CleanupScheduleWorkerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CleanupScheduleWorkerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CleanupScheduleWorkerCountAggregateInputType | true
    }

  export interface CleanupScheduleWorkerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CleanupScheduleWorker'], meta: { name: 'CleanupScheduleWorker' } }
    /**
     * Find zero or one CleanupScheduleWorker that matches the filter.
     * @param {CleanupScheduleWorkerFindUniqueArgs} args - Arguments to find a CleanupScheduleWorker
     * @example
     * // Get one CleanupScheduleWorker
     * const cleanupScheduleWorker = await prisma.cleanupScheduleWorker.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CleanupScheduleWorkerFindUniqueArgs>(args: SelectSubset<T, CleanupScheduleWorkerFindUniqueArgs<ExtArgs>>): Prisma__CleanupScheduleWorkerClient<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CleanupScheduleWorker that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CleanupScheduleWorkerFindUniqueOrThrowArgs} args - Arguments to find a CleanupScheduleWorker
     * @example
     * // Get one CleanupScheduleWorker
     * const cleanupScheduleWorker = await prisma.cleanupScheduleWorker.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CleanupScheduleWorkerFindUniqueOrThrowArgs>(args: SelectSubset<T, CleanupScheduleWorkerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CleanupScheduleWorkerClient<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CleanupScheduleWorker that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleWorkerFindFirstArgs} args - Arguments to find a CleanupScheduleWorker
     * @example
     * // Get one CleanupScheduleWorker
     * const cleanupScheduleWorker = await prisma.cleanupScheduleWorker.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CleanupScheduleWorkerFindFirstArgs>(args?: SelectSubset<T, CleanupScheduleWorkerFindFirstArgs<ExtArgs>>): Prisma__CleanupScheduleWorkerClient<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CleanupScheduleWorker that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleWorkerFindFirstOrThrowArgs} args - Arguments to find a CleanupScheduleWorker
     * @example
     * // Get one CleanupScheduleWorker
     * const cleanupScheduleWorker = await prisma.cleanupScheduleWorker.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CleanupScheduleWorkerFindFirstOrThrowArgs>(args?: SelectSubset<T, CleanupScheduleWorkerFindFirstOrThrowArgs<ExtArgs>>): Prisma__CleanupScheduleWorkerClient<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CleanupScheduleWorkers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleWorkerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CleanupScheduleWorkers
     * const cleanupScheduleWorkers = await prisma.cleanupScheduleWorker.findMany()
     * 
     * // Get first 10 CleanupScheduleWorkers
     * const cleanupScheduleWorkers = await prisma.cleanupScheduleWorker.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cleanupScheduleWorkerWithIdOnly = await prisma.cleanupScheduleWorker.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CleanupScheduleWorkerFindManyArgs>(args?: SelectSubset<T, CleanupScheduleWorkerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CleanupScheduleWorker.
     * @param {CleanupScheduleWorkerCreateArgs} args - Arguments to create a CleanupScheduleWorker.
     * @example
     * // Create one CleanupScheduleWorker
     * const CleanupScheduleWorker = await prisma.cleanupScheduleWorker.create({
     *   data: {
     *     // ... data to create a CleanupScheduleWorker
     *   }
     * })
     * 
     */
    create<T extends CleanupScheduleWorkerCreateArgs>(args: SelectSubset<T, CleanupScheduleWorkerCreateArgs<ExtArgs>>): Prisma__CleanupScheduleWorkerClient<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CleanupScheduleWorkers.
     * @param {CleanupScheduleWorkerCreateManyArgs} args - Arguments to create many CleanupScheduleWorkers.
     * @example
     * // Create many CleanupScheduleWorkers
     * const cleanupScheduleWorker = await prisma.cleanupScheduleWorker.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CleanupScheduleWorkerCreateManyArgs>(args?: SelectSubset<T, CleanupScheduleWorkerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CleanupScheduleWorkers and returns the data saved in the database.
     * @param {CleanupScheduleWorkerCreateManyAndReturnArgs} args - Arguments to create many CleanupScheduleWorkers.
     * @example
     * // Create many CleanupScheduleWorkers
     * const cleanupScheduleWorker = await prisma.cleanupScheduleWorker.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CleanupScheduleWorkers and only return the `id`
     * const cleanupScheduleWorkerWithIdOnly = await prisma.cleanupScheduleWorker.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CleanupScheduleWorkerCreateManyAndReturnArgs>(args?: SelectSubset<T, CleanupScheduleWorkerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CleanupScheduleWorker.
     * @param {CleanupScheduleWorkerDeleteArgs} args - Arguments to delete one CleanupScheduleWorker.
     * @example
     * // Delete one CleanupScheduleWorker
     * const CleanupScheduleWorker = await prisma.cleanupScheduleWorker.delete({
     *   where: {
     *     // ... filter to delete one CleanupScheduleWorker
     *   }
     * })
     * 
     */
    delete<T extends CleanupScheduleWorkerDeleteArgs>(args: SelectSubset<T, CleanupScheduleWorkerDeleteArgs<ExtArgs>>): Prisma__CleanupScheduleWorkerClient<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CleanupScheduleWorker.
     * @param {CleanupScheduleWorkerUpdateArgs} args - Arguments to update one CleanupScheduleWorker.
     * @example
     * // Update one CleanupScheduleWorker
     * const cleanupScheduleWorker = await prisma.cleanupScheduleWorker.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CleanupScheduleWorkerUpdateArgs>(args: SelectSubset<T, CleanupScheduleWorkerUpdateArgs<ExtArgs>>): Prisma__CleanupScheduleWorkerClient<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CleanupScheduleWorkers.
     * @param {CleanupScheduleWorkerDeleteManyArgs} args - Arguments to filter CleanupScheduleWorkers to delete.
     * @example
     * // Delete a few CleanupScheduleWorkers
     * const { count } = await prisma.cleanupScheduleWorker.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CleanupScheduleWorkerDeleteManyArgs>(args?: SelectSubset<T, CleanupScheduleWorkerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CleanupScheduleWorkers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleWorkerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CleanupScheduleWorkers
     * const cleanupScheduleWorker = await prisma.cleanupScheduleWorker.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CleanupScheduleWorkerUpdateManyArgs>(args: SelectSubset<T, CleanupScheduleWorkerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CleanupScheduleWorkers and returns the data updated in the database.
     * @param {CleanupScheduleWorkerUpdateManyAndReturnArgs} args - Arguments to update many CleanupScheduleWorkers.
     * @example
     * // Update many CleanupScheduleWorkers
     * const cleanupScheduleWorker = await prisma.cleanupScheduleWorker.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CleanupScheduleWorkers and only return the `id`
     * const cleanupScheduleWorkerWithIdOnly = await prisma.cleanupScheduleWorker.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CleanupScheduleWorkerUpdateManyAndReturnArgs>(args: SelectSubset<T, CleanupScheduleWorkerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CleanupScheduleWorker.
     * @param {CleanupScheduleWorkerUpsertArgs} args - Arguments to update or create a CleanupScheduleWorker.
     * @example
     * // Update or create a CleanupScheduleWorker
     * const cleanupScheduleWorker = await prisma.cleanupScheduleWorker.upsert({
     *   create: {
     *     // ... data to create a CleanupScheduleWorker
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CleanupScheduleWorker we want to update
     *   }
     * })
     */
    upsert<T extends CleanupScheduleWorkerUpsertArgs>(args: SelectSubset<T, CleanupScheduleWorkerUpsertArgs<ExtArgs>>): Prisma__CleanupScheduleWorkerClient<$Result.GetResult<Prisma.$CleanupScheduleWorkerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CleanupScheduleWorkers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleWorkerCountArgs} args - Arguments to filter CleanupScheduleWorkers to count.
     * @example
     * // Count the number of CleanupScheduleWorkers
     * const count = await prisma.cleanupScheduleWorker.count({
     *   where: {
     *     // ... the filter for the CleanupScheduleWorkers we want to count
     *   }
     * })
    **/
    count<T extends CleanupScheduleWorkerCountArgs>(
      args?: Subset<T, CleanupScheduleWorkerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CleanupScheduleWorkerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CleanupScheduleWorker.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleWorkerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CleanupScheduleWorkerAggregateArgs>(args: Subset<T, CleanupScheduleWorkerAggregateArgs>): Prisma.PrismaPromise<GetCleanupScheduleWorkerAggregateType<T>>

    /**
     * Group by CleanupScheduleWorker.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CleanupScheduleWorkerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CleanupScheduleWorkerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CleanupScheduleWorkerGroupByArgs['orderBy'] }
        : { orderBy?: CleanupScheduleWorkerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CleanupScheduleWorkerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCleanupScheduleWorkerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CleanupScheduleWorker model
   */
  readonly fields: CleanupScheduleWorkerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CleanupScheduleWorker.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CleanupScheduleWorkerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    schedule<T extends CleanupScheduleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CleanupScheduleDefaultArgs<ExtArgs>>): Prisma__CleanupScheduleClient<$Result.GetResult<Prisma.$CleanupSchedulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    worker<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CleanupScheduleWorker model
   */
  interface CleanupScheduleWorkerFieldRefs {
    readonly id: FieldRef<"CleanupScheduleWorker", 'String'>
    readonly assignedAt: FieldRef<"CleanupScheduleWorker", 'DateTime'>
    readonly scheduleId: FieldRef<"CleanupScheduleWorker", 'String'>
    readonly workerId: FieldRef<"CleanupScheduleWorker", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CleanupScheduleWorker findUnique
   */
  export type CleanupScheduleWorkerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    /**
     * Filter, which CleanupScheduleWorker to fetch.
     */
    where: CleanupScheduleWorkerWhereUniqueInput
  }

  /**
   * CleanupScheduleWorker findUniqueOrThrow
   */
  export type CleanupScheduleWorkerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    /**
     * Filter, which CleanupScheduleWorker to fetch.
     */
    where: CleanupScheduleWorkerWhereUniqueInput
  }

  /**
   * CleanupScheduleWorker findFirst
   */
  export type CleanupScheduleWorkerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    /**
     * Filter, which CleanupScheduleWorker to fetch.
     */
    where?: CleanupScheduleWorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleanupScheduleWorkers to fetch.
     */
    orderBy?: CleanupScheduleWorkerOrderByWithRelationInput | CleanupScheduleWorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CleanupScheduleWorkers.
     */
    cursor?: CleanupScheduleWorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleanupScheduleWorkers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleanupScheduleWorkers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CleanupScheduleWorkers.
     */
    distinct?: CleanupScheduleWorkerScalarFieldEnum | CleanupScheduleWorkerScalarFieldEnum[]
  }

  /**
   * CleanupScheduleWorker findFirstOrThrow
   */
  export type CleanupScheduleWorkerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    /**
     * Filter, which CleanupScheduleWorker to fetch.
     */
    where?: CleanupScheduleWorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleanupScheduleWorkers to fetch.
     */
    orderBy?: CleanupScheduleWorkerOrderByWithRelationInput | CleanupScheduleWorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CleanupScheduleWorkers.
     */
    cursor?: CleanupScheduleWorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleanupScheduleWorkers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleanupScheduleWorkers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CleanupScheduleWorkers.
     */
    distinct?: CleanupScheduleWorkerScalarFieldEnum | CleanupScheduleWorkerScalarFieldEnum[]
  }

  /**
   * CleanupScheduleWorker findMany
   */
  export type CleanupScheduleWorkerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    /**
     * Filter, which CleanupScheduleWorkers to fetch.
     */
    where?: CleanupScheduleWorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CleanupScheduleWorkers to fetch.
     */
    orderBy?: CleanupScheduleWorkerOrderByWithRelationInput | CleanupScheduleWorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CleanupScheduleWorkers.
     */
    cursor?: CleanupScheduleWorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CleanupScheduleWorkers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CleanupScheduleWorkers.
     */
    skip?: number
    distinct?: CleanupScheduleWorkerScalarFieldEnum | CleanupScheduleWorkerScalarFieldEnum[]
  }

  /**
   * CleanupScheduleWorker create
   */
  export type CleanupScheduleWorkerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    /**
     * The data needed to create a CleanupScheduleWorker.
     */
    data: XOR<CleanupScheduleWorkerCreateInput, CleanupScheduleWorkerUncheckedCreateInput>
  }

  /**
   * CleanupScheduleWorker createMany
   */
  export type CleanupScheduleWorkerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CleanupScheduleWorkers.
     */
    data: CleanupScheduleWorkerCreateManyInput | CleanupScheduleWorkerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CleanupScheduleWorker createManyAndReturn
   */
  export type CleanupScheduleWorkerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * The data used to create many CleanupScheduleWorkers.
     */
    data: CleanupScheduleWorkerCreateManyInput | CleanupScheduleWorkerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CleanupScheduleWorker update
   */
  export type CleanupScheduleWorkerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    /**
     * The data needed to update a CleanupScheduleWorker.
     */
    data: XOR<CleanupScheduleWorkerUpdateInput, CleanupScheduleWorkerUncheckedUpdateInput>
    /**
     * Choose, which CleanupScheduleWorker to update.
     */
    where: CleanupScheduleWorkerWhereUniqueInput
  }

  /**
   * CleanupScheduleWorker updateMany
   */
  export type CleanupScheduleWorkerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CleanupScheduleWorkers.
     */
    data: XOR<CleanupScheduleWorkerUpdateManyMutationInput, CleanupScheduleWorkerUncheckedUpdateManyInput>
    /**
     * Filter which CleanupScheduleWorkers to update
     */
    where?: CleanupScheduleWorkerWhereInput
    /**
     * Limit how many CleanupScheduleWorkers to update.
     */
    limit?: number
  }

  /**
   * CleanupScheduleWorker updateManyAndReturn
   */
  export type CleanupScheduleWorkerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * The data used to update CleanupScheduleWorkers.
     */
    data: XOR<CleanupScheduleWorkerUpdateManyMutationInput, CleanupScheduleWorkerUncheckedUpdateManyInput>
    /**
     * Filter which CleanupScheduleWorkers to update
     */
    where?: CleanupScheduleWorkerWhereInput
    /**
     * Limit how many CleanupScheduleWorkers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CleanupScheduleWorker upsert
   */
  export type CleanupScheduleWorkerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    /**
     * The filter to search for the CleanupScheduleWorker to update in case it exists.
     */
    where: CleanupScheduleWorkerWhereUniqueInput
    /**
     * In case the CleanupScheduleWorker found by the `where` argument doesn't exist, create a new CleanupScheduleWorker with this data.
     */
    create: XOR<CleanupScheduleWorkerCreateInput, CleanupScheduleWorkerUncheckedCreateInput>
    /**
     * In case the CleanupScheduleWorker was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CleanupScheduleWorkerUpdateInput, CleanupScheduleWorkerUncheckedUpdateInput>
  }

  /**
   * CleanupScheduleWorker delete
   */
  export type CleanupScheduleWorkerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
    /**
     * Filter which CleanupScheduleWorker to delete.
     */
    where: CleanupScheduleWorkerWhereUniqueInput
  }

  /**
   * CleanupScheduleWorker deleteMany
   */
  export type CleanupScheduleWorkerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CleanupScheduleWorkers to delete
     */
    where?: CleanupScheduleWorkerWhereInput
    /**
     * Limit how many CleanupScheduleWorkers to delete.
     */
    limit?: number
  }

  /**
   * CleanupScheduleWorker without action
   */
  export type CleanupScheduleWorkerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CleanupScheduleWorker
     */
    select?: CleanupScheduleWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CleanupScheduleWorker
     */
    omit?: CleanupScheduleWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CleanupScheduleWorkerInclude<ExtArgs> | null
  }


  /**
   * Model ReportWorker
   */

  export type AggregateReportWorker = {
    _count: ReportWorkerCountAggregateOutputType | null
    _min: ReportWorkerMinAggregateOutputType | null
    _max: ReportWorkerMaxAggregateOutputType | null
  }

  export type ReportWorkerMinAggregateOutputType = {
    id: string | null
    assignedAt: Date | null
    reportId: string | null
    workerId: string | null
  }

  export type ReportWorkerMaxAggregateOutputType = {
    id: string | null
    assignedAt: Date | null
    reportId: string | null
    workerId: string | null
  }

  export type ReportWorkerCountAggregateOutputType = {
    id: number
    assignedAt: number
    reportId: number
    workerId: number
    _all: number
  }


  export type ReportWorkerMinAggregateInputType = {
    id?: true
    assignedAt?: true
    reportId?: true
    workerId?: true
  }

  export type ReportWorkerMaxAggregateInputType = {
    id?: true
    assignedAt?: true
    reportId?: true
    workerId?: true
  }

  export type ReportWorkerCountAggregateInputType = {
    id?: true
    assignedAt?: true
    reportId?: true
    workerId?: true
    _all?: true
  }

  export type ReportWorkerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReportWorker to aggregate.
     */
    where?: ReportWorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportWorkers to fetch.
     */
    orderBy?: ReportWorkerOrderByWithRelationInput | ReportWorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReportWorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportWorkers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportWorkers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReportWorkers
    **/
    _count?: true | ReportWorkerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReportWorkerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReportWorkerMaxAggregateInputType
  }

  export type GetReportWorkerAggregateType<T extends ReportWorkerAggregateArgs> = {
        [P in keyof T & keyof AggregateReportWorker]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReportWorker[P]>
      : GetScalarType<T[P], AggregateReportWorker[P]>
  }




  export type ReportWorkerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportWorkerWhereInput
    orderBy?: ReportWorkerOrderByWithAggregationInput | ReportWorkerOrderByWithAggregationInput[]
    by: ReportWorkerScalarFieldEnum[] | ReportWorkerScalarFieldEnum
    having?: ReportWorkerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReportWorkerCountAggregateInputType | true
    _min?: ReportWorkerMinAggregateInputType
    _max?: ReportWorkerMaxAggregateInputType
  }

  export type ReportWorkerGroupByOutputType = {
    id: string
    assignedAt: Date
    reportId: string
    workerId: string
    _count: ReportWorkerCountAggregateOutputType | null
    _min: ReportWorkerMinAggregateOutputType | null
    _max: ReportWorkerMaxAggregateOutputType | null
  }

  type GetReportWorkerGroupByPayload<T extends ReportWorkerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReportWorkerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReportWorkerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReportWorkerGroupByOutputType[P]>
            : GetScalarType<T[P], ReportWorkerGroupByOutputType[P]>
        }
      >
    >


  export type ReportWorkerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assignedAt?: boolean
    reportId?: boolean
    workerId?: boolean
    report?: boolean | ReportDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportWorker"]>

  export type ReportWorkerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assignedAt?: boolean
    reportId?: boolean
    workerId?: boolean
    report?: boolean | ReportDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportWorker"]>

  export type ReportWorkerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assignedAt?: boolean
    reportId?: boolean
    workerId?: boolean
    report?: boolean | ReportDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportWorker"]>

  export type ReportWorkerSelectScalar = {
    id?: boolean
    assignedAt?: boolean
    reportId?: boolean
    workerId?: boolean
  }

  export type ReportWorkerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "assignedAt" | "reportId" | "workerId", ExtArgs["result"]["reportWorker"]>
  export type ReportWorkerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | ReportDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ReportWorkerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | ReportDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ReportWorkerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | ReportDefaultArgs<ExtArgs>
    worker?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ReportWorkerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReportWorker"
    objects: {
      report: Prisma.$ReportPayload<ExtArgs>
      worker: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      assignedAt: Date
      reportId: string
      workerId: string
    }, ExtArgs["result"]["reportWorker"]>
    composites: {}
  }

  type ReportWorkerGetPayload<S extends boolean | null | undefined | ReportWorkerDefaultArgs> = $Result.GetResult<Prisma.$ReportWorkerPayload, S>

  type ReportWorkerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReportWorkerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReportWorkerCountAggregateInputType | true
    }

  export interface ReportWorkerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReportWorker'], meta: { name: 'ReportWorker' } }
    /**
     * Find zero or one ReportWorker that matches the filter.
     * @param {ReportWorkerFindUniqueArgs} args - Arguments to find a ReportWorker
     * @example
     * // Get one ReportWorker
     * const reportWorker = await prisma.reportWorker.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReportWorkerFindUniqueArgs>(args: SelectSubset<T, ReportWorkerFindUniqueArgs<ExtArgs>>): Prisma__ReportWorkerClient<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReportWorker that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReportWorkerFindUniqueOrThrowArgs} args - Arguments to find a ReportWorker
     * @example
     * // Get one ReportWorker
     * const reportWorker = await prisma.reportWorker.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReportWorkerFindUniqueOrThrowArgs>(args: SelectSubset<T, ReportWorkerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReportWorkerClient<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReportWorker that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWorkerFindFirstArgs} args - Arguments to find a ReportWorker
     * @example
     * // Get one ReportWorker
     * const reportWorker = await prisma.reportWorker.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReportWorkerFindFirstArgs>(args?: SelectSubset<T, ReportWorkerFindFirstArgs<ExtArgs>>): Prisma__ReportWorkerClient<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReportWorker that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWorkerFindFirstOrThrowArgs} args - Arguments to find a ReportWorker
     * @example
     * // Get one ReportWorker
     * const reportWorker = await prisma.reportWorker.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReportWorkerFindFirstOrThrowArgs>(args?: SelectSubset<T, ReportWorkerFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReportWorkerClient<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReportWorkers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWorkerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReportWorkers
     * const reportWorkers = await prisma.reportWorker.findMany()
     * 
     * // Get first 10 ReportWorkers
     * const reportWorkers = await prisma.reportWorker.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reportWorkerWithIdOnly = await prisma.reportWorker.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReportWorkerFindManyArgs>(args?: SelectSubset<T, ReportWorkerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReportWorker.
     * @param {ReportWorkerCreateArgs} args - Arguments to create a ReportWorker.
     * @example
     * // Create one ReportWorker
     * const ReportWorker = await prisma.reportWorker.create({
     *   data: {
     *     // ... data to create a ReportWorker
     *   }
     * })
     * 
     */
    create<T extends ReportWorkerCreateArgs>(args: SelectSubset<T, ReportWorkerCreateArgs<ExtArgs>>): Prisma__ReportWorkerClient<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReportWorkers.
     * @param {ReportWorkerCreateManyArgs} args - Arguments to create many ReportWorkers.
     * @example
     * // Create many ReportWorkers
     * const reportWorker = await prisma.reportWorker.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReportWorkerCreateManyArgs>(args?: SelectSubset<T, ReportWorkerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReportWorkers and returns the data saved in the database.
     * @param {ReportWorkerCreateManyAndReturnArgs} args - Arguments to create many ReportWorkers.
     * @example
     * // Create many ReportWorkers
     * const reportWorker = await prisma.reportWorker.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReportWorkers and only return the `id`
     * const reportWorkerWithIdOnly = await prisma.reportWorker.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReportWorkerCreateManyAndReturnArgs>(args?: SelectSubset<T, ReportWorkerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReportWorker.
     * @param {ReportWorkerDeleteArgs} args - Arguments to delete one ReportWorker.
     * @example
     * // Delete one ReportWorker
     * const ReportWorker = await prisma.reportWorker.delete({
     *   where: {
     *     // ... filter to delete one ReportWorker
     *   }
     * })
     * 
     */
    delete<T extends ReportWorkerDeleteArgs>(args: SelectSubset<T, ReportWorkerDeleteArgs<ExtArgs>>): Prisma__ReportWorkerClient<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReportWorker.
     * @param {ReportWorkerUpdateArgs} args - Arguments to update one ReportWorker.
     * @example
     * // Update one ReportWorker
     * const reportWorker = await prisma.reportWorker.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReportWorkerUpdateArgs>(args: SelectSubset<T, ReportWorkerUpdateArgs<ExtArgs>>): Prisma__ReportWorkerClient<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReportWorkers.
     * @param {ReportWorkerDeleteManyArgs} args - Arguments to filter ReportWorkers to delete.
     * @example
     * // Delete a few ReportWorkers
     * const { count } = await prisma.reportWorker.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReportWorkerDeleteManyArgs>(args?: SelectSubset<T, ReportWorkerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReportWorkers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWorkerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReportWorkers
     * const reportWorker = await prisma.reportWorker.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReportWorkerUpdateManyArgs>(args: SelectSubset<T, ReportWorkerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReportWorkers and returns the data updated in the database.
     * @param {ReportWorkerUpdateManyAndReturnArgs} args - Arguments to update many ReportWorkers.
     * @example
     * // Update many ReportWorkers
     * const reportWorker = await prisma.reportWorker.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReportWorkers and only return the `id`
     * const reportWorkerWithIdOnly = await prisma.reportWorker.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReportWorkerUpdateManyAndReturnArgs>(args: SelectSubset<T, ReportWorkerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReportWorker.
     * @param {ReportWorkerUpsertArgs} args - Arguments to update or create a ReportWorker.
     * @example
     * // Update or create a ReportWorker
     * const reportWorker = await prisma.reportWorker.upsert({
     *   create: {
     *     // ... data to create a ReportWorker
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReportWorker we want to update
     *   }
     * })
     */
    upsert<T extends ReportWorkerUpsertArgs>(args: SelectSubset<T, ReportWorkerUpsertArgs<ExtArgs>>): Prisma__ReportWorkerClient<$Result.GetResult<Prisma.$ReportWorkerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReportWorkers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWorkerCountArgs} args - Arguments to filter ReportWorkers to count.
     * @example
     * // Count the number of ReportWorkers
     * const count = await prisma.reportWorker.count({
     *   where: {
     *     // ... the filter for the ReportWorkers we want to count
     *   }
     * })
    **/
    count<T extends ReportWorkerCountArgs>(
      args?: Subset<T, ReportWorkerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReportWorkerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReportWorker.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWorkerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReportWorkerAggregateArgs>(args: Subset<T, ReportWorkerAggregateArgs>): Prisma.PrismaPromise<GetReportWorkerAggregateType<T>>

    /**
     * Group by ReportWorker.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWorkerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReportWorkerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReportWorkerGroupByArgs['orderBy'] }
        : { orderBy?: ReportWorkerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReportWorkerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReportWorkerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReportWorker model
   */
  readonly fields: ReportWorkerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReportWorker.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReportWorkerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    report<T extends ReportDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReportDefaultArgs<ExtArgs>>): Prisma__ReportClient<$Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    worker<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReportWorker model
   */
  interface ReportWorkerFieldRefs {
    readonly id: FieldRef<"ReportWorker", 'String'>
    readonly assignedAt: FieldRef<"ReportWorker", 'DateTime'>
    readonly reportId: FieldRef<"ReportWorker", 'String'>
    readonly workerId: FieldRef<"ReportWorker", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ReportWorker findUnique
   */
  export type ReportWorkerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    /**
     * Filter, which ReportWorker to fetch.
     */
    where: ReportWorkerWhereUniqueInput
  }

  /**
   * ReportWorker findUniqueOrThrow
   */
  export type ReportWorkerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    /**
     * Filter, which ReportWorker to fetch.
     */
    where: ReportWorkerWhereUniqueInput
  }

  /**
   * ReportWorker findFirst
   */
  export type ReportWorkerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    /**
     * Filter, which ReportWorker to fetch.
     */
    where?: ReportWorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportWorkers to fetch.
     */
    orderBy?: ReportWorkerOrderByWithRelationInput | ReportWorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReportWorkers.
     */
    cursor?: ReportWorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportWorkers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportWorkers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportWorkers.
     */
    distinct?: ReportWorkerScalarFieldEnum | ReportWorkerScalarFieldEnum[]
  }

  /**
   * ReportWorker findFirstOrThrow
   */
  export type ReportWorkerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    /**
     * Filter, which ReportWorker to fetch.
     */
    where?: ReportWorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportWorkers to fetch.
     */
    orderBy?: ReportWorkerOrderByWithRelationInput | ReportWorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReportWorkers.
     */
    cursor?: ReportWorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportWorkers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportWorkers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportWorkers.
     */
    distinct?: ReportWorkerScalarFieldEnum | ReportWorkerScalarFieldEnum[]
  }

  /**
   * ReportWorker findMany
   */
  export type ReportWorkerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    /**
     * Filter, which ReportWorkers to fetch.
     */
    where?: ReportWorkerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportWorkers to fetch.
     */
    orderBy?: ReportWorkerOrderByWithRelationInput | ReportWorkerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReportWorkers.
     */
    cursor?: ReportWorkerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportWorkers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportWorkers.
     */
    skip?: number
    distinct?: ReportWorkerScalarFieldEnum | ReportWorkerScalarFieldEnum[]
  }

  /**
   * ReportWorker create
   */
  export type ReportWorkerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    /**
     * The data needed to create a ReportWorker.
     */
    data: XOR<ReportWorkerCreateInput, ReportWorkerUncheckedCreateInput>
  }

  /**
   * ReportWorker createMany
   */
  export type ReportWorkerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReportWorkers.
     */
    data: ReportWorkerCreateManyInput | ReportWorkerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReportWorker createManyAndReturn
   */
  export type ReportWorkerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * The data used to create many ReportWorkers.
     */
    data: ReportWorkerCreateManyInput | ReportWorkerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReportWorker update
   */
  export type ReportWorkerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    /**
     * The data needed to update a ReportWorker.
     */
    data: XOR<ReportWorkerUpdateInput, ReportWorkerUncheckedUpdateInput>
    /**
     * Choose, which ReportWorker to update.
     */
    where: ReportWorkerWhereUniqueInput
  }

  /**
   * ReportWorker updateMany
   */
  export type ReportWorkerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReportWorkers.
     */
    data: XOR<ReportWorkerUpdateManyMutationInput, ReportWorkerUncheckedUpdateManyInput>
    /**
     * Filter which ReportWorkers to update
     */
    where?: ReportWorkerWhereInput
    /**
     * Limit how many ReportWorkers to update.
     */
    limit?: number
  }

  /**
   * ReportWorker updateManyAndReturn
   */
  export type ReportWorkerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * The data used to update ReportWorkers.
     */
    data: XOR<ReportWorkerUpdateManyMutationInput, ReportWorkerUncheckedUpdateManyInput>
    /**
     * Filter which ReportWorkers to update
     */
    where?: ReportWorkerWhereInput
    /**
     * Limit how many ReportWorkers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReportWorker upsert
   */
  export type ReportWorkerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    /**
     * The filter to search for the ReportWorker to update in case it exists.
     */
    where: ReportWorkerWhereUniqueInput
    /**
     * In case the ReportWorker found by the `where` argument doesn't exist, create a new ReportWorker with this data.
     */
    create: XOR<ReportWorkerCreateInput, ReportWorkerUncheckedCreateInput>
    /**
     * In case the ReportWorker was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReportWorkerUpdateInput, ReportWorkerUncheckedUpdateInput>
  }

  /**
   * ReportWorker delete
   */
  export type ReportWorkerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
    /**
     * Filter which ReportWorker to delete.
     */
    where: ReportWorkerWhereUniqueInput
  }

  /**
   * ReportWorker deleteMany
   */
  export type ReportWorkerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReportWorkers to delete
     */
    where?: ReportWorkerWhereInput
    /**
     * Limit how many ReportWorkers to delete.
     */
    limit?: number
  }

  /**
   * ReportWorker without action
   */
  export type ReportWorkerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWorker
     */
    select?: ReportWorkerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWorker
     */
    omit?: ReportWorkerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWorkerInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    firstName: 'firstName',
    lastName: 'lastName',
    phone: 'phone',
    address: 'address',
    role: 'role',
    avatarUrl: 'avatarUrl',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ReportScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    category: 'category',
    status: 'status',
    latitude: 'latitude',
    longitude: 'longitude',
    address: 'address',
    isAnonymous: 'isAnonymous',
    isDeleted: 'isDeleted',
    isSpam: 'isSpam',
    spamMarkedAt: 'spamMarkedAt',
    spamReason: 'spamReason',
    analysisStatus: 'analysisStatus',
    analysisWasteCount: 'analysisWasteCount',
    analysisConfidence: 'analysisConfidence',
    analyzedAt: 'analyzedAt',
    severity: 'severity',
    aiCategories: 'aiCategories',
    aiReason: 'aiReason',
    aiModel: 'aiModel',
    aiImageHash: 'aiImageHash',
    aiProcessingMs: 'aiProcessingMs',
    aiGeminiMs: 'aiGeminiMs',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    reporterId: 'reporterId',
    assignedToId: 'assignedToId',
    cleanupScheduleId: 'cleanupScheduleId'
  };

  export type ReportScalarFieldEnum = (typeof ReportScalarFieldEnum)[keyof typeof ReportScalarFieldEnum]


  export const ReportImageScalarFieldEnum: {
    id: 'id',
    imageUrl: 'imageUrl',
    publicId: 'publicId',
    type: 'type',
    createdAt: 'createdAt',
    reportId: 'reportId'
  };

  export type ReportImageScalarFieldEnum = (typeof ReportImageScalarFieldEnum)[keyof typeof ReportImageScalarFieldEnum]


  export const StatusHistoryScalarFieldEnum: {
    id: 'id',
    previousStatus: 'previousStatus',
    newStatus: 'newStatus',
    notes: 'notes',
    createdAt: 'createdAt',
    reportId: 'reportId',
    changedById: 'changedById'
  };

  export type StatusHistoryScalarFieldEnum = (typeof StatusHistoryScalarFieldEnum)[keyof typeof StatusHistoryScalarFieldEnum]


  export const NotificationScalarFieldEnum: {
    id: 'id',
    title: 'title',
    message: 'message',
    type: 'type',
    isRead: 'isRead',
    createdAt: 'createdAt',
    userId: 'userId',
    reportId: 'reportId'
  };

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


  export const ReportingZoneScalarFieldEnum: {
    id: 'id',
    name: 'name',
    coordinates: 'coordinates',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdById: 'createdById'
  };

  export type ReportingZoneScalarFieldEnum = (typeof ReportingZoneScalarFieldEnum)[keyof typeof ReportingZoneScalarFieldEnum]


  export const CleanupScheduleScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    barangay: 'barangay',
    latitude: 'latitude',
    longitude: 'longitude',
    scheduledAt: 'scheduledAt',
    status: 'status',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdById: 'createdById',
    verifiedById: 'verifiedById',
    verifiedAt: 'verifiedAt',
    equipment: 'equipment'
  };

  export type CleanupScheduleScalarFieldEnum = (typeof CleanupScheduleScalarFieldEnum)[keyof typeof CleanupScheduleScalarFieldEnum]


  export const CleanupScheduleWorkerScalarFieldEnum: {
    id: 'id',
    assignedAt: 'assignedAt',
    scheduleId: 'scheduleId',
    workerId: 'workerId'
  };

  export type CleanupScheduleWorkerScalarFieldEnum = (typeof CleanupScheduleWorkerScalarFieldEnum)[keyof typeof CleanupScheduleWorkerScalarFieldEnum]


  export const ReportWorkerScalarFieldEnum: {
    id: 'id',
    assignedAt: 'assignedAt',
    reportId: 'reportId',
    workerId: 'workerId'
  };

  export type ReportWorkerScalarFieldEnum = (typeof ReportWorkerScalarFieldEnum)[keyof typeof ReportWorkerScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'WasteCategory'
   */
  export type EnumWasteCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WasteCategory'>
    


  /**
   * Reference to a field of type 'WasteCategory[]'
   */
  export type ListEnumWasteCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WasteCategory[]'>
    


  /**
   * Reference to a field of type 'ReportStatus'
   */
  export type EnumReportStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReportStatus'>
    


  /**
   * Reference to a field of type 'ReportStatus[]'
   */
  export type ListEnumReportStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReportStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'AnalysisStatus'
   */
  export type EnumAnalysisStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AnalysisStatus'>
    


  /**
   * Reference to a field of type 'AnalysisStatus[]'
   */
  export type ListEnumAnalysisStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AnalysisStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Severity'
   */
  export type EnumSeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Severity'>
    


  /**
   * Reference to a field of type 'Severity[]'
   */
  export type ListEnumSeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Severity[]'>
    


  /**
   * Reference to a field of type 'ImageType'
   */
  export type EnumImageTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ImageType'>
    


  /**
   * Reference to a field of type 'ImageType[]'
   */
  export type ListEnumImageTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ImageType[]'>
    


  /**
   * Reference to a field of type 'NotificationType'
   */
  export type EnumNotificationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationType'>
    


  /**
   * Reference to a field of type 'NotificationType[]'
   */
  export type ListEnumNotificationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationType[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'CleanupScheduleStatus'
   */
  export type EnumCleanupScheduleStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CleanupScheduleStatus'>
    


  /**
   * Reference to a field of type 'CleanupScheduleStatus[]'
   */
  export type ListEnumCleanupScheduleStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CleanupScheduleStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    address?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    avatarUrl?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    reports?: ReportListRelationFilter
    assignedReports?: ReportListRelationFilter
    assignedReportWorkers?: ReportWorkerListRelationFilter
    statusChanges?: StatusHistoryListRelationFilter
    notifications?: NotificationListRelationFilter
    reportingZones?: ReportingZoneListRelationFilter
    createdSchedules?: CleanupScheduleListRelationFilter
    verifiedSchedules?: CleanupScheduleListRelationFilter
    scheduleAssignments?: CleanupScheduleWorkerListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrder
    role?: SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    reports?: ReportOrderByRelationAggregateInput
    assignedReports?: ReportOrderByRelationAggregateInput
    assignedReportWorkers?: ReportWorkerOrderByRelationAggregateInput
    statusChanges?: StatusHistoryOrderByRelationAggregateInput
    notifications?: NotificationOrderByRelationAggregateInput
    reportingZones?: ReportingZoneOrderByRelationAggregateInput
    createdSchedules?: CleanupScheduleOrderByRelationAggregateInput
    verifiedSchedules?: CleanupScheduleOrderByRelationAggregateInput
    scheduleAssignments?: CleanupScheduleWorkerOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    address?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    avatarUrl?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    reports?: ReportListRelationFilter
    assignedReports?: ReportListRelationFilter
    assignedReportWorkers?: ReportWorkerListRelationFilter
    statusChanges?: StatusHistoryListRelationFilter
    notifications?: NotificationListRelationFilter
    reportingZones?: ReportingZoneListRelationFilter
    createdSchedules?: CleanupScheduleListRelationFilter
    verifiedSchedules?: CleanupScheduleListRelationFilter
    scheduleAssignments?: CleanupScheduleWorkerListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrder
    role?: SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    firstName?: StringWithAggregatesFilter<"User"> | string
    lastName?: StringWithAggregatesFilter<"User"> | string
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    address?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    avatarUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ReportWhereInput = {
    AND?: ReportWhereInput | ReportWhereInput[]
    OR?: ReportWhereInput[]
    NOT?: ReportWhereInput | ReportWhereInput[]
    id?: StringFilter<"Report"> | string
    title?: StringFilter<"Report"> | string
    description?: StringFilter<"Report"> | string
    category?: EnumWasteCategoryFilter<"Report"> | $Enums.WasteCategory
    status?: EnumReportStatusFilter<"Report"> | $Enums.ReportStatus
    latitude?: FloatFilter<"Report"> | number
    longitude?: FloatFilter<"Report"> | number
    address?: StringNullableFilter<"Report"> | string | null
    isAnonymous?: BoolFilter<"Report"> | boolean
    isDeleted?: BoolFilter<"Report"> | boolean
    isSpam?: BoolFilter<"Report"> | boolean
    spamMarkedAt?: DateTimeNullableFilter<"Report"> | Date | string | null
    spamReason?: StringNullableFilter<"Report"> | string | null
    analysisStatus?: EnumAnalysisStatusNullableFilter<"Report"> | $Enums.AnalysisStatus | null
    analysisWasteCount?: IntNullableFilter<"Report"> | number | null
    analysisConfidence?: FloatNullableFilter<"Report"> | number | null
    analyzedAt?: DateTimeNullableFilter<"Report"> | Date | string | null
    severity?: EnumSeverityNullableFilter<"Report"> | $Enums.Severity | null
    aiCategories?: StringNullableListFilter<"Report">
    aiReason?: StringNullableFilter<"Report"> | string | null
    aiModel?: StringNullableFilter<"Report"> | string | null
    aiImageHash?: StringNullableFilter<"Report"> | string | null
    aiProcessingMs?: IntNullableFilter<"Report"> | number | null
    aiGeminiMs?: IntNullableFilter<"Report"> | number | null
    createdAt?: DateTimeFilter<"Report"> | Date | string
    updatedAt?: DateTimeFilter<"Report"> | Date | string
    reporterId?: StringNullableFilter<"Report"> | string | null
    assignedToId?: StringNullableFilter<"Report"> | string | null
    cleanupScheduleId?: StringNullableFilter<"Report"> | string | null
    reporter?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    assignedTo?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    assignedWorkers?: ReportWorkerListRelationFilter
    cleanupSchedule?: XOR<CleanupScheduleNullableScalarRelationFilter, CleanupScheduleWhereInput> | null
    images?: ReportImageListRelationFilter
    statusHistory?: StatusHistoryListRelationFilter
    notifications?: NotificationListRelationFilter
  }

  export type ReportOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    status?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    address?: SortOrderInput | SortOrder
    isAnonymous?: SortOrder
    isDeleted?: SortOrder
    isSpam?: SortOrder
    spamMarkedAt?: SortOrderInput | SortOrder
    spamReason?: SortOrderInput | SortOrder
    analysisStatus?: SortOrderInput | SortOrder
    analysisWasteCount?: SortOrderInput | SortOrder
    analysisConfidence?: SortOrderInput | SortOrder
    analyzedAt?: SortOrderInput | SortOrder
    severity?: SortOrderInput | SortOrder
    aiCategories?: SortOrder
    aiReason?: SortOrderInput | SortOrder
    aiModel?: SortOrderInput | SortOrder
    aiImageHash?: SortOrderInput | SortOrder
    aiProcessingMs?: SortOrderInput | SortOrder
    aiGeminiMs?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    reporterId?: SortOrderInput | SortOrder
    assignedToId?: SortOrderInput | SortOrder
    cleanupScheduleId?: SortOrderInput | SortOrder
    reporter?: UserOrderByWithRelationInput
    assignedTo?: UserOrderByWithRelationInput
    assignedWorkers?: ReportWorkerOrderByRelationAggregateInput
    cleanupSchedule?: CleanupScheduleOrderByWithRelationInput
    images?: ReportImageOrderByRelationAggregateInput
    statusHistory?: StatusHistoryOrderByRelationAggregateInput
    notifications?: NotificationOrderByRelationAggregateInput
  }

  export type ReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReportWhereInput | ReportWhereInput[]
    OR?: ReportWhereInput[]
    NOT?: ReportWhereInput | ReportWhereInput[]
    title?: StringFilter<"Report"> | string
    description?: StringFilter<"Report"> | string
    category?: EnumWasteCategoryFilter<"Report"> | $Enums.WasteCategory
    status?: EnumReportStatusFilter<"Report"> | $Enums.ReportStatus
    latitude?: FloatFilter<"Report"> | number
    longitude?: FloatFilter<"Report"> | number
    address?: StringNullableFilter<"Report"> | string | null
    isAnonymous?: BoolFilter<"Report"> | boolean
    isDeleted?: BoolFilter<"Report"> | boolean
    isSpam?: BoolFilter<"Report"> | boolean
    spamMarkedAt?: DateTimeNullableFilter<"Report"> | Date | string | null
    spamReason?: StringNullableFilter<"Report"> | string | null
    analysisStatus?: EnumAnalysisStatusNullableFilter<"Report"> | $Enums.AnalysisStatus | null
    analysisWasteCount?: IntNullableFilter<"Report"> | number | null
    analysisConfidence?: FloatNullableFilter<"Report"> | number | null
    analyzedAt?: DateTimeNullableFilter<"Report"> | Date | string | null
    severity?: EnumSeverityNullableFilter<"Report"> | $Enums.Severity | null
    aiCategories?: StringNullableListFilter<"Report">
    aiReason?: StringNullableFilter<"Report"> | string | null
    aiModel?: StringNullableFilter<"Report"> | string | null
    aiImageHash?: StringNullableFilter<"Report"> | string | null
    aiProcessingMs?: IntNullableFilter<"Report"> | number | null
    aiGeminiMs?: IntNullableFilter<"Report"> | number | null
    createdAt?: DateTimeFilter<"Report"> | Date | string
    updatedAt?: DateTimeFilter<"Report"> | Date | string
    reporterId?: StringNullableFilter<"Report"> | string | null
    assignedToId?: StringNullableFilter<"Report"> | string | null
    cleanupScheduleId?: StringNullableFilter<"Report"> | string | null
    reporter?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    assignedTo?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    assignedWorkers?: ReportWorkerListRelationFilter
    cleanupSchedule?: XOR<CleanupScheduleNullableScalarRelationFilter, CleanupScheduleWhereInput> | null
    images?: ReportImageListRelationFilter
    statusHistory?: StatusHistoryListRelationFilter
    notifications?: NotificationListRelationFilter
  }, "id">

  export type ReportOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    status?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    address?: SortOrderInput | SortOrder
    isAnonymous?: SortOrder
    isDeleted?: SortOrder
    isSpam?: SortOrder
    spamMarkedAt?: SortOrderInput | SortOrder
    spamReason?: SortOrderInput | SortOrder
    analysisStatus?: SortOrderInput | SortOrder
    analysisWasteCount?: SortOrderInput | SortOrder
    analysisConfidence?: SortOrderInput | SortOrder
    analyzedAt?: SortOrderInput | SortOrder
    severity?: SortOrderInput | SortOrder
    aiCategories?: SortOrder
    aiReason?: SortOrderInput | SortOrder
    aiModel?: SortOrderInput | SortOrder
    aiImageHash?: SortOrderInput | SortOrder
    aiProcessingMs?: SortOrderInput | SortOrder
    aiGeminiMs?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    reporterId?: SortOrderInput | SortOrder
    assignedToId?: SortOrderInput | SortOrder
    cleanupScheduleId?: SortOrderInput | SortOrder
    _count?: ReportCountOrderByAggregateInput
    _avg?: ReportAvgOrderByAggregateInput
    _max?: ReportMaxOrderByAggregateInput
    _min?: ReportMinOrderByAggregateInput
    _sum?: ReportSumOrderByAggregateInput
  }

  export type ReportScalarWhereWithAggregatesInput = {
    AND?: ReportScalarWhereWithAggregatesInput | ReportScalarWhereWithAggregatesInput[]
    OR?: ReportScalarWhereWithAggregatesInput[]
    NOT?: ReportScalarWhereWithAggregatesInput | ReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Report"> | string
    title?: StringWithAggregatesFilter<"Report"> | string
    description?: StringWithAggregatesFilter<"Report"> | string
    category?: EnumWasteCategoryWithAggregatesFilter<"Report"> | $Enums.WasteCategory
    status?: EnumReportStatusWithAggregatesFilter<"Report"> | $Enums.ReportStatus
    latitude?: FloatWithAggregatesFilter<"Report"> | number
    longitude?: FloatWithAggregatesFilter<"Report"> | number
    address?: StringNullableWithAggregatesFilter<"Report"> | string | null
    isAnonymous?: BoolWithAggregatesFilter<"Report"> | boolean
    isDeleted?: BoolWithAggregatesFilter<"Report"> | boolean
    isSpam?: BoolWithAggregatesFilter<"Report"> | boolean
    spamMarkedAt?: DateTimeNullableWithAggregatesFilter<"Report"> | Date | string | null
    spamReason?: StringNullableWithAggregatesFilter<"Report"> | string | null
    analysisStatus?: EnumAnalysisStatusNullableWithAggregatesFilter<"Report"> | $Enums.AnalysisStatus | null
    analysisWasteCount?: IntNullableWithAggregatesFilter<"Report"> | number | null
    analysisConfidence?: FloatNullableWithAggregatesFilter<"Report"> | number | null
    analyzedAt?: DateTimeNullableWithAggregatesFilter<"Report"> | Date | string | null
    severity?: EnumSeverityNullableWithAggregatesFilter<"Report"> | $Enums.Severity | null
    aiCategories?: StringNullableListFilter<"Report">
    aiReason?: StringNullableWithAggregatesFilter<"Report"> | string | null
    aiModel?: StringNullableWithAggregatesFilter<"Report"> | string | null
    aiImageHash?: StringNullableWithAggregatesFilter<"Report"> | string | null
    aiProcessingMs?: IntNullableWithAggregatesFilter<"Report"> | number | null
    aiGeminiMs?: IntNullableWithAggregatesFilter<"Report"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Report"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Report"> | Date | string
    reporterId?: StringNullableWithAggregatesFilter<"Report"> | string | null
    assignedToId?: StringNullableWithAggregatesFilter<"Report"> | string | null
    cleanupScheduleId?: StringNullableWithAggregatesFilter<"Report"> | string | null
  }

  export type ReportImageWhereInput = {
    AND?: ReportImageWhereInput | ReportImageWhereInput[]
    OR?: ReportImageWhereInput[]
    NOT?: ReportImageWhereInput | ReportImageWhereInput[]
    id?: StringFilter<"ReportImage"> | string
    imageUrl?: StringFilter<"ReportImage"> | string
    publicId?: StringFilter<"ReportImage"> | string
    type?: EnumImageTypeFilter<"ReportImage"> | $Enums.ImageType
    createdAt?: DateTimeFilter<"ReportImage"> | Date | string
    reportId?: StringFilter<"ReportImage"> | string
    report?: XOR<ReportScalarRelationFilter, ReportWhereInput>
  }

  export type ReportImageOrderByWithRelationInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    publicId?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    reportId?: SortOrder
    report?: ReportOrderByWithRelationInput
  }

  export type ReportImageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReportImageWhereInput | ReportImageWhereInput[]
    OR?: ReportImageWhereInput[]
    NOT?: ReportImageWhereInput | ReportImageWhereInput[]
    imageUrl?: StringFilter<"ReportImage"> | string
    publicId?: StringFilter<"ReportImage"> | string
    type?: EnumImageTypeFilter<"ReportImage"> | $Enums.ImageType
    createdAt?: DateTimeFilter<"ReportImage"> | Date | string
    reportId?: StringFilter<"ReportImage"> | string
    report?: XOR<ReportScalarRelationFilter, ReportWhereInput>
  }, "id">

  export type ReportImageOrderByWithAggregationInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    publicId?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    reportId?: SortOrder
    _count?: ReportImageCountOrderByAggregateInput
    _max?: ReportImageMaxOrderByAggregateInput
    _min?: ReportImageMinOrderByAggregateInput
  }

  export type ReportImageScalarWhereWithAggregatesInput = {
    AND?: ReportImageScalarWhereWithAggregatesInput | ReportImageScalarWhereWithAggregatesInput[]
    OR?: ReportImageScalarWhereWithAggregatesInput[]
    NOT?: ReportImageScalarWhereWithAggregatesInput | ReportImageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReportImage"> | string
    imageUrl?: StringWithAggregatesFilter<"ReportImage"> | string
    publicId?: StringWithAggregatesFilter<"ReportImage"> | string
    type?: EnumImageTypeWithAggregatesFilter<"ReportImage"> | $Enums.ImageType
    createdAt?: DateTimeWithAggregatesFilter<"ReportImage"> | Date | string
    reportId?: StringWithAggregatesFilter<"ReportImage"> | string
  }

  export type StatusHistoryWhereInput = {
    AND?: StatusHistoryWhereInput | StatusHistoryWhereInput[]
    OR?: StatusHistoryWhereInput[]
    NOT?: StatusHistoryWhereInput | StatusHistoryWhereInput[]
    id?: StringFilter<"StatusHistory"> | string
    previousStatus?: EnumReportStatusNullableFilter<"StatusHistory"> | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFilter<"StatusHistory"> | $Enums.ReportStatus
    notes?: StringNullableFilter<"StatusHistory"> | string | null
    createdAt?: DateTimeFilter<"StatusHistory"> | Date | string
    reportId?: StringFilter<"StatusHistory"> | string
    changedById?: StringFilter<"StatusHistory"> | string
    report?: XOR<ReportScalarRelationFilter, ReportWhereInput>
    changedBy?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type StatusHistoryOrderByWithRelationInput = {
    id?: SortOrder
    previousStatus?: SortOrderInput | SortOrder
    newStatus?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    reportId?: SortOrder
    changedById?: SortOrder
    report?: ReportOrderByWithRelationInput
    changedBy?: UserOrderByWithRelationInput
  }

  export type StatusHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StatusHistoryWhereInput | StatusHistoryWhereInput[]
    OR?: StatusHistoryWhereInput[]
    NOT?: StatusHistoryWhereInput | StatusHistoryWhereInput[]
    previousStatus?: EnumReportStatusNullableFilter<"StatusHistory"> | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFilter<"StatusHistory"> | $Enums.ReportStatus
    notes?: StringNullableFilter<"StatusHistory"> | string | null
    createdAt?: DateTimeFilter<"StatusHistory"> | Date | string
    reportId?: StringFilter<"StatusHistory"> | string
    changedById?: StringFilter<"StatusHistory"> | string
    report?: XOR<ReportScalarRelationFilter, ReportWhereInput>
    changedBy?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type StatusHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    previousStatus?: SortOrderInput | SortOrder
    newStatus?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    reportId?: SortOrder
    changedById?: SortOrder
    _count?: StatusHistoryCountOrderByAggregateInput
    _max?: StatusHistoryMaxOrderByAggregateInput
    _min?: StatusHistoryMinOrderByAggregateInput
  }

  export type StatusHistoryScalarWhereWithAggregatesInput = {
    AND?: StatusHistoryScalarWhereWithAggregatesInput | StatusHistoryScalarWhereWithAggregatesInput[]
    OR?: StatusHistoryScalarWhereWithAggregatesInput[]
    NOT?: StatusHistoryScalarWhereWithAggregatesInput | StatusHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StatusHistory"> | string
    previousStatus?: EnumReportStatusNullableWithAggregatesFilter<"StatusHistory"> | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusWithAggregatesFilter<"StatusHistory"> | $Enums.ReportStatus
    notes?: StringNullableWithAggregatesFilter<"StatusHistory"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"StatusHistory"> | Date | string
    reportId?: StringWithAggregatesFilter<"StatusHistory"> | string
    changedById?: StringWithAggregatesFilter<"StatusHistory"> | string
  }

  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    type?: EnumNotificationTypeFilter<"Notification"> | $Enums.NotificationType
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    userId?: StringFilter<"Notification"> | string
    reportId?: StringNullableFilter<"Notification"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    report?: XOR<ReportNullableScalarRelationFilter, ReportWhereInput> | null
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    reportId?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    report?: ReportOrderByWithRelationInput
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    type?: EnumNotificationTypeFilter<"Notification"> | $Enums.NotificationType
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    userId?: StringFilter<"Notification"> | string
    reportId?: StringNullableFilter<"Notification"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    report?: XOR<ReportNullableScalarRelationFilter, ReportWhereInput> | null
  }, "id">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    reportId?: SortOrderInput | SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Notification"> | string
    title?: StringWithAggregatesFilter<"Notification"> | string
    message?: StringWithAggregatesFilter<"Notification"> | string
    type?: EnumNotificationTypeWithAggregatesFilter<"Notification"> | $Enums.NotificationType
    isRead?: BoolWithAggregatesFilter<"Notification"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
    userId?: StringWithAggregatesFilter<"Notification"> | string
    reportId?: StringNullableWithAggregatesFilter<"Notification"> | string | null
  }

  export type ReportingZoneWhereInput = {
    AND?: ReportingZoneWhereInput | ReportingZoneWhereInput[]
    OR?: ReportingZoneWhereInput[]
    NOT?: ReportingZoneWhereInput | ReportingZoneWhereInput[]
    id?: StringFilter<"ReportingZone"> | string
    name?: StringFilter<"ReportingZone"> | string
    coordinates?: JsonFilter<"ReportingZone">
    isActive?: BoolFilter<"ReportingZone"> | boolean
    createdAt?: DateTimeFilter<"ReportingZone"> | Date | string
    updatedAt?: DateTimeFilter<"ReportingZone"> | Date | string
    createdById?: StringFilter<"ReportingZone"> | string
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ReportingZoneOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    coordinates?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    createdBy?: UserOrderByWithRelationInput
  }

  export type ReportingZoneWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReportingZoneWhereInput | ReportingZoneWhereInput[]
    OR?: ReportingZoneWhereInput[]
    NOT?: ReportingZoneWhereInput | ReportingZoneWhereInput[]
    name?: StringFilter<"ReportingZone"> | string
    coordinates?: JsonFilter<"ReportingZone">
    isActive?: BoolFilter<"ReportingZone"> | boolean
    createdAt?: DateTimeFilter<"ReportingZone"> | Date | string
    updatedAt?: DateTimeFilter<"ReportingZone"> | Date | string
    createdById?: StringFilter<"ReportingZone"> | string
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type ReportingZoneOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    coordinates?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    _count?: ReportingZoneCountOrderByAggregateInput
    _max?: ReportingZoneMaxOrderByAggregateInput
    _min?: ReportingZoneMinOrderByAggregateInput
  }

  export type ReportingZoneScalarWhereWithAggregatesInput = {
    AND?: ReportingZoneScalarWhereWithAggregatesInput | ReportingZoneScalarWhereWithAggregatesInput[]
    OR?: ReportingZoneScalarWhereWithAggregatesInput[]
    NOT?: ReportingZoneScalarWhereWithAggregatesInput | ReportingZoneScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReportingZone"> | string
    name?: StringWithAggregatesFilter<"ReportingZone"> | string
    coordinates?: JsonWithAggregatesFilter<"ReportingZone">
    isActive?: BoolWithAggregatesFilter<"ReportingZone"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"ReportingZone"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ReportingZone"> | Date | string
    createdById?: StringWithAggregatesFilter<"ReportingZone"> | string
  }

  export type CleanupScheduleWhereInput = {
    AND?: CleanupScheduleWhereInput | CleanupScheduleWhereInput[]
    OR?: CleanupScheduleWhereInput[]
    NOT?: CleanupScheduleWhereInput | CleanupScheduleWhereInput[]
    id?: StringFilter<"CleanupSchedule"> | string
    title?: StringFilter<"CleanupSchedule"> | string
    description?: StringFilter<"CleanupSchedule"> | string
    barangay?: StringFilter<"CleanupSchedule"> | string
    latitude?: FloatFilter<"CleanupSchedule"> | number
    longitude?: FloatFilter<"CleanupSchedule"> | number
    scheduledAt?: DateTimeFilter<"CleanupSchedule"> | Date | string
    status?: EnumCleanupScheduleStatusFilter<"CleanupSchedule"> | $Enums.CleanupScheduleStatus
    notes?: StringNullableFilter<"CleanupSchedule"> | string | null
    createdAt?: DateTimeFilter<"CleanupSchedule"> | Date | string
    updatedAt?: DateTimeFilter<"CleanupSchedule"> | Date | string
    createdById?: StringFilter<"CleanupSchedule"> | string
    verifiedById?: StringNullableFilter<"CleanupSchedule"> | string | null
    verifiedAt?: DateTimeNullableFilter<"CleanupSchedule"> | Date | string | null
    equipment?: StringNullableListFilter<"CleanupSchedule">
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    verifiedBy?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    workers?: CleanupScheduleWorkerListRelationFilter
    reports?: ReportListRelationFilter
  }

  export type CleanupScheduleOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    barangay?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    scheduledAt?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    verifiedById?: SortOrderInput | SortOrder
    verifiedAt?: SortOrderInput | SortOrder
    equipment?: SortOrder
    createdBy?: UserOrderByWithRelationInput
    verifiedBy?: UserOrderByWithRelationInput
    workers?: CleanupScheduleWorkerOrderByRelationAggregateInput
    reports?: ReportOrderByRelationAggregateInput
  }

  export type CleanupScheduleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CleanupScheduleWhereInput | CleanupScheduleWhereInput[]
    OR?: CleanupScheduleWhereInput[]
    NOT?: CleanupScheduleWhereInput | CleanupScheduleWhereInput[]
    title?: StringFilter<"CleanupSchedule"> | string
    description?: StringFilter<"CleanupSchedule"> | string
    barangay?: StringFilter<"CleanupSchedule"> | string
    latitude?: FloatFilter<"CleanupSchedule"> | number
    longitude?: FloatFilter<"CleanupSchedule"> | number
    scheduledAt?: DateTimeFilter<"CleanupSchedule"> | Date | string
    status?: EnumCleanupScheduleStatusFilter<"CleanupSchedule"> | $Enums.CleanupScheduleStatus
    notes?: StringNullableFilter<"CleanupSchedule"> | string | null
    createdAt?: DateTimeFilter<"CleanupSchedule"> | Date | string
    updatedAt?: DateTimeFilter<"CleanupSchedule"> | Date | string
    createdById?: StringFilter<"CleanupSchedule"> | string
    verifiedById?: StringNullableFilter<"CleanupSchedule"> | string | null
    verifiedAt?: DateTimeNullableFilter<"CleanupSchedule"> | Date | string | null
    equipment?: StringNullableListFilter<"CleanupSchedule">
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    verifiedBy?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    workers?: CleanupScheduleWorkerListRelationFilter
    reports?: ReportListRelationFilter
  }, "id">

  export type CleanupScheduleOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    barangay?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    scheduledAt?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    verifiedById?: SortOrderInput | SortOrder
    verifiedAt?: SortOrderInput | SortOrder
    equipment?: SortOrder
    _count?: CleanupScheduleCountOrderByAggregateInput
    _avg?: CleanupScheduleAvgOrderByAggregateInput
    _max?: CleanupScheduleMaxOrderByAggregateInput
    _min?: CleanupScheduleMinOrderByAggregateInput
    _sum?: CleanupScheduleSumOrderByAggregateInput
  }

  export type CleanupScheduleScalarWhereWithAggregatesInput = {
    AND?: CleanupScheduleScalarWhereWithAggregatesInput | CleanupScheduleScalarWhereWithAggregatesInput[]
    OR?: CleanupScheduleScalarWhereWithAggregatesInput[]
    NOT?: CleanupScheduleScalarWhereWithAggregatesInput | CleanupScheduleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CleanupSchedule"> | string
    title?: StringWithAggregatesFilter<"CleanupSchedule"> | string
    description?: StringWithAggregatesFilter<"CleanupSchedule"> | string
    barangay?: StringWithAggregatesFilter<"CleanupSchedule"> | string
    latitude?: FloatWithAggregatesFilter<"CleanupSchedule"> | number
    longitude?: FloatWithAggregatesFilter<"CleanupSchedule"> | number
    scheduledAt?: DateTimeWithAggregatesFilter<"CleanupSchedule"> | Date | string
    status?: EnumCleanupScheduleStatusWithAggregatesFilter<"CleanupSchedule"> | $Enums.CleanupScheduleStatus
    notes?: StringNullableWithAggregatesFilter<"CleanupSchedule"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"CleanupSchedule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CleanupSchedule"> | Date | string
    createdById?: StringWithAggregatesFilter<"CleanupSchedule"> | string
    verifiedById?: StringNullableWithAggregatesFilter<"CleanupSchedule"> | string | null
    verifiedAt?: DateTimeNullableWithAggregatesFilter<"CleanupSchedule"> | Date | string | null
    equipment?: StringNullableListFilter<"CleanupSchedule">
  }

  export type CleanupScheduleWorkerWhereInput = {
    AND?: CleanupScheduleWorkerWhereInput | CleanupScheduleWorkerWhereInput[]
    OR?: CleanupScheduleWorkerWhereInput[]
    NOT?: CleanupScheduleWorkerWhereInput | CleanupScheduleWorkerWhereInput[]
    id?: StringFilter<"CleanupScheduleWorker"> | string
    assignedAt?: DateTimeFilter<"CleanupScheduleWorker"> | Date | string
    scheduleId?: StringFilter<"CleanupScheduleWorker"> | string
    workerId?: StringFilter<"CleanupScheduleWorker"> | string
    schedule?: XOR<CleanupScheduleScalarRelationFilter, CleanupScheduleWhereInput>
    worker?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type CleanupScheduleWorkerOrderByWithRelationInput = {
    id?: SortOrder
    assignedAt?: SortOrder
    scheduleId?: SortOrder
    workerId?: SortOrder
    schedule?: CleanupScheduleOrderByWithRelationInput
    worker?: UserOrderByWithRelationInput
  }

  export type CleanupScheduleWorkerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    scheduleId_workerId?: CleanupScheduleWorkerScheduleIdWorkerIdCompoundUniqueInput
    AND?: CleanupScheduleWorkerWhereInput | CleanupScheduleWorkerWhereInput[]
    OR?: CleanupScheduleWorkerWhereInput[]
    NOT?: CleanupScheduleWorkerWhereInput | CleanupScheduleWorkerWhereInput[]
    assignedAt?: DateTimeFilter<"CleanupScheduleWorker"> | Date | string
    scheduleId?: StringFilter<"CleanupScheduleWorker"> | string
    workerId?: StringFilter<"CleanupScheduleWorker"> | string
    schedule?: XOR<CleanupScheduleScalarRelationFilter, CleanupScheduleWhereInput>
    worker?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "scheduleId_workerId">

  export type CleanupScheduleWorkerOrderByWithAggregationInput = {
    id?: SortOrder
    assignedAt?: SortOrder
    scheduleId?: SortOrder
    workerId?: SortOrder
    _count?: CleanupScheduleWorkerCountOrderByAggregateInput
    _max?: CleanupScheduleWorkerMaxOrderByAggregateInput
    _min?: CleanupScheduleWorkerMinOrderByAggregateInput
  }

  export type CleanupScheduleWorkerScalarWhereWithAggregatesInput = {
    AND?: CleanupScheduleWorkerScalarWhereWithAggregatesInput | CleanupScheduleWorkerScalarWhereWithAggregatesInput[]
    OR?: CleanupScheduleWorkerScalarWhereWithAggregatesInput[]
    NOT?: CleanupScheduleWorkerScalarWhereWithAggregatesInput | CleanupScheduleWorkerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CleanupScheduleWorker"> | string
    assignedAt?: DateTimeWithAggregatesFilter<"CleanupScheduleWorker"> | Date | string
    scheduleId?: StringWithAggregatesFilter<"CleanupScheduleWorker"> | string
    workerId?: StringWithAggregatesFilter<"CleanupScheduleWorker"> | string
  }

  export type ReportWorkerWhereInput = {
    AND?: ReportWorkerWhereInput | ReportWorkerWhereInput[]
    OR?: ReportWorkerWhereInput[]
    NOT?: ReportWorkerWhereInput | ReportWorkerWhereInput[]
    id?: StringFilter<"ReportWorker"> | string
    assignedAt?: DateTimeFilter<"ReportWorker"> | Date | string
    reportId?: StringFilter<"ReportWorker"> | string
    workerId?: StringFilter<"ReportWorker"> | string
    report?: XOR<ReportScalarRelationFilter, ReportWhereInput>
    worker?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ReportWorkerOrderByWithRelationInput = {
    id?: SortOrder
    assignedAt?: SortOrder
    reportId?: SortOrder
    workerId?: SortOrder
    report?: ReportOrderByWithRelationInput
    worker?: UserOrderByWithRelationInput
  }

  export type ReportWorkerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    reportId_workerId?: ReportWorkerReportIdWorkerIdCompoundUniqueInput
    AND?: ReportWorkerWhereInput | ReportWorkerWhereInput[]
    OR?: ReportWorkerWhereInput[]
    NOT?: ReportWorkerWhereInput | ReportWorkerWhereInput[]
    assignedAt?: DateTimeFilter<"ReportWorker"> | Date | string
    reportId?: StringFilter<"ReportWorker"> | string
    workerId?: StringFilter<"ReportWorker"> | string
    report?: XOR<ReportScalarRelationFilter, ReportWhereInput>
    worker?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "reportId_workerId">

  export type ReportWorkerOrderByWithAggregationInput = {
    id?: SortOrder
    assignedAt?: SortOrder
    reportId?: SortOrder
    workerId?: SortOrder
    _count?: ReportWorkerCountOrderByAggregateInput
    _max?: ReportWorkerMaxOrderByAggregateInput
    _min?: ReportWorkerMinOrderByAggregateInput
  }

  export type ReportWorkerScalarWhereWithAggregatesInput = {
    AND?: ReportWorkerScalarWhereWithAggregatesInput | ReportWorkerScalarWhereWithAggregatesInput[]
    OR?: ReportWorkerScalarWhereWithAggregatesInput[]
    NOT?: ReportWorkerScalarWhereWithAggregatesInput | ReportWorkerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReportWorker"> | string
    assignedAt?: DateTimeWithAggregatesFilter<"ReportWorker"> | Date | string
    reportId?: StringWithAggregatesFilter<"ReportWorker"> | string
    workerId?: StringWithAggregatesFilter<"ReportWorker"> | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportCreateNestedManyWithoutReporterInput
    assignedReports?: ReportCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryCreateNestedManyWithoutChangedByInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerCreateNestedManyWithoutWorkerInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportUncheckedCreateNestedManyWithoutReporterInput
    assignedReports?: ReportUncheckedCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryUncheckedCreateNestedManyWithoutChangedByInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneUncheckedCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutWorkerInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUpdateManyWithoutWorkerNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUncheckedUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUncheckedUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUncheckedUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUncheckedUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUncheckedUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUncheckedUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUncheckedUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportCreateInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporter?: UserCreateNestedOneWithoutReportsInput
    assignedTo?: UserCreateNestedOneWithoutAssignedReportsInput
    assignedWorkers?: ReportWorkerCreateNestedManyWithoutReportInput
    cleanupSchedule?: CleanupScheduleCreateNestedOneWithoutReportsInput
    images?: ReportImageCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryCreateNestedManyWithoutReportInput
    notifications?: NotificationCreateNestedManyWithoutReportInput
  }

  export type ReportUncheckedCreateInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporterId?: string | null
    assignedToId?: string | null
    cleanupScheduleId?: string | null
    assignedWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutReportInput
    images?: ReportImageUncheckedCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryUncheckedCreateNestedManyWithoutReportInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutReportInput
  }

  export type ReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporter?: UserUpdateOneWithoutReportsNestedInput
    assignedTo?: UserUpdateOneWithoutAssignedReportsNestedInput
    assignedWorkers?: ReportWorkerUpdateManyWithoutReportNestedInput
    cleanupSchedule?: CleanupScheduleUpdateOneWithoutReportsNestedInput
    images?: ReportImageUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUpdateManyWithoutReportNestedInput
    notifications?: NotificationUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporterId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    cleanupScheduleId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedWorkers?: ReportWorkerUncheckedUpdateManyWithoutReportNestedInput
    images?: ReportImageUncheckedUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUncheckedUpdateManyWithoutReportNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutReportNestedInput
  }

  export type ReportCreateManyInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporterId?: string | null
    assignedToId?: string | null
    cleanupScheduleId?: string | null
  }

  export type ReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporterId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    cleanupScheduleId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReportImageCreateInput = {
    id?: string
    imageUrl: string
    publicId: string
    type?: $Enums.ImageType
    createdAt?: Date | string
    report: ReportCreateNestedOneWithoutImagesInput
  }

  export type ReportImageUncheckedCreateInput = {
    id?: string
    imageUrl: string
    publicId: string
    type?: $Enums.ImageType
    createdAt?: Date | string
    reportId: string
  }

  export type ReportImageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    report?: ReportUpdateOneRequiredWithoutImagesNestedInput
  }

  export type ReportImageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: StringFieldUpdateOperationsInput | string
  }

  export type ReportImageCreateManyInput = {
    id?: string
    imageUrl: string
    publicId: string
    type?: $Enums.ImageType
    createdAt?: Date | string
    reportId: string
  }

  export type ReportImageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportImageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: StringFieldUpdateOperationsInput | string
  }

  export type StatusHistoryCreateInput = {
    id?: string
    previousStatus?: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus
    notes?: string | null
    createdAt?: Date | string
    report: ReportCreateNestedOneWithoutStatusHistoryInput
    changedBy: UserCreateNestedOneWithoutStatusChangesInput
  }

  export type StatusHistoryUncheckedCreateInput = {
    id?: string
    previousStatus?: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus
    notes?: string | null
    createdAt?: Date | string
    reportId: string
    changedById: string
  }

  export type StatusHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    previousStatus?: NullableEnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    report?: ReportUpdateOneRequiredWithoutStatusHistoryNestedInput
    changedBy?: UserUpdateOneRequiredWithoutStatusChangesNestedInput
  }

  export type StatusHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    previousStatus?: NullableEnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: StringFieldUpdateOperationsInput | string
    changedById?: StringFieldUpdateOperationsInput | string
  }

  export type StatusHistoryCreateManyInput = {
    id?: string
    previousStatus?: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus
    notes?: string | null
    createdAt?: Date | string
    reportId: string
    changedById: string
  }

  export type StatusHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    previousStatus?: NullableEnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StatusHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    previousStatus?: NullableEnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: StringFieldUpdateOperationsInput | string
    changedById?: StringFieldUpdateOperationsInput | string
  }

  export type NotificationCreateInput = {
    id?: string
    title: string
    message: string
    type: $Enums.NotificationType
    isRead?: boolean
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutNotificationsInput
    report?: ReportCreateNestedOneWithoutNotificationsInput
  }

  export type NotificationUncheckedCreateInput = {
    id?: string
    title: string
    message: string
    type: $Enums.NotificationType
    isRead?: boolean
    createdAt?: Date | string
    userId: string
    reportId?: string | null
  }

  export type NotificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutNotificationsNestedInput
    report?: ReportUpdateOneWithoutNotificationsNestedInput
  }

  export type NotificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    reportId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NotificationCreateManyInput = {
    id?: string
    title: string
    message: string
    type: $Enums.NotificationType
    isRead?: boolean
    createdAt?: Date | string
    userId: string
    reportId?: string | null
  }

  export type NotificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    reportId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReportingZoneCreateInput = {
    id?: string
    name: string
    coordinates: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutReportingZonesInput
  }

  export type ReportingZoneUncheckedCreateInput = {
    id?: string
    name: string
    coordinates: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
  }

  export type ReportingZoneUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coordinates?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutReportingZonesNestedInput
  }

  export type ReportingZoneUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coordinates?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
  }

  export type ReportingZoneCreateManyInput = {
    id?: string
    name: string
    coordinates: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
  }

  export type ReportingZoneUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coordinates?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportingZoneUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coordinates?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
  }

  export type CleanupScheduleCreateInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
    createdBy: UserCreateNestedOneWithoutCreatedSchedulesInput
    verifiedBy?: UserCreateNestedOneWithoutVerifiedSchedulesInput
    workers?: CleanupScheduleWorkerCreateNestedManyWithoutScheduleInput
    reports?: ReportCreateNestedManyWithoutCleanupScheduleInput
  }

  export type CleanupScheduleUncheckedCreateInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    verifiedById?: string | null
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
    workers?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutScheduleInput
    reports?: ReportUncheckedCreateNestedManyWithoutCleanupScheduleInput
  }

  export type CleanupScheduleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
    createdBy?: UserUpdateOneRequiredWithoutCreatedSchedulesNestedInput
    verifiedBy?: UserUpdateOneWithoutVerifiedSchedulesNestedInput
    workers?: CleanupScheduleWorkerUpdateManyWithoutScheduleNestedInput
    reports?: ReportUpdateManyWithoutCleanupScheduleNestedInput
  }

  export type CleanupScheduleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    verifiedById?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
    workers?: CleanupScheduleWorkerUncheckedUpdateManyWithoutScheduleNestedInput
    reports?: ReportUncheckedUpdateManyWithoutCleanupScheduleNestedInput
  }

  export type CleanupScheduleCreateManyInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    verifiedById?: string | null
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
  }

  export type CleanupScheduleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
  }

  export type CleanupScheduleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    verifiedById?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
  }

  export type CleanupScheduleWorkerCreateInput = {
    id?: string
    assignedAt?: Date | string
    schedule: CleanupScheduleCreateNestedOneWithoutWorkersInput
    worker: UserCreateNestedOneWithoutScheduleAssignmentsInput
  }

  export type CleanupScheduleWorkerUncheckedCreateInput = {
    id?: string
    assignedAt?: Date | string
    scheduleId: string
    workerId: string
  }

  export type CleanupScheduleWorkerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: CleanupScheduleUpdateOneRequiredWithoutWorkersNestedInput
    worker?: UserUpdateOneRequiredWithoutScheduleAssignmentsNestedInput
  }

  export type CleanupScheduleWorkerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleId?: StringFieldUpdateOperationsInput | string
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type CleanupScheduleWorkerCreateManyInput = {
    id?: string
    assignedAt?: Date | string
    scheduleId: string
    workerId: string
  }

  export type CleanupScheduleWorkerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CleanupScheduleWorkerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleId?: StringFieldUpdateOperationsInput | string
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type ReportWorkerCreateInput = {
    id?: string
    assignedAt?: Date | string
    report: ReportCreateNestedOneWithoutAssignedWorkersInput
    worker: UserCreateNestedOneWithoutAssignedReportWorkersInput
  }

  export type ReportWorkerUncheckedCreateInput = {
    id?: string
    assignedAt?: Date | string
    reportId: string
    workerId: string
  }

  export type ReportWorkerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    report?: ReportUpdateOneRequiredWithoutAssignedWorkersNestedInput
    worker?: UserUpdateOneRequiredWithoutAssignedReportWorkersNestedInput
  }

  export type ReportWorkerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: StringFieldUpdateOperationsInput | string
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type ReportWorkerCreateManyInput = {
    id?: string
    assignedAt?: Date | string
    reportId: string
    workerId: string
  }

  export type ReportWorkerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportWorkerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: StringFieldUpdateOperationsInput | string
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ReportListRelationFilter = {
    every?: ReportWhereInput
    some?: ReportWhereInput
    none?: ReportWhereInput
  }

  export type ReportWorkerListRelationFilter = {
    every?: ReportWorkerWhereInput
    some?: ReportWorkerWhereInput
    none?: ReportWorkerWhereInput
  }

  export type StatusHistoryListRelationFilter = {
    every?: StatusHistoryWhereInput
    some?: StatusHistoryWhereInput
    none?: StatusHistoryWhereInput
  }

  export type NotificationListRelationFilter = {
    every?: NotificationWhereInput
    some?: NotificationWhereInput
    none?: NotificationWhereInput
  }

  export type ReportingZoneListRelationFilter = {
    every?: ReportingZoneWhereInput
    some?: ReportingZoneWhereInput
    none?: ReportingZoneWhereInput
  }

  export type CleanupScheduleListRelationFilter = {
    every?: CleanupScheduleWhereInput
    some?: CleanupScheduleWhereInput
    none?: CleanupScheduleWhereInput
  }

  export type CleanupScheduleWorkerListRelationFilter = {
    every?: CleanupScheduleWorkerWhereInput
    some?: CleanupScheduleWorkerWhereInput
    none?: CleanupScheduleWorkerWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ReportOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReportWorkerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StatusHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type NotificationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReportingZoneOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CleanupScheduleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CleanupScheduleWorkerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    role?: SortOrder
    avatarUrl?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    role?: SortOrder
    avatarUrl?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    role?: SortOrder
    avatarUrl?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumWasteCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.WasteCategory | EnumWasteCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.WasteCategory[] | ListEnumWasteCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.WasteCategory[] | ListEnumWasteCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumWasteCategoryFilter<$PrismaModel> | $Enums.WasteCategory
  }

  export type EnumReportStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportStatus | EnumReportStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReportStatusFilter<$PrismaModel> | $Enums.ReportStatus
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnumAnalysisStatusNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.AnalysisStatus | EnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.AnalysisStatus[] | ListEnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AnalysisStatus[] | ListEnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAnalysisStatusNullableFilter<$PrismaModel> | $Enums.AnalysisStatus | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type EnumSeverityNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Severity | EnumSeverityFieldRefInput<$PrismaModel> | null
    in?: $Enums.Severity[] | ListEnumSeverityFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Severity[] | ListEnumSeverityFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSeverityNullableFilter<$PrismaModel> | $Enums.Severity | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type CleanupScheduleNullableScalarRelationFilter = {
    is?: CleanupScheduleWhereInput | null
    isNot?: CleanupScheduleWhereInput | null
  }

  export type ReportImageListRelationFilter = {
    every?: ReportImageWhereInput
    some?: ReportImageWhereInput
    none?: ReportImageWhereInput
  }

  export type ReportImageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReportCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    status?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    address?: SortOrder
    isAnonymous?: SortOrder
    isDeleted?: SortOrder
    isSpam?: SortOrder
    spamMarkedAt?: SortOrder
    spamReason?: SortOrder
    analysisStatus?: SortOrder
    analysisWasteCount?: SortOrder
    analysisConfidence?: SortOrder
    analyzedAt?: SortOrder
    severity?: SortOrder
    aiCategories?: SortOrder
    aiReason?: SortOrder
    aiModel?: SortOrder
    aiImageHash?: SortOrder
    aiProcessingMs?: SortOrder
    aiGeminiMs?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    reporterId?: SortOrder
    assignedToId?: SortOrder
    cleanupScheduleId?: SortOrder
  }

  export type ReportAvgOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
    analysisWasteCount?: SortOrder
    analysisConfidence?: SortOrder
    aiProcessingMs?: SortOrder
    aiGeminiMs?: SortOrder
  }

  export type ReportMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    status?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    address?: SortOrder
    isAnonymous?: SortOrder
    isDeleted?: SortOrder
    isSpam?: SortOrder
    spamMarkedAt?: SortOrder
    spamReason?: SortOrder
    analysisStatus?: SortOrder
    analysisWasteCount?: SortOrder
    analysisConfidence?: SortOrder
    analyzedAt?: SortOrder
    severity?: SortOrder
    aiReason?: SortOrder
    aiModel?: SortOrder
    aiImageHash?: SortOrder
    aiProcessingMs?: SortOrder
    aiGeminiMs?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    reporterId?: SortOrder
    assignedToId?: SortOrder
    cleanupScheduleId?: SortOrder
  }

  export type ReportMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    category?: SortOrder
    status?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    address?: SortOrder
    isAnonymous?: SortOrder
    isDeleted?: SortOrder
    isSpam?: SortOrder
    spamMarkedAt?: SortOrder
    spamReason?: SortOrder
    analysisStatus?: SortOrder
    analysisWasteCount?: SortOrder
    analysisConfidence?: SortOrder
    analyzedAt?: SortOrder
    severity?: SortOrder
    aiReason?: SortOrder
    aiModel?: SortOrder
    aiImageHash?: SortOrder
    aiProcessingMs?: SortOrder
    aiGeminiMs?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    reporterId?: SortOrder
    assignedToId?: SortOrder
    cleanupScheduleId?: SortOrder
  }

  export type ReportSumOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
    analysisWasteCount?: SortOrder
    analysisConfidence?: SortOrder
    aiProcessingMs?: SortOrder
    aiGeminiMs?: SortOrder
  }

  export type EnumWasteCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.WasteCategory | EnumWasteCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.WasteCategory[] | ListEnumWasteCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.WasteCategory[] | ListEnumWasteCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumWasteCategoryWithAggregatesFilter<$PrismaModel> | $Enums.WasteCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWasteCategoryFilter<$PrismaModel>
    _max?: NestedEnumWasteCategoryFilter<$PrismaModel>
  }

  export type EnumReportStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportStatus | EnumReportStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReportStatusWithAggregatesFilter<$PrismaModel> | $Enums.ReportStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumReportStatusFilter<$PrismaModel>
    _max?: NestedEnumReportStatusFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumAnalysisStatusNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AnalysisStatus | EnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.AnalysisStatus[] | ListEnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AnalysisStatus[] | ListEnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAnalysisStatusNullableWithAggregatesFilter<$PrismaModel> | $Enums.AnalysisStatus | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumAnalysisStatusNullableFilter<$PrismaModel>
    _max?: NestedEnumAnalysisStatusNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumSeverityNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Severity | EnumSeverityFieldRefInput<$PrismaModel> | null
    in?: $Enums.Severity[] | ListEnumSeverityFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Severity[] | ListEnumSeverityFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSeverityNullableWithAggregatesFilter<$PrismaModel> | $Enums.Severity | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumSeverityNullableFilter<$PrismaModel>
    _max?: NestedEnumSeverityNullableFilter<$PrismaModel>
  }

  export type EnumImageTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ImageType | EnumImageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumImageTypeFilter<$PrismaModel> | $Enums.ImageType
  }

  export type ReportScalarRelationFilter = {
    is?: ReportWhereInput
    isNot?: ReportWhereInput
  }

  export type ReportImageCountOrderByAggregateInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    publicId?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    reportId?: SortOrder
  }

  export type ReportImageMaxOrderByAggregateInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    publicId?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    reportId?: SortOrder
  }

  export type ReportImageMinOrderByAggregateInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    publicId?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    reportId?: SortOrder
  }

  export type EnumImageTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ImageType | EnumImageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumImageTypeWithAggregatesFilter<$PrismaModel> | $Enums.ImageType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumImageTypeFilter<$PrismaModel>
    _max?: NestedEnumImageTypeFilter<$PrismaModel>
  }

  export type EnumReportStatusNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportStatus | EnumReportStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumReportStatusNullableFilter<$PrismaModel> | $Enums.ReportStatus | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type StatusHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    previousStatus?: SortOrder
    newStatus?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    reportId?: SortOrder
    changedById?: SortOrder
  }

  export type StatusHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    previousStatus?: SortOrder
    newStatus?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    reportId?: SortOrder
    changedById?: SortOrder
  }

  export type StatusHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    previousStatus?: SortOrder
    newStatus?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    reportId?: SortOrder
    changedById?: SortOrder
  }

  export type EnumReportStatusNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportStatus | EnumReportStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumReportStatusNullableWithAggregatesFilter<$PrismaModel> | $Enums.ReportStatus | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumReportStatusNullableFilter<$PrismaModel>
    _max?: NestedEnumReportStatusNullableFilter<$PrismaModel>
  }

  export type EnumNotificationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeFilter<$PrismaModel> | $Enums.NotificationType
  }

  export type ReportNullableScalarRelationFilter = {
    is?: ReportWhereInput | null
    isNot?: ReportWhereInput | null
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    reportId?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    reportId?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    reportId?: SortOrder
  }

  export type EnumNotificationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeWithAggregatesFilter<$PrismaModel> | $Enums.NotificationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNotificationTypeFilter<$PrismaModel>
    _max?: NestedEnumNotificationTypeFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ReportingZoneCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    coordinates?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
  }

  export type ReportingZoneMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
  }

  export type ReportingZoneMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumCleanupScheduleStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CleanupScheduleStatus | EnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CleanupScheduleStatus[] | ListEnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CleanupScheduleStatus[] | ListEnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCleanupScheduleStatusFilter<$PrismaModel> | $Enums.CleanupScheduleStatus
  }

  export type CleanupScheduleCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    barangay?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    scheduledAt?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    verifiedById?: SortOrder
    verifiedAt?: SortOrder
    equipment?: SortOrder
  }

  export type CleanupScheduleAvgOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type CleanupScheduleMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    barangay?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    scheduledAt?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    verifiedById?: SortOrder
    verifiedAt?: SortOrder
  }

  export type CleanupScheduleMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    barangay?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    scheduledAt?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    verifiedById?: SortOrder
    verifiedAt?: SortOrder
  }

  export type CleanupScheduleSumOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type EnumCleanupScheduleStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CleanupScheduleStatus | EnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CleanupScheduleStatus[] | ListEnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CleanupScheduleStatus[] | ListEnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCleanupScheduleStatusWithAggregatesFilter<$PrismaModel> | $Enums.CleanupScheduleStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCleanupScheduleStatusFilter<$PrismaModel>
    _max?: NestedEnumCleanupScheduleStatusFilter<$PrismaModel>
  }

  export type CleanupScheduleScalarRelationFilter = {
    is?: CleanupScheduleWhereInput
    isNot?: CleanupScheduleWhereInput
  }

  export type CleanupScheduleWorkerScheduleIdWorkerIdCompoundUniqueInput = {
    scheduleId: string
    workerId: string
  }

  export type CleanupScheduleWorkerCountOrderByAggregateInput = {
    id?: SortOrder
    assignedAt?: SortOrder
    scheduleId?: SortOrder
    workerId?: SortOrder
  }

  export type CleanupScheduleWorkerMaxOrderByAggregateInput = {
    id?: SortOrder
    assignedAt?: SortOrder
    scheduleId?: SortOrder
    workerId?: SortOrder
  }

  export type CleanupScheduleWorkerMinOrderByAggregateInput = {
    id?: SortOrder
    assignedAt?: SortOrder
    scheduleId?: SortOrder
    workerId?: SortOrder
  }

  export type ReportWorkerReportIdWorkerIdCompoundUniqueInput = {
    reportId: string
    workerId: string
  }

  export type ReportWorkerCountOrderByAggregateInput = {
    id?: SortOrder
    assignedAt?: SortOrder
    reportId?: SortOrder
    workerId?: SortOrder
  }

  export type ReportWorkerMaxOrderByAggregateInput = {
    id?: SortOrder
    assignedAt?: SortOrder
    reportId?: SortOrder
    workerId?: SortOrder
  }

  export type ReportWorkerMinOrderByAggregateInput = {
    id?: SortOrder
    assignedAt?: SortOrder
    reportId?: SortOrder
    workerId?: SortOrder
  }

  export type ReportCreateNestedManyWithoutReporterInput = {
    create?: XOR<ReportCreateWithoutReporterInput, ReportUncheckedCreateWithoutReporterInput> | ReportCreateWithoutReporterInput[] | ReportUncheckedCreateWithoutReporterInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutReporterInput | ReportCreateOrConnectWithoutReporterInput[]
    createMany?: ReportCreateManyReporterInputEnvelope
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
  }

  export type ReportCreateNestedManyWithoutAssignedToInput = {
    create?: XOR<ReportCreateWithoutAssignedToInput, ReportUncheckedCreateWithoutAssignedToInput> | ReportCreateWithoutAssignedToInput[] | ReportUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutAssignedToInput | ReportCreateOrConnectWithoutAssignedToInput[]
    createMany?: ReportCreateManyAssignedToInputEnvelope
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
  }

  export type ReportWorkerCreateNestedManyWithoutWorkerInput = {
    create?: XOR<ReportWorkerCreateWithoutWorkerInput, ReportWorkerUncheckedCreateWithoutWorkerInput> | ReportWorkerCreateWithoutWorkerInput[] | ReportWorkerUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: ReportWorkerCreateOrConnectWithoutWorkerInput | ReportWorkerCreateOrConnectWithoutWorkerInput[]
    createMany?: ReportWorkerCreateManyWorkerInputEnvelope
    connect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
  }

  export type StatusHistoryCreateNestedManyWithoutChangedByInput = {
    create?: XOR<StatusHistoryCreateWithoutChangedByInput, StatusHistoryUncheckedCreateWithoutChangedByInput> | StatusHistoryCreateWithoutChangedByInput[] | StatusHistoryUncheckedCreateWithoutChangedByInput[]
    connectOrCreate?: StatusHistoryCreateOrConnectWithoutChangedByInput | StatusHistoryCreateOrConnectWithoutChangedByInput[]
    createMany?: StatusHistoryCreateManyChangedByInputEnvelope
    connect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
  }

  export type NotificationCreateNestedManyWithoutUserInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type ReportingZoneCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<ReportingZoneCreateWithoutCreatedByInput, ReportingZoneUncheckedCreateWithoutCreatedByInput> | ReportingZoneCreateWithoutCreatedByInput[] | ReportingZoneUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ReportingZoneCreateOrConnectWithoutCreatedByInput | ReportingZoneCreateOrConnectWithoutCreatedByInput[]
    createMany?: ReportingZoneCreateManyCreatedByInputEnvelope
    connect?: ReportingZoneWhereUniqueInput | ReportingZoneWhereUniqueInput[]
  }

  export type CleanupScheduleCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<CleanupScheduleCreateWithoutCreatedByInput, CleanupScheduleUncheckedCreateWithoutCreatedByInput> | CleanupScheduleCreateWithoutCreatedByInput[] | CleanupScheduleUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutCreatedByInput | CleanupScheduleCreateOrConnectWithoutCreatedByInput[]
    createMany?: CleanupScheduleCreateManyCreatedByInputEnvelope
    connect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
  }

  export type CleanupScheduleCreateNestedManyWithoutVerifiedByInput = {
    create?: XOR<CleanupScheduleCreateWithoutVerifiedByInput, CleanupScheduleUncheckedCreateWithoutVerifiedByInput> | CleanupScheduleCreateWithoutVerifiedByInput[] | CleanupScheduleUncheckedCreateWithoutVerifiedByInput[]
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutVerifiedByInput | CleanupScheduleCreateOrConnectWithoutVerifiedByInput[]
    createMany?: CleanupScheduleCreateManyVerifiedByInputEnvelope
    connect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
  }

  export type CleanupScheduleWorkerCreateNestedManyWithoutWorkerInput = {
    create?: XOR<CleanupScheduleWorkerCreateWithoutWorkerInput, CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput> | CleanupScheduleWorkerCreateWithoutWorkerInput[] | CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: CleanupScheduleWorkerCreateOrConnectWithoutWorkerInput | CleanupScheduleWorkerCreateOrConnectWithoutWorkerInput[]
    createMany?: CleanupScheduleWorkerCreateManyWorkerInputEnvelope
    connect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
  }

  export type ReportUncheckedCreateNestedManyWithoutReporterInput = {
    create?: XOR<ReportCreateWithoutReporterInput, ReportUncheckedCreateWithoutReporterInput> | ReportCreateWithoutReporterInput[] | ReportUncheckedCreateWithoutReporterInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutReporterInput | ReportCreateOrConnectWithoutReporterInput[]
    createMany?: ReportCreateManyReporterInputEnvelope
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
  }

  export type ReportUncheckedCreateNestedManyWithoutAssignedToInput = {
    create?: XOR<ReportCreateWithoutAssignedToInput, ReportUncheckedCreateWithoutAssignedToInput> | ReportCreateWithoutAssignedToInput[] | ReportUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutAssignedToInput | ReportCreateOrConnectWithoutAssignedToInput[]
    createMany?: ReportCreateManyAssignedToInputEnvelope
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
  }

  export type ReportWorkerUncheckedCreateNestedManyWithoutWorkerInput = {
    create?: XOR<ReportWorkerCreateWithoutWorkerInput, ReportWorkerUncheckedCreateWithoutWorkerInput> | ReportWorkerCreateWithoutWorkerInput[] | ReportWorkerUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: ReportWorkerCreateOrConnectWithoutWorkerInput | ReportWorkerCreateOrConnectWithoutWorkerInput[]
    createMany?: ReportWorkerCreateManyWorkerInputEnvelope
    connect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
  }

  export type StatusHistoryUncheckedCreateNestedManyWithoutChangedByInput = {
    create?: XOR<StatusHistoryCreateWithoutChangedByInput, StatusHistoryUncheckedCreateWithoutChangedByInput> | StatusHistoryCreateWithoutChangedByInput[] | StatusHistoryUncheckedCreateWithoutChangedByInput[]
    connectOrCreate?: StatusHistoryCreateOrConnectWithoutChangedByInput | StatusHistoryCreateOrConnectWithoutChangedByInput[]
    createMany?: StatusHistoryCreateManyChangedByInputEnvelope
    connect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
  }

  export type NotificationUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type ReportingZoneUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<ReportingZoneCreateWithoutCreatedByInput, ReportingZoneUncheckedCreateWithoutCreatedByInput> | ReportingZoneCreateWithoutCreatedByInput[] | ReportingZoneUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ReportingZoneCreateOrConnectWithoutCreatedByInput | ReportingZoneCreateOrConnectWithoutCreatedByInput[]
    createMany?: ReportingZoneCreateManyCreatedByInputEnvelope
    connect?: ReportingZoneWhereUniqueInput | ReportingZoneWhereUniqueInput[]
  }

  export type CleanupScheduleUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<CleanupScheduleCreateWithoutCreatedByInput, CleanupScheduleUncheckedCreateWithoutCreatedByInput> | CleanupScheduleCreateWithoutCreatedByInput[] | CleanupScheduleUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutCreatedByInput | CleanupScheduleCreateOrConnectWithoutCreatedByInput[]
    createMany?: CleanupScheduleCreateManyCreatedByInputEnvelope
    connect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
  }

  export type CleanupScheduleUncheckedCreateNestedManyWithoutVerifiedByInput = {
    create?: XOR<CleanupScheduleCreateWithoutVerifiedByInput, CleanupScheduleUncheckedCreateWithoutVerifiedByInput> | CleanupScheduleCreateWithoutVerifiedByInput[] | CleanupScheduleUncheckedCreateWithoutVerifiedByInput[]
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutVerifiedByInput | CleanupScheduleCreateOrConnectWithoutVerifiedByInput[]
    createMany?: CleanupScheduleCreateManyVerifiedByInputEnvelope
    connect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
  }

  export type CleanupScheduleWorkerUncheckedCreateNestedManyWithoutWorkerInput = {
    create?: XOR<CleanupScheduleWorkerCreateWithoutWorkerInput, CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput> | CleanupScheduleWorkerCreateWithoutWorkerInput[] | CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: CleanupScheduleWorkerCreateOrConnectWithoutWorkerInput | CleanupScheduleWorkerCreateOrConnectWithoutWorkerInput[]
    createMany?: CleanupScheduleWorkerCreateManyWorkerInputEnvelope
    connect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ReportUpdateManyWithoutReporterNestedInput = {
    create?: XOR<ReportCreateWithoutReporterInput, ReportUncheckedCreateWithoutReporterInput> | ReportCreateWithoutReporterInput[] | ReportUncheckedCreateWithoutReporterInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutReporterInput | ReportCreateOrConnectWithoutReporterInput[]
    upsert?: ReportUpsertWithWhereUniqueWithoutReporterInput | ReportUpsertWithWhereUniqueWithoutReporterInput[]
    createMany?: ReportCreateManyReporterInputEnvelope
    set?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    disconnect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    delete?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    update?: ReportUpdateWithWhereUniqueWithoutReporterInput | ReportUpdateWithWhereUniqueWithoutReporterInput[]
    updateMany?: ReportUpdateManyWithWhereWithoutReporterInput | ReportUpdateManyWithWhereWithoutReporterInput[]
    deleteMany?: ReportScalarWhereInput | ReportScalarWhereInput[]
  }

  export type ReportUpdateManyWithoutAssignedToNestedInput = {
    create?: XOR<ReportCreateWithoutAssignedToInput, ReportUncheckedCreateWithoutAssignedToInput> | ReportCreateWithoutAssignedToInput[] | ReportUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutAssignedToInput | ReportCreateOrConnectWithoutAssignedToInput[]
    upsert?: ReportUpsertWithWhereUniqueWithoutAssignedToInput | ReportUpsertWithWhereUniqueWithoutAssignedToInput[]
    createMany?: ReportCreateManyAssignedToInputEnvelope
    set?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    disconnect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    delete?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    update?: ReportUpdateWithWhereUniqueWithoutAssignedToInput | ReportUpdateWithWhereUniqueWithoutAssignedToInput[]
    updateMany?: ReportUpdateManyWithWhereWithoutAssignedToInput | ReportUpdateManyWithWhereWithoutAssignedToInput[]
    deleteMany?: ReportScalarWhereInput | ReportScalarWhereInput[]
  }

  export type ReportWorkerUpdateManyWithoutWorkerNestedInput = {
    create?: XOR<ReportWorkerCreateWithoutWorkerInput, ReportWorkerUncheckedCreateWithoutWorkerInput> | ReportWorkerCreateWithoutWorkerInput[] | ReportWorkerUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: ReportWorkerCreateOrConnectWithoutWorkerInput | ReportWorkerCreateOrConnectWithoutWorkerInput[]
    upsert?: ReportWorkerUpsertWithWhereUniqueWithoutWorkerInput | ReportWorkerUpsertWithWhereUniqueWithoutWorkerInput[]
    createMany?: ReportWorkerCreateManyWorkerInputEnvelope
    set?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    disconnect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    delete?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    connect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    update?: ReportWorkerUpdateWithWhereUniqueWithoutWorkerInput | ReportWorkerUpdateWithWhereUniqueWithoutWorkerInput[]
    updateMany?: ReportWorkerUpdateManyWithWhereWithoutWorkerInput | ReportWorkerUpdateManyWithWhereWithoutWorkerInput[]
    deleteMany?: ReportWorkerScalarWhereInput | ReportWorkerScalarWhereInput[]
  }

  export type StatusHistoryUpdateManyWithoutChangedByNestedInput = {
    create?: XOR<StatusHistoryCreateWithoutChangedByInput, StatusHistoryUncheckedCreateWithoutChangedByInput> | StatusHistoryCreateWithoutChangedByInput[] | StatusHistoryUncheckedCreateWithoutChangedByInput[]
    connectOrCreate?: StatusHistoryCreateOrConnectWithoutChangedByInput | StatusHistoryCreateOrConnectWithoutChangedByInput[]
    upsert?: StatusHistoryUpsertWithWhereUniqueWithoutChangedByInput | StatusHistoryUpsertWithWhereUniqueWithoutChangedByInput[]
    createMany?: StatusHistoryCreateManyChangedByInputEnvelope
    set?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    disconnect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    delete?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    connect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    update?: StatusHistoryUpdateWithWhereUniqueWithoutChangedByInput | StatusHistoryUpdateWithWhereUniqueWithoutChangedByInput[]
    updateMany?: StatusHistoryUpdateManyWithWhereWithoutChangedByInput | StatusHistoryUpdateManyWithWhereWithoutChangedByInput[]
    deleteMany?: StatusHistoryScalarWhereInput | StatusHistoryScalarWhereInput[]
  }

  export type NotificationUpdateManyWithoutUserNestedInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutUserInput | NotificationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutUserInput | NotificationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutUserInput | NotificationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type ReportingZoneUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<ReportingZoneCreateWithoutCreatedByInput, ReportingZoneUncheckedCreateWithoutCreatedByInput> | ReportingZoneCreateWithoutCreatedByInput[] | ReportingZoneUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ReportingZoneCreateOrConnectWithoutCreatedByInput | ReportingZoneCreateOrConnectWithoutCreatedByInput[]
    upsert?: ReportingZoneUpsertWithWhereUniqueWithoutCreatedByInput | ReportingZoneUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: ReportingZoneCreateManyCreatedByInputEnvelope
    set?: ReportingZoneWhereUniqueInput | ReportingZoneWhereUniqueInput[]
    disconnect?: ReportingZoneWhereUniqueInput | ReportingZoneWhereUniqueInput[]
    delete?: ReportingZoneWhereUniqueInput | ReportingZoneWhereUniqueInput[]
    connect?: ReportingZoneWhereUniqueInput | ReportingZoneWhereUniqueInput[]
    update?: ReportingZoneUpdateWithWhereUniqueWithoutCreatedByInput | ReportingZoneUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: ReportingZoneUpdateManyWithWhereWithoutCreatedByInput | ReportingZoneUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: ReportingZoneScalarWhereInput | ReportingZoneScalarWhereInput[]
  }

  export type CleanupScheduleUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<CleanupScheduleCreateWithoutCreatedByInput, CleanupScheduleUncheckedCreateWithoutCreatedByInput> | CleanupScheduleCreateWithoutCreatedByInput[] | CleanupScheduleUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutCreatedByInput | CleanupScheduleCreateOrConnectWithoutCreatedByInput[]
    upsert?: CleanupScheduleUpsertWithWhereUniqueWithoutCreatedByInput | CleanupScheduleUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: CleanupScheduleCreateManyCreatedByInputEnvelope
    set?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    disconnect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    delete?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    connect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    update?: CleanupScheduleUpdateWithWhereUniqueWithoutCreatedByInput | CleanupScheduleUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: CleanupScheduleUpdateManyWithWhereWithoutCreatedByInput | CleanupScheduleUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: CleanupScheduleScalarWhereInput | CleanupScheduleScalarWhereInput[]
  }

  export type CleanupScheduleUpdateManyWithoutVerifiedByNestedInput = {
    create?: XOR<CleanupScheduleCreateWithoutVerifiedByInput, CleanupScheduleUncheckedCreateWithoutVerifiedByInput> | CleanupScheduleCreateWithoutVerifiedByInput[] | CleanupScheduleUncheckedCreateWithoutVerifiedByInput[]
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutVerifiedByInput | CleanupScheduleCreateOrConnectWithoutVerifiedByInput[]
    upsert?: CleanupScheduleUpsertWithWhereUniqueWithoutVerifiedByInput | CleanupScheduleUpsertWithWhereUniqueWithoutVerifiedByInput[]
    createMany?: CleanupScheduleCreateManyVerifiedByInputEnvelope
    set?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    disconnect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    delete?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    connect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    update?: CleanupScheduleUpdateWithWhereUniqueWithoutVerifiedByInput | CleanupScheduleUpdateWithWhereUniqueWithoutVerifiedByInput[]
    updateMany?: CleanupScheduleUpdateManyWithWhereWithoutVerifiedByInput | CleanupScheduleUpdateManyWithWhereWithoutVerifiedByInput[]
    deleteMany?: CleanupScheduleScalarWhereInput | CleanupScheduleScalarWhereInput[]
  }

  export type CleanupScheduleWorkerUpdateManyWithoutWorkerNestedInput = {
    create?: XOR<CleanupScheduleWorkerCreateWithoutWorkerInput, CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput> | CleanupScheduleWorkerCreateWithoutWorkerInput[] | CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: CleanupScheduleWorkerCreateOrConnectWithoutWorkerInput | CleanupScheduleWorkerCreateOrConnectWithoutWorkerInput[]
    upsert?: CleanupScheduleWorkerUpsertWithWhereUniqueWithoutWorkerInput | CleanupScheduleWorkerUpsertWithWhereUniqueWithoutWorkerInput[]
    createMany?: CleanupScheduleWorkerCreateManyWorkerInputEnvelope
    set?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    disconnect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    delete?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    connect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    update?: CleanupScheduleWorkerUpdateWithWhereUniqueWithoutWorkerInput | CleanupScheduleWorkerUpdateWithWhereUniqueWithoutWorkerInput[]
    updateMany?: CleanupScheduleWorkerUpdateManyWithWhereWithoutWorkerInput | CleanupScheduleWorkerUpdateManyWithWhereWithoutWorkerInput[]
    deleteMany?: CleanupScheduleWorkerScalarWhereInput | CleanupScheduleWorkerScalarWhereInput[]
  }

  export type ReportUncheckedUpdateManyWithoutReporterNestedInput = {
    create?: XOR<ReportCreateWithoutReporterInput, ReportUncheckedCreateWithoutReporterInput> | ReportCreateWithoutReporterInput[] | ReportUncheckedCreateWithoutReporterInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutReporterInput | ReportCreateOrConnectWithoutReporterInput[]
    upsert?: ReportUpsertWithWhereUniqueWithoutReporterInput | ReportUpsertWithWhereUniqueWithoutReporterInput[]
    createMany?: ReportCreateManyReporterInputEnvelope
    set?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    disconnect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    delete?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    update?: ReportUpdateWithWhereUniqueWithoutReporterInput | ReportUpdateWithWhereUniqueWithoutReporterInput[]
    updateMany?: ReportUpdateManyWithWhereWithoutReporterInput | ReportUpdateManyWithWhereWithoutReporterInput[]
    deleteMany?: ReportScalarWhereInput | ReportScalarWhereInput[]
  }

  export type ReportUncheckedUpdateManyWithoutAssignedToNestedInput = {
    create?: XOR<ReportCreateWithoutAssignedToInput, ReportUncheckedCreateWithoutAssignedToInput> | ReportCreateWithoutAssignedToInput[] | ReportUncheckedCreateWithoutAssignedToInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutAssignedToInput | ReportCreateOrConnectWithoutAssignedToInput[]
    upsert?: ReportUpsertWithWhereUniqueWithoutAssignedToInput | ReportUpsertWithWhereUniqueWithoutAssignedToInput[]
    createMany?: ReportCreateManyAssignedToInputEnvelope
    set?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    disconnect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    delete?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    update?: ReportUpdateWithWhereUniqueWithoutAssignedToInput | ReportUpdateWithWhereUniqueWithoutAssignedToInput[]
    updateMany?: ReportUpdateManyWithWhereWithoutAssignedToInput | ReportUpdateManyWithWhereWithoutAssignedToInput[]
    deleteMany?: ReportScalarWhereInput | ReportScalarWhereInput[]
  }

  export type ReportWorkerUncheckedUpdateManyWithoutWorkerNestedInput = {
    create?: XOR<ReportWorkerCreateWithoutWorkerInput, ReportWorkerUncheckedCreateWithoutWorkerInput> | ReportWorkerCreateWithoutWorkerInput[] | ReportWorkerUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: ReportWorkerCreateOrConnectWithoutWorkerInput | ReportWorkerCreateOrConnectWithoutWorkerInput[]
    upsert?: ReportWorkerUpsertWithWhereUniqueWithoutWorkerInput | ReportWorkerUpsertWithWhereUniqueWithoutWorkerInput[]
    createMany?: ReportWorkerCreateManyWorkerInputEnvelope
    set?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    disconnect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    delete?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    connect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    update?: ReportWorkerUpdateWithWhereUniqueWithoutWorkerInput | ReportWorkerUpdateWithWhereUniqueWithoutWorkerInput[]
    updateMany?: ReportWorkerUpdateManyWithWhereWithoutWorkerInput | ReportWorkerUpdateManyWithWhereWithoutWorkerInput[]
    deleteMany?: ReportWorkerScalarWhereInput | ReportWorkerScalarWhereInput[]
  }

  export type StatusHistoryUncheckedUpdateManyWithoutChangedByNestedInput = {
    create?: XOR<StatusHistoryCreateWithoutChangedByInput, StatusHistoryUncheckedCreateWithoutChangedByInput> | StatusHistoryCreateWithoutChangedByInput[] | StatusHistoryUncheckedCreateWithoutChangedByInput[]
    connectOrCreate?: StatusHistoryCreateOrConnectWithoutChangedByInput | StatusHistoryCreateOrConnectWithoutChangedByInput[]
    upsert?: StatusHistoryUpsertWithWhereUniqueWithoutChangedByInput | StatusHistoryUpsertWithWhereUniqueWithoutChangedByInput[]
    createMany?: StatusHistoryCreateManyChangedByInputEnvelope
    set?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    disconnect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    delete?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    connect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    update?: StatusHistoryUpdateWithWhereUniqueWithoutChangedByInput | StatusHistoryUpdateWithWhereUniqueWithoutChangedByInput[]
    updateMany?: StatusHistoryUpdateManyWithWhereWithoutChangedByInput | StatusHistoryUpdateManyWithWhereWithoutChangedByInput[]
    deleteMany?: StatusHistoryScalarWhereInput | StatusHistoryScalarWhereInput[]
  }

  export type NotificationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutUserInput | NotificationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutUserInput | NotificationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutUserInput | NotificationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type ReportingZoneUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<ReportingZoneCreateWithoutCreatedByInput, ReportingZoneUncheckedCreateWithoutCreatedByInput> | ReportingZoneCreateWithoutCreatedByInput[] | ReportingZoneUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ReportingZoneCreateOrConnectWithoutCreatedByInput | ReportingZoneCreateOrConnectWithoutCreatedByInput[]
    upsert?: ReportingZoneUpsertWithWhereUniqueWithoutCreatedByInput | ReportingZoneUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: ReportingZoneCreateManyCreatedByInputEnvelope
    set?: ReportingZoneWhereUniqueInput | ReportingZoneWhereUniqueInput[]
    disconnect?: ReportingZoneWhereUniqueInput | ReportingZoneWhereUniqueInput[]
    delete?: ReportingZoneWhereUniqueInput | ReportingZoneWhereUniqueInput[]
    connect?: ReportingZoneWhereUniqueInput | ReportingZoneWhereUniqueInput[]
    update?: ReportingZoneUpdateWithWhereUniqueWithoutCreatedByInput | ReportingZoneUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: ReportingZoneUpdateManyWithWhereWithoutCreatedByInput | ReportingZoneUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: ReportingZoneScalarWhereInput | ReportingZoneScalarWhereInput[]
  }

  export type CleanupScheduleUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<CleanupScheduleCreateWithoutCreatedByInput, CleanupScheduleUncheckedCreateWithoutCreatedByInput> | CleanupScheduleCreateWithoutCreatedByInput[] | CleanupScheduleUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutCreatedByInput | CleanupScheduleCreateOrConnectWithoutCreatedByInput[]
    upsert?: CleanupScheduleUpsertWithWhereUniqueWithoutCreatedByInput | CleanupScheduleUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: CleanupScheduleCreateManyCreatedByInputEnvelope
    set?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    disconnect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    delete?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    connect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    update?: CleanupScheduleUpdateWithWhereUniqueWithoutCreatedByInput | CleanupScheduleUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: CleanupScheduleUpdateManyWithWhereWithoutCreatedByInput | CleanupScheduleUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: CleanupScheduleScalarWhereInput | CleanupScheduleScalarWhereInput[]
  }

  export type CleanupScheduleUncheckedUpdateManyWithoutVerifiedByNestedInput = {
    create?: XOR<CleanupScheduleCreateWithoutVerifiedByInput, CleanupScheduleUncheckedCreateWithoutVerifiedByInput> | CleanupScheduleCreateWithoutVerifiedByInput[] | CleanupScheduleUncheckedCreateWithoutVerifiedByInput[]
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutVerifiedByInput | CleanupScheduleCreateOrConnectWithoutVerifiedByInput[]
    upsert?: CleanupScheduleUpsertWithWhereUniqueWithoutVerifiedByInput | CleanupScheduleUpsertWithWhereUniqueWithoutVerifiedByInput[]
    createMany?: CleanupScheduleCreateManyVerifiedByInputEnvelope
    set?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    disconnect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    delete?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    connect?: CleanupScheduleWhereUniqueInput | CleanupScheduleWhereUniqueInput[]
    update?: CleanupScheduleUpdateWithWhereUniqueWithoutVerifiedByInput | CleanupScheduleUpdateWithWhereUniqueWithoutVerifiedByInput[]
    updateMany?: CleanupScheduleUpdateManyWithWhereWithoutVerifiedByInput | CleanupScheduleUpdateManyWithWhereWithoutVerifiedByInput[]
    deleteMany?: CleanupScheduleScalarWhereInput | CleanupScheduleScalarWhereInput[]
  }

  export type CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerNestedInput = {
    create?: XOR<CleanupScheduleWorkerCreateWithoutWorkerInput, CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput> | CleanupScheduleWorkerCreateWithoutWorkerInput[] | CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput[]
    connectOrCreate?: CleanupScheduleWorkerCreateOrConnectWithoutWorkerInput | CleanupScheduleWorkerCreateOrConnectWithoutWorkerInput[]
    upsert?: CleanupScheduleWorkerUpsertWithWhereUniqueWithoutWorkerInput | CleanupScheduleWorkerUpsertWithWhereUniqueWithoutWorkerInput[]
    createMany?: CleanupScheduleWorkerCreateManyWorkerInputEnvelope
    set?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    disconnect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    delete?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    connect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    update?: CleanupScheduleWorkerUpdateWithWhereUniqueWithoutWorkerInput | CleanupScheduleWorkerUpdateWithWhereUniqueWithoutWorkerInput[]
    updateMany?: CleanupScheduleWorkerUpdateManyWithWhereWithoutWorkerInput | CleanupScheduleWorkerUpdateManyWithWhereWithoutWorkerInput[]
    deleteMany?: CleanupScheduleWorkerScalarWhereInput | CleanupScheduleWorkerScalarWhereInput[]
  }

  export type ReportCreateaiCategoriesInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutReportsInput = {
    create?: XOR<UserCreateWithoutReportsInput, UserUncheckedCreateWithoutReportsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReportsInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutAssignedReportsInput = {
    create?: XOR<UserCreateWithoutAssignedReportsInput, UserUncheckedCreateWithoutAssignedReportsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAssignedReportsInput
    connect?: UserWhereUniqueInput
  }

  export type ReportWorkerCreateNestedManyWithoutReportInput = {
    create?: XOR<ReportWorkerCreateWithoutReportInput, ReportWorkerUncheckedCreateWithoutReportInput> | ReportWorkerCreateWithoutReportInput[] | ReportWorkerUncheckedCreateWithoutReportInput[]
    connectOrCreate?: ReportWorkerCreateOrConnectWithoutReportInput | ReportWorkerCreateOrConnectWithoutReportInput[]
    createMany?: ReportWorkerCreateManyReportInputEnvelope
    connect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
  }

  export type CleanupScheduleCreateNestedOneWithoutReportsInput = {
    create?: XOR<CleanupScheduleCreateWithoutReportsInput, CleanupScheduleUncheckedCreateWithoutReportsInput>
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutReportsInput
    connect?: CleanupScheduleWhereUniqueInput
  }

  export type ReportImageCreateNestedManyWithoutReportInput = {
    create?: XOR<ReportImageCreateWithoutReportInput, ReportImageUncheckedCreateWithoutReportInput> | ReportImageCreateWithoutReportInput[] | ReportImageUncheckedCreateWithoutReportInput[]
    connectOrCreate?: ReportImageCreateOrConnectWithoutReportInput | ReportImageCreateOrConnectWithoutReportInput[]
    createMany?: ReportImageCreateManyReportInputEnvelope
    connect?: ReportImageWhereUniqueInput | ReportImageWhereUniqueInput[]
  }

  export type StatusHistoryCreateNestedManyWithoutReportInput = {
    create?: XOR<StatusHistoryCreateWithoutReportInput, StatusHistoryUncheckedCreateWithoutReportInput> | StatusHistoryCreateWithoutReportInput[] | StatusHistoryUncheckedCreateWithoutReportInput[]
    connectOrCreate?: StatusHistoryCreateOrConnectWithoutReportInput | StatusHistoryCreateOrConnectWithoutReportInput[]
    createMany?: StatusHistoryCreateManyReportInputEnvelope
    connect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
  }

  export type NotificationCreateNestedManyWithoutReportInput = {
    create?: XOR<NotificationCreateWithoutReportInput, NotificationUncheckedCreateWithoutReportInput> | NotificationCreateWithoutReportInput[] | NotificationUncheckedCreateWithoutReportInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutReportInput | NotificationCreateOrConnectWithoutReportInput[]
    createMany?: NotificationCreateManyReportInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type ReportWorkerUncheckedCreateNestedManyWithoutReportInput = {
    create?: XOR<ReportWorkerCreateWithoutReportInput, ReportWorkerUncheckedCreateWithoutReportInput> | ReportWorkerCreateWithoutReportInput[] | ReportWorkerUncheckedCreateWithoutReportInput[]
    connectOrCreate?: ReportWorkerCreateOrConnectWithoutReportInput | ReportWorkerCreateOrConnectWithoutReportInput[]
    createMany?: ReportWorkerCreateManyReportInputEnvelope
    connect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
  }

  export type ReportImageUncheckedCreateNestedManyWithoutReportInput = {
    create?: XOR<ReportImageCreateWithoutReportInput, ReportImageUncheckedCreateWithoutReportInput> | ReportImageCreateWithoutReportInput[] | ReportImageUncheckedCreateWithoutReportInput[]
    connectOrCreate?: ReportImageCreateOrConnectWithoutReportInput | ReportImageCreateOrConnectWithoutReportInput[]
    createMany?: ReportImageCreateManyReportInputEnvelope
    connect?: ReportImageWhereUniqueInput | ReportImageWhereUniqueInput[]
  }

  export type StatusHistoryUncheckedCreateNestedManyWithoutReportInput = {
    create?: XOR<StatusHistoryCreateWithoutReportInput, StatusHistoryUncheckedCreateWithoutReportInput> | StatusHistoryCreateWithoutReportInput[] | StatusHistoryUncheckedCreateWithoutReportInput[]
    connectOrCreate?: StatusHistoryCreateOrConnectWithoutReportInput | StatusHistoryCreateOrConnectWithoutReportInput[]
    createMany?: StatusHistoryCreateManyReportInputEnvelope
    connect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
  }

  export type NotificationUncheckedCreateNestedManyWithoutReportInput = {
    create?: XOR<NotificationCreateWithoutReportInput, NotificationUncheckedCreateWithoutReportInput> | NotificationCreateWithoutReportInput[] | NotificationUncheckedCreateWithoutReportInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutReportInput | NotificationCreateOrConnectWithoutReportInput[]
    createMany?: NotificationCreateManyReportInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type EnumWasteCategoryFieldUpdateOperationsInput = {
    set?: $Enums.WasteCategory
  }

  export type EnumReportStatusFieldUpdateOperationsInput = {
    set?: $Enums.ReportStatus
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableEnumAnalysisStatusFieldUpdateOperationsInput = {
    set?: $Enums.AnalysisStatus | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableEnumSeverityFieldUpdateOperationsInput = {
    set?: $Enums.Severity | null
  }

  export type ReportUpdateaiCategoriesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserUpdateOneWithoutReportsNestedInput = {
    create?: XOR<UserCreateWithoutReportsInput, UserUncheckedCreateWithoutReportsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReportsInput
    upsert?: UserUpsertWithoutReportsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReportsInput, UserUpdateWithoutReportsInput>, UserUncheckedUpdateWithoutReportsInput>
  }

  export type UserUpdateOneWithoutAssignedReportsNestedInput = {
    create?: XOR<UserCreateWithoutAssignedReportsInput, UserUncheckedCreateWithoutAssignedReportsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAssignedReportsInput
    upsert?: UserUpsertWithoutAssignedReportsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAssignedReportsInput, UserUpdateWithoutAssignedReportsInput>, UserUncheckedUpdateWithoutAssignedReportsInput>
  }

  export type ReportWorkerUpdateManyWithoutReportNestedInput = {
    create?: XOR<ReportWorkerCreateWithoutReportInput, ReportWorkerUncheckedCreateWithoutReportInput> | ReportWorkerCreateWithoutReportInput[] | ReportWorkerUncheckedCreateWithoutReportInput[]
    connectOrCreate?: ReportWorkerCreateOrConnectWithoutReportInput | ReportWorkerCreateOrConnectWithoutReportInput[]
    upsert?: ReportWorkerUpsertWithWhereUniqueWithoutReportInput | ReportWorkerUpsertWithWhereUniqueWithoutReportInput[]
    createMany?: ReportWorkerCreateManyReportInputEnvelope
    set?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    disconnect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    delete?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    connect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    update?: ReportWorkerUpdateWithWhereUniqueWithoutReportInput | ReportWorkerUpdateWithWhereUniqueWithoutReportInput[]
    updateMany?: ReportWorkerUpdateManyWithWhereWithoutReportInput | ReportWorkerUpdateManyWithWhereWithoutReportInput[]
    deleteMany?: ReportWorkerScalarWhereInput | ReportWorkerScalarWhereInput[]
  }

  export type CleanupScheduleUpdateOneWithoutReportsNestedInput = {
    create?: XOR<CleanupScheduleCreateWithoutReportsInput, CleanupScheduleUncheckedCreateWithoutReportsInput>
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutReportsInput
    upsert?: CleanupScheduleUpsertWithoutReportsInput
    disconnect?: CleanupScheduleWhereInput | boolean
    delete?: CleanupScheduleWhereInput | boolean
    connect?: CleanupScheduleWhereUniqueInput
    update?: XOR<XOR<CleanupScheduleUpdateToOneWithWhereWithoutReportsInput, CleanupScheduleUpdateWithoutReportsInput>, CleanupScheduleUncheckedUpdateWithoutReportsInput>
  }

  export type ReportImageUpdateManyWithoutReportNestedInput = {
    create?: XOR<ReportImageCreateWithoutReportInput, ReportImageUncheckedCreateWithoutReportInput> | ReportImageCreateWithoutReportInput[] | ReportImageUncheckedCreateWithoutReportInput[]
    connectOrCreate?: ReportImageCreateOrConnectWithoutReportInput | ReportImageCreateOrConnectWithoutReportInput[]
    upsert?: ReportImageUpsertWithWhereUniqueWithoutReportInput | ReportImageUpsertWithWhereUniqueWithoutReportInput[]
    createMany?: ReportImageCreateManyReportInputEnvelope
    set?: ReportImageWhereUniqueInput | ReportImageWhereUniqueInput[]
    disconnect?: ReportImageWhereUniqueInput | ReportImageWhereUniqueInput[]
    delete?: ReportImageWhereUniqueInput | ReportImageWhereUniqueInput[]
    connect?: ReportImageWhereUniqueInput | ReportImageWhereUniqueInput[]
    update?: ReportImageUpdateWithWhereUniqueWithoutReportInput | ReportImageUpdateWithWhereUniqueWithoutReportInput[]
    updateMany?: ReportImageUpdateManyWithWhereWithoutReportInput | ReportImageUpdateManyWithWhereWithoutReportInput[]
    deleteMany?: ReportImageScalarWhereInput | ReportImageScalarWhereInput[]
  }

  export type StatusHistoryUpdateManyWithoutReportNestedInput = {
    create?: XOR<StatusHistoryCreateWithoutReportInput, StatusHistoryUncheckedCreateWithoutReportInput> | StatusHistoryCreateWithoutReportInput[] | StatusHistoryUncheckedCreateWithoutReportInput[]
    connectOrCreate?: StatusHistoryCreateOrConnectWithoutReportInput | StatusHistoryCreateOrConnectWithoutReportInput[]
    upsert?: StatusHistoryUpsertWithWhereUniqueWithoutReportInput | StatusHistoryUpsertWithWhereUniqueWithoutReportInput[]
    createMany?: StatusHistoryCreateManyReportInputEnvelope
    set?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    disconnect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    delete?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    connect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    update?: StatusHistoryUpdateWithWhereUniqueWithoutReportInput | StatusHistoryUpdateWithWhereUniqueWithoutReportInput[]
    updateMany?: StatusHistoryUpdateManyWithWhereWithoutReportInput | StatusHistoryUpdateManyWithWhereWithoutReportInput[]
    deleteMany?: StatusHistoryScalarWhereInput | StatusHistoryScalarWhereInput[]
  }

  export type NotificationUpdateManyWithoutReportNestedInput = {
    create?: XOR<NotificationCreateWithoutReportInput, NotificationUncheckedCreateWithoutReportInput> | NotificationCreateWithoutReportInput[] | NotificationUncheckedCreateWithoutReportInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutReportInput | NotificationCreateOrConnectWithoutReportInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutReportInput | NotificationUpsertWithWhereUniqueWithoutReportInput[]
    createMany?: NotificationCreateManyReportInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutReportInput | NotificationUpdateWithWhereUniqueWithoutReportInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutReportInput | NotificationUpdateManyWithWhereWithoutReportInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type ReportWorkerUncheckedUpdateManyWithoutReportNestedInput = {
    create?: XOR<ReportWorkerCreateWithoutReportInput, ReportWorkerUncheckedCreateWithoutReportInput> | ReportWorkerCreateWithoutReportInput[] | ReportWorkerUncheckedCreateWithoutReportInput[]
    connectOrCreate?: ReportWorkerCreateOrConnectWithoutReportInput | ReportWorkerCreateOrConnectWithoutReportInput[]
    upsert?: ReportWorkerUpsertWithWhereUniqueWithoutReportInput | ReportWorkerUpsertWithWhereUniqueWithoutReportInput[]
    createMany?: ReportWorkerCreateManyReportInputEnvelope
    set?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    disconnect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    delete?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    connect?: ReportWorkerWhereUniqueInput | ReportWorkerWhereUniqueInput[]
    update?: ReportWorkerUpdateWithWhereUniqueWithoutReportInput | ReportWorkerUpdateWithWhereUniqueWithoutReportInput[]
    updateMany?: ReportWorkerUpdateManyWithWhereWithoutReportInput | ReportWorkerUpdateManyWithWhereWithoutReportInput[]
    deleteMany?: ReportWorkerScalarWhereInput | ReportWorkerScalarWhereInput[]
  }

  export type ReportImageUncheckedUpdateManyWithoutReportNestedInput = {
    create?: XOR<ReportImageCreateWithoutReportInput, ReportImageUncheckedCreateWithoutReportInput> | ReportImageCreateWithoutReportInput[] | ReportImageUncheckedCreateWithoutReportInput[]
    connectOrCreate?: ReportImageCreateOrConnectWithoutReportInput | ReportImageCreateOrConnectWithoutReportInput[]
    upsert?: ReportImageUpsertWithWhereUniqueWithoutReportInput | ReportImageUpsertWithWhereUniqueWithoutReportInput[]
    createMany?: ReportImageCreateManyReportInputEnvelope
    set?: ReportImageWhereUniqueInput | ReportImageWhereUniqueInput[]
    disconnect?: ReportImageWhereUniqueInput | ReportImageWhereUniqueInput[]
    delete?: ReportImageWhereUniqueInput | ReportImageWhereUniqueInput[]
    connect?: ReportImageWhereUniqueInput | ReportImageWhereUniqueInput[]
    update?: ReportImageUpdateWithWhereUniqueWithoutReportInput | ReportImageUpdateWithWhereUniqueWithoutReportInput[]
    updateMany?: ReportImageUpdateManyWithWhereWithoutReportInput | ReportImageUpdateManyWithWhereWithoutReportInput[]
    deleteMany?: ReportImageScalarWhereInput | ReportImageScalarWhereInput[]
  }

  export type StatusHistoryUncheckedUpdateManyWithoutReportNestedInput = {
    create?: XOR<StatusHistoryCreateWithoutReportInput, StatusHistoryUncheckedCreateWithoutReportInput> | StatusHistoryCreateWithoutReportInput[] | StatusHistoryUncheckedCreateWithoutReportInput[]
    connectOrCreate?: StatusHistoryCreateOrConnectWithoutReportInput | StatusHistoryCreateOrConnectWithoutReportInput[]
    upsert?: StatusHistoryUpsertWithWhereUniqueWithoutReportInput | StatusHistoryUpsertWithWhereUniqueWithoutReportInput[]
    createMany?: StatusHistoryCreateManyReportInputEnvelope
    set?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    disconnect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    delete?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    connect?: StatusHistoryWhereUniqueInput | StatusHistoryWhereUniqueInput[]
    update?: StatusHistoryUpdateWithWhereUniqueWithoutReportInput | StatusHistoryUpdateWithWhereUniqueWithoutReportInput[]
    updateMany?: StatusHistoryUpdateManyWithWhereWithoutReportInput | StatusHistoryUpdateManyWithWhereWithoutReportInput[]
    deleteMany?: StatusHistoryScalarWhereInput | StatusHistoryScalarWhereInput[]
  }

  export type NotificationUncheckedUpdateManyWithoutReportNestedInput = {
    create?: XOR<NotificationCreateWithoutReportInput, NotificationUncheckedCreateWithoutReportInput> | NotificationCreateWithoutReportInput[] | NotificationUncheckedCreateWithoutReportInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutReportInput | NotificationCreateOrConnectWithoutReportInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutReportInput | NotificationUpsertWithWhereUniqueWithoutReportInput[]
    createMany?: NotificationCreateManyReportInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutReportInput | NotificationUpdateWithWhereUniqueWithoutReportInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutReportInput | NotificationUpdateManyWithWhereWithoutReportInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type ReportCreateNestedOneWithoutImagesInput = {
    create?: XOR<ReportCreateWithoutImagesInput, ReportUncheckedCreateWithoutImagesInput>
    connectOrCreate?: ReportCreateOrConnectWithoutImagesInput
    connect?: ReportWhereUniqueInput
  }

  export type EnumImageTypeFieldUpdateOperationsInput = {
    set?: $Enums.ImageType
  }

  export type ReportUpdateOneRequiredWithoutImagesNestedInput = {
    create?: XOR<ReportCreateWithoutImagesInput, ReportUncheckedCreateWithoutImagesInput>
    connectOrCreate?: ReportCreateOrConnectWithoutImagesInput
    upsert?: ReportUpsertWithoutImagesInput
    connect?: ReportWhereUniqueInput
    update?: XOR<XOR<ReportUpdateToOneWithWhereWithoutImagesInput, ReportUpdateWithoutImagesInput>, ReportUncheckedUpdateWithoutImagesInput>
  }

  export type ReportCreateNestedOneWithoutStatusHistoryInput = {
    create?: XOR<ReportCreateWithoutStatusHistoryInput, ReportUncheckedCreateWithoutStatusHistoryInput>
    connectOrCreate?: ReportCreateOrConnectWithoutStatusHistoryInput
    connect?: ReportWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutStatusChangesInput = {
    create?: XOR<UserCreateWithoutStatusChangesInput, UserUncheckedCreateWithoutStatusChangesInput>
    connectOrCreate?: UserCreateOrConnectWithoutStatusChangesInput
    connect?: UserWhereUniqueInput
  }

  export type NullableEnumReportStatusFieldUpdateOperationsInput = {
    set?: $Enums.ReportStatus | null
  }

  export type ReportUpdateOneRequiredWithoutStatusHistoryNestedInput = {
    create?: XOR<ReportCreateWithoutStatusHistoryInput, ReportUncheckedCreateWithoutStatusHistoryInput>
    connectOrCreate?: ReportCreateOrConnectWithoutStatusHistoryInput
    upsert?: ReportUpsertWithoutStatusHistoryInput
    connect?: ReportWhereUniqueInput
    update?: XOR<XOR<ReportUpdateToOneWithWhereWithoutStatusHistoryInput, ReportUpdateWithoutStatusHistoryInput>, ReportUncheckedUpdateWithoutStatusHistoryInput>
  }

  export type UserUpdateOneRequiredWithoutStatusChangesNestedInput = {
    create?: XOR<UserCreateWithoutStatusChangesInput, UserUncheckedCreateWithoutStatusChangesInput>
    connectOrCreate?: UserCreateOrConnectWithoutStatusChangesInput
    upsert?: UserUpsertWithoutStatusChangesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutStatusChangesInput, UserUpdateWithoutStatusChangesInput>, UserUncheckedUpdateWithoutStatusChangesInput>
  }

  export type UserCreateNestedOneWithoutNotificationsInput = {
    create?: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutNotificationsInput
    connect?: UserWhereUniqueInput
  }

  export type ReportCreateNestedOneWithoutNotificationsInput = {
    create?: XOR<ReportCreateWithoutNotificationsInput, ReportUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: ReportCreateOrConnectWithoutNotificationsInput
    connect?: ReportWhereUniqueInput
  }

  export type EnumNotificationTypeFieldUpdateOperationsInput = {
    set?: $Enums.NotificationType
  }

  export type UserUpdateOneRequiredWithoutNotificationsNestedInput = {
    create?: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutNotificationsInput
    upsert?: UserUpsertWithoutNotificationsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutNotificationsInput, UserUpdateWithoutNotificationsInput>, UserUncheckedUpdateWithoutNotificationsInput>
  }

  export type ReportUpdateOneWithoutNotificationsNestedInput = {
    create?: XOR<ReportCreateWithoutNotificationsInput, ReportUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: ReportCreateOrConnectWithoutNotificationsInput
    upsert?: ReportUpsertWithoutNotificationsInput
    disconnect?: ReportWhereInput | boolean
    delete?: ReportWhereInput | boolean
    connect?: ReportWhereUniqueInput
    update?: XOR<XOR<ReportUpdateToOneWithWhereWithoutNotificationsInput, ReportUpdateWithoutNotificationsInput>, ReportUncheckedUpdateWithoutNotificationsInput>
  }

  export type UserCreateNestedOneWithoutReportingZonesInput = {
    create?: XOR<UserCreateWithoutReportingZonesInput, UserUncheckedCreateWithoutReportingZonesInput>
    connectOrCreate?: UserCreateOrConnectWithoutReportingZonesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutReportingZonesNestedInput = {
    create?: XOR<UserCreateWithoutReportingZonesInput, UserUncheckedCreateWithoutReportingZonesInput>
    connectOrCreate?: UserCreateOrConnectWithoutReportingZonesInput
    upsert?: UserUpsertWithoutReportingZonesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReportingZonesInput, UserUpdateWithoutReportingZonesInput>, UserUncheckedUpdateWithoutReportingZonesInput>
  }

  export type CleanupScheduleCreateequipmentInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutCreatedSchedulesInput = {
    create?: XOR<UserCreateWithoutCreatedSchedulesInput, UserUncheckedCreateWithoutCreatedSchedulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedSchedulesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutVerifiedSchedulesInput = {
    create?: XOR<UserCreateWithoutVerifiedSchedulesInput, UserUncheckedCreateWithoutVerifiedSchedulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutVerifiedSchedulesInput
    connect?: UserWhereUniqueInput
  }

  export type CleanupScheduleWorkerCreateNestedManyWithoutScheduleInput = {
    create?: XOR<CleanupScheduleWorkerCreateWithoutScheduleInput, CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput> | CleanupScheduleWorkerCreateWithoutScheduleInput[] | CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput[]
    connectOrCreate?: CleanupScheduleWorkerCreateOrConnectWithoutScheduleInput | CleanupScheduleWorkerCreateOrConnectWithoutScheduleInput[]
    createMany?: CleanupScheduleWorkerCreateManyScheduleInputEnvelope
    connect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
  }

  export type ReportCreateNestedManyWithoutCleanupScheduleInput = {
    create?: XOR<ReportCreateWithoutCleanupScheduleInput, ReportUncheckedCreateWithoutCleanupScheduleInput> | ReportCreateWithoutCleanupScheduleInput[] | ReportUncheckedCreateWithoutCleanupScheduleInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutCleanupScheduleInput | ReportCreateOrConnectWithoutCleanupScheduleInput[]
    createMany?: ReportCreateManyCleanupScheduleInputEnvelope
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
  }

  export type CleanupScheduleWorkerUncheckedCreateNestedManyWithoutScheduleInput = {
    create?: XOR<CleanupScheduleWorkerCreateWithoutScheduleInput, CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput> | CleanupScheduleWorkerCreateWithoutScheduleInput[] | CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput[]
    connectOrCreate?: CleanupScheduleWorkerCreateOrConnectWithoutScheduleInput | CleanupScheduleWorkerCreateOrConnectWithoutScheduleInput[]
    createMany?: CleanupScheduleWorkerCreateManyScheduleInputEnvelope
    connect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
  }

  export type ReportUncheckedCreateNestedManyWithoutCleanupScheduleInput = {
    create?: XOR<ReportCreateWithoutCleanupScheduleInput, ReportUncheckedCreateWithoutCleanupScheduleInput> | ReportCreateWithoutCleanupScheduleInput[] | ReportUncheckedCreateWithoutCleanupScheduleInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutCleanupScheduleInput | ReportCreateOrConnectWithoutCleanupScheduleInput[]
    createMany?: ReportCreateManyCleanupScheduleInputEnvelope
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
  }

  export type EnumCleanupScheduleStatusFieldUpdateOperationsInput = {
    set?: $Enums.CleanupScheduleStatus
  }

  export type CleanupScheduleUpdateequipmentInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserUpdateOneRequiredWithoutCreatedSchedulesNestedInput = {
    create?: XOR<UserCreateWithoutCreatedSchedulesInput, UserUncheckedCreateWithoutCreatedSchedulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedSchedulesInput
    upsert?: UserUpsertWithoutCreatedSchedulesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCreatedSchedulesInput, UserUpdateWithoutCreatedSchedulesInput>, UserUncheckedUpdateWithoutCreatedSchedulesInput>
  }

  export type UserUpdateOneWithoutVerifiedSchedulesNestedInput = {
    create?: XOR<UserCreateWithoutVerifiedSchedulesInput, UserUncheckedCreateWithoutVerifiedSchedulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutVerifiedSchedulesInput
    upsert?: UserUpsertWithoutVerifiedSchedulesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutVerifiedSchedulesInput, UserUpdateWithoutVerifiedSchedulesInput>, UserUncheckedUpdateWithoutVerifiedSchedulesInput>
  }

  export type CleanupScheduleWorkerUpdateManyWithoutScheduleNestedInput = {
    create?: XOR<CleanupScheduleWorkerCreateWithoutScheduleInput, CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput> | CleanupScheduleWorkerCreateWithoutScheduleInput[] | CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput[]
    connectOrCreate?: CleanupScheduleWorkerCreateOrConnectWithoutScheduleInput | CleanupScheduleWorkerCreateOrConnectWithoutScheduleInput[]
    upsert?: CleanupScheduleWorkerUpsertWithWhereUniqueWithoutScheduleInput | CleanupScheduleWorkerUpsertWithWhereUniqueWithoutScheduleInput[]
    createMany?: CleanupScheduleWorkerCreateManyScheduleInputEnvelope
    set?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    disconnect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    delete?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    connect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    update?: CleanupScheduleWorkerUpdateWithWhereUniqueWithoutScheduleInput | CleanupScheduleWorkerUpdateWithWhereUniqueWithoutScheduleInput[]
    updateMany?: CleanupScheduleWorkerUpdateManyWithWhereWithoutScheduleInput | CleanupScheduleWorkerUpdateManyWithWhereWithoutScheduleInput[]
    deleteMany?: CleanupScheduleWorkerScalarWhereInput | CleanupScheduleWorkerScalarWhereInput[]
  }

  export type ReportUpdateManyWithoutCleanupScheduleNestedInput = {
    create?: XOR<ReportCreateWithoutCleanupScheduleInput, ReportUncheckedCreateWithoutCleanupScheduleInput> | ReportCreateWithoutCleanupScheduleInput[] | ReportUncheckedCreateWithoutCleanupScheduleInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutCleanupScheduleInput | ReportCreateOrConnectWithoutCleanupScheduleInput[]
    upsert?: ReportUpsertWithWhereUniqueWithoutCleanupScheduleInput | ReportUpsertWithWhereUniqueWithoutCleanupScheduleInput[]
    createMany?: ReportCreateManyCleanupScheduleInputEnvelope
    set?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    disconnect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    delete?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    update?: ReportUpdateWithWhereUniqueWithoutCleanupScheduleInput | ReportUpdateWithWhereUniqueWithoutCleanupScheduleInput[]
    updateMany?: ReportUpdateManyWithWhereWithoutCleanupScheduleInput | ReportUpdateManyWithWhereWithoutCleanupScheduleInput[]
    deleteMany?: ReportScalarWhereInput | ReportScalarWhereInput[]
  }

  export type CleanupScheduleWorkerUncheckedUpdateManyWithoutScheduleNestedInput = {
    create?: XOR<CleanupScheduleWorkerCreateWithoutScheduleInput, CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput> | CleanupScheduleWorkerCreateWithoutScheduleInput[] | CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput[]
    connectOrCreate?: CleanupScheduleWorkerCreateOrConnectWithoutScheduleInput | CleanupScheduleWorkerCreateOrConnectWithoutScheduleInput[]
    upsert?: CleanupScheduleWorkerUpsertWithWhereUniqueWithoutScheduleInput | CleanupScheduleWorkerUpsertWithWhereUniqueWithoutScheduleInput[]
    createMany?: CleanupScheduleWorkerCreateManyScheduleInputEnvelope
    set?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    disconnect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    delete?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    connect?: CleanupScheduleWorkerWhereUniqueInput | CleanupScheduleWorkerWhereUniqueInput[]
    update?: CleanupScheduleWorkerUpdateWithWhereUniqueWithoutScheduleInput | CleanupScheduleWorkerUpdateWithWhereUniqueWithoutScheduleInput[]
    updateMany?: CleanupScheduleWorkerUpdateManyWithWhereWithoutScheduleInput | CleanupScheduleWorkerUpdateManyWithWhereWithoutScheduleInput[]
    deleteMany?: CleanupScheduleWorkerScalarWhereInput | CleanupScheduleWorkerScalarWhereInput[]
  }

  export type ReportUncheckedUpdateManyWithoutCleanupScheduleNestedInput = {
    create?: XOR<ReportCreateWithoutCleanupScheduleInput, ReportUncheckedCreateWithoutCleanupScheduleInput> | ReportCreateWithoutCleanupScheduleInput[] | ReportUncheckedCreateWithoutCleanupScheduleInput[]
    connectOrCreate?: ReportCreateOrConnectWithoutCleanupScheduleInput | ReportCreateOrConnectWithoutCleanupScheduleInput[]
    upsert?: ReportUpsertWithWhereUniqueWithoutCleanupScheduleInput | ReportUpsertWithWhereUniqueWithoutCleanupScheduleInput[]
    createMany?: ReportCreateManyCleanupScheduleInputEnvelope
    set?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    disconnect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    delete?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    connect?: ReportWhereUniqueInput | ReportWhereUniqueInput[]
    update?: ReportUpdateWithWhereUniqueWithoutCleanupScheduleInput | ReportUpdateWithWhereUniqueWithoutCleanupScheduleInput[]
    updateMany?: ReportUpdateManyWithWhereWithoutCleanupScheduleInput | ReportUpdateManyWithWhereWithoutCleanupScheduleInput[]
    deleteMany?: ReportScalarWhereInput | ReportScalarWhereInput[]
  }

  export type CleanupScheduleCreateNestedOneWithoutWorkersInput = {
    create?: XOR<CleanupScheduleCreateWithoutWorkersInput, CleanupScheduleUncheckedCreateWithoutWorkersInput>
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutWorkersInput
    connect?: CleanupScheduleWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutScheduleAssignmentsInput = {
    create?: XOR<UserCreateWithoutScheduleAssignmentsInput, UserUncheckedCreateWithoutScheduleAssignmentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutScheduleAssignmentsInput
    connect?: UserWhereUniqueInput
  }

  export type CleanupScheduleUpdateOneRequiredWithoutWorkersNestedInput = {
    create?: XOR<CleanupScheduleCreateWithoutWorkersInput, CleanupScheduleUncheckedCreateWithoutWorkersInput>
    connectOrCreate?: CleanupScheduleCreateOrConnectWithoutWorkersInput
    upsert?: CleanupScheduleUpsertWithoutWorkersInput
    connect?: CleanupScheduleWhereUniqueInput
    update?: XOR<XOR<CleanupScheduleUpdateToOneWithWhereWithoutWorkersInput, CleanupScheduleUpdateWithoutWorkersInput>, CleanupScheduleUncheckedUpdateWithoutWorkersInput>
  }

  export type UserUpdateOneRequiredWithoutScheduleAssignmentsNestedInput = {
    create?: XOR<UserCreateWithoutScheduleAssignmentsInput, UserUncheckedCreateWithoutScheduleAssignmentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutScheduleAssignmentsInput
    upsert?: UserUpsertWithoutScheduleAssignmentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutScheduleAssignmentsInput, UserUpdateWithoutScheduleAssignmentsInput>, UserUncheckedUpdateWithoutScheduleAssignmentsInput>
  }

  export type ReportCreateNestedOneWithoutAssignedWorkersInput = {
    create?: XOR<ReportCreateWithoutAssignedWorkersInput, ReportUncheckedCreateWithoutAssignedWorkersInput>
    connectOrCreate?: ReportCreateOrConnectWithoutAssignedWorkersInput
    connect?: ReportWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutAssignedReportWorkersInput = {
    create?: XOR<UserCreateWithoutAssignedReportWorkersInput, UserUncheckedCreateWithoutAssignedReportWorkersInput>
    connectOrCreate?: UserCreateOrConnectWithoutAssignedReportWorkersInput
    connect?: UserWhereUniqueInput
  }

  export type ReportUpdateOneRequiredWithoutAssignedWorkersNestedInput = {
    create?: XOR<ReportCreateWithoutAssignedWorkersInput, ReportUncheckedCreateWithoutAssignedWorkersInput>
    connectOrCreate?: ReportCreateOrConnectWithoutAssignedWorkersInput
    upsert?: ReportUpsertWithoutAssignedWorkersInput
    connect?: ReportWhereUniqueInput
    update?: XOR<XOR<ReportUpdateToOneWithWhereWithoutAssignedWorkersInput, ReportUpdateWithoutAssignedWorkersInput>, ReportUncheckedUpdateWithoutAssignedWorkersInput>
  }

  export type UserUpdateOneRequiredWithoutAssignedReportWorkersNestedInput = {
    create?: XOR<UserCreateWithoutAssignedReportWorkersInput, UserUncheckedCreateWithoutAssignedReportWorkersInput>
    connectOrCreate?: UserCreateOrConnectWithoutAssignedReportWorkersInput
    upsert?: UserUpsertWithoutAssignedReportWorkersInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAssignedReportWorkersInput, UserUpdateWithoutAssignedReportWorkersInput>, UserUncheckedUpdateWithoutAssignedReportWorkersInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumWasteCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.WasteCategory | EnumWasteCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.WasteCategory[] | ListEnumWasteCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.WasteCategory[] | ListEnumWasteCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumWasteCategoryFilter<$PrismaModel> | $Enums.WasteCategory
  }

  export type NestedEnumReportStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportStatus | EnumReportStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReportStatusFilter<$PrismaModel> | $Enums.ReportStatus
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumAnalysisStatusNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.AnalysisStatus | EnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.AnalysisStatus[] | ListEnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AnalysisStatus[] | ListEnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAnalysisStatusNullableFilter<$PrismaModel> | $Enums.AnalysisStatus | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumSeverityNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Severity | EnumSeverityFieldRefInput<$PrismaModel> | null
    in?: $Enums.Severity[] | ListEnumSeverityFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Severity[] | ListEnumSeverityFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSeverityNullableFilter<$PrismaModel> | $Enums.Severity | null
  }

  export type NestedEnumWasteCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.WasteCategory | EnumWasteCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.WasteCategory[] | ListEnumWasteCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.WasteCategory[] | ListEnumWasteCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumWasteCategoryWithAggregatesFilter<$PrismaModel> | $Enums.WasteCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWasteCategoryFilter<$PrismaModel>
    _max?: NestedEnumWasteCategoryFilter<$PrismaModel>
  }

  export type NestedEnumReportStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportStatus | EnumReportStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReportStatusWithAggregatesFilter<$PrismaModel> | $Enums.ReportStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumReportStatusFilter<$PrismaModel>
    _max?: NestedEnumReportStatusFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumAnalysisStatusNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AnalysisStatus | EnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.AnalysisStatus[] | ListEnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AnalysisStatus[] | ListEnumAnalysisStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAnalysisStatusNullableWithAggregatesFilter<$PrismaModel> | $Enums.AnalysisStatus | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumAnalysisStatusNullableFilter<$PrismaModel>
    _max?: NestedEnumAnalysisStatusNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumSeverityNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Severity | EnumSeverityFieldRefInput<$PrismaModel> | null
    in?: $Enums.Severity[] | ListEnumSeverityFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Severity[] | ListEnumSeverityFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSeverityNullableWithAggregatesFilter<$PrismaModel> | $Enums.Severity | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumSeverityNullableFilter<$PrismaModel>
    _max?: NestedEnumSeverityNullableFilter<$PrismaModel>
  }

  export type NestedEnumImageTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ImageType | EnumImageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumImageTypeFilter<$PrismaModel> | $Enums.ImageType
  }

  export type NestedEnumImageTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ImageType | EnumImageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumImageTypeWithAggregatesFilter<$PrismaModel> | $Enums.ImageType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumImageTypeFilter<$PrismaModel>
    _max?: NestedEnumImageTypeFilter<$PrismaModel>
  }

  export type NestedEnumReportStatusNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportStatus | EnumReportStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumReportStatusNullableFilter<$PrismaModel> | $Enums.ReportStatus | null
  }

  export type NestedEnumReportStatusNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportStatus | EnumReportStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ReportStatus[] | ListEnumReportStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumReportStatusNullableWithAggregatesFilter<$PrismaModel> | $Enums.ReportStatus | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumReportStatusNullableFilter<$PrismaModel>
    _max?: NestedEnumReportStatusNullableFilter<$PrismaModel>
  }

  export type NestedEnumNotificationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeFilter<$PrismaModel> | $Enums.NotificationType
  }

  export type NestedEnumNotificationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeWithAggregatesFilter<$PrismaModel> | $Enums.NotificationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNotificationTypeFilter<$PrismaModel>
    _max?: NestedEnumNotificationTypeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumCleanupScheduleStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CleanupScheduleStatus | EnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CleanupScheduleStatus[] | ListEnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CleanupScheduleStatus[] | ListEnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCleanupScheduleStatusFilter<$PrismaModel> | $Enums.CleanupScheduleStatus
  }

  export type NestedEnumCleanupScheduleStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CleanupScheduleStatus | EnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CleanupScheduleStatus[] | ListEnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CleanupScheduleStatus[] | ListEnumCleanupScheduleStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCleanupScheduleStatusWithAggregatesFilter<$PrismaModel> | $Enums.CleanupScheduleStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCleanupScheduleStatusFilter<$PrismaModel>
    _max?: NestedEnumCleanupScheduleStatusFilter<$PrismaModel>
  }

  export type ReportCreateWithoutReporterInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assignedTo?: UserCreateNestedOneWithoutAssignedReportsInput
    assignedWorkers?: ReportWorkerCreateNestedManyWithoutReportInput
    cleanupSchedule?: CleanupScheduleCreateNestedOneWithoutReportsInput
    images?: ReportImageCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryCreateNestedManyWithoutReportInput
    notifications?: NotificationCreateNestedManyWithoutReportInput
  }

  export type ReportUncheckedCreateWithoutReporterInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assignedToId?: string | null
    cleanupScheduleId?: string | null
    assignedWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutReportInput
    images?: ReportImageUncheckedCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryUncheckedCreateNestedManyWithoutReportInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutReportInput
  }

  export type ReportCreateOrConnectWithoutReporterInput = {
    where: ReportWhereUniqueInput
    create: XOR<ReportCreateWithoutReporterInput, ReportUncheckedCreateWithoutReporterInput>
  }

  export type ReportCreateManyReporterInputEnvelope = {
    data: ReportCreateManyReporterInput | ReportCreateManyReporterInput[]
    skipDuplicates?: boolean
  }

  export type ReportCreateWithoutAssignedToInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporter?: UserCreateNestedOneWithoutReportsInput
    assignedWorkers?: ReportWorkerCreateNestedManyWithoutReportInput
    cleanupSchedule?: CleanupScheduleCreateNestedOneWithoutReportsInput
    images?: ReportImageCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryCreateNestedManyWithoutReportInput
    notifications?: NotificationCreateNestedManyWithoutReportInput
  }

  export type ReportUncheckedCreateWithoutAssignedToInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporterId?: string | null
    cleanupScheduleId?: string | null
    assignedWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutReportInput
    images?: ReportImageUncheckedCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryUncheckedCreateNestedManyWithoutReportInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutReportInput
  }

  export type ReportCreateOrConnectWithoutAssignedToInput = {
    where: ReportWhereUniqueInput
    create: XOR<ReportCreateWithoutAssignedToInput, ReportUncheckedCreateWithoutAssignedToInput>
  }

  export type ReportCreateManyAssignedToInputEnvelope = {
    data: ReportCreateManyAssignedToInput | ReportCreateManyAssignedToInput[]
    skipDuplicates?: boolean
  }

  export type ReportWorkerCreateWithoutWorkerInput = {
    id?: string
    assignedAt?: Date | string
    report: ReportCreateNestedOneWithoutAssignedWorkersInput
  }

  export type ReportWorkerUncheckedCreateWithoutWorkerInput = {
    id?: string
    assignedAt?: Date | string
    reportId: string
  }

  export type ReportWorkerCreateOrConnectWithoutWorkerInput = {
    where: ReportWorkerWhereUniqueInput
    create: XOR<ReportWorkerCreateWithoutWorkerInput, ReportWorkerUncheckedCreateWithoutWorkerInput>
  }

  export type ReportWorkerCreateManyWorkerInputEnvelope = {
    data: ReportWorkerCreateManyWorkerInput | ReportWorkerCreateManyWorkerInput[]
    skipDuplicates?: boolean
  }

  export type StatusHistoryCreateWithoutChangedByInput = {
    id?: string
    previousStatus?: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus
    notes?: string | null
    createdAt?: Date | string
    report: ReportCreateNestedOneWithoutStatusHistoryInput
  }

  export type StatusHistoryUncheckedCreateWithoutChangedByInput = {
    id?: string
    previousStatus?: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus
    notes?: string | null
    createdAt?: Date | string
    reportId: string
  }

  export type StatusHistoryCreateOrConnectWithoutChangedByInput = {
    where: StatusHistoryWhereUniqueInput
    create: XOR<StatusHistoryCreateWithoutChangedByInput, StatusHistoryUncheckedCreateWithoutChangedByInput>
  }

  export type StatusHistoryCreateManyChangedByInputEnvelope = {
    data: StatusHistoryCreateManyChangedByInput | StatusHistoryCreateManyChangedByInput[]
    skipDuplicates?: boolean
  }

  export type NotificationCreateWithoutUserInput = {
    id?: string
    title: string
    message: string
    type: $Enums.NotificationType
    isRead?: boolean
    createdAt?: Date | string
    report?: ReportCreateNestedOneWithoutNotificationsInput
  }

  export type NotificationUncheckedCreateWithoutUserInput = {
    id?: string
    title: string
    message: string
    type: $Enums.NotificationType
    isRead?: boolean
    createdAt?: Date | string
    reportId?: string | null
  }

  export type NotificationCreateOrConnectWithoutUserInput = {
    where: NotificationWhereUniqueInput
    create: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput>
  }

  export type NotificationCreateManyUserInputEnvelope = {
    data: NotificationCreateManyUserInput | NotificationCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ReportingZoneCreateWithoutCreatedByInput = {
    id?: string
    name: string
    coordinates: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReportingZoneUncheckedCreateWithoutCreatedByInput = {
    id?: string
    name: string
    coordinates: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReportingZoneCreateOrConnectWithoutCreatedByInput = {
    where: ReportingZoneWhereUniqueInput
    create: XOR<ReportingZoneCreateWithoutCreatedByInput, ReportingZoneUncheckedCreateWithoutCreatedByInput>
  }

  export type ReportingZoneCreateManyCreatedByInputEnvelope = {
    data: ReportingZoneCreateManyCreatedByInput | ReportingZoneCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type CleanupScheduleCreateWithoutCreatedByInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
    verifiedBy?: UserCreateNestedOneWithoutVerifiedSchedulesInput
    workers?: CleanupScheduleWorkerCreateNestedManyWithoutScheduleInput
    reports?: ReportCreateNestedManyWithoutCleanupScheduleInput
  }

  export type CleanupScheduleUncheckedCreateWithoutCreatedByInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    verifiedById?: string | null
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
    workers?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutScheduleInput
    reports?: ReportUncheckedCreateNestedManyWithoutCleanupScheduleInput
  }

  export type CleanupScheduleCreateOrConnectWithoutCreatedByInput = {
    where: CleanupScheduleWhereUniqueInput
    create: XOR<CleanupScheduleCreateWithoutCreatedByInput, CleanupScheduleUncheckedCreateWithoutCreatedByInput>
  }

  export type CleanupScheduleCreateManyCreatedByInputEnvelope = {
    data: CleanupScheduleCreateManyCreatedByInput | CleanupScheduleCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type CleanupScheduleCreateWithoutVerifiedByInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
    createdBy: UserCreateNestedOneWithoutCreatedSchedulesInput
    workers?: CleanupScheduleWorkerCreateNestedManyWithoutScheduleInput
    reports?: ReportCreateNestedManyWithoutCleanupScheduleInput
  }

  export type CleanupScheduleUncheckedCreateWithoutVerifiedByInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
    workers?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutScheduleInput
    reports?: ReportUncheckedCreateNestedManyWithoutCleanupScheduleInput
  }

  export type CleanupScheduleCreateOrConnectWithoutVerifiedByInput = {
    where: CleanupScheduleWhereUniqueInput
    create: XOR<CleanupScheduleCreateWithoutVerifiedByInput, CleanupScheduleUncheckedCreateWithoutVerifiedByInput>
  }

  export type CleanupScheduleCreateManyVerifiedByInputEnvelope = {
    data: CleanupScheduleCreateManyVerifiedByInput | CleanupScheduleCreateManyVerifiedByInput[]
    skipDuplicates?: boolean
  }

  export type CleanupScheduleWorkerCreateWithoutWorkerInput = {
    id?: string
    assignedAt?: Date | string
    schedule: CleanupScheduleCreateNestedOneWithoutWorkersInput
  }

  export type CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput = {
    id?: string
    assignedAt?: Date | string
    scheduleId: string
  }

  export type CleanupScheduleWorkerCreateOrConnectWithoutWorkerInput = {
    where: CleanupScheduleWorkerWhereUniqueInput
    create: XOR<CleanupScheduleWorkerCreateWithoutWorkerInput, CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput>
  }

  export type CleanupScheduleWorkerCreateManyWorkerInputEnvelope = {
    data: CleanupScheduleWorkerCreateManyWorkerInput | CleanupScheduleWorkerCreateManyWorkerInput[]
    skipDuplicates?: boolean
  }

  export type ReportUpsertWithWhereUniqueWithoutReporterInput = {
    where: ReportWhereUniqueInput
    update: XOR<ReportUpdateWithoutReporterInput, ReportUncheckedUpdateWithoutReporterInput>
    create: XOR<ReportCreateWithoutReporterInput, ReportUncheckedCreateWithoutReporterInput>
  }

  export type ReportUpdateWithWhereUniqueWithoutReporterInput = {
    where: ReportWhereUniqueInput
    data: XOR<ReportUpdateWithoutReporterInput, ReportUncheckedUpdateWithoutReporterInput>
  }

  export type ReportUpdateManyWithWhereWithoutReporterInput = {
    where: ReportScalarWhereInput
    data: XOR<ReportUpdateManyMutationInput, ReportUncheckedUpdateManyWithoutReporterInput>
  }

  export type ReportScalarWhereInput = {
    AND?: ReportScalarWhereInput | ReportScalarWhereInput[]
    OR?: ReportScalarWhereInput[]
    NOT?: ReportScalarWhereInput | ReportScalarWhereInput[]
    id?: StringFilter<"Report"> | string
    title?: StringFilter<"Report"> | string
    description?: StringFilter<"Report"> | string
    category?: EnumWasteCategoryFilter<"Report"> | $Enums.WasteCategory
    status?: EnumReportStatusFilter<"Report"> | $Enums.ReportStatus
    latitude?: FloatFilter<"Report"> | number
    longitude?: FloatFilter<"Report"> | number
    address?: StringNullableFilter<"Report"> | string | null
    isAnonymous?: BoolFilter<"Report"> | boolean
    isDeleted?: BoolFilter<"Report"> | boolean
    isSpam?: BoolFilter<"Report"> | boolean
    spamMarkedAt?: DateTimeNullableFilter<"Report"> | Date | string | null
    spamReason?: StringNullableFilter<"Report"> | string | null
    analysisStatus?: EnumAnalysisStatusNullableFilter<"Report"> | $Enums.AnalysisStatus | null
    analysisWasteCount?: IntNullableFilter<"Report"> | number | null
    analysisConfidence?: FloatNullableFilter<"Report"> | number | null
    analyzedAt?: DateTimeNullableFilter<"Report"> | Date | string | null
    severity?: EnumSeverityNullableFilter<"Report"> | $Enums.Severity | null
    aiCategories?: StringNullableListFilter<"Report">
    aiReason?: StringNullableFilter<"Report"> | string | null
    aiModel?: StringNullableFilter<"Report"> | string | null
    aiImageHash?: StringNullableFilter<"Report"> | string | null
    aiProcessingMs?: IntNullableFilter<"Report"> | number | null
    aiGeminiMs?: IntNullableFilter<"Report"> | number | null
    createdAt?: DateTimeFilter<"Report"> | Date | string
    updatedAt?: DateTimeFilter<"Report"> | Date | string
    reporterId?: StringNullableFilter<"Report"> | string | null
    assignedToId?: StringNullableFilter<"Report"> | string | null
    cleanupScheduleId?: StringNullableFilter<"Report"> | string | null
  }

  export type ReportUpsertWithWhereUniqueWithoutAssignedToInput = {
    where: ReportWhereUniqueInput
    update: XOR<ReportUpdateWithoutAssignedToInput, ReportUncheckedUpdateWithoutAssignedToInput>
    create: XOR<ReportCreateWithoutAssignedToInput, ReportUncheckedCreateWithoutAssignedToInput>
  }

  export type ReportUpdateWithWhereUniqueWithoutAssignedToInput = {
    where: ReportWhereUniqueInput
    data: XOR<ReportUpdateWithoutAssignedToInput, ReportUncheckedUpdateWithoutAssignedToInput>
  }

  export type ReportUpdateManyWithWhereWithoutAssignedToInput = {
    where: ReportScalarWhereInput
    data: XOR<ReportUpdateManyMutationInput, ReportUncheckedUpdateManyWithoutAssignedToInput>
  }

  export type ReportWorkerUpsertWithWhereUniqueWithoutWorkerInput = {
    where: ReportWorkerWhereUniqueInput
    update: XOR<ReportWorkerUpdateWithoutWorkerInput, ReportWorkerUncheckedUpdateWithoutWorkerInput>
    create: XOR<ReportWorkerCreateWithoutWorkerInput, ReportWorkerUncheckedCreateWithoutWorkerInput>
  }

  export type ReportWorkerUpdateWithWhereUniqueWithoutWorkerInput = {
    where: ReportWorkerWhereUniqueInput
    data: XOR<ReportWorkerUpdateWithoutWorkerInput, ReportWorkerUncheckedUpdateWithoutWorkerInput>
  }

  export type ReportWorkerUpdateManyWithWhereWithoutWorkerInput = {
    where: ReportWorkerScalarWhereInput
    data: XOR<ReportWorkerUpdateManyMutationInput, ReportWorkerUncheckedUpdateManyWithoutWorkerInput>
  }

  export type ReportWorkerScalarWhereInput = {
    AND?: ReportWorkerScalarWhereInput | ReportWorkerScalarWhereInput[]
    OR?: ReportWorkerScalarWhereInput[]
    NOT?: ReportWorkerScalarWhereInput | ReportWorkerScalarWhereInput[]
    id?: StringFilter<"ReportWorker"> | string
    assignedAt?: DateTimeFilter<"ReportWorker"> | Date | string
    reportId?: StringFilter<"ReportWorker"> | string
    workerId?: StringFilter<"ReportWorker"> | string
  }

  export type StatusHistoryUpsertWithWhereUniqueWithoutChangedByInput = {
    where: StatusHistoryWhereUniqueInput
    update: XOR<StatusHistoryUpdateWithoutChangedByInput, StatusHistoryUncheckedUpdateWithoutChangedByInput>
    create: XOR<StatusHistoryCreateWithoutChangedByInput, StatusHistoryUncheckedCreateWithoutChangedByInput>
  }

  export type StatusHistoryUpdateWithWhereUniqueWithoutChangedByInput = {
    where: StatusHistoryWhereUniqueInput
    data: XOR<StatusHistoryUpdateWithoutChangedByInput, StatusHistoryUncheckedUpdateWithoutChangedByInput>
  }

  export type StatusHistoryUpdateManyWithWhereWithoutChangedByInput = {
    where: StatusHistoryScalarWhereInput
    data: XOR<StatusHistoryUpdateManyMutationInput, StatusHistoryUncheckedUpdateManyWithoutChangedByInput>
  }

  export type StatusHistoryScalarWhereInput = {
    AND?: StatusHistoryScalarWhereInput | StatusHistoryScalarWhereInput[]
    OR?: StatusHistoryScalarWhereInput[]
    NOT?: StatusHistoryScalarWhereInput | StatusHistoryScalarWhereInput[]
    id?: StringFilter<"StatusHistory"> | string
    previousStatus?: EnumReportStatusNullableFilter<"StatusHistory"> | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFilter<"StatusHistory"> | $Enums.ReportStatus
    notes?: StringNullableFilter<"StatusHistory"> | string | null
    createdAt?: DateTimeFilter<"StatusHistory"> | Date | string
    reportId?: StringFilter<"StatusHistory"> | string
    changedById?: StringFilter<"StatusHistory"> | string
  }

  export type NotificationUpsertWithWhereUniqueWithoutUserInput = {
    where: NotificationWhereUniqueInput
    update: XOR<NotificationUpdateWithoutUserInput, NotificationUncheckedUpdateWithoutUserInput>
    create: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput>
  }

  export type NotificationUpdateWithWhereUniqueWithoutUserInput = {
    where: NotificationWhereUniqueInput
    data: XOR<NotificationUpdateWithoutUserInput, NotificationUncheckedUpdateWithoutUserInput>
  }

  export type NotificationUpdateManyWithWhereWithoutUserInput = {
    where: NotificationScalarWhereInput
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyWithoutUserInput>
  }

  export type NotificationScalarWhereInput = {
    AND?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    OR?: NotificationScalarWhereInput[]
    NOT?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    id?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    type?: EnumNotificationTypeFilter<"Notification"> | $Enums.NotificationType
    isRead?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    userId?: StringFilter<"Notification"> | string
    reportId?: StringNullableFilter<"Notification"> | string | null
  }

  export type ReportingZoneUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: ReportingZoneWhereUniqueInput
    update: XOR<ReportingZoneUpdateWithoutCreatedByInput, ReportingZoneUncheckedUpdateWithoutCreatedByInput>
    create: XOR<ReportingZoneCreateWithoutCreatedByInput, ReportingZoneUncheckedCreateWithoutCreatedByInput>
  }

  export type ReportingZoneUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: ReportingZoneWhereUniqueInput
    data: XOR<ReportingZoneUpdateWithoutCreatedByInput, ReportingZoneUncheckedUpdateWithoutCreatedByInput>
  }

  export type ReportingZoneUpdateManyWithWhereWithoutCreatedByInput = {
    where: ReportingZoneScalarWhereInput
    data: XOR<ReportingZoneUpdateManyMutationInput, ReportingZoneUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type ReportingZoneScalarWhereInput = {
    AND?: ReportingZoneScalarWhereInput | ReportingZoneScalarWhereInput[]
    OR?: ReportingZoneScalarWhereInput[]
    NOT?: ReportingZoneScalarWhereInput | ReportingZoneScalarWhereInput[]
    id?: StringFilter<"ReportingZone"> | string
    name?: StringFilter<"ReportingZone"> | string
    coordinates?: JsonFilter<"ReportingZone">
    isActive?: BoolFilter<"ReportingZone"> | boolean
    createdAt?: DateTimeFilter<"ReportingZone"> | Date | string
    updatedAt?: DateTimeFilter<"ReportingZone"> | Date | string
    createdById?: StringFilter<"ReportingZone"> | string
  }

  export type CleanupScheduleUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: CleanupScheduleWhereUniqueInput
    update: XOR<CleanupScheduleUpdateWithoutCreatedByInput, CleanupScheduleUncheckedUpdateWithoutCreatedByInput>
    create: XOR<CleanupScheduleCreateWithoutCreatedByInput, CleanupScheduleUncheckedCreateWithoutCreatedByInput>
  }

  export type CleanupScheduleUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: CleanupScheduleWhereUniqueInput
    data: XOR<CleanupScheduleUpdateWithoutCreatedByInput, CleanupScheduleUncheckedUpdateWithoutCreatedByInput>
  }

  export type CleanupScheduleUpdateManyWithWhereWithoutCreatedByInput = {
    where: CleanupScheduleScalarWhereInput
    data: XOR<CleanupScheduleUpdateManyMutationInput, CleanupScheduleUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type CleanupScheduleScalarWhereInput = {
    AND?: CleanupScheduleScalarWhereInput | CleanupScheduleScalarWhereInput[]
    OR?: CleanupScheduleScalarWhereInput[]
    NOT?: CleanupScheduleScalarWhereInput | CleanupScheduleScalarWhereInput[]
    id?: StringFilter<"CleanupSchedule"> | string
    title?: StringFilter<"CleanupSchedule"> | string
    description?: StringFilter<"CleanupSchedule"> | string
    barangay?: StringFilter<"CleanupSchedule"> | string
    latitude?: FloatFilter<"CleanupSchedule"> | number
    longitude?: FloatFilter<"CleanupSchedule"> | number
    scheduledAt?: DateTimeFilter<"CleanupSchedule"> | Date | string
    status?: EnumCleanupScheduleStatusFilter<"CleanupSchedule"> | $Enums.CleanupScheduleStatus
    notes?: StringNullableFilter<"CleanupSchedule"> | string | null
    createdAt?: DateTimeFilter<"CleanupSchedule"> | Date | string
    updatedAt?: DateTimeFilter<"CleanupSchedule"> | Date | string
    createdById?: StringFilter<"CleanupSchedule"> | string
    verifiedById?: StringNullableFilter<"CleanupSchedule"> | string | null
    verifiedAt?: DateTimeNullableFilter<"CleanupSchedule"> | Date | string | null
    equipment?: StringNullableListFilter<"CleanupSchedule">
  }

  export type CleanupScheduleUpsertWithWhereUniqueWithoutVerifiedByInput = {
    where: CleanupScheduleWhereUniqueInput
    update: XOR<CleanupScheduleUpdateWithoutVerifiedByInput, CleanupScheduleUncheckedUpdateWithoutVerifiedByInput>
    create: XOR<CleanupScheduleCreateWithoutVerifiedByInput, CleanupScheduleUncheckedCreateWithoutVerifiedByInput>
  }

  export type CleanupScheduleUpdateWithWhereUniqueWithoutVerifiedByInput = {
    where: CleanupScheduleWhereUniqueInput
    data: XOR<CleanupScheduleUpdateWithoutVerifiedByInput, CleanupScheduleUncheckedUpdateWithoutVerifiedByInput>
  }

  export type CleanupScheduleUpdateManyWithWhereWithoutVerifiedByInput = {
    where: CleanupScheduleScalarWhereInput
    data: XOR<CleanupScheduleUpdateManyMutationInput, CleanupScheduleUncheckedUpdateManyWithoutVerifiedByInput>
  }

  export type CleanupScheduleWorkerUpsertWithWhereUniqueWithoutWorkerInput = {
    where: CleanupScheduleWorkerWhereUniqueInput
    update: XOR<CleanupScheduleWorkerUpdateWithoutWorkerInput, CleanupScheduleWorkerUncheckedUpdateWithoutWorkerInput>
    create: XOR<CleanupScheduleWorkerCreateWithoutWorkerInput, CleanupScheduleWorkerUncheckedCreateWithoutWorkerInput>
  }

  export type CleanupScheduleWorkerUpdateWithWhereUniqueWithoutWorkerInput = {
    where: CleanupScheduleWorkerWhereUniqueInput
    data: XOR<CleanupScheduleWorkerUpdateWithoutWorkerInput, CleanupScheduleWorkerUncheckedUpdateWithoutWorkerInput>
  }

  export type CleanupScheduleWorkerUpdateManyWithWhereWithoutWorkerInput = {
    where: CleanupScheduleWorkerScalarWhereInput
    data: XOR<CleanupScheduleWorkerUpdateManyMutationInput, CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerInput>
  }

  export type CleanupScheduleWorkerScalarWhereInput = {
    AND?: CleanupScheduleWorkerScalarWhereInput | CleanupScheduleWorkerScalarWhereInput[]
    OR?: CleanupScheduleWorkerScalarWhereInput[]
    NOT?: CleanupScheduleWorkerScalarWhereInput | CleanupScheduleWorkerScalarWhereInput[]
    id?: StringFilter<"CleanupScheduleWorker"> | string
    assignedAt?: DateTimeFilter<"CleanupScheduleWorker"> | Date | string
    scheduleId?: StringFilter<"CleanupScheduleWorker"> | string
    workerId?: StringFilter<"CleanupScheduleWorker"> | string
  }

  export type UserCreateWithoutReportsInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    assignedReports?: ReportCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryCreateNestedManyWithoutChangedByInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerCreateNestedManyWithoutWorkerInput
  }

  export type UserUncheckedCreateWithoutReportsInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    assignedReports?: ReportUncheckedCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryUncheckedCreateNestedManyWithoutChangedByInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneUncheckedCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutWorkerInput
  }

  export type UserCreateOrConnectWithoutReportsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReportsInput, UserUncheckedCreateWithoutReportsInput>
  }

  export type UserCreateWithoutAssignedReportsInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportCreateNestedManyWithoutReporterInput
    assignedReportWorkers?: ReportWorkerCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryCreateNestedManyWithoutChangedByInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerCreateNestedManyWithoutWorkerInput
  }

  export type UserUncheckedCreateWithoutAssignedReportsInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportUncheckedCreateNestedManyWithoutReporterInput
    assignedReportWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryUncheckedCreateNestedManyWithoutChangedByInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneUncheckedCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutWorkerInput
  }

  export type UserCreateOrConnectWithoutAssignedReportsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAssignedReportsInput, UserUncheckedCreateWithoutAssignedReportsInput>
  }

  export type ReportWorkerCreateWithoutReportInput = {
    id?: string
    assignedAt?: Date | string
    worker: UserCreateNestedOneWithoutAssignedReportWorkersInput
  }

  export type ReportWorkerUncheckedCreateWithoutReportInput = {
    id?: string
    assignedAt?: Date | string
    workerId: string
  }

  export type ReportWorkerCreateOrConnectWithoutReportInput = {
    where: ReportWorkerWhereUniqueInput
    create: XOR<ReportWorkerCreateWithoutReportInput, ReportWorkerUncheckedCreateWithoutReportInput>
  }

  export type ReportWorkerCreateManyReportInputEnvelope = {
    data: ReportWorkerCreateManyReportInput | ReportWorkerCreateManyReportInput[]
    skipDuplicates?: boolean
  }

  export type CleanupScheduleCreateWithoutReportsInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
    createdBy: UserCreateNestedOneWithoutCreatedSchedulesInput
    verifiedBy?: UserCreateNestedOneWithoutVerifiedSchedulesInput
    workers?: CleanupScheduleWorkerCreateNestedManyWithoutScheduleInput
  }

  export type CleanupScheduleUncheckedCreateWithoutReportsInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    verifiedById?: string | null
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
    workers?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutScheduleInput
  }

  export type CleanupScheduleCreateOrConnectWithoutReportsInput = {
    where: CleanupScheduleWhereUniqueInput
    create: XOR<CleanupScheduleCreateWithoutReportsInput, CleanupScheduleUncheckedCreateWithoutReportsInput>
  }

  export type ReportImageCreateWithoutReportInput = {
    id?: string
    imageUrl: string
    publicId: string
    type?: $Enums.ImageType
    createdAt?: Date | string
  }

  export type ReportImageUncheckedCreateWithoutReportInput = {
    id?: string
    imageUrl: string
    publicId: string
    type?: $Enums.ImageType
    createdAt?: Date | string
  }

  export type ReportImageCreateOrConnectWithoutReportInput = {
    where: ReportImageWhereUniqueInput
    create: XOR<ReportImageCreateWithoutReportInput, ReportImageUncheckedCreateWithoutReportInput>
  }

  export type ReportImageCreateManyReportInputEnvelope = {
    data: ReportImageCreateManyReportInput | ReportImageCreateManyReportInput[]
    skipDuplicates?: boolean
  }

  export type StatusHistoryCreateWithoutReportInput = {
    id?: string
    previousStatus?: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus
    notes?: string | null
    createdAt?: Date | string
    changedBy: UserCreateNestedOneWithoutStatusChangesInput
  }

  export type StatusHistoryUncheckedCreateWithoutReportInput = {
    id?: string
    previousStatus?: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus
    notes?: string | null
    createdAt?: Date | string
    changedById: string
  }

  export type StatusHistoryCreateOrConnectWithoutReportInput = {
    where: StatusHistoryWhereUniqueInput
    create: XOR<StatusHistoryCreateWithoutReportInput, StatusHistoryUncheckedCreateWithoutReportInput>
  }

  export type StatusHistoryCreateManyReportInputEnvelope = {
    data: StatusHistoryCreateManyReportInput | StatusHistoryCreateManyReportInput[]
    skipDuplicates?: boolean
  }

  export type NotificationCreateWithoutReportInput = {
    id?: string
    title: string
    message: string
    type: $Enums.NotificationType
    isRead?: boolean
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutNotificationsInput
  }

  export type NotificationUncheckedCreateWithoutReportInput = {
    id?: string
    title: string
    message: string
    type: $Enums.NotificationType
    isRead?: boolean
    createdAt?: Date | string
    userId: string
  }

  export type NotificationCreateOrConnectWithoutReportInput = {
    where: NotificationWhereUniqueInput
    create: XOR<NotificationCreateWithoutReportInput, NotificationUncheckedCreateWithoutReportInput>
  }

  export type NotificationCreateManyReportInputEnvelope = {
    data: NotificationCreateManyReportInput | NotificationCreateManyReportInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutReportsInput = {
    update: XOR<UserUpdateWithoutReportsInput, UserUncheckedUpdateWithoutReportsInput>
    create: XOR<UserCreateWithoutReportsInput, UserUncheckedCreateWithoutReportsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReportsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReportsInput, UserUncheckedUpdateWithoutReportsInput>
  }

  export type UserUpdateWithoutReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedReports?: ReportUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUpdateManyWithoutWorkerNestedInput
  }

  export type UserUncheckedUpdateWithoutReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedReports?: ReportUncheckedUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUncheckedUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUncheckedUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUncheckedUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUncheckedUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUncheckedUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerNestedInput
  }

  export type UserUpsertWithoutAssignedReportsInput = {
    update: XOR<UserUpdateWithoutAssignedReportsInput, UserUncheckedUpdateWithoutAssignedReportsInput>
    create: XOR<UserCreateWithoutAssignedReportsInput, UserUncheckedCreateWithoutAssignedReportsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAssignedReportsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAssignedReportsInput, UserUncheckedUpdateWithoutAssignedReportsInput>
  }

  export type UserUpdateWithoutAssignedReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUpdateManyWithoutReporterNestedInput
    assignedReportWorkers?: ReportWorkerUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUpdateManyWithoutWorkerNestedInput
  }

  export type UserUncheckedUpdateWithoutAssignedReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUncheckedUpdateManyWithoutReporterNestedInput
    assignedReportWorkers?: ReportWorkerUncheckedUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUncheckedUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUncheckedUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUncheckedUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUncheckedUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerNestedInput
  }

  export type ReportWorkerUpsertWithWhereUniqueWithoutReportInput = {
    where: ReportWorkerWhereUniqueInput
    update: XOR<ReportWorkerUpdateWithoutReportInput, ReportWorkerUncheckedUpdateWithoutReportInput>
    create: XOR<ReportWorkerCreateWithoutReportInput, ReportWorkerUncheckedCreateWithoutReportInput>
  }

  export type ReportWorkerUpdateWithWhereUniqueWithoutReportInput = {
    where: ReportWorkerWhereUniqueInput
    data: XOR<ReportWorkerUpdateWithoutReportInput, ReportWorkerUncheckedUpdateWithoutReportInput>
  }

  export type ReportWorkerUpdateManyWithWhereWithoutReportInput = {
    where: ReportWorkerScalarWhereInput
    data: XOR<ReportWorkerUpdateManyMutationInput, ReportWorkerUncheckedUpdateManyWithoutReportInput>
  }

  export type CleanupScheduleUpsertWithoutReportsInput = {
    update: XOR<CleanupScheduleUpdateWithoutReportsInput, CleanupScheduleUncheckedUpdateWithoutReportsInput>
    create: XOR<CleanupScheduleCreateWithoutReportsInput, CleanupScheduleUncheckedCreateWithoutReportsInput>
    where?: CleanupScheduleWhereInput
  }

  export type CleanupScheduleUpdateToOneWithWhereWithoutReportsInput = {
    where?: CleanupScheduleWhereInput
    data: XOR<CleanupScheduleUpdateWithoutReportsInput, CleanupScheduleUncheckedUpdateWithoutReportsInput>
  }

  export type CleanupScheduleUpdateWithoutReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
    createdBy?: UserUpdateOneRequiredWithoutCreatedSchedulesNestedInput
    verifiedBy?: UserUpdateOneWithoutVerifiedSchedulesNestedInput
    workers?: CleanupScheduleWorkerUpdateManyWithoutScheduleNestedInput
  }

  export type CleanupScheduleUncheckedUpdateWithoutReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    verifiedById?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
    workers?: CleanupScheduleWorkerUncheckedUpdateManyWithoutScheduleNestedInput
  }

  export type ReportImageUpsertWithWhereUniqueWithoutReportInput = {
    where: ReportImageWhereUniqueInput
    update: XOR<ReportImageUpdateWithoutReportInput, ReportImageUncheckedUpdateWithoutReportInput>
    create: XOR<ReportImageCreateWithoutReportInput, ReportImageUncheckedCreateWithoutReportInput>
  }

  export type ReportImageUpdateWithWhereUniqueWithoutReportInput = {
    where: ReportImageWhereUniqueInput
    data: XOR<ReportImageUpdateWithoutReportInput, ReportImageUncheckedUpdateWithoutReportInput>
  }

  export type ReportImageUpdateManyWithWhereWithoutReportInput = {
    where: ReportImageScalarWhereInput
    data: XOR<ReportImageUpdateManyMutationInput, ReportImageUncheckedUpdateManyWithoutReportInput>
  }

  export type ReportImageScalarWhereInput = {
    AND?: ReportImageScalarWhereInput | ReportImageScalarWhereInput[]
    OR?: ReportImageScalarWhereInput[]
    NOT?: ReportImageScalarWhereInput | ReportImageScalarWhereInput[]
    id?: StringFilter<"ReportImage"> | string
    imageUrl?: StringFilter<"ReportImage"> | string
    publicId?: StringFilter<"ReportImage"> | string
    type?: EnumImageTypeFilter<"ReportImage"> | $Enums.ImageType
    createdAt?: DateTimeFilter<"ReportImage"> | Date | string
    reportId?: StringFilter<"ReportImage"> | string
  }

  export type StatusHistoryUpsertWithWhereUniqueWithoutReportInput = {
    where: StatusHistoryWhereUniqueInput
    update: XOR<StatusHistoryUpdateWithoutReportInput, StatusHistoryUncheckedUpdateWithoutReportInput>
    create: XOR<StatusHistoryCreateWithoutReportInput, StatusHistoryUncheckedCreateWithoutReportInput>
  }

  export type StatusHistoryUpdateWithWhereUniqueWithoutReportInput = {
    where: StatusHistoryWhereUniqueInput
    data: XOR<StatusHistoryUpdateWithoutReportInput, StatusHistoryUncheckedUpdateWithoutReportInput>
  }

  export type StatusHistoryUpdateManyWithWhereWithoutReportInput = {
    where: StatusHistoryScalarWhereInput
    data: XOR<StatusHistoryUpdateManyMutationInput, StatusHistoryUncheckedUpdateManyWithoutReportInput>
  }

  export type NotificationUpsertWithWhereUniqueWithoutReportInput = {
    where: NotificationWhereUniqueInput
    update: XOR<NotificationUpdateWithoutReportInput, NotificationUncheckedUpdateWithoutReportInput>
    create: XOR<NotificationCreateWithoutReportInput, NotificationUncheckedCreateWithoutReportInput>
  }

  export type NotificationUpdateWithWhereUniqueWithoutReportInput = {
    where: NotificationWhereUniqueInput
    data: XOR<NotificationUpdateWithoutReportInput, NotificationUncheckedUpdateWithoutReportInput>
  }

  export type NotificationUpdateManyWithWhereWithoutReportInput = {
    where: NotificationScalarWhereInput
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyWithoutReportInput>
  }

  export type ReportCreateWithoutImagesInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporter?: UserCreateNestedOneWithoutReportsInput
    assignedTo?: UserCreateNestedOneWithoutAssignedReportsInput
    assignedWorkers?: ReportWorkerCreateNestedManyWithoutReportInput
    cleanupSchedule?: CleanupScheduleCreateNestedOneWithoutReportsInput
    statusHistory?: StatusHistoryCreateNestedManyWithoutReportInput
    notifications?: NotificationCreateNestedManyWithoutReportInput
  }

  export type ReportUncheckedCreateWithoutImagesInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporterId?: string | null
    assignedToId?: string | null
    cleanupScheduleId?: string | null
    assignedWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryUncheckedCreateNestedManyWithoutReportInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutReportInput
  }

  export type ReportCreateOrConnectWithoutImagesInput = {
    where: ReportWhereUniqueInput
    create: XOR<ReportCreateWithoutImagesInput, ReportUncheckedCreateWithoutImagesInput>
  }

  export type ReportUpsertWithoutImagesInput = {
    update: XOR<ReportUpdateWithoutImagesInput, ReportUncheckedUpdateWithoutImagesInput>
    create: XOR<ReportCreateWithoutImagesInput, ReportUncheckedCreateWithoutImagesInput>
    where?: ReportWhereInput
  }

  export type ReportUpdateToOneWithWhereWithoutImagesInput = {
    where?: ReportWhereInput
    data: XOR<ReportUpdateWithoutImagesInput, ReportUncheckedUpdateWithoutImagesInput>
  }

  export type ReportUpdateWithoutImagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporter?: UserUpdateOneWithoutReportsNestedInput
    assignedTo?: UserUpdateOneWithoutAssignedReportsNestedInput
    assignedWorkers?: ReportWorkerUpdateManyWithoutReportNestedInput
    cleanupSchedule?: CleanupScheduleUpdateOneWithoutReportsNestedInput
    statusHistory?: StatusHistoryUpdateManyWithoutReportNestedInput
    notifications?: NotificationUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateWithoutImagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporterId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    cleanupScheduleId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedWorkers?: ReportWorkerUncheckedUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUncheckedUpdateManyWithoutReportNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutReportNestedInput
  }

  export type ReportCreateWithoutStatusHistoryInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporter?: UserCreateNestedOneWithoutReportsInput
    assignedTo?: UserCreateNestedOneWithoutAssignedReportsInput
    assignedWorkers?: ReportWorkerCreateNestedManyWithoutReportInput
    cleanupSchedule?: CleanupScheduleCreateNestedOneWithoutReportsInput
    images?: ReportImageCreateNestedManyWithoutReportInput
    notifications?: NotificationCreateNestedManyWithoutReportInput
  }

  export type ReportUncheckedCreateWithoutStatusHistoryInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporterId?: string | null
    assignedToId?: string | null
    cleanupScheduleId?: string | null
    assignedWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutReportInput
    images?: ReportImageUncheckedCreateNestedManyWithoutReportInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutReportInput
  }

  export type ReportCreateOrConnectWithoutStatusHistoryInput = {
    where: ReportWhereUniqueInput
    create: XOR<ReportCreateWithoutStatusHistoryInput, ReportUncheckedCreateWithoutStatusHistoryInput>
  }

  export type UserCreateWithoutStatusChangesInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportCreateNestedManyWithoutReporterInput
    assignedReports?: ReportCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerCreateNestedManyWithoutWorkerInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerCreateNestedManyWithoutWorkerInput
  }

  export type UserUncheckedCreateWithoutStatusChangesInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportUncheckedCreateNestedManyWithoutReporterInput
    assignedReports?: ReportUncheckedCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutWorkerInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneUncheckedCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutWorkerInput
  }

  export type UserCreateOrConnectWithoutStatusChangesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutStatusChangesInput, UserUncheckedCreateWithoutStatusChangesInput>
  }

  export type ReportUpsertWithoutStatusHistoryInput = {
    update: XOR<ReportUpdateWithoutStatusHistoryInput, ReportUncheckedUpdateWithoutStatusHistoryInput>
    create: XOR<ReportCreateWithoutStatusHistoryInput, ReportUncheckedCreateWithoutStatusHistoryInput>
    where?: ReportWhereInput
  }

  export type ReportUpdateToOneWithWhereWithoutStatusHistoryInput = {
    where?: ReportWhereInput
    data: XOR<ReportUpdateWithoutStatusHistoryInput, ReportUncheckedUpdateWithoutStatusHistoryInput>
  }

  export type ReportUpdateWithoutStatusHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporter?: UserUpdateOneWithoutReportsNestedInput
    assignedTo?: UserUpdateOneWithoutAssignedReportsNestedInput
    assignedWorkers?: ReportWorkerUpdateManyWithoutReportNestedInput
    cleanupSchedule?: CleanupScheduleUpdateOneWithoutReportsNestedInput
    images?: ReportImageUpdateManyWithoutReportNestedInput
    notifications?: NotificationUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateWithoutStatusHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporterId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    cleanupScheduleId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedWorkers?: ReportWorkerUncheckedUpdateManyWithoutReportNestedInput
    images?: ReportImageUncheckedUpdateManyWithoutReportNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutReportNestedInput
  }

  export type UserUpsertWithoutStatusChangesInput = {
    update: XOR<UserUpdateWithoutStatusChangesInput, UserUncheckedUpdateWithoutStatusChangesInput>
    create: XOR<UserCreateWithoutStatusChangesInput, UserUncheckedCreateWithoutStatusChangesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutStatusChangesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutStatusChangesInput, UserUncheckedUpdateWithoutStatusChangesInput>
  }

  export type UserUpdateWithoutStatusChangesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUpdateManyWithoutWorkerNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUpdateManyWithoutWorkerNestedInput
  }

  export type UserUncheckedUpdateWithoutStatusChangesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUncheckedUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUncheckedUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUncheckedUpdateManyWithoutWorkerNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUncheckedUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUncheckedUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUncheckedUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerNestedInput
  }

  export type UserCreateWithoutNotificationsInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportCreateNestedManyWithoutReporterInput
    assignedReports?: ReportCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryCreateNestedManyWithoutChangedByInput
    reportingZones?: ReportingZoneCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerCreateNestedManyWithoutWorkerInput
  }

  export type UserUncheckedCreateWithoutNotificationsInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportUncheckedCreateNestedManyWithoutReporterInput
    assignedReports?: ReportUncheckedCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryUncheckedCreateNestedManyWithoutChangedByInput
    reportingZones?: ReportingZoneUncheckedCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutWorkerInput
  }

  export type UserCreateOrConnectWithoutNotificationsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
  }

  export type ReportCreateWithoutNotificationsInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporter?: UserCreateNestedOneWithoutReportsInput
    assignedTo?: UserCreateNestedOneWithoutAssignedReportsInput
    assignedWorkers?: ReportWorkerCreateNestedManyWithoutReportInput
    cleanupSchedule?: CleanupScheduleCreateNestedOneWithoutReportsInput
    images?: ReportImageCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryCreateNestedManyWithoutReportInput
  }

  export type ReportUncheckedCreateWithoutNotificationsInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporterId?: string | null
    assignedToId?: string | null
    cleanupScheduleId?: string | null
    assignedWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutReportInput
    images?: ReportImageUncheckedCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryUncheckedCreateNestedManyWithoutReportInput
  }

  export type ReportCreateOrConnectWithoutNotificationsInput = {
    where: ReportWhereUniqueInput
    create: XOR<ReportCreateWithoutNotificationsInput, ReportUncheckedCreateWithoutNotificationsInput>
  }

  export type UserUpsertWithoutNotificationsInput = {
    update: XOR<UserUpdateWithoutNotificationsInput, UserUncheckedUpdateWithoutNotificationsInput>
    create: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutNotificationsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutNotificationsInput, UserUncheckedUpdateWithoutNotificationsInput>
  }

  export type UserUpdateWithoutNotificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUpdateManyWithoutChangedByNestedInput
    reportingZones?: ReportingZoneUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUpdateManyWithoutWorkerNestedInput
  }

  export type UserUncheckedUpdateWithoutNotificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUncheckedUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUncheckedUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUncheckedUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUncheckedUpdateManyWithoutChangedByNestedInput
    reportingZones?: ReportingZoneUncheckedUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUncheckedUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUncheckedUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerNestedInput
  }

  export type ReportUpsertWithoutNotificationsInput = {
    update: XOR<ReportUpdateWithoutNotificationsInput, ReportUncheckedUpdateWithoutNotificationsInput>
    create: XOR<ReportCreateWithoutNotificationsInput, ReportUncheckedCreateWithoutNotificationsInput>
    where?: ReportWhereInput
  }

  export type ReportUpdateToOneWithWhereWithoutNotificationsInput = {
    where?: ReportWhereInput
    data: XOR<ReportUpdateWithoutNotificationsInput, ReportUncheckedUpdateWithoutNotificationsInput>
  }

  export type ReportUpdateWithoutNotificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporter?: UserUpdateOneWithoutReportsNestedInput
    assignedTo?: UserUpdateOneWithoutAssignedReportsNestedInput
    assignedWorkers?: ReportWorkerUpdateManyWithoutReportNestedInput
    cleanupSchedule?: CleanupScheduleUpdateOneWithoutReportsNestedInput
    images?: ReportImageUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateWithoutNotificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporterId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    cleanupScheduleId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedWorkers?: ReportWorkerUncheckedUpdateManyWithoutReportNestedInput
    images?: ReportImageUncheckedUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUncheckedUpdateManyWithoutReportNestedInput
  }

  export type UserCreateWithoutReportingZonesInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportCreateNestedManyWithoutReporterInput
    assignedReports?: ReportCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryCreateNestedManyWithoutChangedByInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    createdSchedules?: CleanupScheduleCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerCreateNestedManyWithoutWorkerInput
  }

  export type UserUncheckedCreateWithoutReportingZonesInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportUncheckedCreateNestedManyWithoutReporterInput
    assignedReports?: ReportUncheckedCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryUncheckedCreateNestedManyWithoutChangedByInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    createdSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutWorkerInput
  }

  export type UserCreateOrConnectWithoutReportingZonesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReportingZonesInput, UserUncheckedCreateWithoutReportingZonesInput>
  }

  export type UserUpsertWithoutReportingZonesInput = {
    update: XOR<UserUpdateWithoutReportingZonesInput, UserUncheckedUpdateWithoutReportingZonesInput>
    create: XOR<UserCreateWithoutReportingZonesInput, UserUncheckedCreateWithoutReportingZonesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReportingZonesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReportingZonesInput, UserUncheckedUpdateWithoutReportingZonesInput>
  }

  export type UserUpdateWithoutReportingZonesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    createdSchedules?: CleanupScheduleUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUpdateManyWithoutWorkerNestedInput
  }

  export type UserUncheckedUpdateWithoutReportingZonesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUncheckedUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUncheckedUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUncheckedUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUncheckedUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    createdSchedules?: CleanupScheduleUncheckedUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUncheckedUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerNestedInput
  }

  export type UserCreateWithoutCreatedSchedulesInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportCreateNestedManyWithoutReporterInput
    assignedReports?: ReportCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryCreateNestedManyWithoutChangedByInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerCreateNestedManyWithoutWorkerInput
  }

  export type UserUncheckedCreateWithoutCreatedSchedulesInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportUncheckedCreateNestedManyWithoutReporterInput
    assignedReports?: ReportUncheckedCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryUncheckedCreateNestedManyWithoutChangedByInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneUncheckedCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutWorkerInput
  }

  export type UserCreateOrConnectWithoutCreatedSchedulesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedSchedulesInput, UserUncheckedCreateWithoutCreatedSchedulesInput>
  }

  export type UserCreateWithoutVerifiedSchedulesInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportCreateNestedManyWithoutReporterInput
    assignedReports?: ReportCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryCreateNestedManyWithoutChangedByInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleCreateNestedManyWithoutCreatedByInput
    scheduleAssignments?: CleanupScheduleWorkerCreateNestedManyWithoutWorkerInput
  }

  export type UserUncheckedCreateWithoutVerifiedSchedulesInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportUncheckedCreateNestedManyWithoutReporterInput
    assignedReports?: ReportUncheckedCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryUncheckedCreateNestedManyWithoutChangedByInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneUncheckedCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutCreatedByInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutWorkerInput
  }

  export type UserCreateOrConnectWithoutVerifiedSchedulesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutVerifiedSchedulesInput, UserUncheckedCreateWithoutVerifiedSchedulesInput>
  }

  export type CleanupScheduleWorkerCreateWithoutScheduleInput = {
    id?: string
    assignedAt?: Date | string
    worker: UserCreateNestedOneWithoutScheduleAssignmentsInput
  }

  export type CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput = {
    id?: string
    assignedAt?: Date | string
    workerId: string
  }

  export type CleanupScheduleWorkerCreateOrConnectWithoutScheduleInput = {
    where: CleanupScheduleWorkerWhereUniqueInput
    create: XOR<CleanupScheduleWorkerCreateWithoutScheduleInput, CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput>
  }

  export type CleanupScheduleWorkerCreateManyScheduleInputEnvelope = {
    data: CleanupScheduleWorkerCreateManyScheduleInput | CleanupScheduleWorkerCreateManyScheduleInput[]
    skipDuplicates?: boolean
  }

  export type ReportCreateWithoutCleanupScheduleInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporter?: UserCreateNestedOneWithoutReportsInput
    assignedTo?: UserCreateNestedOneWithoutAssignedReportsInput
    assignedWorkers?: ReportWorkerCreateNestedManyWithoutReportInput
    images?: ReportImageCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryCreateNestedManyWithoutReportInput
    notifications?: NotificationCreateNestedManyWithoutReportInput
  }

  export type ReportUncheckedCreateWithoutCleanupScheduleInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporterId?: string | null
    assignedToId?: string | null
    assignedWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutReportInput
    images?: ReportImageUncheckedCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryUncheckedCreateNestedManyWithoutReportInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutReportInput
  }

  export type ReportCreateOrConnectWithoutCleanupScheduleInput = {
    where: ReportWhereUniqueInput
    create: XOR<ReportCreateWithoutCleanupScheduleInput, ReportUncheckedCreateWithoutCleanupScheduleInput>
  }

  export type ReportCreateManyCleanupScheduleInputEnvelope = {
    data: ReportCreateManyCleanupScheduleInput | ReportCreateManyCleanupScheduleInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutCreatedSchedulesInput = {
    update: XOR<UserUpdateWithoutCreatedSchedulesInput, UserUncheckedUpdateWithoutCreatedSchedulesInput>
    create: XOR<UserCreateWithoutCreatedSchedulesInput, UserUncheckedCreateWithoutCreatedSchedulesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCreatedSchedulesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCreatedSchedulesInput, UserUncheckedUpdateWithoutCreatedSchedulesInput>
  }

  export type UserUpdateWithoutCreatedSchedulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUpdateManyWithoutWorkerNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatedSchedulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUncheckedUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUncheckedUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUncheckedUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUncheckedUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUncheckedUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUncheckedUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerNestedInput
  }

  export type UserUpsertWithoutVerifiedSchedulesInput = {
    update: XOR<UserUpdateWithoutVerifiedSchedulesInput, UserUncheckedUpdateWithoutVerifiedSchedulesInput>
    create: XOR<UserCreateWithoutVerifiedSchedulesInput, UserUncheckedCreateWithoutVerifiedSchedulesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutVerifiedSchedulesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutVerifiedSchedulesInput, UserUncheckedUpdateWithoutVerifiedSchedulesInput>
  }

  export type UserUpdateWithoutVerifiedSchedulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUpdateManyWithoutCreatedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUpdateManyWithoutWorkerNestedInput
  }

  export type UserUncheckedUpdateWithoutVerifiedSchedulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUncheckedUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUncheckedUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUncheckedUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUncheckedUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUncheckedUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUncheckedUpdateManyWithoutCreatedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerNestedInput
  }

  export type CleanupScheduleWorkerUpsertWithWhereUniqueWithoutScheduleInput = {
    where: CleanupScheduleWorkerWhereUniqueInput
    update: XOR<CleanupScheduleWorkerUpdateWithoutScheduleInput, CleanupScheduleWorkerUncheckedUpdateWithoutScheduleInput>
    create: XOR<CleanupScheduleWorkerCreateWithoutScheduleInput, CleanupScheduleWorkerUncheckedCreateWithoutScheduleInput>
  }

  export type CleanupScheduleWorkerUpdateWithWhereUniqueWithoutScheduleInput = {
    where: CleanupScheduleWorkerWhereUniqueInput
    data: XOR<CleanupScheduleWorkerUpdateWithoutScheduleInput, CleanupScheduleWorkerUncheckedUpdateWithoutScheduleInput>
  }

  export type CleanupScheduleWorkerUpdateManyWithWhereWithoutScheduleInput = {
    where: CleanupScheduleWorkerScalarWhereInput
    data: XOR<CleanupScheduleWorkerUpdateManyMutationInput, CleanupScheduleWorkerUncheckedUpdateManyWithoutScheduleInput>
  }

  export type ReportUpsertWithWhereUniqueWithoutCleanupScheduleInput = {
    where: ReportWhereUniqueInput
    update: XOR<ReportUpdateWithoutCleanupScheduleInput, ReportUncheckedUpdateWithoutCleanupScheduleInput>
    create: XOR<ReportCreateWithoutCleanupScheduleInput, ReportUncheckedCreateWithoutCleanupScheduleInput>
  }

  export type ReportUpdateWithWhereUniqueWithoutCleanupScheduleInput = {
    where: ReportWhereUniqueInput
    data: XOR<ReportUpdateWithoutCleanupScheduleInput, ReportUncheckedUpdateWithoutCleanupScheduleInput>
  }

  export type ReportUpdateManyWithWhereWithoutCleanupScheduleInput = {
    where: ReportScalarWhereInput
    data: XOR<ReportUpdateManyMutationInput, ReportUncheckedUpdateManyWithoutCleanupScheduleInput>
  }

  export type CleanupScheduleCreateWithoutWorkersInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
    createdBy: UserCreateNestedOneWithoutCreatedSchedulesInput
    verifiedBy?: UserCreateNestedOneWithoutVerifiedSchedulesInput
    reports?: ReportCreateNestedManyWithoutCleanupScheduleInput
  }

  export type CleanupScheduleUncheckedCreateWithoutWorkersInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    verifiedById?: string | null
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
    reports?: ReportUncheckedCreateNestedManyWithoutCleanupScheduleInput
  }

  export type CleanupScheduleCreateOrConnectWithoutWorkersInput = {
    where: CleanupScheduleWhereUniqueInput
    create: XOR<CleanupScheduleCreateWithoutWorkersInput, CleanupScheduleUncheckedCreateWithoutWorkersInput>
  }

  export type UserCreateWithoutScheduleAssignmentsInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportCreateNestedManyWithoutReporterInput
    assignedReports?: ReportCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryCreateNestedManyWithoutChangedByInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleCreateNestedManyWithoutVerifiedByInput
  }

  export type UserUncheckedCreateWithoutScheduleAssignmentsInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportUncheckedCreateNestedManyWithoutReporterInput
    assignedReports?: ReportUncheckedCreateNestedManyWithoutAssignedToInput
    assignedReportWorkers?: ReportWorkerUncheckedCreateNestedManyWithoutWorkerInput
    statusChanges?: StatusHistoryUncheckedCreateNestedManyWithoutChangedByInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneUncheckedCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutVerifiedByInput
  }

  export type UserCreateOrConnectWithoutScheduleAssignmentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutScheduleAssignmentsInput, UserUncheckedCreateWithoutScheduleAssignmentsInput>
  }

  export type CleanupScheduleUpsertWithoutWorkersInput = {
    update: XOR<CleanupScheduleUpdateWithoutWorkersInput, CleanupScheduleUncheckedUpdateWithoutWorkersInput>
    create: XOR<CleanupScheduleCreateWithoutWorkersInput, CleanupScheduleUncheckedCreateWithoutWorkersInput>
    where?: CleanupScheduleWhereInput
  }

  export type CleanupScheduleUpdateToOneWithWhereWithoutWorkersInput = {
    where?: CleanupScheduleWhereInput
    data: XOR<CleanupScheduleUpdateWithoutWorkersInput, CleanupScheduleUncheckedUpdateWithoutWorkersInput>
  }

  export type CleanupScheduleUpdateWithoutWorkersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
    createdBy?: UserUpdateOneRequiredWithoutCreatedSchedulesNestedInput
    verifiedBy?: UserUpdateOneWithoutVerifiedSchedulesNestedInput
    reports?: ReportUpdateManyWithoutCleanupScheduleNestedInput
  }

  export type CleanupScheduleUncheckedUpdateWithoutWorkersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    verifiedById?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
    reports?: ReportUncheckedUpdateManyWithoutCleanupScheduleNestedInput
  }

  export type UserUpsertWithoutScheduleAssignmentsInput = {
    update: XOR<UserUpdateWithoutScheduleAssignmentsInput, UserUncheckedUpdateWithoutScheduleAssignmentsInput>
    create: XOR<UserCreateWithoutScheduleAssignmentsInput, UserUncheckedCreateWithoutScheduleAssignmentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutScheduleAssignmentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutScheduleAssignmentsInput, UserUncheckedUpdateWithoutScheduleAssignmentsInput>
  }

  export type UserUpdateWithoutScheduleAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUpdateManyWithoutVerifiedByNestedInput
  }

  export type UserUncheckedUpdateWithoutScheduleAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUncheckedUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUncheckedUpdateManyWithoutAssignedToNestedInput
    assignedReportWorkers?: ReportWorkerUncheckedUpdateManyWithoutWorkerNestedInput
    statusChanges?: StatusHistoryUncheckedUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUncheckedUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUncheckedUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUncheckedUpdateManyWithoutVerifiedByNestedInput
  }

  export type ReportCreateWithoutAssignedWorkersInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporter?: UserCreateNestedOneWithoutReportsInput
    assignedTo?: UserCreateNestedOneWithoutAssignedReportsInput
    cleanupSchedule?: CleanupScheduleCreateNestedOneWithoutReportsInput
    images?: ReportImageCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryCreateNestedManyWithoutReportInput
    notifications?: NotificationCreateNestedManyWithoutReportInput
  }

  export type ReportUncheckedCreateWithoutAssignedWorkersInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporterId?: string | null
    assignedToId?: string | null
    cleanupScheduleId?: string | null
    images?: ReportImageUncheckedCreateNestedManyWithoutReportInput
    statusHistory?: StatusHistoryUncheckedCreateNestedManyWithoutReportInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutReportInput
  }

  export type ReportCreateOrConnectWithoutAssignedWorkersInput = {
    where: ReportWhereUniqueInput
    create: XOR<ReportCreateWithoutAssignedWorkersInput, ReportUncheckedCreateWithoutAssignedWorkersInput>
  }

  export type UserCreateWithoutAssignedReportWorkersInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportCreateNestedManyWithoutReporterInput
    assignedReports?: ReportCreateNestedManyWithoutAssignedToInput
    statusChanges?: StatusHistoryCreateNestedManyWithoutChangedByInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerCreateNestedManyWithoutWorkerInput
  }

  export type UserUncheckedCreateWithoutAssignedReportWorkersInput = {
    id?: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string | null
    address?: string
    role?: $Enums.Role
    avatarUrl?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReportUncheckedCreateNestedManyWithoutReporterInput
    assignedReports?: ReportUncheckedCreateNestedManyWithoutAssignedToInput
    statusChanges?: StatusHistoryUncheckedCreateNestedManyWithoutChangedByInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    reportingZones?: ReportingZoneUncheckedCreateNestedManyWithoutCreatedByInput
    createdSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutCreatedByInput
    verifiedSchedules?: CleanupScheduleUncheckedCreateNestedManyWithoutVerifiedByInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedCreateNestedManyWithoutWorkerInput
  }

  export type UserCreateOrConnectWithoutAssignedReportWorkersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAssignedReportWorkersInput, UserUncheckedCreateWithoutAssignedReportWorkersInput>
  }

  export type ReportUpsertWithoutAssignedWorkersInput = {
    update: XOR<ReportUpdateWithoutAssignedWorkersInput, ReportUncheckedUpdateWithoutAssignedWorkersInput>
    create: XOR<ReportCreateWithoutAssignedWorkersInput, ReportUncheckedCreateWithoutAssignedWorkersInput>
    where?: ReportWhereInput
  }

  export type ReportUpdateToOneWithWhereWithoutAssignedWorkersInput = {
    where?: ReportWhereInput
    data: XOR<ReportUpdateWithoutAssignedWorkersInput, ReportUncheckedUpdateWithoutAssignedWorkersInput>
  }

  export type ReportUpdateWithoutAssignedWorkersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporter?: UserUpdateOneWithoutReportsNestedInput
    assignedTo?: UserUpdateOneWithoutAssignedReportsNestedInput
    cleanupSchedule?: CleanupScheduleUpdateOneWithoutReportsNestedInput
    images?: ReportImageUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUpdateManyWithoutReportNestedInput
    notifications?: NotificationUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateWithoutAssignedWorkersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporterId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    cleanupScheduleId?: NullableStringFieldUpdateOperationsInput | string | null
    images?: ReportImageUncheckedUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUncheckedUpdateManyWithoutReportNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutReportNestedInput
  }

  export type UserUpsertWithoutAssignedReportWorkersInput = {
    update: XOR<UserUpdateWithoutAssignedReportWorkersInput, UserUncheckedUpdateWithoutAssignedReportWorkersInput>
    create: XOR<UserCreateWithoutAssignedReportWorkersInput, UserUncheckedCreateWithoutAssignedReportWorkersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAssignedReportWorkersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAssignedReportWorkersInput, UserUncheckedUpdateWithoutAssignedReportWorkersInput>
  }

  export type UserUpdateWithoutAssignedReportWorkersInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUpdateManyWithoutAssignedToNestedInput
    statusChanges?: StatusHistoryUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUpdateManyWithoutWorkerNestedInput
  }

  export type UserUncheckedUpdateWithoutAssignedReportWorkersInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReportUncheckedUpdateManyWithoutReporterNestedInput
    assignedReports?: ReportUncheckedUpdateManyWithoutAssignedToNestedInput
    statusChanges?: StatusHistoryUncheckedUpdateManyWithoutChangedByNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    reportingZones?: ReportingZoneUncheckedUpdateManyWithoutCreatedByNestedInput
    createdSchedules?: CleanupScheduleUncheckedUpdateManyWithoutCreatedByNestedInput
    verifiedSchedules?: CleanupScheduleUncheckedUpdateManyWithoutVerifiedByNestedInput
    scheduleAssignments?: CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerNestedInput
  }

  export type ReportCreateManyReporterInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assignedToId?: string | null
    cleanupScheduleId?: string | null
  }

  export type ReportCreateManyAssignedToInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporterId?: string | null
    cleanupScheduleId?: string | null
  }

  export type ReportWorkerCreateManyWorkerInput = {
    id?: string
    assignedAt?: Date | string
    reportId: string
  }

  export type StatusHistoryCreateManyChangedByInput = {
    id?: string
    previousStatus?: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus
    notes?: string | null
    createdAt?: Date | string
    reportId: string
  }

  export type NotificationCreateManyUserInput = {
    id?: string
    title: string
    message: string
    type: $Enums.NotificationType
    isRead?: boolean
    createdAt?: Date | string
    reportId?: string | null
  }

  export type ReportingZoneCreateManyCreatedByInput = {
    id?: string
    name: string
    coordinates: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CleanupScheduleCreateManyCreatedByInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    verifiedById?: string | null
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
  }

  export type CleanupScheduleCreateManyVerifiedByInput = {
    id?: string
    title: string
    description: string
    barangay: string
    latitude: number
    longitude: number
    scheduledAt: Date | string
    status?: $Enums.CleanupScheduleStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    verifiedAt?: Date | string | null
    equipment?: CleanupScheduleCreateequipmentInput | string[]
  }

  export type CleanupScheduleWorkerCreateManyWorkerInput = {
    id?: string
    assignedAt?: Date | string
    scheduleId: string
  }

  export type ReportUpdateWithoutReporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedTo?: UserUpdateOneWithoutAssignedReportsNestedInput
    assignedWorkers?: ReportWorkerUpdateManyWithoutReportNestedInput
    cleanupSchedule?: CleanupScheduleUpdateOneWithoutReportsNestedInput
    images?: ReportImageUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUpdateManyWithoutReportNestedInput
    notifications?: NotificationUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateWithoutReporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    cleanupScheduleId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedWorkers?: ReportWorkerUncheckedUpdateManyWithoutReportNestedInput
    images?: ReportImageUncheckedUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUncheckedUpdateManyWithoutReportNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateManyWithoutReporterInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    cleanupScheduleId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReportUpdateWithoutAssignedToInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporter?: UserUpdateOneWithoutReportsNestedInput
    assignedWorkers?: ReportWorkerUpdateManyWithoutReportNestedInput
    cleanupSchedule?: CleanupScheduleUpdateOneWithoutReportsNestedInput
    images?: ReportImageUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUpdateManyWithoutReportNestedInput
    notifications?: NotificationUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateWithoutAssignedToInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporterId?: NullableStringFieldUpdateOperationsInput | string | null
    cleanupScheduleId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedWorkers?: ReportWorkerUncheckedUpdateManyWithoutReportNestedInput
    images?: ReportImageUncheckedUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUncheckedUpdateManyWithoutReportNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateManyWithoutAssignedToInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporterId?: NullableStringFieldUpdateOperationsInput | string | null
    cleanupScheduleId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReportWorkerUpdateWithoutWorkerInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    report?: ReportUpdateOneRequiredWithoutAssignedWorkersNestedInput
  }

  export type ReportWorkerUncheckedUpdateWithoutWorkerInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: StringFieldUpdateOperationsInput | string
  }

  export type ReportWorkerUncheckedUpdateManyWithoutWorkerInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: StringFieldUpdateOperationsInput | string
  }

  export type StatusHistoryUpdateWithoutChangedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    previousStatus?: NullableEnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    report?: ReportUpdateOneRequiredWithoutStatusHistoryNestedInput
  }

  export type StatusHistoryUncheckedUpdateWithoutChangedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    previousStatus?: NullableEnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: StringFieldUpdateOperationsInput | string
  }

  export type StatusHistoryUncheckedUpdateManyWithoutChangedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    previousStatus?: NullableEnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: StringFieldUpdateOperationsInput | string
  }

  export type NotificationUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    report?: ReportUpdateOneWithoutNotificationsNestedInput
  }

  export type NotificationUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NotificationUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reportId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReportingZoneUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coordinates?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportingZoneUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coordinates?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportingZoneUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coordinates?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CleanupScheduleUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
    verifiedBy?: UserUpdateOneWithoutVerifiedSchedulesNestedInput
    workers?: CleanupScheduleWorkerUpdateManyWithoutScheduleNestedInput
    reports?: ReportUpdateManyWithoutCleanupScheduleNestedInput
  }

  export type CleanupScheduleUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedById?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
    workers?: CleanupScheduleWorkerUncheckedUpdateManyWithoutScheduleNestedInput
    reports?: ReportUncheckedUpdateManyWithoutCleanupScheduleNestedInput
  }

  export type CleanupScheduleUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedById?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
  }

  export type CleanupScheduleUpdateWithoutVerifiedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
    createdBy?: UserUpdateOneRequiredWithoutCreatedSchedulesNestedInput
    workers?: CleanupScheduleWorkerUpdateManyWithoutScheduleNestedInput
    reports?: ReportUpdateManyWithoutCleanupScheduleNestedInput
  }

  export type CleanupScheduleUncheckedUpdateWithoutVerifiedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
    workers?: CleanupScheduleWorkerUncheckedUpdateManyWithoutScheduleNestedInput
    reports?: ReportUncheckedUpdateManyWithoutCleanupScheduleNestedInput
  }

  export type CleanupScheduleUncheckedUpdateManyWithoutVerifiedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    barangay?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumCleanupScheduleStatusFieldUpdateOperationsInput | $Enums.CleanupScheduleStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipment?: CleanupScheduleUpdateequipmentInput | string[]
  }

  export type CleanupScheduleWorkerUpdateWithoutWorkerInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: CleanupScheduleUpdateOneRequiredWithoutWorkersNestedInput
  }

  export type CleanupScheduleWorkerUncheckedUpdateWithoutWorkerInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleId?: StringFieldUpdateOperationsInput | string
  }

  export type CleanupScheduleWorkerUncheckedUpdateManyWithoutWorkerInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    scheduleId?: StringFieldUpdateOperationsInput | string
  }

  export type ReportWorkerCreateManyReportInput = {
    id?: string
    assignedAt?: Date | string
    workerId: string
  }

  export type ReportImageCreateManyReportInput = {
    id?: string
    imageUrl: string
    publicId: string
    type?: $Enums.ImageType
    createdAt?: Date | string
  }

  export type StatusHistoryCreateManyReportInput = {
    id?: string
    previousStatus?: $Enums.ReportStatus | null
    newStatus: $Enums.ReportStatus
    notes?: string | null
    createdAt?: Date | string
    changedById: string
  }

  export type NotificationCreateManyReportInput = {
    id?: string
    title: string
    message: string
    type: $Enums.NotificationType
    isRead?: boolean
    createdAt?: Date | string
    userId: string
  }

  export type ReportWorkerUpdateWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    worker?: UserUpdateOneRequiredWithoutAssignedReportWorkersNestedInput
  }

  export type ReportWorkerUncheckedUpdateWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type ReportWorkerUncheckedUpdateManyWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type ReportImageUpdateWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportImageUncheckedUpdateWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportImageUncheckedUpdateManyWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StatusHistoryUpdateWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    previousStatus?: NullableEnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedBy?: UserUpdateOneRequiredWithoutStatusChangesNestedInput
  }

  export type StatusHistoryUncheckedUpdateWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    previousStatus?: NullableEnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedById?: StringFieldUpdateOperationsInput | string
  }

  export type StatusHistoryUncheckedUpdateManyWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    previousStatus?: NullableEnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus | null
    newStatus?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedById?: StringFieldUpdateOperationsInput | string
  }

  export type NotificationUpdateWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutNotificationsNestedInput
  }

  export type NotificationUncheckedUpdateWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type NotificationUncheckedUpdateManyWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    isRead?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type CleanupScheduleWorkerCreateManyScheduleInput = {
    id?: string
    assignedAt?: Date | string
    workerId: string
  }

  export type ReportCreateManyCleanupScheduleInput = {
    id?: string
    title: string
    description: string
    category: $Enums.WasteCategory
    status?: $Enums.ReportStatus
    latitude: number
    longitude: number
    address?: string | null
    isAnonymous?: boolean
    isDeleted?: boolean
    isSpam?: boolean
    spamMarkedAt?: Date | string | null
    spamReason?: string | null
    analysisStatus?: $Enums.AnalysisStatus | null
    analysisWasteCount?: number | null
    analysisConfidence?: number | null
    analyzedAt?: Date | string | null
    severity?: $Enums.Severity | null
    aiCategories?: ReportCreateaiCategoriesInput | string[]
    aiReason?: string | null
    aiModel?: string | null
    aiImageHash?: string | null
    aiProcessingMs?: number | null
    aiGeminiMs?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reporterId?: string | null
    assignedToId?: string | null
  }

  export type CleanupScheduleWorkerUpdateWithoutScheduleInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    worker?: UserUpdateOneRequiredWithoutScheduleAssignmentsNestedInput
  }

  export type CleanupScheduleWorkerUncheckedUpdateWithoutScheduleInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type CleanupScheduleWorkerUncheckedUpdateManyWithoutScheduleInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    workerId?: StringFieldUpdateOperationsInput | string
  }

  export type ReportUpdateWithoutCleanupScheduleInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporter?: UserUpdateOneWithoutReportsNestedInput
    assignedTo?: UserUpdateOneWithoutAssignedReportsNestedInput
    assignedWorkers?: ReportWorkerUpdateManyWithoutReportNestedInput
    images?: ReportImageUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUpdateManyWithoutReportNestedInput
    notifications?: NotificationUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateWithoutCleanupScheduleInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporterId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedWorkers?: ReportWorkerUncheckedUpdateManyWithoutReportNestedInput
    images?: ReportImageUncheckedUpdateManyWithoutReportNestedInput
    statusHistory?: StatusHistoryUncheckedUpdateManyWithoutReportNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutReportNestedInput
  }

  export type ReportUncheckedUpdateManyWithoutCleanupScheduleInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: EnumWasteCategoryFieldUpdateOperationsInput | $Enums.WasteCategory
    status?: EnumReportStatusFieldUpdateOperationsInput | $Enums.ReportStatus
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    address?: NullableStringFieldUpdateOperationsInput | string | null
    isAnonymous?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isSpam?: BoolFieldUpdateOperationsInput | boolean
    spamMarkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    spamReason?: NullableStringFieldUpdateOperationsInput | string | null
    analysisStatus?: NullableEnumAnalysisStatusFieldUpdateOperationsInput | $Enums.AnalysisStatus | null
    analysisWasteCount?: NullableIntFieldUpdateOperationsInput | number | null
    analysisConfidence?: NullableFloatFieldUpdateOperationsInput | number | null
    analyzedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    severity?: NullableEnumSeverityFieldUpdateOperationsInput | $Enums.Severity | null
    aiCategories?: ReportUpdateaiCategoriesInput | string[]
    aiReason?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiImageHash?: NullableStringFieldUpdateOperationsInput | string | null
    aiProcessingMs?: NullableIntFieldUpdateOperationsInput | number | null
    aiGeminiMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reporterId?: NullableStringFieldUpdateOperationsInput | string | null
    assignedToId?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}