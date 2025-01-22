import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

import http from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import { AppDataSource } from "./core/database";

import { errorHandlerMiddleware } from "./core/middlewares/error_handler.middleware";
import { notFoundHandlerMiddleware } from "./core/middlewares/not_found_handler.middleware";
import { AppResponseUtil } from "./core/util/app_response.util";
import { HTTPStatusCodeEnum } from "./core/enums";

export const app = express();

app.use(cors({ credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.all("/", (req: Request, res: Response, next: NextFunction) => {
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

// here goes all API routes

// app.use("/api/background/employee", employeeRoutes.router);

// & here it ends

app.use(notFoundHandlerMiddleware);
app.use(errorHandlerMiddleware);

export const server = http.createServer(app);

server.listen(8080, () => {
  console.log(
    `🚀 Server 🌐 http://localhost:8080 🕒 ${
      new Date().toISOString().split(".")[0]
    }`
  );

  if (process.env.NODE_ENV !== "test")
    AppDataSource.initialize()
      .then(() => {
        console.log(
          `💾 Database 🌐${process.env.DB_HOST}:${
            process.env.DB_PORT
          } 🕒 ${new Date().toISOString()} `
        );
      })
      .catch((error) => console.log("Database connection error: ", error));
});

export async function destroyServer() {
  server.close();
  console.log(
    `🚀 Server destroyed 🕒 ${new Date().toISOString().split(".")[0]}`
  );
}
