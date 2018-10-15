import { validate, verify } from "../src/validate";
import { int, string } from "../src/types";
import { $META } from "../src/keys";

test("test verify returns boolean", () => {
  expect(verify({}, {})).toEqual(true);
});

test("test validate returns array", () => {
  expect(validate({}, {})).toEqual([]);
});

test(`verify or validate adds $meta property to schema`, () => {
  const schema1 = {
    a: int
  };
  const schema2 = {
    a: int
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

test("test single value", () => {
  expect(verify(int, 5)).toBe(true);
  expect(verify(int, "hello")).toBe(false);
});

test("test single array", () => {
  let schema = {
    $element: int
  };
  expect(verify(schema, 5)).toBe(false);
  expect(verify(schema, [])).toBe(true);
  expect(verify(schema, [1, 2, 3])).toBe(true);
  expect(verify(schema, ["hello"])).toBe(false);
});

test("test custom type", () => {
  let customType = {
    $test: object => object.includes("c")
  };
  let schema = {
    a: customType
  };
  let data = {
    a: ["a", "b", "c"]
  };
  expect(verify(schema, data)).toBe(true);

  data = {
    a: ["a", "b", "d"]
  };
  expect(verify(schema, data)).toBe(false);
});

test("test literal value", () => {
  let schema = {
    a: 5
  };
  let data = {
    a: 5
  };
  expect(verify(schema, data)).toBe(true);

  data = {
    a: 6
  };
  expect(verify(schema, data)).toBe(false);
});

test("test literal object", () => {
  let schema = {
    a: {
      b: 5,
      c: 10
    }
  };
  let data = {
    a: {
      b: 5,
      c: 10
    }
  };
  expect(verify(schema, data)).toBe(true);

  data = {
    a: {
      b: 6,
      c: 10
    }
  };
  expect(verify(schema, data)).toBe(false);

  data = {
    a: {
      b: 5,
      c: 10,
      d: 5
    }
  };
  expect(verify(schema, data)).toBe(false);

  data = {
    a: {
      b: 5
    }
  };
  expect(verify(schema, data)).toBe(false);

  data = {
    a: {}
  };
  expect(verify(schema, data)).toBe(false);
});

test("test deeply nested object", () => {
  let schema = {
    a: {
      b: {
        c: {
          d: {
            e: {
              f: int
            }
          }
        },
        g: {
          h: {
            i: string
          }
        },
        j: string
      }
    }
  };
  let data = {
    a: {
      b: {
        c: {
          d: {
            e: {
              f: 5
            }
          }
        },
        g: {
          h: {
            i: "hello"
          }
        },
        j: "there"
      }
    }
  };
  expect(verify(schema, data)).toBe(true);

  data = {
    a: {
      b: {
        c: {
          d: {
            e: 5
          }
        },
        g: {
          h: {
            i: "hello"
          }
        },
        j: "there"
      }
    }
  };
  expect(verify(schema, data)).toBe(false);

  data = {
    a: {
      b: {
        c: {
          d: {
            e: {
              f: 5
            }
          }
        },
        g: {
          h: {
            i: "hello"
          }
        }
      }
    }
  };
  expect(verify(schema, data)).toBe(false);

  data = {
    a: {
      b: {
        c: {
          d: {
            e: {
              f: {
                g: 5
              }
            }
          }
        },
        g: {
          h: {
            i: "hello"
          }
        },
        j: "there"
      }
    }
  };
  expect(verify(schema, data)).toBe(false);
});

test("test required key functionality", () => {
  let schema = {
    a: {
      $type: int
    }
  };
  let data = {
    a: 5
  };
  expect(verify(schema, data)).toBe(true);

  data = {};
  expect(verify(schema, data)).toBe(false);
});

test("test optional key functionality", () => {
  let schema = {
    a: {
      $optional: true
    }
  };
  let data = {
    a: 5
  };
  expect(verify(schema, data)).toBe(true);

  data = {};
  expect(verify(schema, data)).toBe(true);

  schema = {
    a: {
      $optional: false
    }
  };
  data = {
    a: 5
  };
  expect(verify(schema, data)).toBe(true);

  data = {};
  expect(verify(schema, data)).toBe(false);
});

test("test inline type", () => {
  let schema = {
    a: int
  };
  let data = {
    a: 5
  };
  expect(verify(schema, data)).toBe(true);

  data = {
    a: "hello"
  };
  expect(verify(schema, data)).toBe(false);
});

test("test nested type", () => {
  let schema = {
    a: {
      $type: int
    }
  };
  let data = {
    a: 5
  };
  expect(verify(schema, data)).toBe(true);

  data = {
    a: "hello"
  };
  expect(verify(schema, data)).toBe(false);
});

test("test test without type", () => {
  let schema = {
    a: {
      $test: function(object) {
        return /[a-z]/.test(object);
      }
    }
  };
  let data = {
    a: "hello"
  };
  expect(verify(schema, data)).toBe(true);

  data = {
    a: "HELLO"
  };
  expect(verify(schema, data)).toBe(false);
});

test("test type inheritance", () => {
  let schema = {
    a: {
      $type: int,
      $test: function(object) {
        return object === 5;
      }
    }
  };
  let data = {
    a: 5
  };
  expect(verify(schema, data)).toBe(true);

  data = {
    a: "hello"
  };
  expect(verify(schema, data)).toBe(false);

  data = {
    a: 6
  };
  expect(verify(schema, data)).toBe(false);
});

test("test complex object", () => {
  let schema = {
    $element: {
      a: {
        b: {
          $element: {
            c: {
              d: {
                $element: int
              }
            }
          }
        }
      }
    }
  };

  let data = [
    {
      a: {
        b: [
          {
            c: {
              d: [1, 2, 3]
            }
          }
        ]
      }
    },
    {
      a: {
        b: [
          {
            c: {
              d: []
            }
          }
        ]
      }
    },
    {
      a: {
        b: []
      }
    }
  ];

  expect(verify(schema, [])).toBe(true);
  expect(verify(schema, data)).toBe(true);

  data = [
    {
      a: {
        b: [
          {
            c: {
              d: [1, 2, "hello"]
            }
          }
        ]
      }
    }
  ];

  expect(verify(schema, data)).toBe(false);

  data = [
    {
      a: {
        b: [
          {
            c: {
              d: [1, 2, 3]
            }
          },
          {
            d: 5
          }
        ]
      }
    }
  ];

  expect(verify(schema, data)).toBe(false);

  data = [
    {
      a: {
        b: [
          {
            c: {
              d: [1, 2, 3]
            }
          },
          []
        ]
      }
    }
  ];

  expect(verify(schema, data)).toBe(false);

  data = [
    {
      a: {
        b: [1]
      }
    }
  ];

  expect(verify(schema, data)).toBe(false);

  data = [
    {
      a: {
        b: []
      }
    }
  ];

  expect(verify(schema, data)).toBe(true);

  data = [
    {
      a: {
        b: []
      }
    },
    {
      a: {
        b: []
      }
    }
  ];

  expect(verify(schema, data)).toBe(true);

  data = [
    {
      a: {
        b: []
      }
    },
    {
      a: {
        b: [1]
      }
    }
  ];

  expect(verify(schema, data)).toBe(false);

  data = [
    {
      a: {
        b: []
      }
    },
    {
      a: {
        b: [
          {
            c: {
              d: [1, 2, 3]
            }
          }
        ]
      }
    }
  ];

  expect(verify(schema, data)).toBe(true);
});
