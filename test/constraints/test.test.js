import { createError, generateSchemaExpects } from "../testUtils";
import { INVALID_VALUE_ERROR } from "../../src/errors";

const { expectSchemaPasses, expectSchemaFails } = generateSchemaExpects(function(error) {
  let key = error.key || "";
  let expectedType = error.expectedType.hasOwnProperty("$name") ? error.expectedType.$name : error.expectedType;
  return createError(key, INVALID_VALUE_ERROR, error.value, expectedType);
});

xtest("", () => {});
