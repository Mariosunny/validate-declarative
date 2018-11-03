[![Build Status](https://travis-ci.org/Mariosunny/validate-declarative.png?branch=master)](https://travis-ci.org/Mariosunny/validate-declarative)
[![codecov](https://codecov.io/gh/Mariosunny/validate-declarative/branch/master/graph/badge.svg)](https://codecov.io/gh/Mariosunny/validate-declarative)
[![Dependencies Status](https://david-dm.org/Mariosunny/validate-declarative/status.svg)](https://david-dm.org/Mariosunny/validate-declarative)
[![Known Vulnerabilities](https://snyk.io/test/github/Mariosunny/validate-declarative/badge.svg)](https://snyk.io/test/github/Mariosunny/validate-declarative)


# validate-declarative
A simple utility for declaratively validating any Javascript object.
- Easy-to-read, self-describing syntax
- Fast, robust, and highly extensible
- Works with arbitrarily large and deeply nested objects/arrays
- ES5+ and browser compatible
  
***See it in action:***

```javascript
import {verify, string, optionalNumber, boolean} from 'validate-declarative';

const schema = {
  a: boolean,
  b: {
    c: optionalNumber,
    d: { $test: (object) => object < 40000 }
  },
  e: { $element: string }
};

let data1 = {
  a: true,
  b: {
    d: 39328.03
  },
  e: [ "apple", "orange" ]
};
let result1 = verify(schema, data1); 
// returns true: data1 satisfies the schema

let data2 = {
  b: {
    c: "ten dollars",
    d: 60000
  },
  e: [ "23", -609, "lemon" ]
};
let result2 = verify(schema, data2);
// returns false, since:
//    'a' is missing,
//    'b.c' is not a number,
//    'b.d' is not less than 40000
//    'e[1]' is not a string
```
<br/>

## Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Examples](#examples)
- [API](#api)
- [Constraints](#constraints)
- [Errors](#errors)
- [Built-in Types](#built-in-types)
- [About](#about)

## Installation
```
npm install validate-declarative --save
```

```
yarn add validate-declarative
```

## Getting Started
A *schema* is a plain Javascript object that has some special properties. 
A schema describes the structure and type of some data in a declarative manner.

```javascript
import {verify, validate} from 'validate-declarative';

// a schema that describes a tweet
const tweetSchema = {
  message: {
    $test: function(object) {
      return typeof object === 'string' && object.length <= 24;
    }
  }
};
```
Keys in the schema beginning with `$` are constraints. [Constraints](#constraints) define the rules for validating data. 
The most commonly used constraint is the `$test` constraint, which defines a *type test*-
a function that takes an object and returns *true* if the object is valid, *false* otherwise.

Conceptually, `tweetSchema` describes an object with a property `message` that is a *string* with a *length* of 24 characters or less. For a given tweet to be valid, then, it must satisfy these constraints. 

The following tweet is valid:
```javascript
let myTweet1 = { message: "Hello world!" };
```

But these tweets are invalid:
```javascript
 // 'message' is not a string, invalid!
let myTweet2 = {message: 5};

// 'message' is greater than 24 characters, invalid!
let myTweet3 = {message: "Lorem ipsum dolor sit amet, consectetur adipiscing." };
```

To validate data against a schema, use `verify()`- 
it takes a schema as its first argument, and the data as its second argument.
It returns *true* if the data satisfies the schema.

```javascript
let result1 = verify(tweetSchema, myTweet1); // true
let result2 = verify(tweetSchema, myTweet2); // false
let result3 = verify(tweetSchema, myTweet3); // false
```

`validate()` is similar to `verify()`, but returns a *report object* containing an array of [errors](#errors) describing any constraint violations:
```javascript
console.log(validate(tweetSchema, tweet2));
// {
//    errors: [ { error: "InvalidValueError", key: "message", value: 5 } ] 
//    data: { message: 5 }  
//    schema: { message: { '$test': [Function: $test] }
// }
```
<details><summary><b>[ <i>View the full code</i> ]</b></summary>

```javascript
import {verify, validate} from 'validate-declarative';

const tweetSchema = {
  message: {
    $test: function(object) {
      return typeof object === 'string' && object.length <= 24;
    }
  }
};

let myTweet1 = { message: "Hello world!" };
let myTweet2 = {message: 5};
let myTweet3 = {message: "Lorem ipsum dolor sit amet, consectetur adipiscing." };

let result1 = verify(tweetSchema, myTweet1); // true
let result2 = verify(tweetSchema, myTweet2); // false
let result3 = verify(tweetSchema, myTweet3); // false

console.log(validate(tweetSchema, tweet2));
```
</details>

This is a simple example, but schemas can be as large and complex as you want.
You can create a schema for any Javascript object. 

Check out [more examples](#examples) below, or
learn about the other types of [constraints](#constraints). 
See the [API](#api) for a detailed explanation of `verify()` and `validate()`.
Also check out a list of the available [built-in types](#built-in-types).


## Examples
This section contains some examples of common use cases.

<details><summary><b>Single values</b></summary>

```javascript
import {verify, int, string} from 'validate-declarative';

let result1 = verify(int, 5);                 // true
let result2 = verify(int, "hello world");     // false
let result3 = verify(string, "hello world");  // true
```
</details>
</br>
<details><summary><b>Plain objects</b></summary>
  
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
</details>
</br>
<details><summary><b>Objects with constant properties</b></summary>

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
</details>
</br>
<details><summary><b>Custom types</b></summary>
  
```javascript
import {verify, int} from 'validate-declarative';

// a custom type defining a prime number
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

let result1 = verify(primeNumber, 7); // true
let result2 = verify(primeNumber, 20); // false
```

```javascript
import {string, verify} from 'validate-declarative';
import luhn from 'luhn-alg';

// a custom type defining a valid credit card number
const creditCardNumber = {
  $type: string,
  $test: function(object) {
    return luhn(object);
  },
  $name: "creditCardNumber",
};

// using a custom type in another schema
const purchaserSchema = {
  name: string,
  creditCardNumber: creditCardNumber,
};

let purchaser1 = {
  name: "John James",
  creditCardNumber: "4102676136588700",
};
let purchaser2 = {
  name: "Herbert Hubert",
  creditCardNumber: "4102676136588709",
};

let result1 = verify(purchaserSchema, purchaser1); // true
let result2 = verify(purchaserSchema, purchaser2); // false
```

</details>
</br>
<details><summary><b>Arrays</b></summary>
  
```javascript
import {verify, boolean} from 'validate-declarative';

// defines an array where each element is a boolean
const schema = {
  $element: boolean
};

let data1 = [true, true, false, true, false];
let data2 = [];
let data3 = [true, false, 3];

let result1 = verify(schema, data1); // true
let result2 = verify(schema, data2); // true
let result3 = verify(schema, data3); // false
```

```javascript
import {verify} from 'validate-declarative';

// defines an array with at least 2 elements, and where each element has no leading/trailing whitespace
const schema = {
  $test: object => object.length > 1,
  $element: {
    $test: function(object) {
      return typeof object === 'string' && object.trim() === object;
    }
  }
};

let data1 = ["hello", "world"];
let data2 = ["hello", 2];
let data3 = ["hello"];
let data4 = ["  hello ", "world"];

let result1 = verify(schema, data1); // true
let result2 = verify(schema, data2); // false
let result3 = verify(schema, data3); // false
let result4 = verify(schema, data4); // false
```
</details>
</br>
<details><summary><b>Multi-dimensional arrays</b></summary>

```javascript
import {verify, int} from 'validate-declarative';

// defines a 3 dimensional array of integers
const schema = {
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
</details>
</br>
<details><summary><b>Complex objects</b></summary>

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
</details>
</br>
<details><summary><b>Objects with optional properties</b></summary>

```javascript
import {verify, string} from 'validate-declarative';

const APIrequestSchema = {
  url: string,  
  params: {
    $type: string,
    $optional: true  
  }  
};

let request1 = {
  url: "video/watch/",
  params: "id=29340285723"
};

let request2 = {
  url: "video/list"
};

let result1 = verify(APIrequestSchema, request1); // true
let result2 = verify(APIrequestSchema, request2); // true
```
</details>
</br>
<details><summary><b>Objects with unique values</b></summary>

```javascript
import {verify, string, positiveInt} from 'validate-declarative';

const productSchema = {
  productId: {
    $type: positiveInt,
    $unique: true
  },
  productName: string
};

let product1 = {
  productId: 1,
  productName: "Reclaimed Wood Desk"
};

let product2 = {
  productId: 1,
  productName: "Teak Writing Desk"
};

let result1 = verify(productSchema, product1); // true
let result2 = verify(productSchema, product2); // false
```
</details>
</br>
<details><summary><b>Arrays with unique elements</b></summary>

```javascript
import {verify, string} from 'validate-declarative';

const playersSchema = {
  $element: {
    $type: string,
    $unique: true  
  }
};

let roster1 = ["Thomas", "James", "John"];
let roster2 = ["Linda", "Mary", "Mary"];

let result1 = verify(playersSchema, roster1); // true
let result2 = verify(playersSchema, roster2); // false
```
</details>


## API

### `verify(schema, data, options={}) → boolean`
Validates `data` (any Javascript object) against the `schema` 
(a constant, non-circular, [plain object](https://www.npmjs.com/package/is-plain-object)), 
returning *true* if and only if every property in the schema 
exists in the data, and every property's value in the data 
satisfies the constraints of the property 
(see [Constraints](#constraints)), *false* otherwise. 
Prototypal properties in `data` are ignored.
Uses Node's [`assert.deepStrictEqual()`](https://nodejs.org/api/assert.html#assert_assert_deepstrictequal_actual_expected_message)
rules when comparing objects.

`options` is an optional argument that is an object with the following keys:

|Key|Type|Default|Description|
|---|----|-------|-----------|
|`allowExtraneous`|boolean|*false*|If *false*, an [ExtraneousPropertyError](#extraneous-property-error) will be generated when a property exists in the data but not the schema. If *true*, no such error will be generated.|
|`throwOnError`|boolean|*false*|If *true*, a Javascript Error will be thrown upon a constraint violation. If *false*, no Error will be thrown.|

<details><summary><b>[ <i>View usage</i> ]</b></summary>
  
```javascript
import {verify, int} from 'validate-declarative';

const schema = {
    a: int
};

let data = {
    a: 5
};

let options = {
    allowExtraneous: true,
    throwOnError: false
};

let result = verify(schema, data, options);
```

</details>
<br/>

### `validate(schema, data, options={}) → Object`
Same as `verify()`, but returns a *report object* containing a reference to the schema (`schema`), a reference to the data that was validated (`data`), 
and an array error objects (`errors`, see [Errors](#errors)) describing each constraint failure in detail. 
If the data satisfies the schema, `errors` will be an empty array, otherwise it will be non-empty.

<br/>

### `setGlobalValidationOptions(options)`
Sets the global validation rules for all validations. `options` is an optional argument that is an object with the following keys:

|Key|Type|Default|Description|
|---|----|-------|-----------|
|`allowExtraneous`|boolean|*false*|If *false*, an [ExtraneousPropertyError](#extraneous-property-error) will be generated when a property exists in the data but not the schema. If *true*, no such error will be generated.|
|`throwOnError`|boolean|*false*|If *true*, a Javascript Error will be thrown upon a constraint violation. If *false*, no Error will be thrown.|

To restore the default global configuration, call `setGlobalValidationOptions()` with no arguments.

<details><summary><b>[ <i>View usage</i> ]</b></summary>
  
```javascript
import {setGlobalValidationOptions} from 'validate-declarative';

let options = {
    allowExtraneous: false,
    throwOnError: true
};

setGlobalValidationOptions(options);
```

</details>
<br/>

### `typeWithInstanceOf(clazz, name=clazz.name) → Object`
Convenience function.
Returns a *type* (an object with a `$test` [constraint](#constraints)) that returns
*true* if the object is not null and the object is an **instanceof** `clazz`, *false* otherwise.
If `name` is present, it becomes the `$name` of the resulting type- 
otherwise the `$name` of the resulting type is set to `clazz.name`.

<details><summary><b>[ <i>View usage</i> ]</b></summary>
  
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

</details>
<br/>

### `_resetSchema(schema)`
Resets the internal unique values within the schema, which are used to enforce uniqueness
of values within and across data. **Invoking this function is not recommended for normal use**.
After this function is invoked, uniqueness is no longer guaranteed on the schema.

<details><summary><b>[ <i>View usage</i> ]</b></summary>
  
```javascript
import {verify, _resetSchema, int} from 'validate-declarative';

const schema = {
    $type: int,
    $unique: true
};

let result1 = verify(schema, 5); // true
let result2 = verify(schema, 5); // false
_resetSchema(schema);
let result3 = verify(schema, 5); // true
```

</details>

## Constraints
Constraints define the rules for validating data. 
They are embedded in schema objects alongside ordinary properties. 
Constraints begin with `$` to differentiate them from ordinary properties.
There are five types of constraints: `$test`, `$type`, `$optional`, `$unique`, and `$element`.

### `$test`
**Default:** `(object) => true`

Defines a simple type test. 
`$test` is a function that takes an object and returns *true* if the object is valid, 
*false* otherwise. By default, the object is always valid.
Alternatively, `$test` is a regular expression that describes a valid object.
If the object is invalid, an [InvalidValueError](#invalidvalueerror) is generated.

(Note: `$test` does not perform any Javascript Error handling. 
Calling a function like `charAt()` on an object without first checking that it is a string
will throw a Javascript Error if the object is not a string.)

<details><summary><b>[ <i>View examples</i> ]</b></summary>

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
</details>
<br/>

### `$type`
**Default:** `{ $test: (object) => true }`

Allows you to extend an existing type. 
`$type` is any object with a `$test` property that is a type test (see above).
There can be many `$type` declarations nested within each other.
During validation, the deepest `$test` is called first, then the second-deepest, and so on. 
This functionality allows you to easily 'chain' series of type tests together to create original custom types (see example #2 below). 
Indeed, many of the [built-in types](#built-in-types) included in this package are defined this way 
(`number` 🡒 `int` 🡒 `positiveInt`).

If neither `$test` nor `$type` is present, the validated object is always valid.

You can add a `$name` property to your custom type, which determines 
the *expectedType*
in a generated error- though this is entirely optional.

<details><summary><b>[ <i>View examples</i> ]</b></summary>
  
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
</details>
<br/>

### `$optional`
**Default**: `false`

Declares a property optional. 
By default, all properties in the schema are required. 
If `$optional` is *true*, a [MissingPropertyError](#missingpropertyerror)
 will **not** be generated if the property does not exist in the data.
For nested `$optional` declarations,
only the most shallow `$optional` declaration is considered.
`$optional` declarations at the top level of the schema
 or at the top level of an `$element` object are ignored.

<details><summary><b>[ <i>View examples</i> ]</b></summary>
  
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
</details>
<br/>

### `$unique`
**Default**: `false`

Declares a value of a property or an array element to be unique across all data validated
against a particular schema.
By default, all properties in a schema are non-unique.
If `$unique` is *true*, the property will generate a 
[DuplicateValueError](#duplicatevalueerror) when a duplicate value is
detected across two data or detected within the same data (ex. duplicate values in an array).
For nested `$unique` declarations,
only the most shallow `$unique` declaration is considered.

(Note: Every `NaN` value is different from every other value, including other `NaN` values 
(as per the [ECMAScript spec](https://www.ecma-international.org/ecma-262/5.1/#sec-11.9.6)).
It would therefore be meaningless to declare a `NaN` property unique- as it will always be unique.)

(Note: Each `$unique` declaration is mapped to an internal array of values stored within
a hidden property within the schema. 
**Be warned**- a large number of validations may result in high memory usage,
as every validation adds another element to each internal array of unique values within the schema.
Though it is not recommended for normal use, you can call `_resetSchema()` to clear these internal arrays (see [API](#api)).
This, however, will not guarantee uniqueness for subsequent validations.)

<details><summary><b>[ <i>View examples</i> ]</b></summary>
  
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
</details>
<br/>

### `$element`
**Default:** `undefined`

Defines the schema of each element in an array or set. 
When `$element` is present, `$type` defaults to the `list` type (see [Built-in Types](#built-in-types)).
`$element` declarations can be nested within eachother to validate multi-dimensional arrays.

<details><summary><b>[ <i>View examples</i> ]</b></summary>
  
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
</details>

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
  error: "InvalidValueError",    // the type of error that occurred
  key: "menu.menuItems[3].desc", // the property where the error occurred
  value: 5,                      // the actual value found in the data at the property
  expectedType: "string"         // the expected type, defined by $name
}
```

#### DuplicateValueError
Generated when `$unique` = *true* and a duplicate value is detected within/across the data.
```javascript
{
  error: "DuplicateValueError",
  key: "candidates[2].SSN",
  value: "123-45-6789"
}
```

#### MissingPropertyError
Generated when `$optional` = *false* and a property is missing from the data.
```javascript
{
  error: "MissingPropertyError",
  key: "company.shippingAddress"
}
```

#### ExtraneousPropertyError
Generated when `allowExtraneous` = *false* and there is an extra property in the data.
```javascript
{
  error: "ExtraneousPropertyError",
  key: "favoriteColor"
}
```


## Built-in Types
This section contains a list of the built-in types that are included in this package.
See the [examples](#examples) for how to use types or how to define your own type.

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
|`list`|An array or set.|`[]`, `new Set()`|
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
Optional types are the same as core types, but with `$optional` = *true*.

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
|`optionalList`|An optional array or optional set.|`[]`, `new Set()`|
|`optionalObject`|Any object that is not a function (optional).|`{}`, `[1, 2, 3]`, `new Set(1, 2, 3)`|
|`optionalFunc`|An optional function.|`function(){}`, `() => {}`, `Date`|
|`optionalDate`|An optional date object.|`new Date()`|
|`optionalSymbol`|An optional symbol.|`Symbol()`|
|`optionalRegexp`|An optional regular expression object.|`/.*/g`, `new Regexp(".*")`|
|`optionalNullValue`|An optional **null** value.|`null`|
|`optionalUndefinedValue`|An optional **undefined** value.|`undefined`|
|`optionalNanValue`|An optional **NaN** value.|`NaN`|
|`optionalAny`|Any value (optional).|`512`, `null`, `"hello"`, `undefined`, `[1, 2, 3]`|

#### Unique types
Unique types are the same as core types, but with `$unique` = *true*.

|Type|Description|Examples|
|----|-----------|------------|
|`uniqueString`|A unique string.|`""`, `"hello world"`|
|`uniqueNumber`|A unique number.|`-5`, `0`, `8.4`, `7/3`, `Infinity`, `-Infinity`|
|`uniqueNonPositiveNumber`|A unique non-positive number.|`-Infinity`, `-5.5`, `0`|
|`uniqueNegativeNumber`|A unique negative number.|`-Infinity`, `-5.5`|
|`uniqueNonNegativeNumber`|A unique non-negative number.|`0`, `5.5`, `Infinity`|
|`uniquePositiveNumber`|A unique positive number.|`5.5`, `Infinity`|
|`uniqueInt`|A unique integer.|`-10000000`, `-5`, `0`, `12345`|
|`uniqueNonPositiveInt`|A unique non-positive integer.|`-5`, `0`|
|`uniqueNegativeInt`|A unique negative integer.|`-5`|
|`uniqueNonNegativeInt`|A unique non-negative integer.|`0`, `5`|
|`uniquePositiveInt`|A unique positive integer.|`5`|
|`uniqueBoolean`|A unique boolean value.|`true`, `false`|
|`uniqueTruthy`|A unique truthy value.|`true`, `1`, `[]`, `{}`, `"false"`|
|`uniqueFalsy`|A unique falsy value.|`false`, `0`, `""`, `null`, `undefined`, `NaN`|
|`uniqueArray`|A unique array.|`[1, 2, "3"]`, `new Array()`|
|`uniqueList`|A unique array or unique set.|`[]`, `new Set()`|
|`uniqueObject`|Any object that is not a function (unique).|`{}`, `[1, 2, 3]`, `new Set(1, 2, 3)`|
|`uniqueFunc`|A unique function.|`function(){}`, `() => {}`, `Date`|
|`uniqueDate`|A unique date object.|`new Date()`|
|`uniqueSymbol`|A unique symbol.|`Symbol()`|
|`uniqueRegexp`|A unique regular expression object.|`/.*/g`, `new Regexp(".*")`|
|`uniqueNullValue`|A unique **null** value.|`null`|
|`uniqueUndefinedValue`|A unique **undefined** value.|`undefined`|
|`uniqueAny`|Any value (unique).|`512`, `null`, `"hello"`, `undefined`, `[1, 2, 3]`|


## About
This project is maintained by [Tyler Hurson](https://github.com/Mariosunny). 
Submit any issues or pull requests to the [official Github repo](https://github.com/Mariosunny/validate-declarative).

Check out other projects by this author:
- [**unravel-function**](https://www.npmjs.com/package/unravel-function) - Takes a function and spreads its arguments across a chain of functions to be lazily evaluated.
                                                                       
