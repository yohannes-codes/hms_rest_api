import { ErrorTypeEnum, HTTPStatusCodeEnum } from "../enums";

export interface ApiError<T = any> {
  type: ErrorTypeEnum;
  message: string;
  details?: T;
}

export interface AppResponseModel<T> {
  success: boolean;
  statusCode: HTTPStatusCodeEnum;
  message: string;
  data: T | null;
  errors: ApiError[] | null;
  isLocallyMadeError?: boolean;
  meta?: { [key: string]: any };
}
