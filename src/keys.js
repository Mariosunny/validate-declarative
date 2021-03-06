export const $TYPE = "$type";
export const $TEST = "$test";
export const $OPTIONAL = "$optional";
export const $UNIQUE = "$unique";
export const $ELEMENT = "$element";
export const $NAME = "$name";
export const $META = Symbol("$meta");
export const $ROOT = Symbol("$root");

export const $CONSTRAINTS = [$TEST, $TYPE, $OPTIONAL, $UNIQUE];

export const $RESERVED_KEYS = [$TEST, $TYPE, $OPTIONAL, $UNIQUE, $ELEMENT, $NAME, $META, $ROOT];

export function addKeyToContext(context, key) {
  return context + (context.length === 0 ? "" : ".") + key;
}

export function addElementToContext(context, index) {
  return context + "[" + index + "]";
}
