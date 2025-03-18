import { Response } from "express";
import { AppError, AppResponseModel } from "../models/app_response.model";
import { HTTPStatusCodeEnum } from "../enums";

export class AppResponseUtil {
  static success<T>(
    res: Response,
    statusCode: HTTPStatusCodeEnum,
    message: string,
    data: T | null,
    meta?: { [key: string]: any }
  ): void {
    const response: AppResponseModel<T> = {
      success: true,
      statusCode,
      message,
      data,
      errors: null,
      meta,
    };
    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    statusCode: HTTPStatusCodeEnum,
    message: string,
    errors: AppError[] | null,
    meta?: { [key: string]: any }
  ): void {
    const response: AppResponseModel<null> = {
      success: false,
      statusCode,
      message,
      data: null,
      errors,
      meta,
    };
    res.status(statusCode).json(response);
  }
}
