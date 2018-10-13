import { isConstantValue } from "../../src/util";

describe("isConstantValue", () => {
  it("should return true for any value not containing meta keys (basic values)", () => {
    expect(isConstantValue(5.5)).toBe(true);
    expect(isConstantValue(5)).toBe(true);
    expect(isConstantValue(0)).toBe(true);
    expect(isConstantValue(Infinity)).toBe(true);
    expect(isConstantValue(-Infinity)).toBe(true);
    expect(isConstantValue("")).toBe(true);
    expect(isConstantValue("hello")).toBe(true);
    expect(isConstantValue({})).toBe(true);
    expect(isConstantValue({ a: 5 })).toBe(true);
    expect(isConstantValue(new Set())).toBe(true);
    expect(isConstantValue(new Map())).toBe(true);
    expect(isConstantValue(new WeakSet())).toBe(true);
    expect(isConstantValue(new WeakMap())).toBe(true);
    expect(isConstantValue(undefined)).toBe(true);
    expect(isConstantValue(null)).toBe(true);
    expect(isConstantValue(NaN)).toBe(true);
    expect(isConstantValue(true)).toBe(true);
    expect(isConstantValue(false)).toBe(true);
    expect(isConstantValue(new Date())).toBe(true);
    expect(isConstantValue(Symbol())).toBe(true);
    expect(isConstantValue(function() {})).toBe(true);
    expect(isConstantValue(() => {})).toBe(true);
    expect(isConstantValue(/\w+/)).toBe(true);
    expect(isConstantValue([])).toBe(true);
    expect(isConstantValue(new Array())).toBe(true);
  });

  it("should return true for any value not containing meta keys (complex values)", () => {
    expect(
      isConstantValue({
        a: {
          b: {
            c: [],
            d: {
              e: [
                {
                  f: {
                    g: [],
                    h: 5
                  }
                },
                {
                  i: "hello"
                }
              ],
              j: new Set(),
              k: new WeakMap()
            },
            l: "yes"
          }
        },
        m: {
          n: {
            o: /\w/
          }
        },
        p: [
          {
            q: [
              {
                r: [
                  {
                    s: []
                  }
                ]
              }
            ]
          }
        ]
      })
    ).toBe(true);
  });

  it("should return true for any value containing meta keys (complex values)", () => {
    expect(
      isConstantValue({
        a: {
          b: {
            c: [],
            d: {
              $test: 1,
              e: [
                {
                  f: {
                    g: [],
                    h: 5
                  }
                },
                {
                  i: "hello"
                }
              ],
              j: new Set(),
              k: new WeakMap()
            },
            l: "yes"
          }
        },
        m: {
          n: {
            o: /\w/
          }
        },
        p: [
          {
            q: [
              {
                r: [
                  {
                    s: []
                  }
                ]
              }
            ]
          }
        ]
      })
    ).toBe(false);
    expect(
      isConstantValue({
        a: {
          b: {
            c: [],
            d: {
              e: [
                {
                  $test: 1,
                  f: {
                    g: [],
                    h: 5
                  }
                },
                {
                  i: "hello"
                }
              ],
              j: new Set(),
              k: new WeakMap()
            },
            l: "yes"
          }
        },
        m: {
          n: {
            o: /\w/
          }
        },
        p: [
          {
            q: [
              {
                r: [
                  {
                    s: []
                  }
                ]
              }
            ]
          }
        ]
      })
    ).toBe(true);
  });

  it("should ignore meta keys within arrays", () => {
    expect(
      isConstantValue({
        a: {
          $test: 1
        }
      })
    ).toBe(false);
    expect(
      isConstantValue({
        a: [
          {
            $test: 1
          }
        ]
      })
    ).toBe(true);
  });

  it("should return false for any object with a meta key (shallow test)", () => {
    expect(isConstantValue({})).toBe(true);
    expect(
      isConstantValue({
        $test: 1
      })
    ).toBe(false);
    expect(
      isConstantValue({
        $type: 1
      })
    ).toBe(false);
    expect(
      isConstantValue({
        $optional: 1
      })
    ).toBe(false);
    expect(
      isConstantValue({
        $unique: 1
      })
    ).toBe(false);
    expect(
      isConstantValue({
        $element: 1
      })
    ).toBe(false);
    expect(
      isConstantValue({
        $test: 1,
        $type: 1,
        $optional: 1,
        $element: 1,
        $unique: 1
      })
    ).toBe(false);
  });

  it("should return false for any object with a meta key (deep test)", () => {
    expect(
      isConstantValue({
        a: {
          $test: 1
        }
      })
    ).toBe(false);
    expect(
      isConstantValue({
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: {
                    $test: 1
                  }
                }
              }
            }
          }
        }
      })
    ).toBe(false);
  });

  it("should return true for any object with misspelled meta keys", () => {
    expect(
      isConstantValue({
        test: 1
      })
    ).toBe(true);
    expect(
      isConstantValue({
        type: 1
      })
    ).toBe(true);
    expect(
      isConstantValue({
        optional: 1
      })
    ).toBe(true);
    expect(
      isConstantValue({
        unique: 1
      })
    ).toBe(true);
    expect(
      isConstantValue({
        element: 1
      })
    ).toBe(true);
    expect(
      isConstantValue({
        $blahblahblah: 1
      })
    ).toBe(true);
  });

  it("should return true even when object's prototype contains meta keys", () => {
    let parentObject = {
      $test: 1
    };

    let childObject = Object.create(parentObject);

    expect(isConstantValue(parentObject)).toBe(false);
    expect(isConstantValue(childObject)).toBe(true);
  });
});
