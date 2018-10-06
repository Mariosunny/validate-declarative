import scheme from '../src/schema';
import {
    any,
    array,
    boolean,
    description,
    ID,
    int,
    itemTier,
    name,
    nonNegativeInt,
    number,
    object,
    objectID,
    positiveInt,
    primaryObjectID,
    string
} from '../src/schemaTypes';
import {testTypeWith} from "./testUtil";

testTypeWith
    .type(number)
    .validValues([5, -5, "5", "-5", 5.5, "5.5", -5.5, "-5.5"])
    .invalidValues(["", "egg"]);

testTypeWith
    .type(int)
    .validValues([5, -5, "5", "-5"])
    .invalidValues(["", "egg", 5.5, "5.5", -5.5, "-5.5"]);

testTypeWith
    .type(positiveInt)
    .validValues([1])
    .invalidValues([0, -1]);

testTypeWith
    .type(nonNegativeInt)
    .validValues([1, 0])
    .invalidValues([-1]);

testTypeWith
    .type(string)
    .validValues(["egg"])
    .invalidValues([5]);

testTypeWith
    .type(boolean)
    .validValues([true, false])
    .invalidValues(["true", "false", "egg"]);

testTypeWith
    .type(itemTier)
    .validValues([0, 7])
    .invalidValues([-1, 8, "egg"]);

testTypeWith
    .type(objectID)
    .validValues([
        "abcdef0123456789abcdef01"
    ])
    .invalidValues([
        "abcdef0123456789abcdef012",
        "abcdef0123456789abcdef0",
        "abcdef0123456789abcdefgh",
        "Abcdef0123456789abcdef01"
    ]);

testTypeWith
    .type(primaryObjectID)
    .validValues([
        "abcdef0123456789abcdef01"
    ])
    .invalidValues([
        "abcdef0123456789abcdef012",
        "abcdef0123456789abcdef0",
        "abcdef0123456789abcdefgh",
        "Abcdef0123456789abcdef01"
    ]);

testTypeWith
    .type(ID)
    .validValues([
        "zinc_ore",
        "egg",
        "egg1",
        "a"
    ])
    .invalidValues([
        "zinc__ore",
        "zinc_ore_",
        "_zinc_ore",
        "zinc ore",
        "Egg",
        "bergkäse",
        "",
    ]);

testTypeWith
    .type(name)
    .validValues([
        "Zinc Ore",
        "Elixir of Life",
        "Childéric the Blind",
        "Äpfel",
        "A",
    ])
    .invalidValues([
        "zinc ore",
        "zinc_ore",
        "Zinc  Ore",
        " Zinc Ore",
        "Zinc Ore ",
        ""
    ]);

testTypeWith
    .type(description)
    .validValues([
        "Hello.",
        "ABC.",
        "ABC abc ABC.",
        "Hello world.",
        "Hello world?",
        "Hello world!",
        "Ägh âÛÕê.",
        "Ä !@#$%^&*()_+1234567890-={}:\"<>?[];',/|\\.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pulvinar porttitor justo eu blandit. Morbi dignissim ex in consectetur pharetra."
    ])
    .invalidValues([
        "Hello",
        "hello.",
        "Hello world. ",
        " Hello world.",
        "Hello  world.",
        "Hello world .",
        "",
    ]);

testTypeWith
    .type(any)
    .validValues([
        "egg",
        "",
        5,
        () => {},
        /\w/,
        null,
        undefined
    ])
    .invalidValues([]);

testTypeWith
    .type(array)
    .validValues([
        [],
        [1],
        [1, 2, 3]
    ])
    .invalidValues([
        "[]",
        "",
        {}
    ]);

class Test {
    constructor() {}
}

testTypeWith
    .type(object)
    .validValues([{}, {a: 5}, new Test(), Object.create(null), new Object(), new function() {}])
    .invalidValues(["", [], 5, () => {}, null]);

test('empty string should be valid value', () => {
    let schema = scheme({a: string});
    let data = {a: ""};
    expect(schema.verify(data)).toBe(true);
});
