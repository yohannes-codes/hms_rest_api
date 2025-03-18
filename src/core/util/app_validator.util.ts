import { ErrorTypeEnum } from "../enums";
import { AppValidationError } from "../models/app_response.model";
import { isEmpty } from "./util.util";

export type Types =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "date";

const getType = (value: any): Types => {
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  return typeof value as Types;
};

export interface ValidationOptions {
  type?: Types;
  optional?: boolean;
  minLen?: number;
  maxLen?: number;
  min?: number;
  max?: number;
  enum?: any[];
  transform?: (value: any) => any;
  pattern?: RegExp;
  custom?: (value: any) => { type: ErrorTypeEnum; message: string; hint?: any };
}

// TODO: revisit this whole shit because it's shit!!!

export const AppValidator = (
  data: Record<string, any>,
  rules: Record<string, ValidationOptions>
): AppValidationError[] => {
  const errors: AppValidationError[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = rule.transform ? rule.transform(data[field]) : data[field];

    // Required field check
    if (!rule.optional && isEmpty(value)) {
      errors.push({
        type: ErrorTypeEnum.MissingField,
        details: {
          keyValue: { [field]: data[field] },
          message: `${field} is required and was not provided`,
        },
      });
      continue;
    }

    // Type check
    if (rule.type && !isEmpty(value) && getType(value) !== rule.type) {
      errors.push({
        type: ErrorTypeEnum.InvalidDataType,
        details: {
          keyValue: { [field]: data[field] },
          message: `${field} must a data type of ${rule.type}`,
        },
      });
      continue;
    }

    // Length & Pattern checks (only applicable to strings)
    if (typeof value === "string") {
      if (!isEmpty(rule.minLen) && value.length < rule.minLen!) {
        errors.push({
          type: ErrorTypeEnum.ValueTooShort,
          details: {
            keyValue: { [field]: data[field] },
            message: `${field} must be at least ${rule.minLen} characters long`,
          },
        });
        continue;
      }

      if (!isEmpty(rule.maxLen) && value.length > rule.maxLen!) {
        errors.push({
          type: ErrorTypeEnum.ValueTooLong,
          details: {
            keyValue: { [field]: data[field] },
            message: `${field} must be at most ${rule.maxLen} characters long`,
          },
        });
        continue;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          type: ErrorTypeEnum.PatternMismatch,
          details: {
            keyValue: { [field]: data[field] },
            message: `${field} must match the pattern ${rule.pattern}`,
          },
        });
        continue;
      }
    }

    // Number value checks
    if (typeof value === "number") {
      if (!isEmpty(rule.min) && value < rule.min!) {
        errors.push({
          type: ErrorTypeEnum.MinValue,
          details: {
            keyValue: { [field]: data[field] },
            message: `${field} must be at least ${rule.min}`,
          },
        });
        continue;
      }

      if (!isEmpty(rule.max) && value > rule.max!) {
        errors.push({
          type: ErrorTypeEnum.MaxValue,
          details: {
            keyValue: { [field]: data[field] },
            message: `${field} must be at most ${rule.max}`,
          },
        });
        continue;
      }
    }

    // Enum check
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push({
        type: ErrorTypeEnum.EnumMismatch,
        details: {
          keyValue: { [field]: data[field] },
          message: `${field} must be one of ${rule.enum.join(", ")}`,
        },
      });
      continue;
    }

    // Custom validation function
    if (rule.custom) {
      const customError = rule.custom(value);

      if (customError)
        errors.push({
          type: customError.type,
          details: {
            keyValue: { [field]: data[field] },
            message: customError.message,
            hint: customError.hint,
          },
        });

      continue;
    }
  }

  return errors;
};
