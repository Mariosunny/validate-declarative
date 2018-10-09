import {list} from "./types";
import {META_KEYS} from "./keys";
import deepEqual from 'deep-strict-equal';

export function isEqual(object1, object2) {
    return deepEqual(object1, object2);
}

function isObjectLike(object) {
    return object != null && typeof object === 'object';
}

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