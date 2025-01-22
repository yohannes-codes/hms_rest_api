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
  ServiceUnavailable = 503,
}

export enum ErrorTypeEnum {
  Authentication = "authentication",
  Authorization = "authorization",
  Validation = "validation",
  Database = "database",
  NotFound = "notFound",
  Conflict = "conflict",
  InternalServerError = "internalServerError",
  ServiceUnavailable = "serviceUnavailable",
  Unknown = "unknown",
}

export enum GenderEnum {
  Male = "mail",
  Female = "female",
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
  Unknown = "unknown",
}

export enum employeeStatusEnum {
  Active = "active",
  Inactive = "inactive",
}

export enum RoomStatusEnum {
  Available = "available",
  Occupied = "occupied",
  Maintenance = "maintenance",
}

export enum RoomTypeEnum {
  Single = "single",
  Double = "double",
  Suite = "suite",
}

export enum ReservationStatusEnum {
  Waiting = "waiting",
  CheckedIn = "checkedIn",
  EarlyCheckedOut = "early checkedOut",
  CheckedOut = "checkedOut",
  ExtendedStay = "extended stay",
  LateCheckedOut = "late checkedOut",
  Cancelled = "cancelled",
  NoShow = "noShow",
}

export enum TransactionMethodEnum {
  Cash = "cash",
  MobileMoney = "mobile money",
  Transfer = "transfer",
  Card = "card",
  Check = "check",
  Other = "other",
}

export enum CurrencyEnum {
  USD = "USD",
  EUR = "EUR",
  KES = "KES",
  SSP = "SSP",
  ETB = "ETB",
  UGX = "UGX",
  TZS = "TZS",
  RWF = "RWF",
}

export enum ExpenseCategoryEnum {
  Salary = "salary",
  Utilities = "utilities",
  Staff = "staff",
  Housekeeping = "housekeeping",
  GovernmentalFees = "governmentalFees",
  Maintenance = "maintenance",
  Marketing = "marketing",
  Operation = "operation",
  Other = "other",
}

export enum ExpenseLabelEnum {
  Electricity = "electricity",
  Water = "water",
  Gas = "gas",
  Sewage = "sewage",
  Garbage = "garbage",
  Airtime = "airtime",
  Rent = "rent",
  Salaries = "salaries",
  Supplies = "supplies",
  Equipment = "equipment",
  Taxes = "taxes",
  Permits = "permits",
  Licenses = "licenses",
  Repairs = "repairs",
  Renovations = "renovations",
  Advertising = "advertising",
  Commissions = "commissions",
  Printing = "printing",
  Stationery = "stationery",
  Transport = "transport",
  Labour = "labour",
  Bonus = "bonus",
  Food = "food",
  Other = "other",
}
