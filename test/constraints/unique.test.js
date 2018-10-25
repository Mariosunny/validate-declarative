import { verify } from "../../src/validate";
import { int, string, nullValue, boolean, truthy } from "../../src/types";
import { $META, $ROOT } from "../../src/keys";
import { DUPLICATE_VALUE_ERROR } from "../../src/errors";
import _ from "lodash";
import { createError, generateSchemaExpects, validateErrors } from "../testUtils";
import { resetSchema } from "../../src/meta";

const { expectSchemaPasses, expectSchemaFails } = generateSchemaExpects(function(error) {
  return createError(error.key, DUPLICATE_VALUE_ERROR, error.value);
});

function expectNumberOfUniqueValues(schema, expectedNumberOfUniqueValues) {
  expect(
    Object.keys(schema[$META].uniqueValues).length + Object.getOwnPropertySymbols(schema[$META].uniqueValues).length
  ).toBe(expectedNumberOfUniqueValues);
}

function expectUniqueValues(schema, key, expectedValues) {
  key = key || $ROOT;
  let values = [];

  if (schema[$META].uniqueValues[key]) {
    values = schema[$META].uniqueValues[key];
  }

  expect(values).toEqual(expectedValues);
}

test(`test non-unique constraint does not generate ${DUPLICATE_VALUE_ERROR}`, () => {
  const schema = {
    a: int,
  };
  let data = {
    a: 5,
  };
  expectSchemaPasses(schema, data);

  schema.a = {
    $type: int,
    $unique: false,
  };
  expectSchemaPasses(schema, data);
});

test("ensure truthy values for unique constraint are coerced to true", () => {
  let truthyValues = [5.5, 5, Infinity, -Infinity, {}, "hello", new Date(), Symbol(), function() {}, /\w+/, []];

  truthyValues.forEach(function(value) {
    let schema = {
      $unique: value,
      $type: int,
    };

    expectSchemaPasses(schema, 5);
    expectSchemaFails(schema, 5, { value: 5 });
  });
});

test("ensure falsy values for unique constraint are coerced to false", () => {
  let falsyValues = [0, "", null, undefined, NaN];

  falsyValues.forEach(function(value) {
    let schema = {
      $unique: value,
      $type: int,
    };

    expectSchemaPasses(schema, 5);
    expectSchemaPasses(schema, 5);
  });
});

test("test non-unique constraint does not create uniqueValues arrays when $unique = false or when $unique is not present", () => {
  const schema1 = {
    a: {
      $type: int,
      $unique: false,
    },
  };
  const schema2 = {
    a: int,
  };
  let data = {
    a: 5,
  };

  verify(schema1, data);
  verify(schema2, data);
  expectNumberOfUniqueValues(schema1, 0);
  expectNumberOfUniqueValues(schema2, 0);
});

test("ensure duplicate values fail when $unique = true for simple object", () => {
  const schema = {
    a: {
      $type: int,
      $unique: true,
    },
  };
  let data = {
    a: 5,
  };
  expectSchemaPasses(schema, data);
  expectSchemaFails(schema, data, { key: "a", value: 5 });
  expectNumberOfUniqueValues(schema, 1);
});

test("ensure duplicate values fail when $unique = true at top level of schema", () => {
  const schema = {
    $unique: true,
    $type: int,
  };
  expectSchemaPasses(schema, 5);
  expectSchemaFails(schema, 5, { value: 5 });
  expectSchemaPasses(schema, 6);
  expectSchemaFails(schema, 6, { value: 6 });
  expectNumberOfUniqueValues(schema, 1);
});

test(`ensure multiple $meta.uniqueValues arrays are being created`, () => {
  for (let i = 1; i <= 10; i++) {
    let schema = {};

    for (let j = 0; j < i; j++) {
      schema[String.fromCharCode(97 + j)] = {
        $type: string,
        $unique: true,
      };
    }

    verify(schema, {});
    expectNumberOfUniqueValues(schema, i);
  }
});

