import { verify, validate } from "../src/validate";

export function createError(path, errorType, value, expectedType) {
  let error = {
    error: errorType,
    key: path || "",
  };
  if (value) {
    error.value = value;
  }
  if (expectedType) {
    error.expectedType = expectedType.hasOwnProperty("$name") ? expectedType.$name : expectedType;
  }
  return error;
}

export function validateErrors(schema, data, expectedErrors) {
  let receivedErrors = validate(schema, data).errors;

  expect(receivedErrors.length).toBe(expectedErrors.length);

  expectedErrors.forEach(expectedError => {
    expect(receivedErrors).toContainEqual(expectedError);
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
    expectSchemaThrows(schema, data, allowExtraneous) {
      expect(() => verify(schema, data, allowExtraneous)).toThrow();
    },
  };
}
