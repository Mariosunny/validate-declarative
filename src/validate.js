import { forOwn, hasOwnProperty, isConstantValue, isEqual, isKeyValueObject } from "./util";
import { $TYPE, $TEST, $NAME, $OPTIONAL, $CONSTRAINTS, $ELEMENT, $META, $UNIQUE, $RESERVED_KEYS, $ROOT } from "./keys";
import { string, list } from "./types";
import {
  DUPLICATE_VALUE_ERROR,
  EXTRANEOUS_PROPERTY_ERROR,
  INVALID_VALUE_ERROR,
  MISSING_PROPERTY_ERROR,
} from "./errors";

function validateData(context, schema, data, report, allowExtraneous, uniqueValues) {
  if (isConstantValue(schema) && !isEqual(schema, data)) {
    addError(report, INVALID_VALUE_ERROR, context, data);
  } else {
    if (!passesTypeTest(schema, data)) {
      addError(report, INVALID_VALUE_ERROR, context, data, getTypeName(schema));
    } else {
      checkUniqueness(context, schema, data, report, uniqueValues);

      if (hasOwnProperty(schema, $ELEMENT)) {
        validateArray(context, schema, data, report, allowExtraneous, uniqueValues);
      } else {
        validateObject(context, schema, data, report, allowExtraneous, uniqueValues);
      }
    }
  }

  if (!isType(schema)) {
    findExtraneousProperties(context, schema, data, report, allowExtraneous);
  }
}

function findExtraneousProperties(context, schema, data, report, allowExtraneous) {
  if (!allowExtraneous && isKeyValueObject(data)) {
    forOwn(data, function(key) {
      if (!hasOwnProperty(schema, key)) {
        addError(report, EXTRANEOUS_PROPERTY_ERROR, addKeyToContext(context, key));
      }
    });
  }
}

function validateArray(context, schema, data, report, allowExtraneous, uniqueValues) {
  if (list.$test(data)) {
    let elementSchema = schema[$ELEMENT];

    data.forEach(function(element, i) {
      validateData(context + "[" + i + "]", elementSchema, element, report, allowExtraneous, uniqueValues);
    });
  } else {
    addError(report, INVALID_VALUE_ERROR, context, data, list.$name);
  }
}

function validateObject(context, schema, data, report, allowExtraneous, uniqueValues) {
  forOwnNonReservedProperty(schema, function(key, value) {
    let newContext = context + (context.length === 0 ? "" : ".") + key;
    let newSchema = value;
    let dataHasProperty = hasOwnProperty(data, key);
    let newData = dataHasProperty ? data[key] : null;

    if (!isOptional(newSchema) && !dataHasProperty) {
      addError(report, MISSING_PROPERTY_ERROR, newContext);
    } else if (dataHasProperty) {
      validateData(newContext, newSchema, newData, report, allowExtraneous, uniqueValues);
    }
  });
}

function checkUniqueness(context, schema, data, report, uniqueValues) {
  let uniqueContext = getUniqueContext(context, uniqueValues);

  if (uniqueContext) {
    let localUniqueValues = uniqueValues[uniqueContext];

    for (let i = 0; i < localUniqueValues.length; i++) {
      if (isEqual(localUniqueValues[i], data)) {
        addError(report, DUPLICATE_VALUE_ERROR, context, data);
        return;
      }
    }

    localUniqueValues.push(data);
  }
}

function getUniqueContext(context, uniqueValues) {
  if (context === "") {
    context = $ROOT;
  } else {
    context = context.replace(/\[[0-9]+\]/g, "[x]");
  }

  if (uniqueValues.hasOwnProperty(context)) {
    return context;
  }

  return null;
}

function isOptional(schema) {
  if (hasOwnProperty(schema, $OPTIONAL)) {
    return schema[$OPTIONAL];
  } else if (hasOwnProperty(schema, $TYPE)) {
    return isOptional(schema[$TYPE]);
  }

  return false;
}

function forOwnNonConstraintProperty(schema, func) {
  return forOwn(schema, func, key => !$CONSTRAINTS.includes(key));
}

function forOwnNonReservedProperty(schema, func) {
  return forOwn(schema, func, key => !$RESERVED_KEYS.includes(key));
}

function passesTypeTest(schema, data) {
  let result = true;

  if (schema.hasOwnProperty($ELEMENT) && !schema.hasOwnProperty($TYPE)) {
    result = list.$test(data);
  }

  if (schema.hasOwnProperty($TYPE) && isKeyValueObject(schema[$TYPE])) {
    result = passesTypeTest(schema[$TYPE], data) && result;
  }

  if (result && schema.hasOwnProperty($TEST)) {
    let test = schema[$TEST];

    if (test instanceof RegExp) {
      result = result && string.$test(data) && test.test(data);
    } else if (typeof test === "function") {
      result = result && test(data);
    }
  }

  return result;
}

function getTypeName(schema) {
  let name = null;

  if (schema.hasOwnProperty($NAME)) {
    name = schema[$NAME];
  } else if (schema[$TEST] && !schema[$TYPE] && schema[$TEST] instanceof RegExp) {
    name = schema[$TEST];
  } else if (schema[$TYPE] && isKeyValueObject(schema[$TYPE])) {
    name = getTypeName(schema[$TYPE]);
  } else if (hasOwnProperty(schema, $ELEMENT)) {
    name = list.$name;
  }

  return name;
}

function isType(schema) {
  return hasOwnProperty(schema, $TEST) || hasOwnProperty(schema, $TYPE);
}

function addKeyToContext(context, key) {
  return context + (context.length === 0 ? "" : ".") + key;
}

function addElementToContext(context, index) {
  return context + "[" + index + "]";
}

function addError(report, errorType, key, value, expectedType) {
  let error = {
    error: errorType,
    key: key,
  };

  if (value) {
    error.value = value;
  }
  if (expectedType) {
    error.expectedType = expectedType;
  }

  report.errors.push(error);
}

function addMeta(schema) {
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

function checkInputForErrors(schema, data, allowExtraneous) {
  if (!isKeyValueObject(schema)) {
    throw new Error(`schema must be a plain object\n${schema}`);
  }
  if (typeof allowExtraneous !== "boolean") {
    throw new Error(`allowExtraneous must be a boolean\n${allowExtraneous}`);
  }
}

export function verify(schema, data, allowExtraneous = false) {
  return validate(schema, data, allowExtraneous).errors.length === 0;
}

export function validate(schema, data, allowExtraneous = false) {
  checkInputForErrors(schema, data, allowExtraneous);
  addMeta(schema);

  let report = { errors: [], schema: schema, data: data };
  let meta = schema[$META];
  schema[$META] = undefined;
  validateData("", schema, data, report, allowExtraneous, meta.uniqueValues);
  schema[$META] = meta;

  return report;
}

export function resetSchema(schema) {
  forOwn(schema[$META].uniqueValues, function(context) {
    schema[$META].uniqueValues[context] = [];
  });
  Object.getOwnPropertySymbols(schema[$META].uniqueValues).forEach(function(context) {
    schema[$META].uniqueValues[context] = [];
  });
}
