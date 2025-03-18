export enum HTTPStatusCodeEnum {
  OK = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  Conflict = 409,
  InternalServerError = 500,
  NotImplemented = 501,
  ServiceUnavailable = 503,
}

export enum ErrorTypeEnum {
  // Validation Errors
  InvalidData = "invalidData",
  MissingField = "missingField",
  InvalidDataType = "invalidDataType",
  ValueTooShort = "valueTooShort",
  ValueTooLong = "valueTooLong",
  MinValue = "minValue",
  MaxValue = "maxValue",
  PatternMismatch = "patternMismatch",
  EnumMismatch = "enumMismatch",

  // Authentication & Authorization
  InvalidCredentials = "invalidCredentials",
  MissingToken = "missingToken",
  ExpiredToken = "expiredToken",
  UnauthorizedAccess = "unauthorizedAccess",
  ForbiddenResource = "forbiddenResource",

  // Database & Conflict Errors
  UniqueConstraintViolation = "uniqueConstraintViolation",
  ForeignKeyViolation = "foreignKeyViolation",
  RecordNotFound = "recordNotFound",
  DatabaseConnectionError = "databaseConnectionError",

  // Routing Issues
  PageNotFound = "pageNotFound",
  MethodNotAllowed = "methodNotAllowed",

  // Server & Unknown Issues
  InternalServerError = "internalServerError",
  ServiceUnavailable = "serviceUnavailable",
  UnknownError = "unknownError",
}

export enum JobTitleEnum {
  Manager = "manager",
  Supervisor = "supervisor",
  Accountant = "accountant",
  Storekeeper = "storekeeper",
  Receptionist = "receptionist",
  Housekeeper = "housekeeper",
  Laundry = "laundry",
  Chef = "chef",
  Waiter = "waiter",
  Cleaner = "cleaner",
  Security = "security",
  Maintenance = "maintenance",
  IT = "it",
  System = "system",
  Unknown = "unknown",
}
