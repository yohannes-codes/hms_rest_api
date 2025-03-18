import { NextFunction, Request, Response } from "express";
import { AppService } from "./service.service";
import { BaseModel } from "./model.model";
import { AppResponseUtil } from "../util/app_response.util";
import { ErrorTypeEnum, HTTPStatusCodeEnum } from "../enums";
import {
  AppUpdateResultModel,
  AppValidationError,
} from "../models/app_response.model";
import { AppErrorBuilder } from "../util/app_error_builder.util";
import { isEmpty, isValidUUID } from "../util/util.util";
import { AuthedRequest } from "../models/auth_request.mode";

export class AppController<Model extends BaseModel> {
  private service: AppService<Model>;
  private name: string;
  private fromUserRequestFn: (
    data: Record<string, any>,
    ...args: any[]
  ) => Model;

  constructor(
    name: string,
    service: AppService<Model>,
    fromUserRequestFn: (data: Record<string, any>, ...args: any[]) => Model
  ) {
    this.name = name;
    this.service = service;
    this.fromUserRequestFn = fromUserRequestFn;
  }

  // helper functions

  getIdOrThrowError = (id: any): string | never => {
    if (!id) return this.throwMissingIdError();

    if (!isValidUUID(id as string)) return this.throwInvalidIdError(id);

    return id as string;
  };

  getIdsOrThrowError = (ids: any): string[] | never => {
    if (!ids) return this.throwMissingIdError();
    if (!Array.isArray(ids))
      return isValidUUID(ids) ? [ids] : this.throwInvalidIdError(ids);
    else if (!ids.length) return this.throwMissingIdError();

    const invalidIds = ids.filter((i: any) => !isValidUUID(i));

    return invalidIds.length ? this.throwInvalidIdError(invalidIds) : ids;
  };

  throwMissingIdError = (isIds: boolean = false): never => {
    throw AppErrorBuilder.validation([
      {
        type: ErrorTypeEnum.MissingField,
        details: {
          message: `${isIds ? "ids" : "id"} was not provided in the request`,
          keyValue: isIds ? { ids: [] } : { id: "" },
          hint: `provide the ${
            isIds
              ? "ids in request.body or request.query"
              : "id in request.query"
          } to proceed`,
        },
      } as AppValidationError,
    ]);
  };

  throwMissingBodyError = (): never => {
    throw AppErrorBuilder.validation([
      {
        type: ErrorTypeEnum.MissingField,
        details: {
          message: "no data was provided for write operation",
          keyValue: { body: {} },
          hint: "provide the data in request.body to proceed",
        },
      } as AppValidationError,
    ]);
  };

  throwInvalidIdError = (id: string | string[]): never => {
    throw AppErrorBuilder.validation([
      {
        type: ErrorTypeEnum.InvalidDataType,
        details: {
          message: `an invalid ${
            Array.isArray(id) ? "ids were" : "id was"
          }  given`,
          keyValue: { id: id },
          hint: "provide a valid id to proceed",
        },
      } as AppValidationError,
    ]);
  };

  throwNotFoundError = (id: string | string[]) => {
    throw AppErrorBuilder.notFound({
      message: `no matching ${this.name} with ${Array.isArray(
        id ? "the ids: " : "an id: "
      )} [${id}] was found.`,
    });
  };

  throwMissingTokenError = (): never => {
    throw AppErrorBuilder.authentication({
      type: ErrorTypeEnum.MissingToken,
      message: "no token was provided in the request",
      details: {
        expectedLocation: "request.headers.authorization",
      },
    });
  };

  notImplementedYet = (_req: Request, _res: Response, _next: NextFunction) => {
    throw AppErrorBuilder.notImplemented({});
  };

