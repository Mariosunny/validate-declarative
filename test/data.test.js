import { generateSchemaExpects } from "./testUtils";
import {
  int,
  list,
  INVALID_VALUE_ERROR,
  _resetSchema,
  MISSING_PROPERTY_ERROR,
  EXTRANEOUS_PROPERTY_ERROR,
} from "../src";
import _ from "lodash";

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

const {
  generateInvalidValueError,
  generateInvalidValueErrorInt,
  generateInvalidValueErrorArray,
  generateMissingPropertyError,
  generateInvalidValueErrorArrayKey,
  generateInvalidValueErrorIntKey,
  generateInvalidValueErrorArrayElement,
  generateExtraneousPropertyError,
} = (function() {
  function generateError(error, key, value, expectedType) {
    let generatedError = { error, key };

    if (value) {
      generatedError.value = value;
    }

    if (expectedType) {
      generatedError.expectedType = expectedType;
    }

    return generatedError;
  }

  return {
    generateInvalidValueError(value) {
      return generateError(INVALID_VALUE_ERROR, "", value);
    },
    generateInvalidValueErrorInt(value) {
      return generateError(INVALID_VALUE_ERROR, "", value, int);
    },
    generateInvalidValueErrorIntKey(value) {
      return generateError(INVALID_VALUE_ERROR, "a", value, int);
    },
    generateInvalidValueErrorArray(value) {
      return generateError(INVALID_VALUE_ERROR, "", value, list);
    },
    generateInvalidValueErrorArrayKey(value) {
      return generateError(INVALID_VALUE_ERROR, "a", value, list);
    },
    generateInvalidValueErrorArrayElement(value) {
      return generateError(INVALID_VALUE_ERROR, "[0]", value, int);
    },
    generateMissingPropertyError(key = "a") {
      return generateError(MISSING_PROPERTY_ERROR, key);
    },
    generateExtraneousPropertyError(key = "b") {
      return generateError(EXTRANEOUS_PROPERTY_ERROR, key);
    },
  };
})();

beforeEach(() => {
  _.forOwn(SCHEMAS, function(schema) {
    _resetSchema(schema);
  });
});

function testSingleDataValue(value) {
  test(`test ${value} data`, () => {
    const invalidValueError = generateInvalidValueError(value);
    const invalidValueErrorInt = generateInvalidValueErrorInt(value);
    const invalidValueErrorArray = generateInvalidValueErrorArray(value);

    expectSchemaFails(SCHEMAS.singleValue, value, invalidValueErrorInt);
    expectSchemaFails(SCHEMAS.object, value, invalidValueError);
    expectSchemaFails(SCHEMAS.array, value, invalidValueErrorArray);
    expectSchemaFails(SCHEMAS.objectWithOptionalProperty, value, invalidValueError);
    expectSchemaFails(SCHEMAS.objectWithOptionalArray, value, invalidValueError);
    expectSchemaFails(SCHEMAS.singleUniqueValue, value, invalidValueErrorInt);
    expectSchemaFails(SCHEMAS.uniqueArray, value, invalidValueErrorArray);
    expectSchemaFails(SCHEMAS.arrayWithUniqueElements, value, invalidValueErrorArray);
    expectSchemaFails(SCHEMAS.objectWithOptionalAndUniqueProperty, value, invalidValueError);
    expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, value, invalidValueError);
  });

  test(`test {a: ${value} } data`, () => {
    const data = { a: value };
    const invalidValueErrorInt = generateInvalidValueErrorInt(data);
    const invalidValueErrorIntKey = generateInvalidValueErrorIntKey(value);
    const invalidValueErrorArray = generateInvalidValueErrorArray(data);
    const invalidValueErrorArrayKey = generateInvalidValueErrorArrayKey(value);

    expectSchemaFails(SCHEMAS.singleValue, data, invalidValueErrorInt);
    expectSchemaFails(SCHEMAS.object, data, invalidValueErrorIntKey);
    expectSchemaFails(SCHEMAS.array, data, invalidValueErrorArray);
    expectSchemaFails(SCHEMAS.objectWithOptionalProperty, data, invalidValueErrorIntKey);
    expectSchemaFails(SCHEMAS.objectWithOptionalArray, data, invalidValueErrorArrayKey);
    expectSchemaFails(SCHEMAS.singleUniqueValue, data, invalidValueErrorInt);
    expectSchemaFails(SCHEMAS.uniqueArray, data, invalidValueErrorArray);
    expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, invalidValueErrorArray);
    expectSchemaFails(SCHEMAS.objectWithOptionalAndUniqueProperty, data, invalidValueErrorIntKey);
    expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, data, invalidValueErrorArrayKey);
  });

  test(`test [${value}] data`, () => {
    const data = [value];
    const invalidValueError = generateInvalidValueError(data);
    const invalidValueErrorInt = generateInvalidValueErrorInt(data);
    const invalidValueErrorArrayElement = generateInvalidValueErrorArrayElement(value);

    expectSchemaFails(SCHEMAS.singleValue, data, invalidValueErrorInt);
    expectSchemaFails(SCHEMAS.object, data, invalidValueError);
    expectSchemaFails(SCHEMAS.array, data, invalidValueErrorArrayElement);
    expectSchemaFails(SCHEMAS.objectWithOptionalProperty, data, invalidValueError);
    expectSchemaFails(SCHEMAS.objectWithOptionalArray, data, invalidValueError);
    expectSchemaFails(SCHEMAS.singleUniqueValue, data, invalidValueErrorInt);
    expectSchemaFails(SCHEMAS.uniqueArray, data, invalidValueErrorArrayElement);
    expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, invalidValueErrorArrayElement);
    expectSchemaFails(SCHEMAS.objectWithOptionalAndUniqueProperty, data, invalidValueError);
    expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, data, invalidValueError);
  });

  test(`test {b: ${value} } data`, () => {
    let data = { b: value };
    const extraneousPropertyError = generateExtraneousPropertyError();
    const missingPropertyError = generateMissingPropertyError();
    const invalidValueErrorInt = generateInvalidValueErrorInt(data);
    const invalidValueErrorArray = generateInvalidValueErrorArray(data);

    expectSchemaFails(SCHEMAS.singleValue, data, invalidValueErrorInt);
    expectSchemaFails(SCHEMAS.object, data, [missingPropertyError, extraneousPropertyError]);
    expectSchemaFails(SCHEMAS.array, data, invalidValueErrorArray);
    expectSchemaFails(SCHEMAS.objectWithOptionalProperty, data, extraneousPropertyError);
    expectSchemaFails(SCHEMAS.objectWithOptionalArray, data, extraneousPropertyError);
    expectSchemaFails(SCHEMAS.singleUniqueValue, data, invalidValueErrorInt);
    expectSchemaFails(SCHEMAS.uniqueArray, data, invalidValueErrorArray);
    expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, invalidValueErrorArray);
    expectSchemaFails(SCHEMAS.objectWithOptionalAndUniqueProperty, data, extraneousPropertyError);
    expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, data, extraneousPropertyError);
  });
}

