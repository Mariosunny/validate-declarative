## validate-declarative
A simple utility for declaratively validating the structure of any Javascript object.
Lightweight and highly extensible.

***See it in action:***
```javascript
import {verify, string, boolean, int, nonNegativeInt} from 'validate-declarative';

// Define the structure and constraints of your objects
const courseSchema = {
    courseName: {
        $test: /[A-Za-z0-9 ]+/
    },
    roomCapacity: nonNegativeInt,
    professor: {
        name: string,
        tenured: boolean,
        salary: {
            $type: int,
            $test: function(object) {
              return 50000 <= object && object <= 150000;
            }
        }
    },
    teacherAssistants: {
        $optional: true,
        $element: string
    }
};

// Create an object
let objectOrientedCourse = {
    courseName: "Object Oriented Programming",
    roomCapacity: 30,
    professor: {
        name: "Dr. Placeholder",
        tenured: true,
        salary: 124000
    },
    teacherAssistants: ["Matthew R.", "Jennifer Q."]
};

// true - the object matches the schema!
let result1 = verify(courseSchema, objectOrientedCourse);

let microprocessorsCourse = {
    courseName: "Microprocessors",
    roomCapacity: 25,
    professor: {
        name: "Mr. Baz",
        tenured: false,
        salary: 45000
    }
};

// false - professor.salary fails the $test constraint!
let result2 = verify(courseSchema, microprocessorsCourse);
```

