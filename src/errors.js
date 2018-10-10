export const NON_UNIQUE_PROPERTY_ERROR = "NonUniqueValueError";
export const INVALID_VALUE_ERROR = "InvalidValueError";
export const MISSING_PROPERTY_ERROR = "MissingPropertyError";
export const EXTRANEOUS_PROPERTY_ERROR = "ExtraneousPropertyError";

class Error {
    constructor(type, key, errors) {
        this.type = type;
        this.key = key;
        this._value = null;
        this._expectedType = null;
        this.valueSet = false;
        this.expectedTypeSet = false;
        this.errors = errors;
    }
    add() {
        let error = {
            error: this.type,
            key: this.key
        };

        if(this.valueSet) {
            error.value = this._value;
        }

        if(this.expectedTypeSet) {
            error.expectedType = this._expectedType;
        }

        this.errors.push(error);
    }
    value(value) {
        if(value) {
            this._value = value;
            this.valueSet = true;
        }
        return this;
    }
    expectedType(expectedType) {
        if(expectedType) {
            this._expectedType = expectedType;
            this.expectedTypeSet = true;
        }
        return this;
    }
}

class Errors {
    constructor() {
        this.errors = [];
    }
    invalidValue(key) {
        return new Error(INVALID_VALUE_ERROR, key, this.errors);
    }
    nonUniqueValue(key) {
        return new Error(NON_UNIQUE_PROPERTY_ERROR, key, this.errors);
    }
    missingProperty(key) {
        return new Error(MISSING_PROPERTY_ERROR, key, this.errors);
    }
    extraneousProperty(key) {
        return new Error(EXTRANEOUS_PROPERTY_ERROR, key, this.errors);
    }
}

export function newErrors() {
    return new Errors();
}