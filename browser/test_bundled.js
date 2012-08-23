(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    
    require.define = function (filename, fn) {
        if (require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return window.setImmediate;
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/dev/sweet-js/node_modules/expect.js/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"./expect"}
});

require.define("/dev/sweet-js/node_modules/expect.js/expect.js",function(require,module,exports,__dirname,__filename,process){
(function (global, module) {

  if ('undefined' == typeof module) {
    var module = { exports: {} }
      , exports = module.exports
  }

  /**
   * Exports.
   */

  module.exports = expect;
  expect.Assertion = Assertion;

  /**
   * Exports version.
   */

  expect.version = '0.1.2';

  /**
   * Possible assertion flags.
   */

  var flags = {
      not: ['to', 'be', 'have', 'include', 'only']
    , to: ['be', 'have', 'include', 'only', 'not']
    , only: ['have']
    , have: ['own']
    , be: ['an']
  };

  function expect (obj) {
    return new Assertion(obj);
  }

  /**
   * Constructor
   *
   * @api private
   */

  function Assertion (obj, flag, parent) {
    this.obj = obj;
    this.flags = {};

    if (undefined != parent) {
      this.flags[flag] = true;

      for (var i in parent.flags) {
        if (parent.flags.hasOwnProperty(i)) {
          this.flags[i] = true;
        }
      }
    }

    var $flags = flag ? flags[flag] : keys(flags)
      , self = this

    if ($flags) {
      for (var i = 0, l = $flags.length; i < l; i++) {
        // avoid recursion
        if (this.flags[$flags[i]]) continue;

        var name = $flags[i]
          , assertion = new Assertion(this.obj, name, this)
  
        if ('function' == typeof Assertion.prototype[name]) {
          // clone the function, make sure we dont touch the prot reference
          var old = this[name];
          this[name] = function () {
            return old.apply(self, arguments);
          }

          for (var fn in Assertion.prototype) {
            if (Assertion.prototype.hasOwnProperty(fn) && fn != name) {
              this[name][fn] = bind(assertion[fn], assertion);
            }
          }
        } else {
          this[name] = assertion;
        }
      }
    }
  };

  /**
   * Performs an assertion
   *
   * @api private
   */

  Assertion.prototype.assert = function (truth, msg, error) {
    var msg = this.flags.not ? error : msg
      , ok = this.flags.not ? !truth : truth;

    if (!ok) {
      throw new Error(msg);
    }

    this.and = new Assertion(this.obj);
  };

  /**
   * Check if the value is truthy
   *
   * @api public
   */

  Assertion.prototype.ok = function () {
    this.assert(
        !!this.obj
      , 'expected ' + i(this.obj) + ' to be truthy'
      , 'expected ' + i(this.obj) + ' to be falsy');
  };

  /**
   * Assert that the function throws.
   *
   * @param {Function|RegExp} callback, or regexp to match error string against
   * @api public
   */

  Assertion.prototype.throwError =
  Assertion.prototype.throwException = function (fn) {
    expect(this.obj).to.be.a('function');

    var thrown = false
      , not = this.flags.not

    try {
      this.obj();
    } catch (e) {
      if ('function' == typeof fn) {
        fn(e);
      } else if ('object' == typeof fn) {
        var subject = 'string' == typeof e ? e : e.message;
        if (not) {
          expect(subject).to.not.match(fn);
        } else {
          expect(subject).to.match(fn);
        }
      }
      thrown = true;
    }

    if ('object' == typeof fn && not) {
      // in the presence of a matcher, ensure the `not` only applies to
      // the matching.
      this.flags.not = false; 
    }

    var name = this.obj.name || 'fn';
    this.assert(
        thrown
      , 'expected ' + name + ' to throw an exception'
      , 'expected ' + name + ' not to throw an exception');
  };

  /**
   * Checks if the array is empty.
   *
   * @api public
   */

  Assertion.prototype.empty = function () {
    var expectation;

    if ('object' == typeof this.obj && null !== this.obj && !isArray(this.obj)) {
      if ('number' == typeof this.obj.length) {
        expectation = !this.obj.length;
      } else {
        expectation = !keys(this.obj).length;
      }
    } else {
      if ('string' != typeof this.obj) {
        expect(this.obj).to.be.an('object');
      }

      expect(this.obj).to.have.property('length');
      expectation = !this.obj.length;
    }

    this.assert(
        expectation
      , 'expected ' + i(this.obj) + ' to be empty'
      , 'expected ' + i(this.obj) + ' to not be empty');
    return this;
  };

  /**
   * Checks if the obj exactly equals another.
   *
   * @api public
   */

  Assertion.prototype.be =
  Assertion.prototype.equal = function (obj) {
    this.assert(
        obj === this.obj
      , 'expected ' + i(this.obj) + ' to equal ' + i(obj)
      , 'expected ' + i(this.obj) + ' to not equal ' + i(obj));
    return this;
  };

  /**
   * Checks if the obj sortof equals another.
   *
   * @api public
   */

  Assertion.prototype.eql = function (obj) {
    this.assert(
        expect.eql(obj, this.obj)
      , 'expected ' + i(this.obj) + ' to sort of equal ' + i(obj)
      , 'expected ' + i(this.obj) + ' to sort of not equal ' + i(obj));
    return this;
  };

  /**
   * Assert within start to finish (inclusive). 
   *
   * @param {Number} start
   * @param {Number} finish
   * @api public
   */

  Assertion.prototype.within = function (start, finish) {
    var range = start + '..' + finish;
    this.assert(
        this.obj >= start && this.obj <= finish
      , 'expected ' + i(this.obj) + ' to be within ' + range
      , 'expected ' + i(this.obj) + ' to not be within ' + range);
    return this;
  };

  /**
   * Assert typeof / instance of
   *
   * @api public
   */

  Assertion.prototype.a =
  Assertion.prototype.an = function (type) {
    if ('string' == typeof type) {
      // proper english in error msg
      var n = /^[aeiou]/.test(type) ? 'n' : '';

      // typeof with support for 'array'
      this.assert(
          'array' == type ? isArray(this.obj) :
            'object' == type
              ? 'object' == typeof this.obj && null !== this.obj
              : type == typeof this.obj
        , 'expected ' + i(this.obj) + ' to be a' + n + ' ' + type
        , 'expected ' + i(this.obj) + ' not to be a' + n + ' ' + type);
    } else {
      // instanceof
      var name = type.name || 'supplied constructor';
      this.assert(
          this.obj instanceof type
        , 'expected ' + i(this.obj) + ' to be an instance of ' + name
        , 'expected ' + i(this.obj) + ' not to be an instance of ' + name);
    }

    return this;
  };

  /**
   * Assert numeric value above _n_.
   *
   * @param {Number} n
   * @api public
   */

  Assertion.prototype.greaterThan =
  Assertion.prototype.above = function (n) {
    this.assert(
        this.obj > n
      , 'expected ' + i(this.obj) + ' to be above ' + n
      , 'expected ' + i(this.obj) + ' to be below ' + n);
    return this;
  };

  /**
   * Assert numeric value below _n_.
   *
   * @param {Number} n
   * @api public
   */

  Assertion.prototype.lessThan =
  Assertion.prototype.below = function (n) {
    this.assert(
        this.obj < n
      , 'expected ' + i(this.obj) + ' to be below ' + n
      , 'expected ' + i(this.obj) + ' to be above ' + n);
    return this;
  };
  
  /**
   * Assert string value matches _regexp_.
   *
   * @param {RegExp} regexp
   * @api public
   */

  Assertion.prototype.match = function (regexp) {
    this.assert(
        regexp.exec(this.obj)
      , 'expected ' + i(this.obj) + ' to match ' + regexp
      , 'expected ' + i(this.obj) + ' not to match ' + regexp);
    return this;
  };

  /**
   * Assert property "length" exists and has value of _n_.
   *
   * @param {Number} n
   * @api public
   */

  Assertion.prototype.length = function (n) {
    expect(this.obj).to.have.property('length');
    var len = this.obj.length;
    this.assert(
        n == len
      , 'expected ' + i(this.obj) + ' to have a length of ' + n + ' but got ' + len
      , 'expected ' + i(this.obj) + ' to not have a length of ' + len);
    return this;
  };

  /**
   * Assert property _name_ exists, with optional _val_.
   *
   * @param {String} name
   * @param {Mixed} val
   * @api public
   */

  Assertion.prototype.property = function (name, val) {
    if (this.flags.own) {
      this.assert(
          Object.prototype.hasOwnProperty.call(this.obj, name)
        , 'expected ' + i(this.obj) + ' to have own property ' + i(name)
        , 'expected ' + i(this.obj) + ' to not have own property ' + i(name));
      return this;
    }

    if (this.flags.not && undefined !== val) {
      if (undefined === this.obj[name]) {
        throw new Error(i(this.obj) + ' has no property ' + i(name));
      }
    } else {
      var hasProp;
      try {
        hasProp = name in this.obj
      } catch (e) {
        hasProp = undefined !== this.obj[name]
      }
      
      this.assert(
          hasProp
        , 'expected ' + i(this.obj) + ' to have a property ' + i(name)
        , 'expected ' + i(this.obj) + ' to not have a property ' + i(name));
    }
    
    if (undefined !== val) {
      this.assert(
          val === this.obj[name]
        , 'expected ' + i(this.obj) + ' to have a property ' + i(name)
          + ' of ' + i(val) + ', but got ' + i(this.obj[name])
        , 'expected ' + i(this.obj) + ' to not have a property ' + i(name)
          + ' of ' + i(val));
    }

    this.obj = this.obj[name];
    return this;
  };

  /**
   * Assert that the array contains _obj_ or string contains _obj_.
   *
   * @param {Mixed} obj|string
   * @api public
   */

  Assertion.prototype.string =
  Assertion.prototype.contain = function (obj) {
    if ('string' == typeof this.obj) {
      this.assert(
          ~this.obj.indexOf(obj)
        , 'expected ' + i(this.obj) + ' to contain ' + i(obj)
        , 'expected ' + i(this.obj) + ' to not contain ' + i(obj));
    } else {
      this.assert(
          ~indexOf(this.obj, obj)
        , 'expected ' + i(this.obj) + ' to contain ' + i(obj)
        , 'expected ' + i(this.obj) + ' to not contain ' + i(obj));
    }
    return this;
  };

  /**
   * Assert exact keys or inclusion of keys by using
   * the `.own` modifier.
   *
   * @param {Array|String ...} keys
   * @api public
   */

  Assertion.prototype.key =
  Assertion.prototype.keys = function ($keys) {
    var str
      , ok = true;

    $keys = isArray($keys)
      ? $keys
      : Array.prototype.slice.call(arguments);

    if (!$keys.length) throw new Error('keys required');

    var actual = keys(this.obj)
      , len = $keys.length;

    // Inclusion
    ok = every($keys, function (key) {
      return ~indexOf(actual, key);
    });

    // Strict
    if (!this.flags.not && this.flags.only) {
      ok = ok && $keys.length == actual.length;
    }

    // Key string
    if (len > 1) {
      $keys = map($keys, function (key) {
        return i(key);
      });
      var last = $keys.pop();
      str = $keys.join(', ') + ', and ' + last;
    } else {
      str = i($keys[0]);
    }

    // Form
    str = (len > 1 ? 'keys ' : 'key ') + str;

    // Have / include
    str = (!this.flags.only ? 'include ' : 'only have ') + str;

    // Assertion
    this.assert(
        ok
      , 'expected ' + i(this.obj) + ' to ' + str
      , 'expected ' + i(this.obj) + ' to not ' + str);

    return this;
  };

  /**
   * Function bind implementation.
   */

  function bind (fn, scope) {
    return function () {
      return fn.apply(scope, arguments);
    }
  }

  /**
   * Array every compatibility
   *
   * @see bit.ly/5Fq1N2
   * @api public
   */

  function every (arr, fn, thisObj) {
    var scope = thisObj || global;
    for (var i = 0, j = arr.length; i < j; ++i) {
      if (!fn.call(scope, arr[i], i, arr)) {
        return false;
      }
    }
    return true;
  };

  /**
   * Array indexOf compatibility.
   *
   * @see bit.ly/a5Dxa2
   * @api public
   */

  function indexOf (arr, o, i) {
    if (Array.prototype.indexOf) {
      return Array.prototype.indexOf.call(arr, o, i);
    }

    if (arr.length === undefined) {
      return -1;
    }

    for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0
        ; i < j && arr[i] !== o; i++);

    return j <= i ? -1 : i;
  };

  /**
   * Inspects an object.
   *
   * @see taken from node.js `util` module (copyright Joyent, MIT license)
   * @api private
   */

  function i (obj, showHidden, depth) {
    var seen = [];

    function stylize (str) {
      return str;
    };

    function format (value, recurseTimes) {
      // Provide a hook for user-specified inspect functions.
      // Check that value is an object with an inspect function on it
      if (value && typeof value.inspect === 'function' &&
          // Filter out the util module, it's inspect function is special
          value !== exports &&
          // Also filter out any prototype objects using the circular check.
          !(value.constructor && value.constructor.prototype === value)) {
        return value.inspect(recurseTimes);
      }

      // Primitive types cannot have properties
      switch (typeof value) {
        case 'undefined':
          return stylize('undefined', 'undefined');

        case 'string':
          var simple = '\'' + json.stringify(value).replace(/^"|"$/g, '')
                                                   .replace(/'/g, "\\'")
                                                   .replace(/\\"/g, '"') + '\'';
          return stylize(simple, 'string');

        case 'number':
          return stylize('' + value, 'number');

        case 'boolean':
          return stylize('' + value, 'boolean');
      }
      // For some reason typeof null is "object", so special case here.
      if (value === null) {
        return stylize('null', 'null');
      }

      // Look up the keys of the object.
      var visible_keys = keys(value);
      var $keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;

      // Functions without properties can be shortcutted.
      if (typeof value === 'function' && $keys.length === 0) {
        if (isRegExp(value)) {
          return stylize('' + value, 'regexp');
        } else {
          var name = value.name ? ': ' + value.name : '';
          return stylize('[Function' + name + ']', 'special');
        }
      }

      // Dates without properties can be shortcutted
      if (isDate(value) && $keys.length === 0) {
        return stylize(value.toUTCString(), 'date');
      }

      var base, type, braces;
      // Determine the object type
      if (isArray(value)) {
        type = 'Array';
        braces = ['[', ']'];
      } else {
        type = 'Object';
        braces = ['{', '}'];
      }

      // Make functions say that they are functions
      if (typeof value === 'function') {
        var n = value.name ? ': ' + value.name : '';
        base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
      } else {
        base = '';
      }

      // Make dates with properties first say the date
      if (isDate(value)) {
        base = ' ' + value.toUTCString();
      }

      if ($keys.length === 0) {
        return braces[0] + base + braces[1];
      }

      if (recurseTimes < 0) {
        if (isRegExp(value)) {
          return stylize('' + value, 'regexp');
        } else {
          return stylize('[Object]', 'special');
        }
      }

      seen.push(value);

      var output = map($keys, function (key) {
        var name, str;
        if (value.__lookupGetter__) {
          if (value.__lookupGetter__(key)) {
            if (value.__lookupSetter__(key)) {
              str = stylize('[Getter/Setter]', 'special');
            } else {
              str = stylize('[Getter]', 'special');
            }
          } else {
            if (value.__lookupSetter__(key)) {
              str = stylize('[Setter]', 'special');
            }
          }
        }
        if (indexOf(visible_keys, key) < 0) {
          name = '[' + key + ']';
        }
        if (!str) {
          if (indexOf(seen, value[key]) < 0) {
            if (recurseTimes === null) {
              str = format(value[key]);
            } else {
              str = format(value[key], recurseTimes - 1);
            }
            if (str.indexOf('\n') > -1) {
              if (isArray(value)) {
                str = map(str.split('\n'), function (line) {
                  return '  ' + line;
                }).join('\n').substr(2);
              } else {
                str = '\n' + map(str.split('\n'), function (line) {
                  return '   ' + line;
                }).join('\n');
              }
            }
          } else {
            str = stylize('[Circular]', 'special');
          }
        }
        if (typeof name === 'undefined') {
          if (type === 'Array' && key.match(/^\d+$/)) {
            return str;
          }
          name = json.stringify('' + key);
          if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
            name = name.substr(1, name.length - 2);
            name = stylize(name, 'name');
          } else {
            name = name.replace(/'/g, "\\'")
                       .replace(/\\"/g, '"')
                       .replace(/(^"|"$)/g, "'");
            name = stylize(name, 'string');
          }
        }

        return name + ': ' + str;
      });

      seen.pop();

      var numLinesEst = 0;
      var length = reduce(output, function (prev, cur) {
        numLinesEst++;
        if (indexOf(cur, '\n') >= 0) numLinesEst++;
        return prev + cur.length + 1;
      }, 0);

      if (length > 50) {
        output = braces[0] +
                 (base === '' ? '' : base + '\n ') +
                 ' ' +
                 output.join(',\n  ') +
                 ' ' +
                 braces[1];

      } else {
        output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
      }

      return output;
    }
    return format(obj, (typeof depth === 'undefined' ? 2 : depth));
  };

  function isArray (ar) {
    return Object.prototype.toString.call(ar) == '[object Array]';
  };

  function isRegExp(re) {
    var s = '' + re;
    return re instanceof RegExp || // easy case
           // duck-type for context-switching evalcx case
           typeof(re) === 'function' &&
           re.constructor.name === 'RegExp' &&
           re.compile &&
           re.test &&
           re.exec &&
           s.match(/^\/.*\/[gim]{0,3}$/);
  };

  function isDate(d) {
    if (d instanceof Date) return true;
    return false;
  };

  function keys (obj) {
    if (Object.keys) {
      return Object.keys(obj);
    }

    var keys = [];

    for (var i in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, i)) {
        keys.push(i);
      }
    }

    return keys;
  }

  function map (arr, mapper, that) {
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, mapper, that);
    }

    var other= new Array(arr.length);

    for (var i= 0, n = arr.length; i<n; i++)
      if (i in arr)
        other[i] = mapper.call(that, arr[i], i, arr);

    return other;
  };

  function reduce (arr, fun) {
    if (Array.prototype.reduce) {
      return Array.prototype.reduce.apply(
          arr
        , Array.prototype.slice.call(arguments, 1)
      );
    }

    var len = +this.length;

    if (typeof fun !== "function")
      throw new TypeError();

    // no value to return if no initial value and an empty array
    if (len === 0 && arguments.length === 1)
      throw new TypeError();

    var i = 0;
    if (arguments.length >= 2) {
      var rv = arguments[1];
    } else {
      do {
        if (i in this) {
          rv = this[i++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++i >= len)
          throw new TypeError();
      } while (true);
    }

    for (; i < len; i++) {
      if (i in this)
        rv = fun.call(null, rv, this[i], i, this);
    }

    return rv;
  };

  /**
   * Asserts deep equality
   *
   * @see taken from node.js `assert` module (copyright Joyent, MIT license)
   * @api private
   */

  expect.eql = function eql (actual, expected) {
    // 7.1. All identical values are equivalent, as determined by ===.
    if (actual === expected) { 
      return true;
    } else if ('undefined' != typeof Buffer 
        && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
      if (actual.length != expected.length) return false;

      for (var i = 0; i < actual.length; i++) {
        if (actual[i] !== expected[i]) return false;
      }

      return true;

    // 7.2. If the expected value is a Date object, the actual value is
    // equivalent if it is also a Date object that refers to the same time.
    } else if (actual instanceof Date && expected instanceof Date) {
      return actual.getTime() === expected.getTime();

    // 7.3. Other pairs that do not both pass typeof value == "object",
    // equivalence is determined by ==.
    } else if (typeof actual != 'object' && typeof expected != 'object') {
      return actual == expected;

    // 7.4. For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical "prototype" property. Note: this
    // accounts for both named and indexed properties on Arrays.
    } else {
      return objEquiv(actual, expected);
    }
  }

  function isUndefinedOrNull (value) {
    return value === null || value === undefined;
  }

  function isArguments (object) {
    return Object.prototype.toString.call(object) == '[object Arguments]';
  }

  function objEquiv (a, b) {
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
      return false;
    // an identical "prototype" property.
    if (a.prototype !== b.prototype) return false;
    //~~~I've managed to break Object.keys through screwy arguments passing.
    //   Converting to array solves the problem.
    if (isArguments(a)) {
      if (!isArguments(b)) {
        return false;
      }
      a = pSlice.call(a);
      b = pSlice.call(b);
      return expect.eql(a, b);
    }
    try{
      var ka = keys(a),
        kb = keys(b),
        key, i;
    } catch (e) {//happens when one is a string literal and the other isn't
      return false;
    }
    // having the same number of owned properties (keys incorporates hasOwnProperty)
    if (ka.length != kb.length)
      return false;
    //the same set of keys (although not necessarily the same order),
    ka.sort();
    kb.sort();
    //~~~cheap key test
    for (i = ka.length - 1; i >= 0; i--) {
      if (ka[i] != kb[i])
        return false;
    }
    //equivalent values for every corresponding key, and
    //~~~possibly expensive deep test
    for (i = ka.length - 1; i >= 0; i--) {
      key = ka[i];
      if (!expect.eql(a[key], b[key]))
         return false;
    }
    return true;
  }

  var json = (function () {
    "use strict";

    if ('object' == typeof JSON && JSON.parse && JSON.stringify) {
      return {
          parse: nativeJSON.parse
        , stringify: nativeJSON.stringify
      }
    }

    var JSON = {};

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    function date(d, key) {
      return isFinite(d.valueOf()) ?
          d.getUTCFullYear()     + '-' +
          f(d.getUTCMonth() + 1) + '-' +
          f(d.getUTCDate())      + 'T' +
          f(d.getUTCHours())     + ':' +
          f(d.getUTCMinutes())   + ':' +
          f(d.getUTCSeconds())   + 'Z' : null;
    };

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

  // If the string contains no control characters, no quote characters, and no
  // backslash characters, then we can safely slap some quotes around it.
  // Otherwise we must also replace the offending characters with safe escape
  // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

  // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

  // If the value has a toJSON method, call it to obtain a replacement value.

        if (value instanceof Date) {
            value = date(key);
        }

  // If we were called with a replacer function, then call the replacer to
  // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

  // What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

  // JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

  // If the value is a boolean or null, convert it to a string. Note:
  // typeof null does not produce 'null'. The case is included here in
  // the remote chance that this gets fixed someday.

            return String(value);

  // If the type is 'object', we might be dealing with an object or an array or
  // null.

        case 'object':

  // Due to a specification blunder in ECMAScript, typeof null is 'object',
  // so watch out for that case.

            if (!value) {
                return 'null';
            }

  // Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

  // Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

  // The value is an array. Stringify every element. Use null as a placeholder
  // for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

  // Join all of the elements together, separated with commas, and wrap them in
  // brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

  // If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

  // Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

  // Join all of the member texts together, separated with commas,
  // and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

  // If the JSON object does not yet have a stringify method, give it one.

    JSON.stringify = function (value, replacer, space) {

  // The stringify method takes a value and an optional replacer, and an optional
  // space parameter, and returns a JSON text. The replacer can be a function
  // that can replace values, or an array of strings that will select the keys.
  // A default replacer method can be provided. Use of the space parameter can
  // produce text that is more easily readable.

        var i;
        gap = '';
        indent = '';

  // If the space parameter is a number, make an indent string containing that
  // many spaces.

        if (typeof space === 'number') {
            for (i = 0; i < space; i += 1) {
                indent += ' ';
            }

  // If the space parameter is a string, it will be used as the indent string.

        } else if (typeof space === 'string') {
            indent = space;
        }

  // If there is a replacer, it must be a function or an array.
  // Otherwise, throw an error.

        rep = replacer;
        if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                typeof replacer.length !== 'number')) {
            throw new Error('JSON.stringify');
        }

  // Make a fake root object containing our value under the key of ''.
  // Return the result of stringifying the value.

        return str('', {'': value});
    };

  // If the JSON object does not yet have a parse method, give it one.

    JSON.parse = function (text, reviver) {
    // The parse method takes a text and an optional reviver function, and returns
    // a JavaScript value if the text is a valid JSON text.

        var j;

        function walk(holder, key) {

    // The walk method is used to recursively walk the resulting structure so
    // that modifications can be made.

            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }


    // Parsing happens in four stages. In the first stage, we replace certain
    // Unicode characters with escape sequences. JavaScript handles many characters
    // incorrectly, either silently deleting them, or treating them as line endings.

        text = String(text);
        cx.lastIndex = 0;
        if (cx.test(text)) {
            text = text.replace(cx, function (a) {
                return '\\u' +
                    ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            });
        }

    // In the second stage, we run the text against regular expressions that look
    // for non-JSON patterns. We are especially concerned with '()' and 'new'
    // because they can cause invocation, and '=' because it can cause mutation.
    // But just to be safe, we want to reject all unexpected forms.

    // We split the second stage into 4 regexp operations in order to work around
    // crippling inefficiencies in IE's and Safari's regexp engines. First we
    // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
    // replace all simple value tokens with ']' characters. Third, we delete all
    // open brackets that follow a colon or comma or that begin the text. Finally,
    // we look to see that the remaining characters are only whitespace or ']' or
    // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

        if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

    // In the third stage we use the eval function to compile the text into a
    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
    // in JavaScript: it can begin a block or an object literal. We wrap the text
    // in parens to eliminate the ambiguity.

            j = eval('(' + text + ')');

    // In the optional fourth stage, we recursively walk the new structure, passing
    // each name/value pair to a reviver function for possible transformation.

            return typeof reviver === 'function' ?
                walk({'': j}, '') : j;
        }

    // If the text is not JSON parseable, then a SyntaxError is thrown.

        throw new SyntaxError('JSON.parse');
    };

    return JSON;
  })();

  if ('undefined' != typeof window) {
    window.expect = module.exports;
  }

})(
    this
  , 'undefined' != typeof module ? module : {}
  , 'undefined' != typeof exports ? exports : {}
);

});