test(`ensure $meta.uniqueValues array is created for deeply nested object`, () => {
  const schema = {
    a: {
      b: {
        c: {
          d: {
            $type: int,
            $unique: true,
          },
        },
      },
    },
  };

  verify(schema, { a: { b: { c: { d: 5 } } } });
  expectUniqueValues(schema, "a.b.c.d", [5]);
});

test(`ensure $meta.uniqueValues array is created for array`, () => {
  const simpleArraySchema = {
    $element: {
      $unique: true,
      $type: int,
    },
  };
  const multiDimensionalArraySchema = {
    $element: {
      $element: {
        $element: {
          $unique: true,
          $type: int,
        },
      },
    },
  };

  verify(simpleArraySchema, [1, 2, 3]);
  expectUniqueValues(simpleArraySchema, "[x]", [1, 2, 3]);
  expectNumberOfUniqueValues(simpleArraySchema, 1);

  verify(multiDimensionalArraySchema, [[[1]]]);
  expectUniqueValues(multiDimensionalArraySchema, "[x][x][x]", [1]);
  expectNumberOfUniqueValues(multiDimensionalArraySchema, 1);
});

test(`ensure values in data are being added to $meta.uniqueValues each validation for simple object`, () => {
  const schema = {
    a: {
      $type: int,
      $unique: true,
    },
  };

  let uniqueValues = [];

  for (let i = 0; i < 100; i++) {
    verify(schema, { a: i });
    uniqueValues.push(i);
    expectUniqueValues(schema, "a", uniqueValues);
  }
  expectNumberOfUniqueValues(schema, 1);
});

test(`ensure $meta.uniqueValues arrays do not contain duplicates`, () => {
  const schema = {
    a: {
      $type: int,
      $unique: true,
    },
    b: {
      $type: string,
      $unique: true,
    },
    c: {
      $type: nullValue,
      $unique: true,
    },
  };
  let data = {
    a: 5,
    b: "hello",
    c: null,
  };

  for (let i = 0; i < 10; i++) {
    verify(schema, data);
    expectUniqueValues(schema, "a", [5]);
    expectUniqueValues(schema, "b", ["hello"]);
    expectUniqueValues(schema, "c", [null]);
  }
  expectNumberOfUniqueValues(schema, 3);
});

test("ensure duplicate values fail when $unique = true for deeply nested objects", () => {
  const schema = {
    a: {
      b: {
        c: {
          d: {
            e: {
              f: {
                $type: boolean,
                $unique: true,
              },
            },
          },
        },
      },
    },
  };

  let data1 = {
    a: { b: { c: { d: { e: { f: true } } } } },
  };
  let data2 = {
    a: { b: { c: { d: { e: { f: false } } } } },
  };

  expectSchemaPasses(schema, data1);
  expectSchemaFails(schema, data1, { key: "a.b.c.d.e.f", value: true });
  expectSchemaPasses(schema, data2);
  expectSchemaFails(schema, data2, { key: "a.b.c.d.e.f", value: false });
  expectNumberOfUniqueValues(schema, 1);
});

test(`ensure values in data are being added to $meta.uniqueValues each validation for deeply nested objects`, () => {
  const schema = {
    a: {
      b: {
        c: {
          d: {
            e: {
              f: {
                $type: int,
                $unique: true,
              },
            },
          },
        },
      },
    },
  };

  let uniqueValues = [];

  for (let i = 0; i < 100; i++) {
    verify(schema, {
      a: { b: { c: { d: { e: { f: i } } } } },
    });
    uniqueValues.push(i);
    expectUniqueValues(schema, "a.b.c.d.e.f", uniqueValues);
  }
  expectNumberOfUniqueValues(schema, 1);
});

test(`ensure $unique works even when $element is present at the same level`, () => {
  const schema = {
    $unique: true,
    $element: int,
  };

  expectSchemaPasses(schema, [1, 2, 3]);
  expectSchemaPasses(schema, [1, 2, 2]);
  expectSchemaFails(schema, [1, 2, 3], { value: [1, 2, 3] });
  expectNumberOfUniqueValues(schema, 1);
});

