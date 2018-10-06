import unravel from "unravel-function";
import scheme from "../src/schema";

export const testSchemaAgainstData = unravel(function (name, schema, data) {
    test(`test data against ${name} schema`, () => {
        expect(schema.verify(data)).toBe(true);
    });
});

export const testTypeWith = unravel(function (type, validValues, invalidValues) {
    validValues = validValues || [];
    invalidValues = invalidValues || [];

    test(`check ${type.$name} type`, () => {
        validValues.forEach(function (value) {
            expect(scheme(type).verify(value)).toBe(true);
            expect(scheme({a: type}).verify({a: value})).toBe(true);
        });
        invalidValues.forEach(function (value) {
            expect(scheme(type).verify(value)).toBe(false);
            expect(scheme({a: type}).verify({a: value})).toBe(false);
        });
    });
});