import {
    INVALID_VALUE_ERROR,
    MISSING_PROPERTY_ERROR,
    NON_UNIQUE_PROPERTY_ERROR,
    EXTRANEOUS_PROPERTY_ERROR
} from "./errors";
import {

} from "./types";
import _ from "lodash";

export {
    INVALID_VALUE_ERROR,
    MISSING_PROPERTY_ERROR,
    NON_UNIQUE_PROPERTY_ERROR,
    EXTRANEOUS_PROPERTY_ERROR
} from './errors';

const META_KEYS = [
    '$test',
    '$type',
    '$element',
    '$optional',
    '$unique',
    '$_$r00t$_$',
    '$name'
];

const PROPERTY = 'property';
const ELEMENT = 'element';

const ROOT_KEY = "$_$r00t$_$";

function compileSchema(schema) {

    _.forOwn(schema, function(value, key) {
        if(key === "$unique") {
            if(value) {
                schema[key] = [];
            }
            else {
                delete schema[key];
            }
        }
        if(key === "$element") {
            schema.$type = array;
        }

        if(typeof value === 'object' && !Array.isArray(value)) {
            compileSchema(value);
        }
    });

    return schema;
}

function validate(schema, data) {
    return _.uniqWith(validateData([], schema, data), function(error1, error2) {
        return error1.error === error2.error && error1.key === error2.key;
    });
}

function validateData(context, schema, data) {
    let rootSchema = {};
    rootSchema[ROOT_KEY] = schema;
    let rootData = {};
    rootData[ROOT_KEY] = data;
    return validateKey(context, ROOT_KEY, rootSchema, rootData);
}

function validateKey(context, key, schema, data) {
    let errors = [];
    let meta = schema[key];
    let value = data[key];
    let valueExists = data.hasOwnProperty(key);

    context = addContext(context, PROPERTY, key, meta);

    if (isLiteralValue(meta) && valueExists && !_.isEqual(meta, value)) {
        addError(errors, context, INVALID_PROPERTY_ERROR, value);
    }
    else {

        if(meta.$element && array.$test(value)) {
            errors = _.concat(validateArray(context, value, meta.$element), errors);
        }

        if (!meta.$optional && !valueExists) {
            addError(errors, context, MISSING_PROPERTY_ERROR);
        }

        if (valueExists) {
            validateUniqueKey(context, meta, value, errors);
            if (failsTypeTest(meta, value)) {
                addError(errors, context, INVALID_PROPERTY_ERROR, value, meta);
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
    if (!!meta.$unique) {
        let uniqueValues = meta.$unique;
        if (uniqueValues.includes(value)) {
            addError(errors, context, NON_UNIQUE_PROPERTY_ERROR, value);
        }
        else {
            uniqueValues.push(value);
        }
    }
}

function addContext(context, type, value) {
    if(value !== ROOT_KEY) {
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
        // if there are any meta keys, return false
        if(getMetaKeys(object).length > 0) {
            return false;
        }

        // recursively crawl through the object, returning false if any non-literal values are found
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

function failsTypeTest(meta, value) {
    let type = meta.$type ? extractTestFunction(meta.$type.$test): object => true;
    let test = extractTestFunction(meta.$test);

    return !(type(value) && test(value));
}

function extractTestFunction(test) {
    if(test) {
        if(test instanceof RegExp) {
            return object => string.$test(object) && test.test(object);
        }
        if(typeof test === 'function') {
            return test;
        }
    }
    return object => true;
}

function addError(errors, context, errorType, value, meta) {
    let error = {
        error: errorType,
        key: getPath(context)
    };
    if(value) {
        error.receivedValue = value;
    }
    if(meta) {
        if(meta.$name) {
            error.expectedType = meta.$name;
        }
        else if(meta.$type && meta.$type.$name) {
            error.expectedType = meta.$type.$name;
        }
    }
    errors.push(error);
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

export function verify(schema, data, extraneousAllowed = false) {

}

export function validate(schema, data, extraneousAllowed = false) {

}

export function validationConfig(config) {

}

export default function(schema) {
    schema = compileSchema(_.cloneDeep(schema));
    return {
        validate: function(data) {
            return validate(schema, data);
        },
        verify: function(data) {
            return validate(schema, data).length === 0;
        }
    }
}