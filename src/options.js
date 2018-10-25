export const ALLOW_EXTRANEOUS = "allowExtraneous";

export function buildOptions(options = {}) {
  if (!options.hasOwnProperty(ALLOW_EXTRANEOUS)) {
    options[ALLOW_EXTRANEOUS] = false;
  }
  return options;
}
