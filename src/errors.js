export const DUPLICATE_PROPERTY_ERROR = "DuplicatePropertyError";
export const INVALID_VALUE_ERROR = "InvalidValueError";
export const MISSING_PROPERTY_ERROR = "MissingPropertyError";
export const EXTRANEOUS_PROPERTY_ERROR = "ExtraneousPropertyError";

function Error(type, key, errors) {
    this.type = type;
    this.key = key;
    this._value = null;
    this._expectedType = null;
    this.valueSet = false;
    this.expectedTypeSet = false;
    this.errors = errors;
}

Error.prototype.add = function () {
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
};

Error.prototype.value = function(value) {
    if(value) {
        this._value = value;
        this.valueSet = true;
    }
    return this;
};

Error.prototype.expectedType = function(expectedType) {
    if(expectedType) {
        this._expectedType = expectedType;
        this.expectedTypeSet = true;
    }
    return this;
};

export function Errors() {
    this.errors = [];
}

Errors.prototype.invalidValue = function(key) {
    return new Error(INVALID_VALUE_ERROR, key, this.errors);
};

Errors.prototype.duplicateValue = function(key) {
    return new Error(DUPLICATE_PROPERTY_ERROR, key, this.errors);
};

Errors.prototype.missingProperty = function(key) {
    return new Error(MISSING_PROPERTY_ERROR, key, this.errors);
};

Errors.prototype.extraneousProperty = function(key) {
    return new Error(EXTRANEOUS_PROPERTY_ERROR, key, this.errors);
};