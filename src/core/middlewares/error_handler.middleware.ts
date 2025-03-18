import { Request, Response, NextFunction } from "express";
import { AppResponseUtil } from "../util/app_response.util";
import { HTTPStatusCodeEnum } from "../enums";

export const errorHandlerMiddleware = (
  err: any,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  if (err.isLocallyMadeError)
    AppResponseUtil.error(res, err.statusCode, err.message, err.errors);
  else
    AppResponseUtil.error(
      res,
      HTTPStatusCodeEnum.InternalServerError,
      err.message,
      err.errors
    );
};
