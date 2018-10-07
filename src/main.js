function isPlainObject(object) {
    return object !== null && typeof object === 'object';
}

class TestClass {constructor() {}}

const values = [
    null,
    {a: 5},
    new TestClass(),
    Object.create(null),
    new Object(),
    new function() {},
    [],
    Date
];

values.forEach(value => console.log(isPlainObject(value)));