test(`ensure values in data are being added to $meta.uniqueValues each validation for arrays`, () => {
  const schema = {
    $element: {
      $type: int,
      $unique: true,
    },
  };

  const temp = _.cloneDeep(schema);
  verify(temp, null);
  expectNumberOfUniqueValues(temp, 1);

  expectSchemaPasses(_.cloneDeep(schema), [1, 2, 3]);
  expectSchemaFails(_.cloneDeep(schema), [1, 1, 3], { key: "[1]", value: 1 });
});

test(`ensure values in data are being added to $meta.uniqueValues each validation for multi-dimensional arrays`, () => {
  const schema = {
    $element: {
      $element: {
        $element: {
          $type: int,
          $unique: true,
        },
      },
    },
  };

  const temp = _.cloneDeep(schema);
  verify(temp, null);
  expectNumberOfUniqueValues(temp, 1);

  const schema1 = _.cloneDeep(schema);
  expectSchemaPasses(schema1, [[[1]]]);
  expectSchemaFails(schema1, [[[1]]], { key: "[0][0][0]", value: 1 });
  expectUniqueValues(schema1, "[x][x][x]", [1]);
  expectSchemaPasses(schema1, [[[2]]]);
  expectUniqueValues(schema1, "[x][x][x]", [1, 2]);

  const schema2 = _.cloneDeep(schema);
  expectSchemaPasses(schema2, [[[]]]);
  expectUniqueValues(schema2, "[x][x][x]", []);
});

test("ensure values in data are being added to $meta.uniqueValues each validation for complex objects (array)", () => {
  const schema = {
    a: {
      $element: {
        b: {
          c: {
            $element: {
              $type: int,
              $unique: true,
            },
          },
        },
      },
    },
  };

  const key = "a[x].b.c[x]";

  let data1 = {
    a: [
      {
        b: {
          c: [1, 2, 3],
        },
      },
    ],
  };

  const temp = _.cloneDeep(schema);
  verify(temp, null);
  expectNumberOfUniqueValues(temp, 1);
  expectUniqueValues(temp, key, []);

  let schema1 = _.cloneDeep(schema);
  expectSchemaPasses(schema1, data1);
  expectUniqueValues(schema1, key, [1, 2, 3]);

  let data2 = {
    a: [
      {
        b: {
          c: [1, 2, 1],
        },
      },
    ],
  };

  let schema2 = _.cloneDeep(schema);
  expectSchemaFails(schema2, data2, { key: "a[0].b.c[2]", value: 1 });
  expectUniqueValues(schema2, key, [1, 2]);

  let data3 = {
    a: [
      {
        b: {
          c: [1, 2],
        },
      },
    ],
  };

  let data4 = {
    a: [
      {
        b: {
          c: [2, 3],
        },
      },
    ],
  };

  let schema3 = _.cloneDeep(schema);
  expectSchemaPasses(schema3, data3);
  expectUniqueValues(schema3, key, [1, 2]);
  expectSchemaFails(schema3, data4, { key: "a[0].b.c[0]", value: 2 });
  expectUniqueValues(schema3, key, [1, 2, 3]);

  let data5 = {
    a: [
      {
        b: {
          c: [1, 2],
        },
      },
    ],
  };

  let data6 = {
    a: [
      {
        b: {
          c: [3, 4],
        },
      },
    ],
  };

  let schema4 = _.cloneDeep(schema);
  expectSchemaPasses(schema4, data5);
  expectUniqueValues(schema4, key, [1, 2]);
  expectSchemaPasses(schema4, data6);
  expectUniqueValues(schema4, key, [1, 2, 3, 4]);
});

