import { forOwn, forOwnNonReservedProperty, hasOwnProperty, isConstantValue, isEqual, isKeyValueObject } from "./util";
import { $ELEMENT, $META, $NAME, $OPTIONAL, $ROOT, $TEST, $TYPE, addKeyToContext } from "./keys";
import { list, string } from "./types";
import {
  addError,
  DUPLICATE_VALUE_ERROR,
  EXTRANEOUS_PROPERTY_ERROR,
  INVALID_VALUE_ERROR,
  MISSING_PROPERTY_ERROR,
} from "./errors";
import { ALLOW_EXTRANEOUS, buildOptions, setGlobalOptions, validateOptions } from "./options";
import { addMeta, resetSchema as _resetSchema } from "./meta";

function validateData(context, schema, data, report, options, uniqueValues) {
  if (isConstantValue(schema) && !isEqual(schema, data)) {
    addError(report, options, INVALID_VALUE_ERROR, context, data);
  } else {
    if (!passesTypeTest(schema, data)) {
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
      validateData(context + "[" + i + "]", elementSchema, element, report, options, uniqueValues);
    });
  } else {
    addError(report, options, INVALID_VALUE_ERROR, context, data, list.$name);
  }
}

function validateObject(context, schema, data, report, options, uniqueValues) {
  forOwnNonReservedProperty(schema, function(key, value) {
    let newContext = context + (context.length === 0 ? "" : ".") + key;
    let newSchema = value;
    let dataHasProperty = hasOwnProperty(data, key);
    let newData = dataHasProperty ? data[key] : null;

    if (!isOptional(newSchema) && !dataHasProperty) {
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

function isOptional(schema) {
  if (hasOwnProperty(schema, $OPTIONAL)) {
    return schema[$OPTIONAL];
  } else if (hasOwnProperty(schema, $TYPE)) {
    return isOptional(schema[$TYPE]);
  }

  return false;
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

function checkInputForErrors(schema, data, options) {
  if (!isKeyValueObject(schema)) {
    throw new Error(`schema must be a plain object\n${schema}`);
  }
  if (!isKeyValueObject(options)) {
    throw new Error(`options must be a plain object\n${options}`);
  }
  validateOptions(options);
}

export function verify(schema, data, options) {
  return validate(schema, data, options).errors.length === 0;
}

export function validate(schema, data, options) {
  options = buildOptions(options);
  checkInputForErrors(schema, data, options);
  addMeta(schema);

  let report = { errors: [], schema: schema, data: data };
  validateData("", schema, data, report, options, schema[$META].uniqueValues);

  return report;
}

export function resetSchema(schema) {
  _resetSchema(schema);
}

export function configureValidation(options) {
  setGlobalOptions(options);
}
