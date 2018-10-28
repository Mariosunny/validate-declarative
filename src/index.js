import {
  verify as _verify,
  validate as _validate,
  resetSchema as __resetSchema,
  configureValidation as _configureValidation,
} from "./validate";

import {
  INVALID_VALUE_ERROR as _INVALID_VALUE_ERROR,
  MISSING_PROPERTY_ERROR as _MISSING_PROPERTY_ERROR,
  DUPLICATE_VALUE_ERROR as _DUPLICATE_VALUE_ERROR,
  EXTRANEOUS_PROPERTY_ERROR as _EXTRANEOUS_PROPERTY_ERROR,
} from "./errors";

import {
  string as _string,
  number as _number,
  nonPositiveNumber as _nonPositiveNumber,
  negativeNumber as _negativeNumber,
  nonNegativeNumber as _nonNegativeNumber,
  positiveNumber as _positiveNumber,
  int as _int,
  nonPositiveInt as _nonPositiveInt,
  negativeInt as _negativeInt,
  nonNegativeInt as _nonNegativeInt,
  positiveInt as _positiveInt,
  boolean as _boolean,
  truthy as _truthy,
  falsy as _falsy,
  array as _array,
  list as _list,
  object as _object,
  func as _func,
  date as _date,
  symbol as _symbol,
  regexp as _regexp,
  nullValue as _nullValue,
  undefinedValue as _undefinedValue,
  nanValue as _nanValue,
  any as _any,
  typeWithInstanceOf as _typeWithInstanceOf,
} from "./types";

export const validate = _validate;
export const verify = _verify;
export const _resetSchema = __resetSchema;
export const typeWithInstanceOf = _typeWithInstanceOf;
export const configureValidation = _configureValidation;

export const string = _string;
export const number = _number;
export const nonPositiveNumber = _nonPositiveNumber;
export const negativeNumber = _negativeNumber;
export const nonNegativeNumber = _nonNegativeNumber;
export const positiveNumber = _positiveNumber;
export const int = _int;
export const nonPositiveInt = _nonPositiveInt;
export const negativeInt = _negativeInt;
export const nonNegativeInt = _nonNegativeInt;
export const positiveInt = _positiveInt;
export const boolean = _boolean;
export const truthy = _truthy;
export const falsy = _falsy;
export const array = _array;
export const list = _list;
export const object = _object;
export const func = _func;
export const date = _date;
export const symbol = _symbol;
export const regexp = _regexp;
export const nullValue = _nullValue;
export const undefinedValue = _undefinedValue;
export const nanValue = _nanValue;
export const any = _any;

export const INVALID_VALUE_ERROR = _INVALID_VALUE_ERROR;
export const MISSING_PROPERTY_ERROR = _MISSING_PROPERTY_ERROR;
export const DUPLICATE_VALUE_ERROR = _DUPLICATE_VALUE_ERROR;
export const EXTRANEOUS_PROPERTY_ERROR = _EXTRANEOUS_PROPERTY_ERROR;
