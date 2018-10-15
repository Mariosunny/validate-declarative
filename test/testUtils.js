import { validate } from "../src";
import _ from "lodash";

export function createError(path, errorType, value, expectedType) {
  let error = {
    error: errorType,
    key: path,
  };
  if (value) {
    error.value = value;
  }
  if (expectedType) {
    error.expectedType = expectedType;
  }
  return error;
}

export function validateErrors(schema, data, expectedErrors) {
  let receivedErrors = validate(schema, data);

  expectedErrors = expectedErrors.map(function(error) {
    return _.merge(error, { data });
  });

  expect(receivedErrors.length).toBe(expectedErrors.length);

  receivedErrors.forEach(receivedError => {
    expect(expectedErrors).toContainEqual(receivedError);
  });
}
