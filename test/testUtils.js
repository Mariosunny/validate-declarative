import { validate } from "../src";
import _ from "lodash";
import { DUPLICATE_PROPERTY_ERROR } from "../src/errors";

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

function expectSchema(schema, data, errorMapping, errors = []) {
  if (!Array.isArray(errors)) {
    errors = [errors];
  }
  validateErrors(schema, data, errors.map(errorMapping));
}

export function generateSchemaExpects(errorMapping) {
  return {
    expectSchemaPasses(schema, data) {
      expectSchema(schema, data, errorMapping);
    },
    expectSchemaFails(schema, data, errors) {
      expectSchema(schema, data, errorMapping, errors);
    },
  };
}
