import { Request, Response, NextFunction } from "express";
import { JobTitleEnum } from "../enums";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // TODO: Simulated authentication (replace with real auth logic)
  (req as any).user = {
    id: "af953bc8-0821-4358-a4bc-1b60ec1c119f",
    jobTitle: JobTitleEnum.System,
    name: "system",
  };
  next();
};