require.define("/dev/sweet-js/lib/sweet.js",function(require,module,exports,__dirname,__filename,process){var gen = require('escodegen');
var fs = require('fs');
var CC = require('contracts.js');
CC.enabled(true);
CC.autoload();
(function (exports) {
    'use strict';
    var Token, TokenName, Syntax, PropertyKind, Messages, Regex, source, strict, index, lineNumber, lineStart, length, buffer, state, tokenStream, extra;
    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8,
        Delimiter: 9,
        Pattern: 10
    };
    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';
    TokenName[Token.Delimiter] = 'Delimiter';
    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };
    PropertyKind = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    Messages = {
        UnexpectedToken: 'Unexpected token %0',
        UnexpectedNumber: 'Unexpected number',
        UnexpectedString: 'Unexpected string',
        UnexpectedIdentifier: 'Unexpected identifier',
        UnexpectedReserved: 'Unexpected reserved word',
        UnexpectedEOS: 'Unexpected end of input',
        NewlineAfterThrow: 'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp: 'Invalid regular expression: missing /',
        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
        NoCatchOrFinally: 'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalReturn: 'Illegal return statement',
        StrictModeWith: 'Strict mode code may not include a with statement',
        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
        StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
        StrictDelete: 'Delete of an unqualified identifier in strict mode.',
        StrictDuplicateProperty: 'Duplicate data property in object literal not allowed in strict mode',
        AccessorDataProperty: 'Object literal may not have data and accessor property with the same name',
        AccessorGetSet: 'Object literal may not have multiple get/set accessors with the same name',
        StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictReservedWord: 'Use of future reserved word in strict mode',
        UnmatchedDelimiter: 'Unmatched Delimiter'
    };
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }
    function isIn(el, list) {
        return list.indexOf(el) !== -1;
    }
    function sliceSource(from, to) {
        return source.slice(from, to);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource = function sliceArraySource(from, to) {
            return source.slice(from, to).join('');
        };
    }
    function isDecimalDigit(ch) {
        return '0123456789'.indexOf(ch) >= 0;
    }
    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }
    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }
    function isWhiteSpace(ch) {
        return ch === ' ' || ch === '\t' || ch === '\v' || ch === '\f' || ch === '\xa0' || ch.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch) >= 0;
    }
    function isLineTerminator(ch) {
        return ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029';
    }
    function isIdentifierStart(ch) {
        return ch === '$' || ch === '_' || ch === '\\' || ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch.charCodeAt(0) >= 128 && Regex.NonAsciiIdentifierStart.test(ch);
    }
    function isIdentifierPart(ch) {
        return ch === '$' || ch === '_' || ch === '\\' || ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch >= '0' && ch <= '9' || ch.charCodeAt(0) >= 128 && Regex.NonAsciiIdentifierPart.test(ch);
    }
    function isFutureReservedWord(id) {
        switch (id) {
        case 'class':
        case 'enum':
        case 'export':
        case 'extends':
        case 'import':
        case 'super':
            return true;
        }
        return false;
    }
    function isStrictModeReservedWord(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'yield':
        case 'let':
            return true;
        }
        return false;
    }
    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }
    function isKeyword(id) {
        var keyword = false;
        switch (id.length) {
        case 2:
            keyword = id === 'if' || id === 'in' || id === 'do';
            break;
        case 3:
            keyword = id === 'var' || id === 'for' || id === 'new' || id === 'try';
            break;
        case 4:
            keyword = id === 'this' || id === 'else' || id === 'case' || id === 'void' || id === 'with';
            break;
        case 5:
            keyword = id === 'while' || id === 'break' || id === 'catch' || id === 'throw';
            break;
        case 6:
            keyword = id === 'return' || id === 'typeof' || id === 'delete' || id === 'switch';
            break;
        case 7:
            keyword = id === 'default' || id === 'finally';
            break;
        case 8:
            keyword = id === 'function' || id === 'continue' || id === 'debugger';
            break;
        case 10:
            keyword = id === 'instanceof';
            break;
        }
        if (keyword) {
            return true;
        }
        switch (id) {
        case 'const':
            return true;
        case 'yield':
        case 'let':
            return true;
        }
        if (strict && isStrictModeReservedWord(id)) {
            return true;
        }
        return isFutureReservedWord(id);
    }
    function nextChar() {
        return source[index++];
    }
    function getChar() {
        return source[index];
    }
    function skipComment() {
        var ch, blockComment, lineComment;
        blockComment = false;
        lineComment = false;
        while (index < length) {
            ch = source[index];
            if (lineComment) {
                ch = nextChar();
                if (isLineTerminator(ch)) {
                    lineComment = false;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                }
            } else if (blockComment) {
                if (isLineTerminator(ch)) {
                    if (ch === '\r' && source[index + 1] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    ++index;
                    lineStart = index;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch = nextChar();
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch === '*') {
                        ch = source[index];
                        if (ch === '/') {
                            ++index;
                            blockComment = false;
                        }
                    }
                }
            } else if (ch === '/') {
                ch = source[index + 1];
                if (ch === '/') {
                    index += 2;
                    lineComment = true;
                } else if (ch === '*') {
                    index += 2;
                    blockComment = true;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch === '\r' && source[index] === '\n') {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else {
                break;
            }
        }
    }
    function scanHexEscape(prefix) {
        var i, len, ch, code = 0;
        len = prefix === 'u' ? 4 : 2;
        for (i = 0; i < len; ++i) {
            if (index < length && isHexDigit(source[index])) {
                ch = nextChar();
                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code);
    }
    function scanIdentifier() {
        var ch, start, id, restore;
        ch = source[index];
        if (!isIdentifierStart(ch)) {
            return;
        }
        start = index;
        if (ch === '\\') {
            ++index;
            if (source[index] !== 'u') {
                return;
            }
            ++index;
            restore = index;
            ch = scanHexEscape('u');
            if (ch) {
                if (ch === '\\' || !isIdentifierStart(ch)) {
                    return;
                }
                id = ch;
            } else {
                index = restore;
                id = 'u';
            }
        } else {
            id = nextChar();
        }
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch)) {
                break;
            }
            if (ch === '\\') {
                ++index;
                if (source[index] !== 'u') {
                    return;
                }
                ++index;
                restore = index;
                ch = scanHexEscape('u');
                if (ch) {
                    if (ch === '\\' || !isIdentifierPart(ch)) {
                        return;
                    }
                    id += ch;
                } else {
                    index = restore;
                    id += 'u';
                }
            } else {
                id += nextChar();
            }
        }
        if (id.length === 1) {
            return {
                type: Token.Identifier,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (isKeyword(id)) {
            return {
                type: Token.Keyword,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (id === 'null') {
            return {
                type: Token.NullLiteral,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (id === 'true' || id === 'false') {
            return {
                type: Token.BooleanLiteral,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        return {
            type: Token.Identifier,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [
                start,
                index
            ]
        };
    }
    function scanPunctuator() {
        var start = index, ch1 = source[index], ch2, ch3, ch4;
        if (ch1 === ';' || ch1 === '{' || ch1 === '}') {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === ',' || ch1 === '(' || ch1 === ')') {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === '#') {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        ch2 = source[index + 1];
        if (ch1 === '.' && !isDecimalDigit(ch2)) {
            return {
                type: Token.Punctuator,
                value: nextChar(),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        ch3 = source[index + 2];
        ch4 = source[index + 3];
        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
                index += 4;
                return {
                    type: Token.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [
                        start,
                        index
                    ]
                };
            }
        }
        if (ch1 === '=' && ch2 === '=' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '===',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === '!' && ch2 === '=' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '!==',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>>',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '<<=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch2 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: ch1 + ch2,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [
                        start,
                        index
                    ]
                };
            }
        }
        if (ch1 === ch2 && '+-<>&|'.indexOf(ch1) >= 0) {
            if ('+-<>&|'.indexOf(ch2) >= 0) {
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: ch1 + ch2,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [
                        start,
                        index
                    ]
                };
            }
        }
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1) >= 0) {
            return {
                type: Token.Punctuator,
                value: nextChar(),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
    }
    function scanNumericLiteral() {
        var number, start, ch;
        ch = source[index];
        assert(isDecimalDigit(ch) || ch === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start = index;
        number = '';
        if (ch !== '.') {
            number = nextChar();
            ch = source[index];
            if (number === '0') {
                if (ch === 'x' || ch === 'X') {
                    number += nextChar();
                    while (index < length) {
                        ch = source[index];
                        if (!isHexDigit(ch)) {
                            break;
                        }
                        number += nextChar();
                    }
                    if (number.length <= 2) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index < length) {
                        ch = source[index];
                        if (isIdentifierStart(ch)) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token.NumericLiteral,
                        value: parseInt(number, 16),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [
                            start,
                            index
                        ]
                    };
                } else if (isOctalDigit(ch)) {
                    number += nextChar();
                    while (index < length) {
                        ch = source[index];
                        if (!isOctalDigit(ch)) {
                            break;
                        }
                        number += nextChar();
                    }
                    if (index < length) {
                        ch = source[index];
                        if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token.NumericLiteral,
                        value: parseInt(number, 8),
                        octal: true,
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [
                            start,
                            index
                        ]
                    };
                }
                if (isDecimalDigit(ch)) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index < length) {
                ch = source[index];
                if (!isDecimalDigit(ch)) {
                    break;
                }
                number += nextChar();
            }
        }
        if (ch === '.') {
            number += nextChar();
            while (index < length) {
                ch = source[index];
                if (!isDecimalDigit(ch)) {
                    break;
                }
                number += nextChar();
            }
        }
        if (ch === 'e' || ch === 'E') {
            number += nextChar();
            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += nextChar();
            }
            ch = source[index];
            if (isDecimalDigit(ch)) {
                number += nextChar();
                while (index < length) {
                    ch = source[index];
                    if (!isDecimalDigit(ch)) {
                        break;
                    }
                    number += nextChar();
                }
            } else {
                ch = 'character ' + ch;
                if (index >= length) {
                    ch = '<end>';
                }
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index < length) {
            ch = source[index];
            if (isIdentifierStart(ch)) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [
                start,
                index
            ]
        };
    }
    function scanStringLiteral() {
        var str = '', quote, start, ch, code, unescaped, restore, octal = false;
        quote = source[index];
        assert(quote === '\'' || quote === '"', 'String literal must starts with a quote');
        start = index;
        ++index;
        while (index < length) {
            ch = nextChar();
            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = nextChar();
                if (!isLineTerminator(ch)) {
                    switch (ch) {
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore = index;
                        unescaped = scanHexEscape(ch);
                        if (unescaped) {
                            str += unescaped;
                        } else {
                            index = restore;
                            str += ch;
                        }
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\v';
                        break;
                    default:
                        if (isOctalDigit(ch)) {
                            code = '01234567'.indexOf(ch);
                            if (code !== 0) {
                                octal = true;
                            }
                            if (index < length && isOctalDigit(source[index])) {
                                octal = true;
                                code = code * 8 + '01234567'.indexOf(nextChar());
                                if ('0123'.indexOf(ch) >= 0 && index < length && isOctalDigit(source[index])) {
                                    code = code * 8 + '01234567'.indexOf(nextChar());
                                }
                            }
                            str += String.fromCharCode(code);
                        } else {
                            str += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                }
            } else if (isLineTerminator(ch)) {
                break;
            } else {
                str += ch;
            }
        }
        if (quote !== '') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [
                start,
                index
            ]
        };
    }
    function scanRegExp() {
        var str = '', ch, start, pattern, flags, value, classMarker = false, restore;
        buffer = null;
        skipComment();
        start = index;
        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = nextChar();
        while (index < length) {
            ch = nextChar();
            str += ch;
            if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '\\') {
                    ch = nextChar();
                    if (isLineTerminator(ch)) {
                        throwError({}, Messages.UnterminatedRegExp);
                    }
                    str += ch;
                } else if (ch === '/') {
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                } else if (isLineTerminator(ch)) {
                    throwError({}, Messages.UnterminatedRegExp);
                }
            }
        }
        if (str.length === 1) {
            throwError({}, Messages.UnterminatedRegExp);
        }
        pattern = str.substr(1, str.length - 2);
        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch)) {
                break;
            }
            ++index;
            if (ch === '\\' && index < length) {
                ch = source[index];
                if (ch === 'u') {
                    ++index;
                    restore = index;
                    ch = scanHexEscape('u');
                    if (ch) {
                        flags += ch;
                        str += '\\u';
                        for (; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                } else {
                    str += '\\';
                }
            } else {
                flags += ch;
                str += ch;
            }
        }
        try {
            value = new RegExp(pattern, flags);
        } catch (e) {
            throwError({}, Messages.InvalidRegExp);
        }
        return {
            literal: str,
            value: value,
            range: [
                start,
                index
            ]
        };
    }
    function isIdentifierName(token) {
        return token.type === Token.Identifier || token.type === Token.Keyword || token.type === Token.BooleanLiteral || token.type === Token.NullLiteral;
    }
    function advance() {
        var ch, token;
        skipComment();
        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    index,
                    index
                ]
            };
        }
        ch = source[index];
        token = scanPunctuator();
        if (typeof token !== 'undefined') {
            return token;
        }
        if (ch === '\'' || ch === '"') {
            return scanStringLiteral();
        }
        if (ch === '.' || isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }
        token = scanIdentifier();
        if (typeof token !== 'undefined') {
            return token;
        }
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }
    function lex() {
        var token;
        if (buffer) {
            token = buffer;
            buffer = null;
            index++;
            return token;
        }
        buffer = null;
        return tokenStream[index++];
    }
    function lookahead() {
        var pos, line, start;
        if (buffer !== null) {
            return buffer;
        }
        buffer = tokenStream[index];
        return buffer;
    }
    function peekLineTerminator() {
        var pos, line, start, found;
        found = tokenStream[index - 1].lineNumber !== tokenStream[index].lineNumber;
        return found;
    }
    function throwError(token, messageFormat) {
        var error, args = Array.prototype.slice.call(arguments, 2), msg = messageFormat.replace(/%(\d)/g, function (whole, index) {
                return args[index] || '';
            });
        if (typeof token.lineNumber === 'number') {
            error = new Error('Line ' + token.lineNumber + ': ' + msg);
            error.index = token.range[0];
            error.lineNumber = token.lineNumber;
            error.column = token.range[0] - lineStart + 1;
        } else {
            error = new Error('Line ' + lineNumber + ': ' + msg);
            error.index = index;
            error.lineNumber = lineNumber;
            error.column = index - lineStart + 1;
        }
        throw error;
    }
    function throwErrorTolerant() {
        var error;
        try {
            throwError.apply(null, arguments);
        } catch (e) {
            if (extra.errors) {
                extra.errors.push(e);
            } else {
                throw e;
            }
        }
    }
    function throwUnexpected(token) {
        var s;
        if (token.type === Token.EOF) {
            throwError(token, Messages.UnexpectedEOS);
        }
        if (token.type === Token.NumericLiteral) {
            throwError(token, Messages.UnexpectedNumber);
        }
        if (token.type === Token.StringLiteral) {
            throwError(token, Messages.UnexpectedString);
        }
        if (token.type === Token.Identifier) {
            throwError(token, Messages.UnexpectedIdentifier);
        }
        if (token.type === Token.Keyword) {
            if (isFutureReservedWord(token.value)) {
                throwError(token, Messages.UnexpectedReserved);
            } else if (strict && isStrictModeReservedWord(token.value)) {
                throwError(token, Messages.StrictReservedWord);
            }
            throwError(token, Messages.UnexpectedToken, token.value);
        }
        throwError(token, Messages.UnexpectedToken, token.value);
    }
    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpected(token);
        }
    }
    function expectKeyword(keyword) {
        var token = lex();
        if (token.type !== Token.Keyword || token.value !== keyword) {
            throwUnexpected(token);
        }
    }
    function match(value) {
        var token = lookahead();
        return token.type === Token.Punctuator && token.value === value;
    }
    function matchKeyword(keyword) {
        var token = lookahead();
        return token.type === Token.Keyword && token.value === keyword;
    }
    function matchAssign() {
        var token = lookahead(), op = token.value;
        if (token.type !== Token.Punctuator) {
            return false;
        }
        return op === '=' || op === '*=' || op === '/=' || op === '%=' || op === '+=' || op === '-=' || op === '<<=' || op === '>>=' || op === '>>>=' || op === '&=' || op === '^=' || op === '|=';
    }
    function consumeSemicolon() {
        var token, line;
        if (tokenStream[index].value === ';') {
            lex();
            return;
        }
        line = tokenStream[index - 1].lineNumber;
        token = tokenStream[index];
        if (line !== token.lineNumber) {
            return;
        }
        if (token.type !== Token.EOF && !match('}')) {
            throwUnexpected(token);
        }
        return;
    }
    function isLeftHandSide(expr) {
        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
    }
    function parseArrayInitialiser() {
        var elements = [], undef;
        expect('[');
        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(undef);
            } else {
                elements.push(parseAssignmentExpression());
                if (!match(']')) {
                    expect(',');
                }
            }
        }
        expect(']');
        return {
            type: Syntax.ArrayExpression,
            elements: elements
        };
    }
    function parsePropertyFunction(param, first) {
        var previousStrict, body;
        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (first && strict && isRestrictedWord(param[0].name)) {
            throwError(first, Messages.StrictParamName);
        }
        strict = previousStrict;
        return {
            type: Syntax.FunctionExpression,
            id: null,
            params: param,
            body: body
        };
    }
    function parseObjectPropertyKey() {
        var token = lex();
        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwError(token, Messages.StrictOctalLiteral);
            }
            return createLiteral(token);
        }
        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }
    function parseObjectProperty() {
        var token, key, id, param;
        token = lookahead();
        if (token.type === Token.Identifier) {
            id = parseObjectPropertyKey();
            if (token.value === 'get' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                expect(')');
                return {
                    type: Syntax.Property,
                    key: key,
                    value: parsePropertyFunction([]),
                    kind: 'get'
                };
            } else if (token.value === 'set' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                token = lookahead();
                if (token.type !== Token.Identifier) {
                    throwUnexpected(lex());
                }
                param = [
                    parseVariableIdentifier()
                ];
                expect(')');
                return {
                    type: Syntax.Property,
                    key: key,
                    value: parsePropertyFunction(param, token),
                    kind: 'set'
                };
            } else {
                expect(':');
                return {
                    type: Syntax.Property,
                    key: id,
                    value: parseAssignmentExpression(),
                    kind: 'init'
                };
            }
        } else if (token.type === Token.EOF || token.type === Token.Punctuator) {
            throwUnexpected(token);
        } else {
            key = parseObjectPropertyKey();
            expect(':');
            return {
                type: Syntax.Property,
                key: key,
                value: parseAssignmentExpression(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser() {
        var token, properties = [], property, name, kind, map = {}, toString = String;
        expect('{');
        while (!match('}')) {
            property = parseObjectProperty();
            if (property.key.type === Syntax.Identifier) {
                name = property.key.name;
            } else {
                name = toString(property.key.value);
            }
            kind = property.kind === 'init' ? PropertyKind.Data : property.kind === 'get' ? PropertyKind.Get : PropertyKind.Set;
            if (Object.prototype.hasOwnProperty.call(map, name)) {
                if (map[name] === PropertyKind.Data) {
                    if (strict && kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                    } else if (kind !== PropertyKind.Data) {
                        throwError({}, Messages.AccessorDataProperty);
                    }
                } else {
                    if (kind === PropertyKind.Data) {
                        throwError({}, Messages.AccessorDataProperty);
                    } else if (map[name] & kind) {
                        throwError({}, Messages.AccessorGetSet);
                    }
                }
                map[name] |= kind;
            } else {
                map[name] = kind;
            }
            properties.push(property);
            if (!match('}')) {
                expect(',');
            }
        }
        expect('}');
        return {
            type: Syntax.ObjectExpression,
            properties: properties
        };
    }
    function parsePrimaryExpression() {
        var expr, token = lookahead(), type = token.type;
        if (type === Token.Identifier) {
            return {
                type: Syntax.Identifier,
                name: lex().value
            };
        }
        if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return createLiteral(lex());
        }
        if (type === Token.Keyword) {
            if (matchKeyword('this')) {
                lex();
                return {
                    type: Syntax.ThisExpression
                };
            }
            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
        }
        if (type === Token.BooleanLiteral) {
            lex();
            token.value = token.value === 'true';
            return createLiteral(token);
        }
        if (type === Token.NullLiteral) {
            lex();
            token.value = null;
            return createLiteral(token);
        }
        if (match('[')) {
            return parseArrayInitialiser();
        }
        if (match('{')) {
            return parseObjectInitialiser();
        }
        if (match('(')) {
            lex();
            state.lastParenthesized = expr = parseExpression();
            expect(')');
            return expr;
        }
        if (token.value instanceof RegExp) {
            return createLiteral(lex());
        }
        return throwUnexpected(lex());
    }
    function parseArguments() {
        var args = [];
        expect('(');
        if (!match(')')) {
            while (index < length) {
                args.push(parseAssignmentExpression());
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        return args;
    }
    function parseNonComputedProperty() {
        var token = lex();
        if (!isIdentifierName(token)) {
            throwUnexpected(token);
        }
        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }
    function parseNonComputedMember(object) {
        return {
            type: Syntax.MemberExpression,
            computed: false,
            object: object,
            property: parseNonComputedProperty()
        };
    }
    function parseComputedMember(object) {
        var property, expr;
        expect('[');
        property = parseExpression();
        expr = {
            type: Syntax.MemberExpression,
            computed: true,
            object: object,
            property: property
        };
        expect(']');
        return expr;
    }
    function parseCallMember(object) {
        return {
            type: Syntax.CallExpression,
            callee: object,
            'arguments': parseArguments()
        };
    }
    function parseNewExpression() {
        var expr;
        expectKeyword('new');
        expr = {
            type: Syntax.NewExpression,
            callee: parseLeftHandSideExpression(),
            'arguments': []
        };
        if (match('(')) {
            expr['arguments'] = parseArguments();
        }
        return expr;
    }
    function toArrayNode(arr) {
        var els = arr.map(function (el) {
                return {
                    type: 'Literal',
                    value: el,
                    raw: el.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els
        };
    }
    function toObjectNode(obj) {
        var props = Object.keys(obj).map(function (key) {
                var raw = obj[key];
                var value;
                if (Array.isArray(raw)) {
                    value = toArrayNode(raw);
                } else {
                    value = {
                        type: 'Literal',
                        value: obj[key],
                        raw: obj[key].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key
                    },
                    value: value,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props
        };
    }
    function parseLeftHandSideExpressionAllowCall() {
        var useNew, expr;
        useNew = matchKeyword('new');
        expr = useNew ? parseNewExpression() : parsePrimaryExpression();
        while (index < length) {
            if (match('.')) {
                lex();
                expr = parseNonComputedMember(expr);
            } else if (match('[')) {
                expr = parseComputedMember(expr);
            } else if (match('(')) {
                expr = parseCallMember(expr);
            } else {
                break;
            }
        }
        return expr;
    }
    function parseLeftHandSideExpression() {
        var useNew, expr;
        useNew = matchKeyword('new');
        expr = useNew ? parseNewExpression() : parsePrimaryExpression();
        while (index < length) {
            if (match('.')) {
                lex();
                expr = parseNonComputedMember(expr);
            } else if (match('[')) {
                expr = parseComputedMember(expr);
            } else {
                break;
            }
        }
        return expr;
    }
    function parsePostfixExpression() {
        var expr = parseLeftHandSideExpressionAllowCall();
        if ((match('++') || match('--')) && !peekLineTerminator()) {
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwError({}, Messages.StrictLHSPostfix);
            }
            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }
            expr = {
                type: Syntax.UpdateExpression,
                operator: lex().value,
                argument: expr,
                prefix: false
            };
        }
        return expr;
    }
    function parseUnaryExpression() {
        var token, expr;
        if (match('++') || match('--')) {
            token = lex();
            expr = parseUnaryExpression();
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwError({}, Messages.StrictLHSPrefix);
            }
            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }
            expr = {
                type: Syntax.UpdateExpression,
                operator: token.value,
                argument: expr,
                prefix: true
            };
            return expr;
        }
        if (match('+') || match('-') || match('~') || match('!')) {
            expr = {
                type: Syntax.UnaryExpression,
                operator: lex().value,
                argument: parseUnaryExpression()
            };
            return expr;
        }
        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            expr = {
                type: Syntax.UnaryExpression,
                operator: lex().value,
                argument: parseUnaryExpression()
            };
            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                throwErrorTolerant({}, Messages.StrictDelete);
            }
            return expr;
        }
        return parsePostfixExpression();
    }
    function parseMultiplicativeExpression() {
        var expr = parseUnaryExpression();
        while (match('*') || match('/') || match('%')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseUnaryExpression()
            };
        }
        return expr;
    }
    function parseAdditiveExpression() {
        var expr = parseMultiplicativeExpression();
        while (match('+') || match('-')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseMultiplicativeExpression()
            };
        }
        return expr;
    }
    function parseShiftExpression() {
        var expr = parseAdditiveExpression();
        while (match('<<') || match('>>') || match('>>>')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseAdditiveExpression()
            };
        }
        return expr;
    }
    function parseRelationalExpression() {
        var expr, previousAllowIn;
        previousAllowIn = state.allowIn;
        state.allowIn = true;
        expr = parseShiftExpression();
        state.allowIn = previousAllowIn;
        if (match('<') || match('>') || match('<=') || match('>=')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseRelationalExpression()
            };
        } else if (state.allowIn && matchKeyword('in')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: 'in',
                left: expr,
                right: parseRelationalExpression()
            };
        } else if (matchKeyword('instanceof')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: 'instanceof',
                left: expr,
                right: parseRelationalExpression()
            };
        }
        return expr;
    }
    function parseEqualityExpression() {
        var expr = parseRelationalExpression();
        while (match('==') || match('!=') || match('===') || match('!==')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseRelationalExpression()
            };
        }
        return expr;
    }
    function parseBitwiseANDExpression() {
        var expr = parseEqualityExpression();
        while (match('&')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '&',
                left: expr,
                right: parseEqualityExpression()
            };
        }
        return expr;
    }
    function parseBitwiseXORExpression() {
        var expr = parseBitwiseANDExpression();
        while (match('^')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '^',
                left: expr,
                right: parseBitwiseANDExpression()
            };
        }
        return expr;
    }
    function parseBitwiseORExpression() {
        var expr = parseBitwiseXORExpression();
        while (match('|')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '|',
                left: expr,
                right: parseBitwiseXORExpression()
            };
        }
        return expr;
    }
    function parseLogicalANDExpression() {
        var expr = parseBitwiseORExpression();
        while (match('&&')) {
            lex();
            expr = {
                type: Syntax.LogicalExpression,
                operator: '&&',
                left: expr,
                right: parseBitwiseORExpression()
            };
        }
        return expr;
    }
    function parseLogicalORExpression() {
        var expr = parseLogicalANDExpression();
        while (match('||')) {
            lex();
            expr = {
                type: Syntax.LogicalExpression,
                operator: '||',
                left: expr,
                right: parseLogicalANDExpression()
            };
        }
        return expr;
    }
    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent;
        expr = parseLogicalORExpression();
        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = parseAssignmentExpression();
            state.allowIn = previousAllowIn;
            expect(':');
            expr = {
                type: Syntax.ConditionalExpression,
                test: expr,
                consequent: consequent,
                alternate: parseAssignmentExpression()
            };
        }
        return expr;
    }
    function parseAssignmentExpression() {
        var expr;
        expr = parseConditionalExpression();
        if (matchAssign()) {
            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwError({}, Messages.StrictLHSAssignment);
            }
            expr = {
                type: Syntax.AssignmentExpression,
                operator: lex().value,
                left: expr,
                right: parseAssignmentExpression()
            };
        }
        return expr;
    }
    function parseExpression() {
        var expr = parseAssignmentExpression();
        if (match(',')) {
            expr = {
                type: Syntax.SequenceExpression,
                expressions: [
                    expr
                ]
            };
            while (index < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                expr.expressions.push(parseAssignmentExpression());
            }
        }
        return expr;
    }
    function parseStatementList() {
        var list = [], statement;
        while (index < length) {
            if (match('}')) {
                break;
            }
            statement = parseSourceElement();
            if (typeof statement === 'undefined') {
                break;
            }
            list.push(statement);
        }
        return list;
    }
    function parseBlock() {
        var block;
        expect('{');
        block = parseStatementList();
        expect('}');
        return {
            type: Syntax.BlockStatement,
            body: block
        };
    }
    function parseVariableIdentifier() {
        var token = lex();
        if (token.type !== Token.Identifier) {
            throwUnexpected(token);
        }
        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }
    function parseVariableDeclaration(kind) {
        var id = parseVariableIdentifier(), init = null;
        if (strict && isRestrictedWord(id.name)) {
            throwErrorTolerant({}, Messages.StrictVarName);
        }
        if (kind === 'const') {
            expect('=');
            init = parseAssignmentExpression();
        } else if (match('=')) {
            lex();
            init = parseAssignmentExpression();
        }
        return {
            type: Syntax.VariableDeclarator,
            id: id,
            init: init
        };
    }
    function parseVariableDeclarationList(kind) {
        var list = [];
        while (index < length) {
            list.push(parseVariableDeclaration(kind));
            if (!match(',')) {
                break;
            }
            lex();
        }
        return list;
    }
    function parseVariableStatement() {
        var declarations;
        expectKeyword('var');
        declarations = parseVariableDeclarationList();
        consumeSemicolon();
        return {
            type: Syntax.VariableDeclaration,
            declarations: declarations,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration(kind) {
        var declarations;
        expectKeyword(kind);
        declarations = parseVariableDeclarationList(kind);
        consumeSemicolon();
        return {
            type: Syntax.VariableDeclaration,
            declarations: declarations,
            kind: kind
        };
    }
    function parseEmptyStatement() {
        expect(';');
        return {
            type: Syntax.EmptyStatement
        };
    }
    function parseExpressionStatement() {
        var expr = parseExpression();
        consumeSemicolon();
        return {
            type: Syntax.ExpressionStatement,
            expression: expr
        };
    }
    function parseIfStatement() {
        var test, consequent, alternate;
        expectKeyword('if');
        expect('(');
        test = parseExpression();
        expect(')');
        consequent = parseStatement();
        if (matchKeyword('else')) {
            lex();
            alternate = parseStatement();
        } else {
            alternate = null;
        }
        return {
            type: Syntax.IfStatement,
            test: test,
            consequent: consequent,
            alternate: alternate
        };
    }
    function parseDoWhileStatement() {
        var body, test, oldInIteration;
        expectKeyword('do');
        oldInIteration = state.inIteration;
        state.inIteration = true;
        body = parseStatement();
        state.inIteration = oldInIteration;
        expectKeyword('while');
        expect('(');
        test = parseExpression();
        expect(')');
        if (match(';')) {
            lex();
        }
        return {
            type: Syntax.DoWhileStatement,
            body: body,
            test: test
        };
    }
    function parseWhileStatement() {
        var test, body, oldInIteration;
        expectKeyword('while');
        expect('(');
        test = parseExpression();
        expect(')');
        oldInIteration = state.inIteration;
        state.inIteration = true;
        body = parseStatement();
        state.inIteration = oldInIteration;
        return {
            type: Syntax.WhileStatement,
            test: test,
            body: body
        };
    }
    function parseForVariableDeclaration() {
        var token = lex();
        return {
            type: Syntax.VariableDeclaration,
            declarations: parseVariableDeclarationList(),
            kind: token.value
        };
    }
    function parseForStatement() {
        var init, test, update, left, right, body, oldInIteration;
        init = test = update = null;
        expectKeyword('for');
        expect('(');
        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var') || matchKeyword('let')) {
                state.allowIn = false;
                init = parseForVariableDeclaration();
                state.allowIn = true;
                if (init.declarations.length === 1 && matchKeyword('in')) {
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            } else {
                state.allowIn = false;
                init = parseExpression();
                state.allowIn = true;
                if (matchKeyword('in')) {
                    if (!isLeftHandSide(init)) {
                        throwError({}, Messages.InvalidLHSInForIn);
                    }
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            }
            if (typeof left === 'undefined') {
                expect(';');
            }
        }
        if (typeof left === 'undefined') {
            if (!match(';')) {
                test = parseExpression();
            }
            expect(';');
            if (!match(')')) {
                update = parseExpression();
            }
        }
        expect(')');
        oldInIteration = state.inIteration;
        state.inIteration = true;
        body = parseStatement();
        state.inIteration = oldInIteration;
        if (typeof left === 'undefined') {
            return {
                type: Syntax.ForStatement,
                init: init,
                test: test,
                update: update,
                body: body
            };
        }
        return {
            type: Syntax.ForInStatement,
            left: left,
            right: right,
            body: body,
            each: false
        };
    }
    function parseContinueStatement() {
        var token, label = null;
        expectKeyword('continue');
        if (tokenStream[index].value === ';') {
            lex();
            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }
            return {
                type: Syntax.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator()) {
            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }
            return {
                type: Syntax.ContinueStatement,
                label: null
            };
        }
        token = lookahead();
        if (token.type === Token.Identifier) {
            label = parseVariableIdentifier();
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }
        consumeSemicolon();
        if (label === null && !state.inIteration) {
            throwError({}, Messages.IllegalContinue);
        }
        return {
            type: Syntax.ContinueStatement,
            label: label
        };
    }
    function parseBreakStatement() {
        var token, label = null;
        expectKeyword('break');
        if (source[index] === ';') {
            lex();
            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }
            return {
                type: Syntax.BreakStatement,
                label: null
            };
        }
        if (peekLineTerminator()) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }
            return {
                type: Syntax.BreakStatement,
                label: null
            };
        }
        token = lookahead();
        if (token.type === Token.Identifier) {
            label = parseVariableIdentifier();
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }
        consumeSemicolon();
        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError({}, Messages.IllegalBreak);
        }
        return {
            type: Syntax.BreakStatement,
            label: label
        };
    }
    function parseReturnStatement() {
        var token, argument = null;
        expectKeyword('return');
        if (!state.inFunctionBody) {
            throwErrorTolerant({}, Messages.IllegalReturn);
        }
        if (source[index] === ' ') {
            if (isIdentifierStart(source[index + 1])) {
                argument = parseExpression();
                consumeSemicolon();
                return {
                    type: Syntax.ReturnStatement,
                    argument: argument
                };
            }
        }
        if (peekLineTerminator()) {
            return {
                type: Syntax.ReturnStatement,
                argument: null
            };
        }
        if (!match(';')) {
            token = lookahead();
            if (!match('}') && token.type !== Token.EOF) {
                argument = parseExpression();
            }
        }
        consumeSemicolon();
        return {
            type: Syntax.ReturnStatement,
            argument: argument
        };
    }
    function parseWithStatement() {
        var object, body;
        if (strict) {
            throwErrorTolerant({}, Messages.StrictModeWith);
        }
        expectKeyword('with');
        expect('(');
        object = parseExpression();
        expect(')');
        body = parseStatement();
        return {
            type: Syntax.WithStatement,
            object: object,
            body: body
        };
    }
    function parseSwitchCase() {
        var test, consequent = [], statement;
        if (matchKeyword('default')) {
            lex();
            test = null;
        } else {
            expectKeyword('case');
            test = parseExpression();
        }
        expect(':');
        while (index < length) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement = parseStatement();
            if (typeof statement === 'undefined') {
                break;
            }
            consequent.push(statement);
        }
        return {
            type: Syntax.SwitchCase,
            test: test,
            consequent: consequent
        };
    }
    function parseSwitchStatement() {
        var discriminant, cases, oldInSwitch;
        expectKeyword('switch');
        expect('(');
        discriminant = parseExpression();
        expect(')');
        expect('{');
        if (match('}')) {
            lex();
            return {
                type: Syntax.SwitchStatement,
                discriminant: discriminant
            };
        }
        cases = [];
        oldInSwitch = state.inSwitch;
        state.inSwitch = true;
        while (index < length) {
            if (match('}')) {
                break;
            }
            cases.push(parseSwitchCase());
        }
        state.inSwitch = oldInSwitch;
        expect('}');
        return {
            type: Syntax.SwitchStatement,
            discriminant: discriminant,
            cases: cases
        };
    }
    function parseThrowStatement() {
        var argument;
        expectKeyword('throw');
        if (peekLineTerminator()) {
            throwError({}, Messages.NewlineAfterThrow);
        }
        argument = parseExpression();
        consumeSemicolon();
        return {
            type: Syntax.ThrowStatement,
            argument: argument
        };
    }
    function parseCatchClause() {
        var param;
        expectKeyword('catch');
        expect('(');
        if (!match(')')) {
            param = parseExpression();
            if (strict && param.type === Syntax.Identifier && isRestrictedWord(param.name)) {
                throwErrorTolerant({}, Messages.StrictCatchVariable);
            }
        }
        expect(')');
        return {
            type: Syntax.CatchClause,
            param: param,
            guard: null,
            body: parseBlock()
        };
    }
    function parseTryStatement() {
        var block, handlers = [], finalizer = null;
        expectKeyword('try');
        block = parseBlock();
        if (matchKeyword('catch')) {
            handlers.push(parseCatchClause());
        }
        if (matchKeyword('finally')) {
            lex();
            finalizer = parseBlock();
        }
        if (handlers.length === 0 && !finalizer) {
            throwError({}, Messages.NoCatchOrFinally);
        }
        return {
            type: Syntax.TryStatement,
            block: block,
            handlers: handlers,
            finalizer: finalizer
        };
    }
    function parseDebuggerStatement() {
        expectKeyword('debugger');
        consumeSemicolon();
        return {
            type: Syntax.DebuggerStatement
        };
    }
    function parseStatement() {
        var token = lookahead(), expr, labeledBody;
        if (token.type === Token.EOF) {
            throwUnexpected(token);
        }
        if (token.type === Token.Punctuator) {
            switch (token.value) {
            case ';':
                return parseEmptyStatement();
            case '{':
                return parseBlock();
            case '(':
                return parseExpressionStatement();
            default:
                break;
            }
        }
        if (token.type === Token.Keyword) {
            switch (token.value) {
            case 'break':
                return parseBreakStatement();
            case 'continue':
                return parseContinueStatement();
            case 'debugger':
                return parseDebuggerStatement();
            case 'do':
                return parseDoWhileStatement();
            case 'for':
                return parseForStatement();
            case 'function':
                return parseFunctionDeclaration();
            case 'if':
                return parseIfStatement();
            case 'return':
                return parseReturnStatement();
            case 'switch':
                return parseSwitchStatement();
            case 'throw':
                return parseThrowStatement();
            case 'try':
                return parseTryStatement();
            case 'var':
                return parseVariableStatement();
            case 'while':
                return parseWhileStatement();
            case 'with':
                return parseWithStatement();
            default:
                break;
            }
        }
        expr = parseExpression();
        if (expr.type === Syntax.Identifier && match(':')) {
            lex();
            if (Object.prototype.hasOwnProperty.call(state.labelSet, expr.name)) {
                throwError({}, Messages.Redeclaration, 'Label', expr.name);
            }
            state.labelSet[expr.name] = true;
            labeledBody = parseStatement();
            delete state.labelSet[expr.name];
            return {
                type: Syntax.LabeledStatement,
                label: expr,
                body: labeledBody
            };
        }
        consumeSemicolon();
        return {
            type: Syntax.ExpressionStatement,
            expression: expr
        };
    }
    function parseFunctionSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted, oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;
        expect('{');
        while (index < length) {
            token = lookahead();
            if (token.type !== Token.StringLiteral) {
                break;
            }
            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                break;
            }
            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwError(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }
        oldLabelSet = state.labelSet;
        oldInIteration = state.inIteration;
        oldInSwitch = state.inSwitch;
        oldInFunctionBody = state.inFunctionBody;
        state.labelSet = {};
        state.inIteration = false;
        state.inSwitch = false;
        state.inFunctionBody = true;
        while (index < length) {
            if (match('}')) {
                break;
            }
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }
        expect('}');
        state.labelSet = oldLabelSet;
        state.inIteration = oldInIteration;
        state.inSwitch = oldInSwitch;
        state.inFunctionBody = oldInFunctionBody;
        return {
            type: Syntax.BlockStatement,
            body: sourceElements
        };
    }
    function parseFunctionDeclaration() {
        var id, param, params = [], body, token, firstRestricted, message, previousStrict, paramSet;
        expectKeyword('function');
        token = lookahead();
        id = parseVariableIdentifier();
        if (strict) {
            if (isRestrictedWord(token.value)) {
                throwError(token, Messages.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictFunctionName;
            } else if (isStrictModeReservedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictReservedWord;
            }
        }
        expect('(');
        if (!match(')')) {
            paramSet = {};
            while (index < length) {
                token = lookahead();
                param = parseVariableIdentifier();
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        throwError(token, Messages.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        throwError(token, Messages.StrictParamDupe);
                    }
                } else if (!firstRestricted) {
                    if (isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamName;
                    } else if (isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamDupe;
                    }
                }
                params.push(param);
                paramSet[param.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        strict = previousStrict;
        return {
            type: Syntax.FunctionDeclaration,
            id: id,
            params: params,
            body: body
        };
    }
    function parseFunctionExpression() {
        var token, id = null, firstRestricted, message, param, params = [], body, previousStrict, paramSet;
        expectKeyword('function');
        if (!match('(')) {
            token = lookahead();
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    throwError(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }
        expect('(');
        if (!match(')')) {
            paramSet = {};
            while (index < length) {
                token = lookahead();
                param = parseVariableIdentifier();
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        throwError(token, Messages.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        throwError(token, Messages.StrictParamDupe);
                    }
                } else if (!firstRestricted) {
                    if (isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamName;
                    } else if (isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamDupe;
                    }
                }
                params.push(param);
                paramSet[param.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        strict = previousStrict;
        return {
            type: Syntax.FunctionExpression,
            id: id,
            params: params,
            body: body
        };
    }
    function parseSourceElement() {
        var token = lookahead();
        if (token.type === Token.Keyword) {
            switch (token.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(token.value);
            case 'function':
                return parseFunctionDeclaration();
            default:
                return parseStatement();
            }
        }
        if (token.type !== Token.EOF) {
            return parseStatement();
        }
    }
    function parseSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted;
        while (index < length) {
            token = lookahead();
            if (token.type !== Token.StringLiteral) {
                break;
            }
            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                break;
            }
            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwError(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }
        while (index < length) {
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }
        return sourceElements;
    }
    function parseProgram() {
        var program;
        strict = false;
        program = {
            type: Syntax.Program,
            body: parseSourceElements()
        };
        return program;
    }
    function addComment(start, end, type, value) {
        assert(typeof start === 'number', 'Comment must have valid position');
        if (extra.comments.length > 0) {
            if (extra.comments[extra.comments.length - 1].range[1] > start) {
                return;
            }
        }
        extra.comments.push({
            range: [
                start,
                end
            ],
            type: type,
            value: value
        });
    }
    function scanComment() {
        var comment, ch, start, blockComment, lineComment;
        comment = '';
        blockComment = false;
        lineComment = false;
        while (index < length) {
            ch = source[index];
            if (lineComment) {
                ch = nextChar();
                if (index >= length) {
                    lineComment = false;
                    comment += ch;
                    addComment(start, index, 'Line', comment);
                } else if (isLineTerminator(ch)) {
                    lineComment = false;
                    addComment(start, index, 'Line', comment);
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                    comment = '';
                } else {
                    comment += ch;
                }
            } else if (blockComment) {
                if (isLineTerminator(ch)) {
                    if (ch === '\r' && source[index + 1] === '\n') {
                        ++index;
                        comment += '\r\n';
                    } else {
                        comment += ch;
                    }
                    ++lineNumber;
                    ++index;
                    lineStart = index;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch = nextChar();
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    comment += ch;
                    if (ch === '*') {
                        ch = source[index];
                        if (ch === '/') {
                            comment = comment.substr(0, comment.length - 1);
                            blockComment = false;
                            ++index;
                            addComment(start, index, 'Block', comment);
                            comment = '';
                        }
                    }
                }
            } else if (ch === '/') {
                ch = source[index + 1];
                if (ch === '/') {
                    start = index;
                    index += 2;
                    lineComment = true;
                } else if (ch === '*') {
                    start = index;
                    index += 2;
                    blockComment = true;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch === '\r' && source[index] === '\n') {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else {
                break;
            }
        }
    }
    function collectToken() {
        var token = extra.advance(), range, value;
        if (token.type !== Token.EOF) {
            range = [
                token.range[0],
                token.range[1]
            ];
            value = sliceSource(token.range[0], token.range[1]);
            extra.tokens.push({
                type: TokenName[token.type],
                value: value,
                range: range
            });
        }
        return token;
    }
    function collectRegex() {
        var pos, regex, token;
        skipComment();
        pos = index;
        regex = extra.scanRegExp();
        if (extra.tokens.length > 0) {
            token = extra.tokens[extra.tokens.length - 1];
            if (token.range[0] === pos && token.type === 'Punctuator') {
                if (token.value === '/' || token.value === '/=') {
                    extra.tokens.pop();
                }
            }
        }
        extra.tokens.push({
            type: 'RegularExpression',
            value: regex.literal,
            range: [
                pos,
                index
            ]
        });
        return regex;
    }
    function createLiteral(token) {
        if (Array.isArray(token)) {
            return {
                type: Syntax.Literal,
                value: token
            };
        }
        return {
            type: Syntax.Literal,
            value: token.value
        };
    }
    function createRawLiteral(token) {
        return {
            type: Syntax.Literal,
            value: token.value,
            raw: sliceSource(token.range[0], token.range[1])
        };
    }
    function wrapTrackingFunction(range, loc) {
        return function (parseFunction) {
            function isBinary(node) {
                return node.type === Syntax.LogicalExpression || node.type === Syntax.BinaryExpression;
            }
            function visit(node) {
                if (isBinary(node.left)) {
                    visit(node.left);
                }
                if (isBinary(node.right)) {
                    visit(node.right);
                }
                if (range && typeof node.range === 'undefined') {
                    node.range = [
                        node.left.range[0],
                        node.right.range[1]
                    ];
                }
                if (loc && typeof node.loc === 'undefined') {
                    node.loc = {
                        start: node.left.loc.start,
                        end: node.right.loc.end
                    };
                }
            }
            return function () {
                var node, rangeInfo, locInfo;
                var curr = tokenStream[index];
                rangeInfo = [
                    curr.range[0],
                    0
                ];
                locInfo = {
                    start: {
                        line: curr.lineNumber,
                        column: curr.lineStart
                    }
                };
                node = parseFunction.apply(null, arguments);
                if (typeof node !== 'undefined') {
                    var last = tokenStream[index];
                    if (range) {
                        rangeInfo[1] = last.range[1];
                        node.range = rangeInfo;
                    }
                    if (loc) {
                        locInfo.end = {
                            line: last.lineNumber,
                            column: last.lineStart
                        };
                        node.loc = locInfo;
                    }
                    if (isBinary(node)) {
                        visit(node);
                    }
                    if (node.type === Syntax.MemberExpression) {
                        if (typeof node.object.range !== 'undefined') {
                            node.range[0] = node.object.range[0];
                        }
                        if (typeof node.object.loc !== 'undefined') {
                            node.loc.start = node.object.loc.start;
                        }
                    }
                    if (node.type === Syntax.CallExpression) {
                        if (typeof node.callee.range !== 'undefined') {
                            node.range[0] = node.callee.range[0];
                        }
                        if (typeof node.callee.loc !== 'undefined') {
                            node.loc.start = node.callee.loc.start;
                        }
                    }
                    return node;
                }
            };
        };
    }
    function patch() {
        var wrapTracking;
        if (extra.comments) {
            extra.skipComment = skipComment;
            skipComment = scanComment;
        }
        if (extra.raw) {
            extra.createLiteral = createLiteral;
            createLiteral = createRawLiteral;
        }
        if (extra.range || extra.loc) {
            wrapTracking = wrapTrackingFunction(extra.range, extra.loc);
            extra.parseAdditiveExpression = parseAdditiveExpression;
            extra.parseAssignmentExpression = parseAssignmentExpression;
            extra.parseBitwiseANDExpression = parseBitwiseANDExpression;
            extra.parseBitwiseORExpression = parseBitwiseORExpression;
            extra.parseBitwiseXORExpression = parseBitwiseXORExpression;
            extra.parseBlock = parseBlock;
            extra.parseFunctionSourceElements = parseFunctionSourceElements;
            extra.parseCallMember = parseCallMember;
            extra.parseCatchClause = parseCatchClause;
            extra.parseComputedMember = parseComputedMember;
            extra.parseConditionalExpression = parseConditionalExpression;
            extra.parseConstLetDeclaration = parseConstLetDeclaration;
            extra.parseEqualityExpression = parseEqualityExpression;
            extra.parseExpression = parseExpression;
            extra.parseForVariableDeclaration = parseForVariableDeclaration;
            extra.parseFunctionDeclaration = parseFunctionDeclaration;
            extra.parseFunctionExpression = parseFunctionExpression;
            extra.parseLogicalANDExpression = parseLogicalANDExpression;
            extra.parseLogicalORExpression = parseLogicalORExpression;
            extra.parseMultiplicativeExpression = parseMultiplicativeExpression;
            extra.parseNewExpression = parseNewExpression;
            extra.parseNonComputedMember = parseNonComputedMember;
            extra.parseNonComputedProperty = parseNonComputedProperty;
            extra.parseObjectProperty = parseObjectProperty;
            extra.parseObjectPropertyKey = parseObjectPropertyKey;
            extra.parsePostfixExpression = parsePostfixExpression;
            extra.parsePrimaryExpression = parsePrimaryExpression;
            extra.parseProgram = parseProgram;
            extra.parsePropertyFunction = parsePropertyFunction;
            extra.parseRelationalExpression = parseRelationalExpression;
            extra.parseStatement = parseStatement;
            extra.parseShiftExpression = parseShiftExpression;
            extra.parseSwitchCase = parseSwitchCase;
            extra.parseUnaryExpression = parseUnaryExpression;
            extra.parseVariableDeclaration = parseVariableDeclaration;
            extra.parseVariableIdentifier = parseVariableIdentifier;
            parseAdditiveExpression = wrapTracking(extra.parseAdditiveExpression);
            parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
            parseBitwiseANDExpression = wrapTracking(extra.parseBitwiseANDExpression);
            parseBitwiseORExpression = wrapTracking(extra.parseBitwiseORExpression);
            parseBitwiseXORExpression = wrapTracking(extra.parseBitwiseXORExpression);
            parseBlock = wrapTracking(extra.parseBlock);
            parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
            parseCallMember = wrapTracking(extra.parseCallMember);
            parseCatchClause = wrapTracking(extra.parseCatchClause);
            parseComputedMember = wrapTracking(extra.parseComputedMember);
            parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
            parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
            parseEqualityExpression = wrapTracking(extra.parseEqualityExpression);
            parseExpression = wrapTracking(extra.parseExpression);
            parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
            parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
            parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
            parseLogicalANDExpression = wrapTracking(extra.parseLogicalANDExpression);
            parseLogicalORExpression = wrapTracking(extra.parseLogicalORExpression);
            parseMultiplicativeExpression = wrapTracking(extra.parseMultiplicativeExpression);
            parseNewExpression = wrapTracking(extra.parseNewExpression);
            parseNonComputedMember = wrapTracking(extra.parseNonComputedMember);
            parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
            parseObjectProperty = wrapTracking(extra.parseObjectProperty);
            parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
            parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
            parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
            parseProgram = wrapTracking(extra.parseProgram);
            parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
            parseRelationalExpression = wrapTracking(extra.parseRelationalExpression);
            parseStatement = wrapTracking(extra.parseStatement);
            parseShiftExpression = wrapTracking(extra.parseShiftExpression);
            parseSwitchCase = wrapTracking(extra.parseSwitchCase);
            parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
            parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
            parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
        }
        if (typeof extra.tokens !== 'undefined') {
            extra.advance = advance;
            extra.scanRegExp = scanRegExp;
            advance = collectToken;
            scanRegExp = collectRegex;
        }
    }
    function unpatch() {
        if (typeof extra.skipComment === 'function') {
            skipComment = extra.skipComment;
        }
        if (extra.raw) {
            createLiteral = extra.createLiteral;
        }
        if (extra.range || extra.loc) {
            parseAdditiveExpression = extra.parseAdditiveExpression;
            parseAssignmentExpression = extra.parseAssignmentExpression;
            parseBitwiseANDExpression = extra.parseBitwiseANDExpression;
            parseBitwiseORExpression = extra.parseBitwiseORExpression;
            parseBitwiseXORExpression = extra.parseBitwiseXORExpression;
            parseBlock = extra.parseBlock;
            parseFunctionSourceElements = extra.parseFunctionSourceElements;
            parseCallMember = extra.parseCallMember;
            parseCatchClause = extra.parseCatchClause;
            parseComputedMember = extra.parseComputedMember;
            parseConditionalExpression = extra.parseConditionalExpression;
            parseConstLetDeclaration = extra.parseConstLetDeclaration;
            parseEqualityExpression = extra.parseEqualityExpression;
            parseExpression = extra.parseExpression;
            parseForVariableDeclaration = extra.parseForVariableDeclaration;
            parseFunctionDeclaration = extra.parseFunctionDeclaration;
            parseFunctionExpression = extra.parseFunctionExpression;
            parseLogicalANDExpression = extra.parseLogicalANDExpression;
            parseLogicalORExpression = extra.parseLogicalORExpression;
            parseMultiplicativeExpression = extra.parseMultiplicativeExpression;
            parseNewExpression = extra.parseNewExpression;
            parseNonComputedMember = extra.parseNonComputedMember;
            parseNonComputedProperty = extra.parseNonComputedProperty;
            parseObjectProperty = extra.parseObjectProperty;
            parseObjectPropertyKey = extra.parseObjectPropertyKey;
            parsePrimaryExpression = extra.parsePrimaryExpression;
            parsePostfixExpression = extra.parsePostfixExpression;
            parseProgram = extra.parseProgram;
            parsePropertyFunction = extra.parsePropertyFunction;
            parseRelationalExpression = extra.parseRelationalExpression;
            parseStatement = extra.parseStatement;
            parseShiftExpression = extra.parseShiftExpression;
            parseSwitchCase = extra.parseSwitchCase;
            parseUnaryExpression = extra.parseUnaryExpression;
            parseVariableDeclaration = extra.parseVariableDeclaration;
            parseVariableIdentifier = extra.parseVariableIdentifier;
        }
        if (typeof extra.scanRegExp === 'function') {
            advance = extra.advance;
            scanRegExp = extra.scanRegExp;
        }
    }
    function stringToArray(str) {
        var length = str.length, result = [], i;
        for (i = 0; i < length; ++i) {
            result[i] = str.charAt(i);
        }
        return result;
    }
    var CToken = object({
            value: opt(or(Str, Num)),
            type: opt(Num)
        });
    var CPattern = object({
            type: Str,
            name: Str,
            inner: opt(arr([
                Any
            ]))
        });
    function mkStreamContract(C) {
        return object({
            curr: fun(Undefined, or(Null, C)),
            peek: fun(opt(Num), or(Null, C)),
            back: fun(opt(Num), or(Null, C)),
            next: fun(Undefined, or(Null, C)),
            rest: fun(Undefined, arr([
                ___(C)
            ]))
        });
    }
    var CStream = mkStreamContract(Any);
    var CTokenStream = mkStreamContract(CToken);
    var CPatternStream = mkStreamContract(CPattern);
    var CMacroDef = object({
            pattern: Any,
            body: Any
        });
    var _makeStream = function () {
            var streamObj = {
                    EOS: null,
                    curr: function () {
                        if (this._index >= this._length) {
                            return this.EOS;
                        } else {
                            return this._tokens[this._index];
                        }
                    },
                    peek: function (n) {
                        var lookahead = n || 1;
                        if (this._index + lookahead >= this._length) {
                            return this.EOS;
                        } else {
                            return this._tokens[this._index + lookahead];
                        }
                    },
                    back: function (n) {
                        var lookback = n || 1;
                        if (this._index - lookback >= this._length) {
                            return this.EOS;
                        } else {
                            return this._tokens[this._index - lookback];
                        }
                    },
                    next: function () {
                        if (this._index >= this._length) {
                            return this.EOS;
                        } else {
                            return this._tokens[this._index++];
                        }
                    },
                    rest: function () {
                        return this._tokens.slice(this._index);
                    }
                };
            return function (tokens) {
                return Object.create(streamObj, {
                    _tokens: {
                        value: tokens,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    },
                    _index: {
                        value: 0,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    },
                    _length: {
                        value: tokens.length,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    }
                });
            };
        }();
    var mkStream = guard(fun(arr([
            ___(Any)
        ]), CStream), _makeStream);
    var isPatternVar = guard(fun(CToken, Bool), function isPatternVar(val) {
            return val.type === Token.Identifier && val.value[0] === '$';
        });
    var loadPattern = guard(fun(CTokenStream, CPatternStream), function loadPattern(tokens) {
            var res = [];
            console.log(tokens);
            var token = tokens.next();
            while (token) {
                if (isPatternVar(token)) {
                    if (tokens.peek() && tokens.peek().value === ':') {
                        tokens.next();
                        res.push({
                            type: parseType.value,
                            name: tokens.next().value
                        });
                    } else {
                        res.push({
                            type: 'ident',
                            name: token.value
                        });
                    }
                } else if (token.value === '()') {
                    res.push({
                        type: '()',
                        name: '()',
                        inner: loadPattern(mkStream(token.inner))
                    });
                } else {
                    res.push({
                        type: 'pattern_literal',
                        name: token.value
                    });
                }
                token = tokens.next();
            }
            return mkStream(res);
        });
    var loadMacroDef = guard(fun([
            arr([
                ___(CToken)
            ])
        ], CMacroDef), function loadMacroDef(body) {
            assert(body[0].value === 'case', 'case pattern does not have `case` keyword');
            var casePattern = mkStream(body[1].inner);
            assert(body[2].value === '=', 'case pattern does not have `=>` token');
            assert(body[3].value === '>', 'case pattern does not have `=>` token');
            var caseBody = mkStream(body[4]);
            return {
                pattern: loadPattern(casePattern),
                body: caseBody
            };
        });
    var flatten = guard(fun(arr([
            ___(CToken)
        ]), arr([
            ___(CToken)
        ])), function flatten(tokens) {
            var flat = [];
            if (typeof tokens === 'undefined' || !Array.isArray(tokens.inner)) {
                return [];
            }
            tokens.inner.forEach(function (tok) {
                if (tok.value === '{}' || tok.value === '()' || tok.value === '[]') {
                    flat.push({
                        type: Token.Punctuator,
                        value: tok.value[0],
                        range: tok.startRange,
                        lineNumber: tok.startLineNumber,
                        lineStart: tok.startLineStart
                    });
                    flat.concat(flatten(tok.inner));
                    flat.push({
                        type: Token.Punctuator,
                        value: tok.value[1],
                        range: tok.endRange,
                        lineNumber: tok.endLineNumber,
                        lineStart: tok.endLineStart
                    });
                } else {
                    flat.push(tok);
                }
            });
            return flat;
        });
    var matchPatterns = guard(fun([
            arr([
                ___(CToken)
            ]),
            arr([
                ___(CPattern)
            ])
        ], arr([
            object({
                pattern: CPattern,
                tokens: arr([
                    ___(CToken)
                ])
            })
        ])), function matchPatterns(callTokens, patterns) {
            var matches = [];
            var tmp = callTokens.slice(0);
            tmp.push({
                type: Token.EOF
            });
            var stream = mkStream(tmp);
            console.log(patterns);
            patterns.forEach(function (pattern) {
                if (pattern.type === Token.Pattern) {
                    var tmp = parse_stx(stream.rest(), pattern.parseType, {
                            tokens: true
                        }).tokens;
                    tmp.pop();
                    matches.push({
                        pattern: pattern,
                        tokens: tmp
                    });
                } else {
                    var nextToken = stream.next();
                    if (nextToken.value === '()' && pattern.value === '()') {
                        var tokInner = nextToken.inner.slice(0);
                        var patInner = pattern.inner;
                        tokInner.push({
                            type: Token.EOF
                        });
                        tmp = parse_stx(tokInner, patInner[0].parseType, {
                            tokens: true
                        }).tokens;
                        tmp.pop();
                        matches.push({
                            pattern: patInner[0],
                            tokens: tmp
                        });
                    } else if (nextToken.value !== pattern.value) {
                        console.log(pattern);
                        throw 'did not match expected pattern';
                    }
                }
            });
            return matches;
        });
    var invokeMacro = guard(fun([
            arr([
                ___(CToken)
            ]),
            CMacroDef
        ], arr([
            ___(CToken)
        ])), function invokeMacro(callArgs, macroDefinition) {
            var patterns = macroDefinition.pattern;
            var matches = matchPatterns(callArgs, patterns);
            return [
                callArgs[0].inner[0]
            ];
        });
    function expand(tokens, macros) {
        var index = 0;
        var expanded = [];
        macros = macros || {};
        if (typeof tokens === 'undefined') {
            return [];
        }
        while (index < tokens.length) {
            var token = tokens[index++];
            if (token.type === Token.Identifier && token.value === 'macro') {
                var macroName = tokens[index++].value;
                var macroType = tokens[index++];
                var macroBody = tokens[index++];
                var trans = loadMacroDef(macroBody.inner, macros);
                assert(macroBody.value === '{}', 'expecting a macro body');
                macros[macroName] = {
                    type: macroType.value,
                    transformer: trans
                };
            } else if (token.type === Token.Identifier && macros.hasOwnProperty(token.value)) {
                var callArgs = tokens[index++];
                assert(callArgs.value === '()', 'expecting delimiters around macro call');
                expanded = expanded.concat(invokeMacro(callArgs.inner, macros[token.value].transformer));
            } else if (token.type === Token.Delimiter && (token.value === '{}' || token.value === '()' || token.value === '[]')) {
                expanded.push({
                    type: Token.Punctuator,
                    value: token.value[0],
                    range: token.startRange,
                    lineNumber: token.startLineNumber,
                    lineStart: token.startLineStart
                });
                expanded = expanded.concat(expand(token.inner, macros));
                expanded.push({
                    type: Token.Punctuator,
                    value: token.value[1],
                    range: token.endRange,
                    lineNumber: token.endLineNumber,
                    lineStart: token.endLineStart
                });
            } else {
                expanded.push(token);
            }
        }
        return expanded;
    }
    function readLoop(toks, inExprDelim) {
        var delimiters = [
                '(',
                '{',
                '['
            ];
        var parenIdents = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last = toks.length - 1;
        var fnExprTokens = [
                '(',
                '{',
                '[',
                'in',
                'typeof',
                'instanceof',
                'new',
                'return',
                'case',
                'delete',
                'throw',
                'void',
                '=',
                '+=',
                '-=',
                '*=',
                '/=',
                '%=',
                '<<=',
                '>>=',
                '>>>=',
                '&=',
                '|=',
                '^=',
                ',',
                '+',
                '-',
                '*',
                '/',
                '%',
                '++',
                '--',
                '<<',
                '>>',
                '>>>',
                '&',
                '|',
                '^',
                '!',
                '~',
                '&&',
                '||',
                '?',
                ':',
                '===',
                '==',
                '>=',
                '<=',
                '<',
                '>',
                '!=',
                '!=='
            ];
        function back(n) {
            var idx = toks.length - n > 0 ? toks.length - n : 0;
            return toks[idx];
        }
        skipComment();
        if (isIn(getChar(), delimiters)) {
            return readDelim();
        } else if (getChar() === '/') {
            var prev = back(1);
            if (prev) {
                if (prev.value === '()') {
                    if (isIn(back(2).value, parenIdents)) {
                        return scanRegExp();
                    } else {
                        return advance();
                    }
                } else if (prev.value === '{}') {
                    if (back(4).value === 'function' && isIn(back(5).value, fnExprTokens)) {
                        return advance();
                    } else if (back(4).value === 'function' && toks.length - 5 <= 0 && inExprDelim) {
                        return advance();
                    } else {
                        return scanRegExp();
                    }
                } else if (prev.type === Token.Punctuator) {
                    return scanRegExp();
                } else if (isKeyword(toks[toks.length - 1].value)) {
                    return scanRegExp();
                } else {
                    return advance();
                }
            } else {
                return scanRegExp();
            }
        } else {
            return advance();
        }
    }
    function readDelim() {
        var startDelim = advance(), matchDelim = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner = [];
        var delimiters = [
                '(',
                '{',
                '['
            ];
        var token = startDelim;
        assert(delimiters.indexOf(startDelim.value) !== -1, 'Need to begin at the delimiter');
        var startLineNumber = token.lineNumber;
        var startLineStart = token.lineStart;
        var startRange = token.range;
        while (index <= length) {
            token = readLoop(inner, startDelim.value === '(' || startDelim.value === '[');
            if (token.type === Token.Punctuator && token.value === matchDelim[startDelim.value]) {
                break;
            } else {
                inner.push(token);
            }
        }
        if (index >= length && matchDelim[startDelim.value] !== source[length - 1]) {
            throwError({}, Messages.UnexpectedEOS);
        }
        var endLineNumber = token.lineNumber;
        var endLineStart = token.lineStart;
        var endRange = token.range;
        return {
            type: Token.Delimiter,
            value: startDelim.value + matchDelim[startDelim.value],
            inner: inner,
            startLineNumber: startLineNumber,
            startLineStart: startLineStart,
            startRange: startRange,
            endLineNumber: endLineNumber,
            endLineStart: endLineStart,
            endRange: endRange
        };
    }
    ;
    function read(code) {
        var token, tokenTree = [];
        source = code;
        index = 0;
        lineNumber = source.length > 0 ? 1 : 0;
        lineStart = 0;
        length = source.length;
        buffer = null;
        state = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index < length) {
            tokenTree.push(readLoop(tokenTree));
        }
        var last = tokenTree[tokenTree.length - 1];
        if (last && last.type !== Token.EOF) {
            tokenTree.push({
                type: Token.EOF,
                lineNumber: last.lineNumber,
                lineStart: last.lineStart,
                range: [
                    index,
                    index
                ]
            });
        }
        return tokenTree;
    }
    function parse_stx(code, nodeType, options) {
        var program, toString;
        tokenStream = code;
        nodeType = nodeType || 'base';
        index = 0;
        length = tokenStream.length;
        buffer = null;
        state = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra = {};
        if (typeof options !== 'undefined') {
            if (options.range || options.loc) {
                assert(false, 'Not range and loc is not currently implemented');
            }
            extra.range = typeof options.range === 'boolean' && options.range;
            extra.loc = typeof options.loc === 'boolean' && options.loc;
            extra.raw = typeof options.raw === 'boolean' && options.raw;
            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
        }
        patch();
        try {
            if (nodeType === 'base') {
                program = parseProgram();
            } else if (nodeType === 'expression') {
                program = parseExpression();
            } else if (nodeType === 'lit') {
                program = parsePrimaryExpression();
            }
            if (typeof extra.comments !== 'undefined') {
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                program.tokens = tokenStream;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            unpatch();
            extra = {};
        }
        return program;
    }
    function parse(code, options) {
        var program, toString;
        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }
        var source = code;
        if (source.length > 0) {
            if (typeof source[0] === 'undefined') {
                if (code instanceof String) {
                    source = code.valueOf();
                }
                if (typeof source[0] === 'undefined') {
                    source = stringToArray(code);
                }
            }
        }
        var macroDefs = {};
        var tokenStream = expand(read(source), macroDefs);
        return parse_stx(tokenStream, 'base', options);
    }
    exports.version = '1.0.0-dev';
    exports.parse = parse;
    exports.read = read;
    exports.expand = expand;
    exports.Syntax = function () {
        var name, types = {};
        if (typeof Object.create === 'function') {
            types = Object.create(null);
        }
        for (name in Syntax) {
            if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types);
        }
        return types;
    }();
}(typeof exports === 'undefined' ? esprima = {} : exports));
});

require.define("/node_modules/escodegen/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"escodegen.js"}
});

