import { ErrorTypeEnum, HTTPStatusCodeEnum } from "../enums";
import {
  AppResponseModel,
  AppValidationError,
} from "../models/app_response.model";

type ARM = AppResponseModel<null>;

interface AEBP {
  type?: ErrorTypeEnum;
  message?: string;
  details?: any;
}

export class AppErrorBuilder {
  static general = (error: any): ARM => {
    if (error.isLocallyMadeError) return error;

    if (error.code) {
      switch (error.code) {
        case "23505":
          return AppErrorBuilder.conflict({ details: error.message });

        case "23503":
          return AppErrorBuilder.notFound({ details: error.message });
        case "22P02":
          const match = error.message.match(
            /invalid input syntax for type \w+: "([^"]+)"/
          );
          const invalidValue = match ? match[1] : "Unknown";

          return AppErrorBuilder.validation([
            {
              type: ErrorTypeEnum.InvalidDataType,
              details: {
                keyValue: { id: invalidValue },
                message: error.message,
              },
            },
          ]);

        default:
          return AppErrorBuilder.unknown({});
      }
    }

    return {
      success: false,
      statusCode: HTTPStatusCodeEnum.InternalServerError,
      message: "unknown error occurred.",
      data: null,
      errors: [
        {
          type: ErrorTypeEnum.UnknownError,
          details: error.message ?? error.detail ?? error,
        },
      ],
      isLocallyMadeError: true,
    };
  };

  static authentication = ({ type, message, details }: AEBP): ARM => {
    return {
      success: false,
      statusCode: HTTPStatusCodeEnum.Unauthorized,
      message: message || "unauthenticated user.",
      data: null,
      errors: [{ type: type || ErrorTypeEnum.MissingToken, details }],
      isLocallyMadeError: true,
    };
  };

  static authorization = ({ type, message, details }: AEBP): ARM => {
    return {
      success: false,
      statusCode: HTTPStatusCodeEnum.Forbidden,
      message: message || "unauthorized user.",
      data: null,
      errors: [{ type: type || ErrorTypeEnum.UnauthorizedAccess, details }],
      isLocallyMadeError: true,
    };
  };

  static validation = (errors: AppValidationError[]): ARM => {
    return {
      success: false,
      statusCode: HTTPStatusCodeEnum.BadRequest,
      message: "validation failed.",
      data: null,
      errors: errors,
      isLocallyMadeError: true,
    };
  };

  static notFound = ({ type, message, details }: AEBP): ARM => {
    return {
      success: false,
      statusCode: HTTPStatusCodeEnum.NotFound,
      message: message || "resource not found.",
      data: null,
      errors: [{ type: type || ErrorTypeEnum.RecordNotFound, details }],
      isLocallyMadeError: true,
    };
  };

  static conflict = ({ type, message, details }: AEBP): ARM => {
    return {
      success: false,
      statusCode: HTTPStatusCodeEnum.Conflict,
      message: message || "conflict occurred.",
      data: null,
      errors: [
        { type: type || ErrorTypeEnum.UniqueConstraintViolation, details },
      ],
      isLocallyMadeError: true,
    };
  };

  static internal = ({ type, message, details }: AEBP): ARM => {
    return {
      success: false,
      statusCode: HTTPStatusCodeEnum.InternalServerError,
      message: message || "internal server error.",
      data: null,
      errors: [{ type: type || ErrorTypeEnum.InternalServerError, details }],
      isLocallyMadeError: true,
    };
  };

  static notImplemented = ({ type, message, details }: AEBP): ARM => {
    return {
      success: false,
      statusCode: HTTPStatusCodeEnum.NotImplemented,
      message: message || "not implemented yet.",
      data: null,
      errors: [{ type: type || ErrorTypeEnum.ServiceUnavailable, details }],
      isLocallyMadeError: true,
    };
  };

  static serviceUnavailable = ({ type, message, details }: AEBP): ARM => {
    return {
      success: false,
      statusCode: HTTPStatusCodeEnum.ServiceUnavailable,
      message: message || "service unavailable.",
      data: null,
      errors: [{ type: type || ErrorTypeEnum.ServiceUnavailable, details }],
      isLocallyMadeError: true,
    };
  };

  static unknown = ({ type, message, details }: AEBP): ARM => {
    return {
      success: false,
      statusCode: HTTPStatusCodeEnum.InternalServerError,
      message: message || "unknown error occurred.",
      data: null,
      errors: [{ type: type || ErrorTypeEnum.UnknownError, details }],
      isLocallyMadeError: true,
    };
  };
}
