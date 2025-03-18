import { ErrorTypeEnum } from "./enums";
import { AppErrorBuilder } from "./util/app_error_builder.util";
import { AppValidator, ValidationOptions } from "./util/app_validator.util";

describe("FILE: src/core functions inside core & miscellaneous tests", () => {
  it("FILE: src/core/util/app_error_builder.util *all at once", async () => {
    expect(
      AppErrorBuilder.general({
        isLocallyMadeError: true,
        testKey: "testValue",
      })
    ).toHaveProperty("testKey", "testValue");

    expect(
      AppErrorBuilder.general({ code: "23505", message: "this is code 23505" })
        .errors![0].type
    ).toBe(ErrorTypeEnum.UniqueConstraintViolation);

    expect(
      AppErrorBuilder.general({ code: "23503", message: "this is code 23503" })
        .errors![0].type
    ).toBe(ErrorTypeEnum.RecordNotFound);

    expect(
      AppErrorBuilder.general({ code: "22P02", message: "this is code 22P02" })
        .errors![0].type
    ).toBe(ErrorTypeEnum.InvalidDataType);

    expect(
      AppErrorBuilder.general({ code: "😅🥲😤", message: "this is code 22P02" })
        .errors![0].type
    ).toBe(ErrorTypeEnum.UnknownError);

    expect(AppErrorBuilder.general("hello unknown error").errors![0].type).toBe(
      ErrorTypeEnum.UnknownError
    );

    expect(AppErrorBuilder.authentication({}).errors![0].type).toBe(
      ErrorTypeEnum.MissingToken
    );

    expect(AppErrorBuilder.authorization({}).errors![0].type).toBe(
      ErrorTypeEnum.UnauthorizedAccess
    );

    expect(
      AppErrorBuilder.validation([{ type: ErrorTypeEnum.RecordNotFound }])
        .errors![0].type
    ).toBe(ErrorTypeEnum.RecordNotFound);

    expect(AppErrorBuilder.notFound({}).errors![0].type).toBe(
      ErrorTypeEnum.RecordNotFound
    );

    expect(AppErrorBuilder.conflict({}).errors![0].type).toBe(
      ErrorTypeEnum.UniqueConstraintViolation
    );

    expect(AppErrorBuilder.internal({}).errors![0].type).toBe(
      ErrorTypeEnum.InternalServerError
    );

    expect(AppErrorBuilder.notImplemented({}).errors![0].type).toBe(
      ErrorTypeEnum.ServiceUnavailable
    );

    expect(AppErrorBuilder.serviceUnavailable({}).errors![0].type).toBe(
      ErrorTypeEnum.ServiceUnavailable
    );

    expect(AppErrorBuilder.unknown({}).errors![0].type).toBe(
      ErrorTypeEnum.UnknownError
    );
  });

  it("FILE: src/core/util/app_validator.util *all at once", async () => {
    const rules: Record<string, ValidationOptions> = {
      zRequired: {},
      zTyped: { type: "array" },
      zShort: { minLen: 9 },
      zLong: { maxLen: 12 },
      zPatterned: { pattern: /^[A-Za-z0-9]+$/ },
      zSmall: { min: 21 },
      zBIg: { max: 45 },
      zEnum: { enum: ["red, green", "blue"] },
      zCustom: {
        custom: () => ({ type: ErrorTypeEnum.UnknownError, message: "..." }),
      },
    };

    const data: Record<string, any> = {
      zRequired: undefined,
      zTyped: "noAnArrayValue",
      zShort: "small",
      zLong: "a v e r y l a r g e s t r i g",
      zPatterned: "stringThatInclude😤🤯🥲😅😂😂😂😂",
      zSmall: 0,
      zBIg: 99,
      zEnum: "hexagon",
      zCustom: "hello",
    };

    const result = AppValidator(data, rules);

    result.forEach((error) => {
      if (error.type === ErrorTypeEnum.MissingField)
        expect(error.details?.keyValue).toHaveProperty("zRequired", undefined);
      else if (error.type === ErrorTypeEnum.InvalidDataType)
        expect(error.details?.keyValue).toHaveProperty(
          "zTyped",
          "noAnArrayValue"
        );
      else if (error.type === ErrorTypeEnum.ValueTooShort)
        expect(error.details?.keyValue).toHaveProperty("zShort", "small");
      else if (error.type === ErrorTypeEnum.ValueTooLong)
        expect(error.details?.keyValue).toHaveProperty(
          "zLong",
          "a v e r y l a r g e s t r i g"
        );
      else if (error.type === ErrorTypeEnum.PatternMismatch)
        expect(error.details?.keyValue).toHaveProperty(
          "zPatterned",
          "stringThatInclude😤🤯🥲😅😂😂😂😂"
        );
      else if (error.type === ErrorTypeEnum.MinValue)
        expect(error.details?.keyValue).toHaveProperty("zSmall", 0);
      else if (error.type === ErrorTypeEnum.MaxValue)
        expect(error.details?.keyValue).toHaveProperty("zBIg", 99);
      // WHY is this creating an error
      else if (error.type === ErrorTypeEnum.EnumMismatch) {
        expect(error.details?.keyValue).toHaveProperty("zEnum", "hexagon");
      } else if (error.type === ErrorTypeEnum.UnknownError)
        expect(error.details?.keyValue).toHaveProperty("zCustom", "hello");
    });
  });
});
// const a = [
//   {
//     type: "missingField",
//     details: {
//       keyValue: {},
//       message: "zRequired is required and was not provided",
//     },
//   },
//   {
//     type: "invalidDataType",
//     details: {
//       keyValue: { zTyped: "noAnArrayValue" },
//       message: "zTyped must a data type of array",
//     },
//   },
//   {
//     type: "valueTooShort",
//     details: {
//       keyValue: { zShort: "small" },
//       message: "zShort must be at least 9 characters long",
//     },
//   },
//   {
//     type: "valueTooLong",
//     details: {
//       keyValue: { zLong: "a v e r y l a r g e s t r i g" },
//       message: "zLong must be at most 12 characters long",
//     },
//   },
//   {
//     type: "patternMismatch",
//     details: {
//       keyValue: { zPatterned: "stringThatInclude😤🤯🥲😅😂😂😂😂" },
//       message: "zPatterrned must match the pattern /^[A-Za-z0-9]+$/",
//     },
//   },
//   {
//     type: "minValue",
//     details: { keyValue: { zSmall: 0 }, message: "zSmall must be at least 21" },
//   },
//   {
//     type: "maxValue",
//     details: { keyValue: { zBIg: 99 }, message: "zBIg must be at most 45" },
//   },
//   {
//     type: "enumMismatch",
//     details: {
//       keyValue: { zEnum: "hexagon" },
//       message: "zEnum must be one of red, green, blue",
//     },
//   },
//   {
//     type: "unknownError",
//     details: { keyValue: { zCustom: "hello" }, message: "..." },
//   },
// ];
