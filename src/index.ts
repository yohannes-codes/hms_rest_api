import dotenv from "dotenv";

/* istanbul ignore next */
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

import http from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import { errorHandlerMiddleware } from "./core/middlewares/error_handler.middleware";
import { notFoundHandlerMiddleware } from "./core/middlewares/not_found_handler.middleware";
import { AppResponseUtil } from "./core/util/app_response.util";
import { HTTPStatusCodeEnum } from "./core/enums";
import { employeeIndexRouter } from "./resources/employee";
import { authMiddleware } from "./core/middlewares/auth.middleware";
import { closeDbConnection } from "./core/database";

export const app = express();

app.use(cors({ credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(authMiddleware);

app.all("/", (_: Request, res: Response, __: NextFunction) => {
  AppResponseUtil.success(
    res,
    HTTPStatusCodeEnum.OK,
    "Fantastic news! The test ran successfully! 🎉 Everything is working perfectly!",
    {
      project: "hotel management system",
      coder: {
        name: "yohannes tesfay",
        dateOfBirth: new Date("03 April 1999 16:30"),
        netWorth: 0,
      },
    }
  );
});

app.all(
  "/api/v1/onlyForTheSakeOfTesting",
  (_req: Request, _res: Response, next: NextFunction) => {
    next({
      message: "This route is only for the sake of testing",
      isLocallyMadeError: false,
      statusCode: HTTPStatusCodeEnum.InternalServerError,
    });
  }
);

app.use("/api/v1/employees", employeeIndexRouter);

app.use(notFoundHandlerMiddleware);
app.use(errorHandlerMiddleware);

export const server = http.createServer(app);

server.listen(8080, () => {
  console.log(`Running 🌐: http://localhost:8080 ⌚: ${new Date().toJSON()}`);
});

export const destroyServer = async () => {
  await closeDbConnection();
  console.log(`💾 db connection closed 🕒 ${new Date().toISOString()}`);

  console.log(`🖥️ server destroyed 🕒 ${new Date().toISOString()}`);
  server.close();
};
