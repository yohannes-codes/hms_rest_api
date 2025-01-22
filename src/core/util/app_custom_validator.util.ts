import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function IsRequired(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isRequired",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Check if the value is missing (undefined or null)
          if (value === undefined || value === null) {
            return false; // This will trigger validation failure
          }
          return true; // Validation passes if value is present
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is required`; // Custom error message
        },
      },
    });
  };
}

// Custom phone number validation regex
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidPhoneNumber",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== "string") {
            return false;
          }
          return phoneRegex.test(value); // Check against E.164 format
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid phone number in E.164 format (e.g., +1234567890).`;
        },
      },
    });
  };
}
