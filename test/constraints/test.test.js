import { createError, generateSchemaExpects } from "../testUtils";
import { INVALID_VALUE_ERROR } from "../../src/errors";
import { verify } from "../../src/validate";
import { int } from "../../src/types";

const { expectSchemaPasses, expectSchemaFails } = generateSchemaExpects(function(error) {
  return createError(error.key, INVALID_VALUE_ERROR, error.value, error.expectedType);
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
  expectSchemaFails(schema, data, { key: "a", error: INVALID_VALUE_ERROR, value: "hello", expectedType: int });
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
  expectSchemaFails(schema, data, { key: "a", error: INVALID_VALUE_ERROR, value: "hello", expectedType: int });
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
  expectSchemaFails(schema, data, { key: "a", error: INVALID_VALUE_ERROR, value: "HELLO" });
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
