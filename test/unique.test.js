import { resetSchema, validate, verify } from "../src/validate";
import { int, string, nullValue, boolean } from "../src/types";
import { $META, $ROOT } from "../src/keys";
import { DUPLICATE_PROPERTY_ERROR } from "../src/errors";
import _ from "lodash";

function getNumberOfUniqueValues(schema) {
  return (
    Object.keys(schema[$META].uniqueValues).length + Object.getOwnPropertySymbols(schema[$META].uniqueValues).length
  );
}

function getUniqueValues(schema, key) {
  key = key || $ROOT;

  if (schema[$META].uniqueValues[key]) {
    return schema[$META].uniqueValues[key];
  }
  return [];
}

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
  expect(getNumberOfUniqueValues(schema1)).toBe(0);
  expect(getNumberOfUniqueValues(schema2)).toBe(0);
});

test("ensure duplicate values fail when $unique = true for simple object", () => {
  const schema = {
    a: {
      $type: int,
      $unique: true
    }
  };
  let data = {
    a: 5
  };
  expect(verify(schema, data)).toBe(true);
  expect(verify(schema, data)).toBe(false);
  expect(getNumberOfUniqueValues(schema)).toBe(1);
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
  expect(getNumberOfUniqueValues(schema)).toBe(1);
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
    expect(getNumberOfUniqueValues(schema)).toBe(i);
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
  expect(getUniqueValues(schema, "a.b.c.d")).toEqual([5]);
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
  expect(getUniqueValues(simpleArraySchema, "[x]")).toEqual([1, 2, 3]);
  expect(getNumberOfUniqueValues(simpleArraySchema)).toBe(1);

  verify(multiDimensionalArraySchema, [[[1]]]);
  expect(getUniqueValues(multiDimensionalArraySchema, "[x][x][x]")).toEqual([1]);
  expect(getNumberOfUniqueValues(multiDimensionalArraySchema)).toBe(1);
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
    expect(getUniqueValues(schema, "a")).toEqual(uniqueValues);
  }
  expect(getNumberOfUniqueValues(schema)).toBe(1);
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
    expect(getUniqueValues(schema, "a")).toEqual([5]);
    expect(getUniqueValues(schema, "b")).toEqual(["hello"]);
    expect(getUniqueValues(schema, "c")).toEqual([null]);
  }
  expect(getNumberOfUniqueValues(schema)).toBe(3);
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
  expect(getNumberOfUniqueValues(schema)).toBe(1);
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
    expect(getUniqueValues(schema, "a.b.c.d.e.f")).toEqual(uniqueValues);
  }
  expect(getNumberOfUniqueValues(schema)).toBe(1);
});

test(`ensure $unique works even when $element is present at the same level`, () => {
  const schema = {
    $unique: true,
    $element: int
  };

  expect(verify(schema, [1, 2, 3])).toBe(true);
  expect(verify(schema, [1, 2, 2])).toBe(true);
  expect(verify(schema, [1, 2, 3])).toBe(false);
  expect(getNumberOfUniqueValues(schema)).toBe(1);
});

test(`ensure values in data are being added to $meta.uniqueValues each validation for arrays`, () => {
  const schema = {
    $element: {
      $type: int,
      $unique: true
    }
  };

  const temp = _.cloneDeep(schema);
  verify(temp, null);
  expect(getNumberOfUniqueValues(temp)).toBe(1);

  expect(verify(_.cloneDeep(schema), [1, 2, 3])).toBe(true);
  expect(verify(_.cloneDeep(schema), [1, 1, 3])).toBe(false);
});

