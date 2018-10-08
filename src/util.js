import {list} from "./types";
import {META_KEYS} from "./keys";

export function isConstantValue(object) {
    if(isKeyValueObject(object)) {
        for(let key in object) {
            if(object.hasOwnProperty(key) && (META_KEYS.includes(key) || !isConstantValue(object[key]))) {
                return false;
            }
        }
    }
    return true;
}

export function isKeyValueObject(obj) {
    return obj !== null
        && typeof obj === 'object'
        && !(list.$test(obj))
        && !(obj instanceof Map)
        && !(obj instanceof WeakMap);
}