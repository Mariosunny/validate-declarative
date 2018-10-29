import { createError, generateSchemaExpects, validateErrors } from "./testUtils";
import {
  DUPLICATE_VALUE_ERROR,
  INVALID_VALUE_ERROR,
  MISSING_PROPERTY_ERROR,
  nonNegativeInt,
  string,
  verify,
  int,
  number,
  boolean,
  typeWithInstanceOf,
  optionalNumber,
  positiveInt,
  setGlobalValidationOptions,
  _resetSchema,
} from "../src";
import { ALLOW_EXTRANEOUS, globalOptions, THROW_ON_ERROR } from "../src/options";
import luhn from "luhn-alg";

const { expectSchemaPasses, expectSchemaFails } = generateSchemaExpects();

test("test leading example", () => {
  const schema = {
    a: boolean,
    b: {
      c: optionalNumber,
      d: { $test: object => object < 40000 },
    },
    e: { $element: string },
  };

  let data1 = {
    a: true,
    b: {
      d: 39328.03,
    },
    e: ["apple", "orange"],
  };
  expectSchemaPasses(schema, data1);

  let data2 = {
    b: {
      c: "ten dollars",
      d: 60000,
    },
    e: ["23", -609, "lemon"],
  };
  expectSchemaFails(schema, data2, [
    { error: MISSING_PROPERTY_ERROR, key: "a" },
    { error: INVALID_VALUE_ERROR, key: "b.c", expectedType: number, value: "ten dollars" },
    { error: INVALID_VALUE_ERROR, key: "b.d", value: 60000 },
    { error: INVALID_VALUE_ERROR, key: "e[1]", expectedType: string, value: -609 },
  ]);
});

test("test getting started example", () => {
  const tweetSchema = {
    message: {
      $test: function(object) {
        return typeof object === "string" && object.length <= 24;
      },
    },
  };

  let myTweet1 = { message: "Hello world!" };
  let myTweet2 = { message: 5 };
  let myTweet3 = { message: "Lorem ipsum dolor sit amet, consectetur adipiscing." };

  expectSchemaPasses(tweetSchema, myTweet1);
  expectSchemaFails(tweetSchema, myTweet2, { error: INVALID_VALUE_ERROR, key: "message", value: myTweet2.message });
  expectSchemaFails(tweetSchema, myTweet3, { error: INVALID_VALUE_ERROR, key: "message", value: myTweet3.message });
});

test("test 'Single values' example", () => {
  expectSchemaPasses(int, 5);
  expectSchemaFails(int, "hello world", { error: INVALID_VALUE_ERROR, value: "hello world", expectedType: int });
  expectSchemaPasses(string, "hello world");
});

test("test 'Plain objects' example", () => {
  const courseSchema = {
    courseName: {
      $test: /^[A-Za-z0-9 ]+$/,
    },
    roomCapacity: nonNegativeInt,
    professor: string,
  };

  let objectOrientedCourse = {
    courseName: "Object Oriented Programming",
    roomCapacity: 30,
    professor: "Dr. Placeholder",
  };

  expectSchemaPasses(courseSchema, objectOrientedCourse);
});

test("test 'Objects with constant properties' example", () => {
  const sedanSchema = {
    wheels: 4,
    model: string,
  };

  let car1 = {
    wheels: 4,
    model: "Chrysler 300",
  };

  let car2 = {
    wheels: 5,
    model: "Chevrolet Impala",
  };
  expectSchemaPasses(sedanSchema, car1);
  expectSchemaFails(sedanSchema, car2, { error: INVALID_VALUE_ERROR, key: "wheels", value: 5 });
});

test("test 'Custom types' example #1", () => {
  const primeNumber = {
    $type: int,
    $test: function(object) {
      for (let i = 2; i < object; i++) {
        if (object % i === 0) {
          return false;
        }
      }
      return object !== 1 && object !== 0;
    },
    $name: "primeNumber",
  };

  expectSchemaPasses(primeNumber, 7);
  expectSchemaFails(primeNumber, 20, {
    error: INVALID_VALUE_ERROR,
    value: 20,
    expectedType: primeNumber.$name,
  });
});

test("test 'Custom types' example #2", () => {
  const creditCardNumber = {
    $type: string,
    $test: function(object) {
      return luhn(object);
    },
    $name: "creditCardNumber",
  };

  const purchaserSchema = {
    name: string,
    creditCardNumber: creditCardNumber,
  };

  let purchaser1 = {
    name: "John James",
    creditCardNumber: "4102676136588700",
  };
  let purchaser2 = {
    name: "Herbert Hubert",
    creditCardNumber: "4102676136588709",
  };

  expectSchemaPasses(purchaserSchema, purchaser1);
  expectSchemaFails(purchaserSchema, purchaser2, {
    error: INVALID_VALUE_ERROR,
    key: "creditCardNumber",
    value: purchaser2.creditCardNumber,
    expectedType: "creditCardNumber",
  });
});

