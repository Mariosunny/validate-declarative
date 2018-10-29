import {
  _resetSchema,
  any,
  array,
  boolean,
  date,
  DUPLICATE_VALUE_ERROR,
  falsy,
  func,
  int,
  INVALID_VALUE_ERROR,
  list,
  nanValue,
  negativeInt,
  negativeNumber,
  nonNegativeInt,
  nonNegativeNumber,
  nonPositiveInt,
  nonPositiveNumber,
  nullValue,
  number,
  object,
  optionalAny,
  optionalArray,
  optionalBoolean,
  optionalDate,
  optionalFalsy,
  optionalFunc,
  optionalInt,
  optionalList,
  optionalNanValue,
  optionalNegativeInt,
  optionalNegativeNumber,
  optionalNonNegativeInt,
  optionalNonNegativeNumber,
  optionalNonPositiveInt,
  optionalNonPositiveNumber,
  optionalNullValue,
  optionalNumber,
  optionalObject,
  optionalPositiveInt,
  optionalPositiveNumber,
  optionalRegexp,
  optionalString,
  optionalSymbol,
  optionalTruthy,
  optionalUndefinedValue,
  positiveInt,
  positiveNumber,
  regexp,
  string,
  symbol,
  truthy,
  typeWithInstanceOf,
  undefinedValue,
  uniqueAny,
  uniqueArray,
  uniqueBoolean,
  uniqueDate,
  uniqueFalsy,
  uniqueFunc,
  uniqueInt,
  uniqueList,
  uniqueNegativeInt,
  uniqueNegativeNumber,
  uniqueNonNegativeInt,
  uniqueNonNegativeNumber,
  uniqueNonPositiveInt,
  uniqueNonPositiveNumber,
  uniqueNullValue,
  uniqueNumber,
  uniqueObject,
  uniquePositiveInt,
  uniquePositiveNumber,
  uniqueRegexp,
  uniqueString,
  uniqueSymbol,
  uniqueTruthy,
  uniqueUndefinedValue,
} from "../src";
import unravel from "unravel-function";
import _ from "lodash";
import { generateSchemaExpects, standardValues, standardValuesExcept, testObject } from "./testUtils";
import { $NAME, $TYPE } from "../src/keys";

const { expectSchemaPasses, expectSchemaFails } = generateSchemaExpects();

const testTypeWith = unravel(function(type, optionalType, uniqueType, validValues, invalidValues) {
  validValues = validValues || [];
  invalidValues = invalidValues || [];

  test(`test ${type.$name} type`, () => {
    [type, optionalType, uniqueType].forEach(function(type_) {
      if (!type_) {
        return;
      }
      const objectSchema = { a: type_ };
      const arraySchema = { $element: type_ };
      const name = type_.hasOwnProperty($NAME) ? type_[$NAME] : type_[$TYPE][$NAME];
      validValues.forEach(function(value) {
        expectSchemaPasses(type_, value);
        expectSchemaPasses(objectSchema, { a: value });
        expectSchemaPasses(arraySchema, [value]);
        _resetSchema(type_);
        _resetSchema(objectSchema);
        _resetSchema(arraySchema);
      });
      invalidValues.forEach(function(value) {
        expectSchemaFails(type_, value, { error: INVALID_VALUE_ERROR, expectedType: name, value: value });
        expectSchemaFails(
          objectSchema,
          { a: value },
          { error: INVALID_VALUE_ERROR, key: "a", expectedType: name, value: value }
        );
        expectSchemaFails(arraySchema, [value], {
          error: INVALID_VALUE_ERROR,
          key: "[0]",
          expectedType: name,
          value: value,
        });
        _resetSchema(type_);
        _resetSchema(objectSchema);
        _resetSchema(arraySchema);
      });
    });
  });

  const optionalSchema = { a: optionalType };
  test(`test optional ${type.$name} type`, () => {
    validValues.forEach(function(value) {
      expectSchemaPasses(optionalSchema, { a: value });
      expectSchemaPasses(optionalSchema, {});
    });
  });

  if (uniqueType) {
    const uniqueSchema = uniqueType;
    const uniqueObjectSchema = { a: uniqueType };
    const uniqueArraySchema = { $element: uniqueType };
    test(`test unique ${type.$name} type`, () => {
      validValues.forEach(function(value) {
        if (nanValue.$test(value)) {
          return;
        }
        expectSchemaPasses(uniqueSchema, value);
        expectSchemaFails(uniqueSchema, value, { error: DUPLICATE_VALUE_ERROR, value: value });
        _resetSchema(uniqueSchema);

        let data = { a: value };
        expectSchemaPasses(uniqueObjectSchema, data);
        expectSchemaFails(uniqueObjectSchema, data, { error: DUPLICATE_VALUE_ERROR, key: "a", value: value });
        _resetSchema(uniqueObjectSchema);

        expectSchemaPasses(uniqueArraySchema, [value]);
        _resetSchema(uniqueArraySchema);
        expectSchemaFails(uniqueArraySchema, [value, value], {
          error: DUPLICATE_VALUE_ERROR,
          key: "[1]",
          value: value,
        });
        _resetSchema(uniqueArraySchema);
      });
    });
  }
});

