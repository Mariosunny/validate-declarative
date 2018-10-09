import {isConstantValue} from "./util";

function validateData(context, schema, data, allowExtraneous) {
    let errors = [];

    if(isConstantValue(schema)) {

    }

    return errors;
}

export function validate(schema, data, allowExtraneous = false) {
    return validateData([], schema, data, allowExtraneous);
}