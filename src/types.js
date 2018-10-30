export const string = typeWithTypeOf("string");
export const optionalString = makeOptional(string);
export const uniqueString = makeUnique(string);

export const number = newType("number", function(object) {
  return typeof object === "number" && !isNaN(object);
});
export const optionalNumber = makeOptional(number);
export const uniqueNumber = makeUnique(number);

export const nonPositiveNumber = newType(
  "nonPositiveNumber",
  function(object) {
    return object <= 0;
  },
  number
);
export const optionalNonPositiveNumber = makeOptional(nonPositiveNumber);
export const uniqueNonPositiveNumber = makeUnique(nonPositiveNumber);

export const negativeNumber = newType(
  "negativeNumber",
  function(object) {
    return object < 0;
  },
  number
);
export const optionalNegativeNumber = makeOptional(negativeNumber);
export const uniqueNegativeNumber = makeUnique(negativeNumber);

export const nonNegativeNumber = newType(
  "nonNegativeNumber",
  function(object) {
    return object >= 0;
  },
  number
);
export const optionalNonNegativeNumber = makeOptional(nonNegativeNumber);
export const uniqueNonNegativeNumber = makeUnique(nonNegativeNumber);

export const positiveNumber = newType(
  "positiveNumber",
  function(object) {
    return object > 0;
  },
  number
);
export const optionalPositiveNumber = makeOptional(positiveNumber);
export const uniquePositiveNumber = makeUnique(positiveNumber);

export const int = newType(
  "int",
  function(object) {
    return Number.isInteger(object);
  },
  number
);
export const optionalInt = makeOptional(int);
export const uniqueInt = makeUnique(int);

export const nonPositiveInt = newType(
  "nonPositiveInt",
  function(object) {
    return object <= 0;
  },
  int
);
export const optionalNonPositiveInt = makeOptional(nonPositiveInt);
export const uniqueNonPositiveInt = makeUnique(nonPositiveInt);

export const negativeInt = newType(
  "negativeInt",
  function(object) {
    return object < 0;
  },
  int
);
export const optionalNegativeInt = makeOptional(negativeInt);
export const uniqueNegativeInt = makeUnique(negativeInt);

export const nonNegativeInt = newType(
  "nonNegativeInt",
  function(object) {
    return object >= 0;
  },
  int
);
export const optionalNonNegativeInt = makeOptional(nonNegativeInt);
export const uniqueNonNegativeInt = makeUnique(nonNegativeInt);

export const positiveInt = newType(
  "positiveInt",
  function(object) {
    return object > 0;
  },
  int
);
export const optionalPositiveInt = makeOptional(positiveInt);
export const uniquePositiveInt = makeUnique(positiveInt);

export const boolean = typeWithTypeOf("boolean");
export const optionalBoolean = makeOptional(boolean);
export const uniqueBoolean = makeUnique(boolean);

export const truthy = newType("truthy", function(object) {
  return !!object;
});
export const optionalTruthy = makeOptional(truthy);
export const uniqueTruthy = makeUnique(truthy);

export const falsy = newType("falsy", function(object) {
  return !object;
});
export const optionalFalsy = makeOptional(falsy);
export const uniqueFalsy = makeUnique(falsy);

export const array = newType("array", function(object) {
  return Array.isArray(object);
});
export const optionalArray = makeOptional(array);
export const uniqueArray = makeUnique(array);

export const list = newType("list", function(object) {
  return array.$test(object) || object instanceof Set;
});
export const optionalList = makeOptional(list);
export const uniqueList = makeUnique(list);

export const object = typeWithTypeOf("object");
export const optionalObject = makeOptional(object);
export const uniqueObject = makeUnique(object);

export const func = typeWithTypeOf("function", "func");
export const optionalFunc = makeOptional(func);
export const uniqueFunc = makeUnique(func);

export const date = typeWithInstanceOf(Date, "date");
export const optionalDate = makeOptional(date);
export const uniqueDate = makeUnique(date);

export const symbol = typeWithTypeOf("symbol");
export const optionalSymbol = makeOptional(symbol);
export const uniqueSymbol = makeUnique(symbol);

export const regexp = typeWithInstanceOf(RegExp, "regexp");
export const optionalRegexp = makeOptional(regexp);
export const uniqueRegexp = makeUnique(regexp);

export const nullValue = typeWithLiteralValueOf(null, "nullValue");
export const optionalNullValue = makeOptional(nullValue);
export const uniqueNullValue = makeUnique(nullValue);

export const undefinedValue = typeWithLiteralValueOf(undefined, "undefinedValue");
export const optionalUndefinedValue = makeOptional(undefinedValue);
export const uniqueUndefinedValue = makeUnique(undefinedValue);

export const nanValue = newType("nanValue", function(object) {
  return Number.isNaN(object);
});
export const optionalNanValue = makeOptional(nanValue);

export const any = newType("any", function(object) {
  return true;
});
export const optionalAny = makeOptional(any);
export const uniqueAny = makeUnique(any);

function makeOptional(type) {
  return {
    $type: type,
    $optional: true,
  };
}

function makeUnique(type) {
  return {
    $type: type,
    $unique: true,
  };
}

export function newType($name, $test, $type) {
  let type = { $test };

  if ($name) {
    type.$name = $name;
  }
  if ($type) {
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
