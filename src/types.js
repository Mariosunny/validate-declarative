// A string (ex. "", "hello world")
export const string = {
    $test: function (object) {
        return typeof object === 'string';
    },
    $name: 'string'
};

// A number (ex. -5, 0, 8.4, 7/3)
export const number = {
    $test: function (object) {
        return typeof object === 'number';
    },
    $name: 'number'
};

// A number that is less than or equal to 0 (ex. -5.5, 0)
export const nonPositiveNumber = {
    $type: number,
    $test: function (object) {
        return object <= 0;
    },
    $name: 'nonPositiveNumber'
};

// A number that is less than 0 (ex. -5.5)
export const negativeNumber = {
    $type: number,
    $test: function(object) {
        return object < 0;
    },
    $name: 'negativeNumber'
};

// A number that is greater than or equal to 0 (ex. 0, 5.5)
export const nonNegativeNumber = {
    $type: number,
    $test: function(object) {
        return object >= 0;
    },
    $name: 'nonNegativeNumber'
};

// A number that is greater than 0 (ex. 5.5)
export const positiveNumber = {
    $type: number,
    $test: function(object) {
        return object > 0;
    },
    $name: 'positiveNumber'
};

// An integer number (ex. -5, 0, 100000)
export const int = {
    $type: number,
    $test: function (object) {
        return Number.isInteger(object);
    },
    $name: 'int'
};

// An integer that is less than or equal to 0 (ex. -5, 0)
export const nonNegativeInt = {
    $type: int,
    $test: function(object) {
        return object <= 0;
    },
    $name: 'nonNegativeInt'
};

// An integer that is less than 0 (ex. -5)
export const negativeInt = {
    $type: int,
    $test: function(object) {
        return object < 0;
    },
    $name: 'negativeInt'
};

// An integer that is greater than or equal to 0 (ex. 0, 5)
export const nonPositiveInt = {
    $type: int,
    $test: function(object) {
        return object >= 0;
    },
    $name: 'nonPositiveInt'
};

// An integer that is greater than 0 (ex. 5)
export const positiveInt = {
    $type: int,
    $test: function(object) {
        return object > 0;
    },
    $name: 'positiveInt'
};

// A boolean value (true or false)
export const boolean = {
    $test: function(object) {
        return typeof object === 'boolean';
    },
    $name: 'boolean'
};

// A value that is 'truthy' (ex. true, 1, [], {}, "false")
export const truthy = {
    $test: function(object) {
        return !!object;
    },
    $name: 'truthy'
};

// A value that is 'falsy' (false, 0, "", null, undefined, or NaN)
export const falsy = {
    $test: function(object) {
        return !object;
    },
    $name: 'falsy'
};

// An array (ex. [], [1, 2, 3])
export const array = {
    $test: function(object) {
        return Array.isArray(object);
    },
    $name: 'array'
};

// An object literal (ex. {}, {foo: 5})
export const object = {
    $test: function(object) {
        return object !== null && typeof object === 'object';
    },
    $name: 'object'
};

// A function (ex. function() {}, () => {}, Date)
export const func = {
    $test: function(object) {
        return typeof object === "function";
    },
    $name: 'func'
};

// A date object (ex. new Date())
export const date = {
    $test: function(object) {
        return object instanceof Date;
    },
    $name: 'date'
};

// A symbol (ex. Symbol())
export const symbol = {
    $test: function(object) {
        return typeof object === 'symbol';
    },
    $name: 'symbol'
};

// A regular expression (ex. /\w+/, new Regexp('abc'))
export const regexp = {
    $test: function(object) {
        return object instanceof RegExp;
    },
    $name: 'regexp'
};

// A null value
export const nullValue = {
    $test: function(object) {
        return object === null;
    },
    $name: 'nullValue'
};

// An undefined value
export const undefinedValue = {
    $test: function(object) {
        return object === undefined;
    },
    $name: 'undefinedValue'
};

// A NaN value
export const nanValue = {
    $test: function(object) {
        return isNaN(object);
    },
    $name: 'nanValue'
};

// Any value (always returns true)
export const any = {
    $test: function(object) {
        return true;
    },
    $name: 'any'
};