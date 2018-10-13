import { list } from "./types";
import { $CONSTRAINTS, $RESERVED_KEYS } from "./keys";
import deepEqual from "deep-strict-equal";

export function isEqual(object1, object2) {
  return deepEqual(object1, object2);
}

export function hasOwnProperty(object, property) {
  if (isKeyValueObject(object)) {
    return object.hasOwnProperty(property);
  }
  return false;
}

export function forOwn(object, func, condition = () => true) {
  for (let key in object) {
    if (object.hasOwnProperty(key) && condition(key)) {
      func(key, object[key]);
    }
  }
}

export function isConstantValue(object) {
  if (isKeyValueObject(object)) {
    for (let key in object) {
      if (
        object.hasOwnProperty(key) &&
        ($RESERVED_KEYS.includes(key) || !isConstantValue(object[key]))
      ) {
        return false;
      }
    }
  }
  return true;
}

export function isKeyValueObject(obj) {
  return (
    obj !== null &&
    typeof obj === "object" &&
    !list.$test(obj) &&
    !(obj instanceof Map) &&
    !(obj instanceof WeakMap)
  );
}
