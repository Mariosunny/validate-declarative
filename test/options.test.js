import {
  ALLOW_EXTRANEOUS,
  THROW_ON_ERROR,
  OPTIONS as OPTIONS_LIST,
  DEFAULT_GLOBAL_OPTIONS,
  globalOptions,
} from "../src/options";
import { generateSchemaExpects } from "./testUtils";
import {
  int,
  EXTRANEOUS_PROPERTY_ERROR,
  INVALID_VALUE_ERROR,
  setGlobalValidationOptions,
  MISSING_PROPERTY_ERROR,
  DUPLICATE_VALUE_ERROR,
  verify,
  uniqueInt,
} from "../src";
import _ from "lodash";

const { expectSchemaPasses, expectSchemaFails, expectSchemaThrows, expectSchemaNotThrows } = generateSchemaExpects();

function resetGlobalOptions() {
  setGlobalValidationOptions();
}

beforeEach(() => {
  resetGlobalOptions();
});

afterEach(() => {
  resetGlobalOptions();
});

const VALID_BOOLEAN_OPTION_VALUES = [true, false];
const INVALID_BOOLEAN_OPTION_VALUES = [5.5, 5, 0, Infinity, -Infinity, "", "hello", null, NaN, {}];

const OPTIONS = {
  [THROW_ON_ERROR]: VALID_BOOLEAN_OPTION_VALUES,
  [ALLOW_EXTRANEOUS]: VALID_BOOLEAN_OPTION_VALUES,
};
const NUMBER_OF_OPTIONS = OPTIONS_LIST.length;

test("options should be key-value object", () => {
  const validValues = [];
  const invalidValues = [5.5, function() {}, Infinity, -Infinity, "", "hello", null, NaN, true, false];

  for (let i = 0; i < Math.pow(2, NUMBER_OF_OPTIONS); i++) {
    let options = {};

    for (let j = 0; j < NUMBER_OF_OPTIONS; j++) {
      let optionName = OPTIONS_LIST[j];
      if ((i & (1 << j)) >> j) {
        options[optionName] = OPTIONS[optionName][0];
      }
    }
    validValues.push(options);
  }

  validValues.forEach(function(options) {
    expectSchemaNotThrows({}, {}, options);
  });

  invalidValues.forEach(function(options) {
    expectSchemaThrows({}, {}, options);
  });
});

test("extraneous keys in options are ignored", () => {
  expect(() => verify({}, {}, { a: 5 })).not.toThrow();
  expect(() => setGlobalValidationOptions({ a: 5 })).not.toThrow();
});

function testOptionValues(optionName, validValues, invalidValues) {
  let options = {};

  validValues.forEach(function(value) {
    test(`${optionName} does not throw with value ${value}`, () => {
      options[optionName] = value;

      expectSchemaNotThrows({}, {}, options);

      expect(() => setGlobalValidationOptions(options)).not.toThrow();
      expectSchemaNotThrows({}, {}, options);
      expectSchemaNotThrows({}, {});
    });
  });

  invalidValues.forEach(function(value) {
    test(`${optionName} does throws with value ${value}`, () => {
      options[optionName] = value;

      expectSchemaThrows({}, {}, options);
      expect(() => setGlobalValidationOptions(options)).toThrow();
    });
  });
}

testOptionValues(ALLOW_EXTRANEOUS, VALID_BOOLEAN_OPTION_VALUES, INVALID_BOOLEAN_OPTION_VALUES);
testOptionValues(THROW_ON_ERROR, VALID_BOOLEAN_OPTION_VALUES, INVALID_BOOLEAN_OPTION_VALUES);

test("extraneous properties in options are ignored", () => {
  let options = _.cloneDeep(DEFAULT_GLOBAL_OPTIONS);
  options.a = 5;
  options.b = true;

  expectSchemaNotThrows({}, {}, options);
  expect(() => setGlobalValidationOptions(options)).not.toThrow();
});

test("global options only reset to default when setGlobalValidationOptions() is called with no arguments", () => {
  let options = _.cloneDeep(DEFAULT_GLOBAL_OPTIONS);

  OPTIONS_LIST.forEach(function(optionName) {
    OPTIONS[optionName].forEach(function(value) {
      options[optionName] = value;
      setGlobalValidationOptions(options);
      expect(globalOptions).toEqual(options);
    });
  });

  setGlobalValidationOptions();
  expect(globalOptions).toEqual(DEFAULT_GLOBAL_OPTIONS);
});

