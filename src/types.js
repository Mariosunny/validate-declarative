export const string = typeWithTypeOf('string');

export const number = newType('number', function(object) {
    return typeof object === 'number' && !isNaN(object);
});

export const nonPositiveNumber = newType('nonPositiveNumber', function(object) {
    return object <= 0;
}, number);

export const negativeNumber = newType('negativeNumber', function(object) {
    return object < 0;
}, number);

export const nonNegativeNumber = newType('nonNegativeNumber', function(object) {
    return object >= 0;
}, number);

export const positiveNumber = newType('positiveNumber', function(object) {
    return object > 0;
}, number);

export const int = newType('int', function(object) {
    return Number.isInteger(object);
}, number);

export const nonPositiveInt = newType('nonPositiveInt', function(object) {
    return object <= 0;
}, int);

export const negativeInt = newType('negativeInt', function(object) {
    return object < 0;
}, int);

export const nonNegativeInt = newType('nonNegativeInt', function(object) {
    return object >= 0;
}, int);

export const positiveInt = newType('positiveInt', function(object) {
    return object > 0;
}, int);

export const boolean = typeWithTypeOf('boolean');

export const truthy = newType('truthy', function(object) {
    return !!object;
});

export const falsy = newType('falsy', function(object) {
    return !object;
});

export const array = newType('array', function(object) {
    return Array.isArray(object);
});

export const set = typeWithInstanceOf(Set, 'set');
export const weakSet = typeWithInstanceOf(WeakSet, 'weakSet');

export const list = newType('list', function(object) {
    return array.$test(object) || set.$test(object) || weakSet.$test(object);
});

export const map = typeWithInstanceOf(Map, 'map');
export const weakMap = typeWithInstanceOf(WeakMap, 'weakMap');
export const object = typeWithTypeOf('object');
export const func = typeWithTypeOf('function', 'func');
export const date = typeWithInstanceOf(Date, 'date');
export const symbol = typeWithTypeOf('symbol');
export const regexp = typeWithInstanceOf(RegExp, 'regexp');
export const nullValue = typeWithLiteralValueOf(null, 'nullValue');
export const undefinedValue = typeWithLiteralValueOf(undefined, 'undefinedValue');

export const nanValue = newType('nanValue', function(object) {
    return Number.isNaN(object);
});

export const any = newType('any', function(object) {
    return true;
});

function newType($name, $test, $type) {
    let type = {$test};

    if($name) {
        type.$name = $name;
    }
    if($type) {
        type.$type = $type;
    }
    return type;
}

function typeWithLiteralValueOf(value, name) {
    return newType(name, function(object) {
        return object === value;
    });
}

function typeWithTypeOf(type, name) {
    return newType(name || type, function(object) {
        return object !== null && typeof object === type;
    });
}

export function typeWithInstanceOf(clazz, name) {
    return newType(name || clazz.name, function(object) {
        return object !== null && object instanceof clazz;
    });
}