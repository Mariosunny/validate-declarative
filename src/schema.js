function validateData(context, schema, data, allowExtraneous) {
    let errors = [];



    return errors;
}

export function validate(schema, data, allowExtraneous = false) {
    return validateData([], schema, data, allowExtraneous);
}