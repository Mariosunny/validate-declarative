import { createError, generateSchemaExpects } from "../testUtils";
import { INVALID_VALUE_ERROR } from "../../src/errors";
import { validate, verify } from "../../src/validate";
import { int } from "../../src/types";

const { expectSchemaPasses, expectSchemaFails, expectSchemaThrows, expectSchemaNotThrows } = generateSchemaExpects(
  function(error) {
    return createError(error.key, INVALID_VALUE_ERROR, error.value, error.expectedType);
  }
);

test("test inline type", () => {
  let schema = {
    a: int,
  };
  let data = {
    a: 5,
  };
  expectSchemaPasses(schema, data);

  data = {
    a: "hello",
  };
  expectSchemaFails(schema, data, { key: "a", value: "hello", expectedType: int });
});

test("test nested type", () => {
  let schema = {
    a: {
      $type: int,
    },
  };
  let data = {
    a: 5,
  };
  expectSchemaPasses(schema, data);

  data = {
    a: "hello",
  };
  expectSchemaFails(schema, data, { key: "a", value: "hello", expectedType: int });
});

test("test deeply-nested $type", () => {
  let schema = {
    a: {
      $type: {
        $type: {
          $type: {
            $type: int,
          },
        },
      },
    },
  };
  let data = {
    a: 5,
  };
  expectSchemaPasses(schema, data);

  data = {
    a: "hello",
  };
  expectSchemaFails(schema, data, { key: "a", value: "hello", expectedType: int });
});

test("test deeply-nested $test", () => {
  let schema = {
    a: {
      $type: {
        $type: {
          $type: {
            $test: int.$test,
          },
        },
      },
    },
  };
  let data = {
    a: 5,
  };
  expectSchemaPasses(schema, data);

  data = {
    a: "hello",
  };
  expectSchemaFails(schema, data, { key: "a", value: "hello" });
});

test("absence of $test or $type in a type is valid object", () => {
  let schema1 = {
    $type: {},
  };
  let schema2 = {
    $type: {
      $type: {
        $type: {},
      },
    },
  };
  expectSchemaPasses(schema1, 5);
  expectSchemaPasses(schema1, "hello");
  expectSchemaPasses(schema1, undefined);
  expectSchemaPasses(schema2, 5);
  expectSchemaPasses(schema2, "hello");
  expectSchemaPasses(schema2, undefined);
});

test("test deeply-nested $name", () => {
  let schema = {
    a: {
      $type: {
        $type: {
          $type: {
            $test: int.$test,
            $name: "customType",
          },
        },
      },
    },
  };
  let data = {
    a: 5,
  };
  expectSchemaPasses(schema, data);

  data = {
    a: "hello",
  };
  expectSchemaFails(schema, data, { key: "a", value: "hello", expectedType: "customType" });
});

test("test no $test or $type", () => {
  let schema1 = {
    a: {},
  };
  let data = {
    a: {},
  };
  expectSchemaPasses(schema1, data);

  data = {
    a: 5,
  };
  expectSchemaFails(schema1, data, { value: { a: 5 } });

  let schema2 = {};
  expectSchemaFails(schema2, 5, { value: 5 });
});

test("test $test without $type", () => {
  let schema = {
    a: {
      $test: function(object) {
        return /[a-z]/.test(object);
      },
    },
  };
  let data = {
    a: "hello",
  };
  expectSchemaPasses(schema, data);

  data = {
    a: "HELLO",
  };
  expectSchemaFails(schema, data, { key: "a", value: "HELLO" });
});

test("test $type without $test", () => {
  let schema = {
    a: {
      $type: {
        $test: function(object) {
          return /[a-z]/.test(object);
        },
      },
    },
  };
  let data = {
    a: "hello",
  };
  expectSchemaPasses(schema, data);

  data = {
    a: "HELLO",
  };
  expectSchemaFails(schema, data, { key: "a", value: "HELLO" });
});

test("test type inheritance", () => {
  let schema = {
    a: {
      $type: int,
      $test: function(object) {
        return object === 5;
      },
    },
  };
  let data = {
    a: 5,
  };
  expect(verify(schema, data)).toBe(true);

  data = {
    a: "hello",
  };
  expect(verify(schema, data)).toBe(false);

  data = {
    a: 6,
  };
  expect(verify(schema, data)).toBe(false);
});

test("test user-defined $test", () => {
  let customType = {
    $test: object => object.includes("c"),
    $name: "customType",
  };
  let schema = {
    a: customType,
  };
  let data1 = {
    a: ["a", "b", "c"],
  };
  expectSchemaPasses(schema, data1);

  let data2 = {
    a: ["a", "b", "d"],
  };
  expectSchemaFails(schema, data2, { key: "a", value: data2.a, expectedType: "customType" });
});

