export const ALLOW_EXTRANEOUS = "allowExtraneous";
export const THROW_ON_ERROR = "throwOnError";

const OPTIONS = [ALLOW_EXTRANEOUS, THROW_ON_ERROR];

const DEFAULT_GLOBAL_OPTIONS = {
  [ALLOW_EXTRANEOUS]: false,
  [THROW_ON_ERROR]: false,
};

let globalOptions = {};
setGlobalOptionsToDefault();

function setGlobalOptionsToDefault() {
  globalOptions = {
    [ALLOW_EXTRANEOUS]: DEFAULT_GLOBAL_OPTIONS[ALLOW_EXTRANEOUS],
    [THROW_ON_ERROR]: DEFAULT_GLOBAL_OPTIONS[THROW_ON_ERROR],
  };
}

export function buildOptions(options = {}) {
  OPTIONS.forEach(function(OPTION) {
    if (!options.hasOwnProperty(OPTION)) {
      options[OPTION] = globalOptions[OPTION];
    }
  });

  return options;
}

export function validateOptions(options) {
  if (options.hasOwnProperty(ALLOW_EXTRANEOUS) && typeof options[ALLOW_EXTRANEOUS] !== "boolean") {
    throw new Error(`${ALLOW_EXTRANEOUS} must be a boolean\n${options[ALLOW_EXTRANEOUS]}`);
  }
  if (options.hasOwnProperty(THROW_ON_ERROR) && typeof options[THROW_ON_ERROR] !== "boolean") {
    throw new Error(`${THROW_ON_ERROR} must be a boolean\n${options[THROW_ON_ERROR]}`);
  }
}

export function setGlobalOptions(options) {
  if (options === undefined) {
    setGlobalOptionsToDefault();
    return;
  }

  validateOptions(options);

  OPTIONS.forEach(function(OPTION) {
    if (options.hasOwnProperty(OPTION)) {
      globalOptions[OPTION] = options[OPTION];
    }
  });
}
