import {
  boolean,
  EXTRANEOUS_PROPERTY_ERROR,
  int,
  INVALID_VALUE_ERROR,
  MISSING_PROPERTY_ERROR,
  DUPLICATE_PROPERTY_ERROR,
  nonNegativeInt,
  string,
  verify,
  validate,
} from "../src";
import { createError, validateErrors } from "./testUtils";

function getSchema() {
  return {
    a: {
      $element: {
        b: 5,
        c: int,
      },
    },
    d: {
      e: {
        f: boolean,
        g: {
          $type: nonNegativeInt,
          $unique: true,
        },
      },
    },
    h: {
      $type: string,
      $optional: true,
    },
  };
}

function getData() {
  return {
    a: [
      {
        b: 5,
        c: 10,
      },
      {
        b: 5,
        c: 12,
      },
    ],
    d: {
      e: {
        f: true,
        g: 0,
      },
    },
    h: "hello world",
  };
}

test("test valid data", () => {
  expect(verify(getSchema(), getData())).toBe(true);
});

test("test missing property ", () => {
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
  errors = [createError("a", MISSING_PROPERTY_ERROR), createError("d.e.f", MISSING_PROPERTY_ERROR)];
  validateErrors(schema, data, errors);

  schema = getSchema();
  data = getData();
  delete data.a;
  delete data.d.e.f;
  delete data.d.e.g;
  errors = [
    createError("a", MISSING_PROPERTY_ERROR),
    createError("d.e.f", MISSING_PROPERTY_ERROR),
    createError("d.e.g", MISSING_PROPERTY_ERROR),
  ];
  validateErrors(schema, data, errors);

  schema = getSchema();
  data = getData();
  delete data.d.e;
  errors = [createError("d.e", MISSING_PROPERTY_ERROR)];
  validateErrors(schema, data, errors);

  schema = getSchema();
  data = getData();
  delete data.d;
  errors = [createError("d", MISSING_PROPERTY_ERROR)];
  validateErrors(schema, data, errors);

  schema = getSchema();
  data = {};
  errors = [createError("a", MISSING_PROPERTY_ERROR), createError("d", MISSING_PROPERTY_ERROR)];
  validateErrors(schema, data, errors);

  schema = getSchema();
  data = getData();
  delete data.a[0].b;
  delete data.a[1].c;
  errors = [createError("a[0].b", MISSING_PROPERTY_ERROR), createError("a[1].c", MISSING_PROPERTY_ERROR)];
  validateErrors(schema, data, errors);

  schema = getSchema();
  data = getData();
  data.a = [];
  errors = [];
  validateErrors(schema, data, errors);
});

test("test extraneous property", () => {
  let schema = getSchema();
  let data = getData();
  data.i = 5;
  let errors = [createError("i", EXTRANEOUS_PROPERTY_ERROR)];
});

test("test invalid value", () => {
  let schema = getSchema();
  let data = getData();
  data.a[0].c = "hello";
  let errors = [createError("a[0].c", INVALID_VALUE_ERROR, "hello", int.$name)];
  validateErrors(schema, data, errors);

  schema = getSchema();
  data = getData();
  data.a[0].b = "hello";
  errors = [createError("a[0].b", INVALID_VALUE_ERROR, "hello")];
  validateErrors(schema, data, errors);

  schema = getSchema();
  data = getData();
  data.a[0].b = "hello";
  data.d.e.f = "hi";
  errors = [
    createError("a[0].b", INVALID_VALUE_ERROR, "hello"),
    createError("d.e.f", INVALID_VALUE_ERROR, "hi", boolean.$name),
  ];
  validateErrors(schema, data, errors);

  schema = getSchema();
  data = getData();
  data.d.e.g = -1;
  errors = [createError("d.e.g", INVALID_VALUE_ERROR, -1, nonNegativeInt.$name)];
  validateErrors(schema, data, errors);

  schema = getSchema();
  data = getData();
  data.h = 0;
  errors = [createError("h", INVALID_VALUE_ERROR, 0, string.$name)];
  validateErrors(schema, data, errors);
});

test("test multiple error types", () => {
  let schema = getSchema();
  let data = getData();
  delete data.a[0].b;
  delete data.d.e.f;
  data.a[1].b = "hi";
  data.h = 5;
  let errors = [
    createError("a[0].b", MISSING_PROPERTY_ERROR),
    createError("d.e.f", MISSING_PROPERTY_ERROR),
    createError("a[1].b", INVALID_VALUE_ERROR, "hi"),
    createError("h", INVALID_VALUE_ERROR, 5, string.$name),
  ];
  validateErrors(schema, data, errors);
  errors.push(createError("d.e.g", DUPLICATE_PROPERTY_ERROR, data.d.e.g));
  validateErrors(schema, data, errors);
});
