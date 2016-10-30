var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import R from 'ramda';

function ramdaExtended() {
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
var DR = ramdaExtended(R);

function isJSON(str) {
  try {
    var stringified = JSON.stringify(str);
    if (typeof stringified === 'string') if (stringified.length === 0) return false;
    JSON.parse(stringified);
  } catch (e) {
    return false;
  }
  return true;
}

// localstorage helper

var ls = function () {
  function ls() {
    _classCallCheck(this, ls);
  }

  ls.get = function get(key) {
    if (window.localStorage) {
      var got = window.localStorage.getItem(key);
      if (isJSON(got)) return JSON.parse(got);
      return got;
    }
    return null;
  };

  ls.set = function set(key, value) {
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') value = JSON.stringify(value);
    if (window.localStorage) return window.localStorage.setItem(key, value);
    return null;
  };

  return ls;
}();

/**
 * @TODO:
 *
 * configure each test on debug
 * (notify:bool, notifyLen:number, importance:number)
 */


var NotificationSource = function () {
  function NotificationSource() {
    _classCallCheck(this, NotificationSource);

    this.notifications = {};
    this.options = {
      staleTime: 10000 // 10s
    };
  }

  // @see getRecent
  NotificationSource.prototype.clearOld = function clearOld() {
    ls.set('browser.notifications', this.getRecent());
    return this;
  };

  // fetch, compare dates, delete old
  // return {}


  NotificationSource.prototype.getRecent = function getRecent() {
    // if !null, map object, select property values (objects)
    // with Date.now() - property timestamp (difference) > this.staleTime
    return DR.ifValThen(R.pickBy(R.where({
      timestamp: R.pipe(R.subtract(Date.now(), R.__), R.gt(R.__, this.options.staleTime))
    }), ls.get('browser.notifications')));
  };

  // @param {string} body
  // @return {bool}


  NotificationSource.prototype.notifiedRecentlyOf = function notifiedRecentlyOf(body) {
    // hahaha wow
    // if (this.getRecent().map(n => {n.body}).includes(body))
    if (DR.ifThen(DR.isObject, R.where({ body: R.contains(body) }), this.getRecent())) return true;
    return false;
  };

  NotificationSource.prototype.makeSerializable = function makeSerializable(notification) {
    return {
      badge: notification.badge,
      body: notification.body,
      data: notification.data,
      dir: notification.dir,
      icon: notification.icon,
      renotify: notification.renotify,
      requireInteraction: notification.requireInteraction,
      silent: notification.silent,
      tag: notification.tag,
      timestamp: notification.timestamp,
      title: notification.title,
      _serialized: true
    };
  };

  // : Notification
  //
  // @chainable


  NotificationSource.prototype.add = function add(notification) {
    var serialized = !notification._serialized ? this.makeSerializable(notification) : notification;

    this.notifications = DR.qq(ls.get('browser.notifications'), {});
    this.notifications[notification.timestamp] = serialized;
    ls.set('browser.notifications', this.notifications);

    return this;
  };

  return NotificationSource;
}();

var ns = new NotificationSource();

function notify(msg) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { timeout: 5000, title: 'Testing (dect):', staleTime: 10000 };

  if (!Notification) throw new Error('use a better browser that supports notifications!');
  if (Notification.permission !== 'granted') Notification.requestPermission();

  if (ns.notifiedRecentlyOf(msg)) return;

  var message = {
    body: msg,
    icon: 'https://cdn3.iconfinder.com/data/icons/line/36/beaker-512.png',
    tag: msg
  };
  var notification = new Notification(options.title, message);

  if (options.timeout) {
    var closed = setTimeout(notification.close.bind(notification), options.timeout);
  }

  ns.clearOld();
  ns.add(notification);

  notification.onclick = function () {
    window.location.href = window.location.href + '?testing...';
  };
}

export default notify;