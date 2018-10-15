import { verify } from "../src/validate";
import {
  string,
  number,
  nonPositiveNumber,
  negativeNumber,
  nonNegativeNumber,
  positiveNumber,
  int,
  nonPositiveInt,
  negativeInt,
  nonNegativeInt,
  positiveInt,
  boolean,
  truthy,
  falsy,
  array,
  set,
  weakSet,
  list,
  map,
  weakMap,
  object,
  func,
  date,
  symbol,
  regexp,
  nullValue,
  undefinedValue,
  nanValue,
  any,
  typeWithInstanceOf
} from "../src/types";
import unravel from "unravel-function";
import _ from "lodash";

const testTypeWith = unravel(function(type, validValues, invalidValues) {
  validValues = validValues || [];
  invalidValues = invalidValues || [];

  test(`check ${type.$name} type`, () => {
    validValues.forEach(function(value) {
      expect(verify(type, value)).toBe(true);
      expect(verify({ a: type }, { a: value })).toBe(true);
    });
    invalidValues.forEach(function(value) {
      expect(verify(type, value)).toBe(false);
      expect(verify({ a: type }, { a: value })).toBe(false);
    });
  });
});

class TestClass {
  constructor() {}
}
const testObject = {
  func() {}
};

const standardValues = {
  number: 5.5,
  int: 5,
  infinity: Infinity,
  negativeInfinity: -Infinity,
  emptyString: "",
  emptyObject: {},
  set: new Set(),
  map: new Map(),
  weakMap: new WeakMap(),
  weakSet: new WeakSet(),
  string: "hello",
  undefinedValue: undefined,
  nullValue: null,
  nanValue: NaN,
  boolean: true,
  date: new Date(),
  symbol: Symbol(),
  func: function() {},
  fatArrowFunc: () => {},
  embeddedFunc: testObject.func,
  newFunc: new Function("a", "return a"),
  regexp: /\w+/,
  array: [],
  newArray: new Array()
};

function standardValuesExcept(...exceptions) {
  let values = _.cloneDeep(standardValues);

  exceptions.forEach(function(exception) {
    delete values[exception];
  });

  return _.values(values);
}

testTypeWith
  .type(string)
  .validValues(["", "hello"])
  .invalidValues(standardValuesExcept("string", "emptyString"));

testTypeWith
  .type(number)
  .validValues([-Number.MAX_VALUE, Number.MAX_VALUE, -5, 0, 5, 7 / 3, 8.4, Infinity, -Infinity])
  .invalidValues(standardValuesExcept("number", "int", "infinity", "negativeInfinity"));

testTypeWith
  .type(nonPositiveNumber)
  .validValues([-Infinity, -Number.MAX_VALUE, -5.5, 0])
  .invalidValues(standardValuesExcept("number", "int", "infinity", "negativeInfinity"));

testTypeWith
  .type(negativeNumber)
  .validValues([-Infinity, -Number.MAX_VALUE, -5.5, -Number.MIN_VALUE])
  .invalidValues(standardValuesExcept("number", "int", "infinity", "negativeInfinity"));

testTypeWith
  .type(nonNegativeNumber)
  .validValues([0, 5.5, Number.MAX_VALUE, Infinity])
  .invalidValues(standardValuesExcept("number", "int", "infinity", "negativeInfinity"));

testTypeWith
  .type(positiveNumber)
  .validValues([Number.MIN_VALUE, 5.5, Number.MAX_VALUE, Infinity])
  .invalidValues(standardValuesExcept("number", "int", "infinity", "negativeInfinity"));

testTypeWith
  .type(int)
  .validValues([Number.MIN_SAFE_INTEGER, -1, 0, 1, 100000, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE])
  .invalidValues(standardValuesExcept("int").concat([Number.MIN_VALUE]));

testTypeWith
  .type(nonPositiveInt)
  .validValues([Number.MIN_SAFE_INTEGER, -1, 0])
  .invalidValues(standardValuesExcept("int").concat([Number.MIN_VALUE, 1, Number.MAX_VALUE, Number.MAX_SAFE_INTEGER]));

