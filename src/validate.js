import { forOwn, forOwnNonReservedProperty, hasOwnProperty, isConstantValue, isEqual, isKeyValueObject } from "./util";
import {
  $ELEMENT,
  $META,
  $NAME,
  $OPTIONAL,
  $ROOT,
  $TEST,
  $TYPE,
  $UNIQUE,
  addElementToContext,
  addKeyToContext,
} from "./keys";
import { list, string } from "./types";
import {
  addError,
  DUPLICATE_VALUE_ERROR,
  EXTRANEOUS_PROPERTY_ERROR,
  INVALID_VALUE_ERROR,
  MISSING_PROPERTY_ERROR,
} from "./errors";
import { ALLOW_EXTRANEOUS, buildOptions, setGlobalOptions, validateOptions } from "./options";
import { addMeta, backoutSchema, resetSchema as _resetSchema, updateMeta } from "./meta";

function validateData(context, schema, data, report, options, uniqueValues) {
  if (isConstantValue(schema)) {
    if (!isEqual(schema, data)) {
      addError(report, options, INVALID_VALUE_ERROR, context, data);
    }
  } else {
    if (!passesTypeTest(report, context, schema, data)) {
      addError(report, options, INVALID_VALUE_ERROR, context, data, getTypeName(schema));
    } else {
      checkUniqueness(context, schema, data, report, options, uniqueValues);

      if (hasOwnProperty(schema, $ELEMENT)) {
        validateArray(context, schema, data, report, options, uniqueValues);
      } else {
        validateObject(context, schema, data, report, options, uniqueValues);
      }
    }
  }

  if (!isType(schema)) {
    findExtraneousProperties(context, schema, data, report, options);
  }
}

function findExtraneousProperties(context, schema, data, report, options) {
  if (!options[ALLOW_EXTRANEOUS] && isKeyValueObject(data)) {
    forOwn(data, function(key) {
      if (!hasOwnProperty(schema, key)) {
        addError(report, options, EXTRANEOUS_PROPERTY_ERROR, addKeyToContext(context, key));
      }
    });
  }
}

function validateArray(context, schema, data, report, options, uniqueValues) {
  if (list.$test(data)) {
    let elementSchema = schema[$ELEMENT];

    data.forEach(function(element, i) {
      validateData(addElementToContext(context, i), elementSchema, element, report, options, uniqueValues);
    });
  } else {
    addError(report, options, INVALID_VALUE_ERROR, context, data, list.$name);
  }
}

function validateObject(context, schema, data, report, options, uniqueValues) {
  forOwnNonReservedProperty(schema, function(key, value) {
    let newContext = addKeyToContext(context, key);
    let newSchema = value;
    let dataHasProperty = hasOwnProperty(data, key);
    let newData = dataHasProperty ? data[key] : null;

    if (!isOptional(report, context, newSchema) && !dataHasProperty) {
      addError(report, options, MISSING_PROPERTY_ERROR, newContext);
    } else if (dataHasProperty) {
      validateData(newContext, newSchema, newData, report, options, uniqueValues);
    }
  });
}

function checkUniqueness(context, schema, data, report, options, uniqueValues) {
  let uniqueContext = getUniqueContext(context, uniqueValues);

  if (uniqueContext) {
    let localUniqueValues = uniqueValues[uniqueContext];

    for (let i = 0; i < localUniqueValues.length; i++) {
      if (isEqual(localUniqueValues[i], data)) {
        addError(report, options, DUPLICATE_VALUE_ERROR, context, data);
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

function isOptional(report, context, schema) {
  if (hasOwnProperty(schema, $OPTIONAL)) {
    return schema[$OPTIONAL];
  } else if (hasOwnProperty(schema, $TYPE)) {
    return isOptional(report, context, schema[$TYPE]);
  }

  return false;
}

function passesTypeTest(report, context, schema, data, depth = 0) {
  let result = true;
  const hasElement = schema.hasOwnProperty($ELEMENT);
  const hasTest = schema.hasOwnProperty($TEST);
  const hasType = schema.hasOwnProperty($TYPE);

  if (hasElement) {
    if (!isKeyValueObject(schema[$ELEMENT])) {
      throwConstraintError(report.schema, context, "$element must be an object");
    }
    if (!hasType) {
      result = list.$test(data);
    }
  }

  if (hasType) {
    if (isKeyValueObject(schema[$TYPE])) {
      result = passesTypeTest(report, context, schema[$TYPE], data, depth + 1) && result;
    } else {
      throwConstraintError(report.schema, context, "$type must be an object");
    }
  }

  if (result && hasTest) {
    let test = schema[$TEST];

    if (test instanceof RegExp) {
      result = result && string.$test(data) && test.test(data);
    } else if (typeof test === "function") {
      result = result && test(data);
    } else {
      throwConstraintError(report.schema, context, "$test must be a function or a regular expression");
    }
  }

  if (result && depth === 0 && !isType(schema) && !isKeyValueObject(data)) {
    result = false;
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
  } else if (schema.hasOwnProperty($ELEMENT) && !schema.hasOwnProperty($TYPE) && !schema.hasOwnProperty($TEST)) {
    name = list.$name;
  }

  return name;
}

function isType(schema) {
  return (
    hasOwnProperty(schema, $TEST) ||
    hasOwnProperty(schema, $TYPE) ||
    ((hasOwnProperty(schema, $OPTIONAL) || hasOwnProperty(schema, $UNIQUE) || hasOwnProperty(schema, $ELEMENT)) &&
      !hasNonReservedProperties(schema))
  );
}

function hasNonReservedProperties(schema) {
  let count = 0;
  forOwnNonReservedProperty(schema, function() {
    count++;
  });
  return count;
}

function throwConstraintError(schema, context, message) {
  backoutSchema(schema);
  throw new Error(`${message}\n${context}`);
}

function checkInputForErrors(schema, data, options) {
  if (!isKeyValueObject(options)) {
    throw new Error(`options must be a plain object\n${options}`);
  }
  checkSchemaForErrors(schema);
  validateOptions(options);
}

function checkSchemaForErrors(schema) {
  if (!isKeyValueObject(schema)) {
    throw new Error(`schema must be a plain object\n${schema}`);
  }
}

export function verify(schema, data, options) {
  return validate(schema, data, options).errors.length === 0;
}

export function validate(schema, data, options) {
  options = buildOptions(options);
  checkInputForErrors(schema, data, options);
  addMeta(schema);
  backoutSchema(schema);

  let report = { errors: [], data: data, schema: schema };
  validateData("", schema, data, report, options, schema[$META].uniqueValues);

  updateMeta(schema);

  return report;
}

export function resetSchema(schema) {
  checkSchemaForErrors(schema);
  _resetSchema(schema);
}

export function setGlobalValidationOptions(options) {
  setGlobalOptions(options);
}