class TestClass {
  constructor() {}
}

testTypeWith
  .type(string)
  .optionalType(optionalString)
  .uniqueType(uniqueString)
  .validValues(["", "hello"])
  .invalidValues(standardValuesExcept("string", "emptyString"));

testTypeWith
  .type(number)
  .optionalType(optionalNumber)
  .uniqueType(uniqueNumber)
  .validValues([-Number.MAX_VALUE, Number.MAX_VALUE, -5, 0, 5, 7 / 3, 8.4, Infinity, -Infinity])
  .invalidValues(standardValuesExcept("number", "int", "infinity", "negativeInfinity"));

testTypeWith
  .type(nonPositiveNumber)
  .optionalType(optionalNonPositiveNumber)
  .uniqueType(uniqueNonPositiveNumber)
  .validValues([-Infinity, -Number.MAX_VALUE, -5.5, 0])
  .invalidValues(standardValuesExcept("number", "int", "infinity", "negativeInfinity"));

testTypeWith
  .type(negativeNumber)
  .optionalType(optionalNegativeNumber)
  .uniqueType(uniqueNegativeNumber)
  .validValues([-Infinity, -Number.MAX_VALUE, -5.5, -Number.MIN_VALUE])
  .invalidValues(standardValuesExcept("number", "int", "infinity", "negativeInfinity"));

testTypeWith
  .type(nonNegativeNumber)
  .optionalType(optionalNonNegativeNumber)
  .uniqueType(uniqueNonNegativeNumber)
  .validValues([0, 5.5, Number.MAX_VALUE, Infinity])
  .invalidValues(standardValuesExcept("number", "int", "infinity", "negativeInfinity"));

testTypeWith
  .type(positiveNumber)
  .optionalType(optionalPositiveNumber)
  .uniqueType(uniquePositiveNumber)
  .validValues([Number.MIN_VALUE, 5.5, Number.MAX_VALUE, Infinity])
  .invalidValues(standardValuesExcept("number", "int", "infinity", "negativeInfinity"));

testTypeWith
  .type(int)
  .optionalType(optionalInt)
  .uniqueType(uniqueInt)
  .validValues([Number.MIN_SAFE_INTEGER, -1, 0, 1, 100000, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE])
  .invalidValues(standardValuesExcept("int").concat([Number.MIN_VALUE]));

testTypeWith
  .type(nonPositiveInt)
  .optionalType(optionalNonPositiveInt)
  .uniqueType(uniqueNonPositiveInt)
  .validValues([Number.MIN_SAFE_INTEGER, -1, 0])
  .invalidValues(standardValuesExcept("int").concat([Number.MIN_VALUE, 1, Number.MAX_VALUE, Number.MAX_SAFE_INTEGER]));

testTypeWith
  .type(negativeInt)
  .optionalType(optionalNegativeInt)
  .uniqueType(uniqueNegativeInt)
  .validValues([Number.MIN_SAFE_INTEGER, -1])
  .invalidValues(
    standardValuesExcept("int").concat([Number.MIN_VALUE, 0, 1, Number.MAX_VALUE, Number.MAX_SAFE_INTEGER])
  );

