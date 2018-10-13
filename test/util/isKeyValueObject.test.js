import { isConstantValue, isKeyValueObject } from "../../src/util";

describe("isKeyValueObject", () => {
  it("should return true for object literals, class instances, Object.create, new Object()", () => {
    class TestClass {
      constructor() {}
    }

    expect(isKeyValueObject({})).toBe(true);
    expect(isKeyValueObject({ a: 5 })).toBe(true);
    expect(isKeyValueObject(new TestClass())).toBe(true);
    expect(isKeyValueObject(new Object())).toBe(true);
    expect(isKeyValueObject(Object.create(null))).toBe(true);
  });

  it("should return false for everything else", () => {
    expect(isKeyValueObject(5.5)).toBe(false);
    expect(isKeyValueObject(5)).toBe(false);
    expect(isKeyValueObject(0)).toBe(false);
    expect(isKeyValueObject(Infinity)).toBe(false);
    expect(isKeyValueObject(-Infinity)).toBe(false);
    expect(isKeyValueObject("")).toBe(false);
    expect(isKeyValueObject("hello")).toBe(false);
    expect(isKeyValueObject(new Set())).toBe(false);
    expect(isKeyValueObject(new Map())).toBe(false);
    expect(isKeyValueObject(new WeakSet())).toBe(false);
    expect(isKeyValueObject(new WeakMap())).toBe(false);
    expect(isKeyValueObject(undefined)).toBe(false);
    expect(isKeyValueObject(null)).toBe(false);
    expect(isKeyValueObject(NaN)).toBe(false);
    expect(isKeyValueObject(true)).toBe(false);
    expect(isKeyValueObject(false)).toBe(false);
    expect(isKeyValueObject(Symbol())).toBe(false);
    expect(isKeyValueObject(function() {})).toBe(false);
    expect(isKeyValueObject(() => {})).toBe(false);
    expect(isKeyValueObject([])).toBe(false);
    expect(isKeyValueObject(new Array())).toBe(false);
  });
});
