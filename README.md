## validate-declarative
A simple utility for declaratively validating the structure of any Javascript object.
- Fast, robust, and highly extensible
- Works with arbitrarily large and deeply nested objects
- Detailed error reports

***See it in action:***
```javascript
import {verify, string, number, boolean} from 'validate-declarative';

// Define the structure and constraints of your objects
const bankAccountSchema = {
  accountHolder: string,
  active: boolean,
  balance: {
    checkings: {
        $type: number,
        $optional: true
    },
    savings: number
  }
};

// Create an object
let bankAccount1 = {
  accountHolder: "Susan B. Foo",
  active: true,
  balance: {
    savings: 39328.03
  }
};

let result1 = verify(bankAccountSchema, bankAccount1); 
// returns true: bankAccount1 satisfies the schema


let bankAccount2 = {
  accountHolder: 1,
  balance: {
    savings: "ten dollars",
    checkings: 39328.03
  }
};

let result2 = verify(bankAccountSchema, bankAccount2);
/* returns false, for the following reasons:
     1. 'active' property is missing
     2. accountHolder is not a string
     3. balance.savings is not a number
 */
```


## Table of Contents
- [Installation](#installation)
- [Overview](#overview)
- [Examples](#examples)
- [API](#api)
- [Constraints](#constraints)
- [Built-in Types](#built-in-types)
- [Errors](#errors)
- [About](#about)

## Installation
```
npm install validate-declarative --save
```


## Overview
A *schema* is a plain-old Javascript object that has some special properties. 
A schema describes the structure of some data.

```javascript
// a schema that describes a tweet
const tweetSchema = {
  message: {
    $test: function(object) {
      return typeof object === 'string' && object.length <= 24;
    }
  }
};
```
Keys in a schema beginning with `$` are constraints. [Constraints](#constraints) define the rules for validating data. 
The most commonly used constraint is the `$test` constraint, which defines a type test.
In the example above, the schema defines a property `message` that has a `$test` property. `$test` defines a type that is a *string* and also has a *length* of 24 characters or less. For a tweet to be valid, then, it must have a property `message` that satisfies these conditions.

The following tweet is therefore valid:
```javascript
let myTweet1 = { message: "Hello world!" };
```

But neither of these tweets are valid:
```javascript
let myTweet2 = {message: 5};
let myTweet3 = {message: "Lorem ipsum dolor sit amet, consectetur adipiscing." };
```

To validate data against a schema, use `verify()`- 
it takes a schema as its first argument, and the data as its second argument.
It returns *true* if the data satisfies all the constraints in the schema.

```javascript
import {verify} from 'validate-declarative';

let result1 = verify(tweetSchema, myTweet1); // true
let result2 = verify(tweetSchema, myTweet2); // false
let result3 = verify(tweetSchema, myTweet3); // false
```

`validate()` is similiar to `verify()`, but returns an array of [errors](#errors) describing any constraint violations:
```javascript
import {validate} from 'validate-declarative';

console.log(validate(tweetSchema, tweet2));
// prints: [{ error: "InvalidValueError", key: "message", value: 5, data: {message: 5} }]
```

This is a simple example, but schemas can be as large and complex as you want.
You can create a schema for any Javascript object. 

Check out [more examples](#examples) below, or
learn about the other types of [constraints](#constraints). 
See the [API](#api) for a description of `verify()` and `validate()`.
Check out a list of the available [built-in types](#built-in-types).


## Examples

#### Validating a single value
```javascript
import {verify, int, string} from 'validate-declarative';

let result1 = verify(int, 5);                 // true
let result2 = verify(int, "hello world");     // false
let result3 = verify(string, "hello world");  // true
```

#### Validating an object
```javascript
import {verify, string, nonNegativeInt} from 'validate-declarative';

const courseSchema = {
    courseName: {
        $test: /^[A-Za-z0-9 ]+$/
    },
    roomCapacity: nonNegativeInt,
    professor: string
};

let objectOrientedCourse = {
    courseName: "Object Oriented Programming",
    roomCapacity: 30,
    professor: "Dr. Placeholder"
};

let result1 = verify(courseSchema, objectOrientedCourse); // true
```

#### Validating an object with constant properties
```javascript
import {verify, string} from 'validate-declarative';

const sedanSchema = {
    wheels: 4,
    model: string
};

let car1 = {
    wheels: 4,
    model: "Chrysler 300"
};

let car2 = {
    wheels: 5,
    model: "Chevrolet Impala"
};

let result1 = verify(sedanSchema, car1); // true
let result2 = verify(sedanSchema, car2); // false
``` 

#### Creating a custom type
```javascript
import {verify, int} from 'validate-declarative';

// a custom type
const primeNumber = {
    $type: int,
    $test: function(object) {
        for(let i = 2; i < object; i++) {
            if(object % i === 0) {
                return false;
            }
        }
        return object !== 1 && object !== 0;
    },
    $name: 'primeNumber' // optional; defines the expectedType in error objects
};

const schema = {
    a: primeNumber
};

let result1 = verify(schema, {a: 7}); // true
let result2 = verify(schema, {a: 20}); // false

```

#### Validating an array
```javascript
import {verify, boolean} from 'validate-declarative';

const schema = {
  $element: boolean
};

let data = [true, true, false, true, false];

let result = verify(schema, data); // true
```

#### Validating a multi-dimensional array
```javascript
import {verify, int} from 'validate-declarative';

const schema = {
  // a 3-dimensional array of integers
  voxels: {
    $element: {
      $element: {
        $element: int
      }
    }
  }
};

let data = {
  voxels: [
    [[123, 48, 20], [93, 184, 230]],
    [[101, 200, 228], [76, 134, 120]],
    [[4, 67, 77], [129, 166, 249]]
  ]
};

let result = verify(schema, data); // true
```

#### Validating a complex object
```javascript
import {verify, string, int} from 'validate-declarative';

const companySchema = {
  companyName: string,
  ceo: string,
  employees: {
    $element: {
      name: string,
      salary: int,
      beneficiaries: {
        $optional: true,
        $element: {
          name: string,
          relationship: string
        }
      }
    }
  }
};

let industryTech = {
  companyName: "Industry Tech, Inc.",
  ceo: "James Tech",
  employees: [
    {
      name: "John Q. Workingman",
      salary: 65000,
      beneficiaries: [
        {
          name: "Nancy Workingman",
          relationship: "Mother"
        },
        {
          name: "Bob Workingman",
          relationship: "Father"
        }
      ]
    },
    {
      name: "Fred T. Orphan",
      salary: 38000
    }
  ]
};

let result = verify(companySchema, industryTech); // true
```

## API

#### `verify(schema, data, allowExtraneous=false) → boolean`
Validates `data` (any Javascript object) against the `schema` 
(a non-circular, plain object), 
returning *true* if and only if every property in the schema 
exists in the data, and every property's value in the data 
satisfies the constraints of the property 
(see [Constraints](#constraints)), *false* otherwise. 

If `allowExtraneous` is set to *false* (default), and there is at least one property that exists in the data but not in the schema, returns *false*. 
If `allowExtraneous` is set to *true*, extraneous properties in the data will be ignored.

Uses Node's [`assert.deepStrictEqual()`](https://nodejs.org/api/assert.html#assert_assert_deepstrictequal_actual_expected_message)
rules when comparing objects.

#### `validate(schema, data, allowExtraneous=false) → Array`
Same as `verify()`, but returns an array of error objects (see [Errors](#errors)) describing each constraint failure in detail. 
If the data satisfies the schema, the array will be empty, otherwise the array will be non-empty.

#### `typeWithInstanceOf(clazz, name=clazz.name) → Object`
Convenience function.
Returns a *type* (an object with a `$test` [constraint](#constraints)) that returns
*true* if the object is not null and the object is an **instanceof** `clazz`, *false* otherwise.
If `name` is present, it becomes the `$name` of the resulting type- 
otherwise the `$name` of the resulting type is set to `clazz.name`.

Usage:
```javascript
import {verify, typeWithInstanceOf} from 'validate-declarative';

class Apple {
    constructor() {}
}

const appleType = typeWithInstanceOf(Apple);

let data1 = new Apple();
let data2 = new Date();

let result1 = verify(appleType, data1); // true
let result2 = verify(appleType, data2); // false

```

#### `resetSchema(schema)`
Resets the internal unique values within the schema, which are used to enforce uniqueness
of values within and across data. **Invoking this function is not recommended for normal use**.
After this function is invokved, uniqueness is no longer guaranteed.

## Constraints
Constraints define the rules for validating data. 
They are embedded in schema objects alongside ordinary properties. 
Constraints begin with `$` to differentiate them from ordinary properties.
There are five types of constraints: `$test`, `$type`, `$optional`, `$unique`, and `$element`.

#### `$test`
**Default:** `(object) => true`

Defines a simple type test. 
`$test` is a function that takes an object and returns *true* if the object is valid, 
*false* otherwise. By default, the object is always valid.
Alternatively, `$test` is a regular expression that describes a valid object.
If the object is invalid, an [InvalidValueError](#invalidvalueerror) is generated.
```javascript
// a custom type
const countryCode = {
  $test: function(object) {
    // a valid country code is a string with 3 characters
    return typeof object === 'string' && object.length === 3;
  }
};

// using the type in a schema
const countrySchema = {
  country: countryCode
};

let country1 = {
  country: "USA"
};

let country2 = {
  country: "Brazil"
};

let result1 = verify(countrySchema, country1); // true
let result2 = verify(countrySchema, country2); // false, fails $test
```

```javascript
// Using a regular expression instead of a function
const countryCode = {
  $test: /^[A-Za-z]{3}$/
};

const countrySchema = {
  country: countryCode
};
```

#### `$type`
**Default:** `{ $test: (object) => true }`

Allows you to extend an existing type. 
`$type` is any object with a `$test` property that is a type test (see above).
During validation, the `$test` in `$type` is always called first before 
the local `$test`. This allows you to progressively 'build' a custom type through a 
series of type tests (see second example below). 
If neither `$test` nor `$type` is present for a property, 
a value will *always* be valid and never generate
an [InvalidValueError](#invalidvalueerror).

You can add a `$name` property to your custom type, which determines 
the *expectedType*
in the error, though it is entirely optional.

```javascript
import {nonNegativeInt} from 'validate-declarative';

// palindrome extends nonNegativeInt
const palindrome = {
  // nonNegativeInt is an object with its own $test
  $type: nonNegativeInt,
  $test: function(object) {
    let str = object + "";
    return str === str.split("").reverse().join("");
  },
  $name: 'palindrome' // optional
};

const schema = {
  streetNumber: palindrome
};
```

```javascript
// A type may contain many deeply nested $tests
// The deepest $test is always called first
const array = {
  $test: function(object) { // called first
    return Array.isArray(object);
  }
};

// smallArray extends array
const smallArray = {
  $type: array,
  $test: function(object) { // called second
    return object.length < 5;
  }
};

// smallNoDuplicatesArray extends smallArray
const smallNoDuplicatesArray = {
  $type: smallArray,
  $test: function(object) { // called third
    return (new Set(object)).size === object.length;
  }
};

const schema = {
  cars: smallNoDuplicatesArray
};
```

#### `$optional`
**Default**: `false`

Declares a property optional. 
By default, all properties in the schema are required. 
If `$optional` is *true*, a [MissingPropertyError](#missingpropertyerror)
 will **not** be generated if the property does not exist in the data.
For nested `$optional` declarations,
only the most shallow `$optional` declaration is considered.
`$optional` declarations at the top level of the schema
 or at the top level of an `$element` object are ignored.

```javascript
import {verify, int, string} from 'validate-declarative';

const schema = {
  foo: int,
  bar: {
    $type: string,
    $optional: true
  }
};

let data1 = {
  foo: -100,
  bar: "hello world"
};

let data2 = {
  foo: 5
};

let result1 = verify(schema, data1); // true
let result2 = verify(schema, data2); // true
```

#### `$unique`
**Default**: `false`

Declares the value of a property to be unique across all data validated
against a particular schema.
By default, all properties in a schema are non-unique.
If `$unique` is *true*, the property will generate a 
[DuplicateValueError](#duplicatevalueerror) when a duplicate value is
detected across two data or detected within the same data (ex. duplicate values in an array).
For nested `$unique` declarations,
only the most shallow `$unique` declaration is considered.

(Note: Each `$unique` declaration is mapped to an internal array of values stored within
a hidden property within the schema. 
**Be warned**- a large number of validations may result in high memory usage,
as every validation adds another element to each internal array of unique values within the schema.
Though it is not recommended, you can call `resetSchema()` to clear these internal arrays (see [API](#api)).
This, however, will not guarantee uniqueness for subsequent validations.)
```javascript
import {verify, string} from 'validate-declarative';

const playerSchema = {
  username: {
    $type: string,
    $unique: true
  },
  password: string
};

let player1 = {
  username: "Mariosunny",
  password: "123abc"
};

let player2 = {
  username: "Mariosunny",
  password: "password1"
};

// true
let result1 = verify(playerSchema, player1);

// false - there is already a player with username "Mariosunny"
let result2 = verify(playerSchema, player2);
```

#### `$element`
**Default:** `undefined`

Defines the schema of each element in an array, set, or weak set. 
When `$element` is present, `$type` defaults to the `list` type (see [Built-in Types](#built-in-types)).
`$element` declarations can be nested within eachother to validate multi-dimensional arrays 
(see [Validating a Multi-Dimensional Array](#validating-a-multi-dimensional-array)).

```javascript
import {verify, string, number} from 'validate-declarative';

const restaurantSchema = {
  headChef: string,
  menuItems: {
    $element: {
      name: string,
      price: number
    }
  }
};

let restaurant1 = {
  headChef: "Emeril Ramsay",
  menuItems: [
    {
      name: "Cheeze Pizza",
      price: 12.99
    },
    {
      name: "Beef Stew",
      price: 7.50
    }
  ]
};

let result = verify(restaurantSchema, restaurant1); // true
```


## Built-in Types
This section contains a list of the built-in types that are included in this package.
See [this example](#validating-an-object) for how to use built-in types.
For creating your own types, see [Creating a custom type](#creating-a-custom-type).

#### Core Types
|Type|Description|Examples|
|----|-----------|------------|
|`string`|A string.|`""`, `"hello world"`|
|`number`|A number.|`-5`, `0`, `8.4`, `7/3`, `Infinity`, `-Infinity`|
|`nonPositiveNumber`|A non-positive number.|`-Infinity`, `-5.5`, `0`|
|`negativeNumber`|A negative number.|`-Infinity`, `-5.5`|
|`nonNegativeNumber`|A non-negative number.|`0`, `5.5`, `Infinity`|
|`positiveNumber`|A positive number.|`5.5`, `Infinity`|
|`int`|An integer.|`-10000000`, `-5`, `0`, `12345`|
|`nonPositiveInt`|A non-positive integer.|`-5`, `0`|
|`negativeInt`|A negative integer.|`-5`|
|`nonNegativeInt`|A non-negative integer.|`0`, `5`|
|`positiveInt`|A positive integer.|`5`|
|`boolean`|A boolean value.|`true`, `false`|
|`truthy`|A truthy value.|`true`, `1`, `[]`, `{}`, `"false"`|
|`falsy`|A falsy value.|`false`, `0`, `""`, `null`, `undefined`, `NaN`|
|`array`|An array.|`[1, 2, "3"]`, `new Array()`|
|`set`|A set.|`new Set(1, 2, 3)`|
|`weakSet`|A weak set.|`new WeakSet(1, 2, 3)`|
|`list`|An array, set, or weak set.|`[]`, `new Set()`, `new WeakSet()`|
|`map`|A map.|`new Map()`|
|`weakMap`|A weak map.|`new WeakMap()`|
|`object`|Any object that is not a function.|`{}`, `[1, 2, 3]`, `new Set(1, 2, 3)`|
|`func`|A function.|`function(){}`, `() => {}`, `Date`|
|`date`|A date object.|`new Date()`|
|`symbol`|A symbol.|`Symbol()`|
|`regexp`|A regular expression object.|`/.*/g`, `new Regexp(".*")`|
|`nullValue`|A **null** value.|`null`|
|`undefinedValue`|An **undefined** value.|`undefined`|
|`nanValue`|A **NaN** value.|`NaN`|
|`any`|Any value.|`512`, `null`, `"hello"`, `undefined`, `[1, 2, 3]`|

#### Optional types
|Type|Description|Examples|
|----|-----------|------------|
|`optionalString`|An optional string.|`""`, `"hello world"`|
|`optionalNumber`|An optional number.|`-5`, `0`, `8.4`, `7/3`, `Infinity`, `-Infinity`|
|`optionalNonPositiveNumber`|An optional non-positive number.|`-Infinity`, `-5.5`, `0`|
|`optionalNegativeNumber`|An optional negative number.|`-Infinity`, `-5.5`|
|`optionalNonNegativeNumber`|An optional non-negative number.|`0`, `5.5`, `Infinity`|
|`optionalPositiveNumber`|An optional positive number.|`5.5`, `Infinity`|
|`optionalInt`|An optional integer.|`-10000000`, `-5`, `0`, `12345`|
|`optionalNonPositiveInt`|An optional non-positive integer.|`-5`, `0`|
|`optionalNegativeInt`|An optional negative integer.|`-5`|
|`optionalNonNegativeInt`|An optional non-negative integer.|`0`, `5`|
|`optionalPositiveInt`|An optional positive integer.|`5`|
|`optionalBoolean`|An optional boolean value.|`true`, `false`|
|`optionalTruthy`|An optional truthy value.|`true`, `1`, `[]`, `{}`, `"false"`|
|`optionalFalsy`|An optional falsy value.|`false`, `0`, `""`, `null`, `undefined`, `NaN`|
|`optionalArray`|An optional array.|`[1, 2, "3"]`, `new Array()`|
|`optionalSet`|An optional set.|`new Set(1, 2, 3)`|
|`optionalWeakSet`|An optional weak set.|`new WeakSet(1, 2, 3)`|
|`optionalList`|An optional array, set, or weak set.|`[]`, `new Set()`, `new WeakSet()`|
|`optionalMap`|An optional map.|`new Map()`|
|`optionalWeakMap`|An optional weak map.|`new WeakMap()`|
|`optionalObject`|Any object that is not a function (optional).|`{}`, `[1, 2, 3]`, `new Set(1, 2, 3)`|
|`optionalFunc`|An optional function.|`function(){}`, `() => {}`, `Date`|
|`optionalDate`|An optional date object.|`new Date()`|
|`optionalSymbol`|An optional symbol.|`Symbol()`|
|`optionalRegexp`|An optional regular expression object.|`/.*/g`, `new Regexp(".*")`|
|`optionalNullValue`|An optional **null** value.|`null`|
|`optionalUndefinedValue`|Ann optional **undefined** value.|`undefined`|
|`optionalNanValue`|An optional **NaN** value.|`NaN`|
|`optionalAny`|Any value (optional).|`512`, `null`, `"hello"`, `undefined`, `[1, 2, 3]`|

## Errors
This section contains a comprehensive list of errors that could be generated by [`validate()`](#api).
An *error* is an object that is generated when an object in the data fails a constraint in the schema.

(Note that, despite the name, the process of *error generation* in this context 
does ***not*** refer to 
[error throwing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw))


#### InvalidValueError
Generated when a value fails a type test.
```javascript
{
  error: "InvalidValueError",    // name of the error
  key: "menu.menuItems[3].desc", // the property where the error occurred
  data: {...}                    // the data that was validated
  value: 5,                      // the actual value found in the data at the property
  expectedType: "string"         // the expected type, defined by $name in the schema
}
```

#### DuplicateValueError
Generated when a duplicate value is detected, and when `$unique` = *true*.
```javascript
{
  error: "DuplicateValueError",
  key: "restaurant.headChef",
  data: {...},
  value: "Tom G. Bar"
}
```

#### MissingPropertyError
Generated when a property is missing from the data, and when `$optional` = *false*.
```javascript
{
  error: "MissingPropertyError",
  key: "headChef",
  data: {...}
}
```

#### ExtraneousPropertyError
Generated when there is an extra property in the data, and when `allowExtraneous` = *false*.
```javascript
{
  error: "ExtraneousPropertyError",
  key: "favoriteColor",
  data: {...}
}
```


## About
This project is maintained by [Tyler Hurson](https://github.com/Mariosunny). 
Submit any issues or pull requests to the [official Github repo](https://github.com/Mariosunny/validate-declarative).

Check out other projects by this author:
- [**unravel-function**](https://www.npmjs.com/package/unravel-function) - Takes a function and spreads its arguments across a chain of functions to be lazily evaluated.
                                                                       