testTypeWith
  .type(nonNegativeInt)
  .optionalType(optionalNonNegativeInt)
  .uniqueType(uniqueNonNegativeInt)
  .validValues([0, 1, 100000, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE])
  .invalidValues(standardValuesExcept("int").concat([-1, Number.MIN_SAFE_INTEGER, Number.MIN_VALUE]));

testTypeWith
  .type(positiveInt)
  .optionalType(optionalPositiveInt)
  .uniqueType(uniquePositiveInt)
  .validValues([1, 100000, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE])
  .invalidValues(standardValuesExcept("int").concat([-1, 0, Number.MIN_SAFE_INTEGER, Number.MIN_VALUE]));

testTypeWith
  .type(boolean)
  .optionalType(optionalBoolean)
  .uniqueType(uniqueBoolean)
  .validValues([true, false])
  .invalidValues(standardValuesExcept("boolean"));

testTypeWith
  .type(truthy)
  .optionalType(optionalTruthy)
  .uniqueType(uniqueTruthy)
  .validValues(standardValuesExcept("emptyString", "nullValue", "undefinedValue", "nanValue").concat([true]))
  .invalidValues([false, 0, "", null, undefined, NaN]);

testTypeWith
  .type(falsy)
  .optionalType(optionalFalsy)
  .uniqueType(uniqueFalsy)
  .validValues([false, 0, "", null, undefined, NaN])
  .invalidValues(standardValuesExcept("emptyString", "nullValue", "undefinedValue", "nanValue").concat([true]));

const ARRAY_VALID_VALUES = [[], [[]], [[[[[[[[[]]]]]]]]], new Array(), new Array([]), new Array([[[[[[[[[]]]]]]]]])]
  .concat(
    _.values(standardValues)
      .concat({ a: 5 })
      .map(function(value) {
        return [value, [value], [[value]]];
      })
  )
  .concat(
    _.values(standardValues)
      .concat({ a: 5 })
      .map(function(value) {
        return new Array(value, [value], [[value]]);
      })
  );

testTypeWith
  .type(array)
  .optionalType(optionalArray)
  .uniqueType(uniqueArray)
  .validValues(ARRAY_VALID_VALUES)
  .invalidValues(standardValuesExcept("array", "newArray"));

testTypeWith
  .type(list)
  .optionalType(optionalList)
  .uniqueType(uniqueList)
  .validValues(
    ARRAY_VALID_VALUES.concat(
      [
        new Set(),
        new WeakSet(),
        new Set([]),
        new WeakSet([]),
        new Set([[]]),
        new Set([[[[[[[[[]]]]]]]]]),
        new Set(new Array()),
        new Set(new Array([])),
        new Set(new Array([[[[[[[[[]]]]]]]]])),
        new Set([new Set()]),
        new Set([new WeakSet()]),
        new WeakSet([[[[[[[[[]]]]]]]]]),
        new WeakSet(new Array()),
        new WeakSet(new Array([])),
        new WeakSet(new Array([[[[[[[[[]]]]]]]]])),
        new WeakSet([new WeakSet()]),
        new WeakSet([new Set()]),
        [new Set()],
        [new WeakSet()],
      ]
        .concat(
          _.values(standardValues)
            .concat({ a: 5 })
            .map(function(value) {
              return new Set([value, [value], [[value]]]);
            })
        )
        .concat(
          _.values(standardValues)
            .concat({ a: 5 })
            .map(function(value) {
              let set = new WeakSet();
              try {
                set = new WeakSet([value, [value], [[value]]]);
              } catch (error) {}
              return set;
            })
        )
    )
  )
  .invalidValues(standardValuesExcept("array", "newArray", "set", "weakSet"));

testTypeWith
  .type(object)
  .optionalType(optionalObject)
  .uniqueType(uniqueObject)
  .validValues([
    {},
    { b: 5 },
    new TestClass(),
    Object.create(null),
    new Object(),
    new function() {}(),
    new Set(),
    new WeakSet(),
    new Map(),
    new WeakMap(),
    new Date(),
    [],
    new Array(),
    /\w+/,
  ])
  .invalidValues([
    5.5,
    5,
    Infinity,
    -Infinity,
    "",
    "hello",
    undefined,
    null,
    NaN,
    Symbol(),
    function() {},
    () => {},
    testObject.func,
    new Function("a", "return a"),
  ]);

