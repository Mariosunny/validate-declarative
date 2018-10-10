import {validate} from "./validate";
import {int} from "./types";

let schema = {
    a: {
        $optional: true,
        $element: {
            $type: int
        }
    }
};
let data = {
};

console.log(validate(schema, data));