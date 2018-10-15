import { resetSchema, verify } from "../src/validate";
import { int, string, nullValue, boolean } from "../src/types";
import { $META, $ROOT } from "../src/keys";
import { DUPLICATE_PROPERTY_ERROR } from "../src/errors";
import _ from "lodash";

test(`test non-unique constraint does not generate ${DUPLICATE_PROPERTY_ERROR}`, () => {
  const schema = {
    a: int
  };
  let data = {
    a: 5
  };
  expect(verify(schema, data)).toBe(true);

  schema.a = {
    $type: int,
    $unique: false
  };

  expect(verify(schema, data)).toBe(true);
});

test("test non-unique constraint does not create uniqueValues arrays when $unique = false or when $unique is not present", () => {
  const schema1 = {
    a: {
      $type: int,
      $unique: false
    }
  };
  const schema2 = {
    a: int
  };
  let data = {
    a: 5
  };

  verify(schema1, data);
  verify(schema2, data);
  expect(Object.keys(schema1[$META].uniqueValues).length).toBe(0);
});

test("ensure duplicate values fail when $unique = true for simple object", () => {
  const schema1 = {
    a: {
      $type: int,
      $unique: true
    }
  };
  let data = {
    a: 5
  };
  expect(verify(schema1, data)).toBe(true);
  expect(verify(schema1, data)).toBe(false);
});

test("ensure duplicate values fail when $unique = true at top level of schema", () => {
  const schema = {
    $unique: true,
    $type: int
  };
  expect(verify(schema, 5)).toBe(true);
  expect(verify(schema, 5)).toBe(false);
  expect(verify(schema, 6)).toBe(true);
  expect(verify(schema, 6)).toBe(false);
});

test(`ensure multiple $meta.uniqueValues arrays are being created`, () => {
  for (let i = 1; i <= 10; i++) {
    let schema = {};

    for (let j = 0; j < i; j++) {
      schema[String.fromCharCode(97 + j)] = {
        $type: string,
        $unique: true
      };
    }

    verify(schema, {});
    expect(Object.keys(schema[$META].uniqueValues).length).toBe(i);
  }
});

test(`ensure $meta.uniqueValues array is created for deeply nested object`, () => {
  const schema = {
    a: {
      b: {
        c: {
          d: {
            $type: int,
            $unique: true
          }
        }
      }
    }
  };

  verify(schema, { a: { b: { c: { d: 5 } } } });
  expect(schema[$META].uniqueValues["a.b.c.d"]).toEqual([5]);
});

test(`ensure $meta.uniqueValues array is created for array`, () => {
  const simpleArraySchema = {
    $element: {
      $unique: true,
      $type: int
    }
  };
  const multiDimensionalArraySchema = {
    $element: {
      $element: {
        $element: {
          $unique: true,
          $type: int
        }
      }
    }
  };

  verify(simpleArraySchema, [1, 2, 3]);
  expect(simpleArraySchema[$META].uniqueValues["[x]"]).toEqual([1, 2, 3]);

  verify(multiDimensionalArraySchema, [[[1]]]);
  expect(multiDimensionalArraySchema[$META].uniqueValues["[x][x][x]"]).toEqual([
    1
  ]);
});

test(`ensure values in data are being added to $meta.uniqueValues each validation for simple object`, () => {
  const schema = {
    a: {
      $type: int,
      $unique: true
    }
  };

  let uniqueValues = [];

  for (let i = 0; i < 100; i++) {
    verify(schema, { a: i });
    uniqueValues.push(i);
    expect(schema[$META].uniqueValues["a"]).toEqual(uniqueValues);
  }
});

test(`ensure $meta.uniqueValues arrays do not contain duplicates`, () => {
  const schema = {
    a: {
      $type: int,
      $unique: true
    },
    b: {
      $type: string,
      $unique: true
    },
    c: {
      $type: nullValue,
      $unique: true
    }
  };
  let data = {
    a: 5,
    b: "hello",
    c: null
  };

  for (let i = 0; i < 10; i++) {
    verify(schema, data);
    expect(schema[$META].uniqueValues["a"]).toEqual([5]);
    expect(schema[$META].uniqueValues["b"]).toEqual(["hello"]);
    expect(schema[$META].uniqueValues["c"]).toEqual([null]);
  }
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
                $unique: true
              }
            }
          }
        }
      }
    }
  };

  let data1 = {
    a: { b: { c: { d: { e: { f: true } } } } }
  };
  let data2 = {
    a: { b: { c: { d: { e: { f: false } } } } }
  };

  expect(verify(schema, data1)).toBe(true);
  expect(verify(schema, data1)).toBe(false);
  expect(verify(schema, data2)).toBe(true);
  expect(verify(schema, data2)).toBe(false);
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
                $unique: true
              }
            }
          }
        }
      }
    }
  };

  let uniqueValues = [];

  for (let i = 0; i < 100; i++) {
    verify(schema, {
      a: { b: { c: { d: { e: { f: i } } } } }
    });
    uniqueValues.push(i);
    expect(schema[$META].uniqueValues["a.b.c.d.e.f"]).toEqual(uniqueValues);
  }
});

xtest(`ensure values in data are being added to $meta.uniqueValues each validation for arrays`, () => {
  const schema1 = {
    $element: {
      $type: int,
      $unique: true
    }
  };

  expect(verify(_.cloneDeep(schema1), [1, 2, 3])).toBe(true);
  expect(verify(_.cloneDeep(schema1), [1, 1, 3])).toBe(false);

  const schema2 = {
    $unique: true,
    $element: int
  };

  expect(verify(schema2, [1, 2, 3])).toBe(true);
  expect(verify(schema2, [1, 2, 2])).toBe(true);
  expect(verify(schema2, [1, 2, 3])).toBe(false);
});

test("ensure resetSchema() resets uniqueValues", () => {
  const schema1 = {
    $unique: true,
    $type: int
  };

  expect(verify(schema1, 5)).toBe(true);
  expect(verify(schema1, 5)).toBe(false);
  resetSchema(schema1);
  expect(verify(schema1, 5)).toBe(true);
  expect(verify(schema1, 5)).toBe(false);

  const schema2 = {
    a: {
      $unique: true,
      $type: int
    }
  };

  expect(verify(schema2, { a: 5 })).toBe(true);
  expect(verify(schema2, { a: 5 })).toBe(false);
  resetSchema(schema2);
  expect(verify(schema2, { a: 5 })).toBe(true);
  expect(verify(schema2, { a: 5 })).toBe(false);
});
