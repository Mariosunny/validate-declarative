import { createError, generateSchemaExpects } from "../testUtils";
import { DUPLICATE_VALUE_ERROR, INVALID_VALUE_ERROR, MISSING_PROPERTY_ERROR, list, int, string } from "../../src";

const { expectSchemaPasses, expectSchemaFails } = generateSchemaExpects();

const expectSchemaFailsInvalidType = generateSchemaExpects(function(error) {
  return createError(error.key, INVALID_VALUE_ERROR, error.value, error.expectedType);
}).expectSchemaFails;

test("test basic array functionality", () => {
  let schema = {
    a: {
      $element: {
        $type: int,
      },
    },
  };
  let data = {
    a: [1, 2, 3],
  };
  expectSchemaPasses(schema, data);

  data = {
    a: [],
  };
  expectSchemaPasses(schema, data);

  data = {
    a: 5,
  };
  expectSchemaFailsInvalidType(schema, data, { key: "a", value: 5, expectedType: list });

  data = {
    a: [1, 2, "3"],
  };
  expectSchemaFailsInvalidType(schema, data, { key: "a[2]", value: "3", expectedType: int });

  data = {
    a: [1, 2, "egg"],
  };
  expectSchemaFailsInvalidType(schema, data, { key: "a[2]", value: "egg", expectedType: int });
});

test("test array element uniqueness", () => {
  let schema = {
    a: {
      $element: {
        $type: int,
        $unique: true,
      },
    },
  };
  let data = {
    a: [1, 2, 3],
  };
  expectSchemaPasses(schema, data);

  schema = {
    a: {
      $element: {
        $type: int,
        $unique: true,
      },
    },
  };
  data = {
    a: [1, 2, 2],
  };
  expectSchemaFails(schema, data, { key: "a[2]", value: 2, error: DUPLICATE_VALUE_ERROR });
});

test("test optional array", () => {
  let schema = {
    a: {
      $optional: true,
      $element: {
        $type: int,
      },
    },
  };
  let data = {
    a: [1, 2, 3],
  };
  expectSchemaPasses(schema, data);

  data = {};
  expectSchemaPasses(schema, data);

  schema = {
    a: {
      $optional: false,
      $element: {
        $type: int,
      },
    },
  };
  data = {};
  expectSchemaFails(schema, data, { key: "a", error: MISSING_PROPERTY_ERROR });
});

test("test custom array element test function", () => {
  let schema = {
    a: {
      $element: {
        $test: element => /[a-z]/.test(element),
      },
    },
  };
  let data = {
    a: ["a", "b", "c"],
  };
  expectSchemaPasses(schema, data);

  data = {
    a: ["a", "b", "0"],
  };
  expectSchemaFailsInvalidType(schema, data, { key: "a[2]", value: "0" });
});

test("confirm optional element is noop", () => {
  let schema = {
    a: {
      $element: {
        $type: int,
        $optional: true,
      },
    },
  };
  let data = {
    a: [1, 2, 3],
  };
  expectSchemaPasses(schema, data);

  data = {
    a: [],
  };
  expectSchemaPasses(schema, data);

  schema = {
    a: {
      $element: {
        $type: int,
        $optional: false,
      },
    },
  };
  data = {
    a: [1, 2, 3],
  };
  expectSchemaPasses(schema, data);

  data = {
    a: [],
  };
  expectSchemaPasses(schema, data);
});

test("test $element inclusion does not override $type", () => {
  let schema = {
    a: {
      $type: int,
      $element: {
        $type: string,
      },
    },
  };
  let data = {
    a: ["a", "b", "c"],
  };
  expectSchemaFailsInvalidType(schema, data, { key: "a", value: ["a", "b", "c"], expectedType: int });

  data = {
    a: 5,
  };
  expectSchemaFailsInvalidType(schema, data, { key: "a", value: 5, expectedType: list });
});

test("test $test with array", () => {
  let schema = {
    a: {
      $test: object => object.length >= 2,
      $element: {
        $type: int,
      },
    },
  };
  let data = {
    a: [1, 2, 3],
  };
  expectSchemaPasses(schema, data);

  data = {
    a: [1],
  };
  expectSchemaFailsInvalidType(schema, data, { key: "a", value: [1] });
});

test("test multi-dimensional array", () => {
  let schema = {
    a: {
      $element: {
        $element: int,
      },
    },
  };
  let data = {
    a: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  };
  expectSchemaPasses(schema, data);

  data = {
    a: [1, 2, 3],
  };
  expectSchemaFailsInvalidType(schema, data, [
    { key: "a[0]", value: 1, expectedType: list },
    { key: "a[1]", value: 2, expectedType: list },
    { key: "a[2]", value: 3, expectedType: list },
  ]);

  schema = {
    a: {
      $element: {
        $element: {
          $element: int,
        },
      },
    },
  };
  data = {
    a: [[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[9, 10], [11, 12]]],
  };
  expectSchemaPasses(schema, data);

  data = {
    a: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  };
  expectSchemaFailsInvalidType(schema, data, [
    { key: "a[0][0]", value: 1, expectedType: list },
    { key: "a[0][1]", value: 2, expectedType: list },
    { key: "a[0][2]", value: 3, expectedType: list },
    { key: "a[1][0]", value: 4, expectedType: list },
    { key: "a[1][1]", value: 5, expectedType: list },
    { key: "a[1][2]", value: 6, expectedType: list },
    { key: "a[2][0]", value: 7, expectedType: list },
    { key: "a[2][1]", value: 8, expectedType: list },
    { key: "a[2][2]", value: 9, expectedType: list },
  ]);
});
