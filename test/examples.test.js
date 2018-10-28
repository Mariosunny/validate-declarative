import { nonNegativeInt, string, verify, int, number, boolean, typeWithInstanceOf } from "../src";
import { createError, validateErrors } from "./testUtils";
import { DUPLICATE_VALUE_ERROR, INVALID_VALUE_ERROR, MISSING_PROPERTY_ERROR } from "../src/errors";

test("test leading example", () => {
  const bankAccountSchema = {
    accountHolder: string,
    active: boolean,
    balance: {
      checkings: {
        $type: number,
        $optional: true,
      },
      savings: number,
    },
  };

  let bankAccount1 = {
    accountHolder: "Susan B. Foo",
    active: true,
    balance: {
      savings: 39328.03,
    },
  };

  expect(verify(bankAccountSchema, bankAccount1)).toBe(true);

  let bankAccount2 = {
    accountHolder: 1,
    balance: {
      savings: "ten dollars",
      checkings: 39328.03,
    },
  };

  expect(verify(bankAccountSchema, bankAccount2)).toBe(false);

  let errors = [
    createError("active", MISSING_PROPERTY_ERROR),
    createError("balance.savings", INVALID_VALUE_ERROR, "ten dollars", number.$name),
    createError("accountHolder", INVALID_VALUE_ERROR, 1, string.$name),
  ];
  validateErrors(bankAccountSchema, bankAccount2, errors);
});

test("test overview example", () => {
  const tweetSchema = {
    $test: function(object) {
      return typeof object === "string" && object.length <= 24;
    },
  };

  let myTweet1 = "Hello world!";
  let myTweet2 = 5;
  let myTweet3 = "Lorem ipsum dolor sit amet, consectetur adipiscing.";

  expect(verify(tweetSchema, myTweet1)).toBe(true);
  expect(verify(tweetSchema, myTweet2)).toBe(false);
  expect(verify(tweetSchema, myTweet3)).toBe(false);

  let errors = [createError("", INVALID_VALUE_ERROR, myTweet2)];
  validateErrors(tweetSchema, myTweet2, errors);

  errors = [createError("", INVALID_VALUE_ERROR, myTweet3)];
  validateErrors(tweetSchema, myTweet3, errors);
});

test("test 'Validating a single value' example", () => {
  expect(verify(int, 5)).toBe(true);
  expect(verify(int, "hello world")).toBe(false);
  expect(verify(string, "hello world")).toBe(true);

  let errors = [createError("", INVALID_VALUE_ERROR, "hello world", int.$name)];
  validateErrors(int, "hello world", errors);
});

test("test 'Validating an object' example", () => {
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

  expect(verify(courseSchema, objectOrientedCourse)).toBe(true);
});

test("test 'Validating an object with constant properties' example", () => {
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

  expect(verify(sedanSchema, car1)).toBe(true);
  expect(verify(sedanSchema, car2)).toBe(false);

  let errors = [createError("wheels", INVALID_VALUE_ERROR, 5)];
  validateErrors(sedanSchema, car2, errors);
});

test("test 'Creating a custom type' example", () => {
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

  const schema = {
    a: primeNumber,
  };

  expect(verify(schema, { a: 7 })).toBe(true);
  expect(verify(schema, { a: 20 })).toBe(false);

  let errors = [createError("a", INVALID_VALUE_ERROR, 20, primeNumber.$name)];
  validateErrors(schema, { a: 20 }, errors);
});

test("test 'Validating an array' example", () => {
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

  expect(verify(schema, data)).toBe(true);
});

test("test 'Validating a complex object' example", () => {
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

  expect(verify(companySchema, industryTech)).toBe(true);
});

test("test typeWithInstanceOf usage", () => {
  class Apple {
    constructor() {}
  }

  const appleType = typeWithInstanceOf(Apple);

  let data1 = new Apple();
  let data2 = new Date();

  expect(verify(appleType, data1)).toBe(true);
  expect(verify(appleType, data2)).toBe(false);

  let errors = [createError("", INVALID_VALUE_ERROR, data2, "Apple")];
  validateErrors(appleType, data2, errors);
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

  expect(verify(countrySchema, country1)).toBe(true);
  expect(verify(countrySchema, country2)).toBe(false);

  let errors = [createError("country", INVALID_VALUE_ERROR, "Brazil")];
  validateErrors(countrySchema, country2, errors);
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

  expect(verify(countrySchema, country1)).toBe(true);
  expect(verify(countrySchema, country2)).toBe(false);

  let errors = [createError("country", INVALID_VALUE_ERROR, "Brazil", countryCode.$test)];
  validateErrors(countrySchema, country2, errors);
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

  expect(verify(schema, { streetNumber: 12321 })).toBe(true);
  expect(verify(schema, { streetNumber: 123 })).toBe(false);
});

test("test $type example #2", () => {
  const array_ = {
    $test: function(object) {
      return Array.isArray(object);
    },
  };

  const smallArray = {
    $type: array_,
    $test: function(object) {
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

  expect(verify(schema, { cars: [] })).toBe(true);
  expect(verify(schema, { cars: [1] })).toBe(true);
  expect(verify(schema, { cars: [1, 2, 3, 4] })).toBe(true);
  expect(verify(schema, { cars: [1, 1, 3] })).toBe(false);
  expect(verify(schema, { cars: [1, 2, 3, 4, 5] })).toBe(false);
  expect(verify(schema, { cars: 1 })).toBe(false);
  expect(verify(schema, { cars: "1" })).toBe(false);
  expect(verify(schema, { cars: {} })).toBe(false);
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

  expect(verify(schema, data1)).toBe(true);
  expect(verify(schema, data2)).toBe(true);
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

  expect(verify(playerSchema, player1)).toBe(true);
  expect(verify(playerSchema, player2)).toBe(false);

  let errors = [createError("username", DUPLICATE_VALUE_ERROR, "Mariosunny")];
  validateErrors(playerSchema, player2, errors);
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

  expect(verify(restaurantSchema, restaurant1)).toBe(true);
});
