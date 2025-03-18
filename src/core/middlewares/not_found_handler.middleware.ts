import { Request, Response, NextFunction } from "express";
import { AppResponseUtil } from "../util/app_response.util";
import { ErrorTypeEnum, HTTPStatusCodeEnum } from "../enums";

export const notFoundHandlerMiddleware = (
  req: Request,
  res: Response,
  _: NextFunction
) => {
  /* istanbul ignore next */
  AppResponseUtil.error(
    res,
    HTTPStatusCodeEnum.NotFound,
    `the requested URL '${req.originalUrl}' with method '${req.method}' does not exist. please check the path and ensure you are using the correct HTTP method (GET, POST, PUT, DELETE, etc.).`,
    [{ type: ErrorTypeEnum.PageNotFound }]
  );
};
