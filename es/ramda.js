var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// https://github.com/mediasuitenz/ramda-extended
import R from 'ramda';

function ramdaExtended(R) {
  var D = {};
  D.R = R;
  // @sig a -> Boolean
  D.isUndefined = function (x) {
    return typeof x === 'undefined';
  };
  D.isNotUndefined = R.complement(D.isUndefined);
  D.isNotEmpty = R.complement(R.isEmpty);
  D.isNotNil = R.complement(R.isNil);
  D.isEmptyObj = R.compose(R.isEmpty, R.keys);
  D.isNotEmptyObj = R.complement(D.isEmptyObj);
  D.isNilOrEmpty = R.anyPass([R.isNil, R.isEmpty]);
  D.isNotNilOrEmpty = R.complement(D.isNilOrEmpty);
  D.isNilOrEmptyObj = R.anyPass([R.isNil, D.isEmptyObj]);
  D.isNotNilOrEmptyObj = R.complement(D.isNilOrEmptyObj);
  D.isObject = function (obj) {
    if (obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') return obj;else return false;
  };

  // ~== ref = val ?: fallback, or ?? in swift
  D.qq = function (value, fallback) {
    if (value) return value;
    return fallback;
  };

  D.ifThen = function (condition, operation, value) {
    var defaultValue = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    if (condition(value)) {
      return operation(value);
    }
    return defaultValue;
  };
  D.ifValThen = function (condition, operation, value) {
    var defaultValue = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    if (!value) return defaultValue;

    if (condition(value)) {
      return operation(value);
    }
    return defaultValue;
  };

  // @sig {k: v} -> {k: v} -> {k: v}
  D.mergeRight = R.flip(R.merge);

  D.toArray = R.invoker(0, 'toArray');
  D.toJSON = R.invoker(0, 'toJSON');
  D.toNumber = Number;
  D.toString = String;
  //
  // @sig a -> (a -> b) -> b
  D.applyTo = R.curryN(2, function (obj, fn) {
    return fn(obj);
  });
  // @sig a -> [(a -> b)] -> [b]
  D.rmap = R.curryN(2, function rmap(obj, fns) {
    return R.map(R.applyTo(obj), fns);
  });

  // Turns out Ramda had this one all along. Just alias it here.
  // @sig a -> a
  D.effect = R.tap;

  // @sig a -> a
  D.log = D.effect(function (val) {
    console.log(val);
  });
  // @sig (a -> b) -> a -> a
  D.logWith = function (fn) {
    return D.effect(function (val) {
      console.log(fn(val));
    });
  };
  // @sig String -> (a -> a)
  D.trace = function (msg) {
    return D.effect(function (val) {
      console.log(msg, val);
    });
  };
  // @sig String -> (a -> b) -> (a -> a)
  D.traceWith = function (msg, fn) {
    return D.effect(function (val) {
      console.log(msg, fn(val));
    });
  };

  return D;
}

var X = ramdaExtended(R);

export default X;