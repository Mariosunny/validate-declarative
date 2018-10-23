import { DUPLICATE_PROPERTY_ERROR, MISSING_PROPERTY_ERROR } from "../../src/errors";
import { int } from "../../src/types";
import { createError, generateSchemaExpects } from "../testUtils";

const { expectSchemaPasses, expectSchemaFails } = generateSchemaExpects(function(property) {
  return createError(property, MISSING_PROPERTY_ERROR);
});

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

test("test optional constraint is ignored directly inside $element object", () => {
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
  const optionalSchema = {
    a: {
      $type: int,
      $optional: true,
    },
  };
  const requiredSchema = {
    a: {
      $type: int,
      $optional: false,
    },
  };
  expectSchemaPasses(optionalSchema, {});
  expectSchemaPasses(optionalSchema, { a: 5 });
  expectSchemaFails(requiredSchema, {}, "a");
  expectSchemaPasses(requiredSchema, { a: 5 });
});

test(`test optional constraint does not generate ${MISSING_PROPERTY_ERROR} for deeply nested object`, () => {
  const optionalSchema = {
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
  const requiredSchema = {
    a: {
      b: {
        c: {
          d: {
            $type: int,
            $optional: false,
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

  expectSchemaPasses(optionalSchema, data1);
  expectSchemaPasses(optionalSchema, data2);
  expectSchemaFails(requiredSchema, data1, "a.b.c.d");
  expectSchemaPasses(requiredSchema, data2);
});

test(`test optional constraint does not generate ${MISSING_PROPERTY_ERROR} for array`, () => {
  const optionalSchema = {
    a: {
      $optional: true,
      $element: int,
    },
  };
  const requiredSchema = {
    a: {
      $optional: false,
      $element: int,
    },
  };
  expectSchemaPasses(optionalSchema, {});
  expectSchemaPasses(optionalSchema, { a: [] });
  expectSchemaPasses(optionalSchema, { a: [1, 2, 3] });
  expectSchemaFails(requiredSchema, {}, "a");
  expectSchemaPasses(requiredSchema, { a: [] });
  expectSchemaPasses(requiredSchema, { a: [1, 2, 3] });
});

test(`test optional constraint does not generate ${MISSING_PROPERTY_ERROR} for complex object`, () => {
  const optionalSchema = {
    a: {
      $element: {
        b: {
          c: {
            $element: {
              d: {
                $type: int,
                $optional: true,
              },
            },
          },
        },
      },
    },
  };
  const requiredSchema = {
    a: {
      $element: {
        b: {
          c: {
            $element: {
              d: {
                $type: int,
                $optional: false,
              },
            },
          },
        },
      },
    },
  };

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
  let data2 = {
    a: [
      {
        b: {
          c: [{}],
        },
      },
    ],
  };

  expectSchemaPasses(optionalSchema, data1);
  expectSchemaPasses(optionalSchema, data2);
  expectSchemaPasses(requiredSchema, data1);
  expectSchemaFails(requiredSchema, data2, "a[0].b.c[0].d");
});

test("ensure only shallowest $optional in the $type chain is considered", () => {
  const optionalSchema1 = {
    a: {
      $optional: true,
      $type: {
        $optional: false,
        $type: int,
      },
    },
  };
  const optionalSchema2 = {
    a: {
      $optional: true,
      $type: {
        $optional: true,
        $type: int,
      },
    },
  };
  const requiredSchema1 = {
    a: {
      $optional: false,
      $type: {
        $optional: false,
        $type: int,
      },
    },
  };
  const requiredSchema2 = {
    a: {
      $optional: false,
      $type: {
        $optional: true,
        $type: int,
      },
    },
  };

  expectSchemaPasses(optionalSchema1, {});
  expectSchemaPasses(optionalSchema1, { a: 5 });
  expectSchemaPasses(optionalSchema2, {});
  expectSchemaPasses(optionalSchema2, { a: 5 });
  expectSchemaFails(requiredSchema1, {}, "a");
  expectSchemaPasses(requiredSchema1, { a: 5 });
  expectSchemaFails(requiredSchema2, {}, "a");
  expectSchemaPasses(requiredSchema2, { a: 5 });
});

test("ensure deep $optional is not ignored", () => {
  const shallowSchema = {
    a: {
      $type: {
        $optional: true,
        $type: int,
      },
    },
  };

  expectSchemaPasses(shallowSchema, { a: 5 });
  expectSchemaPasses(shallowSchema, {});

  const deepSchema = {
    a: {
      $type: {
        $type: {
          $type: {
            $type: {
              $type: {
                $optional: true,
                $type: int,
              },
            },
          },
        },
      },
    },
  };

  expectSchemaPasses(deepSchema, { a: 5 });
  expectSchemaPasses(deepSchema, {});
});
