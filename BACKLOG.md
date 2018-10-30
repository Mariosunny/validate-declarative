# Backlog
This file contains a list of features that should be implemented.
If you would like to contribute, please read `CONTRIBUTING.md`.

## Features

#### `keys` option
In the current version of the project, data containing keys that are reserved keywords (`$test`, `$type`, `$optional`, `$unique`, `$element`, `$name`)
cannot be properly validated:

```javascript
import {verify, string} from 'validate-declarative';

// the schema is supposed to have a property $test that is equal to 5, 
// but validate-declarative interprets the property as a type test
const schema = {
    a: {
        $test: string
    },
    $test: 5
};

let data = {
    a: 'hello',
    $test: 5
};

verify(schema, data) 
// produces unexpected results due to name conflict with $test
```

The optional `options` argument passed into `verify()`, `validate()`, and `setGlobalValidationOptions()`
should include a new option: `keys`, which re-defines reserved keywords so that these
name conflicts can be avoided.

Ex.

```javascript
import {verify, setGlobalValidationOptions, int} from 'validate-declarative';

let options = {
    keys: {
        $test: "__test",
        $element: "_element_"
    }
};

const schema = {
    a: {
        _element_: { // _element_ is interpreted as array element
            __test: int // __test is interpreted as type test
        },   
    },
    $test: 5 // $test is interpreted as literal $test property
};

let data = {
    a: [1, 2, 3],
    $test: 5
};

verify(schema, data, options); // true

setGlobalValidationOptions(options);

verify(schema, data); // true
```