test("deepest $test is called first", () => {
  let order = [];
  const schema = {
    $type: {
      $type: {
        $test(object) {
          order.push(1);
          return true;
        },
      },
      $test(object) {
        order.push(2);
        return true;
      },
    },
    $test(object) {
      order.push(3);
      return true;
    },
  };

  expectSchemaPasses(schema, 5);
  expect(order).toEqual([1, 2, 3]);
});

test("schema throws when $test throws", () => {
  const schema1 = {
    $test(object) {
      return object.charAt(0) === "a";
    },
  };
  expectSchemaThrows(schema1, 5);

  const schema2 = {
    $test(object) {
      return typeof object === "string";
    },
  };
  expectSchemaNotThrows(schema2, 5);
});

test("schema throws when $test throws (deeply-nested $tests)", () => {
  const test1 = function(object) {
    return object.charAt(2) === "c";
  };
  const test2 = function(object) {
    return object.length === 3;
  };
  const test3 = function(object) {
    return typeof object === "string";
  };

  let data1 = 5;
  let data2 = "";
  let data3 = "123";
  let data4 = "abc";

  const schema1 = {
    $type: {
      $type: {
        $test: test3,
      },
      $test: test2,
    },
    $test: test1,
  };
  expectSchemaNotThrows(schema1, data1);
  expectSchemaFails(schema1, data1, { value: data1 });
  expectSchemaNotThrows(schema1, data2);
  expectSchemaFails(schema1, data2, { value: data2 });
  expectSchemaNotThrows(schema1, data3);
  expectSchemaFails(schema1, data3, { value: data3 });
  expectSchemaNotThrows(schema1, data4);
  expectSchemaPasses(schema1, data4);

  const schema2 = {
    $type: {
      $type: {
        $test: test2,
      },
      $test: test3,
    },
    $test: test1,
  };
  expectSchemaNotThrows(schema2, data1);
  expectSchemaFails(schema2, data1, { value: data1 });
  expectSchemaNotThrows(schema2, data2);
  expectSchemaFails(schema2, data2, { value: data2 });
  expectSchemaNotThrows(schema2, data3);
  expectSchemaFails(schema2, data3, { value: data3 });
  expectSchemaNotThrows(schema2, data4);
  expectSchemaPasses(schema2, data4);

  const schema3 = {
    $type: {
      $type: {
        $test: test3,
      },
      $test: test1,
    },
    $test: test2,
  };
  expectSchemaNotThrows(schema3, data1);
  expectSchemaFails(schema3, data1, { value: data1 });
  expectSchemaNotThrows(schema3, data2);
  expectSchemaFails(schema3, data2, { value: data2 });
  expectSchemaNotThrows(schema3, data3);
  expectSchemaFails(schema3, data3, { value: data3 });
  expectSchemaNotThrows(schema3, data4);
  expectSchemaPasses(schema3, data4);

  const schema4 = {
    $type: {
      $type: {
        $test: test1,
      },
      $test: test3,
    },
    $test: test2,
  };
  expectSchemaThrows(schema4, data1);
  expectSchemaNotThrows(schema4, data2);
  expectSchemaFails(schema4, data2, { value: data2 });
  expectSchemaNotThrows(schema4, data3);
  expectSchemaFails(schema4, data3, { value: data3 });
  expectSchemaNotThrows(schema4, data4);
  expectSchemaPasses(schema4, data4);

  const schema5 = {
    $type: {
      $type: {
        $test: test1,
      },
      $test: test2,
    },
    $test: test3,
  };
  expectSchemaThrows(schema5, data1);
  expectSchemaNotThrows(schema5, data2);
  expectSchemaFails(schema5, data2, { value: data2 });
  expectSchemaNotThrows(schema5, data3);
  expectSchemaFails(schema5, data3, { value: data3 });
  expectSchemaNotThrows(schema5, data4);
  expectSchemaPasses(schema5, data4);

  const schema6 = {
    $type: {
      $type: {
        $test: test2,
      },
      $test: test1,
    },
    $test: test3,
  };
  expectSchemaNotThrows(schema6, data1);
  expectSchemaFails(schema6, data1, { value: data1 });
  expectSchemaNotThrows(schema6, data2);
  expectSchemaFails(schema6, data2, { value: data2 });
  expectSchemaNotThrows(schema6, data3);
  expectSchemaFails(schema6, data3, { value: data3 });
  expectSchemaNotThrows(schema6, data4);
  expectSchemaPasses(schema6, data4);
});

test("test regex $test", () => {
  const regex = /^[0-9]{3}$/;
  const schema = {
    $test: regex,
  };
  expectSchemaPasses(schema, "123");
  expectSchemaFails(schema, "12a", { expectedType: regex, value: "12a" });
  expectSchemaFails(schema, "1234", { expectedType: regex, value: "1234" });
  expectSchemaFails(schema, 1234, { expectedType: regex, value: 1234 });
});