require.define("/node_modules/escodegen/escodegen.js",function(require,module,exports,__dirname,__filename,process){/*
  Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>
  Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint bitwise:true */
/*global escodegen:true, exports:true, generateStatement: true*/

(function (exports) {
    'use strict';

    var Syntax,
        Precedence,
        BinaryPrecedence,
        Regex,
        VisitorKeys,
        VisitorOption,
        isArray,
        base,
        indent,
        json,
        renumber,
        hexadecimal,
        quotes,
        escapeless,
        newline,
        space,
        parentheses,
        extra,
        parse;

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    Precedence = {
        Sequence: 0,
        Assignment: 1,
        Conditional: 2,
        LogicalOR: 3,
        LogicalAND: 4,
        BitwiseOR: 5,
        BitwiseXOR: 6,
        BitwiseAND: 7,
        Equality: 8,
        Relational: 9,
        BitwiseSHIFT: 10,
        Additive: 11,
        Multiplicative: 12,
        Unary: 13,
        Postfix: 14,
        Call: 15,
        New: 16,
        Member: 17,
        Primary: 18
    };

    BinaryPrecedence = {
        '||': Precedence.LogicalOR,
        '&&': Precedence.LogicalAND,
        '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR,
        '&': Precedence.BitwiseAND,
        '==': Precedence.Equality,
        '!=': Precedence.Equality,
        '===': Precedence.Equality,
        '!==': Precedence.Equality,
        '<': Precedence.Relational,
        '>': Precedence.Relational,
        '<=': Precedence.Relational,
        '>=': Precedence.Relational,
        'in': Precedence.Relational,
        'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT,
        '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive,
        '-': Precedence.Additive,
        '*': Precedence.Multiplicative,
        '%': Precedence.Multiplicative,
        '/': Precedence.Multiplicative
    };

    Regex = {
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };

    function getDefaultOptions() {
        // default options
        return {
            indent: null,
            base: null,
            parse: null,
            comment: false,
            format: {
                indent: {
                    style: '    ',
                    base: 0,
                    adjustMultilineComment: false
                },
                json: false,
                renumber: false,
                hexadecimal: false,
                quotes: 'single',
                escapeless: false,
                compact: false,
                parentheses: true
            }
        };
    }

    function stringToArray(str) {
        var length = str.length,
            result = [],
            i;
        for (i = 0; i < length; i += 1) {
            result[i] = str.charAt(i);
        }
        return result;
    }

    function stringRepeat(str, num) {
        var result = '';

        for (num |= 0; num > 0; num >>>= 1, str += str) {
            if (num & 1) {
                result += str;
            }
        }

        return result;
    }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    function endsWithLineTerminator(str) {
        var len, ch;
        len = str.length;
        ch = str.charAt(len - 1);
        return ch === '\r' || ch === '\n';
    }

    function shallowCopy(obj) {
        var ret = {}, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }

    function deepCopy(obj) {
        var ret = {}, key, val;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                val = obj[key];
                if (typeof val === 'object' && val !== null) {
                    ret[key] = deepCopy(val);
                } else {
                    ret[key] = val;
                }
            }
        }
        return ret;
    }

    function updateDeeply(target, override) {
        var key, val;

        function isHashObject(target) {
            return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
        }

        for (key in override) {
            if (override.hasOwnProperty(key)) {
                val = override[key];
                if (isHashObject(val)) {
                    if (isHashObject(target[key])) {
                        updateDeeply(target[key], val);
                    } else {
                        target[key] = updateDeeply({}, val);
                    }
                } else {
                    target[key] = val;
                }
            }
        }
        return target;
    }

    function generateNumber(value) {
        var result, point, temp, exponent, pos;

        if (value !== value) {
            throw new Error('Numeric literal whose value is NaN');
        }
        if (1 / value < 0) {
            throw new Error('Numeric literal whose value is negative');
        }

        if (value === 1 / 0) {
            return json ? 'null' : renumber ? '1e400' : '1e+400';
        }

        result = '' + value;
        if (!renumber || result.length < 3) {
            return result;
        }

        point = result.indexOf('.');
        if (!json && result.charAt(0) === '0' && point === 1) {
            point = 0;
            result = result.slice(1);
        }
        temp = result;
        result = result.replace('e+', 'e');
        exponent = 0;
        if ((pos = temp.indexOf('e')) > 0) {
            exponent = +temp.slice(pos + 1);
            temp = temp.slice(0, pos);
        }
        if (point >= 0) {
            exponent -= temp.length - point - 1;
            temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
        }
        pos = 0;
        while (temp.charAt(temp.length + pos - 1) === '0') {
            pos -= 1;
        }
        if (pos !== 0) {
            exponent -= pos;
            temp = temp.slice(0, pos);
        }
        if (exponent !== 0) {
            temp += 'e' + exponent;
        }
        if ((temp.length < result.length ||
                    (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) &&
                +temp === value) {
            result = temp;
        }

        return result;
    }

    function escapeAllowedCharacter(ch, next) {
        var code = ch.charCodeAt(0), hex = code.toString(16), result = '\\';

        switch (ch) {
        case '\b':
            result += 'b';
            break;
        case '\f':
            result += 'f';
            break;
        case '\t':
            result += 't';
            break;
        default:
            if (json || code > 0xff) {
                result += 'u' + '0000'.slice(hex.length) + hex;
            } else if (ch === '\u0000' && '0123456789'.indexOf(next) < 0) {
                result += '0';
            } else if (ch === '\v') {
                result += 'v';
            } else {
                result += 'x' + '00'.slice(hex.length) + hex;
            }
            break;
        }

        return result;
    }

    function escapeDisallowedCharacter(ch) {
        var result = '\\';
        switch (ch) {
        case '\\':
            result += '\\';
            break;
        case '\n':
            result += 'n';
            break;
        case '\r':
            result += 'r';
            break;
        case '\u2028':
            result += 'u2028';
            break;
        case '\u2029':
            result += 'u2029';
            break;
        default:
            throw new Error('Incorrectly classified character');
        }

        return result;
    }

    function escapeString(str) {
        var result = '', i, len, ch, next, singleQuotes = 0, doubleQuotes = 0, single;

        if (typeof str[0] === 'undefined') {
            str = stringToArray(str);
        }

        for (i = 0, len = str.length; i < len; i += 1) {
            ch = str[i];
            if (ch === '\'') {
                singleQuotes += 1;
            } else if (ch === '"') {
                doubleQuotes += 1;
            } else if (ch === '/' && json) {
                result += '\\';
            } else if ('\\\n\r\u2028\u2029'.indexOf(ch) >= 0) {
                result += escapeDisallowedCharacter(ch);
                continue;
            } else if ((json && ch < ' ') || !(json || escapeless || (ch >= ' ' && ch <= '~'))) {
                result += escapeAllowedCharacter(ch, str[i + 1]);
                continue;
            }
            result += ch;
        }

        single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
        str = result;
        result = single ? '\'' : '"';

        if (typeof str[0] === 'undefined') {
            str = stringToArray(str);
        }

        for (i = 0, len = str.length; i < len; i += 1) {
            ch = str[i];
            if ((ch === '\'' && single) || (ch === '"' && !single)) {
                result += '\\';
            }
            result += ch;
        }

        return result + (single ? '\'' : '"');
    }

    function isWhiteSpace(ch) {
        return '\t\v\f \xa0'.indexOf(ch) >= 0 || (ch.charCodeAt(0) >= 0x1680 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch) >= 0);
    }

    function isLineTerminator(ch) {
        return '\n\r\u2028\u2029'.indexOf(ch) >= 0;
    }

    function isIdentifierPart(ch) {
        return (ch === '$') || (ch === '_') || (ch === '\\') ||
            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
            ((ch >= '0') && (ch <= '9')) ||
            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierPart.test(ch));
    }

    function join(left, right) {
        var leftChar = left.charAt(left.length - 1),
            rightChar = right.charAt(0);

        if (((leftChar === '+' || leftChar === '-') && leftChar === rightChar) || (isIdentifierPart(leftChar) && isIdentifierPart(rightChar))) {
            return left + ' ' + right;
        } else if (isWhiteSpace(leftChar) || isLineTerminator(leftChar) || isWhiteSpace(rightChar) || isLineTerminator(rightChar)) {
            return left + right;
        }
        return left + space + right;
    }

    function addIndent(stmt) {
        return base + stmt;
    }

    function calculateSpaces(str) {
        var i;
        for (i = str.length - 1; i >= 0; i -= 1) {
            if (isLineTerminator(str.charAt(i))) {
                break;
            }
        }
        return (str.length - 1) - i;
    }

    function adjustMultilineComment(value, specialBase) {
        var array, i, len, line, j, ch, spaces, previousBase;

        array = value.split(/\r\n|[\r\n]/);
        spaces = Number.MAX_VALUE;

        // first line doesn't have indentation
        for (i = 1, len = array.length; i < len; i += 1) {
            line = array[i];
            j = 0;
            while (j < line.length && isWhiteSpace(line[j])) {
                j += 1;
            }
            if (spaces > j) {
                spaces = j;
            }
        }

        if (typeof specialBase !== 'undefined') {
            // pattern like
            // {
            //   var t = 20;  /*
            //                 * this is comment
            //                 */
            // }
            previousBase = base;
            if (array[1][spaces] === '*') {
                specialBase += ' ';
            }
            base = specialBase;
        } else {
            if (spaces % 2 === 1) {
                // /*
                //  *
                //  */
                // If spaces are odd number, above pattern is considered.
                // We waste 1 space.
                spaces -= 1;
            }
            previousBase = base;
        }

        for (i = 1, len = array.length; i < len; i += 1) {
            array[i] = addIndent(array[i].slice(spaces));
        }

        base = previousBase;

        return array.join('\n');
    }

    function generateComment(comment, specialBase) {
        if (comment.type === 'Line') {
            if (endsWithLineTerminator(comment.value)) {
                return '//' + comment.value;
            } else {
                // Always use LineTerminator
                return '//' + comment.value + '\n';
            }
        }
        if (extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) {
            return adjustMultilineComment('/*' + comment.value + '*/', specialBase);
        }
        return '/*' + comment.value + '*/';
    }

    function addCommentsToStatement(stmt, result) {
        var i, len, comment, save, node, tailingToStatement, specialBase, fragment;

        if (stmt.leadingComments) {
            save = result;

            comment = stmt.leadingComments[0];
            result = generateComment(comment);
            if (!endsWithLineTerminator(result)) {
                result += '\n';
            }

            for (i = 1, len = stmt.leadingComments.length; i < len; i += 1) {
                comment = stmt.leadingComments[i];
                fragment = generateComment(comment);
                if (!endsWithLineTerminator(fragment)) {
                    fragment += '\n';
                }
                result += addIndent(fragment);
            }

            result += addIndent(save);
        }

        if (stmt.trailingComments) {
            tailingToStatement = !endsWithLineTerminator(result);
            specialBase = stringRepeat(' ', calculateSpaces(base + result + indent));
            for (i = 0, len = stmt.trailingComments.length; i < len; i += 1) {
                comment = stmt.trailingComments[i];
                if (tailingToStatement) {
                    // We assume target like following script
                    //
                    // var t = 20;  /**
                    //               * This is comment of t
                    //               */
                    if (i === 0) {
                        // first case
                        result += indent;
                    } else {
                        result += specialBase;
                    }
                    result += generateComment(comment, specialBase);
                } else {
                    result += addIndent(generateComment(comment));
                }
                if (i !== len - 1 && !endsWithLineTerminator(result)) {
                    result += '\n';
                }
            }
        }

        return result;
    }

    function parenthesize(text, current, should) {
        if (current < should) {
            return '(' + text + ')';
        }
        return text;
    }

    function maybeBlock(stmt) {
        var previousBase, result, noLeadingComment;

        noLeadingComment = !extra.comment || !stmt.leadingComments;

        if (stmt.type === Syntax.BlockStatement && noLeadingComment) {
            return space + generateStatement(stmt);
        }

        if (stmt.type === Syntax.EmptyStatement && noLeadingComment) {
            return ';';
        }

        previousBase = base;
        base += indent;
        result = newline + addIndent(generateStatement(stmt));
        base = previousBase;

        return result;
    }

    function maybeBlockSuffix(stmt, result) {
        if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !endsWithLineTerminator(result)) {
            return space;
        }
        if (endsWithLineTerminator(result)) {
            return addIndent('');
        }
        return (newline === '' ? ' ' : newline) + addIndent('');
    }

    function generateFunctionBody(node) {
        var result, i, len;
        result = '(';
        for (i = 0, len = node.params.length; i < len; i += 1) {
            result += node.params[i].name;
            if (i + 1 < len) {
                result += ',' + space;
            }
        }
        return result + ')' + maybeBlock(node.body);
    }

    function generateExpression(expr, option) {
        var result, precedence, currentPrecedence, previousBase, i, len, raw, fragment, allowIn, allowCall, allowUnparenthesizedNew;

        precedence = option.precedence;
        allowIn = option.allowIn;
        allowCall = option.allowCall;

        switch (expr.type) {
        case Syntax.SequenceExpression:
            result = '';
            allowIn |= (Precedence.Sequence < precedence);
            for (i = 0, len = expr.expressions.length; i < len; i += 1) {
                result += generateExpression(expr.expressions[i], {
                    precedence: Precedence.Assignment,
                    allowIn: allowIn,
                    allowCall: true
                });
                if (i + 1 < len) {
                    result += ',' + space;
                }
            }
            result = parenthesize(result, Precedence.Sequence, precedence);
            break;

        case Syntax.AssignmentExpression:
            allowIn |= (Precedence.Assignment < precedence);
            result = parenthesize(
                generateExpression(expr.left, {
                    precedence: Precedence.Call,
                    allowIn: allowIn,
                    allowCall: true
                }) + space + expr.operator + space +
                    generateExpression(expr.right, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                Precedence.Assignment,
                precedence
            );
            break;

        case Syntax.ConditionalExpression:
            allowIn |= (Precedence.Conditional < precedence);
            result = parenthesize(
                generateExpression(expr.test, {
                    precedence: Precedence.LogicalOR,
                    allowIn: allowIn,
                    allowCall: true
                }) + space + '?' + space +
                    generateExpression(expr.consequent, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    }) + space + ':' + space +
                    generateExpression(expr.alternate, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                Precedence.Conditional,
                precedence
            );
            break;

        case Syntax.LogicalExpression:
        case Syntax.BinaryExpression:
            currentPrecedence = BinaryPrecedence[expr.operator];

            allowIn |= (currentPrecedence < precedence);

            result = join(
                generateExpression(expr.left, {
                    precedence: currentPrecedence,
                    allowIn: allowIn,
                    allowCall: true
                }),
                expr.operator
            );

            result = join(
                result,
                generateExpression(expr.right, {
                    precedence: currentPrecedence + 1,
                    allowIn: allowIn,
                    allowCall: true
                })
            );

            if (expr.operator === 'in' && !allowIn) {
                result = '(' + result + ')';
            } else {
                result = parenthesize(result, currentPrecedence, precedence);
            }

            break;

        case Syntax.CallExpression:
            result = generateExpression(expr.callee, {
                precedence: Precedence.Call,
                allowIn: true,
                allowCall: true,
                allowUnparenthesizedNew: false
            });

            result += '(';
            for (i = 0, len = expr['arguments'].length; i < len; i += 1) {
                result += generateExpression(expr['arguments'][i], {
                    precedence: Precedence.Assignment,
                    allowIn: true,
                    allowCall: true
                });
                if (i + 1 < len) {
                    result += ',' + space;
                }
            }
            result += ')';

            if (!allowCall) {
                result = '(' + result + ')';
            } else {
                result = parenthesize(result, Precedence.Call, precedence);
            }
            break;

        case Syntax.NewExpression:
            len = expr['arguments'].length;
            allowUnparenthesizedNew = option.allowUnparenthesizedNew === undefined || option.allowUnparenthesizedNew;

            result = join(
                'new',
                generateExpression(expr.callee, {
                    precedence: Precedence.New,
                    allowIn: true,
                    allowCall: false,
                    allowUnparenthesizedNew: allowUnparenthesizedNew && !parentheses && len === 0
                })
            );

            if (!allowUnparenthesizedNew || parentheses || len > 0) {
                result += '(';
                for (i = 0; i < len; i += 1) {
                    result += generateExpression(expr['arguments'][i], {
                        precedence: Precedence.Assignment,
                        allowIn: true,
                        allowCall: true
                    });
                    if (i + 1 < len) {
                        result += ',' + space;
                    }
                }
                result += ')';
            }

            result = parenthesize(result, Precedence.New, precedence);
            break;

        case Syntax.MemberExpression:
            result = generateExpression(expr.object, {
                precedence: Precedence.Call,
                allowIn: true,
                allowCall: allowCall,
                allowUnparenthesizedNew: false
            });

            if (expr.computed) {
                result += '[' + generateExpression(expr.property, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: allowCall
                }) + ']';
            } else {
                if (expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
                    if (result.indexOf('.') < 0) {
                        if (!/[eExX]/.test(result) && !(result.length >= 2 && result[0] === '0')) {
                            result += '.';
                        }
                    }
                }
                result += '.' + expr.property.name;
            }

            result = parenthesize(result, Precedence.Member, precedence);
            break;

        case Syntax.UnaryExpression:
            fragment = generateExpression(expr.argument, {
                precedence: Precedence.Unary + (
                    expr.argument.type === Syntax.UnaryExpression &&
                        expr.operator.length < 3 &&
                        expr.argument.operator === expr.operator ? 1 : 0
                ),
                allowIn: true,
                allowCall: true
            });

            if (space === '') {
                result = join(expr.operator, fragment);
            } else {
                result = expr.operator;
                if (result.length > 2) {
                    result += ' ';
                }
                result += fragment;
            }
            result = parenthesize(result, Precedence.Unary, precedence);
            break;

        case Syntax.UpdateExpression:
            if (expr.prefix) {
                result = parenthesize(
                    expr.operator +
                        generateExpression(expr.argument, {
                            precedence: Precedence.Unary,
                            allowIn: true,
                            allowCall: true
                        }),
                    Precedence.Unary,
                    precedence
                );
            } else {
                result = parenthesize(
                    generateExpression(expr.argument, {
                        precedence: Precedence.Postfix,
                        allowIn: true,
                        allowCall: true
                    }) + expr.operator,
                    Precedence.Postfix,
                    precedence
                );
            }
            break;

        case Syntax.FunctionExpression:
            result = 'function';
            if (expr.id) {
                result += ' ' + expr.id.name;
            } else {
                result += space;
            }
            result += generateFunctionBody(expr);
            break;

        case Syntax.ArrayExpression:
            if (!expr.elements.length) {
                result = '[]';
                break;
            }
            result = '[' + newline;
            previousBase = base;
            base += indent;
            for (i = 0, len = expr.elements.length; i < len; i += 1) {
                if (!expr.elements[i]) {
                    result += addIndent('');
                    if (i + 1 === len) {
                        result += ',';
                    }
                } else {
                    result += addIndent(generateExpression(expr.elements[i], {
                        precedence: Precedence.Assignment,
                        allowIn: true,
                        allowCall: true
                    }));
                }
                if (i + 1 < len) {
                    result += ',' + newline;
                }
            }
            base = previousBase;
            if (!endsWithLineTerminator(result)) {
                result += newline;
            }
            result += addIndent(']');
            break;

        case Syntax.Property:
            if (expr.kind === 'get' || expr.kind === 'set') {
                result = expr.kind + ' ' + generateExpression(expr.key, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                }) + generateFunctionBody(expr.value);
            } else {
                result =
                    generateExpression(expr.key, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }) + ':' + space + generateExpression(expr.value, {
                        precedence: Precedence.Assignment,
                        allowIn: true,
                        allowCall: true
                    });
            }
            break;

        case Syntax.ObjectExpression:
            if (!expr.properties.length) {
                result = '{}';
                break;
            }
            result = '{' + newline;
            previousBase = base;
            base += indent;
            for (i = 0, len = expr.properties.length; i < len; i += 1) {
                result += addIndent(generateExpression(expr.properties[i], {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                }));
                if (i + 1 < len) {
                    result += ',' + newline;
                }
            }
            base = previousBase;
            if (!endsWithLineTerminator(result)) {
                result += newline;
            }
            result += addIndent('}');
            break;

        case Syntax.ThisExpression:
            result = 'this';
            break;

        case Syntax.Identifier:
            result = expr.name;
            break;

        case Syntax.Literal:
            if (expr.hasOwnProperty('raw') && parse) {
                try {
                    raw = parse(expr.raw).body[0].expression;
                    if (raw.type === Syntax.Literal) {
                        if (raw.value === expr.value) {
                            result = expr.raw;
                            break;
                        }
                    }
                } catch (e) {
                    // not use raw property
                }
            }

            if (expr.value === null) {
                result = 'null';
                break;
            }

            if (typeof expr.value === 'string') {
                result = escapeString(expr.value);
                break;
            }

            if (typeof expr.value === 'number') {
                result = generateNumber(expr.value);
                break;
            }

            result = expr.value.toString();
            break;

        default:
            break;
        }

        if (result === undefined) {
            throw new Error('Unknown expression type: ' + expr.type);
        }
        return result;
    }

    function generateStatement(stmt, option) {
        var i, len, result, previousBase, node, allowIn, fragment;

        allowIn = true;
        if (option) {
            allowIn = option.allowIn;
        }

        switch (stmt.type) {
        case Syntax.BlockStatement:
            result = '{' + newline;

            previousBase = base;
            base += indent;
            for (i = 0, len = stmt.body.length; i < len; i += 1) {
                fragment = addIndent(generateStatement(stmt.body[i]));
                result += fragment;
                if (!endsWithLineTerminator(fragment)) {
                    result += newline;
                }
            }
            base = previousBase;

            result += addIndent('}');
            break;

        case Syntax.BreakStatement:
            if (stmt.label) {
                result = 'break ' + stmt.label.name + ';';
            } else {
                result = 'break;';
            }
            break;

        case Syntax.ContinueStatement:
            if (stmt.label) {
                result = 'continue ' + stmt.label.name + ';';
            } else {
                result = 'continue;';
            }
            break;

        case Syntax.DoWhileStatement:
            result = 'do' + maybeBlock(stmt.body);
            result += maybeBlockSuffix(stmt.body, result);
            result += 'while' + space + '(' + generateExpression(stmt.test, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            }) + ');';
            break;

        case Syntax.CatchClause:
            previousBase = base;
            base += indent;
            result = 'catch' + space + '(' + generateExpression(stmt.param, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            }) + ')';
            base = previousBase;
            result += maybeBlock(stmt.body);
            break;

        case Syntax.DebuggerStatement:
            result = 'debugger;';
            break;

        case Syntax.EmptyStatement:
            result = ';';
            break;

        case Syntax.ExpressionStatement:
            result = generateExpression(stmt.expression, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            });
            // 12.4 '{', 'function' is not allowed in this position.
            // wrap expression with parentheses
            if (result.charAt(0) === '{' || (result.slice(0, 8) === 'function' && " (".indexOf(result.charAt(8)) >= 0)) {
                result = '(' + result + ');';
            } else {
                result += ';';
            }
            break;

        case Syntax.VariableDeclarator:
            if (stmt.init) {
                result = stmt.id.name + space + '=' + space + generateExpression(stmt.init, {
                    precedence: Precedence.Assignment,
                    allowIn: allowIn,
                    allowCall: true
                });
            } else {
                result = stmt.id.name;
            }
            break;

        case Syntax.VariableDeclaration:
            result = stmt.kind;
            // special path for
            // var x = function () {
            // };
            if (stmt.declarations.length === 1 && stmt.declarations[0].init &&
                    stmt.declarations[0].init.type === Syntax.FunctionExpression) {
                result += ' ' + generateStatement(stmt.declarations[0], {
                    allowIn: allowIn
                });
            } else {
                // VariableDeclarator is typed as Statement,
                // but joined with comma (not LineTerminator).
                // So if comment is attached to target node, we should specialize.
                previousBase = base;
                base += indent;

                node = stmt.declarations[0];
                if (extra.comment && node.leadingComments) {
                    result += '\n' + addIndent(generateStatement(node, {
                        allowIn: allowIn
                    }));
                } else {
                    result += ' ' + generateStatement(node, {
                        allowIn: allowIn
                    });
                }

                for (i = 1, len = stmt.declarations.length; i < len; i += 1) {
                    node = stmt.declarations[i];
                    if (extra.comment && node.leadingComments) {
                        result += ',' + newline + addIndent(generateStatement(node, {
                            allowIn: allowIn
                        }));
                    } else {
                        result += ',' + space + generateStatement(node, {
                            allowIn: allowIn
                        });
                    }
                }
                base = previousBase;
            }
            result += ';';
            break;

        case Syntax.ThrowStatement:
            result = join(
                'throw',
                generateExpression(stmt.argument, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                })
            ) + ';';
            break;

        case Syntax.TryStatement:
            result = 'try' + maybeBlock(stmt.block);
            result += maybeBlockSuffix(stmt.block, result);
            for (i = 0, len = stmt.handlers.length; i < len; i += 1) {
                result += generateStatement(stmt.handlers[i]);
                if (stmt.finalizer || i + 1 !== len) {
                    result += maybeBlockSuffix(stmt.handlers[i].body, result);
                }
            }
            if (stmt.finalizer) {
                result += 'finally' + maybeBlock(stmt.finalizer);
            }
            break;

        case Syntax.SwitchStatement:
            previousBase = base;
            base += indent;
            result = 'switch' + space + '(' + generateExpression(stmt.discriminant, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            }) + ')' + space + '{' + newline;
            base = previousBase;
            if (stmt.cases) {
                for (i = 0, len = stmt.cases.length; i < len; i += 1) {
                    fragment = addIndent(generateStatement(stmt.cases[i]));
                    result += fragment;
                    if (!endsWithLineTerminator(fragment)) {
                        result += newline;
                    }
                }
            }
            result += addIndent('}');
            break;

        case Syntax.SwitchCase:
            previousBase = base;
            base += indent;
            if (stmt.test) {
                result = join(
                    'case',
                    generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    })
                ) + ':';
            } else {
                result = 'default:';
            }

            i = 0;
            len = stmt.consequent.length;
            if (len && stmt.consequent[0].type === Syntax.BlockStatement) {
                fragment = maybeBlock(stmt.consequent[0]);
                result += fragment;
                i = 1;
            }

            if (i !== len && !endsWithLineTerminator(result)) {
                result += newline;
            }

            for (; i < len; i += 1) {
                fragment = addIndent(generateStatement(stmt.consequent[i]));
                result += fragment;
                if (i + 1 !== len && !endsWithLineTerminator(fragment)) {
                    result += newline;
                }
            }

            base = previousBase;
            break;

        case Syntax.IfStatement:
            previousBase = base;
            base += indent;
            if (stmt.alternate) {
                if (stmt.alternate.type === Syntax.IfStatement) {
                    result = 'if' + space + '(' +  generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }) + ')';
                    base = previousBase;
                    result += maybeBlock(stmt.consequent);
                    result += maybeBlockSuffix(stmt.consequent, result);
                    result += 'else ' + generateStatement(stmt.alternate);
                } else {
                    result = 'if' + space + '(' + generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }) + ')';
                    base = previousBase;
                    result += maybeBlock(stmt.consequent);
                    result += maybeBlockSuffix(stmt.consequent, result);
                    result += 'else';
                    result = join(result, maybeBlock(stmt.alternate));
                }
            } else {
                result = 'if' + space + '(' + generateExpression(stmt.test, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                }) + ')';
                base = previousBase;
                result += maybeBlock(stmt.consequent);
            }
            break;

        case Syntax.ForStatement:
            previousBase = base;
            base += indent;
            result = 'for' + space + '(';
            if (stmt.init) {
                if (stmt.init.type === Syntax.VariableDeclaration) {
                    result += generateStatement(stmt.init, {
                        allowIn: false
                    });
                } else {
                    result += generateExpression(stmt.init, {
                        precedence: Precedence.Sequence,
                        allowIn: false,
                        allowCall: true
                    }) + ';';
                }
            } else {
                result += ';';
            }

            if (stmt.test) {
                result += space + generateExpression(stmt.test, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                }) + ';';
            } else {
                result += ';';
            }

            if (stmt.update) {
                result += space + generateExpression(stmt.update, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                }) + ')';
            } else {
                result += ')';
            }
            base = previousBase;

            result += maybeBlock(stmt.body);
            break;

        case Syntax.ForInStatement:
            result = 'for' + space + '(';
            if (stmt.left.type === Syntax.VariableDeclaration) {
                previousBase = base;
                base += indent + indent;
                result += stmt.left.kind + ' ' + generateStatement(stmt.left.declarations[0], {
                    allowIn: false
                });
                base = previousBase;
            } else {
                previousBase = base;
                base += indent;
                result += generateExpression(stmt.left, {
                    precedence: Precedence.Call,
                    allowIn: true,
                    allowCall: true
                });
                base = previousBase;
            }

            previousBase = base;
            base += indent;
            result = join(result, 'in');
            result = join(
                result,
                generateExpression(stmt.right, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                })
            ) + ')';
            base = previousBase;
            result += maybeBlock(stmt.body);
            break;

        case Syntax.LabeledStatement:
            result = stmt.label.name + ':' + maybeBlock(stmt.body);
            break;

        case Syntax.Program:
            result = '';
            for (i = 0, len = stmt.body.length; i < len; i += 1) {
                fragment = addIndent(generateStatement(stmt.body[i]));
                result += fragment;
                if (i + 1 < len && !endsWithLineTerminator(fragment)) {
                    result += newline;
                }
            }
            break;

        case Syntax.FunctionDeclaration:
            result = 'function' + space;
            if (stmt.id) {
                result += (space === '' ? ' ' : '') + stmt.id.name;
            }
            result += generateFunctionBody(stmt);
            break;

        case Syntax.ReturnStatement:
            if (stmt.argument) {
                result = join(
                    'return',
                    generateExpression(stmt.argument, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    })
                ) + ';';
            } else {
                result = 'return;';
            }
            break;

        case Syntax.WhileStatement:
            previousBase = base;
            base += indent;
            result = 'while' + space + '(' + generateExpression(stmt.test, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            }) + ')';
            base = previousBase;
            result += maybeBlock(stmt.body);
            break;

        case Syntax.WithStatement:
            previousBase = base;
            base += indent;
            result = 'with' + space + '(' + generateExpression(stmt.object, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            }) + ')';
            base = previousBase;
            result += maybeBlock(stmt.body);
            break;

        default:
            break;
        }

        if (result === undefined) {
            throw new Error('Unknown statement type: ' + stmt.type);
        }

        // Attach comments

        if (extra.comment) {
            return addCommentsToStatement(stmt, result);
        }

        return result;
    }

    function generate(node, options) {
        var defaultOptions = getDefaultOptions();

        if (typeof options !== 'undefined') {
            // Obsolete options
            //
            //   `options.indent`
            //   `options.base`
            //
            // Instead of them, we can use `option.format.indent`.
            if (typeof options.indent === 'string') {
                defaultOptions.format.indent.style = options.indent;
            }
            if (typeof options.base === 'number') {
                defaultOptions.format.indent.base = options.base;
            }
            options = updateDeeply(defaultOptions, options);
            indent = options.format.indent.style;
            if (typeof options.base === 'string') {
                base = options.base;
            } else {
                base = stringRepeat(indent, options.format.indent.base);
            }
        } else {
            options = defaultOptions;
            indent = options.format.indent.style;
            base = stringRepeat(indent, options.format.indent.base);
        }
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = json ? false : options.format.hexadecimal;
        quotes = json ? 'double' : options.format.quotes;
        escapeless = options.format.escapeless;
        if (options.format.compact) {
            newline = space = indent = base = '';
        } else {
            newline = '\n';
            space = ' ';
        }
        parentheses = options.format.parentheses;
        parse = json ? null : options.parse;
        extra = options;

        switch (node.type) {
        case Syntax.BlockStatement:
        case Syntax.BreakStatement:
        case Syntax.CatchClause:
        case Syntax.ContinueStatement:
        case Syntax.DoWhileStatement:
        case Syntax.DebuggerStatement:
        case Syntax.EmptyStatement:
        case Syntax.ExpressionStatement:
        case Syntax.ForStatement:
        case Syntax.ForInStatement:
        case Syntax.FunctionDeclaration:
        case Syntax.IfStatement:
        case Syntax.LabeledStatement:
        case Syntax.Program:
        case Syntax.ReturnStatement:
        case Syntax.SwitchStatement:
        case Syntax.SwitchCase:
        case Syntax.ThrowStatement:
        case Syntax.TryStatement:
        case Syntax.VariableDeclaration:
        case Syntax.VariableDeclarator:
        case Syntax.WhileStatement:
        case Syntax.WithStatement:
            return generateStatement(node);

        case Syntax.AssignmentExpression:
        case Syntax.ArrayExpression:
        case Syntax.BinaryExpression:
        case Syntax.CallExpression:
        case Syntax.ConditionalExpression:
        case Syntax.FunctionExpression:
        case Syntax.Identifier:
        case Syntax.Literal:
        case Syntax.LogicalExpression:
        case Syntax.MemberExpression:
        case Syntax.NewExpression:
        case Syntax.ObjectExpression:
        case Syntax.Property:
        case Syntax.SequenceExpression:
        case Syntax.ThisExpression:
        case Syntax.UnaryExpression:
        case Syntax.UpdateExpression:
            return generateExpression(node, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            });

        default:
            break;
        }
        throw new Error('Unknown node type: ' + node.type);
    }

    // simple visitor implementation

    VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        ArrayExpression: ['elements'],
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DoWhileStatement: ['body', 'test'],
        DebuggerStatement: [],
        EmptyStatement: [],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'body'],
        FunctionExpression: ['id', 'params', 'body'],
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SwitchStatement: ['descriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handlers', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body']
    };

    VisitorOption = {
        Break: 1,
        Skip: 2
    };

    function traverse(top, visitor) {
        var worklist, leavelist, node, ret, current, current2, candidates, candidate;

        worklist = [ top ];
        leavelist = [];

        while (worklist.length) {
            node = worklist.pop();

            if (node) {
                if (visitor.enter) {
                    ret = visitor.enter(node);
                } else {
                    ret = undefined;
                }

                if (ret === VisitorOption.Break) {
                    return;
                }

                worklist.push(null);
                leavelist.push(node);

                if (ret !== VisitorOption.Skip) {
                    candidates = VisitorKeys[node.type];
                    current = candidates.length;
                    while ((current -= 1) >= 0) {
                        candidate = node[candidates[current]];
                        if (candidate) {
                            if (isArray(candidate)) {
                                current2 = candidate.length;
                                while ((current2 -= 1) >= 0) {
                                    if (candidate[current2]) {
                                        worklist.push(candidate[current2]);
                                    }
                                }
                            } else {
                                worklist.push(candidate);
                            }
                        }
                    }
                }
            } else {
                node = leavelist.pop();
                if (visitor.leave) {
                    ret = visitor.leave(node);
                } else {
                    ret = undefined;
                }
                if (ret === VisitorOption.Break) {
                    return;
                }
            }
        }
    }


    // based on LLVM libc++ upper_bound / lower_bound
    // MIT License

    function upperBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                len = diff;
            } else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }

    function lowerBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                i = current + 1;
                len -= diff + 1;
            } else {
                len = diff;
            }
        }
        return i;
    }

    function extendCommentRange(comment, tokens) {
        var target, token;

        target = upperBound(tokens, function search(token) {
            return token.range[0] > comment.range[0];
        });

        comment.extendedRange = [comment.range[0], comment.range[1]];

        if (target !== tokens.length) {
            comment.extendedRange[1] = tokens[target].range[0];
        }

        target -= 1;
        if (target >= 0) {
            if (target < tokens.length) {
                comment.extendedRange[0] = tokens[target].range[1];
            } else if (token.length) {
                comment.extendedRange[1] = tokens[tokens.length - 1].range[0];
            }
        }

        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        // At first, we should calculate extended comment ranges.
        var comments = [], comment, len, i;

        if (!tree.range) {
            throw new Error('attachComments needs range information');
        }

        // tokens array is empty, we attach comments to tree as 'leadingComments'
        if (!tokens.length) {
            if (providedComments.length) {
                for (i = 0, len = providedComments.length; i < len; i += 1) {
                    comment = deepCopy(providedComments[i]);
                    comment.extendedRange = [0, tree.range[0]];
                    comments.push(comment);
                }
                tree.leadingComments = comments;
            }
            return tree;
        }

        for (i = 0, len = providedComments.length; i < len; i += 1) {
            comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }

        // This is based on John Freeman's implementation.
        traverse(tree, {
            cursor: 0,
            enter: function (node) {
                var comment;

                while (this.cursor < comments.length) {
                    comment = comments[this.cursor];
                    if (comment.extendedRange[1] > node.range[0]) {
                        break;
                    }

                    if (comment.extendedRange[1] === node.range[0]) {
                        if (!node.leadingComments) {
                            node.leadingComments = [];
                        }
                        node.leadingComments.push(comment);
                        comments.splice(this.cursor, 1);
                    } else {
                        this.cursor += 1;
                    }
                }

                // already out of owned node
                if (this.cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[this.cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        traverse(tree, {
            cursor: 0,
            leave: function (node) {
                var comment;

                while (this.cursor < comments.length) {
                    comment = comments[this.cursor];
                    if (node.range[1] < comment.extendedRange[0]) {
                        break;
                    }

                    if (node.range[1] === comment.extendedRange[0]) {
                        if (!node.trailingComments) {
                            node.trailingComments = [];
                        }
                        node.trailingComments.push(comment);
                        comments.splice(this.cursor, 1);
                    } else {
                        this.cursor += 1;
                    }
                }

                // already out of owned node
                if (this.cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[this.cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        return tree;
    }

    // Sync with package.json.
    exports.version = '0.0.5';

    exports.generate = generate;
    exports.traverse = traverse;
    exports.attachComments = attachComments;

}(typeof exports === 'undefined' ? (escodegen = {}) : exports));
/* vim: set sw=4 ts=4 et tw=80 : */

});

require.define("fs",function(require,module,exports,__dirname,__filename,process){// nothing to see here... no file methods for the browser

});

require.define("/dev/sweet-js/node_modules/contracts.js/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"./lib/contracts.js"}
});

require.define("/dev/sweet-js/node_modules/contracts.js/lib/contracts.js",function(require,module,exports,__dirname,__filename,process){// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)

/**
 * Main function giving a function stack trace with a forced or passed in Error
 *
 * @cfg {Error} e The error to create a stacktrace from (optional)
 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
 * @return {Array} of Strings with functions, lines, files, and arguments where possible
 */
function printStackTrace(options) {
    options = options || {guess: true};
    var ex = options.e || null, guess = !!options.guess;
    var p = new printStackTrace.implementation(), result = p.run(ex);
    return (guess) ? p.guessAnonymousFunctions(result) : result;
}

printStackTrace.implementation = function() {
};

printStackTrace.implementation.prototype = {
    run: function(ex) {
        ex = ex || this.createException();
        // Do not use the stored mode: different exceptions in Chrome
        // may or may not have arguments or stack
        var mode = this.mode(ex);
        // Use either the stored mode, or resolve it
        //var mode = this._mode || this.mode(ex);
        if (mode === 'other') {
            return this.other(arguments.callee);
        } else {
            return this[mode](ex);
        }
    },

    createException: function() {
        try {
            this.undef();
            return null;
        } catch (e) {
            return e;
        }
    },

    /**
     * @return {String} mode of operation for the environment in question.
     */
    mode: function(e) {
        if (e['arguments'] && e.stack) {
            return (this._mode = 'chrome');
        } else if (e.message && typeof window !== 'undefined' && window.opera) {
            return (this._mode = e.stacktrace ? 'opera10' : 'opera');
        } else if (e.stack) {
            return (this._mode = 'firefox');
        }
        return (this._mode = 'other');
    },

    /**
     * Given a context, function name, and callback function, overwrite it so that it calls
     * printStackTrace() first with a callback and then runs the rest of the body.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to instrument
     * @param {Function} function to call with a stack trace on invocation
     */
    instrumentFunction: function(context, functionName, callback) {
        context = context || window;
        var original = context[functionName];
        context[functionName] = function instrumented() {
            callback.call(this, printStackTrace().slice(4));
            return context[functionName]._instrumented.apply(this, arguments);
        };
        context[functionName]._instrumented = original;
    },

    /**
     * Given a context and function name of a function that has been
     * instrumented, revert the function to it's original (non-instrumented)
     * state.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to de-instrument
     */
    deinstrumentFunction: function(context, functionName) {
        if (context[functionName].constructor === Function &&
                context[functionName]._instrumented &&
                context[functionName]._instrumented.constructor === Function) {
            context[functionName] = context[functionName]._instrumented;
        }
    },

    /**
     * Given an Error object, return a formatted Array based on Chrome's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    chrome: function(e) {
        var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
          replace(/^\s+at\s+/gm, '').
          replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
          replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
        stack.pop();
        return stack;
    },

    /**
     * Given an Error object, return a formatted Array based on Firefox's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    firefox: function(e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
    },

    /**
     * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    opera10: function(e) {
        var stack = e.stacktrace;
        var lines = stack.split('\n'), ANON = '{anonymous}', lineRE = /.*line (\d+), column (\d+) in ((<anonymous function\:?\s*(\S+))|([^\(]+)\([^\)]*\))(?: in )?(.*)\s*$/i, i, j, len;
        for (i = 2, j = 0, len = lines.length; i < len - 2; i++) {
            if (lineRE.test(lines[i])) {
                var location = RegExp.$6 + ':' + RegExp.$1 + ':' + RegExp.$2;
                var fnName = RegExp.$3;
                fnName = fnName.replace(/<anonymous function\:?\s?(\S+)?>/g, ANON);
                lines[j++] = fnName + '@' + location;
            }
        }

        lines.splice(j, lines.length - j);
        return lines;
    },

    // Opera 7.x-9.x only!
    opera: function(e) {
        var lines = e.message.split('\n'), ANON = '{anonymous}', lineRE = /Line\s+(\d+).*script\s+(http\S+)(?:.*in\s+function\s+(\S+))?/i, i, j, len;

        for (i = 4, j = 0, len = lines.length; i < len; i += 2) {
            //TODO: RegExp.exec() would probably be cleaner here
            if (lineRE.test(lines[i])) {
                lines[j++] = (RegExp.$3 ? RegExp.$3 + '()@' + RegExp.$2 + RegExp.$1 : ANON + '()@' + RegExp.$2 + ':' + RegExp.$1) + ' -- ' + lines[i + 1].replace(/^\s+/, '');
            }
        }

        lines.splice(j, lines.length - j);
        return lines;
    },

    // Safari, IE, and others
    other: function(curr) {
        var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
        while (curr && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            args = Array.prototype.slice.call(curr['arguments'] || []);
            stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
            curr = curr.caller;
        }
        return stack;
    },

    /**
     * Given arguments array as a String, subsituting type names for non-string types.
     *
     * @param {Arguments} object
     * @return {Array} of Strings with stringified arguments
     */
    stringifyArguments: function(args) {
        var slice = Array.prototype.slice;
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                args[i] = 'undefined';
            } else if (arg === null) {
                args[i] = 'null';
            } else if (arg.constructor) {
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        args[i] = '[' + this.stringifyArguments(arg) + ']';
                    } else {
                        args[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    args[i] = '#object';
                } else if (arg.constructor === Function) {
                    args[i] = '#function';
                } else if (arg.constructor === String) {
                    args[i] = '"' + arg + '"';
                }
            }
        }
        return args.join(',');
    },

    sourceCache: {},

    /**
     * @return the text from a given URL.
     */
    ajax: function(url) {
        var req = this.createXMLHTTPObject();
        if (!req) {
            return;
        }
        req.open('GET', url, false);
        req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
        req.send('');
        return req.responseText;
    },

    /**
     * Try XHR methods in order and store XHR factory.
     *
     * @return <Function> XHR function or equivalent
     */
    createXMLHTTPObject: function() {
        var xmlhttp, XMLHttpFactories = [
            function() {
                return new XMLHttpRequest();
            }, function() {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function() {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }, function() {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        ];
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
                // Use memoization to cache the factory
                this.createXMLHTTPObject = XMLHttpFactories[i];
                return xmlhttp;
            } catch (e) {
            }
        }
    },

    /**
     * Given a URL, check if it is in the same domain (so we can get the source
     * via Ajax).
     *
     * @param url <String> source url
     * @return False if we need a cross-domain request
     */
    isSameDomain: function(url) {
        return url.indexOf(location.hostname) !== -1;
    },

    /**
     * Get source code from given URL if in the same domain.
     *
     * @param url <String> JS source URL
     * @return <Array> Array of source code lines
     */
    getSource: function(url) {
        if (!(url in this.sourceCache)) {
            this.sourceCache[url] = this.ajax(url).split('\n');
        }
        return this.sourceCache[url];
    },

    guessAnonymousFunctions: function(stack) {
        for (var i = 0; i < stack.length; ++i) {
            var reStack = /\{anonymous\}\(.*\)@(\w+:\/\/([\-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/;
            var frame = stack[i], m = reStack.exec(frame);
            if (m) {
                var file = m[1], lineno = m[4], charno = m[7] || 0; //m[7] is character position in Chrome
                if (file && this.isSameDomain(file) && lineno) {
                    var functionName = this.guessAnonymousFunction(file, lineno, charno);
                    stack[i] = frame.replace('{anonymous}', functionName);
                }
            }
        }
        return stack;
    },

    guessAnonymousFunction: function(url, lineNo, charNo) {
        var ret;
        try {
            ret = this.findFunctionName(this.getSource(url), lineNo);
        } catch (e) {
            ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
        }
        return ret;
    },

    findFunctionName: function(source, lineNo) {
        // FIXME findFunctionName fails for compressed source
        // (more than one function on the same line)
        // TODO use captured args
        // function {name}({args}) m[1]=name m[2]=args
        var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
        // {name} = function ({args}) TODO args capture
        // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
        var reFunctionExpression = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/;
        // {name} = eval()
        var reFunctionEvaluation = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
        // Walk backwards in the source lines until we find
        // the line which matches one of the patterns above
        var code = "", line, maxLines = 10, m;
        for (var i = 0; i < maxLines; ++i) {
            // FIXME lineNo is 1-based, source[] is 0-based
            line = source[lineNo - i];
            if (line) {
                code = line + code;
                m = reFunctionExpression.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
                m = reFunctionDeclaration.exec(code);
                if (m && m[1]) {
                    //return m[1] + "(" + (m[2] || "") + ")";
                    return m[1];
                }
                m = reFunctionEvaluation.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
            }
        }
        return '(?)';
    }
};

(function() {
  "use strict";

  /*
  contracts.coffee
  http://disnetdev.com/contracts.coffee
  
  Copyright 2011, Tim Disney
  Released under the MIT License
  */

  var Contract, ModuleName, Unproxy, Utils, and_, any, arr, blame, blameM, check, checkOptions, contract_orig_map, ctor, ctorSafe, enabled, findCallsite, fun, getModName, guard, idHandler, none, not_, object, opt, or_, root, self, unproxy, ___, _blame,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

  root = {};

  enabled = true;

  contract_orig_map = new WeakMap();

  Unproxy = (function() {

    function Unproxy() {
      if (typeof WeakMap !== "undefined" && WeakMap !== null) {
        this.hasWeak = true;
        this.unproxy = new WeakMap();
      } else {
        this.hasWeak = false;
        this.unproxy = [];
      }
    }

    Unproxy.prototype.set = function(p, c) {
      if (this.hasWeak) {
        return this.unproxy.set(p, c);
      } else {
        return this.unproxy.push({
          proxy: p,
          contract: c
        });
      }
    };

    Unproxy.prototype.get = function(p) {
      var pc;
      if (this.hasWeak) {
        if ((p !== null) && typeof p === "object" || typeof p === "function") {
          return this.unproxy.get(p);
        } else {
          return;
        }
      } else {
        pc = this.unproxy.filter(function(el) {
          return p === el.proxy;
        });
        if (pc.length > 1) {
          throw "assumption failed: unproxy object stores multiple unique proxies";
        }
        if (pc.length === 1) {
          return pc[0];
        } else {
          return;
        }
      }
    };

    return Unproxy;

  })();

  unproxy = new Unproxy();

  Utils = {
    getPropertyDescriptor: function(obj, prop) {
      var desc, o;
      o = obj;
      while (o !== null) {
        desc = Object.getOwnPropertyDescriptor(o, prop);
        if (desc !== undefined) {
          return desc;
        }
        o = Object.getPrototypeOf(o);
      }
      return;
    },
    merge: function(o1, o2) {
      var f, o3;
      o3 = {};
      f = function(o) {
        var name, _results;
        _results = [];
        for (name in o) {
          if (o.hasOwnProperty(name)) {
            _results.push(o3[name] = o[name]);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      f(o1);
      f(o2);
      return o3;
    },
    hasNoHoles: function(obj) {
      var i;
      i = 0;
      while (i < obj.length) {
        if (!(i in obj)) {
          return false;
        }
        i++;
      }
      return true;
    },
    zip: function(a1, a2) {
      var i, ret;
      ret = [];
      if (!Array.isArray(a1) || !Array.isArray(a2) || (a1.length !== a2.length)) {
        ret = [];
      } else {
        i = 0;
        while (i < a1.length) {
          ret.push([a1[i], a2[i]]);
          i++;
        }
      }
      return ret;
    }
  };

  checkOptions = function(a, b) {
    var name, pOpt;
    pOpt = true;
    for (name in a) {
      if (a[name] instanceof Contract) {
        if (!a[name].equals(b[name])) {
          pOpt = false;
        }
      } else {
        if (a[name] !== b[name]) {
          pOpt = false;
        }
      }
    }
    for (name in b) {
      if (!(name in a)) {
        pOpt = false;
      }
    }
    return pOpt;
  };

  findCallsite = function(trace) {
    var match, re, t;
    t = trace[0];
    re = /@(.*):(\d*)$/;
    match = re.exec(t);
    if (match) {
      return [match[1], parseInt(match[2], 10)];
    } else {
      return null;
    }
  };

  _blame = function(toblame, other, msg, parents) {
    var callsite, err, m, ps, server, st;
    ps = parents.slice(0);
    server = (toblame.isServer ? toblame : other);
    m = "Contract violation: " + msg + "\n" + "Value guarded in: " + server + " -- blame is on: " + toblame + "\n";
    if (ps) {
      m += "Parent contracts:\n" + ps.reverse().join("\n");
    }
    err = new Error(m);
    st = printStackTrace({
      e: err
    });
    err.cleaned_stacktrace = st;
    callsite = findCallsite(st);
    if (callsite) {
      err.fileName = callsite[0];
      err.lineNumber = callsite[1];
    }
    throw err;
  };

  blame = function(toblame, other, contract, value, parents) {
    var cname, msg;
    cname = contract.cname || contract;
    msg = "expected <" + cname + ">" + ", actual: " + (typeof value === "string" ? "\"" + value + "\"" : value);
    throw _blame(toblame, other, msg, parents);
  };

  blameM = function(toblame, other, msg, parents) {
    return _blame(toblame, other, msg, parents);
  };

  idHandler = function(obj) {
    return {
      getOwnPropertyDescriptor: function(name) {
        var desc;
        desc = Object.getOwnPropertyDescriptor(obj, name);
        if (desc !== void 0) {
          desc.configurable = true;
        }
        return desc;
      },
      getPropertyDescriptor: function(name) {
        var desc;
        desc = Utils.getPropertyDescriptor(obj, name);
        if (desc) {
          desc.configurable = true;
        }
        return desc;
      },
      getOwnPropertyNames: function() {
        return Object.getOwnPropertyNames(obj);
      },
      getPropertyNames: function() {
        return Object.getPropertyNames(obj);
      },
      defineProperty: function(name, desc) {
        return Object.defineProperty(obj, name, desc);
      },
      'delete': function(name) {
        return delete obj[name];
      },
      fix: function() {
        if (Object.isFrozen(obj)) {
          return Object.getOwnPropertyNames(obj).map(function(name) {
            return Object.getOwnPropertyDescriptor(obj, name);
          });
        }
        return;
      },
      has: function(name) {
        return name in obj;
      },
      hasOwn: function(name) {
        return Object.prototype.hasOwnProperty.call(obj, name);
      },
      enumerate: function() {
        var name, result;
        result = [];
        name = void 0;
        for (name in obj) {
          result.push(name);
        }
        return result;
      },
      get: function(receiver, name) {
        return obj[name];
      },
      set: function(receiver, name, val) {
        obj[name] = val;
        return true;
      },
      keys: function() {
        return Object.keys(obj);
      }
    };
  };

  Contract = (function() {

    function Contract(cname, ctype, handler) {
      this.cname = cname;
      this.ctype = ctype;
      this.handler = handler;
      this.parent = null;
    }

    Contract.prototype.check = function(val, pos, neg, parentKs, stack) {
      var c;
      c = unproxy.get(val);
      if (c && c.equals(this)) {
        this.handler(val, pos, neg, parentKs, stack);
        return val;
      } else {
        return this.handler(val, pos, neg, parentKs, stack);
      }
    };

    Contract.prototype.toContract = function() {
      return this;
    };

    Contract.prototype.toString = function() {
      return this.cname;
    };

    Contract.prototype.equals = function(other) {
      throw new Error("Equality checking must be overridden");
    };

    return Contract;

  })();

  ModuleName = (function() {

    function ModuleName(filename, linenum, isServer) {
      this.filename = filename;
      this.linenum = linenum;
      this.isServer = isServer;
    }

    ModuleName.prototype.toString = function() {
      return this.filename + (this.linenum === "" ? "" : ":" + this.linenum);
    };

    return ModuleName;

  })();

  Function.prototype.toContract = function() {
    var name;
    name = "<user defined: " + this.toString() + ">";
    return check(this, name);
  };

  check = function(p, name) {
    var c;
    c = new Contract(name, "check", function(val, pos, neg, parentKs, stack) {
      if (p(val, stack)) {
        return val;
      } else {
        return blame(pos, neg, this, val, parentKs);
      }
    });
    c.equals = function(other) {
      return (this.cname === other.cname) && (this.handler === other.handler);
    };
    return c;
  };

  fun = function(dom, rng, options) {
    var c, callOnly, calldom, callrng, cleanDom, contractName, domName, newOnly, newdom, newrng, optionsName;
    cleanDom = function(dom) {
      if (!Array.isArray(dom)) {
        dom = [dom];
      }
      if (dom.some(function(d) {
        return !(d instanceof Contract);
      })) {
        throw new Error("domain argument to the function contract is not a contract");
      }
      dom.reduce((function(prevWasOpt, curr) {
        if (curr.ctype === "opt") {
          return true;
        } else {
          if (prevWasOpt) {
            throw new Error(("A required domain contract (" + curr + ") followed an ") + "optional domain contract in a function contract");
          } else {
            return false;
          }
        }
      }), false);
      return dom;
    };
    if (dom && dom.call && dom["new"]) {
      calldom = cleanDom(dom.call[0]);
      callrng = dom.call[1];
      newdom = cleanDom(dom["new"][0]);
      newrng = dom["new"][1];
      options = rng || {};
    } else {
      calldom = cleanDom(dom);
      callrng = rng;
      newdom = calldom;
      newrng = callrng;
      options = options || {};
    }
    callOnly = options && options.callOnly;
    newOnly = options && options.newOnly;
    if (callOnly && newOnly) {
      throw new Error("Cannot have a function be both newOnly and newSafe");
    }
    if (newOnly && options["this"]) {
      throw new Error("Illegal arguments: cannot have both newOnly and a contract on 'this'");
    }
    domName = "(" + calldom.join(",") + ")";
    optionsName = (options["this"] ? "{this: " + options["this"].cname + "}" : "");
    contractName = domName + " -> " + callrng.cname + " " + optionsName;
    c = new Contract(contractName, "fun", function(f, pos, neg, parentKs, stack) {
      var callHandler, handler, makeHandler, newHandler, p, parents, that;
      handler = idHandler(f);
      that = this;
      parents = parentKs.slice(0);
      if (typeof f !== "function") {
        blame(pos, neg, this, f, parents);
      }
      parents.push(that);
      /*
          options:
            isNew: Bool   - make a constructor handler (to be called with new)
            newSafe: Bool - make call handler that adds a call to new
            pre: ({} -> Bool) - function to check preconditions
            post: ({} -> Bool) - function to check postconditions
            this: {...} - object contract to check 'this'
      */

      makeHandler = function(dom, rng, options) {
        var functionHandler;
        return functionHandler = function() {
          var args, bf, boundArgs, checked, clean_rng, dep_args, i, max_i, res, thisc;
          args = [];
          if (options && options.checkStack && !(options.checkStack(stack))) {
            throw new Error("stack checking failed");
          }
          if (typeof options.pre === "function" && !options.pre(this)) {
            blame(neg, pos, "precondition: " + options.pre.toString(), "[failed precondition]", parents);
          }
          i = 0;
          max_i = Math.max(dom != null ? dom.length : void 0, arguments.length);
          while (i < max_i) {
            checked = dom[i] ? dom[i].check(arguments[i], neg, pos, parents, stack) : arguments[i];
            if (i < arguments.length) {
              args[i] = checked;
            }
            i++;
          }
          if (typeof rng === "function") {
            dep_args = Array.isArray(args) ? args : [args];
            clean_rng = rng.call(this, args);
            if (!(clean_rng instanceof Contract)) {
              throw new Error("range argument to function contract is not a contract");
            }
          } else {
            clean_rng = rng;
            if (!(clean_rng instanceof Contract)) {
              throw new Error("range argument to function contract is not a contract");
            }
          }
          if (options.isNew || options.newSafe) {
            boundArgs = [].concat.apply([null], args);
            bf = f.bind.apply(f, boundArgs);
            res = new bf();
            res = clean_rng.check(res, pos, neg, parents, stack);
          } else {
            if (options["this"]) {
              thisc = options["this"].check(this, neg, pos, parents, stack);
            } else {
              thisc = this;
            }
            res = clean_rng.check(f.apply(thisc, args), pos, neg, parents, stack);
          }
          if (typeof options.post === "function" && !options.post(this)) {
            blame(neg, pos, "failed postcondition: " + options.post.toString(), "[failed postcondition]", parents);
          }
          return res;
        };
      };
      if (newOnly) {
        options.isNew = true;
        callHandler = function() {
          return blameM(neg, pos, "called newOnly function without new", parents);
        };
        newHandler = makeHandler(this.newdom, this.newrng, options);
      } else if (callOnly) {
        options.isNew = false;
        newHandler = function() {
          return blameM(neg, pos, "called callOnly function with a new", parents);
        };
        callHandler = makeHandler(this.calldom, this.callrng, options);
      } else {
        callHandler = makeHandler(this.calldom, this.callrng, options);
        newHandler = makeHandler(this.newdom, this.newrng, options);
      }
      p = Proxy.createFunction(handler, callHandler, newHandler);
      unproxy.set(p, this);
      return p;
    });
    c.calldom = calldom;
    c.callrng = callrng;
    c.newdom = newdom;
    c.newrng = newrng;
    c.raw_options = options;
    c.equals = function(other) {
      var pCDom, pNDom, pOpt, zipCDom, zipNDom;
      if (!other instanceof Contract || other.ctype !== this.ctype) {
        return false;
      }
      zipCDom = Utils.zip(this.calldom, other.calldom);
      zipNDom = Utils.zip(this.newdom, other.newdom);
      pCDom = (zipCDom.length !== 0) && zipCDom.every(function(zd) {
        return zd[0].equals(zd[1]);
      });
      pNDom = (zipNDom.length !== 0) && zipNDom.every(function(zd) {
        return zd[0].equals(zd[1]);
      });
      pOpt = checkOptions(this.raw_options, other.raw_options);
      return pOpt && pCDom && pNDom && (this.callrng.equals(other.callrng)) && (this.newrng.equals(other.newrng));
    };
    return c;
  };

  ctor = function(dom, rng, options) {
    var opt;
    opt = Utils.merge(options, {
      newOnly: true
    });
    return fun(dom, rng, opt);
  };

  ctorSafe = function(dom, rng, options) {
    var opt;
    opt = Utils.merge(options, {
      newSafe: true
    });
    return fun(dom, rng, opt);
  };

  object = function(objContract, options, name) {
    var c, objName, setSelfContracts;
    if (options == null) {
      options = {};
    }
    objName = function(obj) {
      var props;
      if (name === void 0) {
        props = Object.keys(obj).map(function(propName) {
          var _ref;
          if (obj[propName].cname) {
            return propName + " : " + obj[propName].cname;
          } else {
            return propName + " : " + ((_ref = obj[propName].value) != null ? _ref.cname : void 0);
          }
        }, this);
        return "{\n  " + props.join(",\n  ") + "\n}";
      } else {
        return name;
      }
    };
    c = new Contract(objName(objContract), "object", function(obj, pos, neg, parentKs) {
      var contractDesc, handler, invariant, nonObject, objDesc, op, parents, prop, proto, that, value, _ref;
      handler = idHandler(obj);
      that = this;
      parents = parentKs.slice(0);
      parents.push(this);
      nonObject = ["undefined", "boolean", "number", "string"];
      if (_ref = typeof obj, __indexOf.call(nonObject, _ref) >= 0) {
        blame(pos, neg, this, obj, parentKs);
      }
      if (options.extensible === true && !Object.isExtensible(obj)) {
        blame(pos, neg, "[extensible object]", "[non-extensible object]", parents);
      }
      if (options.extensible === false && Object.isExtensible(obj)) {
        blame(pos, neg, "[non-extensible]", "[extensible object]", parents);
      }
      if (options.sealed === true && !Object.isSealed(obj)) {
        blame(pos, neg, "[sealed object]", "[non-sealed object]", parents);
      }
      if (options.sealed === false && Object.isSealed(obj)) {
        blame(pos, neg, "[non-sealed object]", "[sealed object]", parents);
      }
      if (options.frozen === true && !Object.isFrozen(obj)) {
        blame(pos, neg, "[frozen object]", "[non-frozen object]", parents);
      }
      if (options.frozen === false && Object.isFrozen(obj)) {
        blame(pos, neg, "[non-frozen object]", "[frozen object]", parents);
      }
      for (prop in this.oc) {
        contractDesc = this.oc[prop];
        if ((typeof obj === 'object') || (typeof obj === 'function')) {
          objDesc = Utils.getPropertyDescriptor(obj, prop);
        } else if (typeof obj[prop] !== 'undefined') {
          objDesc = {
            value: obj[prop],
            writable: true,
            configurable: true,
            enumerable: true
          };
        } else {
          objDesc = null;
        }
        if (contractDesc instanceof Contract) {
          value = contractDesc;
        } else {
          if (contractDesc["value"] && contractDesc["value"] instanceof Contract) {
            value = contractDesc["value"];
          } else {
            blameM(pos, neg, "property " + prop + " in the object contract was not a contract", parents);
          }
        }
        if (objDesc) {
          if (contractDesc.writable === true && !objDesc.writable) {
            blame(pos, neg, "[writable property: " + prop + "]", "[read-only property: " + prop + "]", parents);
          }
          if (contractDesc.writable === false && objDesc.writable) {
            blame(pos, neg, "[read-only property: " + prop + "]", "[writable property: " + prop + "]", parents);
          }
          if (contractDesc.configurable === true && !objDesc.configurable) {
            blame(pos, neg, "[configurable property: " + prop + "]", "[non-configurable property: " + prop + "]", parents);
          }
          if (contractDesc.configurable === false && objDesc.configurable) {
            blame(pos, neg, "[non-configurable property: " + prop + "]", "[configurable property: " + prop + "]", parents);
          }
          if (contractDesc.enumerable === true && !objDesc.enumerable) {
            blame(pos, neg, "[enumerable property: " + prop + "]", "[non-enumerable property: " + prop + "]", parents);
          }
          if (contractDesc.enumerable === false && objDesc.enumerable) {
            blame(pos, neg, "[non-enumerable property: " + prop + "]", "[enumerable property: " + prop + "]", parents);
          }
          this.oc[prop] = {
            value: value,
            writable: contractDesc.writable || objDesc.writable,
            configurable: contractDesc.configurable || objDesc.configurable,
            enumerable: contractDesc.enumerable || objDesc.enumerable
          };
        } else {
          if (value.ctype === "opt") {
            this.oc[prop] = {
              value: value,
              writable: true,
              configurable: true,
              enumerable: true
            };
          } else {
            blame(pos, neg, this, "[missing property: " + prop + "]", parents);
          }
        }
      }
      if (options.invariant) {
        invariant = options.invariant.bind(obj);
        if (!invariant()) {
          blame(neg, pos, "invariant: " + (options.invariant.toString()), obj, parents);
        }
      }
      handler.defineProperty = function(name, desc) {
        if ((options.extensible === false) || options.sealed || options.frozen) {
          blame(neg, pos, "[non-extensible object]", "[attempted to change property descriptor of: " + name + "]", parents);
        }
        if (!that.oc[name].configurable) {
          blame(neg, pos, "[non-configurable property: " + name + "]", "[attempted to change the property descriptor of property: " + name + "]", parents);
        }
        return Object.defineProperty(obj, name, desc);
      };
      handler["delete"] = function(name) {
        var res;
        res = void 0;
        invariant = void 0;
        if (options.sealed || options.frozen) {
          blame(neg, pos, "" + (options.sealed ? 'sealed' : 'frozen') + " object", "[call to delete]", parents);
        }
        res = delete obj[name];
        if (options.invariant) {
          invariant = options.invariant.bind(obj);
          if (!invariant()) {
            blame(neg, pos, "invariant: " + (options.invariant.toString()), obj, parents);
          }
        }
        return res;
      };
      handler["get"] = function(receiver, name) {
        if (that.oc.hasOwnProperty(name)) {
          return obj && that.oc[name].value.check(obj[name], pos, neg, parents);
        } else if ((options.arrayRangeContract && (options.arrayRange !== undefined)) && (parseInt(name, 10) >= options.arrayRange)) {
          return obj && options.arrayRangeContract.check(obj[name], pos, neg, parents);
        } else {
          return obj && obj[name];
        }
      };
      handler.set = function(receiver, name, val) {
        if ((options.extensible === false) && Object.getOwnPropertyDescriptor(obj, name) === void 0) {
          blame(neg, pos, "non-extensible object", "[attempted to set a new property: " + name + "]", parents);
        }
        if (options.frozen) {
          blame(neg, pos, "frozen object", "[attempted to set: " + name + "]", parents);
        }
        if (that.oc.hasOwnProperty(name)) {
          if (!that.oc[name].writable) {
            blame(neg, pos, "read-only property", "[attempted to set read-only property: " + name + "]", parents);
          }
          obj[name] = that.oc[name]["value"].check(val, neg, pos, parents);
        } else if ((options.arrayRangeContract && (options.arrayRange !== void 0)) && (parseInt(name, 10) >= options.arrayRange)) {
          obj[name] = options.arrayRangeContract.check(val, neg, pos, parents);
        } else {
          obj[name] = val;
        }
        if (options.invariant) {
          invariant = options.invariant.bind(obj);
          if (!invariant()) {
            blame(neg, pos, "invariant: " + (options.invariant.toString()), obj, parents);
          }
        }
        return true;
      };
      if (typeof obj === "function") {
        op = Proxy.createFunction(handler, function(args) {
          return obj.apply(this, arguments);
        }, function(args) {
          var bf, boundArgs;
          boundArgs = [].concat.apply([null], arguments);
          bf = obj.bind.apply(obj, boundArgs);
          return new bf();
        });
      } else {
        proto = Object.getPrototypeOf(obj);
        op = Proxy.create(handler, proto);
      }
      unproxy.set(op, this);
      return op;
    });
    c.oc = objContract;
    c.raw_options = options;
    setSelfContracts = function(c, toset) {
      var childrenNames, name, _results;
      childrenNames = ["k", "k1", "k2", "flats", "ho", "calldom", "callrng", "newdom", "newrng"];
      if (typeof c.oc !== "undefined") {
        _results = [];
        for (name in c.oc) {
          if (c.oc[name] === self) {
            _results.push(c.oc[name] = toset);
          } else {
            if (c.oc[name].ctype !== "object") {
              _results.push(setSelfContracts(c.oc[name], toset));
            } else {
              _results.push(void 0);
            }
          }
        }
        return _results;
      } else {
        return childrenNames.forEach(function(cName) {
          var i, _results1;
          if (typeof c[cName] !== "undefined") {
            if (Array.isArray(c[cName])) {
              i = 0;
              _results1 = [];
              while (i < c[cName].length) {
                if (c[cName][i] === self) {
                  c[cName][i] = toset;
                } else {
                  if (c[cName][i].ctype !== "object") {
                    setSelfContracts(c[cName][i], toset);
                  }
                }
                _results1.push(i++);
              }
              return _results1;
            } else {
              if (c[cName] === self) {
                return c[cName] = toset;
              } else {
                if (c[cName] !== "object") {
                  return setSelfContracts(c[cName], toset);
                }
              }
            }
          }
        });
      }
    };
    setSelfContracts(c, c);
    c.equals = function(other) {
      if (!other instanceof Contract || other.ctype !== this.ctype) {
        return false;
      }
      return checkOptions(this.oc, other.oc) && checkOptions(this.raw_options, other.raw_options);
    };
    return c;
  };

  ___ = function(k) {
    return {
      deferred: k
    };
  };

  arr = function(ks) {
    var i, name, oc, prefix, rangeContract, rangeIndex;
    oc = {};
    name = "";
    prefix = "";
    i = 0;
    while (i < ks.length) {
      if (i !== 0) {
        prefix = ", ";
      }
      if (ks[i].deferred) {
        if (i !== ks.length - 1) {
          throw new Error("___() must be at the last position in the array");
        }
        if (!(ks[i].deferred instanceof Contract)) {
          throw new Error("value given to ___ is not a contract");
        }
        rangeContract = ks[i].deferred;
        rangeIndex = i;
        name += prefix + "..." + rangeContract.cname;
      } else {
        oc[i] = ks[i];
        name += prefix + ks[i].cname;
      }
      i++;
    }
    name = "[" + name + "]";
    return object(oc, {
      arrayRange: rangeIndex,
      arrayRangeContract: rangeContract
    }, name);
  };

  or_ = function() {
    var c, flats, ho, ks, name;
    ks = [].slice.call(arguments);
    ks.forEach(function(el, idx) {
      if (!(el instanceof Contract)) {
        throw new Error("Argument " + idx + " to the `or` contract is not a contract");
      }
    });
    flats = ks.filter(function(el) {
      return el.ctype === "check";
    });
    ho = ks.filter(function(el) {
      return el.ctype !== "check";
    });
    if (ho.length > 1) {
      throw new Error("Cannot have more than 1 higher order contract in 'or'");
    }
    name = ks.join(" or ");
    c = new Contract(name, "or", function(val, pos, neg, parentKs) {
      var i, lastBlame, parents;
      parents = parentKs.slice(0);
      parents.push(this);
      i = 0;
      while (i < flats.length) {
        try {
          return this.flats[i].check(val, pos, neg, parents);
        } catch (e) {
          lastBlame = e;
          i++;
        }
      }
      if (ho.length === 1) {
        return this.ho[0].check(val, pos, neg, parents);
      } else {
        throw lastBlame;
      }
    });
    c.flats = flats;
    c.ho = ho;
    c.equals = function(other) {
      var ho_eq, pFlats, zipFlats;
      if (!other instanceof Contract || other.ctype !== this.ctype) {
        return false;
      }
      zipFlats = Utils.zip(this.flats, other.flats);
      pFlats = (zipFlats.length !== 0) && zipFlats.every(function(zf) {
        return zf[0].equals(zf[1]);
      });
      ho_eq = this.ho.length === 1 && other.ho.length === 1 ? this.ho[0].equals(other.ho[0]) : true;
      return pFlats && ho_eq;
    };
    return c;
  };

  and_ = function(k1, k2) {
    var c;
    if (!(k1 instanceof Contract)) {
      throw new Error("Argument 0 to the `and` contract is not a contract");
    }
    if (!(k2 instanceof Contract)) {
      throw new Error("Argument 1 to the `and` contract is not a contract");
    }
    c = new Contract("" + k1.cname + " and " + k2.cname, "and", function(val, pos, neg, parentKs) {
      var k1c;
      k1c = k1.check(val, pos, neg, parentKs);
      return k2.check(k1c, pos, neg, parentKs);
    });
    c.k1 = k1;
    c.k2 = k2;
    c.equals = function(other) {
      if (!other instanceof Contract || other.ctype !== this.ctype) {
        return false;
      }
      return (this.k1.equals(other.k1)) && (this.k2.equals(other.k2));
    };
    return c;
  };

  not_ = function(k) {
    var c;
    if (!(k instanceof Contract)) {
      throw new Error("Argument to the `not` contract is not a contract");
    }
    if (k.ctype === "fun" || k.ctype === "object") {
      throw new Error("cannot construct a 'not' contract with a function or object contract");
    }
    c = new Contract("not " + k.cname, "not", function(val, pos, neg, parentKs) {
      var res;
      try {
        res = this.k.check(val, pos, neg, parentKs);
        return blame(pos, neg, this, val, parentKs);
      } catch (b) {
        return res;
      }
    });
    c.k = k;
    c.equals = function(other) {
      if (!other instanceof Contract || other.ctype !== this.ctype) {
        return false;
      }
      return this.k.equals(other.k);
    };
    return c;
  };

  opt = function(k) {
    var c;
    if (!(k instanceof Contract)) {
      throw new Error("Argument to the `optional` contract is not a contract");
    }
    c = new Contract("opt(" + k.cname + ")", "opt", function(val, pos, neg, parentKs) {
      if (val === void 0) {
        return val;
      } else {
        return this.k.check(val, pos, neg, parentKs);
      }
    });
    c.k = k;
    c.equals = function(other) {
      if (!other instanceof Contract || other.ctype !== this.ctype) {
        return false;
      }
      return this.k.equals(other.k);
    };
    return c;
  };

  getModName = function(isServer) {
    var filename, guardedAt, linenum, match, st;
    st = printStackTrace({
      e: new Error()
    });
    guardedAt = st[0] === 'Error' ? st[3] : st[2];
    match = /\/([^\/]*):(\d*)[\)]?$/.exec(guardedAt);
    if (match) {
      filename = match[1];
      linenum = match[2];
    } else {
      filename = "unknown";
      linenum = "-1";
    }
    return new ModuleName(filename, linenum, isServer);
  };

  guard = function(k, x, server, setup) {
    var c, client, stack;
    stack = [];
    if (typeof setup === "function") {
      setup(stack);
    }
    if (server == null) {
      server = getModName(true);
    } else {
      server = new ModuleName(server, "", true);
    }
    client = new ModuleName(server.filename, "" + server.linenum + " (caller)", false);
    server.linenum = "" + server.linenum + " (value)";
    c = k.check(x, server, client, [], stack);
    contract_orig_map.set(c, {
      originalValue: x,
      originalContract: k,
      server: ""
    });
    if (!enabled) {
      return x;
    } else {
      return c;
    }
  };

  any = (function() {
    var c;
    c = new Contract("any", "any", function(val) {
      return val;
    });
    c.equals = function(other) {
      return this === other;
    };
    return c;
  })();

  self = (function() {
    var c;
    c = new Contract("self", "self", function(val) {
      return val;
    });
    c.equals = function(other) {
      return this === other;
    };
    return c;
  })();

  none = (function() {
    var c;
    c = new Contract("none", "none", function(val, pos, neg, parentKs) {
      return blame(pos, neg, this, val, parentKs);
    });
    c.equals = function(other) {
      return this === other;
    };
    return c;
  })();

  root.Undefined = check((function(x) {
    return void 0 === x;
  }), "Undefined");

  root.Null = check((function(x) {
    return null === x;
  }), "Null");

  root.Num = check((function(x) {
    return typeof x === "number";
  }), "Num");

  root.Bool = check((function(x) {
    return typeof x === "boolean";
  }), "Bool");

  root.Str = check((function(x) {
    return typeof x === "string";
  }), "Str");

  root.Odd = check((function(x) {
    return (x % 2) === 1;
  }), "Odd");

  root.Even = check((function(x) {
    return (x % 2) !== 1;
  }), "Even");

  root.Pos = check((function(x) {
    return x >= 0;
  }), "Pos");

  root.Nat = check((function(x) {
    return x > 0;
  }), "Nat");

  root.Neg = check((function(x) {
    return x < 0;
  }), "Neg");

  root.Arr = object({
    length: check((function(x) {
      return typeof x === "number";
    }), "Number")
  });

  root.Self = self;

  root.Any = any;

  root.None = none;

  root.check = check;

  root.fun = fun;

  root.ctor = ctor;

  root.ctorSafe = ctorSafe;

  root.object = object;

  root.arr = arr;

  root.___ = ___;

  root.any = any;

  root.or = or_;

  root.none = none;

  root.not = not_;

  root.and = and_;

  root.opt = opt;

  root.guard = guard;

  root.exports = function(moduleName, original) {
    var handler;
    if (original == null) {
      original = {};
    }
    handler = idHandler(original);
    handler.set = function(r, name, value) {
      var orig, originalContract, originalValue;
      if ((value !== null) && typeof value === "object" || typeof value === "function") {
        orig = contract_orig_map.get(value);
      }
      if (orig != null) {
        originalValue = orig.originalValue, originalContract = orig.originalContract;
        contract_orig_map.set(value, {
          originalValue: originalValue,
          originalContract: originalContract,
          server: moduleName
        });
      }
      original[name] = value;
    };
    return Proxy.create(handler);
  };

  root.setExported = function(exportObj, moduleName) {
    var name, orig, originalContract, originalValue, value;
    for (name in exportObj) {
      if (!__hasProp.call(exportObj, name)) continue;
      value = exportObj[name];
      if ((value !== null) && typeof value === "object" || typeof value === "function") {
        orig = contract_orig_map.get(value);
      }
      if (orig != null) {
        originalValue = orig.originalValue, originalContract = orig.originalContract;
        contract_orig_map.set(value, {
          originalValue: originalValue,
          originalContract: originalContract,
          server: moduleName
        });
      }
    }
    return exportObj;
  };

  root.use = function(exportObj, moduleName) {
    var name, orig, res, value;
    res = {};
    if (typeof exportObj === "function") {
      return exportObj;
    } else {
      for (name in exportObj) {
        if (!__hasProp.call(exportObj, name)) continue;
        value = exportObj[name];
        if ((value !== null) && typeof value === "object" || typeof value === "function") {
          orig = contract_orig_map.get(value);
        }
        if (orig != null) {
          res[name] = orig.originalContract.check(orig.originalValue, orig.server, moduleName, []);
        } else {
          res[name] = value;
        }
      }
      return res;
    }
  };

  root.enabled = function(b) {
    return enabled = b;
  };

  root.autoload = function() {
    var globalObj, name;
    globalObj = typeof window !== "undefined" && window !== null ? window : global;
    for (name in root) {
      if (!__hasProp.call(root, name)) continue;
      globalObj[name] = root[name];
    }
  };

  (function(define) {
    return define('contracts', function(require) {
      return root;
    });
  })(typeof define === 'function' && define.amd ? define : function(id, factory) {
    if (typeof module !== 'undefined' && module.exports) {
      return module.exports = factory(require);
    } else {
      return window[id] = factory(function(value) {
        return window[value];
      });
    }
  });

}).call(this);
});

require.define("/dev/sweet-js/test/test_macros.js",function(require,module,exports,__dirname,__filename,process){var expect = require("expect.js")
var parser = require("../lib/sweet")
var gen = require ("escodegen");

describe("parser", function() {
  // it("should expand a macro with pattern `$x:lit`", function() {
  //   macro id "()" {
  //     case ($x:lit) => {
  //       $x
  //     }
  //   }
  //   var z = id(4);
  //   z.should.equal(4);
  // });

  // it("should expand a macro with pattern `=> $x:lit`", function() {
  //   macro litid "()" {
  //     case (=> $x:lit) {
  //       $x
  //     }
  //   }    
  //   var z = litid(=> 42);
  //   z.should.equal(42);
  // });

  // it("should expand a macro with a pattern `$x:lit <+> $y:lit`", function() {
  //   macro oddadd "()" {
  //     case (($x:lit) <+> $y:lit) => {
  //       $x + $y
  //     }
  //   }
  //   var z = oddadd((2) <+> 4);
  //   expect(z).to.be(6);

  // });


});

});
require("/dev/sweet-js/test/test_macros.js");

require.define("/dev/sweet-js/test/test_reader.js",function(require,module,exports,__dirname,__filename,process){var expect = require("expect.js");
var parser = require("../lib/sweet");
var gen = require("escodegen");

describe("reader", function() {
    it("should tokenize an identifier", function() {
        expect(parser.read("foo")[0].value)
            .to.equal("foo");
    });
    
    it("should tokenize a string", function() {
        expect(parser.read("'foo'")[0].value)
            .to.equal("foo");
    });
    
    it("should read strings with double quotes", function() {
        expect(parser.read("\"foo\"")[0].value)
            .to.equal("foo");
    });
    
    it("should tokenize a number", function() {
        expect(parser.read("42")[0].value)
            .to.equal(42);
    });
    
    it("should tokenize a regex", function() {
        expect(parser.read("/42/i")[0].literal)
            .to.equal("/42/i");
    });
    
    it("should tokenize two strings", function() {
        expect(parser.read("'foo' 'bar'")[0].value)
            .to.equal("foo");
        
        expect(parser.read("'foo' 'bar'")[1].value)
            .to.equal("bar");
    });
    
    it("should match up a single delimiter", function() {
        expect(parser.read("(a)")[0].value)
            .to.equal("()");
        
        expect(parser.read("(a)")[0].inner[0].value)
            .to.equal("a");
        
        expect(parser.read("(a)")[0].inner.length)
            .to.equal(1);
    });
    
    it("should match up a single delimiter with multiple inner fields", function() {
        expect(parser.read("(a, b)")[0].value)
            .to.equal("()");
        
        expect(parser.read("(a, b)")[0].inner[0].value)
            .to.equal("a");
        
        expect(parser.read("(a, b)")[0].inner[1].value)
            .to.equal(",");
        
        expect(parser.read("(a, b)")[0].inner[2].value)
            .to.equal("b");
    });
    
    it("should match up identifier and a paren delimiter", function() {
        expect(parser.read("foo (a, b)")[0].value)
            .to.equal("foo");
        
        expect(parser.read("foo (a, b)")[1].value)
            .to.equal("()");
        
        expect(parser.read("foo (a, b)")[1].inner[0].value)
            .to.equal("a");
        
        expect(parser.read("foo (a, b)")[1].inner[1].value)
            .to.equal(",");
        
        expect(parser.read("foo (a, b)")[1].inner[2].value)
            .to.equal("b");
    });
    
    it("should match up identifier and a curly delimiter", function() {
        expect(parser.read("foo {a, b}")[0].value)
            .to.equal("foo");
        
        expect(parser.read("foo {a, b}")[1].value)
            .to.equal("{}");
        
        expect(parser.read("foo {a, b}")[1].inner[0].value)
            .to.equal("a");
        
        expect(parser.read("foo {a, b}")[1].inner[1].value)
            .to.equal(",");
        
        expect(parser.read("foo {a, b}")[1].inner[2].value)
            .to.equal("b");
    });
    
    it("to match up identifier and a square delimiter", function() {
        expect(parser.read("foo [a, b]")[0].value)
            .to.equal("foo");
        
        expect(parser.read("foo [a, b]")[1].value)
            .to.equal("[]");
        
        expect(parser.read("foo [a, b]")[1].inner[0].value)
            .to.equal("a");
        
        expect(parser.read("foo [a, b]")[1].inner[1].value)
            .to.equal(",");
        
        expect(parser.read("foo [a, b]")[1].inner[2].value)
            .to.equal("b");
    });
    
    it("should match up a sub delimiter in the first position", function() {
        expect(parser.read("((a) b)")[0].value)
            .to.equal("()");
        
        expect(parser.read("((a) b)")[0].inner[0].value)
            .to.equal("()");
        
        expect(parser.read("((a) b)")[0].inner[0].inner[0].value)
            .to.equal("a");
    });
    
    it("should match up a sub delimiter in the last position", function() {
        expect(parser.read("(a (b))")[0].value)
            .to.equal("()");
        
        expect(parser.read("(a (b))")[0].inner[1].value)
            .to.equal("()");
        
        expect(parser.read("(a (b))")[0].inner[1].inner[0].value)
            .to.equal("b");
    });
    
    it("should read strings inside a delimiter", function() {
        expect(parser.read("foo ('bar')")[1].inner[0].value)
            .to.equal("bar");
    });


    it("should read delimiter in assign regex", function() {
        expect(parser.read("{x = /a}b/}")[0].inner[2].literal)
            .to.equal("/a}b/");
    });
    
    it("should not read delimiter inside a regex", function() {
        expect(parser.read("x = /{a}b/")[2].literal)
            .to.equal("/{a}b/");
    });
    
    it("should see divide as divide", function() {
        expect(parser.read("2 / 2")[0].value)
            .to.equal(2);
        
        expect(parser.read("2 / 2")[1].value)
            .to.equal("/");
        
        expect(parser.read("2 / 2")[2].value)
            .to.equal(2);
        
        expect(parser.read("{2 / 2}")[0].inner[1].value)
            .to.equal("/");
    });
    
    it("should read a / with a keyword before it as regex", function() {
        expect(parser.read("return /asdf/")[1].literal)
            .to.equal("/asdf/");
        
        expect(parser.read("{return /asdf/}")[0].inner[1].literal)
            .to.equal("/asdf/");
    });
    
    it("should read a / with an identifier before it as divide", function() {
        expect(parser.read("foo /asdf/")[1].value)
            .to.equal("/");
        
        expect(parser.read("{foo /asdf/}")[0].inner[1].value)
            .to.equal("/");
    });
    
    it("should read a / in the then arm of an if as regex", function() {
        expect(parser.read("if() /asdf/")[2].literal)
            .to.equal("/asdf/");
    });
    
    it("should read a / in the then arm of an while as regex", function() {
        expect(parser.read("while() /asdf/")[2].literal)
            .to.equal("/asdf/");
    });
    
    it("should read a / in the then arm of an for as regex", function() {
        expect(parser.read("for() /asdf/")[2].literal)
            .to.equal("/asdf/");
    });
    
    it("should read a / in the then arm of an with as regex", function() {
        expect(parser.read("with() /asdf/")[2].literal)
            .to.equal("/asdf/");
    });
    
    it("should read a / after a fn call as divide", function() {
        expect(parser.read("foo() /asdf/")[2].value)
            .to.equal("/");
    });
    
    it("should read a / after {} in a function declaration as regex", function() {
        expect(parser.read("function foo() {} /asdf/")[4].literal)
            .to.equal("/asdf/");
        
        expect(parser.read("{false} function foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(parser.read("if (false) false\nfunction foo() {} /42/i")[7].literal)
            .to.equal("/42/i");
        
        expect(parser.read("i = 0;function foo() {} /42/i")[8].literal)
            .to.equal("/42/i");
        
        expect(parser.read("if (false) {} function foo() {} /42/i")[7].literal)
            .to.equal("/42/i");
        
        expect(parser.read("function foo() {} function foo() {} /42/i")[8].literal)
            .to.equal("/42/i");
        
        expect(parser.read("if (false) function foo() {} /42/i")[6].literal)
            .to.equal("/42/i");
        
        expect(parser.read("{function foo() {} /42/i}")[0].inner[4].literal)
            .to.equal("/42/i");
        
        expect(parser.read("foo\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(parser.read("42\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(parser.read("[2,3]\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(parser.read("{a: 2}\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(parser.read("\"foo\"\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(parser.read("/42/i\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(parser.read("for (;;) {\nbreak\nfunction foo() {} /42/i\n}")[2].inner[5].literal)
            .to.equal("/42/i");
        
        expect(parser.read("debugger\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(parser.read("if(false)\nfalse\nelse\nfunction foo() {} /42/i")[8].literal)
            .to.equal("/42/i");
        
        expect(parser.read("[42][0]\nfunction foo() {} /42/i")[6].literal)
            .to.equal("/42/i");
        
    });
    
    
    it("should read a / after {} in a function expression as divide", function() {
        expect(parser.read("x = function foo() {} /asdf/")[6].value)
            .to.equal("/");
        
        expect(parser.read("x = 42 / function foo() {} /42/i")[8].value)
            .to.equal("/");
        
        expect(parser.read("42 >> function foo() {} /42/i")[8].value)
            .to.equal("/");
        
        expect(parser.read("i = 0;+function foo() {} /42/i")[9].value)
            .to.equal("/");
        
        expect(parser.read("(function foo() {} /42/i)")[0].inner[4].value)
            .to.equal("/");
        
        expect(parser.read("foo /\nfunction foo() {} /42/i")[6].value)
            .to.equal("/");
        
        expect(parser.read("new function foo() {} /42/i")[5].value)
            .to.equal("/");
        
        expect(parser.read("typeof function foo() {} /42/i")[5].value)
            .to.equal("/");
        
        expect(parser.read("2 in function foo() {} /42/i")[6].value)
            .to.equal("/");
        
        expect(parser.read("(function foo() {return function foo() {} /42/i})()")[0].inner[3].inner[5].value)
            .to.equal("/");
        
        expect(parser.read("void function foo() {} /42/i")[5].value)
            .to.equal("/");
        
        expect(parser.read("[function foo() {} /42/i]")[0].inner[4].value)
            .to.equal("/");
        
        expect(parser.read("4,\nfunction foo() {} /42/i")[6].value)
            .to.equal("/");
        
        expect(parser.read("++function foo() {} /42/i")[5].value)
            .to.equal("/");
        
        expect(parser.read("x /= function foo() {} /42/i")[6].value)
            .to.equal("/");
        
        expect(parser.read("switch (\"foo\") {case \"foo\": {true;}\ncase function foo() {} /42/i: {true;}}")[2]
            .inner[9].value)
            .to.equal("/");
    });

});

});
require("/dev/sweet-js/test/test_reader.js");
})();
