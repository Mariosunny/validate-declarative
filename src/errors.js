import util from "util";
import { THROW_ON_ERROR } from "./options";

export const DUPLICATE_VALUE_ERROR = "DuplicateValueError";
export const INVALID_VALUE_ERROR = "InvalidValueError";
export const MISSING_PROPERTY_ERROR = "MissingPropertyError";
export const EXTRANEOUS_PROPERTY_ERROR = "ExtraneousPropertyError";

export function addError(report, options, errorType, key, value, expectedType) {
  let error = {
    error: errorType,
    key: key,
  };

  if (value) {
    error.value = value;
  }
  if (expectedType) {
    error.expectedType = expectedType;
  }

  if (options[THROW_ON_ERROR]) {
    throwError(report, error);
  }

  report.errors.push(error);
}

function throwError(report, error) {
  let message = `${error.error}: key: ${error.key}`;

  if (error.value) {
    message += `, value: ${error.value}`;
  }

  if (error.expectedType) {
    message += `, expectedType: ${error.expectedType}`;
  }

  message += `\ndata: ${util.inspect(report.data)}`;
  message += `\nschema: ${util.inspect(report.schema, { depth: Infinity })}`;

  throw new Error(message);
}
