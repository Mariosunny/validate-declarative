import scheme from '../src/schema';
import {boolean, int, nonNegativeInt, string} from "../src/schemaTypes";
import {INVALID_PROPERTY_ERROR, MISSING_PROPERTY_ERROR, NON_UNIQUE_PROPERTY_ERROR} from "../src/errorTypes";
import _ from "lodash";

describe('test core functionality', () => {
    test('test verify returns boolean', () => {
        expect(scheme({}).verify({})).toEqual(true);
    });

    test('test validate returns array', () => {
        expect(scheme({}).validate({})).toEqual([]);
    });

    test('test single value', () => {
        expect(scheme(int).verify(5)).toBe(true);
        expect(scheme(int).verify("hello")).toBe(false);
    });

    test('test single array', () => {
        let schema = scheme({
            $element: int
        });
        expect(schema.verify(5)).toBe(false);
        expect(schema.verify([])).toBe(true);
        expect(schema.verify([1, 2, 3])).toBe(true);
        expect(schema.verify(["hello"])).toBe(false);
    });

    test('test custom type', () => {
        let customType = {
            $test: object => object.includes('c')
        };
        let schema = scheme({
            a: customType
        });
        let data = {
            a: ['a', 'b', 'c']
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: ['a', 'b', 'd']
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test literal value', () => {
        let schema = scheme({
            a: 5
        });
        let data = {
            a: 5
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: 6
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test literal object', () => {
        let schema = scheme({
            a: {
                b: 5,
                c: 10
            }
        });
        let data = {
            a: {
                b: 5,
                c: 10
            }
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: {
                b: 6,
                c: 10
            }
        };
        expect(schema.verify(data)).toBe(false);

        data = {
            a: {
                b: 5,
                c: 10,
                d: 5
            }
        };
        expect(schema.verify(data)).toBe(false);

        data = {
            a: {
                b: 5
            }
        };
        expect(schema.verify(data)).toBe(false);

        data = {
            a: {}
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test deeply nested object', () => {
        let schema = scheme({
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                f: int
                            }
                        }
                    },
                    g: {
                        h: {
                            i: string
                        }
                    },
                    j: string
                }
            }
        });
        let data = {
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                f: 5
                            }
                        }
                    },
                    g: {
                        h: {
                            i: "hello"
                        }
                    },
                    j: "there"
                }
            }
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: {
                b: {
                    c: {
                        d: {
                            e: 5
                        }
                    },
                    g: {
                        h: {
                            i: "hello"
                        }
                    },
                    j: "there"
                }
            }
        };
        expect(schema.verify(data)).toBe(false);

        data = {
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                f: 5
                            }
                        }
                    },
                    g: {
                        h: {
                            i: "hello"
                        }
                    }
                }
            }
        };
        expect(schema.verify(data)).toBe(false);

        data = {
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                f: {
                                    g: 5
                                }
                            }
                        }
                    },
                    g: {
                        h: {
                            i: "hello"
                        }
                    },
                    j: "there"
                }
            }
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test required key functionality', () => {
        let schema = scheme({
            a: {
                $type: int
            }
        });
        let data = {
            a: 5
        };
        expect(schema.verify(data)).toBe(true);

        data = {};
        expect(schema.verify(data)).toBe(false);
    });

    test('test optional key functionality', () => {
        let schema = scheme({
            a: {
                $optional: true
            }
        });
        let data = {
            a: 5
        };
        expect(schema.verify(data)).toBe(true);

        data = {};
        expect(schema.verify(data)).toBe(true);

        schema = scheme({
            a: {
                $optional: false
            }
        });
        data = {
            a: 5
        };
        expect(schema.verify(data)).toBe(true);

        data = {};
        expect(schema.verify(data)).toBe(false);
    });

    test('test inline type', () => {
        let schema = scheme({
            a: int
        });
        let data = {
            a: 5
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: "hello"
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test nested type', () => {
        let schema = scheme({
            a: {
                $type: int
            }
        });
        let data = {
            a: 5
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: "hello"
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test test without type', () => {
        let schema = scheme({
            a: {
                $test: function(object) {
                    return /[a-z]/.test(object);
                }
            }
        });
        let data = {
            a: "hello"
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: "HELLO"
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test type inheritance', () => {
        let schema = scheme({
            a: {
                $type: int,
                $test: function(object) {
                    return object === 5;
                }
            }
        });
        let data = {
            a: 5
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: "hello"
        };
        expect(schema.verify(data)).toBe(false);

        data = {
            a: 6
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test unique key functionality', () => {
        let schema = scheme({
            a: {
                $type: int,
                $unique: true
            }
        });
        let data1 = {
            a: 5
        };
        let data2 = {
            a: 5
        };
        expect(schema.verify(data1)).toBe(true);
        expect(schema.verify(data2)).toBe(false);

        schema = scheme({
            a: {
                $type: int,
                $unique: true
            }
        });
        data1 = {
            a: 5
        };
        data2 = {
            a: 6
        };
        expect(schema.verify(data1)).toBe(true);
        expect(schema.verify(data2)).toBe(true);

        schema = scheme({
            a: {
                $type: int,
                $unique: false
            }
        });
        data1 = {
            a: 5
        };
        data2 = {
            a: 5
        };
        expect(schema.verify(data1)).toBe(true);
        expect(schema.verify(data2)).toBe(true);
    });

    test('test complex object', () => {
    let schema = scheme({
        $element: {
            a: {
                b: {
                    $element: {
                        c: {
                            d: {
                                $element: int
                            }
                        }
                    }
                }
            }
        }
    });

        let data = [
            {
                a: {
                    b: [
                        {
                            c: {
                                d: [1, 2, 3]
                            }
                        }
                    ]
                }
            },
            {
                a: {
                    b: [
                        {
                            c: {
                                d: []
                            }
                        }
                    ]
                }
            },
            {
                a: {
                    b: []
                }
            }
        ];

        expect(schema.verify([])).toBe(true);
        expect(schema.verify(data)).toBe(true);

        data = [
            {
                a: {
                    b: [
                        {
                            c: {
                                d: [1, 2, "hello"]
                            }
                        }
                    ]
                }
            }
        ];

        expect(schema.verify(data)).toBe(false);

        data = [
            {
                a: {
                    b: [
                        {
                            c: {
                                d: [1, 2, 3]
                            }
                        },
                        {
                            d: 5
                        }
                    ]
                }
            }
        ];

        expect(schema.verify(data)).toBe(false);

        data = [
            {
                a: {
                    b: [
                        {
                            c: {
                                d: [1, 2, 3]
                            }
                        },
                        []
                    ]
                }
            }
        ];

        expect(schema.verify(data)).toBe(false);

        data = [
            {
                a: {
                    b: [ 1 ]
                }
            }
        ];

        expect(schema.verify(data)).toBe(false);

        data = [
            {
                a: {
                    b: []
                }
            }
        ];

        expect(schema.verify(data)).toBe(true);

        data = [
            {
                a: {
                    b: []
                }
            },
            {
                a: {
                    b: []
                }
            }
        ];

        expect(schema.verify(data)).toBe(true);

        data = [
            {
                a: {
                    b: []
                }
            },
            {
                a: {
                    b: [1]
                }
            }
        ];

        expect(schema.verify(data)).toBe(false);

        data = [
            {
                a: {
                    b: []
                }
            },
            {
                a: {
                    b: [
                        {
                            c: {
                                d: [1, 2, 3]
                            }
                        }
                    ]
                }
            }
        ];

        expect(schema.verify(data)).toBe(true);
    });
});

describe('test error generation', () => {
    function getSchema() {
        return scheme({
            a: {
                $element: {
                    b: 5,
                    c: int
                }
            },
            d: {
                e: {
                    f: boolean,
                    g: {
                        $type: nonNegativeInt,
                        $unique: true
                    }
                }
            },
            h: {
                $type: string,
                $optional: true
            }
        });
    }

    function getData() {
        return {
            a: [
                {
                    b: 5,
                    c: 10
                },
                {
                    b: 5,
                    c: 12
                }
            ],
            d: {
                e: {
                    f: true,
                    g: 0
                }
            },
            h: "hello world"
        };
    }

    function createError(path, errorType, receivedValue, expectedType) {
        let error = {
            error: errorType,
            key: path
        };
        if(receivedValue) {
            error.receivedValue = receivedValue;
        }
        if(expectedType) {
            error.expectedType = expectedType;
        }
        return error;
    }

    test('test valid data', () => {
        expect(getSchema().verify(getData())).toBe(true);
    });

    test('test missing attribute ', () => {
        let schema = getSchema();
        let data = getData();
        delete data.a;
        let errors = [createError("a", MISSING_PROPERTY_ERROR)];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        delete data.a;
        delete data.h;
        errors = [createError("a", MISSING_PROPERTY_ERROR)];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        delete data.a;
        delete data.d.e.f;
        errors = [
            createError("a", MISSING_PROPERTY_ERROR),
            createError("d.e.f", MISSING_PROPERTY_ERROR)
        ];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        delete data.a;
        delete data.d.e.f;
        delete data.d.e.g;
        errors = [
            createError("a", MISSING_PROPERTY_ERROR),
            createError("d.e.f", MISSING_PROPERTY_ERROR),
            createError("d.e.g", MISSING_PROPERTY_ERROR)
        ];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        delete data.d.e;
        errors = [
            createError("d.e", MISSING_PROPERTY_ERROR)
        ];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        delete data.d;
        errors = [
            createError("d", MISSING_PROPERTY_ERROR)
        ];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = {};
        errors = [
            createError("a", MISSING_PROPERTY_ERROR),
            createError("d", MISSING_PROPERTY_ERROR)
        ];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        delete data.a[0].b;
        delete data.a[1].c;
        errors = [
            createError("a[0].b", MISSING_PROPERTY_ERROR),
            createError("a[1].c", MISSING_PROPERTY_ERROR)
        ];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        data.a = [];
        errors = [];
        validateErrors(schema, data, errors);
    });

    test('test invalid attribute ', () => {
        let schema = getSchema();
        let data = getData();
        data.a[0].c = "hello";
        let errors = [createError("a[0].c", INVALID_PROPERTY_ERROR, "hello", int.$name)];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        data.a[0].b = "hello";
        errors = [createError("a[0].b", INVALID_PROPERTY_ERROR, "hello")];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        data.a[0].b = "hello";
        data.d.e.f = "hi";
        errors = [
            createError("a[0].b", INVALID_PROPERTY_ERROR, "hello"),
            createError("d.e.f", INVALID_PROPERTY_ERROR, "hi", boolean.$name)
        ];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        data.d.e.g = -1;
        errors = [createError("d.e.g", INVALID_PROPERTY_ERROR, -1, nonNegativeInt.$name)];
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        data.h = 0;
        errors = [createError("h", INVALID_PROPERTY_ERROR, 0, string.$name)];
        validateErrors(schema, data, errors);
    });

    test('test unique attribute', () => {
        let schema = getSchema();
        let data = getData();
        let errors = [];
        validateErrors(schema, data, errors);
        errors = [createError("d.e.g", NON_UNIQUE_PROPERTY_ERROR, data.d.e.g)];
        validateErrors(schema, data, errors);
        validateErrors(schema, data, errors);

        schema = getSchema();
        data = getData();
        errors = [];
        validateErrors(schema, data, errors);
        data = getData();
        data.d.e.g = 1;
        errors = [];
        validateErrors(schema, data, errors);
        data = getData();
        data.d.e.g = 2;
        errors = [];
        validateErrors(schema, data, errors);
        data = getData();
        data.d.e.g = 0;
        errors = [createError("d.e.g", NON_UNIQUE_PROPERTY_ERROR, data.d.e.g)];
        validateErrors(schema, data, errors);
    });

    test('test multiple error types', () => {
        let schema = getSchema();
        let data = getData();
        delete data.a[0].b;
        delete data.d.e.f;
        data.a[1].b = "hi";
        data.h = 5;
        let errors = [
            createError("a[0].b", MISSING_PROPERTY_ERROR),
            createError("d.e.f", MISSING_PROPERTY_ERROR),
            createError("a[1].b", INVALID_PROPERTY_ERROR, "hi"),
            createError("h", INVALID_PROPERTY_ERROR, 5, string.$name),
        ];
        validateErrors(schema, data, errors);
        errors.push(createError("d.e.g", NON_UNIQUE_PROPERTY_ERROR, data.d.e.g));
        validateErrors(schema, data, errors);
    });

    function validateErrors(schema, data, expectedErrors) {
        let receivedErrors = schema.validate(data);

        expect(receivedErrors.length).toBe(expectedErrors.length);

        _.forEach(receivedErrors, receivedError => {
            expect(expectedErrors).toContainEqual(receivedError);
        });
    }
});

describe('test array functionality', () => {
    test('test basic array functionality', () => {
        let schema = scheme({
            a: {
                $element: {
                    $type: int
                }
            }
        });
        let data = {
            a: [1, 2, 3]
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: []
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: 5
        };
        expect(schema.verify(data)).toBe(false);

        data = {
            a: [1, 2, "3"]
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: [1, 2, "egg"]
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test array element uniqueness', () => {
        let schema = scheme({
            a: {
                $element: {
                    $type: int,
                    $unique: true
                }
            }
        });
        let data = {
            a: [1, 2, 3]
        };
        expect(schema.verify(data)).toBe(true);

        schema = scheme({
            a: {
                $element: {
                    $type: int,
                    $unique: true
                }
            }
        });
        data = {
            a: [1, 2, 2]
        };
        expect(schema.verify(data)).toBe(false)
    });

    test('test optional array', () => {
        let schema = scheme({
            a: {
                $optional: true,
                $element: {
                    $type: int
                }
            }
        });
        let data = {
            a: [1, 2, 3]
        };
        expect(schema.verify(data)).toBe(true);

        data = {};
        expect(schema.verify(data)).toBe(true);

        schema = scheme({
            a: {
                $optional: false,
                $element: {
                    $type: int
                }
            }
        });
        data = {};
        expect(schema.verify(data)).toBe(false);
    });

    test('test custom array element test function', () => {
        let schema = scheme({
            a: {
                $element: {
                    $test: element => /[a-z]/.test(element)
                }
            }
        });
        let data = {
            a: ["a", "b", "c"]
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: ["a", "b", "0"]
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('confirm optional element is noop', () => {
        let schema = scheme({
            a: {
                $element: {
                    $type: int,
                    $optional: true
                }
            }
        });
        let data = {
            a: [1, 2, 3]
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: []
        };
        expect(schema.verify(data)).toBe(true);

        schema = scheme({
            a: {
                $element: {
                    $type: int,
                    $optional: false
                }
            }
        });
        data = {
            a: [1, 2, 3]
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: []
        };
        expect(schema.verify(data)).toBe(true);
    });

    test('test regex test substitution', () => {
        let schema = scheme({
            a: {
                $test: /[a-z]/
            }
        });
        let data = {
            a: "abc"
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: "123"
        };
        expect(schema.verify(data)).toBe(false);

        data = {
            a: 5
        };
        expect(schema.verify(data)).toBe(false);
    });


    test('test $element inclusion overrides $type', () => {
        let schema = scheme({
            a: {
                $type: int,
                $element: {
                    $type: string
                }
            }
        });
        let data = {
            a: ['a', 'b', 'c']
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: 5
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test $test with array', () => {
        let schema = scheme({
            a: {
                $test: object => object.length >= 2,
                $element: {
                    $type: int
                }
            }
        });
        let data = {
            a: [1, 2, 3]
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: [1]
        };
        expect(schema.verify(data)).toBe(false);
    });

    test('test multi-dimensional array', () => {
        let schema = scheme({
            a: {
                $element: {
                    $element: int
                }
            }
        });
        let data = {
            a: [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: [1, 2, 3]
        };
        expect(schema.verify(data)).toBe(false);

        schema = scheme({
            a: {
                $element: {
                    $element: {
                        $element: int
                    }
                }
            }
        });
        data = {
            a: [
                [[1, 2], [3, 4]],
                [[5, 6], [7, 8]],
                [[9, 10], [11, 12]]
            ]
        };
        expect(schema.verify(data)).toBe(true);

        data = {
            a: [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]
        };
        expect(schema.verify(data)).toBe(false);
    });
});