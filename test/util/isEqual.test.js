import { isEqual } from "../../src/util";

describe("isEqual", () => {
  it("should return true for equivalent primitive values", () => {
    expect(isEqual(0, 0)).toBe(true);
    expect(isEqual(true, true)).toBe(true);
    expect(isEqual(false, false)).toBe(true);
    expect(isEqual(5, 5.0)).toBe(true);
    expect(isEqual(5.5, 5.5)).toBe(true);
    expect(isEqual("", "")).toBe(true);
    expect(isEqual("hello", "hello")).toBe(true);
    expect(isEqual(null, null)).toBe(true);
    expect(isEqual(undefined, undefined)).toBe(true);
  });

  it("should return false for non-equivalent primitive values", () => {
    expect(isEqual(0, 1)).toBe(false);
    expect(isEqual(true, false)).toBe(false);
    expect(isEqual(false, true)).toBe(false);
    expect(isEqual(5.1, 5)).toBe(false);
    expect(isEqual("", "hello")).toBe(false);
    expect(isEqual(null, undefined)).toBe(false);
    expect(isEqual(undefined, null)).toBe(false);
    expect(isEqual(NaN, NaN)).toBe(false);
  });

  it("should return false for equivalent falsy values", () => {
    expect(isEqual(false, 0)).toBe(false);
    expect(isEqual(false, "")).toBe(false);
    expect(isEqual(false, null)).toBe(false);
    expect(isEqual(false, undefined)).toBe(false);
    expect(isEqual(false, NaN)).toBe(false);

    expect(isEqual(0, "")).toBe(false);
    expect(isEqual(0, null)).toBe(false);
    expect(isEqual(0, undefined)).toBe(false);
    expect(isEqual(0, NaN)).toBe(false);

    expect(isEqual("", 0)).toBe(false);
    expect(isEqual("", null)).toBe(false);
    expect(isEqual("", undefined)).toBe(false);
    expect(isEqual("", NaN)).toBe(false);

    expect(isEqual(null, 0)).toBe(false);
    expect(isEqual(null, "")).toBe(false);
    expect(isEqual(null, undefined)).toBe(false);
    expect(isEqual(null, NaN)).toBe(false);

    expect(isEqual(undefined, 0)).toBe(false);
    expect(isEqual(undefined, "")).toBe(false);
    expect(isEqual(undefined, null)).toBe(false);
    expect(isEqual(undefined, NaN)).toBe(false);

    expect(isEqual(NaN, 0)).toBe(false);
    expect(isEqual(NaN, "")).toBe(false);
    expect(isEqual(NaN, null)).toBe(false);
    expect(isEqual(NaN, undefined)).toBe(false);
  });

  it("should return false for equivalent truthy values", () => {
    expect(isEqual(true, "0")).toBe(false);
    expect(isEqual(true, "false")).toBe(false);
    expect(isEqual(true, "true")).toBe(false);
    expect(isEqual(true, [])).toBe(false);
    expect(isEqual(true, {})).toBe(false);
    expect(isEqual(true, function() {})).toBe(false);

    expect(isEqual("0", "false")).toBe(false);
    expect(isEqual("0", "true")).toBe(false);
    expect(isEqual("0", [])).toBe(false);
    expect(isEqual("0", {})).toBe(false);
    expect(isEqual("0", function() {})).toBe(false);

    expect(isEqual("false", "0")).toBe(false);
    expect(isEqual("false", "true")).toBe(false);
    expect(isEqual("false", [])).toBe(false);
    expect(isEqual("false", {})).toBe(false);
    expect(isEqual("false", function() {})).toBe(false);

    expect(isEqual("true", "0")).toBe(false);
    expect(isEqual("true", "false")).toBe(false);
    expect(isEqual("true", [])).toBe(false);
    expect(isEqual("true", {})).toBe(false);
    expect(isEqual("true", function() {})).toBe(false);

    expect(isEqual([], "0")).toBe(false);
    expect(isEqual([], "false")).toBe(false);
    expect(isEqual([], "true")).toBe(false);
    expect(isEqual([], {})).toBe(false);
    expect(isEqual([], function() {})).toBe(false);

    expect(isEqual({}, "0")).toBe(false);
    expect(isEqual({}, "false")).toBe(false);
    expect(isEqual({}, "true")).toBe(false);
    expect(isEqual({}, [])).toBe(false);
    expect(isEqual({}, function() {})).toBe(false);

    expect(isEqual(function() {}, "0")).toBe(false);
    expect(isEqual(function() {}, "false")).toBe(false);
    expect(isEqual(function() {}, "true")).toBe(false);
    expect(isEqual(function() {}, [])).toBe(false);
    expect(isEqual(function() {}, {})).toBe(false);
  });

  it("should return true for equivalent arrays", () => {
    expect(isEqual([], [])).toBe(true);
    expect(isEqual([], new Array())).toBe(true);
    expect(isEqual(new Array(), new Array())).toBe(true);
    expect(isEqual([null], [null])).toBe(true);
    expect(isEqual([undefined], [undefined])).toBe(true);
    expect(isEqual([true], [true])).toBe(true);
    expect(isEqual([false], [false])).toBe(true);
    expect(isEqual([5], [5.0])).toBe(true);
    expect(isEqual([0], [0])).toBe(true);
    expect(isEqual([""], [""])).toBe(true);
    expect(isEqual(["hello"], ["hello"])).toBe(true);
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isEqual([[1], 2, 3], [[1], 2, 3])).toBe(true);
    expect(isEqual([[[[1]]], [[2]], [3]], [[[[1]]], [[2]], [3]])).toBe(true);
    expect(isEqual([[[[[[[[[[[[]]]]]]]]]]]], [[[[[[[[[[[[]]]]]]]]]]]])).toBe(true);
  });

  it("should return false for non-equivalent arrays", () => {
    expect(isEqual([0], [1])).toBe(false);
    expect(isEqual([true], [false])).toBe(false);
    expect(isEqual([false], [true])).toBe(false);
    expect(isEqual([5.1], [5])).toBe(false);
    expect(isEqual([""], ["hello"])).toBe(false);
    expect(isEqual([undefined], [null])).toBe(false);
    expect(isEqual([1, 2, 3], ["1", "2", "3"])).toBe(false);
    expect(isEqual([[1], 2, 3], [1, 2, 3])).toBe(false);
    expect(isEqual([NaN], [NaN])).toBe(false);
    expect(isEqual([[[[[[[[[[[[]]]]]]]]]]]], [[[[[[[[[[[]]]]]]]]]]])).toBe(false);
  });

  it("should return true for equivalent objects", () => {
    let symbol = Symbol();
    expect(isEqual(symbol, symbol)).toBe(true);
    expect(isEqual(new Set(), new Set())).toBe(true);
    expect(isEqual(new WeakSet(), new WeakSet())).toBe(true);
    expect(isEqual(new Map(), new Map())).toBe(true);
    expect(isEqual(new WeakMap(), new WeakMap())).toBe(true);
    expect(isEqual(new Date(1), new Date(1))).toBe(true);
    expect(isEqual({}, {})).toBe(true);
    expect(isEqual({ a: 5 }, { a: 5 })).toBe(true);
    expect(isEqual({ a: { a: { a: { a: { a: 5 } } } } }, { a: { a: { a: { a: { a: 5 } } } } })).toBe(true);
  });

  it("should return false for non-equivalent objects", () => {
    expect(isEqual(new Set(), [])).toBe(false);
    expect(isEqual(new Set(), new WeakSet())).toBe(false);
    expect(isEqual(new WeakSet(), [])).toBe(false);
    expect(isEqual({}, new Map())).toBe(false);
    expect(isEqual({}, new WeakMap())).toBe(false);
    expect(isEqual(new Map(), new WeakMap())).toBe(false);
    expect(isEqual(function() {}, function() {})).toBe(false);
    expect(isEqual(new Date(0), new Date(1))).toBe(false);
    expect(isEqual(Symbol(), Symbol())).toBe(false);
    expect(isEqual({ a: 5 }, { a: 6 })).toBe(false);
    expect(isEqual({ a: { a: { a: { a: { a: 5 } } } } }, { a: { a: { a: { a: 5 } } } })).toBe(false);
  });

  it("should return true for equivalent complex object", () => {
    let object1 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                [
                  {
                    h: {
                      i: 100.00001,
                    },
                  },
                ],
              ],
            ],
          ],
        ],
      },
      true,
    ];
    let object2 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                [
                  {
                    h: {
                      i: 100.00001,
                    },
                  },
                ],
              ],
            ],
          ],
        ],
      },
      true,
    ];
    expect(isEqual(object1, object2)).toBe(true);
  });

  it("should return false for non-equivalent complex object", () => {
    let object1 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                [
                  {
                    h: {
                      i: 100.00001,
                    },
                  },
                ],
              ],
            ],
          ],
        ],
      },
      true,
    ];
    let object2 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                [
                  {
                    h: {
                      i: 100.00001,
                    },
                  },
                ],
              ],
            ],
          ],
        ],
      },
    ];
    let object3 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "h",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                [
                  {
                    h: {
                      i: 100.00001,
                    },
                  },
                ],
              ],
            ],
          ],
        ],
      },
      true,
    ];
    let object4 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                [
                  {
                    h: {
                      i: 100.00002,
                    },
                  },
                ],
              ],
            ],
          ],
        ],
      },
      true,
    ];
    let object5 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                [
                  [
                    {
                      h: {
                        i: 100.00001,
                      },
                    },
                  ],
                ],
              ],
            ],
          ],
        ],
      },
      true,
    ];
    let object6 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                [
                  {
                    h: {
                      i: 100.00001,
                      j: 100.00001,
                    },
                  },
                ],
              ],
            ],
          ],
        ],
      },
      true,
    ];
    let object7 = [
      {
        a: new Date(1),
        b: [
          {
            c: 6,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                [
                  {
                    h: {
                      i: 100.00001,
                    },
                  },
                ],
              ],
            ],
          ],
        ],
      },
      true,
    ];
    let object8 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                [
                  {
                    i: {
                      h: 100.00001,
                    },
                  },
                ],
              ],
            ],
          ],
        ],
      },
      true,
    ];
    let object9 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      true,
      {
        g: [
          [
            [
              [
                [
                  {
                    h: {
                      i: 100.00001,
                    },
                  },
                ],
              ],
            ],
          ],
        ],
      },
    ];
    let object10 = [
      {
        a: new Date(1),
        b: [
          {
            c: 5,
            d: {
              e: "",
            },
          },
          {
            f: new Set(),
          },
          new Date(10000),
        ],
      },
      {
        g: [
          [
            [
              [
                {
                  h: {
                    i: 100.00001,
                  },
                },
              ],
            ],
          ],
        ],
      },
      true,
    ];
    expect(isEqual(object1, object2)).toBe(false);
    expect(isEqual(object1, object3)).toBe(false);
    expect(isEqual(object1, object4)).toBe(false);
    expect(isEqual(object1, object5)).toBe(false);
    expect(isEqual(object1, object6)).toBe(false);
    expect(isEqual(object1, object7)).toBe(false);
    expect(isEqual(object1, object8)).toBe(false);
    expect(isEqual(object1, object9)).toBe(false);
    expect(isEqual(object1, object10)).toBe(false);
  });
});
