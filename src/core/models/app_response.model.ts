import { ErrorTypeEnum, HTTPStatusCodeEnum } from "../enums";

export interface AppError<T = any> {
  type: ErrorTypeEnum;
  details?: T;
}

export interface AppValidationError
  extends AppError<{
    keyValue: { [key: string]: any };
    message: string;
    hint?: any;
  }> {}

export interface AppUpdateResultModel<T = any> {
  updateData: Record<string, any>;
  count: number;
  returning?: T;
}

export interface AppResponseModel<T> {
  success: boolean;
  statusCode: HTTPStatusCodeEnum;
  message: string;
  data: T | null;
  errors: AppError[] | null;
  isLocallyMadeError?: boolean;
  meta?: { [key: string]: any };
}
