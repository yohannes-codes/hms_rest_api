import { Request, Response, NextFunction } from "express";
import { AppResponseUtil } from "../util/app_response.util";
import { HTTPStatusCodeEnum } from "../enums";

export const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("❌ Oops! An error occurred.", err);

  AppResponseUtil.error(
    res,
    HTTPStatusCodeEnum.InternalServerError,
    err.message,
    err.errors
  );
};
