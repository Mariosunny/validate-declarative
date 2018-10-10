import {forOwn, hasOwnProperty, isConstantValue, isEqual, isKeyValueObject} from "./util";
import {newErrors} from "./errors";
import {$TYPE, $TEST, $NAME, $OPTIONAL, $CONSTRAINTS, $ELEMENT, $META, $UNIQUE, $RESERVED_KEYS} from "./keys";
import {string, list} from "./types";

function validateData(context, schema, data, errors, allowExtraneous) {
    if(isConstantValue(schema) && !isEqual(schema, data)) {
        errors.invalidValue(context).value(data).add();
    }
    else if(hasOwnProperty(schema, $ELEMENT)) {
        validateArray(context, schema, data, errors, allowExtraneous);
    }
    else {
        validateObject(context, schema, data, errors, allowExtraneous);
    }

    findExtraneousProperties(context, schema, data, errors, allowExtraneous);
}

function findExtraneousProperties(context, schema, data, errors, allowExtraneous) {
    if(!allowExtraneous && isKeyValueObject(data)) {
        forOwn(data, function(key) {
            if(!hasOwnProperty(schema, key)) {
                errors.extraneousProperty(key).add();
            }
        });
    }
}

function validateArray(context, schema, data, errors, allowExtraneous) {
    if(list.$test(data)) {
        let elementSchema = schema[$ELEMENT];

        data.forEach(function (element, i) {
            validateData(context + "[" + i + "]", elementSchema, element, errors, allowExtraneous);
        });
    }
    else {
        errors.invalidValue(context).value(data).expectedType(list.$name).add();
    }
}

function validateObject(context, schema, data, errors, allowExtraneous) {
    if(!passesTypeTest(schema, data)) {
        errors.invalidValue(context).value(data).expectedType(getTypeName(schema)).add();
    }

    forOwnNonReservedProperty(schema, function(key, value) {
        let newContext = context + (context.length === 0 ? "": ".")  + key;
        let newSchema = value;
        let newData = data[key];

        if(isKeyValueObject(newSchema) && isOptional(newSchema) && !hasOwnProperty(data, key)) {
            errors.missingProperty(newContext).add();
        }
        else {
            validateData(newContext, newSchema, newData, errors, allowExtraneous);
        }
    });
}

function isOptional(schema) {
    if(schema[$OPTIONAL]) {
        return true;
    }
    else if(hasOwnProperty(schema, $TYPE)) {
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

    if(schema.hasOwnProperty($TYPE) && isKeyValueObject(schema[$TYPE])) {
        result = passesTypeTest(schema[$TYPE], data) && result;
    }

    if(result && schema.hasOwnProperty($TEST)) {
        let test = schema[$TEST];

        if(test instanceof RegExp) {
            result = result && string.$test(data) && test.test(data);
        }
        else if(typeof test === 'function') {
            result = result && test(data);
        }
    }

    return result;
}

function getTypeName(schema) {
    let name = null;

    if (schema[$NAME]) {
        name = schema[$NAME];
    }
    else if (schema[$TEST] && !schema[$TYPE] && schema[$TEST] instanceof RegExp) {
        name = schema[$TEST];
    }
    else if (schema[$TYPE] && isKeyValueObject(schema[$TYPE])) {
        name = getTypeName(schema[$TYPE]);
    }

    return name;
}

function addKeyToContext(context, key) {
    return context + (context.length === 0 ? "": ".") + key;
}

function addElementToContext(context, index) {
    return context + "[" + index + "]";
}

function initializeUniqueValues(context, schema, uniqueValues) {
    if(isConstantValue(schema)) {
        return;
    }
    if(schema[$UNIQUE]) {
        uniqueValues[context] = [];
    }
    else {
        forOwnNonConstraintProperty(schema, function(key, value) {
            if(key === $ELEMENT) {
                initializeUniqueValues(addElementToContext(context, 'x'), value, uniqueValues);
            }
            else {
                initializeUniqueValues(addKeyToContext(context, key), value, uniqueValues);
            }
        });
    }
}

export function verify(schema, data, allowExtraneous = false) {
    return validate(schema, data, allowExtraneous).length === 0;
}

export function validate(schema, data, allowExtraneous = false) {
    let errors = newErrors();

    if(!schema.hasOwnProperty($META)) {
        schema[$META] = {
            uniqueValues: {}
        };
        initializeUniqueValues("", schema, schema[$META].uniqueValues);
    }

    validateData("", schema, data, errors, allowExtraneous);

    return errors.errors;
}