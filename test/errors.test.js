import { generateSchemaExpects, standardValues, standardValuesExcept, testObject } from "./testUtils";
import unravel from "unravel-function";
import { $ELEMENT, $META, $OPTIONAL, $ROOT, $TEST, $TYPE } from "../src/keys";
import {
  DUPLICATE_VALUE_ERROR,
  EXTRANEOUS_PROPERTY_ERROR,
  int,
  INVALID_VALUE_ERROR,
  MISSING_PROPERTY_ERROR,
  verify,
} from "../src";
import { THROW_ON_ERROR } from "../src/options";

const { expectSchemaNotThrows, expectSchemaThrows } = generateSchemaExpects();

const expectConstraintWith = unravel(function(constraint, validValues, invalidValues, message) {
  const data = { a: 5 };
  test(message, () => {
    validValues.forEach(function(value) {
      expectSchemaNotThrows(
        {
          a: {
            [constraint]: value,
          },
        },
        data
      );
    });
    invalidValues.forEach(function(value) {
      expectSchemaThrows(
        {
          a: {
            [constraint]: value,
          },
        },
        data
      );
    });
  });
});

expectConstraintWith
  .constraint($TEST)
  .message(`schema throws when ${$TEST} is not a function or regular expression`)
  .validValues([
    standardValues.func,
    standardValues.fatArrowFunc,
    standardValues.embeddedFunc,
    standardValues.newFunc,
    new RegExp(),
    /\w/,
  ])
  .invalidValues(standardValuesExcept("func", "fatArrowFunc", "embeddedFunc", "newFunc", "regexp"));

expectConstraintWith
  .constraint($TYPE)
  .message(`schema throws when ${$TYPE} is not a key-value object`)
  .validValues([{}, { [$TYPE]: {} }, { [$TEST]: function() {} }, { [$TYPE]: {}, [$TEST]: function() {} }, { a: 5 }])
  .invalidValues(standardValuesExcept("emptyObject", "date"));

expectConstraintWith
  .constraint($ELEMENT)
  .message(`schema throws when ${$ELEMENT} is not a key-value object`)
  .validValues([{}, { a: 5 }])
  .invalidValues(standardValuesExcept("emptyObject", "date"));

