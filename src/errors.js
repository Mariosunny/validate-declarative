export const DUPLICATE_VALUE_ERROR = "DuplicateValueError";
export const INVALID_VALUE_ERROR = "InvalidValueError";
export const MISSING_PROPERTY_ERROR = "MissingPropertyError";
export const EXTRANEOUS_PROPERTY_ERROR = "ExtraneousPropertyError";

export function addError(report, errorType, key, value, expectedType) {
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

  report.errors.push(error);
}