test("ensure values in data are being added to $meta.uniqueValues each validation for complex objects (object)", () => {
  const schema = {
    a: {
      $element: {
        b: {
          c: {
            $element: {
              d: {
                $type: int,
                $unique: true,
              },
            },
          },
        },
      },
    },
  };

  const key = "a[x].b.c[x].d";

  let data1 = {
    a: [
      {
        b: {
          c: [
            {
              d: 5,
            },
          ],
        },
      },
    ],
  };

  const temp = _.cloneDeep(schema);
  verify(temp, null);
  expectNumberOfUniqueValues(temp, 1);
  expectUniqueValues(temp, key, []);

  let schema1 = _.cloneDeep(schema);
  expectSchemaPasses(schema1, data1);
  expectUniqueValues(schema1, key, [5]);
  expectSchemaFails(schema1, data1, { key: "a[0].b.c[0].d", value: 5 });
  expectUniqueValues(schema1, key, [5]);

  let data2 = {
    a: [
      {
        b: {
          c: [
            {
              d: 6,
            },
          ],
        },
      },
    ],
  };

  let schema2 = _.cloneDeep(schema);
  expectSchemaPasses(schema2, data1);
  expectUniqueValues(schema2, key, [5]);
  expectSchemaPasses(schema2, data2);
  expectUniqueValues(schema2, key, [5, 6]);
  expectSchemaFails(schema2, data2, { key: "a[0].b.c[0].d", value: 6 });
  expectUniqueValues(schema2, key, [5, 6]);
});

test("ensure nested $unique in ordinary properties is ignored", () => {
  const schema1 = {
    $unique: true,
    a: {
      $unique: true,
      $type: int,
    },
  };

  expectSchemaPasses(schema1, { a: 5 });
  expectSchemaFails(schema1, { a: 5 }, { value: { a: 5 } });
  expectNumberOfUniqueValues(schema1, 1);
  expectUniqueValues(schema1, "a", []);
  expectUniqueValues(schema1, "", [{ a: 5 }]);

  const schema2 = {
    $unique: false,
    a: {
      $unique: true,
      $type: int,
    },
  };

  expectSchemaPasses(schema2, { a: 5 });
  expectSchemaPasses(schema2, { a: 5 });
  expectNumberOfUniqueValues(schema2, 0);
  expectUniqueValues(schema2, "a", []);
  expectUniqueValues(schema2, "", []);
});

test("ensure deep $unique is not ignored", () => {
  const shallowSchema = {
    $type: {
      $unique: true,
      $type: int,
    },
  };

  expectSchemaPasses(shallowSchema, 5);
  expectSchemaFails(shallowSchema, 5, { value: 5 });
  expectSchemaPasses(shallowSchema, 6);
  expectNumberOfUniqueValues(shallowSchema, 1);

  const deepSchema = {
    $type: {
      $type: {
        $type: {
          $type: {
            $type: {
              $unique: true,
              $type: int,
            },
          },
        },
      },
    },
  };

  expectSchemaPasses(deepSchema, 5);
  expectSchemaFails(deepSchema, 5, { value: 5 });
  expectSchemaPasses(deepSchema, 6);
  expectNumberOfUniqueValues(deepSchema, 1);
});

test("ensure only shallowest $unique in the $type chain is considered", () => {
  const uniqueSchema1 = {
    $unique: true,
    $type: {
      $unique: false,
      $type: int,
    },
  };
  expectSchemaPasses(uniqueSchema1, 5);
  expectSchemaFails(uniqueSchema1, 5, { value: 5 });
  expectSchemaPasses(uniqueSchema1, 6);
  expectNumberOfUniqueValues(uniqueSchema1, 1);

  const uniqueSchema2 = {
    $type: {
      $unique: true,
      $type: {
        $unique: false,
        $type: int,
      },
    },
  };
  expectSchemaPasses(uniqueSchema2, 5);
  expectSchemaFails(uniqueSchema2, 5, { value: 5 });
  expectSchemaPasses(uniqueSchema2, 6);
  expectNumberOfUniqueValues(uniqueSchema2, 1);

  const nonUniqueSchema1 = {
    $unique: false,
    $type: {
      $unique: true,
      $type: int,
    },
  };
  expectSchemaPasses(nonUniqueSchema1, 5);
  expectSchemaPasses(nonUniqueSchema1, 5);
  expectSchemaPasses(nonUniqueSchema1, 6);
  expectNumberOfUniqueValues(nonUniqueSchema1, 0);

  const nonUniqueSchema2 = {
    $type: {
      $unique: false,
      $type: {
        $unique: true,
        $type: int,
      },
    },
  };
  expectSchemaPasses(nonUniqueSchema2, 5);
  expectSchemaPasses(nonUniqueSchema2, 5);
  expectSchemaPasses(nonUniqueSchema2, 6);
  expectNumberOfUniqueValues(nonUniqueSchema2, 0);
});

