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

export function validateErrors(schema, data, expectedErrors, options = {}) {
  let receivedErrors = validate(schema, data, options).errors;

  expect(receivedErrors.length).toBe(expectedErrors.length);

  expectedErrors.forEach(expectedError => {
    expect(receivedErrors).toContainEqual(expectedError);
  });
}

function expectSchema(schema, data, errorMapping, errors = [], options = {}) {
  if (!Array.isArray(errors)) {
    errors = [errors];
  }
  validateErrors(schema, data, errors.map(errorMapping), options);
}

export function generateSchemaExpects(
  errorMapping = function(error) {
    return createError(error.key, error.error, error.value, error.expectedType);
  }
) {
  return {
    expectSchemaPasses(schema, data, options) {
      expectSchema(schema, data, errorMapping, undefined, options);
    },
    expectSchemaFails(schema, data, errors, options) {
      expectSchema(schema, data, errorMapping, errors, options);
    },
    expectSchemaThrows(schema, data, options) {
      expect(() => verify(schema, data, options)).toThrow();
    },
    expectSchemaNotThrows(schema, data, options) {
      expect(() => verify(schema, data, options)).not.toThrow();
    },
  };
}
