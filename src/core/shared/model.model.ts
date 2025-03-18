import { AppValidationError } from "../models/app_response.model";
import { AppValidator, ValidationOptions } from "../util/app_validator.util";
import {
  excludeFields,
  getEmptyFields,
  removeEmptyFields,
} from "../util/util.util";

export abstract class BaseModel {
  id?: string;

  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  // this refers to employeeId
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;

  constructor() {
    this.createdAt = new Date();
  }

  /**
   * The validation rules specific to this model.
   * Each subclass must define the rules used to validate the model’s fields.
   * @example
   * ```typescript
   * get rules(): Record<string, ValidationOptions> {
   *  return {
   *    firstName: { minLen: 2, maxLen: 255 },
   *    lastName: { minLen: 2, maxLen: 255 },
   *    middleName: { optional: true, maxLen: 255 },
   *    email: { optional: true, maxLen: 255 },
   *    phone: { minLen: 9, maxLen: 15 },
   *    address: { minLen: 10, maxLen: 255 }
   *  }
   * ]
   */
  abstract get rules(): Record<string, any>;

  /**
   * Returns all fields of the model as a key-value mapping.
   * This provides a complete snapshot of the model’s data.
   */
  abstract get allFields(): Record<string, any>;

  /**
   * Specifies which fields should be excluded during insertion operations.
   * Subclasses can override this to omit sensitive or auto-generated fields.
   */
  abstract get insertExcludeFields(): string[];

  /**
   * Specifies which fields should be excluded during update operations.
   * Subclasses can override this to prevent certain fields from being updated.
   */
  abstract get updateExcludeFields(): string[];

  get defaultRules(): Record<string, ValidationOptions> {
    return {
      id: { optional: true },
      createdAt: { type: "date" },
      updatedAt: { type: "date" },
      deletedAt: { type: "date" },
      createdBy: {},
      updatedBy: {},
      deletedBy: {},
    };
  }

  get extractForInsertion(): Record<string, any> {
    return excludeFields(
      removeEmptyFields(this.allFields),
      this.insertExcludeFields
    ) as Record<string, any>;
  }

  get extractForUpdate(): Record<string, any> {
    return excludeFields(
      removeEmptyFields(this.allFields),
      this.updateExcludeFields
    ) as Record<string, any>;
  }

  validateForInsertion(): AppValidationError[] {
    return this.validation(this.insertExcludeFields);
  }

  validateForUpdate(): AppValidationError[] {
    return this.validation([
      ...new Set<string>([
        ...this.updateExcludeFields,
        ...getEmptyFields(this.allFields),
      ]),
    ]);
  }

  private validation = (exclude: string[]): AppValidationError[] => {
    const data = excludeFields(this.allFields, exclude);

    const subRules = Object.fromEntries(
      Object.keys(data).map((key) => [key, this.rules[key]])
    );

    return AppValidator(data, subRules);
  };
}
