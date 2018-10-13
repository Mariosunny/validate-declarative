export const DUPLICATE_PROPERTY_ERROR = "DuplicatePropertyError";
export const INVALID_VALUE_ERROR = "InvalidValueError";
export const MISSING_PROPERTY_ERROR = "MissingPropertyError";
export const EXTRANEOUS_PROPERTY_ERROR = "ExtraneousPropertyError";

const UNSET = Symbol();

function Error(type, key, data, errors) {
    this.type = type;
    this.key = key;
    this._value = UNSET;
    this._expectedType = UNSET;
    this.errors = errors;
    this.data = data;
}

Error.prototype.add = function () {
    let error = {
        error: this.type,
        key: this.key,
        data: this.data
    };

    if(this._value !== UNSET) {
        error.value = this._value;
    }

    if(this._expectedType !== UNSET) {
        error.expectedType = this._expectedType;
    }

    this.errors.push(error);
};

Error.prototype.value = function(value) {
    if(value) {
        this._value = value;
    }
    return this;
};

Error.prototype.expectedType = function(expectedType) {
    if(expectedType) {
        this._expectedType = expectedType;
    }
    return this;
};

export function Errors(data) {
    this.errors = [];
    this.data = data;
}

Errors.prototype.invalidValue = function(key) {
    return new Error(INVALID_VALUE_ERROR, key, this.data, this.errors);
};

Errors.prototype.duplicateValue = function(key) {
    return new Error(DUPLICATE_PROPERTY_ERROR, key, this.data, this.errors);
};

Errors.prototype.missingProperty = function(key) {
    return new Error(MISSING_PROPERTY_ERROR, key, this.data, this.errors);
};

Errors.prototype.extraneousProperty = function(key) {
    return new Error(EXTRANEOUS_PROPERTY_ERROR, key, this.data, this.errors);
};