## Table of Contents
- [Overview](#overview)
- [API](#api)
- [Constraints](#constraints)
- [Examples](#examples)
- [Built-in Types](#built-in-types)
- [About](#about)

## Overview
A *schema* is a plain-old Javascript object that has some special properties. 
A schema describes the structure of some data.

```javascript
// a schema that describes a tweet
const tweetSchema = {
  $test: function(object) {
    return typeof object === 'string' && object.length <= 24;
  }
};
```
Keys in a schema beginning with `$` are constraints. Constraints define the rules for validating data. 
The most commonly used constraint is the `$test` constraint, which defines a type test.
In the example above, `$test` defines a type that is a *string* and also has a *length* of 24 characters or less. 

The following data satisfies `$test`, and therefore satisfies the schema:
```javascript
let myTweet1 = "Hello world!";
```

But neither of these data passes `$test`, so they fail the schema:
```javascript
let myTweet2 = 5;
let myTweet3 = "Lorem ipsum dolor sit amet, consectetur adipiscing.";
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

This is a simple example, but schemas can be as large and complex as you want.
You can create a schema for any Javascript object. 
Check out some more examples.

## API

#### `verify(schema, data, extraneous=false)`
Validates `data` against the `schema`, returning *true* if and only if every property in the schema exists in the data, and every property's value in the data satisfies the constraints of the property (see Constraints), *false* otherwise. If `extraneous` is set to *false*, and there is at least one property that exists in the data but not in the schema, returns *false*. If `extraneous` is set to *true*, extraneous properties in the data will be ignored.

#### `validate(schema, data, extraneous=false)`
Same as `verify()`, but returns an array of error objects (see below) describing each constraint failure in detail. If the data satisfies the schema, the array will be empty, otherwise the array will be non-empty.

#### Errors

###### InvalidValueError
```javascript
/* Generated when a value fails its type test */
{
  error: "InvalidValueError"    // name of the error
  key: "menu.menuItems[3].desc" // the property where the error occurred
  value: 5,              // the actual value found in the data
  expectedType: "string" // the expected type, defined by $name
}
```

###### NonUniqueValueError
```javascript
/* Generated when a duplicate value is detected on a unique constraint */
{
  error: "NonUniqueValueError"
  key: "restaurant.headChef",
  value: "Tom G. Bar"
}
```

###### MissingPropertyError
```javascript
/* Generated when a property is missing from the data */
{
  error: "MissingPropertyError"
  key: "headChef"
}
```

###### ExtraneousPropertyError
```javascript
/* Generated when there is an extra property in the data
   (Not generated when extraneous = true) */
{
  error: "ExtraneousPropertyError"
  key: "username"
}
```

## Constraints
Constraints define the rules for validating data. 
They are embedded in schema objects alongside ordinary properties. 
Constraints begin with `$` to differentiate them from ordinary properties.
There are five types of constraints: `$test`, `$type`, `$optional`, `$unique`, and `$element`.

#### `$test`
Defines a simple type test. `$test` is a function that takes an object and returns `true` if the object is valid, `false` otherwise. Alternatively, `$test` is a regular expression that describes a valid object.
```javascript
// a custom type
const countryCode = {
  $test: function(object) {
    // a valid country code is a string with 3 characters
    return typeof object === 'string' && object.length === 3;
  }
}

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
  $test: /[A-Za-z]{3}/
}

const countrySchema = {
  country: countryCode
};
```

### `$type`
Allows you to extend an existing type. `$type` is any object with a `$test` property. During validation, the `$test` in `$type` is called first before the local `$test`.

```javascript
import {nonNegativeInt} from 'validate-declarative';

// palindrome extends nonNegativeInt
const palindrome = {
  // nonNegativeInt is an object with its own $test
  $type: nonNegativeInt,
  $test: function(object) {
    let str = object + "";
    return str === str.split("").reverse().join("");
  }
};

const schema = {
  streetNumber: palindrome
};
```

```javascript
// A type may contain many deeply nested $tests
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
}

const schema = {
  cars: smallNoDuplicatesArray
};
```

### `$optional`
Declares a property to be optional. By default, all properties defined in the schema are required. Declaring `$optional: true` on a property will make it optional.

```javascript
import {verify, int, string} from 'validate-declarative';

const schema = {
  foo: int,
  bar: {
    $type: string,
    $optional: true
  }
};

let data = {
  foo: -100,
  bar: "hello world"
};

let data2 = {
  foo: 5
};

let result1 = verify(schema, data1); // true
let result2 = verify(schema, data2); // true
```

### `$unique`
Declares the value of a property to be unique across all data.

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

### `$element`
Defines the schema of each element in an array. When `$element` is present, the array `$type` is implied.

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
import {verify, string, number, boolean} from 'validate-declarative';

const bankAccountSchema = {
  accountHolder: string,
  active: boolean,
  balance: {
    checkings: number,
    savings: number
  }
};

let bankAccount = {
  accountHolder: "Susan B. Foo",
  active: true,
  balance: {
    checkings: 1094.97,
    savings: 39328.03
  }
};

let result = verify(bankAccountSchema, bankAccount); // true
```

#### Defining a custom type
```javascript
import {verify, int} from 'validate-declarative';

const primeNumber = {
    $type: int,
    $test: function(object) {
        for(let i = 2; i < object; i++) {
            if(object % i === 0) {
                return false;
            }
        }
        return object !== 1 && object !== 0;
    }
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

const threeDimensionalShapeSchema = {
  // a 3-dimensional array of ints
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

let result = verify(threeDimensionalShapeSchema, data); // true
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

## Built-in Types

#### `string`
```javascript
// A string (ex. "", "hello world")
const string = {
  $test: function(object) {
    return typeof object === 'string';
  }
};
```

#### `number`
```javascript
// A number (ex. -5, 0, 8.4, 7/3)
const number = {
  $test: function(object) {
    return typeof object === 'number';
  }
};
```

#### `nonPositiveNumber`
```javascript
// An integer that is less than or equal to 0 (ex. -5.5, 0)
const nonPositiveNumber = {
  $type: number,
  $test: function(object) {
    return object <= 0;
  }
};
```

#### `negativeNumber`
```javascript
// An integer that is less than 0 (ex. -5.5)
const negativeNumber = {
  $type: number,
  $test: function(object) {
    return object < 0;
  }
};
```

#### `nonNegativeNumber`
```javascript
// An integer that is greater than or equal to 0 (ex. 0, 5.5)
const nonNegativeNumber = {
  $type: number,
  $test: function(object) {
    return object >= 0;
  }
};
```

#### `positiveNumber`
```javascript
// A number that is greater than 0 (ex. 5.5)
const positiveNumber = {
  $type: number,
  $test: function(object) {
    return object > 0;
  }
};
```

#### `int`
```javascript
// An integer number (ex. -5, 0, 100000)
const int = {
  $type: number,
  $test: function(object) {
    return Number.isInteger(object);
  }
};
```

#### `nonNegativeInt`
```javascript
// An integer that is less than or equal to 0 (ex. -5, 0)
const nonNegativeInt = {
  $type: int,
  $test: function(object) {
    return object <= 0;
  }
};
```

#### `negativeInt`
```javascript
// An integer that is less than 0 (ex. -5)
const negativeInt = {
  $type: int,
  $test: function(object) {
    return object < 0;
  }
};
```

#### `nonNegativeInt`
```javascript
// An integer that is greater than or equal to 0 (ex. 0, 5)
const nonNegativeInt = {
  $type: int,
  $test: function(object) {
    return object >= 0;
  }
};
```

#### `positiveInt`
```javascript
// An integer that is greater than 0 (ex. 5)
const positiveInt = {
  $type: int,
  $test: function(object) {
    return object > 0;
  }
};
```

#### `boolean`
```javascript
// A boolean value (true or false)
const boolean = {
  $test: function(object) {
    return typeof object === 'boolean';
  }
};
```

#### `truthy`
```javascript
// A value that is 'truthy' (ex. true, 1, [], {}, "false")
const truthy = {
  $test: function(object) {
    return !!object;
  }
};
```

#### `falsy`
```javascript
// A value that is 'falsy' (false, 0, "", null, undefined, or NaN)
const falsy = {
  $test: function(object) {
    return !object;
  }
};
```

#### `array`
```javascript
// An array (ex. [], [1, 2, 3])
const array = {
  $test: function(object) {
    return Array.isArray(object);
  }
};
```

#### `object`
```javascript
// A object literal (ex. {}, {foo: 5})
const object = {
  $test: function(object) {
    return object !== null && typeof object === 'object';
  }
};
```

#### `func`
```javascript
// A function (ex. function() {}, () => {}, Date)
const func = {
  $test: function(object) {
    return typeof object === "function";
  }
};
```

#### `date`
```javascript
// A function (ex. new Date())
const date = {
  $test: function(object) {
    return object instanceof Date;
  }
};
```

#### `symbol`
```javascript
// A function (ex. Symbol())
const symbol = {
  $test: function(object) {
    return typeof object === 'symbol';
  }
};
```

#### `regexp`
```javascript
// A function (ex. /\w+/, new Regexp('abc'))
const regexp = {
  $test: function(object) {
    return object instanceof RegExp;
  }
};
```

#### `nullValue`
```javascript
// A null value
const nullValue = {
  $test: function(object) {
    return object === null;
  }
};
```

#### `undefinedValue`
```javascript
// An undefined value
const undefinedValue = {
  $test: function(object) {
    return object === undefined;
  }
};
```

#### `nanValue`
```javascript
// A NaN value
const nanValue = {
  $test: function(object) {
    return isNaN(object);
  }
};
```

#### `any`
```javascript
// Any value (always returns true)
const any = {
  $test: function(object) {
    return true;
  }
};
```

## About
This project is maintained by [Tyler Hurson](https://github.com/Mariosunny). 
Submit any issues or pull requests to the [official Github repo](https://github.com/Mariosunny/validate-declarative).
