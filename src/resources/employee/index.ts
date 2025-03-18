import { Router } from "express";
import { employeeRouter } from "./employee.route";

export const employeeIndexRouter = Router();

employeeIndexRouter.use("/", employeeRouter);
