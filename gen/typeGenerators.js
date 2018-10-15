import {
  any,
  array,
  boolean,
  date,
  falsy,
  func,
  int,
  nanValue,
  negativeInt,
  negativeNumber,
  nonNegativeInt,
  nonNegativeNumber,
  nonPositiveInt,
  nonPositiveNumber,
  nullValue,
  number,
  positiveInt,
  positiveNumber,
  regexp,
  string,
  symbol,
  truthy,
  undefinedValue,
  object,
} from "../src/types";
import { TYPES } from "./types";
import { choose, pick, randomInt, roll } from "./util";

let generators = {};

const FALSY_VALUES = [false, 0, "", null, undefined, NaN];

addGenerator(string, function() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let length = randomInt(0, 50) - 10;

  for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
});

addGenerator(number, function() {
  if (roll(0.1)) {
    if (roll(0.5)) {
      return Infinity;
    } else {
      return -Infinity;
    }
  } else if (roll(0.1)) {
    return 0;
  }
  return (Math.random() * 2 - 1) * 100000000000;
});

addGenerator(nonPositiveNumber, function() {
  do {
    var num = generateValue(number);
  } while (!nonPositiveNumber.$test(num));

  return num;
});

addGenerator(negativeNumber, function() {
  do {
    var num = generateValue(number);
  } while (!negativeNumber.$test(num));

  return num;
});

addGenerator(nonNegativeNumber, function() {
  do {
    var num = generateValue(number);
  } while (!nonNegativeNumber.$test(num));

  return num;
});

addGenerator(positiveNumber, function() {
  do {
    var num = generateValue(number);
  } while (!positiveNumber.$test(num));

  return num;
});

addGenerator(int, function() {
  do {
    var num = generateValue(number);
  } while (!isFinite(num));
  return Math.floor(num);
});

addGenerator(nonPositiveInt, function() {
  do {
    var num = generateValue(int);
  } while (!nonPositiveInt.$test(num));

  return num;
});

addGenerator(negativeInt, function() {
  do {
    var num = generateValue(int);
  } while (!negativeInt.$test(num));

  return num;
});

addGenerator(nonNegativeInt, function() {
  do {
    var num = generateValue(int);
  } while (!nonNegativeInt.$test(num));

  return num;
});

addGenerator(positiveInt, function() {
  do {
    var num = generateValue(int);
  } while (!positiveInt.$test(num));

  return num;
});

addGenerator(boolean, function() {
  return roll(0.5);
});

addGenerator(truthy, function() {
  do {
    var thing = generateValue(any);
  } while (!truthy.$test(thing));

  return thing;
});

addGenerator(falsy, function() {
  return choose(FALSY_VALUES);
});

addGenerator(array, function() {
  let length = randomInt(0, 20);
  let numberOfTypes = roll(0.5) ? 1 : randomInt(2, TYPES.length - 1);
  let types = pick(TYPES, numberOfTypes);
  let array = [];

  for (let i = 0; i < length; i++) {
    array.push(generateValue(choose(types)));
  }

  return array;
});

addGenerator(object, function(depth) {
  depth = depth || 0;
  let obj = {};
  let numberOfProperties = randomInt(2, 12) - depth * 2;
  depth++;
  if (numberOfProperties <= 0) {
    return generateValue(any);
  }
  for (let i = 0; i < numberOfProperties; i++) {
    obj[String.fromCharCode(97 + i)] = roll(0.5) ? generateValue(any) : generateValue(object, depth);
  }

  return obj;
});

addGenerator(func, function() {
  return function() {};
});

addGenerator(date, function() {
  return new Date(randomInt(0, 2000000000000));
});

addGenerator(symbol, function() {
  return Symbol();
});

addGenerator(regexp, function() {
  return new RegExp(generateValue(string));
});

addGenerator(nullValue, function() {
  return null;
});

addGenerator(nanValue, function() {
  return NaN;
});

addGenerator(undefinedValue, function() {
  return undefined;
});

const ANY_TYPES = [
  date,
  truthy,
  falsy,
  func,
  regexp,
  nullValue,
  undefinedValue,
  nanValue,
  boolean,
  symbol,
  int,
  string,
  number,
];

addGenerator(any, function() {
  return generateValue(choose([...ANY_TYPES].filter(type => type.$name !== any.$name)));
});

function addGenerator(type, generator) {
  generators[type.$name] = generator;
}

export function generateValue(type, ...args) {
  console.log(type.$name);
  return generators[type.$name](...args);
}

export function generateArray(type) {
  let length = randomInt(0, 10);
  let array = [];

  for (let i = 0; i < length; i++) {
    array.push(generateValue(type));
  }

  return array;
}
