import { DUPLICATE_PROPERTY_ERROR, MISSING_PROPERTY_ERROR } from "../../src/errors";
import { int } from "../../src/types";
import { createError, validateErrors } from "../testUtils";
import { verify } from "../../src/validate";

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

test("test optional constraint is ignored at top level of schema", () => {
  const requiredSchema1 = {
    $optional: true,
    a: {
      $optional: false,
      $type: int,
    },
  };

  expectSchemaFails(requiredSchema1, {}, "a");

  const requiredSchema2 = {
    $optional: false,
    a: {
      $optional: false,
      $type: int,
    },
  };

  expectSchemaFails(requiredSchema2, {}, "a");

  const optionalSchema1 = {
    $optional: false,
    a: {
      $optional: true,
      $type: int,
    },
  };

  expectSchemaPasses(optionalSchema1, {});

  const optionalSchema2 = {
    $optional: true,
    a: {
      $optional: true,
      $type: int,
    },
  };

  expectSchemaPasses(optionalSchema2, {});
});

test("test optional constraint is ignored inside $element object", () => {
  const requiredSchema1 = {
    $element: {
      $optional: true,
      a: {
        $optional: false,
        $type: int,
      },
    },
  };

  expectSchemaFails(requiredSchema1, [{}], "[0].a");

  const requiredSchema2 = {
    $element: {
      $optional: false,
      a: {
        $optional: false,
        $type: int,
      },
    },
  };

  expectSchemaFails(requiredSchema2, [{}], "[0].a");

  const optionalSchema1 = {
    $element: {
      $optional: false,
      a: {
        $optional: true,
        $type: int,
      },
    },
  };

  expectSchemaPasses(optionalSchema1, [{}]);

  const optionalSchema2 = {
    $element: {
      $optional: true,
      a: {
        $optional: true,
        $type: int,
      },
    },
  };

  expectSchemaPasses(optionalSchema2, [{}]);
});

test(`test non-optional constraint generates ${MISSING_PROPERTY_ERROR}`, () => {
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

test("ensure truthy values for optional constraint are coerced to true", () => {
  let truthyValues = [5.5, 5, Infinity, -Infinity, {}, "hello", new Date(), Symbol(), function() {}, /\w+/, []];

  truthyValues.forEach(function(value) {
    let schema = {
      a: {
        $optional: value,
        $type: int,
      },
    };

    expectSchemaPasses(schema, {});
  });
});

test("ensure falsy values for optional constraint are coerced to false", () => {
  let falsyValues = [0, "", null, undefined, NaN];

  falsyValues.forEach(function(value) {
    let schema = {
      a: {
        $optional: value,
        $type: int,
      },
    };

    expectSchemaFails(schema, {}, "a");
  });
});

test(`test optional constraint does not generate ${MISSING_PROPERTY_ERROR} for simple object`, () => {
  const schema = {
    a: {
      $type: int,
      $optional: true,
    },
  };
  expectSchemaPasses(schema, {});
  expectSchemaPasses(schema, { a: 5 });
});

test(`test optional constraint does not generate ${MISSING_PROPERTY_ERROR} for deeply nested object`, () => {
  const schema = {
    a: {
      b: {
        c: {
          d: {
            $type: int,
            $optional: true,
          },
        },
      },
    },
  };

  let data1 = {
    a: {
      b: {
        c: {},
      },
    },
  };

  let data2 = {
    a: {
      b: {
        c: {
          d: 5,
        },
      },
    },
  };

  expectSchemaPasses(schema, data1);
  expectSchemaPasses(schema, data2);
});