testTypeWith
  .type(func)
  .optionalType(optionalFunc)
  .uniqueType(uniqueFunc)
  .validValues([
    () => {},
    function() {},
    testObject.func,
    new Function("a", "return a"),
    Date,
    Date.now,
    Set,
    decodeURI,
    eval,
    isNaN,
    parseInt,
    String,
    Number,
    Boolean,
  ])
  .invalidValues(standardValuesExcept("func", "fatArrowFunc", "embeddedFunc", "newFunc"));

testTypeWith
  .type(date)
  .optionalType(optionalDate)
  .uniqueType(uniqueDate)
  .validValues([new Date(), new Date(null), new Date("hello world"), new Date(2018, 11, 24, 10, 33, 30, 0)])
  .invalidValues(
    standardValuesExcept("date").concat([Date, Date(), Date.now(), "Sat Oct 06 2018 17:43:52 GMT-0500 (CDT)"])
  );

let fooSymbol = Symbol("foo");

testTypeWith
  .type(symbol)
  .optionalType(optionalSymbol)
  .uniqueType(uniqueSymbol)
  .validValues([Symbol(), Symbol(null), fooSymbol, Symbol.for(null), Symbol.for("foo")])
  .invalidValues(standardValuesExcept("symbol").concat([Object(Symbol())]));

testTypeWith
  .type(regexp)
  .optionalType(optionalRegexp)
  .uniqueType(uniqueRegexp)
  .validValues([/./, /./gimuy, new RegExp("."), new RegExp(".", "yimug"), /^\(*\d{3}\)*( |-)*\d{3}( |-)*\d{4}$/])
  .invalidValues(standardValuesExcept("regexp"));

testTypeWith
  .type(nullValue)
  .optionalType(optionalNullValue)
  .uniqueType(uniqueNullValue)
  .validValues([null])
  .invalidValues(standardValuesExcept("nullValue"));

testTypeWith
  .type(undefinedValue)
  .optionalType(optionalUndefinedValue)
  .uniqueType(uniqueUndefinedValue)
  .validValues([undefined])
  .invalidValues(standardValuesExcept("undefinedValue"));

testTypeWith
  .type(nanValue)
  .optionalType(optionalNanValue)
  .uniqueType(null)
  .validValues([NaN])
  .invalidValues(standardValuesExcept("nanValue"));

testTypeWith
  .type(any)
  .optionalType(optionalAny)
  .uniqueType(uniqueAny)
  .validValues(standardValuesExcept())
  .invalidValues([]);

describe("test typeWithInstanceOf", () => {
  let CLASSES = [
    Object,
    Function,
    Boolean,
    Number,
    Date,
    String,
    RegExp,
    Array,
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
    Map,
    Set,
    WeakMap,
    WeakSet,
    ArrayBuffer,
    SharedArrayBuffer,
    Promise,
    TestClass,
  ];

  let INSTANCES = [
    new Object(),
    new Function(),
    new Boolean(),
    new Number(),
    new Date(),
    new String(),
    new RegExp(),
    new Array(),
    new Int8Array(),
    new Uint8Array(),
    new Uint8ClampedArray(),
    new Int16Array(),
    new Uint16Array(),
    new Int32Array(),
    new Uint32Array(),
    new Float32Array(),
    new Float64Array(),
    new Map(),
    new Set(),
    new WeakMap(),
    new WeakSet(),
    new ArrayBuffer(),
    new SharedArrayBuffer(),
    new Promise(function() {}),
    new TestClass(),
  ];

  expect(typeWithInstanceOf(Date, "customType").$name).toEqual("customType");

  CLASSES.forEach(function(clazz, i) {
    let customType = typeWithInstanceOf(clazz);
    let instance = INSTANCES[i];

    test(`with ${customType.$name}`, () => {
      expectSchemaPasses(customType, instance);
      expectSchemaFails(nullValue, instance, {
        error: INVALID_VALUE_ERROR,
        value: instance,
        expectedType: nullValue,
      });
      expectSchemaFails(undefinedValue, instance, {
        error: INVALID_VALUE_ERROR,
        value: instance,
        expectedType: undefinedValue,
      });
      expectSchemaFails(nanValue, instance, {
        error: INVALID_VALUE_ERROR,
        value: instance,
        expectedType: nanValue,
      });
    });
  });
});
