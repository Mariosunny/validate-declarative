export const ALLOW_EXTRANEOUS = "allowExtraneous";
export const THROW_ON_ERROR = "throwOnError";

export function buildOptions(options = {}) {
  if (!options.hasOwnProperty(ALLOW_EXTRANEOUS)) {
    options[ALLOW_EXTRANEOUS] = false;
  }
  if (!options.hasOwnProperty(THROW_ON_ERROR)) {
    options[THROW_ON_ERROR] = false;
  }
  return options;
}
