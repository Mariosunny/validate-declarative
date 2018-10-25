import { forOwn, forOwnNonConstraintProperty, hasOwnProperty, isConstantValue } from "./util";
import { $ELEMENT, $META, $ROOT, $TYPE, $UNIQUE, addElementToContext, addKeyToContext } from "./keys";

export function addMeta(schema) {
  if (!schema.hasOwnProperty($META)) {
    schema[$META] = {
      uniqueValues: {},
    };
    initializeUniqueValues("", schema, schema[$META].uniqueValues);
  }
}

function initializeUniqueValues(context, schema, uniqueValues) {
  if (isConstantValue(schema)) {
    return;
  }
  let unique = getUnique(schema);
  if (unique) {
    uniqueValues[context.length === 0 ? $ROOT : context] = [];
  }
  if (unique === null) {
    forOwnNonConstraintProperty(schema, function(key, value) {
      if (key === $ELEMENT) {
        initializeUniqueValues(addElementToContext(context, "x"), value, uniqueValues);
      } else {
        initializeUniqueValues(addKeyToContext(context, key), value, uniqueValues);
      }
    });
  }
}

function getUnique(schema) {
  if (hasOwnProperty(schema, $UNIQUE)) {
    return !!schema[$UNIQUE];
  } else if (hasOwnProperty(schema, $TYPE)) {
    return getUnique(schema[$TYPE]);
  }
  return null;
}

export function resetSchema(schema) {
  forOwn(schema[$META].uniqueValues, function(context) {
    schema[$META].uniqueValues[context] = [];
  });
  Object.getOwnPropertySymbols(schema[$META].uniqueValues).forEach(function(context) {
    schema[$META].uniqueValues[context] = [];
  });
}