  create = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user === undefined) this.throwMissingTokenError();

      if (isEmpty(req.body)) this.throwMissingBodyError();

      const data: Model = this.fromUserRequestFn(req.body);

      data.createdAt = new Date();
      data.createdBy = req.user!.id;

      const validationResult = data.validateForInsertion();

      if (validationResult.length)
        throw AppErrorBuilder.validation(validationResult);

      const result = await this.service.insert(data);

      AppResponseUtil.success<Model>(
        res,
        HTTPStatusCodeEnum.Created,
        `${this.name} created successfully.`,
        result
      );
    } catch (error) {
      next(AppErrorBuilder.general(error));
    }
  };

  // read

  read = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const id = this.getIdOrThrowError(req.query.id);

      const result = await this.service.read(id);

      if (!result) this.throwNotFoundError(id);

      AppResponseUtil.success<Model>(
        res,
        HTTPStatusCodeEnum.OK,
        `${this.name} retrieved successfully`,
        result
      );
    } catch (error) {
      next(AppErrorBuilder.general(error));
    }
  };

  readByIds = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const ids = this.getIdsOrThrowError(req.query.ids ?? req.body.ids);

      const result = await this.service.readByIds(ids);

      if (isEmpty(result)) this.throwNotFoundError(ids);

      AppResponseUtil.success<Model[]>(
        res,
        HTTPStatusCodeEnum.OK,
        `${this.name} retrieved successfully`,
        result
      );
    } catch (error) {
      next(AppErrorBuilder.general(error));
    }
  };

  // update

  update = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user === undefined) throw AppErrorBuilder.authentication({});

      const id = this.getIdOrThrowError(req.query.id);

      if (isEmpty(req.body)) this.throwMissingBodyError();

      const data: Model = this.fromUserRequestFn(req.body);

      data.updatedAt = new Date();
      data.updatedBy = req.user.id;

      const validationResult = data.validateForUpdate();

      if (validationResult.length)
        throw AppErrorBuilder.validation(validationResult);

      const result = await this.service.update(id, data);

      if (!result.count) this.throwNotFoundError(id);

      AppResponseUtil.success<AppUpdateResultModel>(
        res,
        HTTPStatusCodeEnum.OK,
        `${this.name} updated successfully`,
        result
      );
    } catch (error) {
      next(AppErrorBuilder.general(error));
    }
  };

  updateAndReturn = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (req.user === undefined) throw AppErrorBuilder.authentication({});

      const id = this.getIdOrThrowError(req.query.id);

      if (isEmpty(req.body)) this.throwMissingBodyError();

      const data: Model = this.fromUserRequestFn(req.body);

      data.updatedAt = new Date();
      data.updatedBy = req.user.id;

      const validationResult = data.validateForUpdate();

      if (validationResult.length)
        throw AppErrorBuilder.validation(validationResult);

      const result = await this.service.updateAndReturn(id, data);

      if (!result.count) this.throwNotFoundError(id);

      AppResponseUtil.success<AppUpdateResultModel<Model>>(
        res,
        HTTPStatusCodeEnum.OK,
        `${this.name} updated successfully`,
        result
      );
    } catch (error) {
      next(AppErrorBuilder.general(error));
    }
  };

  updateByIds = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (req.user === undefined) throw AppErrorBuilder.authentication({});

      const ids = this.getIdsOrThrowError(req.query.ids ?? req.body.ids);

      if (isEmpty(req.body)) this.throwMissingBodyError();

      const data: Model = this.fromUserRequestFn(req.body);

      data.updatedAt = new Date();
      data.updatedBy = req.user.id;

      const validationResult = data.validateForUpdate();

      if (validationResult.length)
        throw AppErrorBuilder.validation(validationResult);

      const result = await this.service.updateByIds(ids, data);

      if (!result.count) this.throwNotFoundError(ids);

      AppResponseUtil.success<AppUpdateResultModel>(
        res,
        HTTPStatusCodeEnum.OK,
        `${this.name} updated successfully`,
        result
      );
    } catch (error) {
      next(AppErrorBuilder.general(error));
    }
  };

  // delete

  delete = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user === undefined) throw AppErrorBuilder.authentication({});

      const id = this.getIdOrThrowError(req.query.id);

      const result = await this.service.delete(id, req.user.id);

      if (!result.count) this.throwNotFoundError(id);

      AppResponseUtil.success<AppUpdateResultModel>(
        res,
        HTTPStatusCodeEnum.OK,
        `${this.name} deleted successfully`,
        result
      );
    } catch (error) {
      next(AppErrorBuilder.general(error));
    }
  };

  deleteByIds = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (req.user === undefined) throw AppErrorBuilder.authentication({});

      const ids = this.getIdsOrThrowError(req.query.ids ?? req.body.ids);

      const result = await this.service.deleteByIds(ids, req.user.id);

      if (!result.count) this.throwNotFoundError(ids);

      AppResponseUtil.success<AppUpdateResultModel>(
        res,
        HTTPStatusCodeEnum.OK,
        `${this.name} deleted successfully`,
        result
      );
    } catch (error) {
      next(AppErrorBuilder.general(error));
    }
  };

  // point of no return

  deletePermanently = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = this.getIdOrThrowError(req.query.id);

      const result = await this.service.deletePermanently(id);

      if (!result.count) this.throwNotFoundError(id);

      AppResponseUtil.success<AppUpdateResultModel>(
        res,
        HTTPStatusCodeEnum.OK,
        `${this.name} permanently deleted successfully`,
        result
      );
    } catch (error) {
      next(AppErrorBuilder.general(error));
    }
  };
}
