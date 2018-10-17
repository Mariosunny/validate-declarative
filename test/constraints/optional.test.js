import { DUPLICATE_PROPERTY_ERROR, MISSING_PROPERTY_ERROR } from "../../src/errors";
import { int } from "../../src/types";
import { createError, validateErrors } from "../testUtils";

const { expectSchemaPasses, expectSchemaFails } = (() => {
  const expectSchema = function(schema, data, missingProperties = []) {
    if (!Array.isArray(missingProperties)) {
      missingProperties = [missingProperties];
    }
    validateErrors(
      schema,
      data,
      missingProperties.map(property => {
        return createError(property || "", MISSING_PROPERTY_ERROR);
      })
    );
  };

  return {
    expectSchemaPasses(schema, data) {
      expectSchema(schema, data);
    },
    expectSchemaFails(schema, data, missingProperties) {
      expectSchema(schema, data, missingProperties);
    },
  };
})();

test(`test optional constraint generates ${MISSING_PROPERTY_ERROR}`, () => {
  const schema = {
    a: int,
  };
  let data = {};
  expectSchemaFails(schema, data, "a");

  schema.a = {
    $type: int,
    $optional: false,
  };
  expectSchemaFails(schema, data, "a");
});
