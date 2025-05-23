import { defaultBreakpoints, mediaQuery } from './utils/mediaquery.js';
import { fromESClass } from './utils/convert-class.js';
import * as licensing from './kendo.licensing.js';

export const __meta__ = {
    id: "core",
    name: "Core",
    category: "framework",
    description: "The core of the Kendo framework.",
    depends: ["licensing"],
};

(function($, window, undefined) {
    var kendo = window.kendo = window.kendo || { cultures: {} },
        extend = $.extend,
        each = $.each,
        isArray = Array.isArray,
        noop = $.noop,
        math = Math,
        crypto = window.crypto,
        Template,
        JSON = window.JSON || {},
        support = {},
        percentRegExp = /%/,
        formatRegExp = /\{(\d+)(:[^\}]+)?\}/g,
        boxShadowRegExp = /(\d+(?:\.?)\d*)px\s*(\d+(?:\.?)\d*)px\s*(\d+(?:\.?)\d*)px\s*(\d+)?/i,
        numberRegExp = /^(\+|-?)\d+(\.?)\d*$/,
        MONTH = "month",
        HOUR = "hour",
        ZONE = "zone",
        WEEKDAY = "weekday",
        QUARTER = "quarter",
        DATE_FIELD_MAP = {
            "G": "era",
            "y": "year",
            "q": QUARTER,
            "Q": QUARTER,
            "M": MONTH,
            "L": MONTH,
            "d": "day",
            "E": WEEKDAY,
            "c": WEEKDAY,
            "e": WEEKDAY,
            "h": HOUR,
            "H": HOUR,
            "k": HOUR,
            "K": HOUR,
            "m": "minute",
            "s": "second",
            "a": "dayperiod",
            "t": "dayperiod",
            "x": ZONE,
            "X": ZONE,
            "z": ZONE,
            "Z": ZONE
        },
        NAME_TYPES = {
            month: {
                type: "months",
                minLength: 3,
                standAlone: "L"
            },

            quarter: {
                type: "quarters",
                minLength: 3,
                standAlone: "q"
            },

            weekday: {
                type: "days",
                minLength: {
                    E: 0,
                    c: 3,
                    e: 3
                },
                standAlone: "c"
            },

            dayperiod: {
                type: "dayPeriods",
                minLength: 0
            },

            era: {
                type: "eras",
                minLength: 0
            }
        },
        FUNCTION = "function",
        STRING = "string",
        NUMBER = "number",
        OBJECT = "object",
        NULL = "null",
        BOOLEAN = "boolean",
        UNDEFINED = "undefined",
        PREFIX = "prefix",
        ARIA_LABELLEDBY = "aria-labelledby",
        ARIA_LABEL = "aria-label",
        LABELIDPART = "_label",
        getterCache = {},
        setterCache = {},
        slice = [].slice,
        cssPropertiesNames = [ "themeColor", "fillMode", "shape", "size", "rounded", "positionMode" ],
        // avoid extending the depricated properties in latest verions of jQuery
        noDepricateExtend = function() {
            var src, copyIsArray, copy, name, options, clone,
                target = arguments[ 0 ] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if ( typeof target === "boolean" ) {
                deep = target;

                // skip the boolean and the target
                target = arguments[ i ] || {};
                i++;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if ( typeof target !== "object" && typeof target !== "function") {
                target = {};
            }

            // extend jQuery itself if only one argument is passed
            if ( i === length ) {
                target = this;
                i--;
            }

            for ( ; i < length; i++ ) {

                // Only deal with non-null/undefined values
                if ( ( options = arguments[ i ] ) != null ) {

                    // Extend the base object
                    for ( name in options ) {
                        // filters, concat and : properties are depricated in the jQuery 3.3.0
                        // cssNumber is deprecated in jQuery 4.0.0
                        // accessing these properties throw a warning when jQuery migrate is included
                        if (name == "filters" || name == "concat" || name == ":" || name == "cssNumber") {
                            continue;
                        }
                        src = target[ name ];
                        copy = options[ name ];

                        // Prevent never-ending loop
                        if ( target === copy ) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
                            ( copyIsArray = Array.isArray( copy ) ) ) ) {

                            if ( copyIsArray ) {
                                copyIsArray = false;
                                clone = src && Array.isArray( src ) ? src : [];

                            } else {
                                clone = src && jQuery.isPlainObject( src ) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[ name ] = noDepricateExtend( deep, clone, copy );

                        // Don't bring in undefined values
                        } else if ( copy !== undefined ) {
                            target[ name ] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        };

    kendo.version = licensing.packageMetadata.version;

    function Class() {}

    Class.extend = function(proto) {
        var base = function() {},
            member,
            that = this,
            subclass = proto && proto.init ? proto.init : function() {
                that.apply(this, arguments);
            },
            fn;

        base.prototype = that.prototype;
        fn = subclass.fn = subclass.prototype = new base();

        for (member in proto) {
            if (proto[member] != null && proto[member].constructor === Object) {
                // Merge object members
                fn[member] = extend(true, {}, base.prototype[member], proto[member]);
            } else {
                fn[member] = proto[member];
            }
        }

        fn.constructor = subclass;
        subclass.extend = that.extend;

        return subclass;
    };

    Class.prototype._initOptions = function(options) {
        this.options = deepExtend({}, this.options, options);
    };

    kendo.createProxyMember = function(proto, name) {
        proto.fn[name] = function() {
            var instance = this._instance;
            if (instance) {
                return instance[name].apply(instance, arguments);
            }
        };
    };

    kendo.getBaseClass = function(targetClass) {
      if (targetClass instanceof Function) {
        let baseClass = targetClass;

        const newBaseClass = Object.getPrototypeOf(baseClass);

        if (newBaseClass && newBaseClass !== Object && newBaseClass.name) {
          return newBaseClass;
        }
      }
      return null;
    };

    kendo.getAllMethods = function(targetClass) {
      const allStatic = Object.getOwnPropertyNames(targetClass)
        .filter(prop => typeof targetClass[prop] === "function");
      const allNonStatic = Object.getOwnPropertyNames(Object.getPrototypeOf(new targetClass({})))
        .filter(prop => prop !== "constructor");

      return allStatic.concat(allNonStatic);
    };

    kendo.convertPromiseToDeferred = function(promise) {
        let deferred = $.Deferred();

        promise.finally(deferred.always).then(deferred.resolve).catch(deferred.reject);

        return deferred.promise();
    };

    kendo.ConvertClass = fromESClass;

    const isPresent = kendo.isPresent = (value) => value !== null && value !== undefined;
    const isBlank = kendo.isBlank = (value) => value === null || value === undefined;
    const isEmpty = kendo.isEmpty = (value) => value.length === 0;
    const isString = kendo.isString = (value) => typeof value === 'string';
    const isInteger = kendo.isInteger = (value) => Number.isInteger(value);
    const isNumeric = kendo.isNumeric = (value) => !isNaN(value - parseFloat(value));
    const isDate = kendo.isDate = (value) => value && value.getTime;
    const isFunction = kendo.isFunction = (value) => typeof value === 'function';

    var preventDefault = function() {
        this._defaultPrevented = true;
    };

    var isDefaultPrevented = function() {
        return this._defaultPrevented === true;
    };

    var Observable = Class.extend({
        init: function() {
            this._events = {};
        },

        bind: function(eventName, handlers, one) {
            var that = this,
                idx,
                eventNames = typeof eventName === STRING ? [eventName] : eventName,
                length,
                original,
                handler,
                handlersIsFunction = typeof handlers === FUNCTION,
                events;

            if (handlers === undefined) {
                for (idx in eventName) {
                    that.bind(idx, eventName[idx]);
                }
                return that;
            }

            for (idx = 0, length = eventNames.length; idx < length; idx++) {
                eventName = eventNames[idx];

                handler = handlersIsFunction ? handlers : handlers[eventName];

                if (handler) {
                    if (one) {
                        original = handler;
                        handler = function() {
                            that.unbind(eventName, handler);
                            original.apply(that, arguments);
                        };
                        handler.original = original;
                    }
                    events = that._events[eventName] = that._events[eventName] || [];
                    events.push(handler);
                }
            }

            return that;
        },

        one: function(eventNames, handlers) {
            return this.bind(eventNames, handlers, true);
        },

        first: function(eventName, handlers) {
            var that = this,
                idx,
                eventNames = typeof eventName === STRING ? [eventName] : eventName,
                length,
                handler,
                handlersIsFunction = typeof handlers === FUNCTION,
                events;

            for (idx = 0, length = eventNames.length; idx < length; idx++) {
                eventName = eventNames[idx];

                handler = handlersIsFunction ? handlers : handlers[eventName];

                if (handler) {
                    events = that._events[eventName] = that._events[eventName] || [];
                    events.unshift(handler);
                }
            }

            return that;
        },

        trigger: function(eventName, e) {
            var that = this,
                events = that._events[eventName],
                idx,
                length;

            if (events) {
                e = e || {};

                e.sender = that;

                e._defaultPrevented = false;

                e.preventDefault = preventDefault;

                e.isDefaultPrevented = isDefaultPrevented;

                events = events.slice();

                for (idx = 0, length = events.length; idx < length; idx++) {
                    events[idx].call(that, e);
                }

                return e._defaultPrevented === true;
            }

            return false;
        },

        unbind: function(eventName, handler) {
            var that = this,
                events = that._events[eventName],
                idx;

            if (eventName === undefined) {
                that._events = {};
            } else if (events) {
                if (handler) {
                    for (idx = events.length - 1; idx >= 0; idx--) {
                        if (events[idx] === handler || events[idx].original === handler) {
                            events.splice(idx, 1);
                        }
                    }
                } else {
                    that._events[eventName] = [];
                }
            }

            return that;
        }
    });


     function compilePart(part, stringPart) {
         if (stringPart) {
             return "'" +
                 part.split("'").join("\\'")
                     .split('\\"').join('\\\\\\"')
                     .replace(/\n/g, "\\n")
                     .replace(/\r/g, "\\r")
                     .replace(/\t/g, "\\t") + "'";
         } else {
             var first = part.charAt(0),
                 rest = part.substring(1);

             if (first === "=") {
                 return "+(" + rest + ")+";
             } else if (first === ":") {
                 return "+$kendoHtmlEncode(" + rest + ")+";
             } else {
                 return ";" + part + ";$kendoOutput+=";
             }
         }
     }

    var argumentNameRegExp = /^\w+/,
        encodeRegExp = /\$\{([^}]*)\}/g,
        escapedCurlyRegExp = /\\\}/g,
        curlyRegExp = /__CURLY__/g,
        escapedSharpRegExp = /\\#/g,
        sharpRegExp = /__SHARP__/g,
        zeros = ["", "0", "00", "000", "0000"];

    Template = {
        paramName: "data", // name of the parameter of the generated template
        useWithBlock: true, // whether to wrap the template in a with() block
        render: function(template, data) {
            var idx,
                length,
                html = "";

            for (idx = 0, length = data.length; idx < length; idx++) {
                html += template(data[idx]);
            }

            return html;
        },
        compile: function(template, options) {
            var settings = extend({}, this, options),
                paramName = settings.paramName,
                argumentName = paramName.match(argumentNameRegExp)[0],
                useWithBlock = settings.useWithBlock,
                functionBody = "var $kendoOutput, $kendoHtmlEncode = kendo.htmlEncode;",
                fn,
                parts,
                idx;

            if (isFunction(template)) {
                return template;
            }

            functionBody += useWithBlock ? "with(" + paramName + "){" : "";

            functionBody += "$kendoOutput=";

            parts = template
                .replace(escapedCurlyRegExp, "__CURLY__")
                .replace(encodeRegExp, "#=$kendoHtmlEncode($1)#")
                .replace(curlyRegExp, "}")
                .replace(escapedSharpRegExp, "__SHARP__")
                .split("#");

            for (idx = 0; idx < parts.length; idx ++) {
                functionBody += compilePart(parts[idx], idx % 2 === 0);
            }

            functionBody += useWithBlock ? ";}" : ";";

            functionBody += "return $kendoOutput;";

            functionBody = functionBody.replace(sharpRegExp, "#");

            try {
                // This function evaluation is required for legacy support of the Kendo Template syntax - non CSP compliant.
                fn = new Function(argumentName, functionBody);
                fn._slotCount = Math.floor(parts.length / 2);
                return fn;
            } catch (e) {
                if (kendo.debugTemplates) {
                    window.console.warn(`Invalid template:'${template}' Generated code:'${functionBody}'`);
                } else {
                    throw new Error(kendo.format("Invalid template:'{0}' Generated code:'{1}'", template, functionBody));
                }
            }
        }
    };

function pad(number, digits, end) {
    number = number + "";
    digits = digits || 2;
    end = digits - number.length;

    if (end) {
        return zeros[digits].substring(0, end) + number;
    }

    return number;
}

    //JSON stringify
(function() {
    var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": '\\"',
            "\\": "\\\\"
        },
        rep,
        toString = {}.toString;


    if (typeof Date.prototype.toJSON !== FUNCTION) {

        Date.prototype.toJSON = function() {
            var that = this;

            return isFinite(that.valueOf()) ?
                pad(that.getUTCFullYear(), 4) + "-" +
                pad(that.getUTCMonth() + 1) + "-" +
                pad(that.getUTCDate()) + "T" +
                pad(that.getUTCHours()) + ":" +
                pad(that.getUTCMinutes()) + ":" +
                pad(that.getUTCSeconds()) + "Z" : null;
        };

        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function() {
            return this.valueOf();
        };
    }

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? "\"" + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === STRING ? c :
                "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }) + "\"" : "\"" + string + "\"";
    }

    function str(key, holder) {
        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key],
            type;

        if (value && typeof value === OBJECT && typeof value.toJSON === FUNCTION) {
            value = value.toJSON(key);
        }

        if (typeof rep === FUNCTION) {
            value = rep.call(holder, key, value);
        }

        type = typeof value;
        if (type === STRING) {
            return quote(value);
        } else if (type === NUMBER) {
            return isFinite(value) ? String(value) : NULL;
        } else if (type === BOOLEAN || type === NULL) {
            return String(value);
        } else if (type === OBJECT) {
            if (!value) {
                return NULL;
            }
            gap += indent;
            partial = [];
            if (toString.apply(value) === "[object Array]") {
                length = value.length;
                for (i = 0; i < length; i++) {
                    partial[i] = str(i, value) || NULL;
                }
                v = partial.length === 0 ? "[]" : gap ?
                    "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" :
                    "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }
            if (rep && typeof rep === OBJECT) {
                length = rep.length;
                for (i = 0; i < length; i++) {
                    if (typeof rep[i] === STRING) {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v);
                        }
                    }
                }
            }

            v = partial.length === 0 ? "{}" : gap ?
                "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" :
                "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

    if (typeof JSON.stringify !== FUNCTION) {
        JSON.stringify = function(value, replacer, space) {
            var i;
            gap = "";
            indent = "";

            if (typeof space === NUMBER) {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

            } else if (typeof space === STRING) {
                indent = space;
            }

            rep = replacer;
            if (replacer && typeof replacer !== FUNCTION && (typeof replacer !== OBJECT || typeof replacer.length !== NUMBER)) {
                throw new Error("JSON.stringify");
            }

            return str("", { "": value });
        };
    }
})();

// Date and Number formatting
(function() {
    var dateFormatRegExp = /EEEE|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|HH|H|hh|h|mm|m|fff|ff|f|tt|ss|s|zzz|zz|z|"[^"]*"|'[^']*'/g,
        standardFormatRegExp = /^(n|c|p|e)(\d*)$/i,
        literalRegExp = /(\\.)|(['][^']*[']?)|(["][^"]*["]?)/g,
        commaRegExp = /\,/g,
        EMPTY = "",
        POINT = ".",
        COMMA = ",",
        SHARP = "#",
        ZERO = "0",
        PLACEHOLDER = "??",
        EN = "en-US",
        objectToString = {}.toString;

    //cultures
    kendo.cultures = kendo.cultures || {}; // Ensure cultures object exists
    kendo.cultures["en-US"] = {
        name: EN,
        numberFormat: {
            pattern: ["-n"],
            decimals: 2,
            ",": ",",
            ".": ".",
            groupSize: [3],
            percent: {
                pattern: ["-n %", "n %"],
                decimals: 2,
                ",": ",",
                ".": ".",
                groupSize: [3],
                symbol: "%"
            },
            currency: {
                name: "US Dollar",
                abbr: "USD",
                pattern: ["($n)", "$n"],
                decimals: 2,
                ",": ",",
                ".": ".",
                groupSize: [3],
                symbol: "$"
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    namesAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    namesShort: [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ]
                },
                months: {
                    names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    namesAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                },
                AM: [ "AM", "am", "AM" ],
                PM: [ "PM", "pm", "PM" ],
                patterns: {
                    d: "M/d/yyyy",
                    D: "dddd, MMMM dd, yyyy",
                    F: "dddd, MMMM dd, yyyy h:mm:ss tt",
                    g: "M/d/yyyy h:mm tt",
                    G: "M/d/yyyy h:mm:ss tt",
                    m: "MMMM dd",
                    M: "MMMM dd",
                    s: "yyyy'-'MM'-'ddTHH':'mm':'ss",
                    t: "h:mm tt",
                    T: "h:mm:ss tt",
                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                    y: "MMMM, yyyy",
                    Y: "MMMM, yyyy"
                },
                "/": "/",
                ":": ":",
                firstDay: 0,
                twoDigitYearMax: 2029
            }
        }
    };

    function kendoCultureToIntl(kendoCulture) {
        kendoCulture = getCulture(kendoCulture) || kendo.cultures.current;
        let currencies = {};
        currencies[kendoCulture.numberFormat.currency.abbr] = kendoCulture.numberFormat.currency;
        const localeInfoAll = {};

        // Extract the name and split into language and territory if possible
        const [language, territory] = kendoCulture.name.split('-');
        localeInfoAll.name = language;
        localeInfoAll.identity = { language };
        if (territory) {
            localeInfoAll.territory = territory;
        }

        // Map number format symbols
        if (kendoCulture.numberFormat) {
            localeInfoAll.numbers = {
                symbols: {
                    decimal: kendoCulture.numberFormat["."],
                    group: kendoCulture.numberFormat[","],
                    percentSign: kendoCulture.numberFormat.percent?.symbol || "%"
                },
                decimal: {
                    patterns: kendoCulture.numberFormat.pattern,
                    groupSize: kendoCulture.numberFormat.groupSize
                },
                currency: {
                    patterns: kendoCulture.numberFormat.currency?.pattern,
                    groupSize: kendoCulture.numberFormat.currency?.groupSize
                },
                percent: {
                    patterns: kendoCulture.numberFormat.percent?.pattern,
                    groupSize: kendoCulture.numberFormat.percent?.groupSize,
                    decimals: kendoCulture.numberFormat.percent?.decimals
                }
            };

            // Map currency information if available
            if (kendoCulture.numberFormat.currency) {
                localeInfoAll.numbers.currencies = {
                    [kendoCulture.numberFormat.currency.abbr]: kendoCulture.numberFormat.currency
                };
                localeInfoAll.numbers.localeCurrency = kendoCulture.numberFormat.currency.abbr;
            }
        }

        // Map calendar information
        if (kendoCulture.calendars && kendoCulture.calendars.standard) {
            const standardCalendar = kendoCulture.calendars.standard;
            localeInfoAll.calendar = {
                patterns: {
                    d: standardCalendar.patterns.d,
                    D: standardCalendar.patterns.D,
                    F: standardCalendar.patterns.F,
                    g: standardCalendar.patterns.g,
                    G: standardCalendar.patterns.G,
                    m: standardCalendar.patterns.m,
                    M: standardCalendar.patterns.M,
                    s: standardCalendar.patterns.s,
                    t: standardCalendar.patterns.t,
                    T: standardCalendar.patterns.T,
                    u: standardCalendar.patterns.u,
                    y: standardCalendar.patterns.y,
                    Y: standardCalendar.patterns.Y
                },
                days: {
                    format: {
                        wide: standardCalendar.days.names,
                        abbreviated: standardCalendar.days.namesAbbr,
                        short: standardCalendar.days.namesShort
                    },
                    "stand-alone": {
                        wide: standardCalendar.days.names,
                        abbreviated: standardCalendar.days.namesAbbr,
                        short: standardCalendar.days.namesShort
                    }
                },
                months: {
                    format: {
                        wide: standardCalendar.months.names,
                        abbreviated: standardCalendar.months.namesAbbr,
                        narrow: standardCalendar.months.namesAbbr.map(name => name.charAt(0))
                    },
                    "stand-alone": {
                        wide: standardCalendar.months.names,
                        abbreviated: standardCalendar.months.namesAbbr,
                        narrow: standardCalendar.months.namesAbbr.map(name => name.charAt(0))
                    }
                },
                dayPeriods: {
                    format: {
                        abbreviated: {
                            am: standardCalendar.AM[0],
                            pm: standardCalendar.PM[0]
                        },
                        narrow: {
                            am: standardCalendar.AM[1],
                            pm: standardCalendar.PM[1]
                        },
                        wide: {
                            am: standardCalendar.AM[0],
                            pm: standardCalendar.PM[0]
                        }
                    },
                    "stand-alone": {
                        abbreviated: {
                            am: standardCalendar.AM[0],
                            pm: standardCalendar.PM[0]
                        },
                        narrow: {
                            am: standardCalendar.AM[1],
                            pm: standardCalendar.PM[1]
                        },
                        wide: {
                            am: standardCalendar.AM[0],
                            pm: standardCalendar.PM[0]
                        }
                    }
                }
            };

            // Include firstDay if defined
            if ('firstDay' in standardCalendar) {
                localeInfoAll.firstDay = standardCalendar.firstDay;
            }
        }
        return {
            localeInfo: () => ({
                numbers: {
                    localeCurrency: kendoCulture.numberFormat.currency.abbr,
                    currencies: currencies,
                    symbols: {
                        group: kendoCulture.numberFormat[','],
                        decimal: kendoCulture.numberFormat['.'],
                        percentSign: kendoCulture.numberFormat.percent.symbol,
                    }
                },
                calendar: {
                    patterns: kendoCulture.calendars.standard.patterns,
                    months: {
                        format: {
                            wide: kendoCulture.calendars.standard.months.names,
                            abbreviated: kendoCulture.calendars.standard.months.namesAbbr
                        }
                    },
                    days: {
                        format: {
                            wide: kendoCulture.calendars.standard.days.names,
                            abbreviated: kendoCulture.calendars.standard.days.namesAbbr
                        }
                    }
                }
            }),
            parseDate: (value, fmt) => kendo.parseExactDate(value, fmt),
            toString: (value, fmt) => toString(value, fmt),
            format: (fmt, ...values) => kendo.format(fmt, values)
        };
    }

     function findCulture(culture) {
        if (culture) {
            if (culture.numberFormat) {
                return culture;
            }

            if (typeof culture === STRING) {
                var cultures = kendo.cultures;
                return cultures[culture] || cultures[culture.split("-")[0]] || null;
            }

            return null;
        }

        return null;
    }

    function getCulture(culture) {
        if (culture) {
            culture = findCulture(culture);
        }

        return culture || kendo.cultures.current;
    }

    function appendDesignatorsToCultures(calendars) {
        // Don't ask. It's temporary.
        if ((calendars.standard.AM && calendars.standard.AM.length)
        && (calendars.standard.PM && calendars.standard.PM.length)
        && (calendars.standard.AM.indexOf("PMA0") < 0)
        && (calendars.standard.AM.indexOf("AM") > -1 || calendars.standard.PM.indexOf("PM") > -1)) {
            calendars.standard.AM.push("a", "A", "PMa", "PMA", "PMa0", "PMA0");
            calendars.standard.PM.push("p", "P", "AMp", "AMP", "AMp0", "AMP0");
        }
    }

    kendo.culture = function(cultureName) {
        var cultures = kendo.cultures, culture;

        if (cultureName !== undefined) {
            culture = findCulture(cultureName) || cultures[EN];
            culture.calendar = culture.calendars.standard;
            cultures.current = culture;
        } else {
            appendDesignatorsToCultures(cultures.current.calendars);
            return cultures.current;
        }
    };

    kendo.findCulture = findCulture;
    kendo.getCulture = getCulture;
    kendo.kendoCultureToIntl = kendoCultureToIntl;

    //set current culture to en-US.
    kendo.culture(EN);

    function formatDate(date, format, culture) {
        culture = getCulture(culture);

        var calendar = culture.calendars.standard,
            days = calendar.days,
            months = calendar.months;

        format = format.pattern || calendar.patterns[format] || format;

        return format.replace(dateFormatRegExp, function(match) {
            var minutes;
            var result;
            var sign;

            if (match === "d") {
                result = date.getDate();
            } else if (match === "dd") {
                result = pad(date.getDate());
            } else if (match === "ddd") {
                result = days.namesAbbr[date.getDay()];
            } else if (match === "dddd" || match === "EEEE") {
                result = days.names[date.getDay()];
            } else if (match === "M") {
                result = date.getMonth() + 1;
            } else if (match === "MM") {
                result = pad(date.getMonth() + 1);
            } else if (match === "MMM") {
                result = months.namesAbbr[date.getMonth()];
            } else if (match === "MMMM") {
                result = months.names[date.getMonth()];
            } else if (match === "yy") {
                result = pad(date.getFullYear() % 100);
            } else if (match === "yyyy") {
                result = pad(date.getFullYear(), 4);
            } else if (match === "h" ) {
                result = date.getHours() % 12 || 12;
            } else if (match === "hh") {
                result = pad(date.getHours() % 12 || 12);
            } else if (match === "H") {
                result = date.getHours();
            } else if (match === "HH") {
                result = pad(date.getHours());
            } else if (match === "m") {
                result = date.getMinutes();
            } else if (match === "mm") {
                result = pad(date.getMinutes());
            } else if (match === "s") {
                result = date.getSeconds();
            } else if (match === "ss") {
                result = pad(date.getSeconds());
            } else if (match === "f") {
                result = math.floor(date.getMilliseconds() / 100);
            } else if (match === "ff") {
                result = date.getMilliseconds();
                if (result > 99) {
                    result = math.floor(result / 10);
                }
                result = pad(result);
            } else if (match === "fff") {
                result = pad(date.getMilliseconds(), 3);
            } else if (match === "tt" || match === "aa") {
                result = date.getHours() < 12 ? calendar.AM[0] : calendar.PM[0];
            } else if (match === "zzz") {
                minutes = date.getTimezoneOffset();
                sign = minutes < 0;

                result = math.abs(minutes / 60).toString().split(".")[0];
                minutes = math.abs(minutes) - (result * 60);

                result = (sign ? "+" : "-") + pad(result);
                result += ":" + pad(minutes);
            } else if (match === "zz" || match === "z") {
                result = date.getTimezoneOffset() / 60;
                sign = result < 0;

                result = math.abs(result).toString().split(".")[0];
                result = (sign ? "+" : "-") + (match === "zz" ? pad(result) : result);
            }

            return result !== undefined ? result : match.slice(1, match.length - 1);
        });
    }

    //number formatting
    function formatNumber(number, format, culture) {
        culture = getCulture(culture);

        var numberFormat = culture.numberFormat,
            decimal = numberFormat[POINT],
            precision = numberFormat.decimals,
            pattern = numberFormat.pattern[0],
            literals = [],
            symbol,
            isCurrency, isPercent,
            customPrecision,
            formatAndPrecision,
            negative = number < 0,
            integer,
            fraction,
            integerLength,
            fractionLength,
            replacement = EMPTY,
            value = EMPTY,
            idx,
            length,
            ch,
            hasGroup,
            hasNegativeFormat,
            decimalIndex,
            sharpIndex,
            zeroIndex,
            hasZero, hasSharp,
            percentIndex,
            currencyIndex,
            startZeroIndex,
            start = -1,
            end;

        //return empty string if no number
        if (number === undefined) {
            return EMPTY;
        }

        if (!isFinite(number)) {
            return number;
        }

        //if no format then return number.toString() or number.toLocaleString() if culture.name is not defined
        if (!format) {
            return culture.name.length ? number.toLocaleString() : number.toString();
        }

        formatAndPrecision = standardFormatRegExp.exec(format);

        // standard formatting
        if (formatAndPrecision) {
            format = formatAndPrecision[1].toLowerCase();

            isCurrency = format === "c";
            isPercent = format === "p";

            if (isCurrency || isPercent) {
                //get specific number format information if format is currency or percent
                numberFormat = isCurrency ? numberFormat.currency : numberFormat.percent;
                decimal = numberFormat[POINT];
                precision = numberFormat.decimals;
                symbol = numberFormat.symbol;
                pattern = numberFormat.pattern[negative ? 0 : 1];
            }

            customPrecision = formatAndPrecision[2];

            if (customPrecision) {
                precision = +customPrecision;
            }

            //return number in exponential format
            if (format === "e") {
                var exp = customPrecision ? number.toExponential(precision) : number.toExponential(); // toExponential() and toExponential(undefined) differ in FF #653438.

                return exp.replace(POINT, numberFormat[POINT]);
            }

            // multiply if format is percent
            if (isPercent) {
                number *= 100;
            }

            number = round(number, precision);
            negative = number < 0;
            number = number.split(POINT);

            integer = number[0];
            fraction = number[1];

            //exclude "-" if number is negative.
            if (negative) {
                integer = integer.substring(1);
            }

            value = groupInteger(integer, 0, integer.length, numberFormat);

            if (fraction) {
                value += decimal + fraction;
            }

            if (format === "n" && !negative) {
                return value;
            }

            number = EMPTY;

            for (idx = 0, length = pattern.length; idx < length; idx++) {
                ch = pattern.charAt(idx);

                if (ch === "n") {
                    number += value;
                } else if (ch === "$" || ch === "%") {
                    number += symbol;
                } else {
                    number += ch;
                }
            }

            return number;
        }

        //custom formatting
        //
        //separate format by sections.

        if (format.indexOf("'") > -1 || format.indexOf("\"") > -1 || format.indexOf("\\") > -1) {
            format = format.replace(literalRegExp, function(match) {
                var quoteChar = match.charAt(0).replace("\\", ""),
                    literal = match.slice(1).replace(quoteChar, "");

                literals.push(literal);

                return PLACEHOLDER;
            });
        }

        format = format.split(";");
        if (negative && format[1]) {
            //get negative format
            format = format[1];
            hasNegativeFormat = true;
        } else if (number === 0 && format[2]) {
            //format for zeros
            format = format[2];
            if (format.indexOf(SHARP) == -1 && format.indexOf(ZERO) == -1) {
                //return format if it is string constant.
                return format;
            }
        } else {
            format = format[0];
        }

        percentIndex = format.indexOf("%");
        currencyIndex = format.indexOf("$");

        isPercent = percentIndex != -1;
        isCurrency = currencyIndex != -1;

        //multiply number if the format has percent
        if (isPercent) {
            number *= 100;
        }

        if (isCurrency && format[currencyIndex - 1] === "\\") {
            format = format.split("\\").join("");
            isCurrency = false;
        }

        if (isCurrency || isPercent) {
            //get specific number format information if format is currency or percent
            numberFormat = isCurrency ? numberFormat.currency : numberFormat.percent;
            decimal = numberFormat[POINT];
            precision = numberFormat.decimals;
            symbol = numberFormat.symbol;
        }

        hasGroup = format.indexOf(COMMA) > -1;
        if (hasGroup) {
            format = format.replace(commaRegExp, EMPTY);
        }

        decimalIndex = format.indexOf(POINT);
        length = format.length;

        if (decimalIndex != -1) {
            fraction = number.toString().split("e");
            if (fraction[1]) {
                fraction = round(number, Math.abs(fraction[1]));
            } else {
                fraction = fraction[0];
            }
            fraction = fraction.split(POINT)[1] || EMPTY;
            zeroIndex = format.lastIndexOf(ZERO) - decimalIndex;
            sharpIndex = format.lastIndexOf(SHARP) - decimalIndex;
            hasZero = zeroIndex > -1;
            hasSharp = sharpIndex > -1;
            idx = fraction.length;

            if (!hasZero && !hasSharp) {
                format = format.substring(0, decimalIndex) + format.substring(decimalIndex + 1);
                length = format.length;
                decimalIndex = -1;
                idx = 0;
            }

            if (hasZero && zeroIndex > sharpIndex) {
                idx = zeroIndex;
            } else if (sharpIndex > zeroIndex) {
                if (hasSharp && idx > sharpIndex) {
                    var rounded = round(number, sharpIndex, negative);

                    while (rounded.charAt(rounded.length - 1) === ZERO && sharpIndex > 0 && sharpIndex > zeroIndex) {
                        sharpIndex--;

                        rounded = round(number, sharpIndex, negative);
                    }

                    idx = sharpIndex;
                } else if (hasZero && idx < zeroIndex) {
                    idx = zeroIndex;
                }
            }
        }

        number = round(number, idx, negative);

        sharpIndex = format.indexOf(SHARP);
        startZeroIndex = zeroIndex = format.indexOf(ZERO);

        //define the index of the first digit placeholder
        if (sharpIndex == -1 && zeroIndex != -1) {
            start = zeroIndex;
        } else if (sharpIndex != -1 && zeroIndex == -1) {
            start = sharpIndex;
        } else {
            start = sharpIndex > zeroIndex ? zeroIndex : sharpIndex;
        }

        sharpIndex = format.lastIndexOf(SHARP);
        zeroIndex = format.lastIndexOf(ZERO);

        //define the index of the last digit placeholder
        if (sharpIndex == -1 && zeroIndex != -1) {
            end = zeroIndex;
        } else if (sharpIndex != -1 && zeroIndex == -1) {
            end = sharpIndex;
        } else {
            end = sharpIndex > zeroIndex ? sharpIndex : zeroIndex;
        }

        if (start == length) {
            end = start;
        }

        if (start != -1) {
            value = number.toString().split(POINT);
            integer = value[0];
            fraction = value[1] || EMPTY;

            integerLength = integer.length;
            fractionLength = fraction.length;

            if (negative && (number * -1) >= 0) {
                negative = false;
            }

            number = format.substring(0, start);

            if (negative && !hasNegativeFormat) {
                number += "-";
            }

            idx = start;
            while (idx < length) {
                ch = format.charAt(idx);

                if (decimalIndex == -1) {
                    if (end - idx < integerLength) {
                        number += integer;
                        break;
                    }
                } else {
                    if (zeroIndex != -1 && zeroIndex < idx) {
                        replacement = EMPTY;
                    }

                    if ((decimalIndex - idx) <= integerLength && decimalIndex - idx > -1) {
                        number += integer;
                        idx = decimalIndex;
                    }

                    if (decimalIndex === idx) {
                        number += (fraction ? decimal : EMPTY) + fraction;
                        idx += end - decimalIndex + 1;
                        continue;
                    }
                }

                if (ch === ZERO) {
                    number += ch;
                    replacement = ch;
                } else if (ch === SHARP) {
                    number += replacement;
                }
                idx++;
            }

            if (hasGroup) {
                number = groupInteger(number, start + (negative && !hasNegativeFormat ? 1 : 0), Math.max(end, (integerLength + start)), numberFormat);
            }

            if (end >= start) {
                number += format.substring(end + 1);
            }

            //replace symbol placeholders
            if (isCurrency || isPercent) {
                value = EMPTY;
                for (idx = 0, length = number.length; idx < length; idx++) {
                    ch = number.charAt(idx);
                    value += (ch === "$" || ch === "%") ? symbol : ch;
                }
                number = value;
            }

            length = literals.length;

            if (length) {
                for (idx = 0; idx < length; idx++) {
                    number = number.replace(PLACEHOLDER, literals[idx]);
                }
            }
        }

        return number;
    }

    var groupInteger = function(number, start, end, numberFormat) {
        var decimalIndex = number.indexOf(numberFormat[POINT]);
        var groupSizes = numberFormat.groupSize.slice();
        var groupSize = groupSizes.shift();
        var integer, integerLength;
        var idx, parts, value;
        var newGroupSize;

        end = decimalIndex !== -1 ? decimalIndex : end + 1;

        integer = number.substring(start, end);
        integerLength = integer.length;

        if (integerLength >= groupSize) {
            idx = integerLength;
            parts = [];

            while (idx > -1) {
                value = integer.substring(idx - groupSize, idx);
                if (value) {
                    parts.push(value);
                }
                idx -= groupSize;
                newGroupSize = groupSizes.shift();
                groupSize = newGroupSize !== undefined ? newGroupSize : groupSize;

                if (groupSize === 0) {
                    if (idx > 0) {
                        parts.push(integer.substring(0, idx));
                    }
                    break;
                }
            }

            integer = parts.reverse().join(numberFormat[COMMA]);
            number = number.substring(0, start) + integer + number.substring(end);
        }

        return number;
    };

    var round = function(value, precision, negative) {
        precision = precision || 0;

        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + precision) : precision)));

        if (negative) {
            value = -value;
        }

        value = value.toString().split('e');
        value = +(value[0] + 'e' + (value[1] ? (+value[1] - precision) : -precision));

        return value.toFixed(Math.min(precision, 20));
    };

    var toString = function(value, fmt, culture) {
        if (fmt) {
            if (objectToString.call(value) === "[object Date]") {
                return formatDate(value, fmt, culture);
            } else if (typeof value === NUMBER) {
                return formatNumber(value, fmt, culture);
            }
        }

        return value !== undefined ? value : "";
    };

    kendo.format = function(fmt) {
        var values = arguments;

        return fmt.replace(formatRegExp, function(match, index, placeholderFormat) {
            var value = values[parseInt(index, 10) + 1];

            return toString(value, placeholderFormat ? placeholderFormat.substring(1) : "");
        });
    };

    kendo._extractFormat = function(format) {
        if (format.slice(0,3) === "{0:") {
            format = format.slice(3, format.length - 1);
        }

        return format;
    };

    kendo._activeElement = function() {
        try {
            return document.activeElement;
        } catch (e) {
            return document.documentElement.activeElement;
        }
    };

    kendo._round = round;
    kendo._outerWidth = function(element, includeMargin, calculateFromHidden) {
        element = $(element);
        if (calculateFromHidden) {
            return getHiddenDimensions(element, includeMargin).width;
        }

        return $(element).outerWidth(includeMargin || false) || 0;
    };
    kendo._outerHeight = function(element, includeMargin, calculateFromHidden) {
        element = $(element);
        if (calculateFromHidden) {
            return getHiddenDimensions(element, includeMargin).height;
        }

        return $(element).outerHeight(includeMargin || false) || 0;
    };
    kendo.toString = toString;
})();