test("test 'Custom types' example #3", () => {});

test("test 'Arrays' example #1", () => {
  const schema = {
    $element: boolean,
  };

  let data1 = [true, true, false, true, false];
  let data2 = [];
  let data3 = [true, false, 3];

  expectSchemaPasses(schema, data1);
  expectSchemaPasses(schema, data2);
  expectSchemaFails(schema, data3, { error: INVALID_VALUE_ERROR, expectedType: boolean, key: "[2]", value: 3 });
});

test("test 'Arrays' example #2", () => {
  const schema = {
    $test: object => object.length > 1,
    $element: {
      $test: function(object) {
        return typeof object === "string" && object.trim() === object;
      },
    },
  };
  let data1 = ["hello", "world"];
  let data2 = ["hello", 2];
  let data3 = ["hello"];
  let data4 = ["  hello ", "world"];

  expectSchemaPasses(schema, data1);
  expectSchemaFails(schema, data2, { error: INVALID_VALUE_ERROR, key: "[1]", value: data2[1] });
  expectSchemaFails(schema, data3, { error: INVALID_VALUE_ERROR, value: ["hello"] });
  expectSchemaFails(schema, data4, { error: INVALID_VALUE_ERROR, key: "[0]", value: data4[0] });
});

test("test 'Multi-dimensional arrays' example", () => {
  const schema = {
    voxels: {
      $element: {
        $element: {
          $element: int,
        },
      },
    },
  };

  let data = {
    voxels: [[[123, 48, 20], [93, 184, 230]], [[101, 200, 228], [76, 134, 120]], [[4, 67, 77], [129, 166, 249]]],
  };

  expectSchemaPasses(schema, data);
});

test("test 'Complex objects' example", () => {
  const companySchema = {
    companyName: string,
    ceo: string,
    employees: {
      $element: {
        name: string,
        salary: int,
        beneficiaries: {
          $optional: true,
          $element: {
            name: string,
            relationship: string,
          },
        },
      },
    },
  };

  let industryTech = {
    companyName: "Industry Tech, Inc.",
    ceo: "James Tech",
    employees: [
      {
        name: "John Q. Workingman",
        salary: 65000,
        beneficiaries: [
          {
            name: "Nancy Workingman",
            relationship: "Mother",
          },
          {
            name: "Bob Workingman",
            relationship: "Father",
          },
        ],
      },
      {
        name: "Fred T. Orphan",
        salary: 38000,
      },
    ],
  };

  expectSchemaPasses(companySchema, industryTech);
});

test("test 'Objects with optional properties' example", () => {
  const APIrequestSchema = {
    url: string,
    params: {
      $type: string,
      $optional: true,
    },
  };

  let request1 = {
    url: "video/watch/",
    params: "id=29340285723",
  };

  let request2 = {
    url: "video/list",
  };

  expectSchemaPasses(APIrequestSchema, request1);
  expectSchemaPasses(APIrequestSchema, request2);
});

test("test 'Objects with unique values' example", () => {
  const productSchema = {
    productId: {
      $type: positiveInt,
      $unique: true,
    },
    productName: string,
  };

  let product1 = {
    productId: 1,
    productName: "Reclaimed Wood Desk",
  };

  let product2 = {
    productId: 1,
    productName: "Teak Writing Desk",
  };

  expectSchemaPasses(productSchema, product1);
  expectSchemaFails(productSchema, product2, {
    error: DUPLICATE_VALUE_ERROR,
    key: "productId",
    value: 1,
  });
});

test("test 'Arrays with unique elements' example", () => {
  const playersSchema = {
    $element: {
      $type: string,
      $unique: true,
    },
  };

  let roster1 = ["Thomas", "James", "John"];
  let roster2 = ["Linda", "Mary", "Mary"];

  expectSchemaPasses(playersSchema, roster1);
  expectSchemaFails(playersSchema, roster2, {
    error: DUPLICATE_VALUE_ERROR,
    key: "[2]",
    value: "Mary",
  });
});

test("test verify usage", () => {
  const schema = {
    a: int,
  };

  let data = {
    a: 5,
  };

  let options = {
    allowExtraneous: true,
    throwOnError: false,
  };

  expectSchemaPasses(schema, data, options);
});

test("test setGlobalValidationOptions usage", () => {
  let options = {
    allowExtraneous: false,
    throwOnError: true,
  };

  setGlobalValidationOptions(options);
  expect(globalOptions).toEqual({
    [ALLOW_EXTRANEOUS]: false,
    [THROW_ON_ERROR]: true,
  });
  setGlobalValidationOptions();
});

test("test typeWithInstanceOf usage", () => {
  class Apple {
    constructor() {}
  }

  const appleType = typeWithInstanceOf(Apple);

  let data1 = new Apple();
  let data2 = new Date();

  expectSchemaPasses(appleType, data1);
  expectSchemaFails(appleType, data2, { error: INVALID_VALUE_ERROR, value: data2, expectedType: "Apple" });
});

