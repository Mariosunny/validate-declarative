export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function choose(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function pick(array, numberOfElements) {
  let elementsLeft = array.length - numberOfElements;
  array = [...array];
  while (elementsLeft > 0) {
    array.splice(randomInt(0, array.length - 1), 1);
    elementsLeft--;
  }

  return array;
}

export function roll(successChance) {
  return successChance >= Math.random();
}
