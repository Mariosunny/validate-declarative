import {
  validate,
  verify,
  int,
  list,
  string,
  EXTRANEOUS_PROPERTY_ERROR,
  INVALID_VALUE_ERROR,
  MISSING_PROPERTY_ERROR,
} from "../src";
import { $META } from "../src/keys";
import { generateSchemaExpects } from "./testUtils";

const { expectSchemaPasses, expectSchemaFails, expectSchemaThrows } = generateSchemaExpects();

test("test verify returns boolean", () => {
  expect(verify({}, {})).toEqual(true);
});

test("test validate returns report object", () => {
  const schema = {};
  let report = validate(schema, {});

  expect(report).toEqual({
    data: {},
    schema: schema,
    errors: [],
  });
});

test("non-key/value object throws error", () => {
  const nonKeyValueObjects = [
    5.5,
    5,
    0,
    Infinity,
    -Infinity,
    "",
    "hello",
    undefined,
    null,
    NaN,
    true,
    false,
    Symbol(),
    function() {},
    [],
  ];

  nonKeyValueObjects.forEach(function(obj) {
    expectSchemaThrows(obj, null);
  });
});

test(`verify or validate adds $meta property to schema`, () => {
  const schema1 = {
    a: int,
  };
  const schema2 = {
    a: int,
  };

  expect(schema1.hasOwnProperty($META)).toBe(false);
  expect(schema2.hasOwnProperty($META)).toBe(false);
  verify(schema1, {});
  validate(schema2, {});
  expect(schema1.hasOwnProperty($META)).toBe(true);
  expect(schema2.hasOwnProperty($META)).toBe(true);
  expect(schema1[$META].hasOwnProperty("uniqueValues")).toBe(true);
  expect(schema2[$META].hasOwnProperty("uniqueValues")).toBe(true);
  verify(schema1, {});
  validate(schema2, {});
  expect(schema1.hasOwnProperty($META)).toBe(true);
  expect(schema2.hasOwnProperty($META)).toBe(true);
  expect(schema1[$META].hasOwnProperty("uniqueValues")).toBe(true);
  expect(schema2[$META].hasOwnProperty("uniqueValues")).toBe(true);
});

test("ensure any property type in data is not ignored", () => {
  let keys = [
    5.5,
    5,
    Symbol(),
    Infinity,
    -Infinity,
    "",
    {},
    "hello",
    undefined,
    null,
    NaN,
    true,
    false,
    new Date(),
    function() {},
    /\w/,
  ];

  keys.forEach(key => {
    let schema = {
      [key]: int,
    };
    let data = {
      [key]: 5,
    };
    expectSchemaPasses(schema, data);
  });
});

test("test single value", () => {
  expectSchemaPasses(int, 5);
  expectSchemaFails(int, "hello", { error: INVALID_VALUE_ERROR, value: "hello", expectedType: int });
});

test("test single array", () => {
  const schema = {
    $element: int,
  };
  expectSchemaFails(schema, 5, { error: INVALID_VALUE_ERROR, value: 5, expectedType: list });
  expectSchemaPasses(schema, []);
  expectSchemaPasses(schema, [1, 2, 3]);
  expectSchemaFails(schema, ["hello"], { error: INVALID_VALUE_ERROR, key: "[0]", value: "hello", expectedType: int });
});

test("test literal value", () => {
  const schema = {
    a: 5,
  };
  let data = {
    a: 5,
  };
  expectSchemaPasses(schema, data);

  data = {
    a: 6,
  };
  expectSchemaFails(schema, data, { error: INVALID_VALUE_ERROR, value: { a: 6 } });
});

test("test literal object", () => {
  let schema = {
    a: {
      b: 5,
      c: 10,
    },
  };
  let data = {
    a: {
      b: 5,
      c: 10,
    },
  };
  expectSchemaPasses(schema, data);

  data = {
    a: {
      b: 6,
      c: 10,
    },
  };
  expectSchemaFails(schema, data, {
    error: INVALID_VALUE_ERROR,
    value: {
      a: {
        b: 6,
        c: 10,
      },
    },
  });

  data = {
    a: {
      b: 5,
      c: 10,
      d: 5,
    },
  };
  expectSchemaFails(schema, data, {
    error: INVALID_VALUE_ERROR,
    value: {
      a: {
        b: 5,
        c: 10,
        d: 5,
      },
    },
  });

  data = {
    a: {
      b: 5,
    },
  };
  expectSchemaFails(schema, data, {
    error: INVALID_VALUE_ERROR,
    value: {
      a: {
        b: 5,
      },
    },
  });

  data = {
    a: {},
  };
  expectSchemaFails(schema, data, {
    error: INVALID_VALUE_ERROR,
    value: {
      a: {},
    },
  });
});