(function() {
    var nonBreakingSpaceRegExp = /\u00A0/g,
        spaceRegExp = /\s/g,
        exponentRegExp = /[eE][\-+]?[0-9]+/,
        shortTimeZoneRegExp = /[+|\-]\d{1,2}/,
        longTimeZoneRegExp = /[+|\-]\d{1,2}:?\d{2}/,
        dateRegExp = /^\/Date\((.*?)\)\/$/,
        offsetRegExp = /[+-]\d*/,
        FORMATS_SEQUENCE = [ [], [ "G", "g", "F" ], [ "D", "d", "y", "m", "T", "t" ] ],
        STANDARD_FORMATS = [
            [
            "yyyy-MM-ddTHH:mm:ss.fffffffzzz",
            "yyyy-MM-ddTHH:mm:ss.fffffff",
            "yyyy-MM-ddTHH:mm:ss.fffzzz",
            "yyyy-MM-ddTHH:mm:ss.fff",
            "ddd MMM dd yyyy HH:mm:ss",
            "yyyy-MM-ddTHH:mm:sszzz",
            "yyyy-MM-ddTHH:mmzzz",
            "yyyy-MM-ddTHH:mmzz",
            "yyyy-MM-ddTHH:mm:ss",
            "yyyy-MM-dd HH:mm:ss",
            "yyyy/MM/dd HH:mm:ss"
            ], [
            "yyyy-MM-ddTHH:mm",
            "yyyy-MM-dd HH:mm",
            "yyyy/MM/dd HH:mm"
            ], [
            "yyyy/MM/dd",
            "yyyy-MM-dd",
            "HH:mm:ss",
            "HH:mm"
            ]
        ],
        numberRegExp = {
            2: /^\d{1,2}/,
            3: /^\d{1,3}/,
            4: /^\d{4}/,
            exact3: /^\d{3}/
        },
        objectToString = {}.toString;

    function outOfRange(value, start, end) {
        return !(value >= start && value <= end);
    }

    function designatorPredicate(designator) {
        return designator.charAt(0);
    }

    function mapDesignators(designators) {
        return $.map(designators, designatorPredicate);
    }

    //if date's day is different than the typed one - adjust
    function adjustDST(date, hours) {
        if (!hours && date.getHours() === 23) {
            date.setHours(date.getHours() + 2);
        }
    }

    function lowerArray(data) {
        var idx = 0,
            length = data.length,
            array = [];

        for (; idx < length; idx++) {
            array[idx] = (data[idx] + "").toLowerCase();
        }

        return array;
    }

    function lowerLocalInfo(localInfo) {
        var newLocalInfo = {}, property;

        for (property in localInfo) {
            newLocalInfo[property] = lowerArray(localInfo[property]);
        }

        return newLocalInfo;
    }

    function unpadZero(value) {
        return value.replace(/^0*/, '');
    }

    function longestDesignatorLength(designators) {
        return Array.from(designators).sort((a, b) => b.length - a.length)[0].length;
    }

    function parseExact(value, format, culture, strict, shouldUnpadZeros) {
        if (!value) {
            return null;
        }

        var lookAhead = function(match) {
                var i = 0;
                while (format[idx] === match) {
                    i++;
                    idx++;
                }
                if (i > 0) {
                    idx -= 1;
                }
                return i;
            },
            getNumber = function(size) {
                var rg, match, part = "";
                if (size === 2) {
                    for (let i = 0; i <= size; i++) {
                        part += value[valueIdx + i] || "";
                    }
                }

                // If the value comes in the form of 021, 022, 023 we must trim the leading zero otherwise the result will be 02 in all three cases instead of 21/22/23.
                if (shouldUnpadZeros && part.match(numberRegExp.exact3) && Number.isInteger(Number(part)) && Number(part) > 0) {
                    part = unpadZero(part);
                } else {
                    part = value.substr(valueIdx, size);
                }

                rg = numberRegExp[size] || new RegExp('^\\d{1,' + size + '}');
                match = part.match(rg);

                if (match) {
                    match = match[0];
                    valueIdx += match.length;
                    return parseInt(match, 10);
                }
                return null;
            },
            getIndexByName = function(names, lower, subLength) {
                var i = 0,
                    length = names.length,
                    name, nameLength,
                    matchLength = 0,
                    matchIdx = 0,
                    subValue;

                for (; i < length; i++) {
                    name = names[i];
                    nameLength = name.length;
                    subValue = value.substr(valueIdx, subLength || nameLength); // The `subLength` is part of the appendDesignatorsToCultures logic.

                    if (lower) {
                        subValue = subValue.toLowerCase();
                    }

                    if (subValue == name && nameLength > matchLength) {
                        matchLength = nameLength;
                        matchIdx = i;
                    }
                }

                if (matchLength) {
                    valueIdx += matchLength;
                    return matchIdx + 1;
                }

                return null;
            },
            checkLiteral = function() {
                var result = false;
                if (value.charAt(valueIdx) === format[idx]) {
                    valueIdx++;
                    result = true;
                }
                return result;
            },
            calendar = culture.calendars.standard,
            year = null,
            month = null,
            day = null,
            hours = null,
            minutes = null,
            seconds = null,
            milliseconds = null,
            idx = 0,
            valueIdx = 0,
            literal = false,
            date = new Date(),
            twoDigitYearMax = calendar.twoDigitYearMax || 2029,
            defaultYear = date.getFullYear(),
            ch, count, length, pattern,
            pmHour, UTC, matches,
            amDesignators, pmDesignators,
            hoursOffset, minutesOffset,
            hasTime, match;

        if (!format) {
            format = "d"; //shord date format
        }

        //if format is part of the patterns get real format
        pattern = calendar.patterns[format];
        if (pattern) {
            format = pattern;
        }

        format = format.split("");
        length = format.length;

        for (; idx < length; idx++) {
            ch = format[idx];

            if (literal) {
                if (ch === "'") {
                    literal = false;
                } else {
                    checkLiteral();
                }
            } else {
                if (ch === "d") {
                    count = lookAhead("d");
                    if (!calendar._lowerDays) {
                        calendar._lowerDays = lowerLocalInfo(calendar.days);
                    }

                    if (day !== null && count > 2) {
                        continue;
                    }

                    day = count < 3 ? getNumber(2) : getIndexByName(calendar._lowerDays[count == 3 ? "namesAbbr" : "names"], true);

                    if (day === null || outOfRange(day, 1, 31)) {
                        return null;
                    }
                } else if (ch === "M") {
                    count = lookAhead("M");
                    if (!calendar._lowerMonths) {
                        calendar._lowerMonths = lowerLocalInfo(calendar.months);
                    }
                    month = count < 3 ? getNumber(2) : getIndexByName(calendar._lowerMonths[count == 3 ? 'namesAbbr' : 'names'], true);

                    if (month === null || outOfRange(month, 1, 12)) {
                        return null;
                    }
                    month -= 1; //because month is zero based
                } else if (ch === "y") {
                    count = lookAhead("y");
                    year = getNumber(count);

                    if (year === null) {
                        return null;
                    }

                    if (count == 2) {
                        if (typeof twoDigitYearMax === "string") {
                            twoDigitYearMax = defaultYear + parseInt(twoDigitYearMax, 10);
                        }

                        year = (defaultYear - defaultYear % 100) + year;
                        if (year > twoDigitYearMax) {
                            year -= 100;
                        }
                    }
                } else if (ch === "h" ) {
                    lookAhead("h");
                    hours = getNumber(2);
                    if (hours == 12) {
                        hours = 0;
                    }
                    if (hours === null || outOfRange(hours, 0, 11)) {
                        return null;
                    }
                } else if (ch === "H") {
                    lookAhead("H");
                    hours = getNumber(2);
                    if (hours === null || outOfRange(hours, 0, 23)) {
                        return null;
                    }
                } else if (ch === "m") {
                    lookAhead("m");
                    minutes = getNumber(2);
                    if (minutes === null || outOfRange(minutes, 0, 59)) {
                        return null;
                    }
                } else if (ch === "s") {
                    lookAhead("s");
                    seconds = getNumber(2);
                    if (seconds === null || outOfRange(seconds, 0, 59)) {
                        return null;
                    }
                } else if (ch === "f") {
                    count = lookAhead("f");

                    match = value.substr(valueIdx, count).match(numberRegExp[3]);
                    milliseconds = getNumber(count); //move value index position

                    if (milliseconds !== null) {
                        milliseconds = parseFloat("0." + match[0], 10);
                        milliseconds = kendo._round(milliseconds, 3);
                        milliseconds *= 1000;
                    }

                    if (milliseconds === null || outOfRange(milliseconds, 0, 999)) {
                        return null;
                    }

                } else if (ch === "t") {
                    count = lookAhead("t");
                    amDesignators = calendar.AM;
                    pmDesignators = calendar.PM;

                    if (count === 1) {
                        amDesignators = mapDesignators(amDesignators);
                        pmDesignators = mapDesignators(pmDesignators);
                    }

                    pmHour = getIndexByName(pmDesignators, false, longestDesignatorLength(pmDesignators));
                    if (!pmHour && !getIndexByName(amDesignators, false, longestDesignatorLength(amDesignators))) {
                        return null;
                    }
                }
                else if (ch === "z") {
                    UTC = true;
                    count = lookAhead("z");

                    if (value.substr(valueIdx, 1) === "Z") {
                        checkLiteral();
                        continue;
                    }

                    matches = value.substr(valueIdx, 6)
                                   .match(count > 2 ? longTimeZoneRegExp : shortTimeZoneRegExp);

                    if (!matches) {
                        return null;
                    }

                    matches = matches[0].split(":");

                    hoursOffset = matches[0];
                    minutesOffset = matches[1];

                    if (!minutesOffset && hoursOffset.length > 3) { //(+|-)[hh][mm] format is used
                        valueIdx = hoursOffset.length - 2;
                        minutesOffset = hoursOffset.substring(valueIdx);
                        hoursOffset = hoursOffset.substring(0, valueIdx);
                    }

                    hoursOffset = parseInt(hoursOffset, 10);
                    if (outOfRange(hoursOffset, -12, 13)) {
                        return null;
                    }

                    if (count > 2) {
                        minutesOffset = matches[0][0] + minutesOffset;
                        minutesOffset = parseInt(minutesOffset, 10);
                        if (isNaN(minutesOffset) || outOfRange(minutesOffset, -59, 59)) {
                            return null;
                        }
                    }
                } else if (ch === "'") {
                    literal = true;
                    checkLiteral();
                } else if (!checkLiteral()) {
                    return null;
                }
            }
        }

        // if more characters follow, assume wrong format
        // https://github.com/telerik/kendo-ui-core/issues/3476
        if (strict && !/^\s*$/.test(value.substr(valueIdx))) {
            return null;
        }

        hasTime = hours !== null || minutes !== null || seconds || null;

        if (year === null && month === null && day === null && hasTime) {
            year = defaultYear;
            month = date.getMonth();
            day = date.getDate();
        } else {
            if (year === null) {
                year = defaultYear;
            }

            if (day === null) {
                day = 1;
            }
        }

        if (pmHour && hours < 12) {
            hours += 12;
        }

        if (UTC) {
            if (hoursOffset) {
                hours += -hoursOffset;
            }

            if (minutesOffset) {
                minutes += -minutesOffset;
            }

            value = new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
        } else {
            value = new Date(year, month, day, hours, minutes, seconds, milliseconds);
            adjustDST(value, hours);
        }

        if (year < 100) {
            value.setFullYear(year);
        }

        if (value.getDate() !== day && UTC === undefined) {
            return null;
        }

        return value;
    }

    function parseMicrosoftFormatOffset(offset) {
        var sign = offset.substr(0, 1) === "-" ? -1 : 1;

        offset = offset.substring(1);
        offset = (parseInt(offset.substr(0, 2), 10) * 60) + parseInt(offset.substring(2), 10);

        return sign * offset;
    }

    function getDefaultFormats(culture) {
        var length = math.max(FORMATS_SEQUENCE.length, STANDARD_FORMATS.length);
        var calendar = culture.calendar || culture.calendars.standard;
        var patterns = calendar.patterns;
        var cultureFormats, formatIdx, idx;
        var formats = [];

        for (idx = 0; idx < length; idx++) {
            cultureFormats = FORMATS_SEQUENCE[idx];
            for (formatIdx = 0; formatIdx < cultureFormats.length; formatIdx++) {
                formats.push(patterns[cultureFormats[formatIdx]]);
            }
            formats = formats.concat(STANDARD_FORMATS[idx]);
        }

        return formats;
    }

    function internalParseDate(value, formats, culture, strict, shouldUnpadZeros) {
        if (objectToString.call(value) === "[object Date]") {
            return value;
        }

        var idx = 0;
        var date = null;
        var length;
        var tzoffset;

        if (value && value.indexOf("/D") === 0) {
            date = dateRegExp.exec(value);
            if (date) {
                date = date[1];
                tzoffset = offsetRegExp.exec(date.substring(1));

                date = new Date(parseInt(date, 10));

                if (tzoffset) {
                    tzoffset = parseMicrosoftFormatOffset(tzoffset[0]);
                    date = kendo.timezone.apply(date, 0);
                    date = kendo.timezone.convert(date, 0, -1 * tzoffset);
                }

                return date;
            }
        }

        culture = kendo.getCulture(culture);

        if (!formats) {
            formats = getDefaultFormats(culture);
        }

        formats = isArray(formats) ? formats : [formats];
        length = formats.length;

        for (; idx < length; idx++) {
            date = parseExact(value, formats[idx], culture, strict, shouldUnpadZeros);
            if (date) {
                return date;
            }
        }

        return date;
    }

    kendo.parseDate = function(value, formats, culture, shouldUnpadZeros) {
        return internalParseDate(value, formats, culture, false, shouldUnpadZeros);
    };

    kendo.parseExactDate = function(value, formats, culture) {
        return internalParseDate(value, formats, culture, true);
    };

    kendo.parseInt = function(value, culture) {
        var result = kendo.parseFloat(value, culture);
        if (result) {
            result = result | 0;
        }
        return result;
    };

    kendo.parseFloat = function(value, culture, format) {
        if (!value && value !== 0) {
           return null;
        }

        if (typeof value === NUMBER) {
           return value;
        }

        value = value.toString();
        culture = kendo.getCulture(culture);

        var number = culture.numberFormat,
            percent = number.percent,
            currency = number.currency,
            symbol = currency.symbol,
            percentSymbol = percent.symbol,
            negative = value.indexOf("-"),
            parts, isPercent;

        //handle exponential number
        if (exponentRegExp.test(value)) {
            value = parseFloat(value.replace(number["."], "."));
            if (isNaN(value)) {
                value = null;
            }
            return value;
        }

        if (negative > 0) {
            return null;
        } else {
            negative = negative > -1;
        }

        if (value.indexOf(symbol) > -1 || (format && format.toLowerCase().indexOf("c") > -1)) {
            number = currency;
            parts = number.pattern[0].replace("$", symbol).split("n");
            if (value.indexOf(parts[0]) > -1 && value.indexOf(parts[1]) > -1) {
                value = value.replace(parts[0], "").replace(parts[1], "");
                negative = true;
            }
        } else if (value.indexOf(percentSymbol) > -1) {
            isPercent = true;
            number = percent;
            symbol = percentSymbol;
        }

        value = value.replace("-", "")
                     .replace(symbol, "")
                     .replace(nonBreakingSpaceRegExp, " ")
                     .split(number[","].replace(nonBreakingSpaceRegExp, " ")).join("")
                     .replace(spaceRegExp, "")
                     .replace(number["."], ".");

        value = parseFloat(value);

        if (isNaN(value)) {
            value = null;
        } else if (negative) {
            value *= -1;
        }

        if (value && isPercent) {
            value /= 100;
        }

        return value;
    };
})();

    function getShadows(element) {
        var shadow = element.css("box-shadow"),
            radius = shadow ? shadow.match(boxShadowRegExp) || [ 0, 0, 0, 0, 0 ] : [ 0, 0, 0, 0, 0 ],
            blur = math.max((+radius[3]), +(radius[4] || 0));

        return {
            left: (-radius[1]) + blur,
            right: (+radius[1]) + blur,
            bottom: (+radius[2]) + blur
        };
    }

    function getHiddenDimensions(element, includeMargin) {
        var clone, width, height;

        clone = element.clone();
        clone.css("display", "");
        clone.css("visibility", "hidden");
        clone.appendTo($("body"));

        width = clone.outerWidth(includeMargin || false);
        height = clone.outerHeight(includeMargin || false);

        clone.remove();

        return {
            width: width || 0,
            height: height || 0
        };
    }

    function wrap(element, autosize, resize, shouldCorrectWidth = true, autowidth) {
        var percentage,
            outerWidth = kendo._outerWidth,
            outerHeight = kendo._outerHeight,
            parent = element.parent(),
            windowOuterWidth = outerWidth(window);

        parent.parent().removeClass("k-animation-container-sm");

        if (!parent.hasClass("k-child-animation-container")) {
            var width = element[0].style.width,
                height = element[0].style.height,
                percentWidth = percentRegExp.test(width),
                percentHeight = percentRegExp.test(height),
                forceDimensions = element.hasClass("k-tooltip") || element.is(".k-menu-horizontal.k-context-menu"),
                calculateFromHidden = element.hasClass("k-tooltip");

            percentage = percentWidth || percentHeight;

            if (!percentWidth && (!autosize || (autosize && width) || forceDimensions)) { width = autosize ? outerWidth(element, false, calculateFromHidden) + 1 : outerWidth(element, false, calculateFromHidden); }
            if (!percentHeight && (!autosize || (autosize && height)) || forceDimensions) { height = outerHeight(element, false, calculateFromHidden); }

            element.wrap(
                $("<div/>")
                .addClass("k-child-animation-container")
                .css({
                    width: autowidth ? "auto" : width,
                    height: height
                }));
            parent = element.parent();

            parent.wrap(
                         $("<div/>")
                         .addClass("k-animation-container")
                         .attr("role", "region")
                        );

            if (percentage) {
                element.css({
                    width: "100%",
                    height: "100%"
                });
            }
        } else {
            wrapResize(element, autosize, shouldCorrectWidth);
        }

        parent = parent.parent();

        if (windowOuterWidth < outerWidth(parent)) {
            parent.addClass("k-animation-container-sm");
            resize = true;
        }

        if (resize) {
            wrapResize(element, autosize, shouldCorrectWidth);
        }

        return parent;
    }

    function wrapResize(element, autosize, shouldCorrectWidth) {
        var percentage,
            outerWidth = kendo._outerWidth,
            outerHeight = kendo._outerHeight,
            parent = element.parent(),
            wrapper = element.closest(".k-animation-container"),
            calculateFromHidden = element.hasClass("k-tooltip"),
            visible = element.is(":visible"),
            wrapperStyle = parent[0].style,
            elementHeight = element[0].style.height;

        if (wrapper.is(":hidden")) {
            wrapper.css({
                display: "",
                position: ""
            });
        }

        percentage = percentRegExp.test(wrapperStyle.width) || percentRegExp.test(wrapperStyle.height);

        if (!percentage) {
            if (!visible) {
                element.add(parent).show();
            }
            if (shouldCorrectWidth) {
                parent.css("width", ""); // Needed to get correct width dimensions
            }
            parent.css({
                width: autosize ? outerWidth(element, false, calculateFromHidden) + 1 : outerWidth(element, false, calculateFromHidden),
            });

            if (elementHeight === "auto") {
                element.css({ height: outerHeight(parent) });
            } else {
                parent.css({
                    height: outerHeight(element)
                });
            }

            if (!visible) {
                element.hide();
            }
        }
    }

    function deepExtend(destination) {
        var i = 1,
            length = arguments.length;

        for (i = 1; i < length; i++) {
            deepExtendOne(destination, arguments[i]);
        }

        return destination;
    }

    function deepExtendOne(destination, source) {
        var ObservableArray = kendo.data.ObservableArray,
            LazyObservableArray = kendo.data.LazyObservableArray,
            DataSource = kendo.data.DataSource,
            HierarchicalDataSource = kendo.data.HierarchicalDataSource,
            property,
            propValue,
            propType,
            propInit,
            destProp;

        for (property in source) {
            if (property === '__proto__' || property === 'constructor' || property === 'prototype') {
                continue;
            }

            propValue = source[property];
            propType = typeof propValue;

            if (propType === OBJECT && propValue !== null) {
                propInit = propValue.constructor;
            } else {
                propInit = null;
            }

            if (propInit &&
                propInit !== Array && propInit !== ObservableArray && propInit !== LazyObservableArray &&
                propInit !== DataSource && propInit !== HierarchicalDataSource && propInit !== RegExp &&
                (!kendo.isFunction(window.ArrayBuffer) || propInit !== ArrayBuffer) && !(propValue instanceof HTMLElement)) {

                if (propValue instanceof Date) {
                    destination[property] = new Date(propValue.getTime());
                } else if (isFunction(propValue.clone)) {
                    destination[property] = propValue.clone();
                } else {
                    destProp = destination[property];
                    if (typeof (destProp) === OBJECT) {
                        destination[property] = destProp || {};
                    } else {
                        destination[property] = {};
                    }
                    deepExtendOne(destination[property], propValue);
                }
            } else if (propType !== UNDEFINED) {
                destination[property] = propValue;
            }
        }

        return destination;
    }

    function testRx(agent, rxs, dflt) {
        for (var rx in rxs) {
            if (rxs.hasOwnProperty(rx) && rxs[rx].test(agent)) {
                return rx;
            }
        }
        return dflt !== undefined ? dflt : agent;
    }

    function toHyphens(str) {
        return str.replace(/([a-z][A-Z])/g, function(g) {
            return g.charAt(0) + '-' + g.charAt(1).toLowerCase();
        });
    }

    function toCamelCase(str) {
        return str.replace(/\-(\w)/g, function(strMatch, g1) {
            return g1.toUpperCase();
        });
    }

    function getComputedStyles(element, properties) {
        var styles = {}, computedStyle;

        if (document.defaultView && document.defaultView.getComputedStyle) {
            computedStyle = document.defaultView.getComputedStyle(element, "");

            if (properties) {
                $.each(properties, function(idx, value) {
                    styles[value] = computedStyle.getPropertyValue(value);
                });
            }
        } else {
            computedStyle = element.currentStyle;

            if (properties) {
                $.each(properties, function(idx, value) {
                    styles[value] = computedStyle[toCamelCase(value)];
                });
            }
        }

        if (!kendo.size(styles)) {
            styles = computedStyle;
        }

        return styles;
    }

    function isScrollable(element) {
        if (element.dataset[kendo.ns + "scrollable"] === "false") {
            return false;
        }

        if (element && element.className && typeof(element.className) === "string" && element.className.indexOf("k-auto-scrollable") > -1) {
            return true;
        }

        var overflow = getComputedStyles(element, ["overflow"]).overflow;
        return overflow.indexOf("auto") > -1 || overflow.indexOf("scroll") > -1;
    }

    function scrollLeft(element, value) {
        var webkit = support.browser.webkit;
        var mozila = support.browser.mozilla;
        var browserVersion = support.browser.version;
        var el, isRtl;

        if (element instanceof $ && value !== undefined) {
            element.each(function(i, e) {
                scrollLeft(e, value);
            });

            return;
        } else {
            el = element instanceof $ ? element[0] : element;
        }

        if (!el) {
            return;
        }

        isRtl = support.isRtl(element);

        // After updating browser detection,
        // Test in which if should the Safari browsers go
        if (value !== undefined) {
            if (isRtl && webkit && (browserVersion < 85 || support.browser.safari)) {
                el.scrollLeft = el.scrollWidth - el.clientWidth - value;
            } else if (isRtl && (mozila || webkit) && value > 0) {
                el.scrollLeft = -value;
            } else {
                el.scrollLeft = value;
            }
        } else {
            if (isRtl && webkit && (browserVersion < 85 || support.browser.safari)) {
                return el.scrollWidth - el.clientWidth - el.scrollLeft;
            } else {
                return Math.abs(el.scrollLeft);
            }
        }
    }

    (function() {
        support._scrollbar = undefined;

        support.scrollbar = function(refresh) {
            if (!isNaN(support._scrollbar) && !refresh) {
                return support._scrollbar;
            } else {
                var div = document.createElement("div"),
                    result;

                div.style.cssText = "overflow:scroll;overflow-x:hidden;zoom:1;clear:both;display:block";
                div.innerHTML = "&nbsp;";
                document.body.appendChild(div);

                support._scrollbar = result = div.offsetWidth - div.scrollWidth;

                document.body.removeChild(div);

                return result;
            }
        };

        support.isRtl = function(element) {
            return $(element).closest(".k-rtl").length > 0;
        };

        var table = document.createElement("table");

        // Internet Explorer does not support setting the innerHTML of TBODY and TABLE elements
        try {
            table.innerHTML = "<tr><td></td></tr>";

            support.tbodyInnerHtml = true;
        } catch (e) {
            support.tbodyInnerHtml = false;
        }

        support.touch = "ontouchstart" in window;

        let docStyle = document.documentElement.style;
        let elementProto = "HTMLElement" in window ? HTMLElement.prototype : [];

        // Transforms and Transitions - no longer required, however these were public properties in the past.
        // It is possible some customers may have used them so keep them for the time being.
        support.transforms = support.transitions = { css: "", prefix: "", event: "transitionend" };
        support.hasHW3D = ("WebKitCSSMatrix" in window && "m11" in new window.WebKitCSSMatrix()) || "MozPerspective" in docStyle || "msPerspective" in docStyle;
        support.cssFlexbox = ("flexWrap" in docStyle) || ("WebkitFlexWrap" in docStyle) || ("msFlexWrap" in docStyle);

        table = null;
        support.devicePixelRatio = window.devicePixelRatio === undefined ? 1 : window.devicePixelRatio;

        try {
            support.screenWidth = window.outerWidth || window.screen ? window.screen.availWidth : window.innerWidth;
            support.screenHeight = window.outerHeight || window.screen ? window.screen.availHeight : window.innerHeight;
        } catch (e) {
            //window.outerWidth throws error when in IE showModalDialog.
            support.screenWidth = window.screen.availWidth;
            support.screenHeight = window.screen.availHeight;
        }

        support.detectOS = function(ua) {
            var os = false, minorVersion, match = [],
                notAndroidPhone = !/mobile safari/i.test(ua),
                agentRxs = {
                    wp: /(Windows Phone(?: OS)?)\s(\d+)\.(\d+(\.\d+)?)/,
                    fire: /(Silk)\/(\d+)\.(\d+(\.\d+)?)/,
                    android: /(Android|Android.*(?:Opera|Firefox).*?\/)\s*(\d+)\.?(\d+(\.\d+)?)?/,
                    iphone: /(iPhone|iPod).*OS\s+(\d+)[\._]([\d\._]+)/,
                    ipad: /(iPad).*OS\s+(\d+)[\._]([\d_]+)/,
                    meego: /(MeeGo).+NokiaBrowser\/(\d+)\.([\d\._]+)/,
                    webos: /(webOS)\/(\d+)\.(\d+(\.\d+)?)/,
                    blackberry: /(BlackBerry|BB10).*?Version\/(\d+)\.(\d+(\.\d+)?)/,
                    playbook: /(PlayBook).*?Tablet\s*OS\s*(\d+)\.(\d+(\.\d+)?)/,
                    windows: /(MSIE)\s+(\d+)\.(\d+(\.\d+)?)/,
                    tizen: /(tizen).*?Version\/(\d+)\.(\d+(\.\d+)?)/i,
                    sailfish: /(sailfish).*rv:(\d+)\.(\d+(\.\d+)?).*firefox/i,
                    ffos: /(Mobile).*rv:(\d+)\.(\d+(\.\d+)?).*Firefox/
                },
                osRxs = {
                    ios: /^i(phone|pad|pod)$/i,
                    android: /^android|fire$/i,
                    blackberry: /^blackberry|playbook/i,
                    windows: /windows/,
                    wp: /wp/,
                    flat: /sailfish|ffos|tizen/i,
                    meego: /meego/
                },
                formFactorRxs = {
                    tablet: /playbook|ipad|fire/i
                },
                browserRxs = {
                    omini: /Opera\sMini/i,
                    omobile: /Opera\sMobi/i,
                    firefox: /Firefox|Fennec/i,
                    mobilesafari: /version\/.*safari/i,
                    ie: /MSIE|Windows\sPhone/i,
                    chrome: /chrome|crios/i,
                    webkit: /webkit/i,
                    edge: /edge|edg|edgios|edga/i
                };

            for (var agent in agentRxs) {
                if (agentRxs.hasOwnProperty(agent)) {
                    match = ua.match(agentRxs[agent]);
                    if (match) {
                        if (agent == "windows" && "plugins" in navigator) { return false; } // Break if not Metro/Mobile Windows

                        os = {};
                        os.device = agent;
                        os.tablet = testRx(agent, formFactorRxs, false);
                        os.browser = testRx(ua, browserRxs, "default");
                        os.name = testRx(agent, osRxs);
                        os[os.name] = true;
                        os.majorVersion = match[2];
                        os.minorVersion = (match[3] || "0").replace("_", ".");
                        minorVersion = os.minorVersion.replace(".", "").substr(0, 2);
                        os.flatVersion = os.majorVersion + minorVersion + (new Array(3 - (minorVersion.length < 3 ? minorVersion.length : 2)).join("0"));
                        os.cordova = typeof window.PhoneGap !== UNDEFINED || typeof window.cordova !== UNDEFINED; // Use file protocol to detect appModes.
                        os.appMode = window.navigator.standalone || (/file|local|wmapp/).test(window.location.protocol) || os.cordova; // Use file protocol to detect appModes.

                        if (os.android && (support.devicePixelRatio < 1.5 && os.flatVersion < 400 || notAndroidPhone) && (support.screenWidth > 800 || support.screenHeight > 800)) {
                            os.tablet = agent;
                        }

                        break;
                    }
                }
            }
            return os;
        };

        var mobileOS = support.mobileOS = support.detectOS(navigator.userAgent);

        support.wpDevicePixelRatio = mobileOS.wp ? screen.width / 320 : 0;

        support.hasNativeScrolling = false;

        if (mobileOS.ios || (mobileOS.android && mobileOS.majorVersion > 2) || mobileOS.wp) {
            support.hasNativeScrolling = mobileOS;
        }

        support.delayedClick = function() {

            // only the mobile devices with touch events do this.
            if (support.touch) {
                // All iOS devices so far (by the time I am writing this, iOS 9.0.2 is the latest),
                // delay their click events.
                if (mobileOS.ios) {
                    return true;
                }

                if (mobileOS.android) {

                    if (!support.browser.chrome) { // older webkits and webviews delay the click
                        return true;
                    }

                    // from here on, we deal with Chrome on Android.
                    if (support.browser.version < 32) {
                        return false;
                    }

                    // Chrome 32+ does conditional fast clicks if the view port is not user scalable.
                    return !($("meta[name=viewport]").attr("content") || "").match(/user-scalable=no/i);
                }
            }

            return false;
        };

        support.mouseAndTouchPresent = support.touch && !(support.mobileOS.ios || support.mobileOS.android);

        support.detectBrowser = function(ua) {
            var browser = false,
                match = [],
                chromiumEdgeMatch = [],
                browserRxs = {
                    edge: /(edge)[ \/]([\w.]+)/i,
                    webkit: /(chrome|crios)[ \/]([\w.]+)/i,
                    safari: /(webkit)[ \/]([\w.]+)/i,
                    opera: /(opera)(?:.*version|)[ \/]([\w.]+)/i,
                    msie: /(msie\s|trident.*? rv:)([\w.]+)/i,
                    mozilla: /(mozilla)(?:.*? rv:([\w.]+)|)/i
                };

            for (var agent in browserRxs) {
                if (browserRxs.hasOwnProperty(agent)) {
                    match = ua.match(browserRxs[agent]);
                    if (match) {
                        browser = {};
                        browser[agent] = true;
                        browser[match[1].toLowerCase().split(" ")[0].split("/")[0]] = true;
                        browser.version = parseInt(document.documentMode || match[2], 10);

                        if (browser.chrome) {
                            chromiumEdgeMatch = ua.match(/(edg)[ \/]([\w.]+)/i);

                            if (chromiumEdgeMatch) {
                                browser.chromiumEdge = true;
                            }
                        }

                        break;
                    }
                }
            }

            return browser;
        };

        support.browser = support.detectBrowser(navigator.userAgent);

        if (!mobileOS && support.touch && support.browser.safari) {
            mobileOS = support.mobileOS = {
                ios: true,
                tablet: "tablet",
                device: "ipad",
                majorVersion: 13
            };
        }

        support.detectClipboardAccess = function() {
            var commands = {
                copy: document.queryCommandSupported ? document.queryCommandSupported("copy") : false,
                cut: document.queryCommandSupported ? document.queryCommandSupported("cut") : false,
                paste: document.queryCommandSupported ? document.queryCommandSupported("paste") : false
            };

            if (support.browser.chrome) {
                //not using queryCommandSupported due to chromium issues 476508 and 542948
                commands.paste = false;
                if (support.browser.version >= 43) {
                    commands.copy = true;
                    commands.cut = true;
                }
            }

            return commands;
        };

        support.clipboard = support.detectClipboardAccess();

        support.zoomLevel = function() {
            try {
                var browser = support.browser;
                var ie11WidthCorrection = 0;
                var docEl = document.documentElement;

                if (browser.msie && browser.version == 11 && docEl.scrollHeight > docEl.clientHeight && !support.touch) {
                    ie11WidthCorrection = support.scrollbar();
                }

                return support.touch ? (docEl.clientWidth / window.innerWidth) :
                       browser.msie && browser.version >= 10 ? (((top || window).document.documentElement.offsetWidth + ie11WidthCorrection) / (top || window).innerWidth) : 1;
            } catch (e) {
                return 1;
            }
        };

        (function(browser) {
            // add browser-specific CSS class
            var cssClass = "",
                docElement = $(document.documentElement),
                majorVersion = parseInt(browser.version, 10);

            if (browser.msie) {
                cssClass = "ie";
            } else if (browser.mozilla) {
                cssClass = "ff";
            } else if (browser.safari) {
                cssClass = "safari";
            } else if (browser.webkit) {
                cssClass = "webkit";
            } else if (browser.opera) {
                cssClass = "opera";
            } else if (browser.edge) {
                cssClass = "edge";
            }

            if (cssClass) {
                cssClass = "k-" + cssClass + " k-" + cssClass + majorVersion;
            }
            if (support.mobileOS) {
                cssClass += " k-mobile";
            }

            if (!support.cssFlexbox) {
                cssClass += " k-no-flexbox";
            }

            docElement.addClass(cssClass);
        })(support.browser);

        support.eventCapture = document.documentElement.addEventListener;

        var input = document.createElement("input");

        support.placeholder = "placeholder" in input;
        support.propertyChangeEvent = "onpropertychange" in input;

        support.input = (function() {
            var types = ["number", "date", "time", "month", "week", "datetime", "datetime-local"];
            var length = types.length;
            var value = "test";
            var result = {};
            var idx = 0;
            var type;

            for (;idx < length; idx++) {
                type = types[idx];
                input.setAttribute("type", type);
                input.value = value;

                result[type.replace("-", "")] = input.type !== "text" && input.value !== value;
            }

            return result;
        })();

        input.style.cssText = "float:left;";

        support.cssFloat = !!input.style.cssFloat;

        input = null;

        support.stableSort = (function() {
            // Chrome sort is not stable for more than *10* items
            // IE9+ sort is not stable for than *512* items
            var threshold = 513;

            var sorted = [{
                index: 0,
                field: "b"
            }];

            for (var i = 1; i < threshold; i++) {
                sorted.push({
                    index: i,
                    field: "a"
                });
            }

            sorted.sort(function(a, b) {
                return a.field > b.field ? 1 : (a.field < b.field ? -1 : 0);
            });

            return sorted[0].index === 1;
        })();

        support.matchesSelector = elementProto.webkitMatchesSelector || elementProto.mozMatchesSelector ||
                                  elementProto.msMatchesSelector || elementProto.oMatchesSelector ||
                                  elementProto.matchesSelector || elementProto.matches ||
          function( selector ) {
              var nodeList = document.querySelectorAll ? ( this.parentNode || document ).querySelectorAll( selector ) || [] : $(selector),
                  i = nodeList.length;

              while (i--) {
                  if (nodeList[i] == this) {
                      return true;
                  }
              }

              return false;
          };

        support.matchMedia = "matchMedia" in window;

        support.pushState = window.history && window.history.pushState;

        support.hashChange = "onhashchange" in window;

        support.customElements = "registerElement" in window.document;

        var chrome = support.browser.chrome,
            mobileChrome = support.browser.crios,
            mozilla = support.browser.mozilla,
            safari = support.browser.safari;
        support.msPointers = !chrome && window.MSPointerEvent;
        support.pointers = !chrome && !mobileChrome && !mozilla && !safari && window.PointerEvent;
        support.kineticScrollNeeded = mobileOS && (mobileOS.device !== "ipad" || mobileOS.majorVersion < 13) && (support.touch || support.msPointers || support.pointers);
    })();


    function size(obj) {
        var result = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key) && key != "toJSON") { // Ignore fake IE7 toJSON.
                result++;
            }
        }

        return result;
    }

    function getOffset(element, type, positioned) {
        if (!type) {
            type = "offset";
        }

        var offset = element[type]();
        // clone ClientRect object to JS object (jQuery3)
        var result = {
            top: offset.top,
            right: offset.right,
            bottom: offset.bottom,
            left: offset.left
        };

        // IE10 touch zoom is living in a separate viewport
        if (support.browser.msie && (support.pointers || support.msPointers) && !positioned) {
            var sign = support.isRtl(element) ? 1 : -1;

            result.top -= (window.pageYOffset - (document.documentElement.scrollTop));
            result.left -= (window.pageXOffset + (sign * document.documentElement.scrollLeft));
        }

        return result;
    }

    var directions = {
        left: { reverse: "right" },
        right: { reverse: "left" },
        down: { reverse: "up" },
        up: { reverse: "down" },
        top: { reverse: "bottom" },
        bottom: { reverse: "top" },
        "in": { reverse: "out" },
        out: { reverse: "in" }
    };

    function parseEffects(input) {
        var effects = {};

        each((typeof input === "string" ? input.split(" ") : input), function(idx) {
            effects[idx] = this;
        });

        return effects;
    }

    function fx(element) {
        return new kendo.effects.Element(element);
    }

    var effects = {};

    $.extend(effects, {
        enabled: true,
        Element: function(element) {
            this.element = $(element);
        },

        promise: function(element, options) {
            if (!element.is(":visible")) {
                element.css({ display: element.data("olddisplay") || "block" }).css("display");
            }

            if (options.hide) {
                element.data("olddisplay", element.data("olddisplay") || element.css("display")).hide();
            }

            if (options.init) {
                options.init();
            }

            if (options.completeCallback) {
                options.completeCallback(element); // call the external complete callback with the element
            }

            element.dequeue();
        },

        disable: function() {
            this.enabled = false;
            this.promise = this.promiseShim;
        },

        enable: function() {
            this.enabled = true;
            this.promise = this.animatedPromise;
        }
    });

    effects.promiseShim = effects.promise;

    function prepareAnimationOptions(options, duration, reverse, complete) {
        if (typeof options === STRING) {
            // options is the list of effect names separated by space e.g. animate(element, "fadeIn slideDown")

            // only callback is provided e.g. animate(element, options, function() {});
            if (isFunction(duration)) {
                complete = duration;
                duration = 400;
                reverse = false;
            }

            if (isFunction(reverse)) {
                complete = reverse;
                reverse = false;
            }

            if (typeof duration === BOOLEAN) {
                reverse = duration;
                duration = 400;
            }

            options = {
                effects: options,
                duration: duration,
                reverse: reverse,
                complete: complete
            };
        }

        return extend({
            //default options
            effects: {},
            duration: 400, //jQuery default duration
            reverse: false,
            init: noop,
            teardown: noop,
            hide: false
        }, options, { completeCallback: options.complete, complete: noop }); // Move external complete callback, so deferred.resolve can be always executed.

    }

    function animate(element, options, duration, reverse, complete) {
        var idx = 0,
            length = element.length,
            instance;

        for (; idx < length; idx ++) {
            instance = $(element[idx]);
            instance.queue(function() {
                effects.promise(instance, prepareAnimationOptions(options, duration, reverse, complete));
            });
        }

        return element;
    }

    function toggleClass(element, classes, options, add) {
        if (classes) {
            classes = classes.split(" ");

            each(classes, function(idx, value) {
                element.toggleClass(value, add);
            });
        }

        return element;
    }

    if (!("kendoAnimate" in $.fn)) {
        extend($.fn, {
            kendoStop: function(clearQueue, gotoEnd) {
                return this.stop(clearQueue, gotoEnd);
            },

            kendoAnimate: function(options, duration, reverse, complete) {
                return animate(this, options, duration, reverse, complete);
            },

            kendoAddClass: function(classes, options) {
                return kendo.toggleClass(this, classes, options, true);
            },

            kendoRemoveClass: function(classes, options) {
                return kendo.toggleClass(this, classes, options, false);
            },
            kendoToggleClass: function(classes, options, toggle) {
                return kendo.toggleClass(this, classes, options, toggle);
            }
        });
    }

    var ampRegExp = /&/g,
        ltRegExp = /</g,
        quoteRegExp = /"/g,
        aposRegExp = /'/g,
        gtRegExp = />/g;

    function htmlDecode(value) {
        var entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'"
        };

        return value.replace(/&(?:amp|lt|gt|quot|#39);/g, function(match) {
            return entities[match];
        });
    }

    function htmlEncode(value, shouldDecode) {
        if (shouldDecode === true) {
            value = htmlDecode(value);
        }

        return ("" + value).replace(ampRegExp, "&amp;").replace(ltRegExp, "&lt;").replace(gtRegExp, "&gt;").replace(quoteRegExp, "&quot;").replace(aposRegExp, "&#39;");
    }

    function sanitizeLink(value) {
        const allowedProtocols = ["http:", "https:"];
        let link = "";

        try {
            // Use the default origin in case the value is a relative URL.
            const url = new URL(value, window.location.origin);
            if (allowedProtocols.includes(url.protocol)) {
                link = value;
            } else {
                throw new Error("Invalid protocol");
            }
        } catch {
            link = "#INVALIDLINK";
        }

        return htmlEncode(link);
    }

    function unescape(value) {
        var template;

        try {
            template = window.decodeURIComponent(value);
        } catch (error) {
            // If the string contains Unicode characters
            // the decodeURIComponent() will throw an error.
            // Therefore: convert to UTF-8 character
            template = value.replace(/%u([\dA-F]{4})|%([\dA-F]{2})/gi, function(_, m1, m2) {
                return String.fromCharCode(parseInt("0x" + (m1 || m2), 16));
            });
        }

        return template;
    }

    var eventTarget = function(e) {
        return e.target;
    };

    if (support.touch) {

        eventTarget = function(e) {
            var touches = "originalEvent" in e ? e.originalEvent.changedTouches : "changedTouches" in e ? e.changedTouches : null;

            return touches ? document.elementFromPoint(touches[0].clientX, touches[0].clientY) : e.target;
        };

        each(["swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown", "doubleTap", "tap"], function(m, value) {
            $.fn[value] = function(callback) {
                return this.on(value, callback);
            };
        });
    }

    if (support.touch) {
        if (!support.mobileOS) {
            support.mousedown = "mousedown touchstart";
            support.mouseup = "mouseup touchend";
            support.mousemove = "mousemove touchmove";
            support.mousecancel = "mouseleave touchcancel";
            support.click = "click";
            support.resize = "resize";
        } else {
            support.mousedown = "touchstart";
            support.mouseup = "touchend";
            support.mousemove = "touchmove";
            support.mousecancel = "touchcancel";
            support.click = "touchend";
            support.resize = "orientationchange";
        }
    } else if (support.pointers) {
        support.mousemove = "pointermove";
        support.mousedown = "pointerdown";
        support.mouseup = "pointerup";
        support.mousecancel = "pointercancel";
        support.click = "pointerup";
        support.resize = "orientationchange resize";
    } else if (support.msPointers) {
        support.mousemove = "MSPointerMove";
        support.mousedown = "MSPointerDown";
        support.mouseup = "MSPointerUp";
        support.mousecancel = "MSPointerCancel";
        support.click = "MSPointerUp";
        support.resize = "orientationchange resize";
    } else {
        support.mousemove = "mousemove";
        support.mousedown = "mousedown";
        support.mouseup = "mouseup";
        support.mousecancel = "mouseleave";
        support.click = "click";
        support.resize = "resize";
    }

    var wrapExpression = function(members, paramName) {
        var result = paramName || "d",
            index,
            idx,
            length,
            member,
            count = 1;

        for (idx = 0, length = members.length; idx < length; idx++) {
            member = members[idx];
            if (member !== "") {
                index = member.indexOf("[");

                if (index !== 0) {
                    if (index == -1) {
                        member = "." + member;
                    } else {
                        count++;
                        member = "." + member.substring(0, index) + " || {})" + member.substring(index);
                    }
                }

                count++;
                result += member + ((idx < length - 1) ? " || {})" : ")");
            }
        }
        return new Array(count).join("(") + result;
    },
    localUrlRe = /^([a-z]+:)?\/\//i;

    extend(kendo, {
        widgets: [],
        _widgetRegisteredCallbacks: [],
        ui: kendo.ui || {},
        fx: kendo.fx || fx,
        effects: kendo.effects || effects,
        mobile: kendo.mobile || { },
        data: kendo.data || {},
        dataviz: kendo.dataviz || {},
        drawing: kendo.drawing || {},
        spreadsheet: { messages: {} },
        keys: {
            INSERT: 45,
            DELETE: 46,
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            ESC: 27,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            END: 35,
            HOME: 36,
            SPACEBAR: 32,
            PAGEUP: 33,
            PAGEDOWN: 34,
            F2: 113,
            F10: 121,
            F12: 123,
            SHIFT: 16,
            NUMPAD_PLUS: 107,
            NUMPAD_MINUS: 109,
            NUMPAD_DOT: 110
        },
        support: kendo.support || support,
        animate: kendo.animate || animate,
        ns: "",
        attr: function(value) {
            return "data-" + kendo.ns + value;
        },
        getShadows: getShadows,
        wrap: wrap,
        deepExtend: deepExtend,
        getComputedStyles: getComputedStyles,
        isScrollable: isScrollable,
        scrollLeft: scrollLeft,
        size: size,
        toCamelCase: toCamelCase,
        toHyphens: toHyphens,
        getOffset: kendo.getOffset || getOffset,
        parseEffects: kendo.parseEffects || parseEffects,
        toggleClass: kendo.toggleClass || toggleClass,
        directions: kendo.directions || directions,
        Observable: Observable,
        Class: Class,
        Template: Template,
        template: Template.compile.bind(Template),
        render: Template.render.bind(Template),
        stringify: JSON.stringify.bind(JSON),
        eventTarget: eventTarget,
        htmlEncode: htmlEncode,
        sanitizeLink: sanitizeLink,
        unescape: unescape,
        isLocalUrl: function(url) {
            return url && !localUrlRe.test(url);
        },
        mediaQuery: mediaQuery,

        expr: function(expression, safe, paramName) {
            expression = expression || "";

            if (typeof safe == STRING) {
                paramName = safe;
                safe = false;
            }

            paramName = paramName || "d";

            if (expression && expression.charAt(0) !== "[") {
                expression = "." + expression;
            }

            if (safe) {
                expression = expression.replace(/"([^.]*)\.([^"]*)"/g,'"$1_$DOT$_$2"');
                expression = expression.replace(/'([^.]*)\.([^']*)'/g,"'$1_$DOT$_$2'");
                expression = wrapExpression(expression.split("."), paramName);
                expression = expression.replace(/_\$DOT\$_/g, ".");
            } else {
                expression = paramName + expression;
            }

            return expression;
        },

        exprToArray: (expression, safe) => {
            expression = expression || "";

            return expression.indexOf(".") >= 0 || expression.indexOf("[") >= 0 ?
                expression.split(/[[\].]/).map(v => v.replace(/["']/g, '')).filter(v => v) :
                expression === "" ? [] : [expression];
        },

        getter: function(expression, safe) {
            var key = expression + safe;

            return getterCache[key] = getterCache[key] || ((obj) => {
                const fields = kendo.exprToArray(expression, safe);

                let result = obj;
                for (let idx = 0; idx < fields.length; idx++) {
                    result = result[fields[idx]];
                    if (!kendo.isPresent(result) && safe) {
                        return result;
                    }
                }

                return result;
            });
        },

        setter: function(expression) {
            return setterCache[expression] = setterCache[expression] || ((obj, value) => {
                const fields = kendo.exprToArray(expression);

                const innerSetter = ({ parent, val, prop, props }) => {
                    if (props.length) {
                        parent = parent[props.shift()];
                        innerSetter({ parent, val, prop, props });
                    } else {
                        parent[prop] = val;
                    }
                };

                innerSetter({
                    parent: obj,
                    val: value,
                    prop: fields.pop(),
                    props: fields
                });
            });
        },

        accessor: function(expression) {
            return {
                get: kendo.getter(expression),
                set: kendo.setter(expression)
            };
        },

        guid: function() {
            try {
                // This is available only in HTTPS.
                return crypto.randomUUID();
            } catch (e) {
                // Use this as a fallback.
                const randomValues = crypto.getRandomValues(new Uint8Array(16));
                return randomValues.reduce((acc, curr, i) => {
                    if (i === 4 || i === 6 || i === 8 || i === 10) {
                        acc += "-";
                    }
                    acc += curr.toString(16).padStart(2, '0');
                    return acc;
                }, "");
            }
        },

        roleSelector: function(role) {
            return role.replace(/(\S+)/g, "[" + kendo.attr("role") + "=$1],").slice(0, -1);
        },

        directiveSelector: function(directives) {
            var selectors = directives.split(" ");

            if (selectors) {
                for (var i = 0; i < selectors.length; i++) {
                    if (selectors[i] != "view") {
                        selectors[i] = selectors[i].replace(/(\w*)(view|bar|strip|over)$/, "$1-$2");
                    }
                }
            }

            return selectors.join(" ").replace(/(\S+)/g, "kendo-mobile-$1,").slice(0, -1);
        },

        triggeredByInput: function(e) {
            return (/^(label|input|textarea|select)$/i).test(e.target.tagName);
        },

        onWidgetRegistered: function(callback) {
            for (var i = 0, len = kendo.widgets.length; i < len; i++) {
                callback(kendo.widgets[i]);
            }

            kendo._widgetRegisteredCallbacks.push(callback);
        },

        logToConsole: function(message, type) {
            var console = window.console;

            if (!kendo.suppressLog && typeof(console) != "undefined" && console.log) {
                console[type || "log"](message);
            }
        }
    });

    var Widget = Observable.extend( {
        init: function(element, options) {
            var that = this;

            if (!licensing.validatePackage()) {
                that._showWatermarkOverlay = licensing.addWatermarkOverlayAndBanner;
            }

            that.element = kendo.jQuery(element).handler(that);

            Observable.fn.init.call(that);

            var dataSource = options ? options.dataSource : null;
            var props;

            if (options) {
                props = (that.componentTypes || {})[(options || {}).componentType];
            }

            if (dataSource) {
                // avoid deep cloning the data source
                options = extend({}, options, { dataSource: {} });
            }

            options = that.options = extend(true, {}, that.options, that.defaults, props || {}, options);

            if (dataSource) {
                options.dataSource = dataSource;
            }

            if (!that.element.attr(kendo.attr("role"))) {
                that.element.attr(kendo.attr("role"), (options.name || "").toLowerCase());
            }

            that.element.data("kendo" + options.prefix + options.name, that);

            that.bind(that.events, options);
        },

        events: [],

        options: {
            prefix: ""
        },

        _hasBindingTarget: function() {
            return !!this.element[0].kendoBindingTarget;
        },

        _tabindex: function(target) {
            target = target || this.wrapper;

            var element = this.element,
                TABINDEX = "tabindex",
                tabindex = target.attr(TABINDEX) || element.attr(TABINDEX);

            element.removeAttr(TABINDEX);

            target.attr(TABINDEX, !isNaN(tabindex) ? tabindex : 0);
        },

        setOptions: function(options) {
            this._clearCssClasses(options);
            this._setEvents(options);
            $.extend(this.options, options);
            this._applyCssClasses();
        },

        _setEvents: function(options) {
            var that = this,
                idx = 0,
                length = that.events.length,
                e;

            for (; idx < length; idx ++) {
                e = that.events[idx];
                if (that.options[e] && options[e]) {
                    that.unbind(e, that.options[e]);
                    if (that._events && that._events[e]) {
                        delete that._events[e];
                    }
                }
            }

            that.bind(that.events, options);
        },

        resize: function(force) {
            var size = this.getSize(),
                currentSize = this._size;

            if (force || (size.width > 0 || size.height > 0) && (!currentSize || size.width !== currentSize.width || size.height !== currentSize.height)) {
                this._size = size;
                this._resize(size, force);
                this.trigger("resize", size);
            }
        },

        getSize: function() {
            return kendo.dimensions(this.element);
        },

        size: function(size) {
            if (!size) {
                return this.getSize();
            } else {
                this.setSize(size);
            }
        },

        setSize: $.noop,
        _resize: $.noop,

        destroy: function() {
            var that = this;

            that.element.removeData("kendo" + that.options.prefix + that.options.name);
            that.element.removeData("handler");
            that.unbind();
        },
        _destroy: function() {
            this.destroy();
        },

        _applyCssClasses: function(element) {
            var protoOptions = this.__proto__.options,
                options = this.options,
                el = element || this.wrapper || this.element,
                classes = [],
                i, prop, validFill, widgetName;

            if (!kendo.cssProperties.propertyDictionary[protoOptions.name]) {
                return;
            }

            for (i = 0; i < cssPropertiesNames.length; i++) {
                prop = cssPropertiesNames[i];
                widgetName = this.options._altname || protoOptions.name;

                if (protoOptions.hasOwnProperty(prop)) {
                    if (prop === "themeColor") {
                        validFill = kendo.cssProperties.getValidClass({
                            widget: widgetName,
                            propName: "fillMode",
                            value: options.fillMode
                        });

                        if (validFill && validFill.length) {
                            classes.push(kendo.cssProperties.getValidClass({
                                widget: widgetName,
                                propName: prop,
                                value: options[prop],
                                fill: options.fillMode
                            }));
                        }
                    } else {
                        classes.push(kendo.cssProperties.getValidClass({
                            widget: widgetName,
                            propName: prop,
                            value: options[prop]
                        }));
                    }
                }
            }

            el.addClass(classes.join(" "));
        },

        _ariaLabel: function(target) {
            var that = this,
                inputElm = that.element,
                inputId = inputElm.attr("id"),
                labelElm = $("label[for=\"" + inputId + "\"]"),
                ariaLabel = inputElm.attr(ARIA_LABEL),
                ariaLabelledBy = inputElm.attr(ARIA_LABELLEDBY),
                labelId;

            if (target[0] === inputElm[0]) {
                return;
            }

            if (ariaLabel) {
                target.attr(ARIA_LABEL, ariaLabel);
            } else if (ariaLabelledBy) {
                target.attr(ARIA_LABELLEDBY, ariaLabelledBy);
            } else if (labelElm.length) {
                labelId = labelElm.attr("id") || that._generateLabelId(labelElm, inputId || kendo.guid());
                target.attr(ARIA_LABELLEDBY, labelId);
            }
        },

        _clearCssClasses: function(newOptions, element) {
            var protoOptions = this.__proto__.options,
                currentOptions = this.options,
                el = element || this.wrapper || this.element,
                i, prop, widgetName;

            if (!kendo.cssProperties.propertyDictionary[protoOptions.name]) {
                return;
            }

            for (i = 0; i < cssPropertiesNames.length; i++) {
                prop = cssPropertiesNames[i];
                widgetName = this.options._altname || protoOptions.name;

                if (protoOptions.hasOwnProperty(prop) && newOptions.hasOwnProperty(prop)) {
                    if (prop === "themeColor") {
                        el.removeClass(kendo.cssProperties.getValidClass({
                            widget: widgetName,
                            propName: prop,
                            value: currentOptions[prop],
                            fill: currentOptions.fillMode
                        }));
                    } else {
                        if (prop === "fillMode") {
                            el.removeClass(kendo.cssProperties.getValidClass({
                                widget: widgetName,
                                propName: "themeColor",
                                value: currentOptions.themeColor,
                                fill: currentOptions.fillMode
                            }));
                        }

                        el.removeClass(kendo.cssProperties.getValidClass({
                            widget: widgetName,
                            propName: prop,
                            value: currentOptions[prop]
                        }));
                    }
                }
            }
        },

        _generateLabelId: function(label, inputId) {
            var labelId = inputId + LABELIDPART;

            label.attr("id", labelId);

            return labelId;
        },
    });

    var DataBoundWidget = Widget.extend({
        dataItems: function() {
            return this.dataSource.flatView();
        }
    });

    kendo.dimensions = function(element, dimensions) {
        var domElement = element[0];

        if (dimensions) {
            element.css(dimensions);
        }

        return { width: domElement.offsetWidth, height: domElement.offsetHeight };
    };

    kendo.notify = noop;

    var templateRegExp = /template$/i,
        jsonRegExp = /^\s*(?:\{(?:.|\r\n|\n)*\}|\[(?:.|\r\n|\n)*\])\s*$/,
        jsonFormatRegExp = /^\{(\d+)(:[^\}]+)?\}|^\[[A-Za-z_]+\]$/,
        dashRegExp = /([A-Z])/g;

    function parseOption(element, option, source) {
        let value, modelBinded = false;

        if (option.indexOf("data") === 0) {
            option = option.substring(4);
            option = option.charAt(0).toLowerCase() + option.substring(1);
        }

        option = option.replace(dashRegExp, "-$1");
        value = element.getAttribute(`data-` + kendo.ns + option);

        if (value === null) {
            value = element.getAttribute(`bind:data-` + kendo.ns + option);
            modelBinded = true;
        }

        if (value === null) {
            value = undefined;
        } else if (value === "null") {
            value = null;
        } else if (value === "true") {
            value = true;
        } else if (value === "false") {
            value = false;
        } else if (numberRegExp.test(value) && option != "mask" && option != "format") {
            value = parseFloat(value);
        } else if (jsonRegExp.test(value) && !jsonFormatRegExp.test(value)) {
            try {
                value = JSON.parse(value);
            } catch (error) {
                // Fallback to function eval for legacy reason - non CSP compliant
                value = new Function("return (" + value + ")")();
            }
        } else if (modelBinded) {
            // This way you can set a config like so bind:data-checkboxes="checkboxesOptions" where checkboxesOptions is an object inside your viewmodel.
            // This is a CSP-safe approach similar to data-checkboxes="{ checkboxes: true }" but you don't need to eval javascript.
            value = source[value];

            if (value instanceof Observable) {
                // Pass true as a parameter to allow function serialization. Otherwise, if you have a function in the configuration, it will be ignored.
                value = value.toJSON(true);
            }
        }

        return value;
    }

    function parseOptions(element, options, source) {
        var result = {},
            option,
            value,
            role = element.getAttribute("data-" + kendo.ns + "role");

        for (option in options) {
            // Pass the source option for MVVM scenarios.
            value = parseOption(element, option, source);

            if (value !== undefined) {

                if (templateRegExp.test(option) && role != "drawer") {
                    if (typeof value === "string") {
                        if (validateQuerySelectorTemplate(value)) {
                            value = kendo.template($("#" + value).html());
                        } else if (source && source[value]) {
                            value = kendo.template(source[value]);
                        } else {
                            value = kendo.template(value);
                        }
                    } else if (!isFunction(value)) {
                        value = element.getAttribute(option);
                    }
                }

                result[option] = value;
            }
        }

        return result;
    }

    function validateQuerySelectorTemplate(value) {
        try {
            return $("#" + value).length;
        } catch (e) {
        }

        return false;
    }

    kendo.initWidget = function(element, options, roles, source) {
        var result,
            option,
            widget,
            idx,
            length,
            role,
            value,
            dataSource,
            fullPath,
            widgetKeyRegExp;

        // Preserve backwards compatibility with (element, options, namespace) signature, where namespace was kendo.ui
        if (!roles) {
            roles = kendo.ui.roles;
        } else if (roles.roles) {
            roles = roles.roles;
        }

        element = element.nodeType ? element : element[0];

        role = element.getAttribute("data-" + kendo.ns + "role");

        if (!role) {
            return;
        }

        fullPath = role.indexOf(".") === -1;

        // look for any widget that may be already instantiated based on this role.
        // The prefix used is unknown, hence the regexp
        //

        if (fullPath) {
            widget = roles[role];
        } else { // full namespace path - like kendo.ui.Widget
            widget = kendo.getter(role)(window);
        }

        var data = $(element).data(),
            widgetKey = widget ? "kendo" + widget.fn.options.prefix + widget.fn.options.name : "";

        if (fullPath) {
            widgetKeyRegExp = new RegExp("^kendo.*" + role + "$", "i");
        } else { // full namespace path - like kendo.ui.Widget
            widgetKeyRegExp = new RegExp("^" + widgetKey + "$", "i");
        }

        for (var key in data) {
            if (key.match(widgetKeyRegExp)) {
                // we have detected a widget of the same kind - save its reference, we will set its options
                if (key === widgetKey) {
                    result = data[key];
                } else {
                    return data[key];
                }
            }
        }

        if (!widget) {
            return;
        }

        dataSource = parseOption(element, "dataSource");

        options = $.extend({}, parseOptions(element, $.extend({}, widget.fn.options, widget.fn.defaults), source), options);

        if (dataSource) {
            if (typeof dataSource === STRING) {
                options.dataSource = kendo.getter(dataSource)(window);
            } else {
                options.dataSource = dataSource;
            }
        }

        for (idx = 0, length = widget.fn.events.length; idx < length; idx++) {
            option = widget.fn.events[idx];

            value = parseOption(element, option);

            if (value !== undefined) {
                options[option] = kendo.getter(value)(window);
            }
        }

        if (!result) {
            result = new widget(element, options);
        } else if (!$.isEmptyObject(options)) {
            result.setOptions(options);
        }

        return result;
    };

    kendo.rolesFromNamespaces = function(namespaces) {
        var roles = [],
            idx,
            length;

        if (!namespaces[0]) {
            namespaces = [kendo.ui, kendo.dataviz.ui];
        }

        for (idx = 0, length = namespaces.length; idx < length; idx ++) {
            roles[idx] = namespaces[idx].roles;
        }

        return extend.apply(null, [{}].concat(roles.reverse()));
    };

    kendo.init = function(element) {
        var roles = kendo.rolesFromNamespaces(slice.call(arguments, 1));

        $(element).find("[data-" + kendo.ns + "role]").addBack().each(function() {
            kendo.initWidget(this, {}, roles);
        });
    };

    kendo.destroy = function(element) {
        $(element).find("[data-" + kendo.ns + "role]").addBack().each(function() {
            var data = $(this).data();

            for (var key in data) {
                if (key.indexOf("kendo") === 0 && typeof data[key].destroy === FUNCTION) {
                    data[key].destroy();
                }
            }
        });
    };

    function containmentComparer(a, b) {
        return $.contains(a, b) ? -1 : 1;
    }

    function resizableWidget() {
        var widget = $(this);
        return ($.inArray(widget.attr("data-" + kendo.ns + "role"), ["slider", "rangeslider", "breadcrumb"]) > -1) || widget.is(":visible");
    }

    kendo.resize = function(element, force) {
        var widgets = $(element).find("[data-" + kendo.ns + "role]").addBack().filter(resizableWidget);

        if (!widgets.length) {
            return;
        }

        // sort widgets based on their parent-child relation
        var widgetsArray = $.makeArray(widgets);
        widgetsArray.sort(containmentComparer);

        // resize widgets
        $.each(widgetsArray, function() {
            var widget = kendo.widgetInstance($(this));
            if (widget) {
                widget.resize(force);
            }
        });
    };

    kendo.parseOptions = parseOptions;

    extend(kendo.ui, {
        Widget: Widget,
        DataBoundWidget: DataBoundWidget,
        roles: {},
        progress: function(container, toggle, options) {
            var mask = container.find(".k-loading-mask"),
                support = kendo.support,
                browser = support.browser,
                isRtl, leftRight, webkitCorrection, containerScrollLeft, cssClass;

                options = $.extend({}, {
                    width: "100%",
                    height: "100%",
                    top: container.scrollTop(),
                    opacity: false
                }, options);

                cssClass = options.opacity ? 'k-loading-mask k-opaque' : 'k-loading-mask';

            if (toggle) {
                if (!mask.length) {
                    isRtl = support.isRtl(container);
                    leftRight = isRtl ? "right" : "left";
                    containerScrollLeft = kendo.scrollLeft(container);
                    webkitCorrection = browser.webkit ? (!isRtl ? 0 : container[0].scrollWidth - container.width() - 2 * containerScrollLeft) : 0;

                    mask = $(kendo.format("<div class='{0}'><span role='alert' aria-live='polite' class='k-loading-text'>{1}</span><div class='k-loading-image'></div><div class='k-loading-color'></div></div>", cssClass, kendo.ui.progress.messages.loading))
                        .width(options.width).height(options.height)
                        .css("top", options.top)
                        .css(leftRight, Math.abs(containerScrollLeft) + webkitCorrection)
                        .prependTo(container);
                }
            } else if (mask) {
                mask.remove();
            }
        },
        plugin: function(widget, register, prefix) {
            var name = widget.fn.options.name,
                getter;

            register = register || kendo.ui;
            prefix = prefix || "";

            register[name] = widget;

            register.roles[name.toLowerCase()] = widget;

            getter = "getKendo" + prefix + name;
            name = "kendo" + prefix + name;

            var widgetEntry = { name: name, widget: widget, prefix: prefix || "" };
            kendo.widgets.push(widgetEntry);

            for (var i = 0, len = kendo._widgetRegisteredCallbacks.length; i < len; i++) {
                kendo._widgetRegisteredCallbacks[i](widgetEntry);
            }

            $.fn[name] = function(options) {
                var value = this,
                    args;

                if (typeof options === STRING) {
                    args = slice.call(arguments, 1);

                    this.each(function() {
                        var widget = $.data(this, name),
                            method,
                            result;

                        if (!widget) {
                            throw new Error(kendo.format("Cannot call method '{0}' of {1} before it is initialized", options, name));
                        }

                        method = widget[options];

                        if (typeof method !== FUNCTION) {
                            throw new Error(kendo.format("Cannot find method '{0}' of {1}", options, name));
                        }

                        result = method.apply(widget, args);

                        if (result !== undefined) {
                            value = result;
                            return false;
                        }
                    });
                } else {
                    this.each(function() {
                        return new widget(this, options);
                    });
                }

                return value;
            };

            $.fn[name].widget = widget;

            $.fn[getter] = function() {
                return this.data(name);
            };
        }
    });

    kendo.ui.progress.messages = {
        loading: "Loading..."
    };

    var ContainerNullObject = { bind: function() { return this; }, nullObject: true, options: {} };

    var MobileWidget = Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);
            this.element.autoApplyNS();
            this.wrapper = this.element;
            this.element.addClass("km-widget");
        },

        destroy: function() {
            Widget.fn.destroy.call(this);
            this.element.kendoDestroy();
        },

        options: {
            prefix: "Mobile"
        },

        events: [],

        view: function() {
            var viewElement = this.element.closest(kendo.roleSelector("view splitview modalview drawer"));
            return kendo.widgetInstance(viewElement, kendo.mobile.ui) || ContainerNullObject;
        },

        viewHasNativeScrolling: function() {
            var view = this.view();
            return view && view.options.useNativeScrolling;
        },

        container: function() {
            var element = this.element.closest(kendo.roleSelector("view layout modalview drawer splitview"));
            return kendo.widgetInstance(element.eq(0), kendo.mobile.ui) || ContainerNullObject;
        }
    });

    extend(kendo.mobile, {
        init: function(element) {
            kendo.init(element, kendo.mobile.ui, kendo.ui, kendo.dataviz.ui);
        },

        roles: {},

        ui: {
            Widget: MobileWidget,
            DataBoundWidget: DataBoundWidget.extend(MobileWidget.prototype),
            roles: {},
            plugin: function(widget) {
                kendo.ui.plugin(widget, kendo.mobile.ui, "Mobile");
            }
        }
    });

    deepExtend(kendo.dataviz, {
        init: function(element) {
            kendo.init(element, kendo.dataviz.ui);
        },
        ui: {
            roles: {},
            themes: {},
            views: [],
            plugin: function(widget) {
                kendo.ui.plugin(widget, kendo.dataviz.ui);
            }
        },
        roles: {}
    });

    kendo.touchScroller = function(elements, options) {
        // return the first touch scroller
        if (!options) { options = {}; }

        options.useNative = true;

        return $(elements).map(function(idx, element) {
            element = $(element);
            if (support.kineticScrollNeeded && kendo.mobile.ui.Scroller && !element.data("kendoMobileScroller")) {
                element.kendoMobileScroller(options);
                return element.data("kendoMobileScroller");
            } else {
                return false;
            }
        })[0];
    };

    kendo.preventDefault = function(e) {
        e.preventDefault();
    };

    kendo.widgetInstance = function(element, suites) {
        var role = element.data(kendo.ns + "role"),
            widgets = [], i, length,
            elementData = element.data("kendoView");

        if (role) {
            // HACK!!! mobile view scroller widgets are instantiated on data-role="content" elements. We need to discover them when resizing.
            if (role === "content") {
                role = "scroller";
            }

            // kendo.View is not a ui plugin

            if (role === "view" && elementData) {
                return elementData;
            }

            if (suites) {
                if (suites[0]) {
                    for (i = 0, length = suites.length; i < length; i ++) {
                        widgets.push(suites[i].roles[role]);
                    }
                } else {
                    widgets.push(suites.roles[role]);
                }
            }
            else {
                widgets = [ kendo.ui.roles[role], kendo.dataviz.ui.roles[role], kendo.mobile.ui.roles[role] ];
            }

            if (role.indexOf(".") >= 0) {
                widgets = [ kendo.getter(role)(window) ];
            }

            for (i = 0, length = widgets.length; i < length; i ++) {
                var widget = widgets[i];
                if (widget) {
                    var instance = element.data("kendo" + widget.fn.options.prefix + widget.fn.options.name);
                    if (instance) {
                        return instance;
                    }
                }
            }
        }
    };

    kendo.onResize = function(callback) {
        var handler = callback;
        if (support.mobileOS.android) {
            handler = function() { setTimeout(callback, 600); };
        }

        $(window).on(support.resize, handler);
        return handler;
    };

    kendo.unbindResize = function(callback) {
        $(window).off(support.resize, callback);
    };

    kendo.attrValue = function(element, key) {
        return element.data(kendo.ns + key);
    };

    kendo.days = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6
    };

    function focusable(element, isTabIndexNotNaN) {
        var nodeName = element.nodeName.toLowerCase();

        return (/input|select|textarea|button|object/.test(nodeName) ?
                !element.disabled :
                nodeName === "a" ?
                element.href || isTabIndexNotNaN :
                isTabIndexNotNaN
               ) &&
            visible(element);
    }

    function visible(element) {
        return $.expr.pseudos.visible(element) &&
            !$(element).parents().addBack().filter(function() {
                return $.css(this,"visibility") === "hidden";
            }).length;
    }

    $.extend($.expr.pseudos, {
        kendoFocusable: function(element) {
            var idx = $.attr(element, "tabindex");
            return focusable(element, !isNaN(idx) && idx > -1);
        }
    });

    var MOUSE_EVENTS = ["mousedown", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout", "mouseup", "click"];
    var EXCLUDE_BUST_CLICK_SELECTOR = "label, input, [data-rel=external]";

    var MouseEventNormalizer = {
        setupMouseMute: function() {
            var idx = 0,
                length = MOUSE_EVENTS.length,
                element = document.documentElement;

            if (MouseEventNormalizer.mouseTrap || !support.eventCapture) {
                return;
            }

            MouseEventNormalizer.mouseTrap = true;

            MouseEventNormalizer.bustClick = false;
            MouseEventNormalizer.captureMouse = false;

            var handler = function(e) {
                if (MouseEventNormalizer.captureMouse) {
                    if (e.type === "click") {
                        if (MouseEventNormalizer.bustClick && !$(e.target).is(EXCLUDE_BUST_CLICK_SELECTOR)) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    } else {
                        e.stopPropagation();
                    }
                }
            };

            for (; idx < length; idx++) {
                element.addEventListener(MOUSE_EVENTS[idx], handler, true);
            }
        },

        muteMouse: function(e) {
            MouseEventNormalizer.captureMouse = true;
            if (e.data.bustClick) {
                MouseEventNormalizer.bustClick = true;
            }
            clearTimeout(MouseEventNormalizer.mouseTrapTimeoutID);
        },

        unMuteMouse: function() {
            clearTimeout(MouseEventNormalizer.mouseTrapTimeoutID);
            MouseEventNormalizer.mouseTrapTimeoutID = setTimeout(function() {
                MouseEventNormalizer.captureMouse = false;
                MouseEventNormalizer.bustClick = false;
            }, 400);
        }
    };

    var eventMap = {
        down: "touchstart mousedown",
        move: "mousemove touchmove",
        up: "mouseup touchend touchcancel",
        cancel: "mouseleave touchcancel"
    };

    if (support.touch && (support.mobileOS.ios || support.mobileOS.android)) {
        eventMap = {
            down: "touchstart",
            move: "touchmove",
            up: "touchend touchcancel",
            cancel: "touchcancel"
        };
    } else if (support.pointers) {
        eventMap = {
            down: "pointerdown",
            move: "pointermove",
            up: "pointerup",
            cancel: "pointercancel pointerleave"
        };
    } else if (support.msPointers) {
        eventMap = {
            down: "MSPointerDown",
            move: "MSPointerMove",
            up: "MSPointerUp",
            cancel: "MSPointerCancel MSPointerLeave"
        };
    }

    if (support.msPointers && !("onmspointerenter" in window)) { // IE10
        // Create MSPointerEnter/MSPointerLeave events using mouseover/out and event-time checks
        $.each({
            MSPointerEnter: "MSPointerOver",
            MSPointerLeave: "MSPointerOut"
        }, function( orig, fix ) {
            $.event.special[ orig ] = {
                delegateType: fix,
                bindType: fix,

                handle: function( event ) {
                    var ret,
                        target = this,
                        related = event.relatedTarget,
                        handleObj = event.handleObj;

                    // For mousenter/leave call the handler if related is outside the target.
                    // NB: No relatedTarget if the mouse left/entered the browser window
                    if ( !related || (related !== target && !$.contains( target, related )) ) {
                        event.type = handleObj.origType;
                        ret = handleObj.handler.apply( this, arguments );
                        event.type = fix;
                    }
                    return ret;
                }
            };
        });
    }


    var getEventMap = function(e) { return (eventMap[e] || e); },
        eventRegEx = /([^ ]+)/g;

    kendo.applyEventMap = function(events, ns) {
        events = events.replace(eventRegEx, getEventMap);

        if (ns) {
            events = events.replace(eventRegEx, "$1." + ns);
        }

        return events;
    };

    kendo.keyDownHandler = function(e, widget) {
        var events = widget._events.kendoKeydown;

        if (!events) {
            return true;
        }

        events = events.slice();
        e.sender = widget;
        e.preventKendoKeydown = false;
        for (var idx = 0, length = events.length; idx < length; idx++) {
            events[idx].call(widget, e);
        }

        return !e.preventKendoKeydown;
    };

    var on = $.fn.on;

    function kendoJQuery(selector, context) {
        return new kendoJQuery.fn.init(selector, context);
    }

    noDepricateExtend(true, kendoJQuery, $);

    kendoJQuery.fn = kendoJQuery.prototype = new $();

    kendoJQuery.fn.constructor = kendoJQuery;

    kendoJQuery.fn.init = function(selector, context) {
        if (context && context instanceof $ && !(context instanceof kendoJQuery)) {
            context = kendoJQuery(context);
        }

        return $.fn.init.call(this, selector, context, rootjQuery);
    };

    kendoJQuery.fn.init.prototype = kendoJQuery.fn;

    var rootjQuery = kendoJQuery(document);

    extend(kendoJQuery.fn, {
        handler: function(handler) {
            this.data("handler", handler);
            return this;
        },

        autoApplyNS: function(ns) {
            this.data("kendoNS", ns || kendo.guid());
            return this;
        },

        on: function() {
            var that = this,
                ns = that.data("kendoNS");

            // support for event map signature
            if (arguments.length === 1) {
                return on.call(that, arguments[0]);
            }

            var context = that,
                args = slice.call(arguments);

            if (typeof args[args.length - 1] === UNDEFINED) {
                args.pop();
            }

            var callback = args[args.length - 1],
                events = kendo.applyEventMap(args[0], ns);

            // setup mouse trap
            if (support.mouseAndTouchPresent && events.search(/mouse|click/) > -1 && this[0] !== document.documentElement) {
                MouseEventNormalizer.setupMouseMute();

                var selector = args.length === 2 ? null : args[1],
                    bustClick = events.indexOf("click") > -1 && events.indexOf("touchend") > -1;

                on.call(this,
                    {
                        touchstart: MouseEventNormalizer.muteMouse,
                        touchend: MouseEventNormalizer.unMuteMouse
                    },
                    selector,
                    {
                        bustClick: bustClick
                    });
            }

            if (arguments[0].indexOf("keydown") !== -1 && args[1] && args[1].options) {
                args[0] = events;
                var widget = args[1];
                var keyDownCallBack = args[args.length - 1];
                args[args.length - 1] = function(e) {
                    if (kendo.keyDownHandler(e, widget)) {
                       return keyDownCallBack.apply(this, [e]);
                    }
                };
                on.apply(that, args);
                return that;
            }

            if (typeof callback === STRING) {
                context = that.data("handler");
                callback = context[callback];

                args[args.length - 1] = function(e) {
                    callback.call(context, e);
                };
            }

            args[0] = events;

            on.apply(that, args);

            return that;
        },

        kendoDestroy: function(ns) {
            ns = ns || this.data("kendoNS");

            if (ns) {
                this.off("." + ns);
            }

            return this;
        }
    });

    kendo.jQuery = kendoJQuery;
    kendo.eventMap = eventMap;

    kendo.timezone = (function() {
        var months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

        function ruleToDate(year, rule) {
            var date;
            var targetDay;
            var ourDay;
            var month = rule[3];
            var on = rule[4];
            var time = rule[5];
            var cache = rule[8];

            if (!cache) {
                rule[8] = cache = {};
            }

            if (cache[year]) {
                return cache[year];
            }

            if (!isNaN(on)) {
                date = new Date(Date.UTC(year, months[month], on, time[0], time[1], time[2], 0));
            } else if (on.indexOf("last") === 0) {
                date = new Date(Date.UTC(year, months[month] + 1, 1, time[0] - 24, time[1], time[2], 0));

                targetDay = days[on.substr(4, 3)];
                ourDay = date.getUTCDay();

                date.setUTCDate(date.getUTCDate() + targetDay - ourDay - (targetDay > ourDay ? 7 : 0));
            } else if (on.indexOf(">=") >= 0) {
                date = new Date(Date.UTC(year, months[month], on.substr(5), time[0], time[1], time[2], 0));

                targetDay = days[on.substr(0, 3)];
                ourDay = date.getUTCDay();

                date.setUTCDate(date.getUTCDate() + targetDay - ourDay + (targetDay < ourDay ? 7 : 0));
            } else if (on.indexOf("<=") >= 0) {
                date = new Date(Date.UTC(year, months[month], on.substr(5), time[0], time[1], time[2], 0));

                targetDay = days[on.substr(0, 3)];
                ourDay = date.getUTCDay();

                date.setUTCDate(date.getUTCDate() + targetDay - ourDay - (targetDay > ourDay ? 7 : 0));
            }

            return cache[year] = date;
        }

        function findRule(utcTime, rules, zone) {
            rules = rules[zone];

            if (!rules) {
                var time = zone.split(":");
                var offset = 0;

                if (time.length > 1) {
                    offset = time[0] * 60 + Number(time[1]);
                }

                return [-1000000, 'max', '-', 'Jan', 1, [0, 0, 0], offset, '-'];
            }

            var year = new Date(utcTime).getUTCFullYear();

            rules = jQuery.grep(rules, function(rule) {
                var from = rule[0];
                var to = rule[1];

                return from <= year && (to >= year || (from == year && to == "only") || to == "max");
            });

            rules.push(utcTime);

            rules.sort(function(a, b) {
                if (typeof a != "number") {
                    a = Number(ruleToDate(year, a));
                }

                if (typeof b != "number") {
                    b = Number(ruleToDate(year, b));
                }

                return a - b;
            });

            var rule = rules[jQuery.inArray(utcTime, rules) - 1] || rules[rules.length - 1];

            return isNaN(rule) ? rule : null;
        }

        function findZone(utcTime, zones, timezone) {
            var zoneRules = zones[timezone];

            if (typeof zoneRules === "string") {
                zoneRules = zones[zoneRules];
            }

            if (!zoneRules) {
                throw new Error('Timezone "' + timezone + '" is either incorrect, or kendo.timezones.min.js is not included.');
            }

            for (var idx = zoneRules.length - 1; idx >= 0; idx--) {
                var until = zoneRules[idx][3];

                if (until && utcTime > until) {
                    break;
                }
            }

            var zone = zoneRules[idx + 1];

            if (!zone) {
                throw new Error('Timezone "' + timezone + '" not found on ' + utcTime + ".");
            }

            return zone;
        }

        function zoneAndRule(utcTime, zones, rules, timezone) {
            if (typeof utcTime != NUMBER) {
                utcTime = Date.UTC(utcTime.getFullYear(), utcTime.getMonth(),
                    utcTime.getDate(), utcTime.getHours(), utcTime.getMinutes(),
                    utcTime.getSeconds(), utcTime.getMilliseconds());
            }

            var zone = findZone(utcTime, zones, timezone);

            return {
                zone: zone,
                rule: findRule(utcTime, rules, zone[1])
            };
        }

        function offset(utcTime, timezone) {
            if (timezone == "Etc/UTC" || timezone == "Etc/GMT") {
                return 0;
            }

            var info = zoneAndRule(utcTime, this.zones, this.rules, timezone);
            var zone = info.zone;
            var rule = info.rule;

            return kendo.parseFloat(rule ? zone[0] - rule[6] : zone[0]);
        }

        function abbr(utcTime, timezone) {
            var info = zoneAndRule(utcTime, this.zones, this.rules, timezone);
            var zone = info.zone;
            var rule = info.rule;

            var base = zone[2];

            if (base.indexOf("/") >= 0) {
                return base.split("/")[rule && +rule[6] ? 1 : 0];
            } else if (base.indexOf("%s") >= 0) {
                return base.replace("%s", (!rule || rule[7] == "-") ? '' : rule[7]);
            }

            return base;
        }

        function convert(date, fromOffset, toOffset) {
            var tempToOffset = toOffset;
            var diff;

            if (typeof fromOffset == STRING) {
                fromOffset = this.offset(date, fromOffset);
            }

            if (typeof toOffset == STRING) {
                toOffset = this.offset(date, toOffset);
            }

            var fromLocalOffset = date.getTimezoneOffset();

            date = new Date(date.getTime() + (fromOffset - toOffset) * 60000);

            var toLocalOffset = date.getTimezoneOffset();

            if (typeof tempToOffset == STRING) {
                tempToOffset = this.offset(date, tempToOffset);
            }

            diff = (toLocalOffset - fromLocalOffset) + (toOffset - tempToOffset);

            return new Date(date.getTime() + diff * 60000);
        }

        function apply(date, timezone) {
           return this.convert(date, date.getTimezoneOffset(), timezone);
        }

        function remove(date, timezone) {
           return this.convert(date, timezone, date.getTimezoneOffset());
        }

        function toLocalDate(time) {
            return this.apply(new Date(time), "Etc/UTC");
        }

        return {
           zones: {},
           rules: {},
           offset: offset,
           convert: convert,
           apply: apply,
           remove: remove,
           abbr: abbr,
           toLocalDate: toLocalDate
        };
    })();

    kendo.date = (function() {
        var MS_PER_MINUTE = 60000,
            MS_PER_DAY = 86400000;

        function adjustDST(date, hours) {
            if (hours === 0 && date.getHours() === 23) {
                date.setHours(date.getHours() + 2);
                return true;
            }

            return false;
        }

        function setDayOfWeek(date, day, dir) {
            var hours = date.getHours();

            dir = dir || 1;
            day = ((day - date.getDay()) + (7 * dir)) % 7;

            date.setDate(date.getDate() + day);
            adjustDST(date, hours);
        }

        function dayOfWeek(date, day, dir) {
            date = new Date(date);
            setDayOfWeek(date, day, dir);
            return date;
        }

        function firstDayOfMonth(date) {
            return new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            );
        }

        function lastDayOfMonth(date) {
            var last = new Date(date.getFullYear(), date.getMonth() + 1, 0),
                first = firstDayOfMonth(date),
                timeOffset = Math.abs(last.getTimezoneOffset() - first.getTimezoneOffset());

            if (timeOffset) {
                last.setHours(first.getHours() + (timeOffset / 60));
            }

            return last;
        }

        function firstDayOfYear(date) {
            return new Date(date.getFullYear(), 0, 1);
        }

        function lastDayOfYear(date) {
            return new Date(date.getFullYear(), 11, 31);
        }

        function moveDateToWeekStart(date, weekStartDay) {
            if (weekStartDay !== 1) {
                return addDays(dayOfWeek(date, weekStartDay, -1), 4);
            }

            return addDays(date, (4 - (date.getDay() || 7)));
        }

        function calcWeekInYear(date, weekStartDay) {
            var firstWeekInYear = new Date(date.getFullYear(), 0, 1, -6);

            var newDate = moveDateToWeekStart(date, weekStartDay);

            var diffInMS = newDate.getTime() - firstWeekInYear.getTime();

            var days = Math.floor(diffInMS / MS_PER_DAY);

            return 1 + Math.floor(days / 7);
        }

        function weekInYear(date, weekStartDay) {
            if (weekStartDay === undefined) {
                weekStartDay = kendo.culture().calendar.firstDay;
            }

            var prevWeekDate = addDays(date, -7);
            var nextWeekDate = addDays(date, 7);

            var weekNumber = calcWeekInYear(date, weekStartDay);

            if (weekNumber === 0) {
                return calcWeekInYear(prevWeekDate, weekStartDay) + 1;
            }

            if (weekNumber === 53 && calcWeekInYear(nextWeekDate, weekStartDay) > 1) {
                return 1;
            }

            return weekNumber;
        }

        function getDate(date) {
            date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            adjustDST(date, 0);
            return date;
        }

        function toUtcTime(date) {
            return Date.UTC(date.getFullYear(), date.getMonth(),
                        date.getDate(), date.getHours(), date.getMinutes(),
                        date.getSeconds(), date.getMilliseconds());
        }

        function getMilliseconds(date) {
            return toInvariantTime(date).getTime() - getDate(toInvariantTime(date));
        }

        function isInTimeRange(value, min, max) {
            var msMin = getMilliseconds(min),
                msMax = getMilliseconds(max),
                msValue;

            if (!value || msMin == msMax) {
                return true;
            }

            if (min >= max) {
                max += MS_PER_DAY;
            }

            msValue = getMilliseconds(value);

            if (msMin > msValue) {
                msValue += MS_PER_DAY;
            }

            if (msMax < msMin) {
                msMax += MS_PER_DAY;
            }

            return msValue >= msMin && msValue <= msMax;
        }

        function isInDateRange(value, min, max) {
            var msMin = min.getTime(),
                msMax = max.getTime(),
                msValue;

            if (msMin >= msMax) {
                msMax += MS_PER_DAY;
            }

            msValue = value.getTime();

            return msValue >= msMin && msValue <= msMax;
        }

        function addDays(date, offset) {
            var hours = date.getHours();
                date = new Date(date);

            setTime(date, offset * MS_PER_DAY);
            adjustDST(date, hours);
            return date;
        }

        function setTime(date, milliseconds, ignoreDST) {
            var offset = date.getTimezoneOffset();
            var difference;

            date.setTime(date.getTime() + milliseconds);

            if (!ignoreDST) {
                difference = date.getTimezoneOffset() - offset;
                date.setTime(date.getTime() + difference * MS_PER_MINUTE);
            }
        }

        function setHours(date, time) {
            date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
            adjustDST(date, time.getHours());
            return date;
        }

        function today() {
            return getDate(new Date());
        }

        function isToday(date) {
           return getDate(date).getTime() == today().getTime();
        }

        function toInvariantTime(date) {
            var staticDate = new Date(1980, 1, 1, 0, 0, 0);

            if (date) {
                staticDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            }

            return staticDate;
        }

        function addYear(date, offset) {
            var currentDate = new Date(date);

            return new Date(currentDate.setFullYear(currentDate.getFullYear() + offset));
        }

        function addLiteral(parts, value) {
            var lastPart = parts[parts.length - 1];
            if (lastPart && lastPart.type === "LITERAL") {
                lastPart.pattern += value;
            } else {
                parts.push({
                    type: "literal",
                    pattern: value
                });
            }
        }

        function isHour12(pattern) {
            return pattern === "h" || pattern === "K";
        }

        function dateNameType(formatLength) {
            var nameType;
            if (formatLength <= 3) {
                nameType = "abbreviated";
            } else if (formatLength === 4) {
                nameType = "wide";
            } else if (formatLength === 5) {
                nameType = "narrow";
            }

            return nameType;
        }

        function startsWith(text, searchString, position) {
            position = position || 0;
            return text.indexOf(searchString, position) === position;
        }

        function datePattern(format, info) {
            var calendar = info.calendar;
            var result;
            if (typeof format === "string") {
                if (calendar.patterns[format]) {
                    result = calendar.patterns[format];
                } else {
                    result = format;
                }
            }

            if (!result) {
                result = calendar.patterns.d;
            }

            return result;
        }

        function splitDateFormat(format) {
            var info = kendo.culture();
            var pattern = datePattern(format, info).replaceAll("dddd", "EEEE").replaceAll("ddd", "EEE").replace("tt", "aa");
            var parts = [];
            var dateFormatRegExp = /d{1,2}|E{1,6}|e{1,6}|c{3,6}|c{1}|M{1,5}|L{1,5}|y{1,4}|H{1,2}|h{1,2}|k{1,2}|K{1,2}|m{1,2}|a{1,5}|s{1,2}|S{1,3}|t{1,2}|z{1,4}|Z{1,5}|x{1,5}|X{1,5}|G{1,5}|q{1,5}|Q{1,5}|"[^"]*"|'[^']*'/g;

            var lastIndex = dateFormatRegExp.lastIndex = 0;
            var match = dateFormatRegExp.exec(pattern);
            var specifier;
            var type;
            var part;
            var names;
            var minLength;
            var patternLength;

            while (match) {
                var value = match[0];

                if (lastIndex < match.index) {
                    addLiteral(parts, pattern.substring(lastIndex, match.index));
                }

                if (startsWith(value, '"') || startsWith(value, "'")) {
                    addLiteral(parts, value);
                } else {
                    specifier = value[0];
                    type = DATE_FIELD_MAP[specifier];
                    part = {
                        type: type,
                        pattern: value
                    };

                    if (type === "hour") {
                        part.hour12 = isHour12(value);
                    }

                    names = NAME_TYPES[type];

                    if (names) {
                        minLength = typeof names.minLength === "number" ? names.minLength : names.minLength[specifier];
                        patternLength = value.length;

                        if (patternLength >= minLength && value !== "aa") {
                            part.names = {
                                type: names.type,
                                nameType: dateNameType(patternLength),
                                standAlone: names.standAlone === specifier
                            };
                        }
                    }

                    parts.push(part);
                }

                lastIndex = dateFormatRegExp.lastIndex;
                match = dateFormatRegExp.exec(pattern);
            }

            if (lastIndex < pattern.length) {
                addLiteral(parts, pattern.substring(lastIndex));
            }

            return parts;
        }

        function dateFormatNames(options) {
            let { type, nameType } = options;
            const info = kendo.culture();
            if (nameType === "wide") {
                nameType = "names";
            }
            if (nameType === "abbreviated") {
                nameType = "namesAbbr";
            }
            if (nameType === "narrow") {
                nameType = "namesShort";
            }
            let result = info.calendar[type][nameType];
            if (!result) {
                result = info.calendar[type]["name"];
            }
            return result;
        }

        function dateFieldName(options) {
            const info = kendo.culture();
            const dateFields = info.calendar.dateFields;
            const fieldNameInfo = dateFields[options.type] || {};

            return fieldNameInfo[options.nameType];
        }

        return {
            adjustDST: adjustDST,
            dayOfWeek: dayOfWeek,
            setDayOfWeek: setDayOfWeek,
            getDate: getDate,
            isInDateRange: isInDateRange,
            isInTimeRange: isInTimeRange,
            isToday: isToday,
            nextDay: function(date) {
                return addDays(date, 1);
            },
            previousDay: function(date) {
                return addDays(date, -1);
            },
            toUtcTime: toUtcTime,
            MS_PER_DAY: MS_PER_DAY,
            MS_PER_HOUR: 60 * MS_PER_MINUTE,
            MS_PER_MINUTE: MS_PER_MINUTE,
            setTime: setTime,
            setHours: setHours,
            addDays: addDays,
            today: today,
            toInvariantTime: toInvariantTime,
            firstDayOfMonth: firstDayOfMonth,
            splitDateFormat: splitDateFormat,
            dateFieldName: dateFieldName,
            dateFormatNames: dateFormatNames,
            lastDayOfMonth: lastDayOfMonth,
            weekInYear: weekInYear,
            getMilliseconds: getMilliseconds,
            firstDayOfYear: firstDayOfYear,
            lastDayOfYear: lastDayOfYear,
            nextYear: function(date) {
                return addYear(date, 1);
            },
            previousYear: function(date) {
                return addYear(date, -1);
            }
        };
    })();


    kendo.stripWhitespace = function(element) {
        if (document.createNodeIterator) {
            var iterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT, function(node) {
                    return node.parentNode == element ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }, false);

            while (iterator.nextNode()) {
                if (iterator.referenceNode && !iterator.referenceNode.textContent.trim()) {
                    iterator.referenceNode.parentNode.removeChild(iterator.referenceNode);
                }
            }
        }
    };

    var animationFrame = window.requestAnimationFrame ||
                          window.webkitRequestAnimationFrame ||
                          window.mozRequestAnimationFrame ||
                          window.oRequestAnimationFrame ||
                          window.msRequestAnimationFrame ||
                          function(callback) { setTimeout(callback, 1000 / 60); };

    kendo.animationFrame = function(callback) {
        animationFrame.call(window, callback);
    };

    var animationQueue = [];

    kendo.queueAnimation = function(callback) {
        animationQueue[animationQueue.length] = callback;
        if (animationQueue.length === 1) {
            kendo.runNextAnimation();
        }
    };

    kendo.runNextAnimation = function() {
        kendo.animationFrame(function() {
            if (animationQueue[0]) {
                animationQueue.shift()();
                if (animationQueue[0]) {
                    kendo.runNextAnimation();
                }
            }
        });
    };

    kendo.parseQueryStringParams = function(url) {
        var queryString = url.split('?')[1] || "",
            params = {},
            paramParts = queryString.split(/&|=/),
            length = paramParts.length,
            idx = 0;

        for (; idx < length; idx += 2) {
            if (paramParts[idx] !== "") {
                params[decodeURIComponent(paramParts[idx])] = decodeURIComponent(paramParts[idx + 1]);
            }
        }

        return params;
    };

    kendo.elementUnderCursor = function(e) {
        if (typeof e.x.client != "undefined") {
            return document.elementFromPoint(e.x.client, e.y.client);
        }
    };

    kendo.wheelDeltaY = function(jQueryEvent) {
        var e = jQueryEvent.originalEvent,
            deltaY = e.wheelDeltaY,
            delta;

            if (e.wheelDelta) { // Webkit and IE
                if (deltaY === undefined || deltaY) { // IE does not have deltaY, thus always scroll (horizontal scrolling is treated as vertical)
                    delta = e.wheelDelta;
                }
            } else if (e.detail && e.axis === e.VERTICAL_AXIS) { // Firefox and Opera
                delta = (-e.detail) * 10;
            }

        return delta;
    };

    kendo.throttle = function(fn, delay) {
        var timeout;
        var lastExecTime = 0;

        if (!delay || delay <= 0) {
            return fn;
        }

        var throttled = function() {
            var that = this;
            var elapsed = +new Date() - lastExecTime;
            var args = arguments;

            function exec() {
                fn.apply(that, args);
                lastExecTime = +new Date();
            }

            // first execution
            if (!lastExecTime) {
                return exec();
            }

            if (timeout) {
                clearTimeout(timeout);
            }

            if (elapsed > delay) {
                exec();
            } else {
                timeout = setTimeout(exec, delay - elapsed);
            }
        };

        throttled.cancel = function() {
            clearTimeout(timeout);
        };

        return throttled;
    };


    kendo.caret = function(element, start, end) {
        var rangeElement;
        var isPosition = start !== undefined;

        if (end === undefined) {
            end = start;
        }

        if (element[0]) {
            element = element[0];
        }

        if (isPosition && element.disabled) {
            return;
        }

        try {
            if (element.selectionStart !== undefined) {
                if (isPosition) {
                    element.focus();
                    var mobile = support.mobileOS;
                    if (mobile.wp || mobile.android) {// without the timeout the caret is at the end of the input
                        setTimeout(function() { element.setSelectionRange(start, end); }, 0);
                    }
                    else {
                        element.setSelectionRange(start, end);
                    }
                } else {
                    start = [element.selectionStart, element.selectionEnd];
                }
            } else if (document.selection) {
                if ($(element).is(":visible")) {
                    element.focus();
                }

                rangeElement = element.createTextRange();

                if (isPosition) {
                    rangeElement.collapse(true);
                    rangeElement.moveStart("character", start);
                    rangeElement.moveEnd("character", end - start);
                    rangeElement.select();
                } else {
                    var rangeDuplicated = rangeElement.duplicate(),
                        selectionStart, selectionEnd;

                        rangeElement.moveToBookmark(document.selection.createRange().getBookmark());
                        rangeDuplicated.setEndPoint('EndToStart', rangeElement);
                        selectionStart = rangeDuplicated.text.length;
                        selectionEnd = selectionStart + rangeElement.text.length;

                    start = [selectionStart, selectionEnd];
                }
            }
        } catch (e) {
            /* element is not focused or it is not in the DOM */
            start = [];
        }

        return start;
    };

    kendo.antiForgeryTokens = function() {
        var tokens = { },
            csrf_token = $("meta[name=csrf-token],meta[name=_csrf]").attr("content"),
            csrf_param = $("meta[name=csrf-param],meta[name=_csrf_header]").attr("content");

        $("input[name^='__RequestVerificationToken']").each(function() {
            tokens[this.name] = this.value;
        });

        if (csrf_param !== undefined && csrf_token !== undefined) {
          tokens[csrf_param] = csrf_token;
        }

        return tokens;
    };

    kendo.cycleForm = function(form) {
        var firstElement = form.find("input, .k-widget, .k-dropdownlist, .k-combobox").first();
        var lastElement = form.find("button, .k-button").last();

        function focus(el) {
            var widget = kendo.widgetInstance(el);

            if (widget && widget.focus) {
              widget.focus();
            } else {
              el.trigger("focus");
            }
        }

        lastElement.on("keydown", function(e) {
          if (e.keyCode == kendo.keys.TAB && !e.shiftKey) {
            e.preventDefault();
            focus(firstElement);
          }
        });

        firstElement.on("keydown", function(e) {
          if (e.keyCode == kendo.keys.TAB && e.shiftKey) {
            e.preventDefault();
            focus(lastElement);
          }
        });
    };

    kendo.focusElement = function(element) {
        var scrollTopPositions = [];
        var scrollableParents = element.parentsUntil("body")
                .filter(function(index, element) {
                    var computedStyle = kendo.getComputedStyles(element, ["overflow"]);
                    return computedStyle.overflow !== "visible";
                })
                .add(window);

        scrollableParents.each(function(index, parent) {
            scrollTopPositions[index] = $(parent).scrollTop();
        });

        try {
            //The setActive method does not cause the document to scroll to the active object in the current page
            element[0].setActive();
        } catch (e) {
            element.trigger("focus");
        }

        scrollableParents.each(function(index, parent) {
            $(parent).scrollTop(scrollTopPositions[index]);
        });
    };

    kendo.focusNextElement = function() {
        if (document.activeElement) {
            var focussable = $(":kendoFocusable");
            var index = focussable.index(document.activeElement);

            if (index > -1) {
               var nextElement = focussable[index + 1] || focussable[0];
               nextElement.focus();
            }
        }
    };

    kendo.trim = function(value) {
        if (!!value) {
            return value.toString().trim();
        } else {
            return "";
        }
    };

    kendo.getWidgetFocusableElement = function(element) {
        var nextFocusable = element.closest(":kendoFocusable"),
            widgetInstance = kendo.widgetInstance(element),
            target;

        if (nextFocusable.length) {
            target = nextFocusable;
        } else if (widgetInstance) {
            target = widgetInstance.options.name === 'Editor' ?
                $(widgetInstance.body) :
                widgetInstance.wrapper.find(":kendoFocusable").first();
        } else {
            target = element;
        }

        return target;
    };

    kendo.addAttribute = function(element, attribute, value) {
        var current = element.attr(attribute) || "";

        if (current.indexOf(value) < 0) {
            element.attr(attribute, (current + " " + value).trim());
        }
    };

    kendo.removeAttribute = function(element, attribute, value) {
        var current = element.attr(attribute) || "";

        element.attr(attribute, current.replace(value, "").trim());
    };

    kendo.toggleAttribute = function(element, attribute, value) {
        var current = element.attr(attribute) || "";

        if (current.indexOf(value) < 0) {
            kendo.addAttribute(element, attribute, value);
        } else {
            kendo.removeAttribute(element, attribute, value);
        }
    };

    kendo.matchesMedia = function(mediaQuery) {
        var media = kendo._bootstrapToMedia(mediaQuery) || mediaQuery;
        return support.matchMedia && window.matchMedia(media).matches;
    };

    kendo._bootstrapToMedia = function(bootstrapMedia) {
        return {
            "xs": "(max-width: 576px)",
            "sm": "(min-width: 576px)",
            "md": "(min-width: 768px)",
            "lg": "(min-width: 992px)",
            "xl": "(min-width: 1200px)"
        }[bootstrapMedia];
    };

    kendo.fileGroupMap = {
        audio: [".aif", ".iff", ".m3u", ".m4a", ".mid", ".mp3", ".mpa", ".wav", ".wma", ".ogg", ".wav", ".wma", ".wpl"],
        video: [".3g2", ".3gp", ".avi", ".asf", ".flv", ".m4u", ".rm", ".h264", ".m4v", ".mkv", ".mov", ".mp4", ".mpg",
                ".rm", ".swf", ".vob", ".wmv"],
        image: [".ai", ".dds", ".heic", ".jpe", "jfif", ".jif", ".jp2", ".jps", ".eps", ".bmp", ".gif", ".jpeg",
                ".jpg", ".png", ".ps", ".psd", ".svg", ".svgz", ".tif", ".tiff"],
        txt: [".doc", ".docx", ".log", ".pages", ".tex", ".wpd", ".wps", ".odt", ".rtf", ".text", ".txt", ".wks"],
        presentation: [".key", ".odp", ".pps", ".ppt", ".pptx"],
        data: [".xlr", ".xls", ".xlsx"],
        programming: [".tmp", ".bak", ".msi", ".cab", ".cpl", ".cur", ".dll", ".dmp", ".drv", ".icns", ".ico", ".link",
                      ".sys", ".cfg", ".ini", ".asp", ".aspx", ".cer", ".csr", ".css", ".dcr", ".htm", ".html", ".js",
                      ".php", ".rss", ".xhtml"],
        pdf: [".pdf"],
        config: [".apk", ".app", ".bat", ".cgi", ".com", ".exe", ".gadget", ".jar", ".wsf"],
        zip: [".7z", ".cbr", ".gz", ".sitx", ".arj", ".deb", ".pkg", ".rar", ".rpm", ".tar.gz", ".z", ".zip", ".zipx"],
        "disc-image": [".dmg", ".iso", ".toast", ".vcd", ".bin", ".cue", ".mdf"]
    };

    kendo.getFileGroup = function(extension, withPrefix) {
        var fileTypeMap = kendo.fileGroupMap;
        var groups = Object.keys(fileTypeMap);
        var type = "file";

        if (extension === undefined || !extension.length) {
            return type;
        }

        for (var i = 0; i < groups.length; i += 1) {
            var extensions = fileTypeMap[groups[i]];

            if (extensions.indexOf(extension.toLowerCase()) > -1) {
               return withPrefix ? "file-" + groups[i] : groups[i];
            }
        }

        return type;
    };

    kendo.getFileSizeMessage = function(size) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        if (size === 0) {
            return '0 Byte';
        }

        var i = parseInt(Math.floor(Math.log(size) / Math.log(1024)), 10);
        return Math.round(size / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    kendo.selectorFromClasses = function(classes) {
        return "." + classes.split(" ").join(".");
    };

    // Standardized Properties and CSS classes

    var themeColorValues = ['base', 'primary', 'secondary', 'tertiary', 'inherit', 'info', 'success', 'warning', 'error', 'dark', 'light', 'inverse'];
    var fillValues = ['solid', 'outline', 'flat'];
    //var postitionValues = ['edge', 'outside', 'inside'];
    var shapeValues = ['rectangle', 'square'];
    var sizeValues = [ ['small', 'sm'], ['medium', 'md'], ['large', 'lg'] ];
    var roundedValues = [ ['small', 'sm'], ['medium', 'md'], ['large', 'lg'], ['full', 'full'] ];
    //var alignValues = [ ['top start', 'top-start'], ['top end', 'top-end'], ['bottom start', 'bottom-start'], ['bottom end', 'bottom-end'] ];
    var positionModeValues = [ 'fixed', 'static', 'sticky', 'absolute' ];
    var resizeValues = [ ['both', 'resize'], ['horizontal', 'resize-x'], ['vertical', 'resize-y'] ];
    var overflowValues = [ 'auto', 'hidden', 'visible', 'scroll', 'clip' ];
    var layoutFlowValues = [ ['vertical', '!k-flex-col'], ['horizontal', '!k-flex-row'] ];

    kendo.cssProperties = (function() {
        var defaultValues = {},
            propertyDictionary = {};

        function registerPrefix(widget, prefix) {
            var dict = kendo.cssProperties.propertyDictionary;

            if (!dict[widget]) {
                dict[widget] = {};
            }

            dict[widget][PREFIX] = prefix;
        }

        function registerValues(widget, args) {
            var dict = kendo.cssProperties.propertyDictionary,
                i, j, prop, values, newValues, currentValue;

            for (i = 0; i < args.length; i++) {
                prop = args[i].prop;
                newValues = args[i].values;

                if (!dict[widget][prop]) {
                    dict[widget][prop] = {};
                }

                values = dict[widget][prop];

                for (j = 0; j < newValues.length; j++) {
                    currentValue = newValues[j];

                    if (isArray(newValues[j])) {
                        values[currentValue[0]] = currentValue[1];
                    } else {
                        values[currentValue] = currentValue;
                    }
                }
            }
        }

        function registerCssClass(propName, value, shorthand) {
            if (!defaultValues[propName]) {
                defaultValues[propName] = {};
            }

            defaultValues[propName][value] = shorthand || value;
        }

        function registerCssClasses(propName, arr) {
            for (var i = 0; i < arr.length; i++) {
                if (isArray(arr[i])) {
                    registerCssClass(propName, arr[i][0], arr[i][1]);
                } else {
                    registerCssClass(propName, arr[i]);
                }
            }
        }

        function getValidClass(args) {
            var widget = args.widget,
                propName = args.propName,
                value = args.value,
                fill = args.fill,
                cssProperties = kendo.cssProperties,
                defaultValues = cssProperties.defaultValues[propName],
                widgetProperties = cssProperties.propertyDictionary[widget],
                overridePrefix = args.prefix,
                widgetValues, validValue, prefix;

            if (!widgetProperties) {
                return "";
            }

            widgetValues = widgetProperties[propName];
            validValue = widgetValues ? widgetValues[value] || defaultValues[value] : defaultValues[value];

            if (validValue) {
                if (propName === "themeColor") {
                    prefix = widgetProperties[PREFIX] + fill + "-";
                } else if (propName === "positionMode") {
                    prefix = "k-pos-";
                } else if (propName === "rounded") {
                    prefix = "k-rounded-";
                } else if (propName === "resize") {
                    prefix = "k-";
                } else if (propName === "overflow") {
                    prefix = "k-overflow-";
                } else if (propName === "layoutFlow") {
                    prefix = "";
                } else {
                    prefix = widgetProperties[PREFIX];
                }

                prefix = overridePrefix || prefix;

                return prefix + validValue;
            } else {
                return "";
            }
        }

        registerCssClasses("themeColor", themeColorValues);
        registerCssClasses("fillMode", fillValues);
        registerCssClasses("shape", shapeValues);
        registerCssClasses("size", sizeValues);
        registerCssClasses("positionMode", positionModeValues);
        registerCssClasses("rounded", roundedValues);
        registerCssClasses("resize", resizeValues);
        registerCssClasses("overflow", overflowValues);
        registerCssClasses("layoutFlow", layoutFlowValues);

        return {
            positionModeValues: positionModeValues,
            roundedValues: roundedValues,
            sizeValues: sizeValues,
            shapeValues: shapeValues,
            fillModeValues: fillValues,
            themeColorValues: themeColorValues,

            defaultValues: defaultValues,
            propertyDictionary: propertyDictionary,

            registerValues: registerValues,
            getValidClass: getValidClass,
            registerPrefix: registerPrefix
        };
    }());

    //To do: delete below after implementing new styles and classes for BottomNavigation
    kendo.registerCssClass = function(propName, value, shorthand) {
        if (!kendo.propertyToCssClassMap[propName]) {
            kendo.propertyToCssClassMap[propName] = {};
        }

        kendo.propertyToCssClassMap[propName][value] = shorthand || value;
    };

    kendo.registerCssClasses = function(propName, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (isArray(arr[i])) {
                kendo.registerCssClass(propName, arr[i][0], arr[i][1]);
            } else {
                kendo.registerCssClass(propName, arr[i]);
            }
        }
    };

    kendo.getValidCssClass = function(prefix, propName, value) {
        var validValue = kendo.propertyToCssClassMap[propName][value];

        if (validValue) {
            return prefix + validValue;
        }
    };

    kendo.propertyToCssClassMap = {};

    kendo.registerCssClasses("themeColor", themeColorValues);
    kendo.registerCssClasses("fill", fillValues);
    //kendo.registerCssClasses("postition", postitionValues);
    kendo.registerCssClasses("shape", shapeValues);
    kendo.registerCssClasses("size", sizeValues);
    //kendo.registerCssClasses("align", alignValues);
    kendo.registerCssClasses("positionMode", positionModeValues);

    kendo.applyStylesFromKendoAttributes = function(element, styleProps) {
        let selector = styleProps.map(styleProp=> `[${kendo.attr(`style-${styleProp}`)}]`).join(',');
        element.find(selector).addBack(selector).each((_, currentElement) => {
            let $currentElement = $(currentElement);
            styleProps.forEach(function(styleProp) {
                let kendoAttr = kendo.attr(`style-${styleProp}`);
                if ($currentElement.attr(kendoAttr)) {
                    $currentElement.css(styleProp, $currentElement.attr(kendoAttr));
                    $currentElement.removeAttr(kendoAttr);
                }
            });
        });
    };

    // jQuery deferred helpers

    // influenced from: https://gist.github.com/fearphage/4341799
    kendo.whenAll = function(array) {
        var resolveValues = arguments.length == 1 && Array.isArray(array) ? array : Array.prototype.slice.call(arguments),
            length = resolveValues.length,
            remaining = length,
            deferred = $.Deferred(),
            i = 0,
            failed = 0,
            rejectContexts = Array(length),
            rejectValues = Array(length),
            resolveContexts = Array(length),
            value;

        function updateFunc(index, contexts, values) {
            return function() {
                if (values != resolveValues) {
                    failed++;
                }

                deferred.notifyWith(
                    contexts[index] = this,
                    values[index] = Array.prototype.slice.call(arguments)
                );

                if (!(--remaining)) {
                    deferred[(!failed ? 'resolve' : 'reject') + 'With'](contexts, values);
                }
            };
        }

        for (; i < length; i++) {
            if ((value = resolveValues[i]) && kendo.isFunction(value.promise)) {
                value.promise()
                    .done(updateFunc(i, resolveContexts, resolveValues))
                    .fail(updateFunc(i, rejectContexts, rejectValues));
            }

            else {
                deferred.notifyWith(this, value);
                --remaining;
            }
        }

        if (!remaining) {
            deferred.resolveWith(resolveContexts, resolveValues);
        }

        return deferred.promise();
    };

    // kendo.saveAs -----------------------------------------------
    (function() {
        function postToProxy(dataURI, fileName, proxyURL, proxyTarget) {
            var form = $("<form>").attr({
                action: proxyURL,
                method: "POST",
                target: proxyTarget
            });

            var data = kendo.antiForgeryTokens();
            data.fileName = fileName;

            var parts = dataURI.split(";base64,");
            data.contentType = parts[0].replace("data:", "");
            data.base64 = parts[1];

            for (var name in data) {
                if (data.hasOwnProperty(name)) {
                    $('<input>').attr({
                        value: data[name],
                        name: name,
                        type: "hidden"
                    }).appendTo(form);
                }
            }

            form.appendTo("body").submit().remove();
        }

        var fileSaver = document.createElement("a");
        var downloadAttribute = "download" in fileSaver && !kendo.support.browser.edge;

        function saveAsBlob(dataURI, fileName) {
            var blob = dataURI; // could be a Blob object

            if (typeof dataURI == "string") {
                var parts = dataURI.split(";base64,");
                var contentType = parts[0];
                var base64 = atob(parts[1]);
                var array = new Uint8Array(base64.length);

                for (var idx = 0; idx < base64.length; idx++) {
                    array[idx] = base64.charCodeAt(idx);
                }
                blob = new Blob([array.buffer], { type: contentType });
            }

            navigator.msSaveBlob(blob, fileName);
        }

        function saveAsDataURI(dataURI, fileName) {
            if (window.Blob && dataURI instanceof Blob) {
                dataURI = URL.createObjectURL(dataURI);
            }

            fileSaver.download = fileName;
            fileSaver.href = dataURI;

            var e = document.createEvent("MouseEvents");
            e.initMouseEvent("click", true, false, window,
                0, 0, 0, 0, 0, false, false, false, false, 0, null);

            fileSaver.dispatchEvent(e);
            setTimeout(function() {
                URL.revokeObjectURL(dataURI);
            });
        }

        kendo.saveAs = function(options) {
            var save = postToProxy;

            if (!options.forceProxy) {
                if (downloadAttribute) {
                    save = saveAsDataURI;
                } else if (navigator.msSaveBlob) {
                    save = saveAsBlob;
                }
            }

            save(options.dataURI, options.fileName, options.proxyURL, options.proxyTarget);
        };
    })();

    // kendo proxySetters
    kendo.proxyModelSetters = function proxyModelSetters(data) {
        var observable = {};

        Object.keys(data || {}).forEach(function(property) {
          Object.defineProperty(observable, property, {
            get: function() {
              return data[property];
            },
            set: function(value) {
              data[property] = value;
              data.dirty = true;
            }
          });
        });

        return observable;
    };

    kendo.getSeriesColors = function() {
        var seriesColorsTemplate = '<div class="k-var--series-a"></div>' +
                '<div class="k-var--series-b"></div>' +
                '<div class="k-var--series-c"></div>' +
                '<div class="k-var--series-d"></div>' +
                '<div class="k-var--series-e"></div>' +
                '<div class="k-var--series-f"></div>',
            series = $(seriesColorsTemplate),
            colors = [];

        series.appendTo($('body'));

        series.each(function(i, item) {
            colors.push($(item).css("background-color"));
        });

        series.remove();

        return colors;
    };

    kendo.isElement = function(element) {
        return element instanceof Element || element instanceof HTMLDocument;
    };

    // Kendo defaults
    (function() {

        kendo.defaults = kendo.defaults || {};
        kendo.setDefaults = function(key, value) {
            var path = key.split(".");
            var curr = kendo.defaults;

            key = path.pop();

            path.forEach(function(part) {
                if (curr[part] === undefined) {
                    curr[part] = {};
                }

                curr = curr[part];
            });

            if (value.constructor === Object) {
                curr[key] = deepExtend({}, curr[key], value);
            } else {
                curr[key] = value;
            }
        };

        // Use external global flags for templates.
        kendo.debugTemplates = window.DEBUG_KENDO_TEMPLATES;

        // Setup default mediaQuery breakpoints
        kendo.setDefaults('breakpoints', defaultBreakpoints);
    })();

    // Implement type() as it has been depricated in jQuery
    (function() {
        kendo.class2type = {};

        jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
            function( _i, name ) {
                kendo.class2type[ "[object " + name + "]" ] = name.toLowerCase();
            } );

        kendo.type = function(obj) {
            if ( obj == null ) {
                return obj + "";
            }

            // Support: Android <=2.3 only (functionish RegExp)
            return typeof obj === "object" || typeof obj === "function" ?
                kendo.class2type[Object.prototype.toString.call(obj)] || "object" :
                typeof obj;
        };
    }());

})(jQuery, window);

export { fromESClass };
export default kendo;