test("non-key/value schema throws error", () => {
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

test("unique values per validation are discarded when schema throws (basic functionality)", () => {
  const schema1 = {
    a: {
      $unique: true,
      $type: int,
    },
    b: {
      c: {
        $unique: true,
        $type: int,
      },
    },
    d: {
      $type: true,
    },
  };
  const schema2 = {
    a: {
      $unique: true,
      $type: int,
    },
    b: {
      c: {
        $unique: true,
        $type: int,
      },
    },
    d: {
      $test: true,
    },
  };
  const schema3 = {
    a: {
      $unique: true,
      $type: int,
    },
    b: {
      c: {
        $unique: true,
        $type: int,
      },
    },
    d: {
      $element: true,
    },
  };
  let data = {
    a: 5,
    b: {
      c: 5,
    },
    d: 5,
  };

  [schema1, schema2, schema3].forEach(function(schema) {
    expectSchemaThrows(schema, data);
    expect(schema[$META].uniqueValues.a.length).toBe(0);
    expect(schema[$META].uniqueValuesLength.a).toBe(0);
    expect(schema[$META].uniqueValues["b.c"].length).toBe(0);
    expect(schema[$META].uniqueValuesLength["b.c"]).toBe(0);
  });
});

function expectUniqueValuesRolledBackOnThrowOnError(schema, data1, data2, data3) {
  const options = {
    [THROW_ON_ERROR]: true,
  };

  expectSchemaNotThrows(schema, data1, options);
  expect(schema[$META].uniqueValues["a"]).toEqual([5]);
  expect(schema[$META].uniqueValues["a"].length).toBe(1);
  expect(schema[$META].uniqueValuesLength["a"]).toBe(1);
  expectSchemaThrows(schema, data2, options);
  expect(schema[$META].uniqueValuesLength["a"]).toBe(1);
  expectSchemaNotThrows(schema, data3, options);
  expect(schema[$META].uniqueValues["a"]).toEqual([5, 7]);
  expect(schema[$META].uniqueValues["a"].length).toBe(2);
  expect(schema[$META].uniqueValuesLength["a"]).toBe(2);
}

test(`unique values are rolled back after schema throws (throwOnError = true, ${INVALID_VALUE_ERROR})`, () => {
  const schema = {
    a: {
      $unique: true,
      $type: int,
    },
    b: {
      $type: int,
    },
  };
  let data1 = {
    a: 5,
    b: 5,
  };
  let data2 = {
    a: 6,
    b: "hello",
  };
  let data3 = {
    a: 7,
    b: 5,
  };

  expectUniqueValuesRolledBackOnThrowOnError(schema, data1, data2, data3);
});

test(`unique values are rolled back after schema throws (throwOnError = true, ${DUPLICATE_VALUE_ERROR})`, () => {
  const schema = {
    a: {
      $unique: true,
      $type: int,
    },
    b: {
      $unique: true,
      $type: int,
    },
  };
  let data1 = {
    a: 5,
    b: 5,
  };
  let data2 = {
    a: 6,
    b: 5,
  };
  let data3 = {
    a: 7,
    b: 6,
  };

  expectUniqueValuesRolledBackOnThrowOnError(schema, data1, data2, data3);
});

test(`unique values are rolled back after schema throws (throwOnError = true, ${MISSING_PROPERTY_ERROR})`, () => {
  const schema = {
    a: {
      $unique: true,
      $type: int,
    },
    b: {
      $type: int,
    },
  };
  let data1 = {
    a: 5,
    b: 5,
  };
  let data2 = {
    a: 6,
  };
  let data3 = {
    a: 7,
    b: 5,
  };

  expectUniqueValuesRolledBackOnThrowOnError(schema, data1, data2, data3);
});

test(`unique values are rolled back after schema throws (throwOnError = true, ${EXTRANEOUS_PROPERTY_ERROR})`, () => {
  const schema = {
    a: {
      $unique: true,
      $type: int,
    },
    b: {
      $type: int,
    },
  };
  let data1 = {
    a: 5,
    b: 5,
  };
  let data2 = {
    a: 6,
    b: 5,
    c: 5,
  };
  let data3 = {
    a: 7,
    b: 5,
  };

  expectUniqueValuesRolledBackOnThrowOnError(schema, data1, data2, data3);
});

test("unique values are rolled back after schema throws (calling $test throws)", () => {
  const schema = {
    a: {
      $unique: true,
      $type: int,
    },
    b: {
      $test(object) {
        return object.charAt(2) === "c";
      },
    },
  };
  let data1 = {
    a: 5,
    b: "abc",
  };
  let data2 = {
    a: 6,
    b: 5,
  };
  let data3 = {
    a: 7,
    b: "abc",
  };

  expectSchemaNotThrows(schema, data1);
  expect(schema[$META].uniqueValues["a"]).toEqual([5]);
  expect(schema[$META].uniqueValues["a"].length).toBe(1);
  expect(schema[$META].uniqueValuesLength["a"]).toBe(1);
  expectSchemaThrows(schema, data2);
  expect(schema[$META].uniqueValuesLength["a"]).toBe(1);
  expectSchemaNotThrows(schema, data3);
  expect(schema[$META].uniqueValues["a"]).toEqual([5, 7]);
  expect(schema[$META].uniqueValues["a"].length).toBe(2);
  expect(schema[$META].uniqueValuesLength["a"]).toBe(2);
});

[
  { constraint: $TEST, validValue: () => {}, invalidValue: true },
  { constraint: $TYPE, validValue: {}, invalidValue: true },
  { constraint: $ELEMENT, validValue: {}, invalidValue: true },
].forEach(function({ constraint, validValue, invalidValue }) {
  test(`unique values are rolled back after schema throws (${constraint} is invalid)`, () => {
    const schema = {
      a: {
        $unique: true,
        $type: int,
      },
      b: {
        [constraint]: validValue,
      },
    };
    let data1 = {
      a: 5,
      b: "abc",
    };
    let data2 = {
      a: 6,
      b: 5,
    };
    let data3 = {
      a: 7,
      b: "abc",
    };

    expectSchemaNotThrows(schema, data1);
    expect(schema[$META].uniqueValues["a"]).toEqual([5]);
    expect(schema[$META].uniqueValues["a"].length).toBe(1);
    expect(schema[$META].uniqueValuesLength["a"]).toBe(1);
    schema.b[constraint] = invalidValue;
    expectSchemaThrows(schema, data2);
    expect(schema[$META].uniqueValuesLength["a"]).toBe(1);
    schema.b[constraint] = validValue;
    expectSchemaNotThrows(schema, data3);
    expect(schema[$META].uniqueValues["a"]).toEqual([5, 7]);
    expect(schema[$META].uniqueValues["a"].length).toBe(2);
    expect(schema[$META].uniqueValuesLength["a"]).toBe(2);
  });
});

test(`unique values are rolled back after schema throws (throwOnError = true, ${DUPLICATE_VALUE_ERROR} within array)`, () => {
  const schema = {
    $element: {
      $unique: true,
      $type: int,
    },
  };
  const options = {
    [THROW_ON_ERROR]: true,
  };
  let data1 = [1, 2, 3, 4, 4];
  let data2 = [5, 6];

  expectSchemaThrows(schema, data1, options);
  expect(schema[$META].uniqueValues["[x]"]).toEqual([1, 2, 3, 4]);
  expect(schema[$META].uniqueValues["[x]"].length).toBe(4);
  expect(schema[$META].uniqueValuesLength["[x]"]).toBe(0);
  expectSchemaThrows(schema, data1, options);
  expect(schema[$META].uniqueValues["[x]"]).toEqual([1, 2, 3, 4]);
  expect(schema[$META].uniqueValues["[x]"].length).toBe(4);
  expect(schema[$META].uniqueValuesLength["[x]"]).toBe(0);
  expectSchemaNotThrows(schema, data2, options);
  expect(schema[$META].uniqueValues["[x]"]).toEqual([5, 6]);
  expect(schema[$META].uniqueValues["[x]"].length).toBe(2);
  expect(schema[$META].uniqueValuesLength["[x]"]).toBe(2);
  expectSchemaThrows(schema, data1, options);
  expect(schema[$META].uniqueValues["[x]"]).toEqual([5, 6, 1, 2, 3, 4]);
  expect(schema[$META].uniqueValues["[x]"].length).toBe(6);
  expect(schema[$META].uniqueValuesLength["[x]"]).toBe(2);
  expectSchemaThrows(schema, data2, options);
  expect(schema[$META].uniqueValues["[x]"]).toEqual([5, 6]);
  expect(schema[$META].uniqueValues["[x]"].length).toBe(2);
  expect(schema[$META].uniqueValuesLength["[x]"]).toBe(2);
});
