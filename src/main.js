import {validate} from "./validate";
import {int} from "./types";

let schema = {
    a: {
        $element: {
            $type: int
        }
    }
};
let data = {
    a: [1, 2, 3]
};

console.log(validate(schema, data));