import { JobTitleEnum } from "../../core/enums";
import { BaseModel } from "../../core/shared/model.model";
import { ValidationOptions } from "../../core/util/app_validator.util";

export class EmployeeModel extends BaseModel {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  address?: string;
  jobTitle?: JobTitleEnum;

  constructor(data: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    phone?: string;
    address?: string;
    jobTitle?: JobTitleEnum;
  }) {
    super();
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.middleName = data.middleName;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.jobTitle = data.jobTitle;
  }

  get rules(): Record<string, ValidationOptions> {
    return {
      firstName: { minLen: 2, maxLen: 255 },
      lastName: { minLen: 2, maxLen: 255 },
      middleName: { optional: true, maxLen: 255 },
      email: { optional: true, maxLen: 255 },
      phone: { minLen: 9, maxLen: 15 },
      address: { minLen: 10, maxLen: 255 },
      jobTitle: { enum: Object.values(JobTitleEnum) },
      ...this.defaultRules,
    };
  }

  get allFields(): Record<string, any> {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      middleName: this.middleName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      jobTitle: this.jobTitle,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedBy: this.deletedBy,
    };
  }

  get insertExcludeFields(): string[] {
    return ["id", "updatedAt", "deletedAt", "updatedBy", "deletedBy"];
  }

  get updateExcludeFields(): string[] {
    return ["id", "createdAt", "deletedAt", "createdBy", "deletedBy"];
  }

  static fromUserRequestFn(data: Record<string, any>): EmployeeModel {
    return new EmployeeModel({
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      jobTitle: data.jobTitle,
    });
  }
}
