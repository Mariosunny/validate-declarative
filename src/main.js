import {validate, verify} from "./schema";
import {int, object} from "./types";

const schema = object;

let data = {
    b: 5
};

console.log(validate(schema, data));