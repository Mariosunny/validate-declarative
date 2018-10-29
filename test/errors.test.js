import { generateSchemaExpects, standardValues, standardValuesExcept, testObject } from "./testUtils";
import unravel from "unravel-function";
import { $ELEMENT, $META, $OPTIONAL, $TEST, $TYPE } from "../src/keys";
import { int, verify } from "../src";

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
