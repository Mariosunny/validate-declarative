export const string = {
    $test: function (object) {
        return typeof object === 'string';
    },
    $name: 'string'
};

export const number = {
    $test: function (object) {
        return typeof object === 'number' && !isNaN(object);
    },
    $name: 'number'
};

export const nonPositiveNumber = {
    $type: number,
    $test: function (object) {
        return object <= 0;
    },
    $name: 'nonPositiveNumber'
};

export const negativeNumber = {
    $type: number,
    $test: function(object) {
        return object < 0;
    },
    $name: 'negativeNumber'
};

export const nonNegativeNumber = {
    $type: number,
    $test: function(object) {
        return object >= 0;
    },
    $name: 'nonNegativeNumber'
};

export const positiveNumber = {
    $type: number,
    $test: function(object) {
        return object > 0;
    },
    $name: 'positiveNumber'
};

export const int = {
    $type: number,
    $test: function (object) {
        return Number.isInteger(object);
    },
    $name: 'int'
};

export const nonPositiveInt = {
    $type: int,
    $test: function(object) {
        return object <= 0;
    },
    $name: 'nonPositiveInt'
};

export const negativeInt = {
    $type: int,
    $test: function(object) {
        return object < 0;
    },
    $name: 'negativeInt'
};

export const nonNegativeInt = {
    $type: int,
    $test: function(object) {
        return object >= 0;
    },
    $name: 'nonNegativeInt'
};

export const positiveInt = {
    $type: int,
    $test: function(object) {
        return object > 0;
    },
    $name: 'positiveInt'
};

export const boolean = {
    $test: function(object) {
        return typeof object === 'boolean';
    },
    $name: 'boolean'
};

export const truthy = {
    $test: function(object) {
        return !!object;
    },
    $name: 'truthy'
};

export const falsy = {
    $test: function(object) {
        return !object;
    },
    $name: 'falsy'
};

export const array = {
    $test: function(object) {
        return Array.isArray(object);
    },
    $name: 'array'
};

export const set = {
    $test: function(object) {
        return object instanceof Set;
    },
    $name: 'set'
};

export const weakSet = {
    $test: function(object) {
        return object instanceof WeakSet;
    },
    $name: 'weakSet'
};

export const list = {
    $test: function(object) {
        return array.$test(object) || set.$test(object) || weakSet.$test(object);
    },
    $name: 'list'
};

export const map = {
    $test: function(object) {
        return object instanceof Map;
    },
    $name: 'map'
};

export const weakMap = {
    $test: function(object) {
        return object instanceof WeakMap;
    },
    $name: 'weakMap'
};

export const object = {
    $test: function(object) {
        return object !== null && typeof object === 'object';
    },
    $name: 'object'
};

export const func = {
    $test: function(object) {
        return typeof object === "function";
    },
    $name: 'func'
};

export const date = {
    $test: function(object) {
        return object instanceof Date;
    },
    $name: 'date'
};

export const symbol = {
    $test: function(object) {
        return typeof object === 'symbol';
    },
    $name: 'symbol'
};

export const regexp = {
    $test: function(object) {
        return object instanceof RegExp;
    },
    $name: 'regexp'
};

export const nullValue = {
    $test: function(object) {
        return object === null;
    },
    $name: 'nullValue'
};

export const undefinedValue = {
    $test: function(object) {
        return object === undefined;
    },
    $name: 'undefinedValue'
};

export const nanValue = {
    $test: function(object) {
        return Number.isNaN(object);
    },
    $name: 'nanValue'
};

export const any = {
    $test: function(object) {
        return true;
    },
    $name: 'any'
};

export function typeWithInstanceOf(clazz) {
    let customType = {
        $test: function(object) {
            return object !== null && object instanceof clazz;
        }
    };

    if(clazz.name) {
        customType.$name = clazz.name;
    }

    return customType;
}