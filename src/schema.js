import {
    INVALID_VALUE_ERROR,
    MISSING_PROPERTY_ERROR,
    NON_UNIQUE_PROPERTY_ERROR,
    EXTRANEOUS_PROPERTY_ERROR
} from "./errors";
import {
    string,
    array,
    list,
    set,
    weakSet
} from "./types";
import _ from "lodash";

const $TYPE = "$type";
const $TEST = "$test";
const $OPTIONAL = "$optional";
const $UNIQUE = "$unique";
const $ELEMENT = "$element";
const $NAME = "$name";
const $MOCK = "$__mock__";
const $ROOT = "$__root__";

const META_KEYS = [
    $TEST,
    $TYPE,
    $OPTIONAL,
    $UNIQUE,
    $ELEMENT,
    $ROOT,
    $MOCK,
    $NAME
];

const PROPERTY = 'property';
const ELEMENT = 'element';

const LIST_TYPES = [array, set, weakSet];


function validateData(context, schema, data) {
    let rootSchema = {};
    rootSchema[$ROOT] = schema;
    let rootData = {};
    rootData[$ROOT] = data;
    return validateKey(context, $ROOT, rootSchema, rootData);
}

function validateKey(context, key, schema, data) {
    let errors = [];
    let meta = schema[key];
    let value = data[key];
    let valueExists = data.hasOwnProperty(key);

    context = addContext(context, PROPERTY, key);

    if (isLiteralValue(meta) && valueExists && !_.isEqual(meta, value)) {
        addError(errors, context, INVALID_VALUE_ERROR, value);
    }
    else {
        if(meta.hasOwnProperty($ELEMENT)) {
            if(!meta.hasOwnProperty($TYPE) ||
                (meta[$TYPE] !== list && !LIST_TYPES.includes(meta[$TYPE]))) {
                meta[$TYPE] = list;
            }

            if(list.$test(value)) {
                errors = _.concat(validateArray(context, value, meta[$ELEMENT]), errors);
            }
        }

        if (!meta[$OPTIONAL] && !valueExists) {
            addError(errors, context, MISSING_PROPERTY_ERROR);
        }

        if (valueExists) {
            validateUniqueKey(context, meta, value, errors);
            if (!passesTypeTest(meta, value)) {
                addError(errors, context, INVALID_VALUE_ERROR, value, meta);
            }
            _.forEach(getNonMetaKeys(meta), subKey => {
                errors = _.concat(validateKey(context, subKey, meta, value), errors);
            });
        }
    }

    return errors;
}

function validateArray(context, array, elementSchema) {
    let errors = [];

    _.forEach(array, (element, i) => {
        let localContext = addContext(context, ELEMENT, "[" + i + "]");
        errors = _.concat(validateData(localContext, elementSchema, element), errors);
    });

    return errors;
}

function validateUniqueKey(context, meta, value, errors) {
    if (!!meta[$UNIQUE]) {
        if(!Array.isArray(meta[$UNIQUE])) {
            meta[$UNIQUE] = [];
        }

        let uniqueValues = meta[$UNIQUE];

        if (uniqueValues.includes(value)) {
            addError(errors, context, NON_UNIQUE_PROPERTY_ERROR, value);
        }
        else {
            uniqueValues.push(value);
        }
    }
}

function addContext(context, type, value) {
    if(value !== $ROOT) {
        return _.concat(context, {
            type: type,
            value: value
        });
    }
    return context;
}

function isLiteralValue(object) {
    if(Array.isArray(object)) {
        return true;
    }
    if(typeof object === 'object') {
        if(getMetaKeys(object).length > 0) {
            return false;
        }

        return !_.some(getNonMetaKeys(object), key => !isLiteralValue(object[key]));
    }
    return true;
}

function getMetaKeys(meta) {
    return _.filter(_.keys(meta), key => META_KEYS.includes(key));
}

function getNonMetaKeys(meta) {
    return _.filter(_.keys(meta), key => !META_KEYS.includes(key));
}

function passesTypeTest(meta, value) {
    let result = true;

    if(meta.hasOwnProperty($TYPE) && isObject(meta[$TYPE])) {
        result = passesTypeTest(meta[$TYPE], value) && result;
    }

    if(result && meta.hasOwnProperty($TEST)) {
        let test = meta[$TEST];
        if(test instanceof RegExp) {
            result = result && string.$test(value) && test.test(value);
        }
        else if(typeof test === 'function') {
            result = result && test(value);
        }
    }

    return result;
}

function addError(errors, context, errorType, value, meta) {
    let error = {
        error: errorType,
        key: getPath(context)
    };
    if(value) {
        error.value = value;
    }
    if(meta) {
        let typeName = getTypeName(meta);

        if(typeName) {
            error.expectedType = typeName;
        }
    }
    errors.push(error);
}

function getTypeName(meta) {
    let name = null;
    if(meta[$NAME]) {
        name = meta[$NAME];
    }
    else if(meta[$TEST] && !meta[$TYPE] && meta[$TEST] instanceof RegExp) {
        name = meta[$TEST];
    }
    else if(meta[$TYPE] && isObject(meta[$TYPE])){
        name = getTypeName(meta[$TYPE]);
    }
    return name;
}

function getPath(context) {
    let path = "";

    _.forEach(context, (node, i) => {
        if(i > 0 && node.type === PROPERTY) {
            path += ".";
        }
        path += node.value;
    });

    return path;
}

function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

function generateMock(schema, mock) {
    return {};
}

export function verify(schema, data, extraneousAllowed = false) {
    return validate(schema, data, extraneousAllowed).length === 0;
}

export function validate(schema, data, extraneousAllowed = false) {
    if(isObject(schema) && !schema.hasOwnProperty($MOCK)) {
        schema[$MOCK] = generateMock(schema, {});
    }

    return validateData([], schema, data);
}