["", "hello", true, false, null, undefined, NaN].forEach(function(value) {
  testSingleDataValue(value);
});

test("test int data", () => {
  let data = 5;
  const invalidValueError = generateInvalidValueError(data);
  const invalidValueErrorArray = generateInvalidValueErrorArray(data);

  expectSchemaPasses(SCHEMAS.singleValue, data);
  expectSchemaFails(SCHEMAS.object, data, invalidValueError);
  expectSchemaFails(SCHEMAS.array, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.objectWithOptionalProperty, data, invalidValueError);
  expectSchemaFails(SCHEMAS.objectWithOptionalArray, data, invalidValueError);
  expectSchemaPasses(SCHEMAS.singleUniqueValue, data);
  expectSchemaFails(SCHEMAS.uniqueArray, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.objectWithOptionalAndUniqueProperty, data, invalidValueError);
  expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, data, invalidValueError);
});

test("test empty object data", () => {
  let data = {};
  const missingPropertyError = generateMissingPropertyError();
  const invalidValueErrorInt = generateInvalidValueErrorInt(data);
  const invalidValueErrorArray = generateInvalidValueErrorArray(data);

  expectSchemaFails(SCHEMAS.singleValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.object, data, missingPropertyError);
  expectSchemaFails(SCHEMAS.array, data, invalidValueErrorArray);
  expectSchemaPasses(SCHEMAS.objectWithOptionalProperty, data);
  expectSchemaPasses(SCHEMAS.objectWithOptionalArray, data);
  expectSchemaFails(SCHEMAS.singleUniqueValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.uniqueArray, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, invalidValueErrorArray);
  expectSchemaPasses(SCHEMAS.objectWithOptionalAndUniqueProperty, data);
  expectSchemaPasses(SCHEMAS.optionalArrayWithUniqueElements, data);
});

test("test {a: 5} data", () => {
  let data = { a: 5 };
  const invalidValueErrorInt = generateInvalidValueErrorInt(data);
  const invalidValueErrorArray = generateInvalidValueErrorArray(data);
  const invalidValueErrorArrayKey = generateInvalidValueErrorArrayKey(data.a);

  expectSchemaFails(SCHEMAS.singleValue, data, invalidValueErrorInt);
  expectSchemaPasses(SCHEMAS.object, data);
  expectSchemaFails(SCHEMAS.array, data, invalidValueErrorArray);
  expectSchemaPasses(SCHEMAS.objectWithOptionalProperty, data);
  expectSchemaFails(SCHEMAS.objectWithOptionalArray, data, invalidValueErrorArrayKey);
  expectSchemaFails(SCHEMAS.singleUniqueValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.uniqueArray, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, invalidValueErrorArray);
  expectSchemaPasses(SCHEMAS.objectWithOptionalAndUniqueProperty, data);
  expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, data, invalidValueErrorArrayKey);
});