test("ensure resetSchema() resets uniqueValues", () => {
  const schema1 = {
    $unique: true,
    $type: int,
  };

  expectSchemaPasses(schema1, 5);
  expectSchemaFails(schema1, 5, { value: 5 });
  expectNumberOfUniqueValues(schema1, 1);
  resetSchema(schema1);
  expectNumberOfUniqueValues(schema1, 1);
  expectSchemaPasses(schema1, 5);
  expectSchemaFails(schema1, 5, { value: 5 });

  const schema2 = {
    a: {
      $unique: true,
      $type: int,
    },
  };

  expectSchemaPasses(schema2, { a: 5 });
  expectSchemaFails(schema2, { a: 5 }, { key: "a", value: 5 });
  expectNumberOfUniqueValues(schema2, 1);
  resetSchema(schema2);
  expectNumberOfUniqueValues(schema2, 1);
  expectSchemaPasses(schema2, { a: 5 });
  expectSchemaFails(schema2, { a: 5 }, { key: "a", value: 5 });

  const schema3 = {
    a: {
      $unique: true,
      $type: int,
    },
    b: {
      $unique: true,
      $type: string,
    },
    c: {
      $unique: true,
      $type: int,
    },
  };

  expectSchemaPasses(schema3, { a: 1, b: "1", c: 1 });
  expectSchemaFails(schema3, { a: 1, b: "2", c: 2 }, { key: "a", value: 1 });
  expectNumberOfUniqueValues(schema3, 3);
  resetSchema(schema3);
  expectNumberOfUniqueValues(schema3, 3);
  expectSchemaPasses(schema3, { a: 1, b: "1", c: 1 });
  expectSchemaFails(schema3, { a: 1, b: "2", c: 2 }, { key: "a", value: 1 });
});

test(`test multiple ${DUPLICATE_VALUE_ERROR}s`, () => {
  const schema = {};
  let data = {};
  let errors = [];

  for (let i = 0; i < 20; i++) {
    schema[i] = {
      $unique: true,
      $type: int,
    };
    data[i] = i;
    errors.push({
      key: i + "",
      value: i,
    });
  }

  expectSchemaPasses(schema, data);
  expectSchemaFails(schema, data, errors);
});

test(`test multiple ${DUPLICATE_VALUE_ERROR}s on complex object`, () => {
  const schema1 = {
    a: {
      $element: {
        e: {
          $unique: true,
          $type: truthy,
        },
      },
    },
    b: {
      c: {
        $type: int,
        $unique: true,
      },
    },
    d: {
      $unique: true,
      $element: boolean,
    },
  };

  let data1 = {
    a: [
      {
        e: 5,
      },
      {
        e: 5,
      },
    ],
    b: { c: 5 },
    d: [true, false],
  };

  let data2 = {
    a: [
      {
        e: 5,
      },
      {
        e: [],
      },
    ],
    b: { c: 5 },
    d: [true, false],
  };

  expectSchemaFails(schema1, data1, { key: "a[1].e", value: 5 });
  expectSchemaFails(schema1, data2, [
    {
      key: "a[0].e",
      value: 5,
    },
    {
      key: "b.c",
      value: 5,
    },
    {
      key: "d",
      value: [true, false],
    },
  ]);
});
