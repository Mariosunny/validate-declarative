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
import { choose, randomInt, roll } from "./util";
import fs from "fs";
import util from "util";
import unravel from "unravel-function";

const BASIC_TYPES = [
  array,
  array,
  array,
  array,
  array,
  array,
  array,
  array,
  date,
  truthy,
  falsy,
  func,
  regexp,
  any,
  nullValue,
  undefinedValue,
  nanValue,
  boolean,
  symbol,
  int,
  string,
  object,
  number,
];

const FILEPATH = "./test/rainbow.js";

const NUMBER_TYPES = [positiveNumber, nonPositiveNumber, negativeNumber, nonNegativeNumber];

const INT_TYPES = [positiveInt, nonPositiveInt, negativeInt, nonNegativeInt];

function chooseType() {
  let type = choose(BASIC_TYPES);

  if (type.$name === number.$name) {
    type = choose(NUMBER_TYPES);
  } else if (type.$name === int.$name) {
    type = choose(INT_TYPES);
  }

  return type;
}

function generateSchema(maxDepth, minNumberOfProperties, maxNumberOfProperties, uniqueDone = false, depth = 0) {
  if (roll((maxDepth - depth) / maxDepth)) {
    let numberOfProperties = randomInt(minNumberOfProperties, maxNumberOfProperties);
    let schema = {};
    for (let i = 0; i < numberOfProperties; i++) {
      let key = String.fromCharCode(97 + Math.floor(i / 26)) + String.fromCharCode(97 + (i % 26));
      schema[key] = generateSchema(maxDepth, minNumberOfProperties, maxNumberOfProperties, uniqueDone, depth + 1);
    }
    return schema;
  } else {
    let type = chooseType();
    let typeSchema = {
      $type: "type." + type.$name,
    };
    if (roll(0.5)) {
      typeSchema.$optional = roll(0.75);
    }
    if (!uniqueDone && roll(0.25)) {
      typeSchema.$unique = roll(0.75);
    }
    if (type.$name === array.$name && roll(0.8)) {
      typeSchema.$element = generateSchema(
        maxDepth,
        minNumberOfProperties,
        maxNumberOfProperties,
        !uniqueDone ? typeSchema.hasOwnProperty("$unique") : uniqueDone,
        depth
      );
      delete typeSchema.$type;
    }

    if (Object.keys(typeSchema).length > 1 && typeSchema.$type) {
      return typeSchema.$type;
    } else {
      return typeSchema;
    }
  }
}

const generateSchemaAndData = unravel(function(objectName, maxDepth, minNumberOfProperties, maxNumberOfProperties) {
  let schema =
    `export const ${objectName}Schema = ` +
    util
      .inspect(generateSchema(maxDepth, minNumberOfProperties, maxNumberOfProperties), { depth: Infinity })
      .replace(/'/g, "");

  let data = `export const ${objectName}Data = {}`;
  return schema + "\n" + data + "\n";
});

export default function generate() {
  const header = "import * as type from '../src/types'";
  let outputs = [
    generateSchemaAndData
      .objectName("rainbow")
      .maxDepth(5)
      .minNumberOfProperties(1)
      .maxNumberOfProperties(4),
  ];

  fs.writeFileSync(FILEPATH, header + "\n\n" + outputs.join("\n\n"));
}
