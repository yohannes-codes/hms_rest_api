import { Request } from "express";
import { JobTitleEnum } from "../enums";

export interface AuthedUser {
  id: string;
  jobTitle: JobTitleEnum;
  name: string;
}

export interface AuthedRequest extends Request {
  user?: AuthedUser;
}
