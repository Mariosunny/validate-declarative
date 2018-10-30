import { _resetSchema, DUPLICATE_VALUE_ERROR, int, INVALID_VALUE_ERROR, list, MISSING_PROPERTY_ERROR } from "../../src";
import { generateSchemaExpects } from "../testUtils";

const { expectSchemaPasses, expectSchemaFails } = generateSchemaExpects();

test("test optional unique constraint", () => {
  const schema = {
    a: {
      $optional: true,
      $unique: true,
      $type: int,
    },
  };
  let data1 = {
    a: 5,
  };
  let data2 = {
    a: 6,
  };
  let data3 = {};

  expectSchemaPasses(schema, data1);
  expectSchemaPasses(schema, data2);
  expectSchemaPasses(schema, data3);

  expectSchemaFails(schema, data1, { error: DUPLICATE_VALUE_ERROR, key: "a", value: 5 });
  expectSchemaFails(schema, data2, { error: DUPLICATE_VALUE_ERROR, key: "a", value: 6 });
  expectSchemaPasses(schema, data3);
});

test("presence of $unique or $optional constraint and absence of $type or $test validates any object", () => {
  const schema1 = {
    $unique: true,
  };
  const schema2 = {
    a: {
      $optional: true,
    },
  };
  const anyValues = [5, "hello", undefined, null, new Date(), Infinity, function() {}, []];

  anyValues.forEach(function(value) {
    expectSchemaPasses(schema1, value);
    expectSchemaPasses(schema2, { a: value });
    expectSchemaPasses(schema2, {});
  });
});

test("test unique together-by constraint with optional properties", () => {
  const schema = {
    $unique: true,
    a: {
      $optional: true,
      $type: int,
    },
    b: {
      $optional: true,
      $type: int,
    },
  };
  let datas = [
    {
      a: 5,
      b: 5,
    },
    {
      a: 6,
      b: 6,
    },
    {
      a: 5,
    },
    {
      a: 6,
    },
    {
      b: 5,
    },
    {
      b: 6,
    },
    {},
  ];

  datas.forEach(function(data) {
    expectSchemaPasses(schema, data);
    expectSchemaFails(schema, data, { error: DUPLICATE_VALUE_ERROR, value: data });
    _resetSchema(schema);
  });

  datas.forEach(function(data) {
    expectSchemaPasses(schema, data);
  });
});

test("test optional unique properties", () => {
  const schema = {
    a: {
      $optional: true,
      b: {
        $unique: true,
        $type: int,
      },
      c: {
        $unique: true,
        $type: int,
      },
    },
  };
  let data1 = {
    a: {
      b: 5,
      c: 5,
    },
  };
  let data2 = {
    a: {
      b: 5,
      c: 6,
    },
  };
  let data3 = {
    a: {
      b: 6,
      c: 5,
    },
  };
  let data4 = {
    a: {
      b: 6,
      c: 6,
    },
  };
  let data5 = {};

  [data1, data2, data3, data4].forEach(function(data) {
    expectSchemaPasses(schema, data);
    expectSchemaFails(schema, data, [
      { error: DUPLICATE_VALUE_ERROR, key: "a.b", value: data.a.b },
      { error: DUPLICATE_VALUE_ERROR, key: "a.c", value: data.a.c },
    ]);
    _resetSchema(schema);
  });

  expectSchemaPasses(schema, data5);
  expectSchemaPasses(schema, data5);
  _resetSchema(schema);

  expectSchemaPasses(schema, data1);
  expectSchemaFails(schema, data2, { error: DUPLICATE_VALUE_ERROR, key: "a.b", value: 5 });
  expectSchemaFails(schema, data3, { error: DUPLICATE_VALUE_ERROR, key: "a.c", value: 5 });
  expectSchemaFails(schema, data4, [
    { error: DUPLICATE_VALUE_ERROR, key: "a.b", value: 6 },
    { error: DUPLICATE_VALUE_ERROR, key: "a.c", value: 6 },
  ]);
  _resetSchema(schema);
});

test(`test reserved property in the presence of non-reserved property`, () => {
  const uniqueSchema = {
    $unique: true,
    a: int,
  };
  const optionalSchema = {
    $optional: true,
    a: int,
  };
  const elementSchema = {
    $element: int,
    a: int,
  };
  const testSchema = {
    $test: int.$test,
    a: int,
  };
  const typeSchema = {
    $type: int,
    a: int,
  };

  expectSchemaPasses(uniqueSchema, { a: 5 });
  expectSchemaFails(uniqueSchema, { a: 5 }, { error: DUPLICATE_VALUE_ERROR, value: { a: 5 } });
  expectSchemaFails(uniqueSchema, 5, { error: INVALID_VALUE_ERROR, value: 5 });
  expectSchemaFails(uniqueSchema, {}, { error: MISSING_PROPERTY_ERROR, key: "a" });

  expectSchemaPasses(optionalSchema, { a: 5 });
  expectSchemaFails(optionalSchema, 5, { error: INVALID_VALUE_ERROR, value: 5 });
  expectSchemaFails(optionalSchema, {}, { error: MISSING_PROPERTY_ERROR, key: "a" });

  expectSchemaFails(elementSchema, { a: 5 }, { error: INVALID_VALUE_ERROR, expectedType: list, value: { a: 5 } });
  expectSchemaFails(elementSchema, 5, { error: INVALID_VALUE_ERROR, expectedType: list, value: 5 });
  expectSchemaFails(elementSchema, {}, { error: INVALID_VALUE_ERROR, expectedType: list, value: {} });

  expectSchemaFails(testSchema, { a: 5 }, { error: INVALID_VALUE_ERROR, value: { a: 5 } });
  expectSchemaFails(testSchema, 5, { error: MISSING_PROPERTY_ERROR, key: "a" });
  expectSchemaFails(testSchema, {}, { error: INVALID_VALUE_ERROR, value: {} });

  expectSchemaFails(typeSchema, { a: 5 }, { error: INVALID_VALUE_ERROR, value: { a: 5 }, expectedType: int });
  expectSchemaFails(typeSchema, 5, { error: MISSING_PROPERTY_ERROR, key: "a" });
  expectSchemaFails(typeSchema, {}, { error: INVALID_VALUE_ERROR, value: {}, expectedType: int });
});