test(`test ${ALLOW_EXTRANEOUS} option basic functionality`, () => {
  const schema = {
    a: int,
  };

  let data1 = {
    a: 5,
  };

  let data2 = {
    a: 5,
    b: 6,
  };

  const error = { key: "b", error: EXTRANEOUS_PROPERTY_ERROR };

  let falseOptions = {
    [ALLOW_EXTRANEOUS]: false,
  };
  let trueOptions = {
    [ALLOW_EXTRANEOUS]: true,
  };

  expectSchemaPasses(schema, data1);
  expectSchemaFails(schema, data2, error);
  expectSchemaPasses(schema, data1, falseOptions);
  expectSchemaFails(schema, data2, error, falseOptions);
  setGlobalValidationOptions(falseOptions);
  expectSchemaPasses(schema, data1);
  expectSchemaFails(schema, data2, error);
  expectSchemaPasses(schema, data1, falseOptions);
  expectSchemaFails(schema, data2, error, falseOptions);
  expectSchemaPasses(schema, data1, trueOptions);
  expectSchemaPasses(schema, data2, trueOptions);

  resetGlobalOptions();

  expectSchemaPasses(schema, data1);
  expectSchemaFails(schema, data2, error);
  expectSchemaPasses(schema, data1, trueOptions);
  expectSchemaPasses(schema, data2, trueOptions);
  setGlobalValidationOptions(trueOptions);
  expectSchemaPasses(schema, data1);
  expectSchemaPasses(schema, data2);
  expectSchemaPasses(schema, data1, trueOptions);
  expectSchemaPasses(schema, data2, trueOptions);
  expectSchemaPasses(schema, data1, falseOptions);
  expectSchemaFails(schema, data2, error, falseOptions);
});

function testThrowOnErrorOption(tests) {
  let trueOptions = {
    [THROW_ON_ERROR]: true,
  };
  let falseOptions = {
    [THROW_ON_ERROR]: false,
  };
  tests.forEach(function(t) {
    test(`test ${THROW_ON_ERROR} option with ${t.error.error}`, () => {
      const schema = t.schema;
      const validData = t.validData;
      const invalidData = t.invalidData;
      const error = t.error;
      const message = t.message;
      expectSchemaPasses(schema, validData);
      expectSchemaNotThrows(schema, validData);
      expectSchemaFails(schema, invalidData, error);
      expectSchemaNotThrows(schema, invalidData);
      expectSchemaPasses(schema, validData, falseOptions);
      expectSchemaNotThrows(schema, validData, falseOptions);
      expectSchemaFails(schema, invalidData, error, falseOptions);
      expectSchemaNotThrows(schema, invalidData, falseOptions);
      setGlobalValidationOptions(falseOptions);
      expectSchemaPasses(schema, validData);
      expectSchemaNotThrows(schema, validData);
      expectSchemaFails(schema, invalidData, error);
      expectSchemaNotThrows(schema, invalidData);
      expectSchemaPasses(schema, validData, falseOptions);
      expectSchemaNotThrows(schema, validData, falseOptions);
      expectSchemaFails(schema, invalidData, error, falseOptions);
      expectSchemaNotThrows(schema, invalidData, falseOptions);
      expectSchemaPasses(schema, validData, trueOptions);
      expectSchemaNotThrows(schema, validData, trueOptions);
      expectSchemaThrows(schema, invalidData, trueOptions);

      resetGlobalOptions();

      expectSchemaPasses(schema, validData);
      expectSchemaNotThrows(schema, validData);
      expectSchemaFails(schema, invalidData, error);
      expectSchemaPasses(schema, validData, trueOptions);
      expectSchemaNotThrows(schema, validData, trueOptions);
      expect(() => verify(schema, invalidData, trueOptions)).toThrow(message);
      setGlobalValidationOptions(trueOptions);
      expectSchemaPasses(schema, validData);
      expectSchemaNotThrows(schema, validData);
      expect(() => verify(schema, invalidData)).toThrow(message);
      expectSchemaPasses(schema, validData, trueOptions);
      expectSchemaNotThrows(schema, validData, trueOptions);
      expect(() => verify(schema, invalidData, trueOptions)).toThrow(message);
      expectSchemaPasses(schema, validData, falseOptions);
      expectSchemaNotThrows(schema, validData, falseOptions);
      expectSchemaFails(schema, invalidData, error, falseOptions);
      expectSchemaNotThrows(schema, invalidData, falseOptions);
    });
  });
}

testThrowOnErrorOption([
  {
    schema: int,
    validData: 5,
    invalidData: "hello",
    error: { error: INVALID_VALUE_ERROR, value: "hello", expectedType: int },
    message: `${INVALID_VALUE_ERROR}: value: hello, expectedType: ${int.$name}`,
  },
  {
    schema: { a: int },
    validData: { a: 5 },
    invalidData: { a: "hi" },
    error: { error: INVALID_VALUE_ERROR, key: "a", value: "hi", expectedType: int },
    message: `${INVALID_VALUE_ERROR}: key: a, value: hi, expectedType: ${int.$name}`,
  },
  {
    schema: { a: int },
    validData: { a: 5 },
    invalidData: {},
    error: { error: MISSING_PROPERTY_ERROR, key: "a" },
    message: `${MISSING_PROPERTY_ERROR}: key: a`,
  },
]);