testTypeWith
  .type(negativeInt)
  .validValues([Number.MIN_SAFE_INTEGER, -1])
  .invalidValues(
    standardValuesExcept("int").concat([Number.MIN_VALUE, 0, 1, Number.MAX_VALUE, Number.MAX_SAFE_INTEGER])
  );

testTypeWith
  .type(nonNegativeInt)
  .validValues([0, 1, 100000, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE])
  .invalidValues(standardValuesExcept("int").concat([-1, Number.MIN_SAFE_INTEGER, Number.MIN_VALUE]));

testTypeWith
  .type(positiveInt)
  .validValues([1, 100000, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE])
  .invalidValues(standardValuesExcept("int").concat([-1, 0, Number.MIN_SAFE_INTEGER, Number.MIN_VALUE]));

testTypeWith
  .type(boolean)
  .validValues([true, false])
  .invalidValues(standardValuesExcept("boolean"));

testTypeWith
  .type(truthy)
  .validValues(standardValuesExcept("emptyString", "nullValue", "undefinedValue", "nanValue").concat([true]))
  .invalidValues([false, 0, "", null, undefined, NaN]);

testTypeWith
  .type(falsy)
  .validValues([false, 0, "", null, undefined, NaN])
  .invalidValues(standardValuesExcept("emptyString", "nullValue", "undefinedValue", "nanValue").concat([true]));

testTypeWith
  .type(array)
  .validValues(
    [[], [[]], [[[[[[[[[]]]]]]]]], new Array(), new Array([]), new Array([[[[[[[[[]]]]]]]]])]
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
      )
  )
  .invalidValues(standardValuesExcept("array", "newArray"));

testTypeWith
  .type(object)
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
    /\w+/
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
    new Function("a", "return a")
  ]);

testTypeWith
  .type(func)
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
    Boolean
  ])
  .invalidValues(standardValuesExcept("func", "fatArrowFunc", "embeddedFunc", "newFunc"));

testTypeWith
  .type(date)
  .validValues([new Date(), new Date(null), new Date("hello world"), new Date(2018, 11, 24, 10, 33, 30, 0)])
  .invalidValues(
    standardValuesExcept("date").concat([Date, Date(), Date.now(), "Sat Oct 06 2018 17:43:52 GMT-0500 (CDT)"])
  );

let fooSymbol = Symbol("foo");

testTypeWith
  .type(symbol)
  .validValues([Symbol(), Symbol(null), fooSymbol, Symbol.for(null), Symbol.for("foo")])
  .invalidValues(standardValuesExcept("symbol").concat([Object(Symbol())]));

testTypeWith
  .type(regexp)
  .validValues([/./, /./gimuy, new RegExp("."), new RegExp(".", "yimug"), /^\(*\d{3}\)*( |-)*\d{3}( |-)*\d{4}$/])
  .invalidValues(standardValuesExcept("regexp"));

testTypeWith
  .type(nullValue)
  .validValues([null])
  .invalidValues(standardValuesExcept("nullValue"));

testTypeWith
  .type(undefinedValue)
  .validValues([undefined])
  .invalidValues(standardValuesExcept("undefinedValue"));

testTypeWith
  .type(nanValue)
  .validValues([NaN])
  .invalidValues(standardValuesExcept("nanValue"));

testTypeWith
  .type(any)
  .validValues(standardValuesExcept())
  .invalidValues([]);

test("test typeWithInstanceOf", () => {
  let classes = [
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
    TestClass
  ];

  let instances = [
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
    new TestClass()
  ];

  classes.forEach(function(clazz, i) {
    let customType = typeWithInstanceOf(clazz);
    let instance = instances[i];
    expect(verify(customType, instance)).toBe(true);
    expect(verify(nullValue, instance)).toBe(false);
    expect(verify(undefinedValue, instance)).toBe(false);
    expect(verify(nanValue, instance)).toBe(false);
  });
});
