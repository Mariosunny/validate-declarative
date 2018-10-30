import { forOwn, forOwnNonConstraintProperty, hasOwnProperty, isConstantValue } from "./util";
import { $ELEMENT, $META, $ROOT, $TYPE, $UNIQUE, addElementToContext, addKeyToContext } from "./keys";

export function addMeta(schema) {
  if (!schema.hasOwnProperty($META)) {
    schema[$META] = {
      uniqueValues: {},
      hasUnique: false,
      uniqueValuesLength: {},
    };
    initializeUniqueValues("", schema, schema[$META].uniqueValues, schema[$META].uniqueValuesLength);

    if (Object.keys(schema[$META].uniqueValues).length + schema[$META].uniqueValues.hasOwnProperty($ROOT)) {
      schema[$META].hasUnique = true;
    }
  }
}

export function updateMeta(schema) {
  if (schema[$META].hasUnique) {
    forOwnUniqueValues(schema, function(key, values) {
      schema[$META].uniqueValuesLength[key] = values.length;
    });
  }
}

export function backoutSchema(schema) {
  if (schema[$META].hasUnique) {
    forOwnUniqueValues(schema, function(key, values) {
      let actualLength = values.length;
      let properLength = schema[$META].uniqueValuesLength[key];

      while (actualLength > properLength) {
        schema[$META].uniqueValues[key].pop();
        actualLength--;
      }
    });
  }
}

export function forOwnUniqueValues(schema, func) {
  forOwn(schema[$META].uniqueValues, function(key, values) {
    func(key, values);
  });
  if (schema[$META].uniqueValues.hasOwnProperty($ROOT)) {
    func($ROOT, schema[$META].uniqueValues[$ROOT]);
  }
}

function initializeUniqueValues(context, schema, uniqueValues, uniqueValuesLength) {
  if (isConstantValue(schema)) {
    return;
  }
  let unique = getUnique(schema);
  if (unique) {
    const key = context.length === 0 ? $ROOT : context;
    uniqueValues[key] = [];
    uniqueValuesLength[key] = 0;
  }
  if (unique === null) {
    forOwnNonConstraintProperty(schema, function(key, value) {
      if (key === $ELEMENT) {
        initializeUniqueValues(addElementToContext(context, "x"), value, uniqueValues, uniqueValuesLength);
      } else {
        initializeUniqueValues(addKeyToContext(context, key), value, uniqueValues, uniqueValuesLength);
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
  if (schema.hasOwnProperty($META)) {
    forOwnUniqueValues(schema, function(key, value) {
      schema[$META].uniqueValues[key] = [];
      schema[$META].uniqueValuesLength[key] = 0;
    });
  }
}
