import { Request, Response, NextFunction } from "express";
import { AppResponseUtil } from "../util/app_response.util";
import { ErrorTypeEnum, HTTPStatusCodeEnum } from "../enums";

export const notFoundHandlerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const method = req.method;
  const url = req.originalUrl;

  const message = `The requested URL '${url}' with method '${method}' does not exist. Please check the path and ensure you are using the correct HTTP method (GET, POST, PUT, DELETE, etc.).`;

  AppResponseUtil.error(res, HTTPStatusCodeEnum.NotFound, "Route not found", [
    { type: ErrorTypeEnum.NotFound, message: message },
  ]);
};
