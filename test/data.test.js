import { generateSchemaExpects, testObject } from "./testUtils";
import { int, list, INVALID_VALUE_ERROR, positiveInt } from "../src";

const { expectSchemaPasses, expectSchemaFails } = generateSchemaExpects();

const SCHEMAS = {
  singleValue: {
    $type: int,
  },
  object: {
    a: {
      $type: int,
    },
  },
  array: {
    $element: int,
  },
  objectWithOptionalProperty: {
    a: {
      $optional: true,
      $type: int,
    },
  },
  objectWithOptionalArray: {
    a: {
      $optional: true,
      $element: int,
    },
  },
  singleUniqueValue: {
    $unique: true,
    $type: int,
  },
  uniqueArray: {
    $unique: true,
    $element: int,
  },
  arrayWithUniqueElements: {
    $element: {
      $type: int,
      $unique: true,
    },
  },
  objectWithOptionalAndUniqueProperty: {
    a: {
      $optional: true,
      $unique: true,
      $type: int,
    },
  },
  optionalArrayWithUniqueElements: {
    a: {
      $optional: true,
      $element: {
        $unique: true,
        $type: int,
      },
    },
  },
};

function testSingleDataValue(data) {
  test(`test ${data} data`, () => {
    expectSchemaFails(SCHEMAS.singleValue, data, { error: INVALID_VALUE_ERROR, value: data, expectedType: int });
    expectSchemaFails(SCHEMAS.object, data, { error: INVALID_VALUE_ERROR, value: data });
    expectSchemaFails(SCHEMAS.array, data, { error: INVALID_VALUE_ERROR, value: data, expectedType: list });
    expectSchemaFails(SCHEMAS.objectWithOptionalProperty, data, {
      error: INVALID_VALUE_ERROR,
      value: data,
    });
    expectSchemaFails(SCHEMAS.objectWithOptionalArray, data, {
      error: INVALID_VALUE_ERROR,
      value: data,
    });
    expectSchemaFails(SCHEMAS.singleUniqueValue, data, {
      error: INVALID_VALUE_ERROR,
      value: data,
      expectedType: int,
    });
    expectSchemaFails(SCHEMAS.uniqueArray, data, {
      error: INVALID_VALUE_ERROR,
      value: data,
      expectedType: list,
    });
    expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, {
      error: INVALID_VALUE_ERROR,
      value: data,
      expectedType: list,
    });
    expectSchemaFails(SCHEMAS.objectWithOptionalAndUniqueProperty, data, {
      error: INVALID_VALUE_ERROR,
      value: data,
    });
    expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, data, {
      error: INVALID_VALUE_ERROR,
      value: data,
    });
  });
}

["", "hello", true, false, null, undefined, NaN].forEach(function(value) {
  testSingleDataValue(value);
});