test("test _resetSchema usage", () => {
  const schema = {
    $type: int,
    $unique: true,
  };

  expectSchemaPasses(schema, 5);
  expectSchemaFails(schema, 5, { error: DUPLICATE_VALUE_ERROR, value: 5 });
  _resetSchema(schema);
  expectSchemaPasses(schema, 5);
});

test("test $test example #1", () => {
  let countryCode = {
    $test: function(object) {
      return typeof object === "string" && object.length === 3;
    },
  };

  const countrySchema = {
    country: countryCode,
  };

  let country1 = {
    country: "USA",
  };

  let country2 = {
    country: "Brazil",
  };

  expectSchemaPasses(countrySchema, country1);
  expectSchemaFails(countrySchema, country2, { error: INVALID_VALUE_ERROR, key: "country", value: "Brazil" });
});

test("test $test example #2", () => {
  const countryCode = {
    $test: /^[A-Za-z]{3}$/,
  };

  const countrySchema = {
    country: countryCode,
  };

  let country1 = {
    country: "USA",
  };

  let country2 = {
    country: "Brazil",
  };

  expectSchemaPasses(countrySchema, country1);
  expectSchemaFails(countrySchema, country2, {
    error: INVALID_VALUE_ERROR,
    expectedType: countryCode.$test,
    key: "country",
    value: "Brazil",
  });
});

test("test $type example #1", () => {
  const palindrome = {
    $type: nonNegativeInt,
    $test: function(object) {
      let str = object + "";
      return (
        str ===
        str
          .split("")
          .reverse()
          .join("")
      );
    },
    $name: "palindrome",
  };

  const schema = {
    streetNumber: palindrome,
  };

  expectSchemaPasses(schema, { streetNumber: 12321 });
  expectSchemaFails(
    schema,
    { streetNumber: 123 },
    { error: INVALID_VALUE_ERROR, value: 123, expectedType: palindrome.$name, key: "streetNumber" }
  );
});

test("test $type example #2", () => {
  const array = {
    $test: function(object) {
      return Array.isArray(object);
    },
  };

  const smallArray = {
    $type: array,
    $test: function(object) {
      // called second
      return object.length < 5;
    },
  };

  const smallNoDuplicatesArray = {
    $type: smallArray,
    $test: function(object) {
      return new Set(object).size === object.length;
    },
  };

  const schema = {
    cars: smallNoDuplicatesArray,
  };

  expectSchemaPasses(schema, { cars: [] });
  expectSchemaPasses(schema, { cars: [1] });
  expectSchemaPasses(schema, { cars: [1, 2, 3, 4] });
  expectSchemaFails(schema, { cars: [1, 1, 3] }, { error: INVALID_VALUE_ERROR, value: [1, 1, 3], key: "cars" });
  expectSchemaFails(
    schema,
    { cars: [1, 2, 3, 4, 5] },
    { error: INVALID_VALUE_ERROR, value: [1, 2, 3, 4, 5], key: "cars" }
  );
  expectSchemaFails(schema, { cars: 1 }, { error: INVALID_VALUE_ERROR, value: 1, key: "cars" });
  expectSchemaFails(schema, { cars: "1" }, { error: INVALID_VALUE_ERROR, value: "1", key: "cars" });
  expectSchemaFails(schema, { cars: {} }, { error: INVALID_VALUE_ERROR, value: {}, key: "cars" });
});

test("test $optional example", () => {
  const schema = {
    foo: int,
    bar: {
      $type: string,
      $optional: true,
    },
  };

  let data1 = {
    foo: -100,
    bar: "hello world",
  };

  let data2 = {
    foo: 5,
  };

  expectSchemaPasses(schema, data1);
  expectSchemaPasses(schema, data2);
});

test("test $unique example", () => {
  const playerSchema = {
    username: {
      $type: string,
      $unique: true,
    },
    password: string,
  };

  let player1 = {
    username: "Mariosunny",
    password: "123abc",
  };

  let player2 = {
    username: "Mariosunny",
    password: "password1",
  };

  expectSchemaPasses(playerSchema, player1);
  expectSchemaFails(playerSchema, player2, { error: DUPLICATE_VALUE_ERROR, key: "username", value: "Mariosunny" });
});

test("test $element example", () => {
  const restaurantSchema = {
    headChef: string,
    menuItems: {
      $element: {
        name: string,
        price: number,
      },
    },
  };

  let restaurant1 = {
    headChef: "Emeril Ramsay",
    menuItems: [
      {
        name: "Cheeze Pizza",
        price: 12.99,
      },
      {
        name: "Beef Stew",
        price: 7.5,
      },
    ],
  };

  expectSchemaPasses(restaurantSchema, restaurant1);
});
