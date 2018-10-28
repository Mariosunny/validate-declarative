import {
  ALLOW_EXTRANEOUS,
  THROW_ON_ERROR,
  OPTIONS as OPTIONS_LIST,
  DEFAULT_GLOBAL_OPTIONS,
  globalOptions,
} from "../src/options";
import { generateSchemaExpects } from "./testUtils";
import { configureValidation } from "../src/validate";
import { EXTRANEOUS_PROPERTY_ERROR, INVALID_VALUE_ERROR } from "../src/errors";
import _ from "lodash";
import { int } from "../src/types";

const { expectSchemaPasses, expectSchemaFails, expectSchemaThrows, expectSchemaNotThrows } = generateSchemaExpects();

function resetGlobalOptions() {
  configureValidation();
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

function testOptionValues(optionName, validValues, invalidValues) {
  let options = {};

  validValues.forEach(function(value) {
    test(`${optionName} does not throw with value ${value}`, () => {
      options[optionName] = value;

      expectSchemaNotThrows({}, {}, options);

      expect(() => configureValidation(options)).not.toThrow();
      expectSchemaNotThrows({}, {}, options);
      expectSchemaNotThrows({}, {});
    });
  });

  invalidValues.forEach(function(value) {
    test(`${optionName} does throws with value ${value}`, () => {
      options[optionName] = value;

      expectSchemaThrows({}, {}, options);
      expect(() => configureValidation(options)).toThrow();
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
  expect(() => configureValidation(options)).not.toThrow();
});

test("global options only reset to default when configureValidation() is called with no arguments", () => {
  let options = _.cloneDeep(DEFAULT_GLOBAL_OPTIONS);

  OPTIONS_LIST.forEach(function(optionName) {
    OPTIONS[optionName].forEach(function(value) {
      options[optionName] = value;
      configureValidation(options);
      expect(globalOptions).toEqual(options);
    });
  });

  configureValidation();
  expect(globalOptions).toEqual(DEFAULT_GLOBAL_OPTIONS);
});

describe(`test ${ALLOW_EXTRANEOUS} option`, () => {
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
  configureValidation(falseOptions);
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
  configureValidation(trueOptions);
  expectSchemaPasses(schema, data1);
  expectSchemaPasses(schema, data2);
  expectSchemaPasses(schema, data1, trueOptions);
  expectSchemaPasses(schema, data2, trueOptions);
  expectSchemaPasses(schema, data1, falseOptions);
  expectSchemaFails(schema, data2, error, falseOptions);
});

describe(`test ${THROW_ON_ERROR} option`, () => {
  const schema = {
    a: int,
  };

  let data1 = {
    a: 5,
  };

  let data2 = {
    a: "hello",
  };

  const error = { key: "a", error: INVALID_VALUE_ERROR, value: "hello", expectedType: int };

  let trueOptions = {
    [THROW_ON_ERROR]: true,
  };
  let falseOptions = {
    [THROW_ON_ERROR]: false,
  };

  expectSchemaPasses(schema, data1);
  expectSchemaNotThrows(schema, data1);
  expectSchemaFails(schema, data2, error);
  expectSchemaNotThrows(schema, data2);
  expectSchemaPasses(schema, data1, falseOptions);
  expectSchemaNotThrows(schema, data1, falseOptions);
  expectSchemaFails(schema, data2, error, falseOptions);
  expectSchemaNotThrows(schema, data2, falseOptions);
  configureValidation(falseOptions);
  expectSchemaPasses(schema, data1);
  expectSchemaNotThrows(schema, data1);
  expectSchemaFails(schema, data2, error);
  expectSchemaNotThrows(schema, data2);
  expectSchemaPasses(schema, data1, falseOptions);
  expectSchemaNotThrows(schema, data1, falseOptions);
  expectSchemaFails(schema, data2, error, falseOptions);
  expectSchemaNotThrows(schema, data2, falseOptions);
  expectSchemaPasses(schema, data1, trueOptions);
  expectSchemaNotThrows(schema, data1, trueOptions);
  expectSchemaThrows(schema, data2, trueOptions);

  resetGlobalOptions();

  expectSchemaPasses(schema, data1);
  expectSchemaNotThrows(schema, data1);
  expectSchemaFails(schema, data2, error);
  expectSchemaPasses(schema, data1, trueOptions);
  expectSchemaNotThrows(schema, data1, trueOptions);
  expectSchemaThrows(schema, data2, trueOptions);
  configureValidation(trueOptions);
  expectSchemaPasses(schema, data1);
  expectSchemaNotThrows(schema, data1);
  expectSchemaThrows(schema, data2);
  expectSchemaPasses(schema, data1, trueOptions);
  expectSchemaNotThrows(schema, data1, trueOptions);
  expectSchemaThrows(schema, data2, trueOptions);
  expectSchemaPasses(schema, data1, falseOptions);
  expectSchemaNotThrows(schema, data1, falseOptions);
  expectSchemaFails(schema, data2, error, falseOptions);
  expectSchemaNotThrows(schema, data2, falseOptions);
});