test("test literal value with non-literal values", () => {
  const schema = {
    a: 5,
    b: int,
  };

  let data = {
    a: 5,
    b: 5,
  };
  expectSchemaPasses(schema, data);

  data = {
    a: 6,
    b: 5,
  };
  expectSchemaFails(schema, data, { key: "a", error: INVALID_VALUE_ERROR, value: 6 });

  data = {
    a: 5,
    b: "5",
  };
  expectSchemaFails(schema, data, { key: "b", error: INVALID_VALUE_ERROR, value: "5", expectedType: int });

  data = {
    a: 6,
    b: "5",
  };
  expectSchemaFails(schema, data, [
    { key: "a", error: INVALID_VALUE_ERROR, value: 6 },
    { key: "b", error: INVALID_VALUE_ERROR, value: "5", expectedType: int },
  ]);
});

test("test deeply nested object", () => {
  let schema = {
    a: {
      b: {
        c: {
          d: {
            e: {
              f: int,
            },
          },
        },
        g: {
          h: {
            i: string,
          },
        },
        j: string,
      },
    },
  };
  let data = {
    a: {
      b: {
        c: {
          d: {
            e: {
              f: 5,
            },
          },
        },
        g: {
          h: {
            i: "hello",
          },
        },
        j: "there",
      },
    },
  };
  expectSchemaPasses(schema, data);

  data = {
    a: {
      b: {
        c: {
          d: {
            e: 5,
          },
        },
        g: {
          h: {
            i: "hello",
          },
        },
        j: "there",
      },
    },
  };
  expectSchemaFails(schema, data, { key: "a.b.c.d.e", error: INVALID_VALUE_ERROR, value: 5 });

  data = {
    a: {
      b: {
        c: {
          d: {
            e: {
              f: 5,
            },
          },
        },
        g: {
          h: {
            i: "hello",
          },
        },
      },
    },
  };
  expectSchemaFails(schema, data, { key: "a.b.j", error: MISSING_PROPERTY_ERROR });

  data = {
    a: {
      b: {
        c: {
          d: {
            e: {
              f: {
                g: 5,
              },
            },
          },
        },
        g: {
          h: {
            i: "hello",
          },
        },
        j: "there",
      },
    },
  };
  expectSchemaFails(schema, data, {
    key: "a.b.c.d.e.f",
    error: INVALID_VALUE_ERROR,
    expectedType: int,
    value: { g: 5 },
  });
});

test("test complex object", () => {
  let schema = {
    $element: {
      a: {
        b: {
          $element: {
            c: {
              d: {
                $element: int,
              },
            },
          },
        },
      },
    },
  };

  let data = [
    {
      a: {
        b: [
          {
            c: {
              d: [1, 2, 3],
            },
          },
        ],
      },
    },
    {
      a: {
        b: [
          {
            c: {
              d: [],
            },
          },
        ],
      },
    },
    {
      a: {
        b: [],
      },
    },
  ];
  expectSchemaPasses(schema, []);
  expectSchemaPasses(schema, data);

  data = [
    {
      a: {
        b: [
          {
            c: {
              d: [1, 2, "hello"],
            },
          },
        ],
      },
    },
  ];
  expectSchemaFails(schema, data, {
    key: "[0].a.b[0].c.d[2]",
    error: INVALID_VALUE_ERROR,
    value: "hello",
    expectedType: int,
  });

  data = [
    {
      a: {
        b: [
          {
            c: {
              d: [1, 2, 3],
            },
          },
          {
            d: 5,
          },
        ],
      },
    },
  ];
  expectSchemaFails(schema, data, [
    {
      key: "[0].a.b[1].c",
      error: MISSING_PROPERTY_ERROR,
    },
    { key: "[0].a.b[1].d", error: EXTRANEOUS_PROPERTY_ERROR },
  ]);

  data = [
    {
      a: {
        b: [
          {
            c: {
              d: [1, 2, 3],
            },
          },
          [],
        ],
      },
    },
  ];
  expectSchemaFails(schema, data, { key: "[0].a.b[1]", error: INVALID_VALUE_ERROR, value: [] });

  data = [
    {
      a: {
        b: [1],
      },
    },
  ];
  expectSchemaFails(schema, data, { key: "[0].a.b[0]", error: INVALID_VALUE_ERROR, value: 1 });

  data = [
    {
      a: {
        b: [],
      },
    },
  ];
  expectSchemaPasses(schema, data);

  data = [
    {
      a: {
        b: [],
      },
    },
    {
      a: {
        b: [],
      },
    },
  ];
  expectSchemaPasses(schema, data);

  data = [
    {
      a: {
        b: [],
      },
    },
    {
      a: {
        b: [1],
      },
    },
  ];
  expectSchemaFails(schema, data, { key: "[1].a.b[0]", error: INVALID_VALUE_ERROR, value: 1 });

  data = [
    {
      a: {
        b: [],
      },
    },
    {
      a: {
        b: [
          {
            c: {
              d: [1, 2, 3],
            },
          },
        ],
      },
    },
  ];
  expectSchemaPasses(schema, data);
});
