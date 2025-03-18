import { isDate } from "util/types";

export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;

  if (typeof value === "string") return value.trim().length === 0;

  if (Array.isArray(value)) return value.length === 0;

  if (typeof value === "object" && !isDate(value))
    return Object.keys(value).length === 0;

  return false;
};

export const excludeFields = (
  data: Record<string, any>,
  exclude: string[]
): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !exclude.includes(key))
  );
};

export const removeEmptyFields = (
  data: Record<string, any>
): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (!isEmpty(value)) result[key] = value;
  }

  return result;
};

export const getEmptyFields = (data: Record<string, any>): string[] => {
  const result: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (isEmpty(value)) result.push(key);
  }
  return result;
};

export const isValidUUID = (uuid: any): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return uuidRegex.test(uuid as string);
};
