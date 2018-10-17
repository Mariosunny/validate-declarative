import * as type from "../src/types";

export const rainbowSchema = {
  aa: {
    aa: {
      aa: type.regexp,
      ab: {
        aa: {
          aa: {
            $optional: true,
            $test: function(object) {
              return object.length > 0;
            },
            $element: {
              $element: {
                $type: type.object,
                $test: function(object) {
                  return Object.keys(object).length === 2;
                },
              },
            },
          },
          ab: {
            $optional: true,
            $unique: false,
            $test: function(object) {
              return object.length > 0;
            },
            $element: {
              $type: type.regexp,
            },
          },
          ac: {
            $type: type.truthy,
            $test: function(object) {
              return object === true;
            },
          },
        },
      },
    },
    ac: {
      aa: {
        $type: {
          $type: {
            $test: function(object) {
              return Array.isArray(object);
            },
          },
          $test: function(object) {
            return object[1] === "5";
          },
        },
        $test: function(object) {
          for (let i = 0; i < object.length; i++) {
            if (i !== 1 && object[i] !== 5) {
              return false;
            }
          }
          return true;
        },
      },
      ab: {
        aa: {
          $type: {
            $type: {
              $type: {
                $optional: true,
              },
            },
          },
        },
        ab: {
          $type: type.symbol,
        },
        ac: type.nullValue,
        ad: {
          $optional: true,
          $element: {
            $type: type.array,
          },
        },
      },
      ac: {
        $optional: true,
        $unique: true,
        $element: {
          aa: {
            aa: {
              $type: type.string,
            },
            ab: type.array,
            ac: {
              $optional: true,
              $element: type.any,
            },
          },
          ab: {
            $element: {
              $type: type.date,
            },
          },
          ac: {
            $optional: true,
            $element: {
              $element: {
                $type: type.undefinedValue,
              },
            },
          },
          ad: type.nonNegativeInt,
        },
      },
    },
    ad: {
      aa: {
        aa: {
          $type: type.nanValue,
        },
        ab: {
          $type: type.falsy,
        },
        ac: {
          $type: type.string,
        },
        ad: {
          $type: type.array,
        },
      },
      ab: {
        $unique: true,
        $element: type.array,
      },
    },
  },
};

export const rainbowData = {};