test("test {b: 5} data", () => {
  let data = { b: 5 };
  const extraneousPropertyError = generateExtraneousPropertyError();
  const missingPropertyError = generateMissingPropertyError();
  const invalidValueErrorInt = generateInvalidValueErrorInt(data);
  const invalidValueErrorArray = generateInvalidValueErrorArray(data);

  expectSchemaFails(SCHEMAS.singleValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.object, data, [missingPropertyError, extraneousPropertyError]);
  expectSchemaFails(SCHEMAS.array, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.objectWithOptionalProperty, data, extraneousPropertyError);
  expectSchemaFails(SCHEMAS.objectWithOptionalArray, data, extraneousPropertyError);
  expectSchemaFails(SCHEMAS.singleUniqueValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.uniqueArray, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.objectWithOptionalAndUniqueProperty, data, extraneousPropertyError);
  expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, data, extraneousPropertyError);
});

test("test empty array and [5] data", () => {
  const datas = [[], [5]];

  datas.forEach(function(data) {
    const invalidValueError = generateInvalidValueError(data);
    const invalidValueErrorInt = generateInvalidValueErrorInt(data);

    expectSchemaFails(SCHEMAS.singleValue, data, invalidValueErrorInt);
    expectSchemaFails(SCHEMAS.object, data, invalidValueError);
    expectSchemaPasses(SCHEMAS.array, data);
    expectSchemaFails(SCHEMAS.objectWithOptionalProperty, data, invalidValueError);
    expectSchemaFails(SCHEMAS.objectWithOptionalArray, data, invalidValueError);
    expectSchemaFails(SCHEMAS.singleUniqueValue, data, invalidValueErrorInt);
    expectSchemaPasses(SCHEMAS.uniqueArray, data);
    expectSchemaPasses(SCHEMAS.arrayWithUniqueElements, data);
    expectSchemaFails(SCHEMAS.objectWithOptionalAndUniqueProperty, data, invalidValueError);
    expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, data, invalidValueError);
  });
});

test("test date data", () => {
  let data = new Date();
  const missingPropertyError = generateMissingPropertyError();
  const invalidValueErrorInt = generateInvalidValueErrorInt(data);
  const invalidValueErrorArray = generateInvalidValueErrorArray(data);

  expectSchemaFails(SCHEMAS.singleValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.object, data, missingPropertyError);
  expectSchemaFails(SCHEMAS.array, data, invalidValueErrorArray);
  expectSchemaPasses(SCHEMAS.objectWithOptionalProperty, data);
  expectSchemaPasses(SCHEMAS.objectWithOptionalArray, data);
  expectSchemaFails(SCHEMAS.singleUniqueValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.uniqueArray, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, invalidValueErrorArray);
  expectSchemaPasses(SCHEMAS.objectWithOptionalAndUniqueProperty, data);
  expectSchemaPasses(SCHEMAS.optionalArrayWithUniqueElements, data);
});

test("test {a: date} data", () => {
  let data = { a: new Date() };
  const invalidValueErrorInt = generateInvalidValueErrorInt(data);
  const invalidValueErrorIntKey = generateInvalidValueErrorIntKey(data.a);
  const invalidValueErrorArray = generateInvalidValueErrorArray(data);
  const invalidValueErrorArrayKey = generateInvalidValueErrorArrayKey(data.a);

  expectSchemaFails(SCHEMAS.singleValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.object, data, invalidValueErrorIntKey);
  expectSchemaFails(SCHEMAS.array, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.objectWithOptionalProperty, data, invalidValueErrorIntKey);
  expectSchemaFails(SCHEMAS.objectWithOptionalArray, data, invalidValueErrorArrayKey);
  expectSchemaFails(SCHEMAS.singleUniqueValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.uniqueArray, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, invalidValueErrorArray);
  expectSchemaFails(SCHEMAS.objectWithOptionalAndUniqueProperty, data, invalidValueErrorIntKey);
  expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, data, invalidValueErrorArrayKey);
});

test("test [date] data", () => {
  const data = [new Date()];
  const invalidValueError = generateInvalidValueError(data);
  const invalidValueErrorInt = generateInvalidValueErrorInt(data);
  const invalidValueErrorArrayElement = generateInvalidValueErrorArrayElement(data[0]);

  expectSchemaFails(SCHEMAS.singleValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.object, data, invalidValueError);
  expectSchemaFails(SCHEMAS.array, data, invalidValueErrorArrayElement);
  expectSchemaFails(SCHEMAS.objectWithOptionalProperty, data, invalidValueError);
  expectSchemaFails(SCHEMAS.objectWithOptionalArray, data, invalidValueError);
  expectSchemaFails(SCHEMAS.singleUniqueValue, data, invalidValueErrorInt);
  expectSchemaFails(SCHEMAS.uniqueArray, data, invalidValueErrorArrayElement);
  expectSchemaFails(SCHEMAS.arrayWithUniqueElements, data, invalidValueErrorArrayElement);
  expectSchemaFails(SCHEMAS.objectWithOptionalAndUniqueProperty, data, invalidValueError);
  expectSchemaFails(SCHEMAS.optionalArrayWithUniqueElements, data, invalidValueError);
});
