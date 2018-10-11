import {int, string, verify} from "../src";

test('test basic array functionality', () => {
    let schema = {
        a: {
            $element: {
                $type: int
            }
        }
    };
    let data = {
        a: [1, 2, 3]
    };
    expect(verify(schema, data)).toBe(true);

    data = {
        a: []
    };
    expect(verify(schema, data)).toBe(true);

    data = {
        a: 5
    };
    expect(verify(schema, data)).toBe(false);

    data = {
        a: [1, 2, "3"]
    };
    expect(verify(schema, data)).toBe(false);

    data = {
        a: [1, 2, "egg"]
    };
    expect(verify(schema, data)).toBe(false);
});

test('test array element uniqueness', () => {
    let schema = {
        a: {
            $element: {
                $type: int,
                $unique: true
            }
        }
    };
    let data = {
        a: [1, 2, 3]
    };
    expect(verify(schema, data)).toBe(true);

    schema = {
        a: {
            $element: {
                $type: int,
                $unique: true
            }
        }
    };
    data = {
        a: [1, 2, 2]
    };
    expect(verify(schema, data)).toBe(false);
});

test('test optional array', () => {
    let schema = {
        a: {
            $optional: true,
            $element: {
                $type: int
            }
        }
    };
    let data = {
        a: [1, 2, 3]
    };
    expect(verify(schema, data)).toBe(true);

    data = {};
    expect(verify(schema, data)).toBe(true);

    schema = {
        a: {
            $optional: false,
            $element: {
                $type: int
            }
        }
    };
    data = {};
    expect(verify(schema, data)).toBe(false);
});

test('test custom array element test function', () => {
    let schema = {
        a: {
            $element: {
                $test: element => /[a-z]/.test(element)
            }
        }
    };
    let data = {
        a: ["a", "b", "c"]
    };
    expect(verify(schema, data)).toBe(true);

    data = {
        a: ["a", "b", "0"]
    };
    expect(verify(schema, data)).toBe(false);
});

test('confirm optional element is noop', () => {
    let schema = {
        a: {
            $element: {
                $type: int,
                $optional: true
            }
        }
    };
    let data = {
        a: [1, 2, 3]
    };
    expect(verify(schema, data)).toBe(true);

    data = {
        a: []
    };
    expect(verify(schema, data)).toBe(true);

    schema = {
        a: {
            $element: {
                $type: int,
                $optional: false
            }
        }
    };
    data = {
        a: [1, 2, 3]
    };
    expect(verify(schema, data)).toBe(true);

    data = {
        a: []
    };
    expect(verify(schema, data)).toBe(true);
});

test('test regex test substitution', () => {
    let schema = {
        a: {
            $test: /[a-z]/
        }
    };
    let data = {
        a: "abc"
    };
    expect(verify(schema, data)).toBe(true);

    data = {
        a: "123"
    };
    expect(verify(schema, data)).toBe(false);

    data = {
        a: 5
    };
    expect(verify(schema, data)).toBe(false);
});


test('test $element inclusion does not override $type', () => {
    let schema = {
        a: {
            $type: int,
            $element: {
                $type: string
            }
        }
    };
    let data = {
        a: ['a', 'b', 'c']
    };
    expect(verify(schema, data)).toBe(false);

    data = {
        a: 5
    };
    expect(verify(schema, data)).toBe(false);
});

test('test $test with array', () => {
    let schema = {
        a: {
            $test: object => object.length >= 2,
            $element: {
                $type: int
            }
        }
    };
    let data = {
        a: [1, 2, 3]
    };
    expect(verify(schema, data)).toBe(true);

    data = {
        a: [1]
    };
    expect(verify(schema, data)).toBe(false);
});

test('test multi-dimensional array', () => {
    let schema = {
        a: {
            $element: {
                $element: int
            }
        }
    };
    let data = {
        a: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
    };
    expect(verify(schema, data)).toBe(true);

    data = {
        a: [1, 2, 3]
    };
    expect(verify(schema, data)).toBe(false);

    schema = {
        a: {
            $element: {
                $element: {
                    $element: int
                }
            }
        }
    };
    data = {
        a: [
            [[1, 2], [3, 4]],
            [[5, 6], [7, 8]],
            [[9, 10], [11, 12]]
        ]
    };
    expect(verify(schema, data)).toBe(true);

    data = {
        a: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
    };
    expect(verify(schema, data)).toBe(false);
});