test(`ensure values in data are being added to $meta.uniqueValues each validation for multi-dimensional arrays`, () => {
  const schema = {
    $element: {
      $element: {
        $element: {
          $type: int,
          $unique: true
        }
      }
    }
  };

  const temp = _.cloneDeep(schema);
  verify(temp, null);
  expect(getNumberOfUniqueValues(temp)).toBe(1);

  const schema1 = _.cloneDeep(schema);
  expect(verify(schema1, [[[1]]])).toBe(true);
  expect(verify(schema1, [[[1]]])).toBe(false);
  expect(getUniqueValues(schema1, "[x][x][x]")).toEqual([1]);
  expect(verify(schema1, [[[2]]])).toBe(true);
  expect(getUniqueValues(schema1, "[x][x][x]")).toEqual([1, 2]);

  const schema2 = _.cloneDeep(schema);
  expect(verify(schema2, [[[]]])).toBe(true);
  expect(getUniqueValues(schema2, "[x][x][x]")).toEqual([]);
});

test("ensure values in data are being added to $meta.uniqueValues each validation for complex objects (array)", () => {
  const schema = {
    a: {
      $element: {
        b: {
          c: {
            $element: {
              $type: int,
              $unique: true
            }
          }
        }
      }
    }
  };

  const key = "a[x].b.c[x]";

  let data1 = {
    a: [
      {
        b: {
          c: [1, 2, 3]
        }
      }
    ]
  };

  const temp = _.cloneDeep(schema);
  verify(temp, null);
  expect(getNumberOfUniqueValues(temp)).toBe(1);
  expect(getUniqueValues(temp, key)).toEqual([]);

  let schema1 = _.cloneDeep(schema);
  expect(verify(schema1, data1)).toBe(true);
  expect(getUniqueValues(schema1, key)).toEqual([1, 2, 3]);

  let data2 = {
    a: [
      {
        b: {
          c: [1, 2, 1]
        }
      }
    ]
  };

  let schema2 = _.cloneDeep(schema);
  expect(verify(schema2, data2)).toBe(false);
  expect(getUniqueValues(schema2, key)).toEqual([1, 2]);

  let data3 = {
    a: [
      {
        b: {
          c: [1, 2]
        }
      }
    ]
  };

  let data4 = {
    a: [
      {
        b: {
          c: [2, 3]
        }
      }
    ]
  };

  let schema3 = _.cloneDeep(schema);
  expect(verify(schema3, data3)).toBe(true);
  expect(getUniqueValues(schema3, key)).toEqual([1, 2]);
  expect(verify(schema3, data4)).toBe(false);
  expect(getUniqueValues(schema3, key)).toEqual([1, 2, 3]);

  let data5 = {
    a: [
      {
        b: {
          c: [1, 2]
        }
      }
    ]
  };

  let data6 = {
    a: [
      {
        b: {
          c: [3, 4]
        }
      }
    ]
  };

  let schema4 = _.cloneDeep(schema);
  expect(verify(schema4, data5)).toBe(true);
  expect(getUniqueValues(schema4, key)).toEqual([1, 2]);
  expect(verify(schema4, data6)).toBe(true);
  expect(getUniqueValues(schema4, key)).toEqual([1, 2, 3, 4]);
});

test("ensure nested $unique in ordinary properties is ignored", () => {
  const schema1 = {
    $unique: true,
    a: {
      $unique: true,
      $type: int
    }
  };

  expect(verify(schema1, { a: 5 })).toBe(true);
  expect(verify(schema1, { a: 5 })).toBe(false);
  expect(getNumberOfUniqueValues(schema1)).toBe(1);
  expect(getUniqueValues(schema1, "a")).toEqual([]);
  expect(getUniqueValues(schema1, "")).toEqual([{ a: 5 }]);

  const schema2 = {
    $unique: false,
    a: {
      $unique: true,
      $type: int
    }
  };

  expect(verify(schema2, { a: 5 })).toBe(true);
  expect(verify(schema2, { a: 5 })).toBe(true);
  expect(getNumberOfUniqueValues(schema2)).toBe(0);
  expect(getUniqueValues(schema2, "a")).toEqual([]);
  expect(getUniqueValues(schema2, "")).toEqual([]);
});

