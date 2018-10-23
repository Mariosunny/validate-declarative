import { int, string } from "../src";
import { verify } from "../src/validate";
import outliers from "outliers";

const ITERATIONS = 100000;

function execute(schema, data) {
  let start = +new Date();

  for (let i = 0; i < ITERATIONS; i++) {
    verify(schema, data);
  }

  return +new Date() - start;
}

function benchmark(message, schema, data) {
  let times = [];

  for (let i = 0; i < 10; i++) {
    times.push(execute(schema, data));
  }

  times = times.filter(outliers());
  let totalTime = times.reduce((total, number) => total + number);
  let averageTime = totalTime / times.length;

  console.log(
    `${message} \n${commaSeparated(ITERATIONS)} validations in ${Math.round(totalTime / times.length)} ms (${(
      (1000 * averageTime) /
      ITERATIONS
    ).toFixed(3)} μs per validation)\n`
  );
}

function commaSeparated(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function validatingSingleValue() {
  benchmark("[ Validating a single value ]", string, "hello world");
}

function run() {
  validatingSingleValue();
}

run();
