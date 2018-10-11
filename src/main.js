import {validate} from "./validate";
import {boolean, int, nonNegativeInt, object, string} from "./types";

let schema = {
    a: int,
    b: 5
};

let data = {
    a: 6
};

console.log(validate(schema, data));