test("ensure deep $unique is not ignored", () => {
  const shallowSchema = {
    $type: {
      $unique: true,
      $type: int
    }
  };

  expect(verify(shallowSchema, 5)).toBe(true);
  expect(verify(shallowSchema, 5)).toBe(false);
  expect(verify(shallowSchema, 6)).toBe(true);
  expect(getNumberOfUniqueValues(shallowSchema)).toBe(1);

  const deepSchema = {
    $type: {
      $type: {
        $type: {
          $type: {
            $type: {
              $unique: true,
              $type: int
            }
          }
        }
      }
    }
  };

  expect(verify(deepSchema, 5)).toBe(true);
  expect(verify(deepSchema, 5)).toBe(false);
  expect(verify(deepSchema, 6)).toBe(true);
  expect(getNumberOfUniqueValues(deepSchema)).toBe(1);
});

test("ensure only shallowest $unique in the $type chain is considered", () => {
  const uniqueSchema1 = {
    $unique: true,
    $type: {
      $unique: false,
      $type: int
    }
  };
  expect(verify(uniqueSchema1, 5)).toBe(true);
  expect(verify(uniqueSchema1, 5)).toBe(false);
  expect(verify(uniqueSchema1, 6)).toBe(true);
  expect(getNumberOfUniqueValues(uniqueSchema1)).toBe(1);

  const uniqueSchema2 = {
    $type: {
      $unique: true,
      $type: {
        $unique: false,
        $type: int
      }
    }
  };
  expect(verify(uniqueSchema2, 5)).toBe(true);
  expect(verify(uniqueSchema2, 5)).toBe(false);
  expect(verify(uniqueSchema2, 6)).toBe(true);
  expect(getNumberOfUniqueValues(uniqueSchema2)).toBe(1);

  const nonUniqueSchema1 = {
    $unique: false,
    $type: {
      $unique: true,
      $type: int
    }
  };
  expect(verify(nonUniqueSchema1, 5)).toBe(true);
  expect(verify(nonUniqueSchema1, 5)).toBe(true);
  expect(verify(nonUniqueSchema1, 6)).toBe(true);
  expect(getNumberOfUniqueValues(nonUniqueSchema1)).toBe(0);

  const nonUniqueSchema2 = {
    $type: {
      $unique: false,
      $type: {
        $unique: true,
        $type: int
      }
    }
  };
  expect(verify(nonUniqueSchema2, 5)).toBe(true);
  expect(verify(nonUniqueSchema2, 5)).toBe(true);
  expect(verify(nonUniqueSchema2, 6)).toBe(true);
  expect(getNumberOfUniqueValues(nonUniqueSchema2)).toBe(0);
});

test("ensure resetSchema() resets uniqueValues", () => {
  const schema1 = {
    $unique: true,
    $type: int
  };

  expect(verify(schema1, 5)).toBe(true);
  expect(verify(schema1, 5)).toBe(false);
  expect(getNumberOfUniqueValues(schema1)).toBe(1);
  resetSchema(schema1);
  expect(getNumberOfUniqueValues(schema1)).toBe(1);
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
  expect(getNumberOfUniqueValues(schema1)).toBe(1);
  resetSchema(schema2);
  expect(getNumberOfUniqueValues(schema1)).toBe(1);
  expect(verify(schema2, { a: 5 })).toBe(true);
  expect(verify(schema2, { a: 5 })).toBe(false);

  const schema3 = {
    a: {
      $unique: true,
      $type: int
    },
    b: {
      $unique: true,
      $type: string
    },
    c: {
      $unique: true,
      $type: int
    }
  };

  expect(verify(schema3, { a: 1, b: "1", c: 1 })).toBe(true);
  expect(verify(schema3, { a: 1, b: "2", c: 2 })).toBe(false);
  expect(getNumberOfUniqueValues(schema3)).toBe(3);
  resetSchema(schema3);
  expect(getNumberOfUniqueValues(schema3)).toBe(3);
  expect(verify(schema3, { a: 1, b: "1", c: 1 })).toBe(true);
  expect(verify(schema3, { a: 1, b: "2", c: 2 })).toBe(false);
});
