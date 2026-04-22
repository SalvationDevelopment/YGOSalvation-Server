var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.production.js
var require_react_production = __commonJS({
  "node_modules/react/cjs/react.production.js"(exports2) {
    "use strict";
    var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
    var REACT_PORTAL_TYPE = Symbol.for("react.portal");
    var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
    var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
    var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
    var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
    var REACT_CONTEXT_TYPE = Symbol.for("react.context");
    var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
    var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
    var REACT_MEMO_TYPE = Symbol.for("react.memo");
    var REACT_LAZY_TYPE = Symbol.for("react.lazy");
    var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable)
        return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    var ReactNoopUpdateQueue = {
      isMounted: function() {
        return false;
      },
      enqueueForceUpdate: function() {
      },
      enqueueReplaceState: function() {
      },
      enqueueSetState: function() {
      }
    };
    var assign = Object.assign;
    var emptyObject = {};
    function Component(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    Component.prototype.isReactComponent = {};
    Component.prototype.setState = function(partialState, callback) {
      if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, partialState, callback, "setState");
    };
    Component.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
    };
    function ComponentDummy() {
    }
    ComponentDummy.prototype = Component.prototype;
    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
    pureComponentPrototype.constructor = PureComponent;
    assign(pureComponentPrototype, Component.prototype);
    pureComponentPrototype.isPureReactComponent = true;
    var isArrayImpl = Array.isArray;
    function noop() {
    }
    var ReactSharedInternals = { H: null, A: null, T: null, S: null };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function ReactElement(type, key, props) {
      var refProp = props.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== refProp ? refProp : null,
        props
      };
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      return ReactElement(oldElement.type, newKey, oldElement.props);
    }
    function isValidElement(object) {
      return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function escape(key) {
      var escaperLookup = { "=": "=0", ":": "=2" };
      return "$" + key.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
      });
    }
    var userProvidedKeyEscapeRegex = /\/+/g;
    function getElementKey(element, index) {
      return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
    }
    function resolveThenable(thenable) {
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
            function(fulfilledValue) {
              "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            },
            function(error) {
              "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            }
          )), thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
          }
      }
      throw thenable;
    }
    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      var type = typeof children;
      if ("undefined" === type || "boolean" === type)
        children = null;
      var invokeCallback = false;
      if (null === children)
        invokeCallback = true;
      else
        switch (type) {
          case "bigint":
          case "string":
          case "number":
            invokeCallback = true;
            break;
          case "object":
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
                break;
              case REACT_LAZY_TYPE:
                return invokeCallback = children._init, mapIntoArray(
                  invokeCallback(children._payload),
                  array,
                  escapedPrefix,
                  nameSoFar,
                  callback
                );
            }
        }
      if (invokeCallback)
        return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
          return c;
        })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
          callback,
          escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
            userProvidedKeyEscapeRegex,
            "$&/"
          ) + "/") + invokeCallback
        )), array.push(callback)), 1;
      invokeCallback = 0;
      var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
      if (isArrayImpl(children))
        for (var i = 0; i < children.length; i++)
          nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if (i = getIteratorFn(children), "function" === typeof i)
        for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
          nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if ("object" === type) {
        if ("function" === typeof children.then)
          return mapIntoArray(
            resolveThenable(children),
            array,
            escapedPrefix,
            nameSoFar,
            callback
          );
        array = String(children);
        throw Error(
          "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
        );
      }
      return invokeCallback;
    }
    function mapChildren(children, func, context) {
      if (null == children)
        return children;
      var result = [], count = 0;
      mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    function lazyInitializer(payload) {
      if (-1 === payload._status) {
        var ctor = payload._result;
        ctor = ctor();
        ctor.then(
          function(moduleObject) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 1, payload._result = moduleObject;
          },
          function(error) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 2, payload._result = error;
          }
        );
        -1 === payload._status && (payload._status = 0, payload._result = ctor);
      }
      if (1 === payload._status)
        return payload._result.default;
      throw payload._result;
    }
    var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
      if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
        var event = new window.ErrorEvent("error", {
          bubbles: true,
          cancelable: true,
          message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
          error
        });
        if (!window.dispatchEvent(event))
          return;
      } else if ("object" === typeof process && "function" === typeof process.emit) {
        process.emit("uncaughtException", error);
        return;
      }
      console.error(error);
    };
    var Children = {
      map: mapChildren,
      forEach: function(children, forEachFunc, forEachContext) {
        mapChildren(
          children,
          function() {
            forEachFunc.apply(this, arguments);
          },
          forEachContext
        );
      },
      count: function(children) {
        var n = 0;
        mapChildren(children, function() {
          n++;
        });
        return n;
      },
      toArray: function(children) {
        return mapChildren(children, function(child) {
          return child;
        }) || [];
      },
      only: function(children) {
        if (!isValidElement(children))
          throw Error(
            "React.Children.only expected to receive a single React element child."
          );
        return children;
      }
    };
    exports2.Activity = REACT_ACTIVITY_TYPE;
    exports2.Children = Children;
    exports2.Component = Component;
    exports2.Fragment = REACT_FRAGMENT_TYPE;
    exports2.Profiler = REACT_PROFILER_TYPE;
    exports2.PureComponent = PureComponent;
    exports2.StrictMode = REACT_STRICT_MODE_TYPE;
    exports2.Suspense = REACT_SUSPENSE_TYPE;
    exports2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
    exports2.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function(size) {
        return ReactSharedInternals.H.useMemoCache(size);
      }
    };
    exports2.cache = function(fn) {
      return function() {
        return fn.apply(null, arguments);
      };
    };
    exports2.cacheSignal = function() {
      return null;
    };
    exports2.cloneElement = function(element, config, children) {
      if (null === element || void 0 === element)
        throw Error(
          "The argument must be a React element, but you passed " + element + "."
        );
      var props = assign({}, element.props), key = element.key;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
      var propName = arguments.length - 2;
      if (1 === propName)
        props.children = children;
      else if (1 < propName) {
        for (var childArray = Array(propName), i = 0; i < propName; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      return ReactElement(element.type, key, props);
    };
    exports2.createContext = function(defaultValue) {
      defaultValue = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null
      };
      defaultValue.Provider = defaultValue;
      defaultValue.Consumer = {
        $$typeof: REACT_CONSUMER_TYPE,
        _context: defaultValue
      };
      return defaultValue;
    };
    exports2.createElement = function(type, config, children) {
      var propName, props = {}, key = null;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
      var childrenLength = arguments.length - 2;
      if (1 === childrenLength)
        props.children = children;
      else if (1 < childrenLength) {
        for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      if (type && type.defaultProps)
        for (propName in childrenLength = type.defaultProps, childrenLength)
          void 0 === props[propName] && (props[propName] = childrenLength[propName]);
      return ReactElement(type, key, props);
    };
    exports2.createRef = function() {
      return { current: null };
    };
    exports2.forwardRef = function(render) {
      return { $$typeof: REACT_FORWARD_REF_TYPE, render };
    };
    exports2.isValidElement = isValidElement;
    exports2.lazy = function(ctor) {
      return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: { _status: -1, _result: ctor },
        _init: lazyInitializer
      };
    };
    exports2.memo = function(type, compare) {
      return {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: void 0 === compare ? null : compare
      };
    };
    exports2.startTransition = function(scope) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
      } catch (error) {
        reportGlobalError(error);
      } finally {
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    };
    exports2.unstable_useCacheRefresh = function() {
      return ReactSharedInternals.H.useCacheRefresh();
    };
    exports2.use = function(usable) {
      return ReactSharedInternals.H.use(usable);
    };
    exports2.useActionState = function(action, initialState, permalink) {
      return ReactSharedInternals.H.useActionState(action, initialState, permalink);
    };
    exports2.useCallback = function(callback, deps) {
      return ReactSharedInternals.H.useCallback(callback, deps);
    };
    exports2.useContext = function(Context) {
      return ReactSharedInternals.H.useContext(Context);
    };
    exports2.useDebugValue = function() {
    };
    exports2.useDeferredValue = function(value, initialValue) {
      return ReactSharedInternals.H.useDeferredValue(value, initialValue);
    };
    exports2.useEffect = function(create, deps) {
      return ReactSharedInternals.H.useEffect(create, deps);
    };
    exports2.useEffectEvent = function(callback) {
      return ReactSharedInternals.H.useEffectEvent(callback);
    };
    exports2.useId = function() {
      return ReactSharedInternals.H.useId();
    };
    exports2.useImperativeHandle = function(ref, create, deps) {
      return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
    };
    exports2.useInsertionEffect = function(create, deps) {
      return ReactSharedInternals.H.useInsertionEffect(create, deps);
    };
    exports2.useLayoutEffect = function(create, deps) {
      return ReactSharedInternals.H.useLayoutEffect(create, deps);
    };
    exports2.useMemo = function(create, deps) {
      return ReactSharedInternals.H.useMemo(create, deps);
    };
    exports2.useOptimistic = function(passthrough, reducer) {
      return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
    };
    exports2.useReducer = function(reducer, initialArg, init) {
      return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
    };
    exports2.useRef = function(initialValue) {
      return ReactSharedInternals.H.useRef(initialValue);
    };
    exports2.useState = function(initialState) {
      return ReactSharedInternals.H.useState(initialState);
    };
    exports2.useSyncExternalStore = function(subscribe2, getSnapshot, getServerSnapshot) {
      return ReactSharedInternals.H.useSyncExternalStore(
        subscribe2,
        getSnapshot,
        getServerSnapshot
      );
    };
    exports2.useTransition = function() {
      return ReactSharedInternals.H.useTransition();
    };
    exports2.version = "19.2.3";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports2, module2) {
    "use strict";
    "production" !== process.env.NODE_ENV && function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type)
          return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type)
          return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE)
          return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning)
            return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          oldElement.props,
          oldElement._owner,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type)
          children = null;
        var invokeCallback = false;
        if (null === children)
          invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children)
          return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ioInfo = payload._ioInfo;
          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());
          ioInfo = payload._result;
          var thenable = ioInfo();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 1;
                payload._result = moduleObject;
                var _ioInfo = payload._ioInfo;
                null != _ioInfo && (_ioInfo.end = performance.now());
                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
              }
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 2;
                payload._result = error;
                var _ioInfo2 = payload._ioInfo;
                null != _ioInfo2 && (_ioInfo2.end = performance.now());
                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            }
          );
          ioInfo = payload._ioInfo;
          if (null != ioInfo) {
            ioInfo.value = thenable;
            var displayName = thenable.displayName;
            "string" === typeof displayName && (ioInfo.name = displayName);
          }
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status)
          return ioInfo = payload._result, void 0 === ioInfo && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ioInfo
          ), "default" in ioInfo || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ioInfo
          ), ioInfo.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function releaseAsyncTransition() {
        ReactSharedInternals.asyncTransitions--;
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module2 && module2[requireString]).call(
              module2,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else
            ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else
                  break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event))
            return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      var fnName = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports2.Activity = REACT_ACTIVITY_TYPE;
      exports2.Children = fnName;
      exports2.Component = Component;
      exports2.Fragment = REACT_FRAGMENT_TYPE;
      exports2.Profiler = REACT_PROFILER_TYPE;
      exports2.PureComponent = PureComponent;
      exports2.StrictMode = REACT_STRICT_MODE_TYPE;
      exports2.Suspense = REACT_SUSPENSE_TYPE;
      exports2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports2.__COMPILER_RUNTIME = deprecatedAPIs;
      exports2.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else
                    resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports2.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports2.cacheSignal = function() {
        return null;
      };
      exports2.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports2.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName)
          props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          validateChildKeys(arguments[key]);
        return props;
      };
      exports2.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports2.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++)
          validateChildKeys(arguments[i]);
        i = {};
        var key = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength)
          i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        key && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return ReactElement(
          type,
          key,
          i,
          getOwner(),
          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports2.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports2.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports2.isValidElement = isValidElement;
      exports2.lazy = function(ctor) {
        ctor = { _status: -1, _result: ctor };
        var lazyType = {
          $$typeof: REACT_LAZY_TYPE,
          _payload: ctor,
          _init: lazyInitializer
        }, ioInfo = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        ctor._ioInfo = ioInfo;
        lazyType._debugInfo = [{ awaited: ioInfo }];
        return lazyType;
      };
      exports2.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports2.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      };
      exports2.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports2.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports2.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports2.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports2.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports2.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports2.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports2.useEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useEffect(create, deps);
      };
      exports2.useEffectEvent = function(callback) {
        return resolveDispatcher().useEffectEvent(callback);
      };
      exports2.useId = function() {
        return resolveDispatcher().useId();
      };
      exports2.useImperativeHandle = function(ref, create, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create, deps);
      };
      exports2.useInsertionEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create, deps);
      };
      exports2.useLayoutEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create, deps);
      };
      exports2.useMemo = function(create, deps) {
        return resolveDispatcher().useMemo(create, deps);
      };
      exports2.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports2.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports2.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports2.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports2.useSyncExternalStore = function(subscribe2, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe2,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports2.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports2.version = "19.2.3";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    }();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_react_production();
    } else {
      module2.exports = require_react_development();
    }
  }
});

// node_modules/next/node_modules/@swc/helpers/cjs/_interop_require_default.cjs
var require_interop_require_default = __commonJS({
  "node_modules/next/node_modules/@swc/helpers/cjs/_interop_require_default.cjs"(exports2) {
    "use strict";
    function _interop_require_default(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports2._ = _interop_require_default;
  }
});

// node_modules/next/dist/shared/lib/utils/warn-once.js
var require_warn_once = __commonJS({
  "node_modules/next/dist/shared/lib/utils/warn-once.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "warnOnce", {
      enumerable: true,
      get: function() {
        return warnOnce;
      }
    });
    var warnOnce = (_) => {
    };
    if (process.env.NODE_ENV !== "production") {
      const warnings = /* @__PURE__ */ new Set();
      warnOnce = (msg) => {
        if (!warnings.has(msg)) {
          console.warn(msg);
        }
        warnings.add(msg);
      };
    }
  }
});

// node_modules/next/dist/shared/lib/deployment-id.js
var require_deployment_id = __commonJS({
  "node_modules/next/dist/shared/lib/deployment-id.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all)
        Object.defineProperty(target, name, {
          enumerable: true,
          get: all[name]
        });
    }
    _export(exports2, {
      getDeploymentId: function() {
        return getDeploymentId;
      },
      getDeploymentIdQueryOrEmptyString: function() {
        return getDeploymentIdQueryOrEmptyString;
      }
    });
    function getDeploymentId() {
      return process.env.NEXT_DEPLOYMENT_ID;
    }
    function getDeploymentIdQueryOrEmptyString() {
      let deploymentId = getDeploymentId();
      if (deploymentId) {
        return `?dpl=${deploymentId}`;
      }
      return "";
    }
  }
});

// node_modules/next/dist/shared/lib/image-blur-svg.js
var require_image_blur_svg = __commonJS({
  "node_modules/next/dist/shared/lib/image-blur-svg.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "getImageBlurSvg", {
      enumerable: true,
      get: function() {
        return getImageBlurSvg;
      }
    });
    function getImageBlurSvg({ widthInt, heightInt, blurWidth, blurHeight, blurDataURL, objectFit }) {
      const std = 20;
      const svgWidth = blurWidth ? blurWidth * 40 : widthInt;
      const svgHeight = blurHeight ? blurHeight * 40 : heightInt;
      const viewBox = svgWidth && svgHeight ? `viewBox='0 0 ${svgWidth} ${svgHeight}'` : "";
      const preserveAspectRatio = viewBox ? "none" : objectFit === "contain" ? "xMidYMid" : objectFit === "cover" ? "xMidYMid slice" : "none";
      return `%3Csvg xmlns='http://www.w3.org/2000/svg' ${viewBox}%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='${std}'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='${std}'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='${preserveAspectRatio}' style='filter: url(%23b);' href='${blurDataURL}'/%3E%3C/svg%3E`;
    }
  }
});

// node_modules/next/dist/shared/lib/image-config.js
var require_image_config = __commonJS({
  "node_modules/next/dist/shared/lib/image-config.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all)
        Object.defineProperty(target, name, {
          enumerable: true,
          get: all[name]
        });
    }
    _export(exports2, {
      VALID_LOADERS: function() {
        return VALID_LOADERS;
      },
      imageConfigDefault: function() {
        return imageConfigDefault;
      }
    });
    var VALID_LOADERS = [
      "default",
      "imgix",
      "cloudinary",
      "akamai",
      "custom"
    ];
    var imageConfigDefault = {
      deviceSizes: [
        640,
        750,
        828,
        1080,
        1200,
        1920,
        2048,
        3840
      ],
      imageSizes: [
        32,
        48,
        64,
        96,
        128,
        256,
        384
      ],
      path: "/_next/image",
      loader: "default",
      loaderFile: "",
      /**
      * @deprecated Use `remotePatterns` instead to protect your application from malicious users.
      */
      domains: [],
      disableStaticImages: false,
      minimumCacheTTL: 14400,
      formats: [
        "image/webp"
      ],
      maximumRedirects: 3,
      maximumResponseBody: 5e7,
      dangerouslyAllowLocalIP: false,
      dangerouslyAllowSVG: false,
      contentSecurityPolicy: `script-src 'none'; frame-src 'none'; sandbox;`,
      contentDispositionType: "attachment",
      localPatterns: void 0,
      remotePatterns: [],
      qualities: [
        75
      ],
      unoptimized: false
    };
  }
});

// node_modules/next/dist/shared/lib/get-img-props.js
var require_get_img_props = __commonJS({
  "node_modules/next/dist/shared/lib/get-img-props.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "getImgProps", {
      enumerable: true,
      get: function() {
        return getImgProps;
      }
    });
    var _warnonce = require_warn_once();
    var _deploymentid = require_deployment_id();
    var _imageblursvg = require_image_blur_svg();
    var _imageconfig = require_image_config();
    var VALID_LOADING_VALUES = [
      "lazy",
      "eager",
      void 0
    ];
    var INVALID_BACKGROUND_SIZE_VALUES = [
      "-moz-initial",
      "fill",
      "none",
      "scale-down",
      void 0
    ];
    function isStaticRequire(src) {
      return src.default !== void 0;
    }
    function isStaticImageData(src) {
      return src.src !== void 0;
    }
    function isStaticImport(src) {
      return !!src && typeof src === "object" && (isStaticRequire(src) || isStaticImageData(src));
    }
    var allImgs = /* @__PURE__ */ new Map();
    var perfObserver;
    function getInt(x) {
      if (typeof x === "undefined") {
        return x;
      }
      if (typeof x === "number") {
        return Number.isFinite(x) ? x : NaN;
      }
      if (typeof x === "string" && /^[0-9]+$/.test(x)) {
        return parseInt(x, 10);
      }
      return NaN;
    }
    function getWidths({ deviceSizes, allSizes }, width, sizes) {
      if (sizes) {
        const viewportWidthRe = /(^|\s)(1?\d?\d)vw/g;
        const percentSizes = [];
        for (let match; match = viewportWidthRe.exec(sizes); match) {
          percentSizes.push(parseInt(match[2]));
        }
        if (percentSizes.length) {
          const smallestRatio = Math.min(...percentSizes) * 0.01;
          return {
            widths: allSizes.filter((s) => s >= deviceSizes[0] * smallestRatio),
            kind: "w"
          };
        }
        return {
          widths: allSizes,
          kind: "w"
        };
      }
      if (typeof width !== "number") {
        return {
          widths: deviceSizes,
          kind: "w"
        };
      }
      const widths = [
        ...new Set(
          // > This means that most OLED screens that say they are 3x resolution,
          // > are actually 3x in the green color, but only 1.5x in the red and
          // > blue colors. Showing a 3x resolution image in the app vs a 2x
          // > resolution image will be visually the same, though the 3x image
          // > takes significantly more data. Even true 3x resolution screens are
          // > wasteful as the human eye cannot see that level of detail without
          // > something like a magnifying glass.
          // https://blog.twitter.com/engineering/en_us/topics/infrastructure/2019/capping-image-fidelity-on-ultra-high-resolution-devices.html
          [
            width,
            width * 2
            /*, width * 3*/
          ].map((w) => allSizes.find((p) => p >= w) || allSizes[allSizes.length - 1])
        )
      ];
      return {
        widths,
        kind: "x"
      };
    }
    function generateImgAttrs({ config, src, unoptimized, width, quality, sizes, loader }) {
      if (unoptimized) {
        const deploymentId = (0, _deploymentid.getDeploymentId)();
        if (src.startsWith("/") && !src.startsWith("//") && deploymentId) {
          const sep = src.includes("?") ? "&" : "?";
          src = `${src}${sep}dpl=${deploymentId}`;
        }
        return {
          src,
          srcSet: void 0,
          sizes: void 0
        };
      }
      const { widths, kind } = getWidths(config, width, sizes);
      const last = widths.length - 1;
      return {
        sizes: !sizes && kind === "w" ? "100vw" : sizes,
        srcSet: widths.map((w, i) => `${loader({
          config,
          src,
          quality,
          width: w
        })} ${kind === "w" ? w : i + 1}${kind}`).join(", "),
        // It's intended to keep `src` the last attribute because React updates
        // attributes in order. If we keep `src` the first one, Safari will
        // immediately start to fetch `src`, before `sizes` and `srcSet` are even
        // updated by React. That causes multiple unnecessary requests if `srcSet`
        // and `sizes` are defined.
        // This bug cannot be reproduced in Chrome or Firefox.
        src: loader({
          config,
          src,
          quality,
          width: widths[last]
        })
      };
    }
    function getImgProps({ src, sizes, unoptimized = false, priority = false, preload = false, loading, className, quality, width, height, fill = false, style, overrideSrc, onLoad, onLoadingComplete, placeholder = "empty", blurDataURL, fetchPriority, decoding = "async", layout, objectFit, objectPosition, lazyBoundary, lazyRoot, ...rest }, _state) {
      const { imgConf, showAltText, blurComplete, defaultLoader } = _state;
      let config;
      let c = imgConf || _imageconfig.imageConfigDefault;
      if ("allSizes" in c) {
        config = c;
      } else {
        const allSizes = [
          ...c.deviceSizes,
          ...c.imageSizes
        ].sort((a, b) => a - b);
        const deviceSizes = c.deviceSizes.sort((a, b) => a - b);
        const qualities = c.qualities?.sort((a, b) => a - b);
        config = {
          ...c,
          allSizes,
          deviceSizes,
          qualities
        };
      }
      if (typeof defaultLoader === "undefined") {
        throw Object.defineProperty(new Error("images.loaderFile detected but the file is missing default export.\nRead more: https://nextjs.org/docs/messages/invalid-images-config"), "__NEXT_ERROR_CODE", {
          value: "E163",
          enumerable: false,
          configurable: true
        });
      }
      let loader = rest.loader || defaultLoader;
      delete rest.loader;
      delete rest.srcSet;
      const isDefaultLoader = "__next_img_default" in loader;
      if (isDefaultLoader) {
        if (config.loader === "custom") {
          throw Object.defineProperty(new Error(`Image with src "${src}" is missing "loader" prop.
Read more: https://nextjs.org/docs/messages/next-image-missing-loader`), "__NEXT_ERROR_CODE", {
            value: "E252",
            enumerable: false,
            configurable: true
          });
        }
      } else {
        const customImageLoader = loader;
        loader = (obj) => {
          const { config: _, ...opts } = obj;
          return customImageLoader(opts);
        };
      }
      if (layout) {
        if (layout === "fill") {
          fill = true;
        }
        const layoutToStyle = {
          intrinsic: {
            maxWidth: "100%",
            height: "auto"
          },
          responsive: {
            width: "100%",
            height: "auto"
          }
        };
        const layoutToSizes = {
          responsive: "100vw",
          fill: "100vw"
        };
        const layoutStyle = layoutToStyle[layout];
        if (layoutStyle) {
          style = {
            ...style,
            ...layoutStyle
          };
        }
        const layoutSizes = layoutToSizes[layout];
        if (layoutSizes && !sizes) {
          sizes = layoutSizes;
        }
      }
      let staticSrc = "";
      let widthInt = getInt(width);
      let heightInt = getInt(height);
      let blurWidth;
      let blurHeight;
      if (isStaticImport(src)) {
        const staticImageData = isStaticRequire(src) ? src.default : src;
        if (!staticImageData.src) {
          throw Object.defineProperty(new Error(`An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received ${JSON.stringify(staticImageData)}`), "__NEXT_ERROR_CODE", {
            value: "E460",
            enumerable: false,
            configurable: true
          });
        }
        if (!staticImageData.height || !staticImageData.width) {
          throw Object.defineProperty(new Error(`An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received ${JSON.stringify(staticImageData)}`), "__NEXT_ERROR_CODE", {
            value: "E48",
            enumerable: false,
            configurable: true
          });
        }
        blurWidth = staticImageData.blurWidth;
        blurHeight = staticImageData.blurHeight;
        blurDataURL = blurDataURL || staticImageData.blurDataURL;
        staticSrc = staticImageData.src;
        if (!fill) {
          if (!widthInt && !heightInt) {
            widthInt = staticImageData.width;
            heightInt = staticImageData.height;
          } else if (widthInt && !heightInt) {
            const ratio = widthInt / staticImageData.width;
            heightInt = Math.round(staticImageData.height * ratio);
          } else if (!widthInt && heightInt) {
            const ratio = heightInt / staticImageData.height;
            widthInt = Math.round(staticImageData.width * ratio);
          }
        }
      }
      src = typeof src === "string" ? src : staticSrc;
      let isLazy = !priority && !preload && (loading === "lazy" || typeof loading === "undefined");
      if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
        unoptimized = true;
        isLazy = false;
      }
      if (config.unoptimized) {
        unoptimized = true;
      }
      if (isDefaultLoader && !config.dangerouslyAllowSVG && src.split("?", 1)[0].endsWith(".svg")) {
        unoptimized = true;
      }
      const qualityInt = getInt(quality);
      if (process.env.NODE_ENV !== "production") {
        if (config.output === "export" && isDefaultLoader && !unoptimized) {
          throw Object.defineProperty(new Error(`Image Optimization using the default loader is not compatible with \`{ output: 'export' }\`.
  Possible solutions:
    - Remove \`{ output: 'export' }\` and run "next start" to run server mode including the Image Optimization API.
    - Configure \`{ images: { unoptimized: true } }\` in \`next.config.js\` to disable the Image Optimization API.
  Read more: https://nextjs.org/docs/messages/export-image-api`), "__NEXT_ERROR_CODE", {
            value: "E500",
            enumerable: false,
            configurable: true
          });
        }
        if (!src) {
          unoptimized = true;
        } else {
          if (fill) {
            if (width) {
              throw Object.defineProperty(new Error(`Image with src "${src}" has both "width" and "fill" properties. Only one should be used.`), "__NEXT_ERROR_CODE", {
                value: "E96",
                enumerable: false,
                configurable: true
              });
            }
            if (height) {
              throw Object.defineProperty(new Error(`Image with src "${src}" has both "height" and "fill" properties. Only one should be used.`), "__NEXT_ERROR_CODE", {
                value: "E115",
                enumerable: false,
                configurable: true
              });
            }
            if (style?.position && style.position !== "absolute") {
              throw Object.defineProperty(new Error(`Image with src "${src}" has both "fill" and "style.position" properties. Images with "fill" always use position absolute - it cannot be modified.`), "__NEXT_ERROR_CODE", {
                value: "E216",
                enumerable: false,
                configurable: true
              });
            }
            if (style?.width && style.width !== "100%") {
              throw Object.defineProperty(new Error(`Image with src "${src}" has both "fill" and "style.width" properties. Images with "fill" always use width 100% - it cannot be modified.`), "__NEXT_ERROR_CODE", {
                value: "E73",
                enumerable: false,
                configurable: true
              });
            }
            if (style?.height && style.height !== "100%") {
              throw Object.defineProperty(new Error(`Image with src "${src}" has both "fill" and "style.height" properties. Images with "fill" always use height 100% - it cannot be modified.`), "__NEXT_ERROR_CODE", {
                value: "E404",
                enumerable: false,
                configurable: true
              });
            }
          } else {
            if (typeof widthInt === "undefined") {
              throw Object.defineProperty(new Error(`Image with src "${src}" is missing required "width" property.`), "__NEXT_ERROR_CODE", {
                value: "E451",
                enumerable: false,
                configurable: true
              });
            } else if (isNaN(widthInt)) {
              throw Object.defineProperty(new Error(`Image with src "${src}" has invalid "width" property. Expected a numeric value in pixels but received "${width}".`), "__NEXT_ERROR_CODE", {
                value: "E66",
                enumerable: false,
                configurable: true
              });
            }
            if (typeof heightInt === "undefined") {
              throw Object.defineProperty(new Error(`Image with src "${src}" is missing required "height" property.`), "__NEXT_ERROR_CODE", {
                value: "E397",
                enumerable: false,
                configurable: true
              });
            } else if (isNaN(heightInt)) {
              throw Object.defineProperty(new Error(`Image with src "${src}" has invalid "height" property. Expected a numeric value in pixels but received "${height}".`), "__NEXT_ERROR_CODE", {
                value: "E444",
                enumerable: false,
                configurable: true
              });
            }
            if (/^[\x00-\x20]/.test(src)) {
              throw Object.defineProperty(new Error(`Image with src "${src}" cannot start with a space or control character. Use src.trimStart() to remove it or encodeURIComponent(src) to keep it.`), "__NEXT_ERROR_CODE", {
                value: "E176",
                enumerable: false,
                configurable: true
              });
            }
            if (/[\x00-\x20]$/.test(src)) {
              throw Object.defineProperty(new Error(`Image with src "${src}" cannot end with a space or control character. Use src.trimEnd() to remove it or encodeURIComponent(src) to keep it.`), "__NEXT_ERROR_CODE", {
                value: "E21",
                enumerable: false,
                configurable: true
              });
            }
          }
        }
        if (!VALID_LOADING_VALUES.includes(loading)) {
          throw Object.defineProperty(new Error(`Image with src "${src}" has invalid "loading" property. Provided "${loading}" should be one of ${VALID_LOADING_VALUES.map(String).join(",")}.`), "__NEXT_ERROR_CODE", {
            value: "E357",
            enumerable: false,
            configurable: true
          });
        }
        if (priority && loading === "lazy") {
          throw Object.defineProperty(new Error(`Image with src "${src}" has both "priority" and "loading='lazy'" properties. Only one should be used.`), "__NEXT_ERROR_CODE", {
            value: "E218",
            enumerable: false,
            configurable: true
          });
        }
        if (preload && loading === "lazy") {
          throw Object.defineProperty(new Error(`Image with src "${src}" has both "preload" and "loading='lazy'" properties. Only one should be used.`), "__NEXT_ERROR_CODE", {
            value: "E803",
            enumerable: false,
            configurable: true
          });
        }
        if (preload && priority) {
          throw Object.defineProperty(new Error(`Image with src "${src}" has both "preload" and "priority" properties. Only "preload" should be used.`), "__NEXT_ERROR_CODE", {
            value: "E802",
            enumerable: false,
            configurable: true
          });
        }
        if (placeholder !== "empty" && placeholder !== "blur" && !placeholder.startsWith("data:image/")) {
          throw Object.defineProperty(new Error(`Image with src "${src}" has invalid "placeholder" property "${placeholder}".`), "__NEXT_ERROR_CODE", {
            value: "E431",
            enumerable: false,
            configurable: true
          });
        }
        if (placeholder !== "empty") {
          if (widthInt && heightInt && widthInt * heightInt < 1600) {
            (0, _warnonce.warnOnce)(`Image with src "${src}" is smaller than 40x40. Consider removing the "placeholder" property to improve performance.`);
          }
        }
        if (qualityInt && config.qualities && !config.qualities.includes(qualityInt)) {
          (0, _warnonce.warnOnce)(`Image with src "${src}" is using quality "${qualityInt}" which is not configured in images.qualities [${config.qualities.join(", ")}]. Please update your config to [${[
            ...config.qualities,
            qualityInt
          ].sort().join(", ")}].
Read more: https://nextjs.org/docs/messages/next-image-unconfigured-qualities`);
        }
        if (placeholder === "blur" && !blurDataURL) {
          const VALID_BLUR_EXT = [
            "jpeg",
            "png",
            "webp",
            "avif"
          ];
          throw Object.defineProperty(new Error(`Image with src "${src}" has "placeholder='blur'" property but is missing the "blurDataURL" property.
        Possible solutions:
          - Add a "blurDataURL" property, the contents should be a small Data URL to represent the image
          - Change the "src" property to a static import with one of the supported file types: ${VALID_BLUR_EXT.join(",")} (animated images not supported)
          - Remove the "placeholder" property, effectively no blur effect
        Read more: https://nextjs.org/docs/messages/placeholder-blur-data-url`), "__NEXT_ERROR_CODE", {
            value: "E371",
            enumerable: false,
            configurable: true
          });
        }
        if ("ref" in rest) {
          (0, _warnonce.warnOnce)(`Image with src "${src}" is using unsupported "ref" property. Consider using the "onLoad" property instead.`);
        }
        if (!unoptimized && !isDefaultLoader) {
          const urlStr = loader({
            config,
            src,
            width: widthInt || 400,
            quality: qualityInt || 75
          });
          let url;
          try {
            url = new URL(urlStr);
          } catch (err) {
          }
          if (urlStr === src || url && url.pathname === src && !url.search) {
            (0, _warnonce.warnOnce)(`Image with src "${src}" has a "loader" property that does not implement width. Please implement it or use the "unoptimized" property instead.
Read more: https://nextjs.org/docs/messages/next-image-missing-loader-width`);
          }
        }
        if (onLoadingComplete) {
          (0, _warnonce.warnOnce)(`Image with src "${src}" is using deprecated "onLoadingComplete" property. Please use the "onLoad" property instead.`);
        }
        for (const [legacyKey, legacyValue] of Object.entries({
          layout,
          objectFit,
          objectPosition,
          lazyBoundary,
          lazyRoot
        })) {
          if (legacyValue) {
            (0, _warnonce.warnOnce)(`Image with src "${src}" has legacy prop "${legacyKey}". Did you forget to run the codemod?
Read more: https://nextjs.org/docs/messages/next-image-upgrade-to-13`);
          }
        }
        if (typeof window !== "undefined" && !perfObserver && window.PerformanceObserver) {
          perfObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              const imgSrc = entry?.element?.src || "";
              const lcpImage = allImgs.get(imgSrc);
              if (lcpImage && lcpImage.loading === "lazy" && lcpImage.placeholder === "empty" && !lcpImage.src.startsWith("data:") && !lcpImage.src.startsWith("blob:")) {
                (0, _warnonce.warnOnce)(`Image with src "${lcpImage.src}" was detected as the Largest Contentful Paint (LCP). Please add the \`loading="eager"\` property if this image is above the fold.
Read more: https://nextjs.org/docs/app/api-reference/components/image#loading`);
              }
            }
          });
          try {
            perfObserver.observe({
              type: "largest-contentful-paint",
              buffered: true
            });
          } catch (err) {
            console.error(err);
          }
        }
      }
      const imgStyle = Object.assign(fill ? {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit,
        objectPosition
      } : {}, showAltText ? {} : {
        color: "transparent"
      }, style);
      const backgroundImage = !blurComplete && placeholder !== "empty" ? placeholder === "blur" ? `url("data:image/svg+xml;charset=utf-8,${(0, _imageblursvg.getImageBlurSvg)({
        widthInt,
        heightInt,
        blurWidth,
        blurHeight,
        blurDataURL: blurDataURL || "",
        objectFit: imgStyle.objectFit
      })}")` : `url("${placeholder}")` : null;
      const backgroundSize = !INVALID_BACKGROUND_SIZE_VALUES.includes(imgStyle.objectFit) ? imgStyle.objectFit : imgStyle.objectFit === "fill" ? "100% 100%" : "cover";
      let placeholderStyle = backgroundImage ? {
        backgroundSize,
        backgroundPosition: imgStyle.objectPosition || "50% 50%",
        backgroundRepeat: "no-repeat",
        backgroundImage
      } : {};
      if (process.env.NODE_ENV === "development") {
        if (placeholderStyle.backgroundImage && placeholder === "blur" && blurDataURL?.startsWith("/")) {
          placeholderStyle.backgroundImage = `url("${blurDataURL}")`;
        }
      }
      const imgAttributes = generateImgAttrs({
        config,
        src,
        unoptimized,
        width: widthInt,
        quality: qualityInt,
        sizes,
        loader
      });
      const loadingFinal = isLazy ? "lazy" : loading;
      if (process.env.NODE_ENV !== "production") {
        if (typeof window !== "undefined") {
          let fullUrl;
          try {
            fullUrl = new URL(imgAttributes.src);
          } catch (e) {
            fullUrl = new URL(imgAttributes.src, window.location.href);
          }
          allImgs.set(fullUrl.href, {
            src,
            loading: loadingFinal,
            placeholder
          });
        }
      }
      const props = {
        ...rest,
        loading: loadingFinal,
        fetchPriority,
        width: widthInt,
        height: heightInt,
        decoding,
        className,
        style: {
          ...imgStyle,
          ...placeholderStyle
        },
        sizes: imgAttributes.sizes,
        srcSet: imgAttributes.srcSet,
        src: overrideSrc || imgAttributes.src
      };
      const meta = {
        unoptimized,
        preload: preload || priority,
        placeholder,
        fill
      };
      return {
        props,
        meta
      };
    }
  }
});

// node_modules/next/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs
var require_interop_require_wildcard = __commonJS({
  "node_modules/next/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs"(exports2) {
    "use strict";
    function _getRequireWildcardCache(nodeInterop) {
      if (typeof WeakMap !== "function")
        return null;
      var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
      var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
      return (_getRequireWildcardCache = function(nodeInterop2) {
        return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
      })(nodeInterop);
    }
    function _interop_require_wildcard(obj, nodeInterop) {
      if (!nodeInterop && obj && obj.__esModule)
        return obj;
      if (obj === null || typeof obj !== "object" && typeof obj !== "function")
        return { default: obj };
      var cache = _getRequireWildcardCache(nodeInterop);
      if (cache && cache.has(obj))
        return cache.get(obj);
      var newObj = { __proto__: null };
      var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var key in obj) {
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
          if (desc && (desc.get || desc.set))
            Object.defineProperty(newObj, key, desc);
          else
            newObj[key] = obj[key];
        }
      }
      newObj.default = obj;
      if (cache)
        cache.set(obj, newObj);
      return newObj;
    }
    exports2._ = _interop_require_wildcard;
  }
});

// node_modules/react/cjs/react-jsx-runtime.production.js
var require_react_jsx_runtime_production = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.production.js"(exports2) {
    "use strict";
    var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
    var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
    function jsxProd(type, config, maybeKey) {
      var key = null;
      void 0 !== maybeKey && (key = "" + maybeKey);
      void 0 !== config.key && (key = "" + config.key);
      if ("key" in config) {
        maybeKey = {};
        for (var propName in config)
          "key" !== propName && (maybeKey[propName] = config[propName]);
      } else
        maybeKey = config;
      config = maybeKey.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== config ? config : null,
        props: maybeKey
      };
    }
    exports2.Fragment = REACT_FRAGMENT_TYPE;
    exports2.jsx = jsxProd;
    exports2.jsxs = jsxProd;
  }
});

// node_modules/react/cjs/react-jsx-runtime.development.js
var require_react_jsx_runtime_development = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports2) {
    "use strict";
    "production" !== process.env.NODE_ENV && function() {
      function getComponentNameFromType(type) {
        if (null == type)
          return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type)
          return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE)
          return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning)
            return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children)
          if (isStaticChildren)
            if (isArrayImpl(children)) {
              for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)
                validateChildKeys(children[isStaticChildren]);
              Object.freeze && Object.freeze(children);
            } else
              console.error(
                "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
              );
          else
            validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
          children = getComponentNameFromType(type);
          var keys = Object.keys(config).filter(function(k) {
            return "key" !== k;
          });
          isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
          didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error(
            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
            isStaticChildren,
            children,
            keys,
            children
          ), didWarnAboutKeySpread[children + isStaticChildren] = true);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
          maybeKey = {};
          for (var propName in config)
            "key" !== propName && (maybeKey[propName] = config[propName]);
        } else
          maybeKey = config;
        children && defineKeyPropWarningGetter(
          maybeKey,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        return ReactElement(
          type,
          children,
          maybeKey,
          getOwner(),
          debugStack,
          debugTask
        );
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      var React26 = require_react(), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React26.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      React26 = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = React26.react_stack_bottom_frame.bind(
        React26,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutKeySpread = {};
      exports2.Fragment = REACT_FRAGMENT_TYPE;
      exports2.jsx = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          false,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports2.jsxs = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          true,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
    }();
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_react_jsx_runtime_production();
    } else {
      module2.exports = require_react_jsx_runtime_development();
    }
  }
});

// node_modules/react-dom/cjs/react-dom.production.js
var require_react_dom_production = __commonJS({
  "node_modules/react-dom/cjs/react-dom.production.js"(exports2) {
    "use strict";
    var React26 = require_react();
    function formatProdErrorMessage(code) {
      var url = "https://react.dev/errors/" + code;
      if (1 < arguments.length) {
        url += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var i = 2; i < arguments.length; i++)
          url += "&args[]=" + encodeURIComponent(arguments[i]);
      }
      return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    }
    function noop() {
    }
    var Internals = {
      d: {
        f: noop,
        r: function() {
          throw Error(formatProdErrorMessage(522));
        },
        D: noop,
        C: noop,
        L: noop,
        m: noop,
        X: noop,
        S: noop,
        M: noop
      },
      p: 0,
      findDOMNode: null
    };
    var REACT_PORTAL_TYPE = Symbol.for("react.portal");
    function createPortal$1(children, containerInfo, implementation) {
      var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
      return {
        $$typeof: REACT_PORTAL_TYPE,
        key: null == key ? null : "" + key,
        children,
        containerInfo,
        implementation
      };
    }
    var ReactSharedInternals = React26.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function getCrossOriginStringAs(as, input) {
      if ("font" === as)
        return "";
      if ("string" === typeof input)
        return "use-credentials" === input ? input : "";
    }
    exports2.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
    exports2.createPortal = function(children, container) {
      var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
      if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType)
        throw Error(formatProdErrorMessage(299));
      return createPortal$1(children, container, null, key);
    };
    exports2.flushSync = function(fn) {
      var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
      try {
        if (ReactSharedInternals.T = null, Internals.p = 2, fn)
          return fn();
      } finally {
        ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
      }
    };
    exports2.preconnect = function(href, options) {
      "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
    };
    exports2.prefetchDNS = function(href) {
      "string" === typeof href && Internals.d.D(href);
    };
    exports2.preinit = function(href, options) {
      if ("string" === typeof href && options && "string" === typeof options.as) {
        var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
        "style" === as ? Internals.d.S(
          href,
          "string" === typeof options.precedence ? options.precedence : void 0,
          {
            crossOrigin,
            integrity,
            fetchPriority
          }
        ) : "script" === as && Internals.d.X(href, {
          crossOrigin,
          integrity,
          fetchPriority,
          nonce: "string" === typeof options.nonce ? options.nonce : void 0
        });
      }
    };
    exports2.preinitModule = function(href, options) {
      if ("string" === typeof href)
        if ("object" === typeof options && null !== options) {
          if (null == options.as || "script" === options.as) {
            var crossOrigin = getCrossOriginStringAs(
              options.as,
              options.crossOrigin
            );
            Internals.d.M(href, {
              crossOrigin,
              integrity: "string" === typeof options.integrity ? options.integrity : void 0,
              nonce: "string" === typeof options.nonce ? options.nonce : void 0
            });
          }
        } else
          null == options && Internals.d.M(href);
    };
    exports2.preload = function(href, options) {
      if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
        var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
        Internals.d.L(href, as, {
          crossOrigin,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0,
          nonce: "string" === typeof options.nonce ? options.nonce : void 0,
          type: "string" === typeof options.type ? options.type : void 0,
          fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
          referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
          imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
          imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
          media: "string" === typeof options.media ? options.media : void 0
        });
      }
    };
    exports2.preloadModule = function(href, options) {
      if ("string" === typeof href)
        if (options) {
          var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
          Internals.d.m(href, {
            as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0
          });
        } else
          Internals.d.m(href);
    };
    exports2.requestFormReset = function(form) {
      Internals.d.r(form);
    };
    exports2.unstable_batchedUpdates = function(fn, a) {
      return fn(a);
    };
    exports2.useFormState = function(action, initialState, permalink) {
      return ReactSharedInternals.H.useFormState(action, initialState, permalink);
    };
    exports2.useFormStatus = function() {
      return ReactSharedInternals.H.useHostTransitionStatus();
    };
    exports2.version = "19.2.3";
  }
});

// node_modules/react-dom/cjs/react-dom.development.js
var require_react_dom_development = __commonJS({
  "node_modules/react-dom/cjs/react-dom.development.js"(exports2) {
    "use strict";
    "production" !== process.env.NODE_ENV && function() {
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function createPortal$1(children, containerInfo, implementation) {
        var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
        try {
          testStringCoercion(key);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        JSCompiler_inline_result && (console.error(
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          "function" === typeof Symbol && Symbol.toStringTag && key[Symbol.toStringTag] || key.constructor.name || "Object"
        ), testStringCoercion(key));
        return {
          $$typeof: REACT_PORTAL_TYPE,
          key: null == key ? null : "" + key,
          children,
          containerInfo,
          implementation
        };
      }
      function getCrossOriginStringAs(as, input) {
        if ("font" === as)
          return "";
        if ("string" === typeof input)
          return "use-credentials" === input ? input : "";
      }
      function getValueDescriptorExpectingObjectForWarning(thing) {
        return null === thing ? "`null`" : void 0 === thing ? "`undefined`" : "" === thing ? "an empty string" : 'something with type "' + typeof thing + '"';
      }
      function getValueDescriptorExpectingEnumForWarning(thing) {
        return null === thing ? "`null`" : void 0 === thing ? "`undefined`" : "" === thing ? "an empty string" : "string" === typeof thing ? JSON.stringify(thing) : "number" === typeof thing ? "`" + thing + "`" : 'something with type "' + typeof thing + '"';
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var React26 = require_react(), Internals = {
        d: {
          f: noop,
          r: function() {
            throw Error(
              "Invalid form element. requestFormReset must be passed a form that was rendered by React."
            );
          },
          D: noop,
          C: noop,
          L: noop,
          m: noop,
          X: noop,
          S: noop,
          M: noop
        },
        p: 0,
        findDOMNode: null
      }, REACT_PORTAL_TYPE = Symbol.for("react.portal"), ReactSharedInternals = React26.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      "function" === typeof Map && null != Map.prototype && "function" === typeof Map.prototype.forEach && "function" === typeof Set && null != Set.prototype && "function" === typeof Set.prototype.clear && "function" === typeof Set.prototype.forEach || console.error(
        "React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"
      );
      exports2.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
      exports2.createPortal = function(children, container) {
        var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
        if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType)
          throw Error("Target container is not a DOM element.");
        return createPortal$1(children, container, null, key);
      };
      exports2.flushSync = function(fn) {
        var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
        try {
          if (ReactSharedInternals.T = null, Internals.p = 2, fn)
            return fn();
        } finally {
          ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f() && console.error(
            "flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task."
          );
        }
      };
      exports2.preconnect = function(href, options) {
        "string" === typeof href && href ? null != options && "object" !== typeof options ? console.error(
          "ReactDOM.preconnect(): Expected the `options` argument (second) to be an object but encountered %s instead. The only supported option at this time is `crossOrigin` which accepts a string.",
          getValueDescriptorExpectingEnumForWarning(options)
        ) : null != options && "string" !== typeof options.crossOrigin && console.error(
          "ReactDOM.preconnect(): Expected the `crossOrigin` option (second argument) to be a string but encountered %s instead. Try removing this option or passing a string value instead.",
          getValueDescriptorExpectingObjectForWarning(options.crossOrigin)
        ) : console.error(
          "ReactDOM.preconnect(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
          getValueDescriptorExpectingObjectForWarning(href)
        );
        "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
      };
      exports2.prefetchDNS = function(href) {
        if ("string" !== typeof href || !href)
          console.error(
            "ReactDOM.prefetchDNS(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
            getValueDescriptorExpectingObjectForWarning(href)
          );
        else if (1 < arguments.length) {
          var options = arguments[1];
          "object" === typeof options && options.hasOwnProperty("crossOrigin") ? console.error(
            "ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. It looks like the you are attempting to set a crossOrigin property for this DNS lookup hint. Browsers do not perform DNS queries using CORS and setting this attribute on the resource hint has no effect. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.",
            getValueDescriptorExpectingEnumForWarning(options)
          ) : console.error(
            "ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.",
            getValueDescriptorExpectingEnumForWarning(options)
          );
        }
        "string" === typeof href && Internals.d.D(href);
      };
      exports2.preinit = function(href, options) {
        "string" === typeof href && href ? null == options || "object" !== typeof options ? console.error(
          "ReactDOM.preinit(): Expected the `options` argument (second) to be an object with an `as` property describing the type of resource to be preinitialized but encountered %s instead.",
          getValueDescriptorExpectingEnumForWarning(options)
        ) : "style" !== options.as && "script" !== options.as && console.error(
          'ReactDOM.preinit(): Expected the `as` property in the `options` argument (second) to contain a valid value describing the type of resource to be preinitialized but encountered %s instead. Valid values for `as` are "style" and "script".',
          getValueDescriptorExpectingEnumForWarning(options.as)
        ) : console.error(
          "ReactDOM.preinit(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
          getValueDescriptorExpectingObjectForWarning(href)
        );
        if ("string" === typeof href && options && "string" === typeof options.as) {
          var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
          "style" === as ? Internals.d.S(
            href,
            "string" === typeof options.precedence ? options.precedence : void 0,
            {
              crossOrigin,
              integrity,
              fetchPriority
            }
          ) : "script" === as && Internals.d.X(href, {
            crossOrigin,
            integrity,
            fetchPriority,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
          });
        }
      };
      exports2.preinitModule = function(href, options) {
        var encountered = "";
        "string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
        void 0 !== options && "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : options && "as" in options && "script" !== options.as && (encountered += " The `as` option encountered was " + getValueDescriptorExpectingEnumForWarning(options.as) + ".");
        if (encountered)
          console.error(
            "ReactDOM.preinitModule(): Expected up to two arguments, a non-empty `href` string and, optionally, an `options` object with a valid `as` property.%s",
            encountered
          );
        else
          switch (encountered = options && "string" === typeof options.as ? options.as : "script", encountered) {
            case "script":
              break;
            default:
              encountered = getValueDescriptorExpectingEnumForWarning(encountered), console.error(
                'ReactDOM.preinitModule(): Currently the only supported "as" type for this function is "script" but received "%s" instead. This warning was generated for `href` "%s". In the future other module types will be supported, aligning with the import-attributes proposal. Learn more here: (https://github.com/tc39/proposal-import-attributes)',
                encountered,
                href
              );
          }
        if ("string" === typeof href)
          if ("object" === typeof options && null !== options) {
            if (null == options.as || "script" === options.as)
              encountered = getCrossOriginStringAs(
                options.as,
                options.crossOrigin
              ), Internals.d.M(href, {
                crossOrigin: encountered,
                integrity: "string" === typeof options.integrity ? options.integrity : void 0,
                nonce: "string" === typeof options.nonce ? options.nonce : void 0
              });
          } else
            null == options && Internals.d.M(href);
      };
      exports2.preload = function(href, options) {
        var encountered = "";
        "string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
        null == options || "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : "string" === typeof options.as && options.as || (encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".");
        encountered && console.error(
          'ReactDOM.preload(): Expected two arguments, a non-empty `href` string and an `options` object with an `as` property valid for a `<link rel="preload" as="..." />` tag.%s',
          encountered
        );
        if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
          encountered = options.as;
          var crossOrigin = getCrossOriginStringAs(
            encountered,
            options.crossOrigin
          );
          Internals.d.L(href, encountered, {
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0,
            type: "string" === typeof options.type ? options.type : void 0,
            fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
            referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
            imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
            imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
            media: "string" === typeof options.media ? options.media : void 0
          });
        }
      };
      exports2.preloadModule = function(href, options) {
        var encountered = "";
        "string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
        void 0 !== options && "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : options && "as" in options && "string" !== typeof options.as && (encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".");
        encountered && console.error(
          'ReactDOM.preloadModule(): Expected two arguments, a non-empty `href` string and, optionally, an `options` object with an `as` property valid for a `<link rel="modulepreload" as="..." />` tag.%s',
          encountered
        );
        "string" === typeof href && (options ? (encountered = getCrossOriginStringAs(
          options.as,
          options.crossOrigin
        ), Internals.d.m(href, {
          as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
          crossOrigin: encountered,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0
        })) : Internals.d.m(href));
      };
      exports2.requestFormReset = function(form) {
        Internals.d.r(form);
      };
      exports2.unstable_batchedUpdates = function(fn, a) {
        return fn(a);
      };
      exports2.useFormState = function(action, initialState, permalink) {
        return resolveDispatcher().useFormState(action, initialState, permalink);
      };
      exports2.useFormStatus = function() {
        return resolveDispatcher().useHostTransitionStatus();
      };
      exports2.version = "19.2.3";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    }();
  }
});

// node_modules/react-dom/index.js
var require_react_dom = __commonJS({
  "node_modules/react-dom/index.js"(exports2, module2) {
    "use strict";
    function checkDCE() {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
        return;
      }
      if (process.env.NODE_ENV !== "production") {
        throw new Error("^_^");
      }
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
      } catch (err) {
        console.error(err);
      }
    }
    if (process.env.NODE_ENV === "production") {
      checkDCE();
      module2.exports = require_react_dom_production();
    } else {
      module2.exports = require_react_dom_development();
    }
  }
});

// node_modules/next/dist/shared/lib/side-effect.js
var require_side_effect = __commonJS({
  "node_modules/next/dist/shared/lib/side-effect.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "default", {
      enumerable: true,
      get: function() {
        return SideEffect;
      }
    });
    var _react = require_react();
    var isServer = typeof window === "undefined";
    var useClientOnlyLayoutEffect = isServer ? () => {
    } : _react.useLayoutEffect;
    var useClientOnlyEffect = isServer ? () => {
    } : _react.useEffect;
    function SideEffect(props) {
      const { headManager, reduceComponentsToState } = props;
      function emitChange() {
        if (headManager && headManager.mountedInstances) {
          const headElements = _react.Children.toArray(Array.from(headManager.mountedInstances).filter(Boolean));
          headManager.updateHead(reduceComponentsToState(headElements));
        }
      }
      if (isServer) {
        headManager?.mountedInstances?.add(props.children);
        emitChange();
      }
      useClientOnlyLayoutEffect(() => {
        headManager?.mountedInstances?.add(props.children);
        return () => {
          headManager?.mountedInstances?.delete(props.children);
        };
      });
      useClientOnlyLayoutEffect(() => {
        if (headManager) {
          headManager._pendingUpdate = emitChange;
        }
        return () => {
          if (headManager) {
            headManager._pendingUpdate = emitChange;
          }
        };
      });
      useClientOnlyEffect(() => {
        if (headManager && headManager._pendingUpdate) {
          headManager._pendingUpdate();
          headManager._pendingUpdate = null;
        }
        return () => {
          if (headManager && headManager._pendingUpdate) {
            headManager._pendingUpdate();
            headManager._pendingUpdate = null;
          }
        };
      });
      return null;
    }
  }
});

// node_modules/next/dist/shared/lib/head-manager-context.shared-runtime.js
var require_head_manager_context_shared_runtime = __commonJS({
  "node_modules/next/dist/shared/lib/head-manager-context.shared-runtime.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "HeadManagerContext", {
      enumerable: true,
      get: function() {
        return HeadManagerContext;
      }
    });
    var _interop_require_default = require_interop_require_default();
    var _react = /* @__PURE__ */ _interop_require_default._(require_react());
    var HeadManagerContext = _react.default.createContext({});
    if (process.env.NODE_ENV !== "production") {
      HeadManagerContext.displayName = "HeadManagerContext";
    }
  }
});

// node_modules/next/dist/shared/lib/head.js
var require_head = __commonJS({
  "node_modules/next/dist/shared/lib/head.js"(exports2, module2) {
    "use client";
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all)
        Object.defineProperty(target, name, {
          enumerable: true,
          get: all[name]
        });
    }
    _export(exports2, {
      default: function() {
        return _default;
      },
      defaultHead: function() {
        return defaultHead;
      }
    });
    var _interop_require_default = require_interop_require_default();
    var _interop_require_wildcard = require_interop_require_wildcard();
    var _jsxruntime = require_jsx_runtime();
    var _react = /* @__PURE__ */ _interop_require_wildcard._(require_react());
    var _sideeffect = /* @__PURE__ */ _interop_require_default._(require_side_effect());
    var _headmanagercontextsharedruntime = require_head_manager_context_shared_runtime();
    var _warnonce = require_warn_once();
    function defaultHead() {
      const head = [
        /* @__PURE__ */ (0, _jsxruntime.jsx)("meta", {
          charSet: "utf-8"
        }, "charset"),
        /* @__PURE__ */ (0, _jsxruntime.jsx)("meta", {
          name: "viewport",
          content: "width=device-width"
        }, "viewport")
      ];
      return head;
    }
    function onlyReactElement(list, child) {
      if (typeof child === "string" || typeof child === "number") {
        return list;
      }
      if (child.type === _react.default.Fragment) {
        return list.concat(
          // @ts-expect-error @types/react does not remove fragments but this could also return ReactPortal[]
          _react.default.Children.toArray(child.props.children).reduce(
            // @ts-expect-error @types/react does not remove fragments but this could also return ReactPortal[]
            (fragmentList, fragmentChild) => {
              if (typeof fragmentChild === "string" || typeof fragmentChild === "number") {
                return fragmentList;
              }
              return fragmentList.concat(fragmentChild);
            },
            []
          )
        );
      }
      return list.concat(child);
    }
    var METATYPES = [
      "name",
      "httpEquiv",
      "charSet",
      "itemProp"
    ];
    function unique() {
      const keys = /* @__PURE__ */ new Set();
      const tags = /* @__PURE__ */ new Set();
      const metaTypes = /* @__PURE__ */ new Set();
      const metaCategories = {};
      return (h) => {
        let isUnique = true;
        let hasKey = false;
        if (h.key && typeof h.key !== "number" && h.key.indexOf("$") > 0) {
          hasKey = true;
          const key = h.key.slice(h.key.indexOf("$") + 1);
          if (keys.has(key)) {
            isUnique = false;
          } else {
            keys.add(key);
          }
        }
        switch (h.type) {
          case "title":
          case "base":
            if (tags.has(h.type)) {
              isUnique = false;
            } else {
              tags.add(h.type);
            }
            break;
          case "meta":
            for (let i = 0, len = METATYPES.length; i < len; i++) {
              const metatype = METATYPES[i];
              if (!h.props.hasOwnProperty(metatype))
                continue;
              if (metatype === "charSet") {
                if (metaTypes.has(metatype)) {
                  isUnique = false;
                } else {
                  metaTypes.add(metatype);
                }
              } else {
                const category = h.props[metatype];
                const categories = metaCategories[metatype] || /* @__PURE__ */ new Set();
                if ((metatype !== "name" || !hasKey) && categories.has(category)) {
                  isUnique = false;
                } else {
                  categories.add(category);
                  metaCategories[metatype] = categories;
                }
              }
            }
            break;
        }
        return isUnique;
      };
    }
    function reduceComponents(headChildrenElements) {
      return headChildrenElements.reduce(onlyReactElement, []).reverse().concat(defaultHead().reverse()).filter(unique()).reverse().map((c, i) => {
        const key = c.key || i;
        if (process.env.NODE_ENV === "development") {
          if (c.type === "script" && c.props["type"] !== "application/ld+json") {
            const srcMessage = c.props["src"] ? `<script> tag with src="${c.props["src"]}"` : `inline <script>`;
            (0, _warnonce.warnOnce)(`Do not add <script> tags using next/head (see ${srcMessage}). Use next/script instead. 
See more info here: https://nextjs.org/docs/messages/no-script-tags-in-head-component`);
          } else if (c.type === "link" && c.props["rel"] === "stylesheet") {
            (0, _warnonce.warnOnce)(`Do not add stylesheets using next/head (see <link rel="stylesheet"> tag with href="${c.props["href"]}"). Use Document instead. 
See more info here: https://nextjs.org/docs/messages/no-stylesheets-in-head-component`);
          }
        }
        return /* @__PURE__ */ _react.default.cloneElement(c, {
          key
        });
      });
    }
    function Head({ children }) {
      const headManager = (0, _react.useContext)(_headmanagercontextsharedruntime.HeadManagerContext);
      return /* @__PURE__ */ (0, _jsxruntime.jsx)(_sideeffect.default, {
        reduceComponentsToState: reduceComponents,
        headManager,
        children
      });
    }
    var _default = Head;
    if ((typeof exports2.default === "function" || typeof exports2.default === "object" && exports2.default !== null) && typeof exports2.default.__esModule === "undefined") {
      Object.defineProperty(exports2.default, "__esModule", { value: true });
      Object.assign(exports2.default, exports2);
      module2.exports = exports2.default;
    }
  }
});

// node_modules/next/dist/shared/lib/image-config-context.shared-runtime.js
var require_image_config_context_shared_runtime = __commonJS({
  "node_modules/next/dist/shared/lib/image-config-context.shared-runtime.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "ImageConfigContext", {
      enumerable: true,
      get: function() {
        return ImageConfigContext;
      }
    });
    var _interop_require_default = require_interop_require_default();
    var _react = /* @__PURE__ */ _interop_require_default._(require_react());
    var _imageconfig = require_image_config();
    var ImageConfigContext = _react.default.createContext(_imageconfig.imageConfigDefault);
    if (process.env.NODE_ENV !== "production") {
      ImageConfigContext.displayName = "ImageConfigContext";
    }
  }
});

// node_modules/next/dist/shared/lib/router-context.shared-runtime.js
var require_router_context_shared_runtime = __commonJS({
  "node_modules/next/dist/shared/lib/router-context.shared-runtime.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "RouterContext", {
      enumerable: true,
      get: function() {
        return RouterContext;
      }
    });
    var _interop_require_default = require_interop_require_default();
    var _react = /* @__PURE__ */ _interop_require_default._(require_react());
    var RouterContext = _react.default.createContext(null);
    if (process.env.NODE_ENV !== "production") {
      RouterContext.displayName = "RouterContext";
    }
  }
});

// node_modules/next/dist/shared/lib/find-closest-quality.js
var require_find_closest_quality = __commonJS({
  "node_modules/next/dist/shared/lib/find-closest-quality.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "findClosestQuality", {
      enumerable: true,
      get: function() {
        return findClosestQuality;
      }
    });
    function findClosestQuality(quality, config) {
      const q = quality || 75;
      if (!config?.qualities?.length) {
        return q;
      }
      return config.qualities.reduce((prev, cur) => Math.abs(cur - q) < Math.abs(prev - q) ? cur : prev, 0);
    }
  }
});

// node_modules/next/dist/compiled/picomatch/index.js
var require_picomatch = __commonJS({
  "node_modules/next/dist/compiled/picomatch/index.js"(exports2, module2) {
    (() => {
      "use strict";
      var t = { 170: (t2, e2, u2) => {
        const n = u2(510);
        const isWindows = () => {
          if (typeof navigator !== "undefined" && navigator.platform) {
            const t3 = navigator.platform.toLowerCase();
            return t3 === "win32" || t3 === "windows";
          }
          if (typeof process !== "undefined" && process.platform) {
            return process.platform === "win32";
          }
          return false;
        };
        function picomatch(t3, e3, u3 = false) {
          if (e3 && (e3.windows === null || e3.windows === void 0)) {
            e3 = { ...e3, windows: isWindows() };
          }
          return n(t3, e3, u3);
        }
        Object.assign(picomatch, n);
        t2.exports = picomatch;
      }, 154: (t2) => {
        const e2 = "\\\\/";
        const u2 = `[^${e2}]`;
        const n = "\\.";
        const o = "\\+";
        const s = "\\?";
        const r = "\\/";
        const a = "(?=.)";
        const i = "[^/]";
        const c = `(?:${r}|$)`;
        const p = `(?:^|${r})`;
        const l = `${n}{1,2}${c}`;
        const f = `(?!${n})`;
        const A = `(?!${p}${l})`;
        const _ = `(?!${n}{0,1}${c})`;
        const R = `(?!${l})`;
        const E = `[^.${r}]`;
        const h = `${i}*?`;
        const g = "/";
        const b = { DOT_LITERAL: n, PLUS_LITERAL: o, QMARK_LITERAL: s, SLASH_LITERAL: r, ONE_CHAR: a, QMARK: i, END_ANCHOR: c, DOTS_SLASH: l, NO_DOT: f, NO_DOTS: A, NO_DOT_SLASH: _, NO_DOTS_SLASH: R, QMARK_NO_DOT: E, STAR: h, START_ANCHOR: p, SEP: g };
        const C = { ...b, SLASH_LITERAL: `[${e2}]`, QMARK: u2, STAR: `${u2}*?`, DOTS_SLASH: `${n}{1,2}(?:[${e2}]|$)`, NO_DOT: `(?!${n})`, NO_DOTS: `(?!(?:^|[${e2}])${n}{1,2}(?:[${e2}]|$))`, NO_DOT_SLASH: `(?!${n}{0,1}(?:[${e2}]|$))`, NO_DOTS_SLASH: `(?!${n}{1,2}(?:[${e2}]|$))`, QMARK_NO_DOT: `[^.${e2}]`, START_ANCHOR: `(?:^|[${e2}])`, END_ANCHOR: `(?:[${e2}]|$)`, SEP: "\\" };
        const y = { alnum: "a-zA-Z0-9", alpha: "a-zA-Z", ascii: "\\x00-\\x7F", blank: " \\t", cntrl: "\\x00-\\x1F\\x7F", digit: "0-9", graph: "\\x21-\\x7E", lower: "a-z", print: "\\x20-\\x7E ", punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~", space: " \\t\\r\\n\\v\\f", upper: "A-Z", word: "A-Za-z0-9_", xdigit: "A-Fa-f0-9" };
        t2.exports = { MAX_LENGTH: 1024 * 64, POSIX_REGEX_SOURCE: y, REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g, REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/, REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/, REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g, REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g, REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g, REPLACEMENTS: { "***": "*", "**/**": "**", "**/**/**": "**" }, CHAR_0: 48, CHAR_9: 57, CHAR_UPPERCASE_A: 65, CHAR_LOWERCASE_A: 97, CHAR_UPPERCASE_Z: 90, CHAR_LOWERCASE_Z: 122, CHAR_LEFT_PARENTHESES: 40, CHAR_RIGHT_PARENTHESES: 41, CHAR_ASTERISK: 42, CHAR_AMPERSAND: 38, CHAR_AT: 64, CHAR_BACKWARD_SLASH: 92, CHAR_CARRIAGE_RETURN: 13, CHAR_CIRCUMFLEX_ACCENT: 94, CHAR_COLON: 58, CHAR_COMMA: 44, CHAR_DOT: 46, CHAR_DOUBLE_QUOTE: 34, CHAR_EQUAL: 61, CHAR_EXCLAMATION_MARK: 33, CHAR_FORM_FEED: 12, CHAR_FORWARD_SLASH: 47, CHAR_GRAVE_ACCENT: 96, CHAR_HASH: 35, CHAR_HYPHEN_MINUS: 45, CHAR_LEFT_ANGLE_BRACKET: 60, CHAR_LEFT_CURLY_BRACE: 123, CHAR_LEFT_SQUARE_BRACKET: 91, CHAR_LINE_FEED: 10, CHAR_NO_BREAK_SPACE: 160, CHAR_PERCENT: 37, CHAR_PLUS: 43, CHAR_QUESTION_MARK: 63, CHAR_RIGHT_ANGLE_BRACKET: 62, CHAR_RIGHT_CURLY_BRACE: 125, CHAR_RIGHT_SQUARE_BRACKET: 93, CHAR_SEMICOLON: 59, CHAR_SINGLE_QUOTE: 39, CHAR_SPACE: 32, CHAR_TAB: 9, CHAR_UNDERSCORE: 95, CHAR_VERTICAL_LINE: 124, CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279, extglobChars(t3) {
          return { "!": { type: "negate", open: "(?:(?!(?:", close: `))${t3.STAR})` }, "?": { type: "qmark", open: "(?:", close: ")?" }, "+": { type: "plus", open: "(?:", close: ")+" }, "*": { type: "star", open: "(?:", close: ")*" }, "@": { type: "at", open: "(?:", close: ")" } };
        }, globChars(t3) {
          return t3 === true ? C : b;
        } };
      }, 697: (t2, e2, u2) => {
        const n = u2(154);
        const o = u2(96);
        const { MAX_LENGTH: s, POSIX_REGEX_SOURCE: r, REGEX_NON_SPECIAL_CHARS: a, REGEX_SPECIAL_CHARS_BACKREF: i, REPLACEMENTS: c } = n;
        const expandRange = (t3, e3) => {
          if (typeof e3.expandRange === "function") {
            return e3.expandRange(...t3, e3);
          }
          t3.sort();
          const u3 = `[${t3.join("-")}]`;
          try {
            new RegExp(u3);
          } catch (e4) {
            return t3.map((t4) => o.escapeRegex(t4)).join("..");
          }
          return u3;
        };
        const syntaxError = (t3, e3) => `Missing ${t3}: "${e3}" - use "\\\\${e3}" to match literal characters`;
        const parse = (t3, e3) => {
          if (typeof t3 !== "string") {
            throw new TypeError("Expected a string");
          }
          t3 = c[t3] || t3;
          const u3 = { ...e3 };
          const p = typeof u3.maxLength === "number" ? Math.min(s, u3.maxLength) : s;
          let l = t3.length;
          if (l > p) {
            throw new SyntaxError(`Input length: ${l}, exceeds maximum allowed length: ${p}`);
          }
          const f = { type: "bos", value: "", output: u3.prepend || "" };
          const A = [f];
          const _ = u3.capture ? "" : "?:";
          const R = n.globChars(u3.windows);
          const E = n.extglobChars(R);
          const { DOT_LITERAL: h, PLUS_LITERAL: g, SLASH_LITERAL: b, ONE_CHAR: C, DOTS_SLASH: y, NO_DOT: $, NO_DOT_SLASH: x, NO_DOTS_SLASH: S, QMARK: H, QMARK_NO_DOT: v, STAR: d, START_ANCHOR: L } = R;
          const globstar = (t4) => `(${_}(?:(?!${L}${t4.dot ? y : h}).)*?)`;
          const T = u3.dot ? "" : $;
          const O = u3.dot ? H : v;
          let k = u3.bash === true ? globstar(u3) : d;
          if (u3.capture) {
            k = `(${k})`;
          }
          if (typeof u3.noext === "boolean") {
            u3.noextglob = u3.noext;
          }
          const m = { input: t3, index: -1, start: 0, dot: u3.dot === true, consumed: "", output: "", prefix: "", backtrack: false, negated: false, brackets: 0, braces: 0, parens: 0, quotes: 0, globstar: false, tokens: A };
          t3 = o.removePrefix(t3, m);
          l = t3.length;
          const w = [];
          const N = [];
          const I = [];
          let B = f;
          let G;
          const eos = () => m.index === l - 1;
          const D = m.peek = (e4 = 1) => t3[m.index + e4];
          const M = m.advance = () => t3[++m.index] || "";
          const remaining = () => t3.slice(m.index + 1);
          const consume = (t4 = "", e4 = 0) => {
            m.consumed += t4;
            m.index += e4;
          };
          const append = (t4) => {
            m.output += t4.output != null ? t4.output : t4.value;
            consume(t4.value);
          };
          const negate = () => {
            let t4 = 1;
            while (D() === "!" && (D(2) !== "(" || D(3) === "?")) {
              M();
              m.start++;
              t4++;
            }
            if (t4 % 2 === 0) {
              return false;
            }
            m.negated = true;
            m.start++;
            return true;
          };
          const increment = (t4) => {
            m[t4]++;
            I.push(t4);
          };
          const decrement = (t4) => {
            m[t4]--;
            I.pop();
          };
          const push = (t4) => {
            if (B.type === "globstar") {
              const e4 = m.braces > 0 && (t4.type === "comma" || t4.type === "brace");
              const u4 = t4.extglob === true || w.length && (t4.type === "pipe" || t4.type === "paren");
              if (t4.type !== "slash" && t4.type !== "paren" && !e4 && !u4) {
                m.output = m.output.slice(0, -B.output.length);
                B.type = "star";
                B.value = "*";
                B.output = k;
                m.output += B.output;
              }
            }
            if (w.length && t4.type !== "paren") {
              w[w.length - 1].inner += t4.value;
            }
            if (t4.value || t4.output)
              append(t4);
            if (B && B.type === "text" && t4.type === "text") {
              B.output = (B.output || B.value) + t4.value;
              B.value += t4.value;
              return;
            }
            t4.prev = B;
            A.push(t4);
            B = t4;
          };
          const extglobOpen = (t4, e4) => {
            const n2 = { ...E[e4], conditions: 1, inner: "" };
            n2.prev = B;
            n2.parens = m.parens;
            n2.output = m.output;
            const o2 = (u3.capture ? "(" : "") + n2.open;
            increment("parens");
            push({ type: t4, value: e4, output: m.output ? "" : C });
            push({ type: "paren", extglob: true, value: M(), output: o2 });
            w.push(n2);
          };
          const extglobClose = (t4) => {
            let n2 = t4.close + (u3.capture ? ")" : "");
            let o2;
            if (t4.type === "negate") {
              let s2 = k;
              if (t4.inner && t4.inner.length > 1 && t4.inner.includes("/")) {
                s2 = globstar(u3);
              }
              if (s2 !== k || eos() || /^\)+$/.test(remaining())) {
                n2 = t4.close = `)$))${s2}`;
              }
              if (t4.inner.includes("*") && (o2 = remaining()) && /^\.[^\\/.]+$/.test(o2)) {
                const u4 = parse(o2, { ...e3, fastpaths: false }).output;
                n2 = t4.close = `)${u4})${s2})`;
              }
              if (t4.prev.type === "bos") {
                m.negatedExtglob = true;
              }
            }
            push({ type: "paren", extglob: true, value: G, output: n2 });
            decrement("parens");
          };
          if (u3.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(t3)) {
            let n2 = false;
            let s2 = t3.replace(i, (t4, e4, u4, o2, s3, r2) => {
              if (o2 === "\\") {
                n2 = true;
                return t4;
              }
              if (o2 === "?") {
                if (e4) {
                  return e4 + o2 + (s3 ? H.repeat(s3.length) : "");
                }
                if (r2 === 0) {
                  return O + (s3 ? H.repeat(s3.length) : "");
                }
                return H.repeat(u4.length);
              }
              if (o2 === ".") {
                return h.repeat(u4.length);
              }
              if (o2 === "*") {
                if (e4) {
                  return e4 + o2 + (s3 ? k : "");
                }
                return k;
              }
              return e4 ? t4 : `\\${t4}`;
            });
            if (n2 === true) {
              if (u3.unescape === true) {
                s2 = s2.replace(/\\/g, "");
              } else {
                s2 = s2.replace(/\\+/g, (t4) => t4.length % 2 === 0 ? "\\\\" : t4 ? "\\" : "");
              }
            }
            if (s2 === t3 && u3.contains === true) {
              m.output = t3;
              return m;
            }
            m.output = o.wrapOutput(s2, m, e3);
            return m;
          }
          while (!eos()) {
            G = M();
            if (G === "\0") {
              continue;
            }
            if (G === "\\") {
              const t4 = D();
              if (t4 === "/" && u3.bash !== true) {
                continue;
              }
              if (t4 === "." || t4 === ";") {
                continue;
              }
              if (!t4) {
                G += "\\";
                push({ type: "text", value: G });
                continue;
              }
              const e5 = /^\\+/.exec(remaining());
              let n3 = 0;
              if (e5 && e5[0].length > 2) {
                n3 = e5[0].length;
                m.index += n3;
                if (n3 % 2 !== 0) {
                  G += "\\";
                }
              }
              if (u3.unescape === true) {
                G = M();
              } else {
                G += M();
              }
              if (m.brackets === 0) {
                push({ type: "text", value: G });
                continue;
              }
            }
            if (m.brackets > 0 && (G !== "]" || B.value === "[" || B.value === "[^")) {
              if (u3.posix !== false && G === ":") {
                const t4 = B.value.slice(1);
                if (t4.includes("[")) {
                  B.posix = true;
                  if (t4.includes(":")) {
                    const t5 = B.value.lastIndexOf("[");
                    const e5 = B.value.slice(0, t5);
                    const u4 = B.value.slice(t5 + 2);
                    const n3 = r[u4];
                    if (n3) {
                      B.value = e5 + n3;
                      m.backtrack = true;
                      M();
                      if (!f.output && A.indexOf(B) === 1) {
                        f.output = C;
                      }
                      continue;
                    }
                  }
                }
              }
              if (G === "[" && D() !== ":" || G === "-" && D() === "]") {
                G = `\\${G}`;
              }
              if (G === "]" && (B.value === "[" || B.value === "[^")) {
                G = `\\${G}`;
              }
              if (u3.posix === true && G === "!" && B.value === "[") {
                G = "^";
              }
              B.value += G;
              append({ value: G });
              continue;
            }
            if (m.quotes === 1 && G !== '"') {
              G = o.escapeRegex(G);
              B.value += G;
              append({ value: G });
              continue;
            }
            if (G === '"') {
              m.quotes = m.quotes === 1 ? 0 : 1;
              if (u3.keepQuotes === true) {
                push({ type: "text", value: G });
              }
              continue;
            }
            if (G === "(") {
              increment("parens");
              push({ type: "paren", value: G });
              continue;
            }
            if (G === ")") {
              if (m.parens === 0 && u3.strictBrackets === true) {
                throw new SyntaxError(syntaxError("opening", "("));
              }
              const t4 = w[w.length - 1];
              if (t4 && m.parens === t4.parens + 1) {
                extglobClose(w.pop());
                continue;
              }
              push({ type: "paren", value: G, output: m.parens ? ")" : "\\)" });
              decrement("parens");
              continue;
            }
            if (G === "[") {
              if (u3.nobracket === true || !remaining().includes("]")) {
                if (u3.nobracket !== true && u3.strictBrackets === true) {
                  throw new SyntaxError(syntaxError("closing", "]"));
                }
                G = `\\${G}`;
              } else {
                increment("brackets");
              }
              push({ type: "bracket", value: G });
              continue;
            }
            if (G === "]") {
              if (u3.nobracket === true || B && B.type === "bracket" && B.value.length === 1) {
                push({ type: "text", value: G, output: `\\${G}` });
                continue;
              }
              if (m.brackets === 0) {
                if (u3.strictBrackets === true) {
                  throw new SyntaxError(syntaxError("opening", "["));
                }
                push({ type: "text", value: G, output: `\\${G}` });
                continue;
              }
              decrement("brackets");
              const t4 = B.value.slice(1);
              if (B.posix !== true && t4[0] === "^" && !t4.includes("/")) {
                G = `/${G}`;
              }
              B.value += G;
              append({ value: G });
              if (u3.literalBrackets === false || o.hasRegexChars(t4)) {
                continue;
              }
              const e5 = o.escapeRegex(B.value);
              m.output = m.output.slice(0, -B.value.length);
              if (u3.literalBrackets === true) {
                m.output += e5;
                B.value = e5;
                continue;
              }
              B.value = `(${_}${e5}|${B.value})`;
              m.output += B.value;
              continue;
            }
            if (G === "{" && u3.nobrace !== true) {
              increment("braces");
              const t4 = { type: "brace", value: G, output: "(", outputIndex: m.output.length, tokensIndex: m.tokens.length };
              N.push(t4);
              push(t4);
              continue;
            }
            if (G === "}") {
              const t4 = N[N.length - 1];
              if (u3.nobrace === true || !t4) {
                push({ type: "text", value: G, output: G });
                continue;
              }
              let e5 = ")";
              if (t4.dots === true) {
                const t5 = A.slice();
                const n3 = [];
                for (let e6 = t5.length - 1; e6 >= 0; e6--) {
                  A.pop();
                  if (t5[e6].type === "brace") {
                    break;
                  }
                  if (t5[e6].type !== "dots") {
                    n3.unshift(t5[e6].value);
                  }
                }
                e5 = expandRange(n3, u3);
                m.backtrack = true;
              }
              if (t4.comma !== true && t4.dots !== true) {
                const u4 = m.output.slice(0, t4.outputIndex);
                const n3 = m.tokens.slice(t4.tokensIndex);
                t4.value = t4.output = "\\{";
                G = e5 = "\\}";
                m.output = u4;
                for (const t5 of n3) {
                  m.output += t5.output || t5.value;
                }
              }
              push({ type: "brace", value: G, output: e5 });
              decrement("braces");
              N.pop();
              continue;
            }
            if (G === "|") {
              if (w.length > 0) {
                w[w.length - 1].conditions++;
              }
              push({ type: "text", value: G });
              continue;
            }
            if (G === ",") {
              let t4 = G;
              const e5 = N[N.length - 1];
              if (e5 && I[I.length - 1] === "braces") {
                e5.comma = true;
                t4 = "|";
              }
              push({ type: "comma", value: G, output: t4 });
              continue;
            }
            if (G === "/") {
              if (B.type === "dot" && m.index === m.start + 1) {
                m.start = m.index + 1;
                m.consumed = "";
                m.output = "";
                A.pop();
                B = f;
                continue;
              }
              push({ type: "slash", value: G, output: b });
              continue;
            }
            if (G === ".") {
              if (m.braces > 0 && B.type === "dot") {
                if (B.value === ".")
                  B.output = h;
                const t4 = N[N.length - 1];
                B.type = "dots";
                B.output += G;
                B.value += G;
                t4.dots = true;
                continue;
              }
              if (m.braces + m.parens === 0 && B.type !== "bos" && B.type !== "slash") {
                push({ type: "text", value: G, output: h });
                continue;
              }
              push({ type: "dot", value: G, output: h });
              continue;
            }
            if (G === "?") {
              const t4 = B && B.value === "(";
              if (!t4 && u3.noextglob !== true && D() === "(" && D(2) !== "?") {
                extglobOpen("qmark", G);
                continue;
              }
              if (B && B.type === "paren") {
                const t5 = D();
                let e5 = G;
                if (B.value === "(" && !/[!=<:]/.test(t5) || t5 === "<" && !/<([!=]|\w+>)/.test(remaining())) {
                  e5 = `\\${G}`;
                }
                push({ type: "text", value: G, output: e5 });
                continue;
              }
              if (u3.dot !== true && (B.type === "slash" || B.type === "bos")) {
                push({ type: "qmark", value: G, output: v });
                continue;
              }
              push({ type: "qmark", value: G, output: H });
              continue;
            }
            if (G === "!") {
              if (u3.noextglob !== true && D() === "(") {
                if (D(2) !== "?" || !/[!=<:]/.test(D(3))) {
                  extglobOpen("negate", G);
                  continue;
                }
              }
              if (u3.nonegate !== true && m.index === 0) {
                negate();
                continue;
              }
            }
            if (G === "+") {
              if (u3.noextglob !== true && D() === "(" && D(2) !== "?") {
                extglobOpen("plus", G);
                continue;
              }
              if (B && B.value === "(" || u3.regex === false) {
                push({ type: "plus", value: G, output: g });
                continue;
              }
              if (B && (B.type === "bracket" || B.type === "paren" || B.type === "brace") || m.parens > 0) {
                push({ type: "plus", value: G });
                continue;
              }
              push({ type: "plus", value: g });
              continue;
            }
            if (G === "@") {
              if (u3.noextglob !== true && D() === "(" && D(2) !== "?") {
                push({ type: "at", extglob: true, value: G, output: "" });
                continue;
              }
              push({ type: "text", value: G });
              continue;
            }
            if (G !== "*") {
              if (G === "$" || G === "^") {
                G = `\\${G}`;
              }
              const t4 = a.exec(remaining());
              if (t4) {
                G += t4[0];
                m.index += t4[0].length;
              }
              push({ type: "text", value: G });
              continue;
            }
            if (B && (B.type === "globstar" || B.star === true)) {
              B.type = "star";
              B.star = true;
              B.value += G;
              B.output = k;
              m.backtrack = true;
              m.globstar = true;
              consume(G);
              continue;
            }
            let e4 = remaining();
            if (u3.noextglob !== true && /^\([^?]/.test(e4)) {
              extglobOpen("star", G);
              continue;
            }
            if (B.type === "star") {
              if (u3.noglobstar === true) {
                consume(G);
                continue;
              }
              const n3 = B.prev;
              const o2 = n3.prev;
              const s2 = n3.type === "slash" || n3.type === "bos";
              const r2 = o2 && (o2.type === "star" || o2.type === "globstar");
              if (u3.bash === true && (!s2 || e4[0] && e4[0] !== "/")) {
                push({ type: "star", value: G, output: "" });
                continue;
              }
              const a2 = m.braces > 0 && (n3.type === "comma" || n3.type === "brace");
              const i2 = w.length && (n3.type === "pipe" || n3.type === "paren");
              if (!s2 && n3.type !== "paren" && !a2 && !i2) {
                push({ type: "star", value: G, output: "" });
                continue;
              }
              while (e4.slice(0, 3) === "/**") {
                const u4 = t3[m.index + 4];
                if (u4 && u4 !== "/") {
                  break;
                }
                e4 = e4.slice(3);
                consume("/**", 3);
              }
              if (n3.type === "bos" && eos()) {
                B.type = "globstar";
                B.value += G;
                B.output = globstar(u3);
                m.output = B.output;
                m.globstar = true;
                consume(G);
                continue;
              }
              if (n3.type === "slash" && n3.prev.type !== "bos" && !r2 && eos()) {
                m.output = m.output.slice(0, -(n3.output + B.output).length);
                n3.output = `(?:${n3.output}`;
                B.type = "globstar";
                B.output = globstar(u3) + (u3.strictSlashes ? ")" : "|$)");
                B.value += G;
                m.globstar = true;
                m.output += n3.output + B.output;
                consume(G);
                continue;
              }
              if (n3.type === "slash" && n3.prev.type !== "bos" && e4[0] === "/") {
                const t4 = e4[1] !== void 0 ? "|$" : "";
                m.output = m.output.slice(0, -(n3.output + B.output).length);
                n3.output = `(?:${n3.output}`;
                B.type = "globstar";
                B.output = `${globstar(u3)}${b}|${b}${t4})`;
                B.value += G;
                m.output += n3.output + B.output;
                m.globstar = true;
                consume(G + M());
                push({ type: "slash", value: "/", output: "" });
                continue;
              }
              if (n3.type === "bos" && e4[0] === "/") {
                B.type = "globstar";
                B.value += G;
                B.output = `(?:^|${b}|${globstar(u3)}${b})`;
                m.output = B.output;
                m.globstar = true;
                consume(G + M());
                push({ type: "slash", value: "/", output: "" });
                continue;
              }
              m.output = m.output.slice(0, -B.output.length);
              B.type = "globstar";
              B.output = globstar(u3);
              B.value += G;
              m.output += B.output;
              m.globstar = true;
              consume(G);
              continue;
            }
            const n2 = { type: "star", value: G, output: k };
            if (u3.bash === true) {
              n2.output = ".*?";
              if (B.type === "bos" || B.type === "slash") {
                n2.output = T + n2.output;
              }
              push(n2);
              continue;
            }
            if (B && (B.type === "bracket" || B.type === "paren") && u3.regex === true) {
              n2.output = G;
              push(n2);
              continue;
            }
            if (m.index === m.start || B.type === "slash" || B.type === "dot") {
              if (B.type === "dot") {
                m.output += x;
                B.output += x;
              } else if (u3.dot === true) {
                m.output += S;
                B.output += S;
              } else {
                m.output += T;
                B.output += T;
              }
              if (D() !== "*") {
                m.output += C;
                B.output += C;
              }
            }
            push(n2);
          }
          while (m.brackets > 0) {
            if (u3.strictBrackets === true)
              throw new SyntaxError(syntaxError("closing", "]"));
            m.output = o.escapeLast(m.output, "[");
            decrement("brackets");
          }
          while (m.parens > 0) {
            if (u3.strictBrackets === true)
              throw new SyntaxError(syntaxError("closing", ")"));
            m.output = o.escapeLast(m.output, "(");
            decrement("parens");
          }
          while (m.braces > 0) {
            if (u3.strictBrackets === true)
              throw new SyntaxError(syntaxError("closing", "}"));
            m.output = o.escapeLast(m.output, "{");
            decrement("braces");
          }
          if (u3.strictSlashes !== true && (B.type === "star" || B.type === "bracket")) {
            push({ type: "maybe_slash", value: "", output: `${b}?` });
          }
          if (m.backtrack === true) {
            m.output = "";
            for (const t4 of m.tokens) {
              m.output += t4.output != null ? t4.output : t4.value;
              if (t4.suffix) {
                m.output += t4.suffix;
              }
            }
          }
          return m;
        };
        parse.fastpaths = (t3, e3) => {
          const u3 = { ...e3 };
          const r2 = typeof u3.maxLength === "number" ? Math.min(s, u3.maxLength) : s;
          const a2 = t3.length;
          if (a2 > r2) {
            throw new SyntaxError(`Input length: ${a2}, exceeds maximum allowed length: ${r2}`);
          }
          t3 = c[t3] || t3;
          const { DOT_LITERAL: i2, SLASH_LITERAL: p, ONE_CHAR: l, DOTS_SLASH: f, NO_DOT: A, NO_DOTS: _, NO_DOTS_SLASH: R, STAR: E, START_ANCHOR: h } = n.globChars(u3.windows);
          const g = u3.dot ? _ : A;
          const b = u3.dot ? R : A;
          const C = u3.capture ? "" : "?:";
          const y = { negated: false, prefix: "" };
          let $ = u3.bash === true ? ".*?" : E;
          if (u3.capture) {
            $ = `(${$})`;
          }
          const globstar = (t4) => {
            if (t4.noglobstar === true)
              return $;
            return `(${C}(?:(?!${h}${t4.dot ? f : i2}).)*?)`;
          };
          const create = (t4) => {
            switch (t4) {
              case "*":
                return `${g}${l}${$}`;
              case ".*":
                return `${i2}${l}${$}`;
              case "*.*":
                return `${g}${$}${i2}${l}${$}`;
              case "*/*":
                return `${g}${$}${p}${l}${b}${$}`;
              case "**":
                return g + globstar(u3);
              case "**/*":
                return `(?:${g}${globstar(u3)}${p})?${b}${l}${$}`;
              case "**/*.*":
                return `(?:${g}${globstar(u3)}${p})?${b}${$}${i2}${l}${$}`;
              case "**/.*":
                return `(?:${g}${globstar(u3)}${p})?${i2}${l}${$}`;
              default: {
                const e4 = /^(.*?)\.(\w+)$/.exec(t4);
                if (!e4)
                  return;
                const u4 = create(e4[1]);
                if (!u4)
                  return;
                return u4 + i2 + e4[2];
              }
            }
          };
          const x = o.removePrefix(t3, y);
          let S = create(x);
          if (S && u3.strictSlashes !== true) {
            S += `${p}?`;
          }
          return S;
        };
        t2.exports = parse;
      }, 510: (t2, e2, u2) => {
        const n = u2(716);
        const o = u2(697);
        const s = u2(96);
        const r = u2(154);
        const isObject = (t3) => t3 && typeof t3 === "object" && !Array.isArray(t3);
        const picomatch = (t3, e3, u3 = false) => {
          if (Array.isArray(t3)) {
            const n3 = t3.map((t4) => picomatch(t4, e3, u3));
            const arrayMatcher = (t4) => {
              for (const e4 of n3) {
                const u4 = e4(t4);
                if (u4)
                  return u4;
              }
              return false;
            };
            return arrayMatcher;
          }
          const n2 = isObject(t3) && t3.tokens && t3.input;
          if (t3 === "" || typeof t3 !== "string" && !n2) {
            throw new TypeError("Expected pattern to be a non-empty string");
          }
          const o2 = e3 || {};
          const s2 = o2.windows;
          const r2 = n2 ? picomatch.compileRe(t3, e3) : picomatch.makeRe(t3, e3, false, true);
          const a = r2.state;
          delete r2.state;
          let isIgnored = () => false;
          if (o2.ignore) {
            const t4 = { ...e3, ignore: null, onMatch: null, onResult: null };
            isIgnored = picomatch(o2.ignore, t4, u3);
          }
          const matcher = (u4, n3 = false) => {
            const { isMatch: i, match: c, output: p } = picomatch.test(u4, r2, e3, { glob: t3, posix: s2 });
            const l = { glob: t3, state: a, regex: r2, posix: s2, input: u4, output: p, match: c, isMatch: i };
            if (typeof o2.onResult === "function") {
              o2.onResult(l);
            }
            if (i === false) {
              l.isMatch = false;
              return n3 ? l : false;
            }
            if (isIgnored(u4)) {
              if (typeof o2.onIgnore === "function") {
                o2.onIgnore(l);
              }
              l.isMatch = false;
              return n3 ? l : false;
            }
            if (typeof o2.onMatch === "function") {
              o2.onMatch(l);
            }
            return n3 ? l : true;
          };
          if (u3) {
            matcher.state = a;
          }
          return matcher;
        };
        picomatch.test = (t3, e3, u3, { glob: n2, posix: o2 } = {}) => {
          if (typeof t3 !== "string") {
            throw new TypeError("Expected input to be a string");
          }
          if (t3 === "") {
            return { isMatch: false, output: "" };
          }
          const r2 = u3 || {};
          const a = r2.format || (o2 ? s.toPosixSlashes : null);
          let i = t3 === n2;
          let c = i && a ? a(t3) : t3;
          if (i === false) {
            c = a ? a(t3) : t3;
            i = c === n2;
          }
          if (i === false || r2.capture === true) {
            if (r2.matchBase === true || r2.basename === true) {
              i = picomatch.matchBase(t3, e3, u3, o2);
            } else {
              i = e3.exec(c);
            }
          }
          return { isMatch: Boolean(i), match: i, output: c };
        };
        picomatch.matchBase = (t3, e3, u3) => {
          const n2 = e3 instanceof RegExp ? e3 : picomatch.makeRe(e3, u3);
          return n2.test(s.basename(t3));
        };
        picomatch.isMatch = (t3, e3, u3) => picomatch(e3, u3)(t3);
        picomatch.parse = (t3, e3) => {
          if (Array.isArray(t3))
            return t3.map((t4) => picomatch.parse(t4, e3));
          return o(t3, { ...e3, fastpaths: false });
        };
        picomatch.scan = (t3, e3) => n(t3, e3);
        picomatch.compileRe = (t3, e3, u3 = false, n2 = false) => {
          if (u3 === true) {
            return t3.output;
          }
          const o2 = e3 || {};
          const s2 = o2.contains ? "" : "^";
          const r2 = o2.contains ? "" : "$";
          let a = `${s2}(?:${t3.output})${r2}`;
          if (t3 && t3.negated === true) {
            a = `^(?!${a}).*$`;
          }
          const i = picomatch.toRegex(a, e3);
          if (n2 === true) {
            i.state = t3;
          }
          return i;
        };
        picomatch.makeRe = (t3, e3 = {}, u3 = false, n2 = false) => {
          if (!t3 || typeof t3 !== "string") {
            throw new TypeError("Expected a non-empty string");
          }
          let s2 = { negated: false, fastpaths: true };
          if (e3.fastpaths !== false && (t3[0] === "." || t3[0] === "*")) {
            s2.output = o.fastpaths(t3, e3);
          }
          if (!s2.output) {
            s2 = o(t3, e3);
          }
          return picomatch.compileRe(s2, e3, u3, n2);
        };
        picomatch.toRegex = (t3, e3) => {
          try {
            const u3 = e3 || {};
            return new RegExp(t3, u3.flags || (u3.nocase ? "i" : ""));
          } catch (t4) {
            if (e3 && e3.debug === true)
              throw t4;
            return /$^/;
          }
        };
        picomatch.constants = r;
        t2.exports = picomatch;
      }, 716: (t2, e2, u2) => {
        const n = u2(96);
        const { CHAR_ASTERISK: o, CHAR_AT: s, CHAR_BACKWARD_SLASH: r, CHAR_COMMA: a, CHAR_DOT: i, CHAR_EXCLAMATION_MARK: c, CHAR_FORWARD_SLASH: p, CHAR_LEFT_CURLY_BRACE: l, CHAR_LEFT_PARENTHESES: f, CHAR_LEFT_SQUARE_BRACKET: A, CHAR_PLUS: _, CHAR_QUESTION_MARK: R, CHAR_RIGHT_CURLY_BRACE: E, CHAR_RIGHT_PARENTHESES: h, CHAR_RIGHT_SQUARE_BRACKET: g } = u2(154);
        const isPathSeparator = (t3) => t3 === p || t3 === r;
        const depth = (t3) => {
          if (t3.isPrefix !== true) {
            t3.depth = t3.isGlobstar ? Infinity : 1;
          }
        };
        const scan = (t3, e3) => {
          const u3 = e3 || {};
          const b = t3.length - 1;
          const C = u3.parts === true || u3.scanToEnd === true;
          const y = [];
          const $ = [];
          const x = [];
          let S = t3;
          let H = -1;
          let v = 0;
          let d = 0;
          let L = false;
          let T = false;
          let O = false;
          let k = false;
          let m = false;
          let w = false;
          let N = false;
          let I = false;
          let B = false;
          let G = false;
          let D = 0;
          let M;
          let P;
          let K = { value: "", depth: 0, isGlob: false };
          const eos = () => H >= b;
          const peek = () => S.charCodeAt(H + 1);
          const advance = () => {
            M = P;
            return S.charCodeAt(++H);
          };
          while (H < b) {
            P = advance();
            let t4;
            if (P === r) {
              N = K.backslashes = true;
              P = advance();
              if (P === l) {
                w = true;
              }
              continue;
            }
            if (w === true || P === l) {
              D++;
              while (eos() !== true && (P = advance())) {
                if (P === r) {
                  N = K.backslashes = true;
                  advance();
                  continue;
                }
                if (P === l) {
                  D++;
                  continue;
                }
                if (w !== true && P === i && (P = advance()) === i) {
                  L = K.isBrace = true;
                  O = K.isGlob = true;
                  G = true;
                  if (C === true) {
                    continue;
                  }
                  break;
                }
                if (w !== true && P === a) {
                  L = K.isBrace = true;
                  O = K.isGlob = true;
                  G = true;
                  if (C === true) {
                    continue;
                  }
                  break;
                }
                if (P === E) {
                  D--;
                  if (D === 0) {
                    w = false;
                    L = K.isBrace = true;
                    G = true;
                    break;
                  }
                }
              }
              if (C === true) {
                continue;
              }
              break;
            }
            if (P === p) {
              y.push(H);
              $.push(K);
              K = { value: "", depth: 0, isGlob: false };
              if (G === true)
                continue;
              if (M === i && H === v + 1) {
                v += 2;
                continue;
              }
              d = H + 1;
              continue;
            }
            if (u3.noext !== true) {
              const t5 = P === _ || P === s || P === o || P === R || P === c;
              if (t5 === true && peek() === f) {
                O = K.isGlob = true;
                k = K.isExtglob = true;
                G = true;
                if (P === c && H === v) {
                  B = true;
                }
                if (C === true) {
                  while (eos() !== true && (P = advance())) {
                    if (P === r) {
                      N = K.backslashes = true;
                      P = advance();
                      continue;
                    }
                    if (P === h) {
                      O = K.isGlob = true;
                      G = true;
                      break;
                    }
                  }
                  continue;
                }
                break;
              }
            }
            if (P === o) {
              if (M === o)
                m = K.isGlobstar = true;
              O = K.isGlob = true;
              G = true;
              if (C === true) {
                continue;
              }
              break;
            }
            if (P === R) {
              O = K.isGlob = true;
              G = true;
              if (C === true) {
                continue;
              }
              break;
            }
            if (P === A) {
              while (eos() !== true && (t4 = advance())) {
                if (t4 === r) {
                  N = K.backslashes = true;
                  advance();
                  continue;
                }
                if (t4 === g) {
                  T = K.isBracket = true;
                  O = K.isGlob = true;
                  G = true;
                  break;
                }
              }
              if (C === true) {
                continue;
              }
              break;
            }
            if (u3.nonegate !== true && P === c && H === v) {
              I = K.negated = true;
              v++;
              continue;
            }
            if (u3.noparen !== true && P === f) {
              O = K.isGlob = true;
              if (C === true) {
                while (eos() !== true && (P = advance())) {
                  if (P === f) {
                    N = K.backslashes = true;
                    P = advance();
                    continue;
                  }
                  if (P === h) {
                    G = true;
                    break;
                  }
                }
                continue;
              }
              break;
            }
            if (O === true) {
              G = true;
              if (C === true) {
                continue;
              }
              break;
            }
          }
          if (u3.noext === true) {
            k = false;
            O = false;
          }
          let U = S;
          let X = "";
          let F = "";
          if (v > 0) {
            X = S.slice(0, v);
            S = S.slice(v);
            d -= v;
          }
          if (U && O === true && d > 0) {
            U = S.slice(0, d);
            F = S.slice(d);
          } else if (O === true) {
            U = "";
            F = S;
          } else {
            U = S;
          }
          if (U && U !== "" && U !== "/" && U !== S) {
            if (isPathSeparator(U.charCodeAt(U.length - 1))) {
              U = U.slice(0, -1);
            }
          }
          if (u3.unescape === true) {
            if (F)
              F = n.removeBackslashes(F);
            if (U && N === true) {
              U = n.removeBackslashes(U);
            }
          }
          const Q = { prefix: X, input: t3, start: v, base: U, glob: F, isBrace: L, isBracket: T, isGlob: O, isExtglob: k, isGlobstar: m, negated: I, negatedExtglob: B };
          if (u3.tokens === true) {
            Q.maxDepth = 0;
            if (!isPathSeparator(P)) {
              $.push(K);
            }
            Q.tokens = $;
          }
          if (u3.parts === true || u3.tokens === true) {
            let e4;
            for (let n2 = 0; n2 < y.length; n2++) {
              const o2 = e4 ? e4 + 1 : v;
              const s2 = y[n2];
              const r2 = t3.slice(o2, s2);
              if (u3.tokens) {
                if (n2 === 0 && v !== 0) {
                  $[n2].isPrefix = true;
                  $[n2].value = X;
                } else {
                  $[n2].value = r2;
                }
                depth($[n2]);
                Q.maxDepth += $[n2].depth;
              }
              if (n2 !== 0 || r2 !== "") {
                x.push(r2);
              }
              e4 = s2;
            }
            if (e4 && e4 + 1 < t3.length) {
              const n2 = t3.slice(e4 + 1);
              x.push(n2);
              if (u3.tokens) {
                $[$.length - 1].value = n2;
                depth($[$.length - 1]);
                Q.maxDepth += $[$.length - 1].depth;
              }
            }
            Q.slashes = y;
            Q.parts = x;
          }
          return Q;
        };
        t2.exports = scan;
      }, 96: (t2, e2, u2) => {
        const { REGEX_BACKSLASH: n, REGEX_REMOVE_BACKSLASH: o, REGEX_SPECIAL_CHARS: s, REGEX_SPECIAL_CHARS_GLOBAL: r } = u2(154);
        e2.isObject = (t3) => t3 !== null && typeof t3 === "object" && !Array.isArray(t3);
        e2.hasRegexChars = (t3) => s.test(t3);
        e2.isRegexChar = (t3) => t3.length === 1 && e2.hasRegexChars(t3);
        e2.escapeRegex = (t3) => t3.replace(r, "\\$1");
        e2.toPosixSlashes = (t3) => t3.replace(n, "/");
        e2.removeBackslashes = (t3) => t3.replace(o, (t4) => t4 === "\\" ? "" : t4);
        e2.escapeLast = (t3, u3, n2) => {
          const o2 = t3.lastIndexOf(u3, n2);
          if (o2 === -1)
            return t3;
          if (t3[o2 - 1] === "\\")
            return e2.escapeLast(t3, u3, o2 - 1);
          return `${t3.slice(0, o2)}\\${t3.slice(o2)}`;
        };
        e2.removePrefix = (t3, e3 = {}) => {
          let u3 = t3;
          if (u3.startsWith("./")) {
            u3 = u3.slice(2);
            e3.prefix = "./";
          }
          return u3;
        };
        e2.wrapOutput = (t3, e3 = {}, u3 = {}) => {
          const n2 = u3.contains ? "" : "^";
          const o2 = u3.contains ? "" : "$";
          let s2 = `${n2}(?:${t3})${o2}`;
          if (e3.negated === true) {
            s2 = `(?:^(?!${s2}).*$)`;
          }
          return s2;
        };
        e2.basename = (t3, { windows: e3 } = {}) => {
          const u3 = t3.split(e3 ? /[\\/]/ : "/");
          const n2 = u3[u3.length - 1];
          if (n2 === "") {
            return u3[u3.length - 2];
          }
          return n2;
        };
      } };
      var e = {};
      function __nccwpck_require__(u2) {
        var n = e[u2];
        if (n !== void 0) {
          return n.exports;
        }
        var o = e[u2] = { exports: {} };
        var s = true;
        try {
          t[u2](o, o.exports, __nccwpck_require__);
          s = false;
        } finally {
          if (s)
            delete e[u2];
        }
        return o.exports;
      }
      if (typeof __nccwpck_require__ !== "undefined")
        __nccwpck_require__.ab = __dirname + "/";
      var u = __nccwpck_require__(170);
      module2.exports = u;
    })();
  }
});

// node_modules/next/dist/shared/lib/match-local-pattern.js
var require_match_local_pattern = __commonJS({
  "node_modules/next/dist/shared/lib/match-local-pattern.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all)
        Object.defineProperty(target, name, {
          enumerable: true,
          get: all[name]
        });
    }
    _export(exports2, {
      hasLocalMatch: function() {
        return hasLocalMatch;
      },
      matchLocalPattern: function() {
        return matchLocalPattern;
      }
    });
    var _picomatch = require_picomatch();
    function matchLocalPattern(pattern, url) {
      if (pattern.search !== void 0) {
        if (pattern.search !== url.search) {
          return false;
        }
      }
      if (!(0, _picomatch.makeRe)(pattern.pathname ?? "**", {
        dot: true
      }).test(url.pathname)) {
        return false;
      }
      return true;
    }
    function hasLocalMatch(localPatterns, urlPathAndQuery) {
      if (!localPatterns) {
        return true;
      }
      const url = new URL(urlPathAndQuery, "http://n");
      return localPatterns.some((p) => matchLocalPattern(p, url));
    }
  }
});

// node_modules/next/dist/shared/lib/match-remote-pattern.js
var require_match_remote_pattern = __commonJS({
  "node_modules/next/dist/shared/lib/match-remote-pattern.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all)
        Object.defineProperty(target, name, {
          enumerable: true,
          get: all[name]
        });
    }
    _export(exports2, {
      hasRemoteMatch: function() {
        return hasRemoteMatch;
      },
      matchRemotePattern: function() {
        return matchRemotePattern;
      }
    });
    var _picomatch = require_picomatch();
    function matchRemotePattern(pattern, url) {
      if (pattern.protocol !== void 0) {
        if (pattern.protocol.replace(/:$/, "") !== url.protocol.replace(/:$/, "")) {
          return false;
        }
      }
      if (pattern.port !== void 0) {
        if (pattern.port !== url.port) {
          return false;
        }
      }
      if (pattern.hostname === void 0) {
        throw Object.defineProperty(new Error(`Pattern should define hostname but found
${JSON.stringify(pattern)}`), "__NEXT_ERROR_CODE", {
          value: "E410",
          enumerable: false,
          configurable: true
        });
      } else {
        if (!(0, _picomatch.makeRe)(pattern.hostname).test(url.hostname)) {
          return false;
        }
      }
      if (pattern.search !== void 0) {
        if (pattern.search !== url.search) {
          return false;
        }
      }
      if (!(0, _picomatch.makeRe)(pattern.pathname ?? "**", {
        dot: true
      }).test(url.pathname)) {
        return false;
      }
      return true;
    }
    function hasRemoteMatch(domains, remotePatterns, url) {
      return domains.some((domain) => url.hostname === domain) || remotePatterns.some((p) => matchRemotePattern(p, url));
    }
  }
});

// node_modules/next/dist/shared/lib/image-loader.js
var require_image_loader = __commonJS({
  "node_modules/next/dist/shared/lib/image-loader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "default", {
      enumerable: true,
      get: function() {
        return _default;
      }
    });
    var _findclosestquality = require_find_closest_quality();
    var _deploymentid = require_deployment_id();
    function defaultLoader({ config, src, width, quality }) {
      if (src.startsWith("/") && src.includes("?") && config.localPatterns?.length === 1 && config.localPatterns[0].pathname === "**" && config.localPatterns[0].search === "") {
        throw Object.defineProperty(new Error(`Image with src "${src}" is using a query string which is not configured in images.localPatterns.
Read more: https://nextjs.org/docs/messages/next-image-unconfigured-localpatterns`), "__NEXT_ERROR_CODE", {
          value: "E871",
          enumerable: false,
          configurable: true
        });
      }
      if (process.env.NODE_ENV !== "production") {
        const missingValues = [];
        if (!src)
          missingValues.push("src");
        if (!width)
          missingValues.push("width");
        if (missingValues.length > 0) {
          throw Object.defineProperty(new Error(`Next Image Optimization requires ${missingValues.join(", ")} to be provided. Make sure you pass them as props to the \`next/image\` component. Received: ${JSON.stringify({
            src,
            width,
            quality
          })}`), "__NEXT_ERROR_CODE", {
            value: "E188",
            enumerable: false,
            configurable: true
          });
        }
        if (src.startsWith("//")) {
          throw Object.defineProperty(new Error(`Failed to parse src "${src}" on \`next/image\`, protocol-relative URL (//) must be changed to an absolute URL (http:// or https://)`), "__NEXT_ERROR_CODE", {
            value: "E360",
            enumerable: false,
            configurable: true
          });
        }
        if (src.startsWith("/") && config.localPatterns) {
          if (process.env.NODE_ENV !== "test" && // micromatch isn't compatible with edge runtime
          process.env.NEXT_RUNTIME !== "edge") {
            const { hasLocalMatch } = require_match_local_pattern();
            if (!hasLocalMatch(config.localPatterns, src)) {
              throw Object.defineProperty(new Error(`Invalid src prop (${src}) on \`next/image\` does not match \`images.localPatterns\` configured in your \`next.config.js\`
See more info: https://nextjs.org/docs/messages/next-image-unconfigured-localpatterns`), "__NEXT_ERROR_CODE", {
                value: "E426",
                enumerable: false,
                configurable: true
              });
            }
          }
        }
        if (!src.startsWith("/") && (config.domains || config.remotePatterns)) {
          let parsedSrc;
          try {
            parsedSrc = new URL(src);
          } catch (err) {
            console.error(err);
            throw Object.defineProperty(new Error(`Failed to parse src "${src}" on \`next/image\`, if using relative image it must start with a leading slash "/" or be an absolute URL (http:// or https://)`), "__NEXT_ERROR_CODE", {
              value: "E63",
              enumerable: false,
              configurable: true
            });
          }
          if (process.env.NODE_ENV !== "test" && // micromatch isn't compatible with edge runtime
          process.env.NEXT_RUNTIME !== "edge") {
            const { hasRemoteMatch } = require_match_remote_pattern();
            if (!hasRemoteMatch(config.domains, config.remotePatterns, parsedSrc)) {
              throw Object.defineProperty(new Error(`Invalid src prop (${src}) on \`next/image\`, hostname "${parsedSrc.hostname}" is not configured under images in your \`next.config.js\`
See more info: https://nextjs.org/docs/messages/next-image-unconfigured-host`), "__NEXT_ERROR_CODE", {
                value: "E231",
                enumerable: false,
                configurable: true
              });
            }
          }
        }
      }
      const q = (0, _findclosestquality.findClosestQuality)(quality, config);
      let deploymentId = (0, _deploymentid.getDeploymentId)();
      return `${config.path}?url=${encodeURIComponent(src)}&w=${width}&q=${q}${src.startsWith("/") && deploymentId ? `&dpl=${deploymentId}` : ""}`;
    }
    defaultLoader.__next_img_default = true;
    var _default = defaultLoader;
  }
});

// node_modules/next/dist/client/use-merged-ref.js
var require_use_merged_ref = __commonJS({
  "node_modules/next/dist/client/use-merged-ref.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "useMergedRef", {
      enumerable: true,
      get: function() {
        return useMergedRef;
      }
    });
    var _react = require_react();
    function useMergedRef(refA, refB) {
      const cleanupA = (0, _react.useRef)(null);
      const cleanupB = (0, _react.useRef)(null);
      return (0, _react.useCallback)((current) => {
        if (current === null) {
          const cleanupFnA = cleanupA.current;
          if (cleanupFnA) {
            cleanupA.current = null;
            cleanupFnA();
          }
          const cleanupFnB = cleanupB.current;
          if (cleanupFnB) {
            cleanupB.current = null;
            cleanupFnB();
          }
        } else {
          if (refA) {
            cleanupA.current = applyRef(refA, current);
          }
          if (refB) {
            cleanupB.current = applyRef(refB, current);
          }
        }
      }, [
        refA,
        refB
      ]);
    }
    function applyRef(refA, current) {
      if (typeof refA === "function") {
        const cleanup = refA(current);
        if (typeof cleanup === "function") {
          return cleanup;
        } else {
          return () => refA(null);
        }
      } else {
        refA.current = current;
        return () => {
          refA.current = null;
        };
      }
    }
    if ((typeof exports2.default === "function" || typeof exports2.default === "object" && exports2.default !== null) && typeof exports2.default.__esModule === "undefined") {
      Object.defineProperty(exports2.default, "__esModule", { value: true });
      Object.assign(exports2.default, exports2);
      module2.exports = exports2.default;
    }
  }
});

// node_modules/next/dist/client/image-component.js
var require_image_component = __commonJS({
  "node_modules/next/dist/client/image-component.js"(exports2, module2) {
    "use client";
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "Image", {
      enumerable: true,
      get: function() {
        return Image2;
      }
    });
    var _interop_require_default = require_interop_require_default();
    var _interop_require_wildcard = require_interop_require_wildcard();
    var _jsxruntime = require_jsx_runtime();
    var _react = /* @__PURE__ */ _interop_require_wildcard._(require_react());
    var _reactdom = /* @__PURE__ */ _interop_require_default._(require_react_dom());
    var _head = /* @__PURE__ */ _interop_require_default._(require_head());
    var _getimgprops = require_get_img_props();
    var _imageconfig = require_image_config();
    var _imageconfigcontextsharedruntime = require_image_config_context_shared_runtime();
    var _warnonce = require_warn_once();
    var _routercontextsharedruntime = require_router_context_shared_runtime();
    var _imageloader = /* @__PURE__ */ _interop_require_default._(require_image_loader());
    var _usemergedref = require_use_merged_ref();
    var configEnv = process.env.__NEXT_IMAGE_OPTS;
    if (typeof window === "undefined") {
      ;
      globalThis.__NEXT_IMAGE_IMPORTED = true;
    }
    function handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete, unoptimized, sizesInput) {
      const src = img?.src;
      if (!img || img["data-loaded-src"] === src) {
        return;
      }
      img["data-loaded-src"] = src;
      const p = "decode" in img ? img.decode() : Promise.resolve();
      p.catch(() => {
      }).then(() => {
        if (!img.parentElement || !img.isConnected) {
          return;
        }
        if (placeholder !== "empty") {
          setBlurComplete(true);
        }
        if (onLoadRef?.current) {
          const event = new Event("load");
          Object.defineProperty(event, "target", {
            writable: false,
            value: img
          });
          let prevented = false;
          let stopped = false;
          onLoadRef.current({
            ...event,
            nativeEvent: event,
            currentTarget: img,
            target: img,
            isDefaultPrevented: () => prevented,
            isPropagationStopped: () => stopped,
            persist: () => {
            },
            preventDefault: () => {
              prevented = true;
              event.preventDefault();
            },
            stopPropagation: () => {
              stopped = true;
              event.stopPropagation();
            }
          });
        }
        if (onLoadingCompleteRef?.current) {
          onLoadingCompleteRef.current(img);
        }
        if (process.env.NODE_ENV !== "production") {
          const origSrc = new URL(src, "http://n").searchParams.get("url") || src;
          if (img.getAttribute("data-nimg") === "fill") {
            if (!unoptimized && (!sizesInput || sizesInput === "100vw")) {
              let widthViewportRatio = img.getBoundingClientRect().width / window.innerWidth;
              if (widthViewportRatio < 0.6) {
                if (sizesInput === "100vw") {
                  (0, _warnonce.warnOnce)(`Image with src "${origSrc}" has "fill" prop and "sizes" prop of "100vw", but image is not rendered at full viewport width. Please adjust "sizes" to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes`);
                } else {
                  (0, _warnonce.warnOnce)(`Image with src "${origSrc}" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes`);
                }
              }
            }
            if (img.parentElement) {
              const { position } = window.getComputedStyle(img.parentElement);
              const valid = [
                "absolute",
                "fixed",
                "relative"
              ];
              if (!valid.includes(position)) {
                (0, _warnonce.warnOnce)(`Image with src "${origSrc}" has "fill" and parent element with invalid "position". Provided "${position}" should be one of ${valid.map(String).join(",")}.`);
              }
            }
            if (img.height === 0) {
              (0, _warnonce.warnOnce)(`Image with src "${origSrc}" has "fill" and a height value of 0. This is likely because the parent element of the image has not been styled to have a set height.`);
            }
          }
          const heightModified = img.height.toString() !== img.getAttribute("height");
          const widthModified = img.width.toString() !== img.getAttribute("width");
          if (heightModified && !widthModified || !heightModified && widthModified) {
            (0, _warnonce.warnOnce)(`Image with src "${origSrc}" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.`);
          }
        }
      });
    }
    function getDynamicProps(fetchPriority) {
      if (Boolean(_react.use)) {
        return {
          fetchPriority
        };
      }
      return {
        fetchpriority: fetchPriority
      };
    }
    var ImageElement = /* @__PURE__ */ (0, _react.forwardRef)(({ src, srcSet, sizes, height, width, decoding, className, style, fetchPriority, placeholder, loading, unoptimized, fill, onLoadRef, onLoadingCompleteRef, setBlurComplete, setShowAltText, sizesInput, onLoad, onError, ...rest }, forwardedRef) => {
      const ownRef = (0, _react.useCallback)((img) => {
        if (!img) {
          return;
        }
        if (onError) {
          img.src = img.src;
        }
        if (process.env.NODE_ENV !== "production") {
          if (!src) {
            console.error(`Image is missing required "src" property:`, img);
          }
          if (img.getAttribute("alt") === null) {
            console.error(`Image is missing required "alt" property. Please add Alternative Text to describe the image for screen readers and search engines.`);
          }
        }
        if (img.complete) {
          handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete, unoptimized, sizesInput);
        }
      }, [
        src,
        placeholder,
        onLoadRef,
        onLoadingCompleteRef,
        setBlurComplete,
        onError,
        unoptimized,
        sizesInput
      ]);
      const ref = (0, _usemergedref.useMergedRef)(forwardedRef, ownRef);
      return /* @__PURE__ */ (0, _jsxruntime.jsx)("img", {
        ...rest,
        ...getDynamicProps(fetchPriority),
        // It's intended to keep `loading` before `src` because React updates
        // props in order which causes Safari/Firefox to not lazy load properly.
        // See https://github.com/facebook/react/issues/25883
        loading,
        width,
        height,
        decoding,
        "data-nimg": fill ? "fill" : "1",
        className,
        style,
        // It's intended to keep `src` the last attribute because React updates
        // attributes in order. If we keep `src` the first one, Safari will
        // immediately start to fetch `src`, before `sizes` and `srcSet` are even
        // updated by React. That causes multiple unnecessary requests if `srcSet`
        // and `sizes` are defined.
        // This bug cannot be reproduced in Chrome or Firefox.
        sizes,
        srcSet,
        src,
        ref,
        onLoad: (event) => {
          const img = event.currentTarget;
          handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete, unoptimized, sizesInput);
        },
        onError: (event) => {
          setShowAltText(true);
          if (placeholder !== "empty") {
            setBlurComplete(true);
          }
          if (onError) {
            onError(event);
          }
        }
      });
    });
    function ImagePreload({ isAppRouter, imgAttributes }) {
      const opts = {
        as: "image",
        imageSrcSet: imgAttributes.srcSet,
        imageSizes: imgAttributes.sizes,
        crossOrigin: imgAttributes.crossOrigin,
        referrerPolicy: imgAttributes.referrerPolicy,
        ...getDynamicProps(imgAttributes.fetchPriority)
      };
      if (isAppRouter && _reactdom.default.preload) {
        _reactdom.default.preload(imgAttributes.src, opts);
        return null;
      }
      return /* @__PURE__ */ (0, _jsxruntime.jsx)(_head.default, {
        children: /* @__PURE__ */ (0, _jsxruntime.jsx)("link", {
          rel: "preload",
          // Note how we omit the `href` attribute, as it would only be relevant
          // for browsers that do not support `imagesrcset`, and in those cases
          // it would cause the incorrect image to be preloaded.
          //
          // https://html.spec.whatwg.org/multipage/semantics.html#attr-link-imagesrcset
          href: imgAttributes.srcSet ? void 0 : imgAttributes.src,
          ...opts
        }, "__nimg-" + imgAttributes.src + imgAttributes.srcSet + imgAttributes.sizes)
      });
    }
    var Image2 = /* @__PURE__ */ (0, _react.forwardRef)((props, forwardedRef) => {
      const pagesRouter = (0, _react.useContext)(_routercontextsharedruntime.RouterContext);
      const isAppRouter = !pagesRouter;
      const configContext = (0, _react.useContext)(_imageconfigcontextsharedruntime.ImageConfigContext);
      const config = (0, _react.useMemo)(() => {
        const c = configEnv || configContext || _imageconfig.imageConfigDefault;
        const allSizes = [
          ...c.deviceSizes,
          ...c.imageSizes
        ].sort((a, b) => a - b);
        const deviceSizes = c.deviceSizes.sort((a, b) => a - b);
        const qualities = c.qualities?.sort((a, b) => a - b);
        return {
          ...c,
          allSizes,
          deviceSizes,
          qualities,
          // During the SSR, configEnv (__NEXT_IMAGE_OPTS) does not include
          // security sensitive configs like `localPatterns`, which is needed
          // during the server render to ensure it's validated. Therefore use
          // configContext, which holds the config from the server for validation.
          localPatterns: typeof window === "undefined" ? configContext?.localPatterns : c.localPatterns
        };
      }, [
        configContext
      ]);
      const { onLoad, onLoadingComplete } = props;
      const onLoadRef = (0, _react.useRef)(onLoad);
      (0, _react.useEffect)(() => {
        onLoadRef.current = onLoad;
      }, [
        onLoad
      ]);
      const onLoadingCompleteRef = (0, _react.useRef)(onLoadingComplete);
      (0, _react.useEffect)(() => {
        onLoadingCompleteRef.current = onLoadingComplete;
      }, [
        onLoadingComplete
      ]);
      const [blurComplete, setBlurComplete] = (0, _react.useState)(false);
      const [showAltText, setShowAltText] = (0, _react.useState)(false);
      const { props: imgAttributes, meta: imgMeta } = (0, _getimgprops.getImgProps)(props, {
        defaultLoader: _imageloader.default,
        imgConf: config,
        blurComplete,
        showAltText
      });
      return /* @__PURE__ */ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
        children: [
          /* @__PURE__ */ (0, _jsxruntime.jsx)(ImageElement, {
            ...imgAttributes,
            unoptimized: imgMeta.unoptimized,
            placeholder: imgMeta.placeholder,
            fill: imgMeta.fill,
            onLoadRef,
            onLoadingCompleteRef,
            setBlurComplete,
            setShowAltText,
            sizesInput: props.sizes,
            ref: forwardedRef
          }),
          imgMeta.preload ? /* @__PURE__ */ (0, _jsxruntime.jsx)(ImagePreload, {
            isAppRouter,
            imgAttributes
          }) : null
        ]
      });
    });
    if ((typeof exports2.default === "function" || typeof exports2.default === "object" && exports2.default !== null) && typeof exports2.default.__esModule === "undefined") {
      Object.defineProperty(exports2.default, "__esModule", { value: true });
      Object.assign(exports2.default, exports2);
      module2.exports = exports2.default;
    }
  }
});

// node_modules/next/dist/shared/lib/image-external.js
var require_image_external = __commonJS({
  "node_modules/next/dist/shared/lib/image-external.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all)
        Object.defineProperty(target, name, {
          enumerable: true,
          get: all[name]
        });
    }
    _export(exports2, {
      default: function() {
        return _default;
      },
      getImageProps: function() {
        return getImageProps;
      }
    });
    var _interop_require_default = require_interop_require_default();
    var _getimgprops = require_get_img_props();
    var _imagecomponent = require_image_component();
    var _imageloader = /* @__PURE__ */ _interop_require_default._(require_image_loader());
    function getImageProps(imgProps) {
      const { props } = (0, _getimgprops.getImgProps)(imgProps, {
        defaultLoader: _imageloader.default,
        // This is replaced by webpack define plugin
        imgConf: process.env.__NEXT_IMAGE_OPTS
      });
      for (const [key, value] of Object.entries(props)) {
        if (value === void 0) {
          delete props[key];
        }
      }
      return {
        props
      };
    }
    var _default = _imagecomponent.Image;
  }
});

// node_modules/next/image.js
var require_image = __commonJS({
  "node_modules/next/image.js"(exports2, module2) {
    module2.exports = require_image_external();
  }
});

// tests/unit/ui/duel.component.layout.test.js
var import_strict = __toESM(require("node:assert/strict"));
var import_node_test = __toESM(require("node:test"));

// server/ui/components/duel/duel.component.jsx
var import_react25 = __toESM(require_react(), 1);

// server/ui/components/duel/attack.animation.component.jsx
var import_react2 = __toESM(require_react(), 1);

// server/ui/components/common/app-image.jsx
var import_image = __toESM(require_image(), 1);
var import_react = __toESM(require_react(), 1);

// server/ui/components/duel/attack.animation.component.jsx
function resolveDialogStore(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerAttackAnimation(target, state = {}) {
  const resolvedStore = resolveDialogStore(target);
  if (!resolvedStore) {
    return;
  }
  resolvedStore.emit({
    action: "OPEN_ATTACK_ANIMATION",
    state: {
      active: true,
      from: state.from ?? void 0,
      to: state.to ?? void 0,
      stage: "priming",
      duration: Math.max(300, Number(state.duration || 720))
    }
  });
}
function disposeAttackAnimation(target) {
  resolveDialogStore(target)?.emit?.({ action: "CLOSE_ATTACK_ANIMATION" });
}

// server/ui/components/duel/attribute.component.jsx
var import_react3 = __toESM(require_react(), 1);

// server/ui/services/duel-response.service.js
function normalizeInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function normalizeList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map((value) => normalizeInteger(value));
}
function createSelectChainAnswer(index) {
  return {
    type: "number",
    i: index === null ? -1 : normalizeInteger(index)
  };
}
function createSortCardAnswer(order) {
  return {
    type: "order",
    i: order === null ? null : normalizeList(order)
  };
}

// server/ui/components/duel/attribute.component.jsx
function resolveDialogStore2(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function closeSelectAttributesDialog(target) {
  resolveDialogStore2(target)?.emit?.({ action: "CLOSE_SELECT_ATTRIBUTES_DIALOG" });
}

// server/ui/components/duel/phase.banner.component.jsx
var import_react4 = __toESM(require_react(), 1);
function resolveDialogStore3(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerPhaseBanner(target, state = {}) {
  const resolvedStore = resolveDialogStore3(target);
  if (!resolvedStore) {
    return;
  }
  resolvedStore.emit({
    action: "OPEN_PHASE_BANNER",
    state: {
      active: true,
      text: state.text || "",
      token: Date.now(),
      duration: Math.max(2400, Number(state.duration || 2400))
    }
  });
}
function disposePhaseBanner(target) {
  resolveDialogStore3(target)?.emit?.({ action: "CLOSE_PHASE_BANNER" });
}

// server/ui/services/storage.service.js
var DEFAULT_IMAGE_CDN = "https://images.ygoprodeck.com/images/cards";
function parseStoredBoolean(value, fallback = false) {
  if (value === void 0 || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }
  return Boolean(value);
}
function normalizeImageCdnUrl(value) {
  const normalized = String(value || "").trim().replace(/\/+$/, "");
  return normalized || DEFAULT_IMAGE_CDN;
}
function getStorage() {
  const applicationDefaults = {
    username: "",
    password: "",
    remember: "",
    imageURL: DEFAULT_IMAGE_CDN,
    theme: "../img/magimagipinkshadow.jpg",
    cover: "../img/textures/cover.png",
    hide_banlist: true,
    autochain: false,
    waitchain: false,
    hide_hint_button: true,
    playassist: false,
    bluff: false,
    language: "en"
  }, storage = typeof window !== "undefined" ? JSON.parse(JSON.stringify(localStorage)) : {};
  return {
    ...applicationDefaults,
    ...storage,
    imageURL: normalizeImageCdnUrl(storage.imageURL || applicationDefaults.imageURL),
    autochain: parseStoredBoolean(storage.autochain, applicationDefaults.autochain),
    hide_banlist: parseStoredBoolean(storage.hide_banlist, applicationDefaults.hide_banlist),
    hide_hint_button: parseStoredBoolean(storage.hide_hint_button, applicationDefaults.hide_hint_button),
    playassist: parseStoredBoolean(storage.playassist, applicationDefaults.playassist),
    bluff: parseStoredBoolean(storage.bluff, applicationDefaults.bluff),
    waitchain: parseStoredBoolean(storage.waitchain, applicationDefaults.waitchain)
  };
}

// server/ui/components/duel/chain.component.jsx
var import_react5 = __toESM(require_react(), 1);
var AUTO_CHAIN_DELAY_MS = 320;
var CHAIN_MODE_NEUTRAL = "neutral";
var CHAIN_MODE_IGNORE = "ignore";
var CHAIN_MODE_ALWAYS = "always";
var CHAIN_MODE_WHEN_AVAILABLE = "when_available";
var CHAIN_SETTING_FIELDS = Object.freeze([
  {
    id: "autochain",
    label: "Automatic Chain Link Order"
  },
  {
    id: "waitchain",
    label: "Add a delay even when no response"
  },
  {
    id: "hide_hint_button",
    label: "Hide Chain Buttons"
  }
]);
var CHAIN_MODE_BUTTONS = Object.freeze([
  {
    id: CHAIN_MODE_IGNORE,
    label: "Chain: OFF"
  },
  {
    id: CHAIN_MODE_ALWAYS,
    label: "Always pause"
  },
  {
    id: CHAIN_MODE_WHEN_AVAILABLE,
    label: "Chain: ON"
  }
]);
var KEYBOARD_CHAIN_MODE_BY_CODE = Object.freeze({
  KeyA: CHAIN_MODE_ALWAYS,
  KeyS: CHAIN_MODE_IGNORE,
  KeyD: CHAIN_MODE_WHEN_AVAILABLE
});
function normalizeChainMode(mode) {
  switch (mode) {
    case CHAIN_MODE_IGNORE:
    case CHAIN_MODE_ALWAYS:
    case CHAIN_MODE_WHEN_AVAILABLE:
      return mode;
    default:
      return CHAIN_MODE_NEUTRAL;
  }
}
function getChainModeFlags(mode) {
  const normalizedMode = normalizeChainMode(mode);
  return {
    ignore: normalizedMode === CHAIN_MODE_IGNORE,
    always: normalizedMode === CHAIN_MODE_ALWAYS,
    whenAvailable: normalizedMode === CHAIN_MODE_WHEN_AVAILABLE
  };
}
function resolveChainDecision(options = {}, settings = {}, mode = CHAIN_MODE_NEUTRAL) {
  const selectTrigger = Boolean(options.select_trigger) || Number(options.specount || 0) === 127, forced = Boolean(options.forced), count = Number(options.count || 0), specount = Number(options.specount || 0), autochain = Boolean(settings.autochain), waitchain = Boolean(settings.waitchain), {
    ignore,
    always,
    whenAvailable
  } = getChainModeFlags(mode), shouldDecline = !selectTrigger && !forced && (ignore || (count === 0 || specount === 0) && !always) && (count === 0 || !whenAvailable);
  if (shouldDecline) {
    return {
      type: "decline",
      delayMs: waitchain && !ignore ? AUTO_CHAIN_DELAY_MS : 0
    };
  }
  if (autochain && forced && !(always || whenAvailable)) {
    return {
      type: "accept_first",
      delayMs: 0
    };
  }
  return {
    type: "manual",
    delayMs: 0
  };
}
function readChainSettings() {
  const storage = getStorage();
  return {
    autochain: Boolean(storage.autochain),
    waitchain: Boolean(storage.waitchain),
    hide_hint_button: Boolean(storage.hide_hint_button)
  };
}
function setChainerState(controller, update) {
  controller.state = {
    ...controller.state,
    ...update
  };
}
function ChainerState(store) {
  return {
    store,
    state: {
      active: false,
      promptText: "",
      cards: [],
      forced: false,
      mode: CHAIN_MODE_NEUTRAL,
      keyboardMode: CHAIN_MODE_NEUTRAL,
      settings: readChainSettings(),
      pendingAutoResponseTimer: null,
      pendingQuestionToken: 0
    }
  };
}
function closeChainModal(controller) {
  setChainerState(controller, {
    cards: [],
    promptText: "",
    active: false,
    forced: false
  });
}
function cancelPendingChainAutoResponse(controller) {
  if (controller.state.pendingAutoResponseTimer) {
    clearTimeout(controller.state.pendingAutoResponseTimer);
    setChainerState(controller, {
      pendingAutoResponseTimer: null
    });
  }
  setChainerState(controller, {
    pendingQuestionToken: controller.state.pendingQuestionToken + 1
  });
}
function closeChainer(controller) {
  cancelPendingChainAutoResponse(controller);
  closeChainModal(controller);
}
function queueChainResponse(controller, answer, delayMs = 0, label = "CHAIN_RESPONSE") {
  const token = controller.state.pendingQuestionToken, commit = () => {
    if (token !== controller.state.pendingQuestionToken) {
      return;
    }
    closeChainModal(controller);
    controller.store.emit({ action: "CHAIN_RESPONSE", answer, label });
    controller.store.emit({ action: "RENDER" });
  };
  if (delayMs > 0) {
    const timer = setTimeout(() => {
      setChainerState(controller, {
        pendingAutoResponseTimer: null
      });
      commit();
    }, delayMs);
    setChainerState(controller, {
      pendingAutoResponseTimer: timer
    });
    controller.store.emit({ action: "RENDER" });
    return;
  }
  commit();
}
function getEffectiveChainMode(controller) {
  const keyboardMode = normalizeChainMode(controller.state.keyboardMode);
  if (keyboardMode !== CHAIN_MODE_NEUTRAL) {
    return keyboardMode;
  }
  return normalizeChainMode(controller.state.mode);
}
function resolveChainerQuestionDecision(controller, options = {}) {
  return resolveChainDecision(
    options,
    controller.state.settings,
    getEffectiveChainMode(controller)
  );
}
function triggerChainer(controller, state) {
  setChainerState(controller, {
    ...state,
    active: true
  });
}
function handleChainerQuestion(controller, options = {}, state = {}) {
  closeChainer(controller);
  const decision = resolveChainerQuestionDecision(controller, options);
  if (decision.type === "decline") {
    queueChainResponse(controller, createSelectChainAnswer(null), decision.delayMs, "auto chain");
    return true;
  }
  if (decision.type === "accept_first") {
    queueChainResponse(controller, createSelectChainAnswer(0), decision.delayMs, "forced chain");
    return true;
  }
  triggerChainer(controller, {
    promptText: state.promptText || "",
    cards: options.chain_choices || [],
    forced: Boolean(options.forced)
  });
  controller.store.emit({ action: "RENDER" });
  return false;
}
function handleChainerSortQuestion(controller) {
  cancelPendingChainAutoResponse(controller);
  closeChainModal(controller);
  if (!controller.state.settings.autochain) {
    return false;
  }
  queueChainResponse(controller, createSortCardAnswer(null), 0, "auto sort chain");
  return true;
}
function resetChainerDuelState(controller) {
  closeChainer(controller);
  setChainerState(controller, {
    mode: CHAIN_MODE_NEUTRAL,
    keyboardMode: CHAIN_MODE_NEUTRAL
  });
}
function disposeChainer(controller) {
  if (!controller) {
    return;
  }
  resetChainerDuelState(controller);
}

// server/ui/components/duel/extracontrols.component.jsx
var import_react6 = __toESM(require_react(), 1);

// server/ui/util/cardManipulation.js
function cardIs(cat, obj) {
  "use strict";
  if (cat === "monster" && (obj.race !== 0 || obj.level !== 0 || obj.attribute !== 0)) {
    return true;
  }
  if (cat === "monster") {
    return (obj.type & 1) === 1;
  }
  if (cat === "spell") {
    return (obj.type & 2) === 2;
  }
  if (cat === "trap") {
    return (obj.type & 4) === 4;
  }
  if (cat === "fusion") {
    return (obj.type & 64) === 64;
  }
  if (cat === "ritual") {
    return (obj.type & 128) === 128;
  }
  if (cat === "synchro") {
    return (obj.type & 8192) === 8192;
  }
  if (cat === "token") {
    return (obj.type & 16400) === 16400;
  }
  if (cat === "xyz") {
    return (obj.type & 8388608) === 8388608;
  }
  if (cat === "link") {
    if (obj.links && obj.links.length) {
      return true;
    }
    return (obj.type & 67108864) === 67108864;
  }
}

// server/ui/components/duel/field.reveal.component.jsx
var import_react7 = __toESM(require_react(), 1);
function resolveDialogStore4(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerFieldReveal(target, state = {}) {
  const resolvedStore = resolveDialogStore4(target);
  if (!resolvedStore) {
    return;
  }
  resolvedStore.emit({
    action: "OPEN_FIELD_REVEAL",
    state: {
      active: true,
      cards: Array.isArray(state.cards) ? state.cards.slice() : [],
      placements: Array.isArray(state.placements) ? state.placements.slice() : [],
      mode: state.mode || "panel",
      stage: "priming",
      duration: Math.max(700, Number(state.duration || 1400))
    }
  });
}
function disposeFieldReveal(target) {
  resolveDialogStore4(target)?.emit?.({ action: "CLOSE_FIELD_REVEAL" });
}

// server/ui/components/duel/idle.extra.viewer.component.jsx
var import_react8 = __toESM(require_react(), 1);
var REVEAL_LOCATION_LABELS = Object.freeze({
  BANISHED: "Banished",
  DECK: "Deck",
  EXTRA: "Extra Deck",
  EXCAVATED: "Excavated",
  FZONE: "Field Zone",
  GRAVE: "Graveyard",
  HAND: "Hand",
  MONSTERZONE: "Monster Zone",
  ONFIELD: "Field",
  OVERLAY: "Overlay Unit",
  PZONE: "Pendulum Zone",
  SPELLZONE: "Spell & Trap Zone"
});
var VIEWER_MODE_LABELS = Object.freeze({
  activate: "Activate",
  spsummon: "Special Summon",
  view: "View"
});
function resolveDialogStore5(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function closeIdleExtraDeckViewer(target) {
  resolveDialogStore5(target)?.emit?.({ action: "CLOSE_IDLE_EXTRA_VIEWER" });
}
function disposeIdleExtraDeckViewer(target) {
  closeIdleExtraDeckViewer(target);
}

// server/ui/components/duel/field.component.jsx
var import_react13 = __toESM(require_react(), 1);

// server/ui/components/common/card.component.jsx
var import_react9 = __toESM(require_react(), 1);

// server/ui/services/listener.service.js
function Feed(initialStates) {
  const states = Object.assign({}, initialStates), events = {}, subscriptions = {}, replayableActions = /* @__PURE__ */ new Set([
    "LOAD_RANKING",
    "LOAD_DATABASE",
    "LOAD_RELEASES",
    "BANLIST",
    "GAME_LIST",
    "LOAD_DECKS",
    "LOAD_SETCODES",
    "SYSTEM_LOADED",
    "SET_LIFEPOINT_WAITING",
    "IRC_STATE",
    "IRC_HISTORY",
    "IRC_MESSAGE",
    "IRC_ERROR",
    "IRC_RESET"
  ]);
  function ensureState(action) {
    if (!states[action]) {
      states[action] = {};
    }
    return states[action];
  }
  function ensureCollection(collection, action) {
    if (!collection[action]) {
      collection[action] = [];
    }
    return collection[action];
  }
  function removeBehavior(collection, action, behavior) {
    const bucket = collection[action];
    if (!bucket || !bucket.length) {
      return;
    }
    const index = bucket.indexOf(behavior);
    if (index < 0) {
      return;
    }
    bucket.splice(index, 1);
    if (!bucket.length) {
      delete collection[action];
    }
  }
  function replayIfAvailable(action, behavior, includeState) {
    const state = ensureState(action);
    if (!replayableActions.has(action) || !state.lastEvent) {
      return;
    }
    if (includeState) {
      behavior(state.lastEvent, state);
      return;
    }
    behavior(state.lastEvent);
  }
  function on2(action, behavior) {
    if (typeof action !== "string" || typeof behavior !== "function") {
      return () => {
      };
    }
    ensureState(action);
    ensureCollection(events, action).push(behavior);
    console.log("registering:", action);
    replayIfAvailable(action, behavior, true);
    return function unsubscribe() {
      removeBehavior(events, action, behavior);
    };
  }
  function emit2(event) {
    if (!event || !event.action) {
      return;
    }
    const state = ensureState(event.action);
    if (replayableActions.has(event.action)) {
      state.lastEvent = event;
    }
    if (!replayableActions.has(event.action) && !(events[event.action] && events[event.action].length) && !(subscriptions[event.action] && subscriptions[event.action].length)) {
      console.log(new Error(`Action ${event.action} is not registered`));
    }
    if (events[event.action] && events[event.action].length) {
      [...events[event.action]].forEach((behavior) => {
        behavior(event, state);
      });
    }
    if (subscriptions[event.action] && subscriptions[event.action].length) {
      [...subscriptions[event.action]].forEach((behavior) => {
        behavior(event);
      });
    }
  }
  function subscribe2(action, behavior) {
    if (typeof action !== "string" || typeof behavior !== "function") {
      return () => {
      };
    }
    ensureCollection(subscriptions, action).push(behavior);
    console.log("Subscribing:", action);
    replayIfAvailable(action, behavior, false);
    return function unsubscribe() {
      removeBehavior(subscriptions, action, behavior);
    };
  }
  return {
    on: on2,
    emit: emit2,
    subscribe: subscribe2
  };
}
var {
  on,
  emit,
  subscribe
} = new Feed({});

// server/ui/components/common/card.component.jsx
function CardImageState(input) {
  return {
    state: input?.state || input || {}
  };
}

// server/ui/components/duel/phases.component.jsx
var import_react10 = __toESM(require_react(), 1);
var PHASE_INDEX_BY_NAME = {
  DRAW: 0,
  PHASE_DRAW: 0,
  STANDBY: 1,
  PHASE_STANDBY: 1,
  MAIN1: 2,
  MAIN_1: 2,
  PHASE_MAIN1: 2,
  BATTLE: 3,
  BATTLE_START: 3,
  PHASE_BATTLE_START: 3,
  MAIN2: 4,
  MAIN_2: 4,
  PHASE_MAIN2: 4,
  END: 5,
  PHASE_END: 5
};
function createEmptyPhaseIndicatorState(state = {}) {
  return {
    opponentTurn: false,
    phase: void 0,
    battlephase: void 0,
    mainphase2: void 0,
    endphase: void 0,
    ...state
  };
}
function resolvePhaseStore(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function resolvePhaseController(target) {
  if (target?.state || target?.phase !== void 0) {
    return target;
  }
  return target?.controller;
}
function normalizePhaseIndicatorUpdate(phaseUpdate) {
  const numericPhase = Number(phaseUpdate);
  if (Number.isInteger(numericPhase)) {
    return numericPhase;
  }
  return PHASE_INDEX_BY_NAME[String(phaseUpdate || "").toUpperCase()] ?? phaseUpdate;
}
function updatePhaseIndicator(target, state = {}) {
  const controller = resolvePhaseController(target), resolvedStore = resolvePhaseStore(target);
  if (controller) {
    Object.assign(controller.state, state);
  }
  resolvedStore?.emit?.({
    action: "UPDATE_PHASE_INDICATOR",
    state: createEmptyPhaseIndicatorState({
      ...controller?.state || {},
      ...state
    })
  });
}

// server/ui/components/duel/field.selection.component.jsx
var import_react12 = __toESM(require_react(), 1);

// server/ui/components/duel/zone.selection.component.jsx
var import_react11 = __toESM(require_react(), 1);

// server/ui/components/duel/field.selection.component.jsx
function resolveCanonicalZonePlayer(player, query = {}) {
  const normalizedPlayer = Number(player);
  if (query?.command === "MSG_SELECT_PLACE" && Number.isInteger(Number(query?.player))) {
    const promptPlayer = Number(query.player);
    return window.orientation ? promptPlayer ? 0 : 1 : promptPlayer;
  }
  if (normalizedPlayer !== 0 && normalizedPlayer !== 1) {
    return 0;
  }
  return window.orientation ? normalizedPlayer ? 0 : 1 : normalizedPlayer;
}
function setupFieldSelectorZones(zoneType, count) {
  const selectors = [];
  for (let player = 0; player <= 1; player++) {
    for (let index = 0; index <= count; index++) {
      selectors.push({
        index,
        location: zoneType,
        player,
        uid: `selector-player_${player}-${zoneType}-${index}`
      });
    }
  }
  return selectors;
}
var FIELD_SELECTOR_ZONES = [
  ...setupFieldSelectorZones("SPELLZONE", 7),
  ...setupFieldSelectorZones("MONSTERZONE", 7),
  ...setupFieldSelectorZones("DECK", 1),
  ...setupFieldSelectorZones("EXTRA", 1),
  ...setupFieldSelectorZones("GRAVE", 1),
  ...setupFieldSelectorZones("BANISHED", 1)
];
function forceFieldSelectionRender(controller) {
  controller?.store?.emit?.({ action: "RENDER" });
}
function disableFieldSelection(controller) {
  if (!controller?.state) {
    return;
  }
  controller.state.activeZones = [];
  forceFieldSelectionRender(controller);
}
function selectFieldZones(controller, query) {
  if (!controller?.state) {
    return;
  }
  controller.state.activeZones = (query?.zones || []).reduce((activeZones, zone) => {
    const player = resolveCanonicalZonePlayer(zone.player, query), uuid = `selector-player_${player}-${zone.location}-${zone.index}`;
    if (FIELD_SELECTOR_ZONES.some((fieldZone) => fieldZone.uid === uuid)) {
      activeZones.push(uuid);
    }
    return activeZones;
  }, []);
  forceFieldSelectionRender(controller);
}

// server/ui/services/duel-field-viewport.service.js
function resolveDocument(dependencies) {
  return dependencies.document || globalThis.document;
}
function resolveWindow(dependencies) {
  return dependencies.window || globalThis.window;
}
function getElementCenter(element) {
  const rect = element?.getBoundingClientRect?.();
  if (!rect) {
    return null;
  }
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}
function createDuelFieldViewport(dependencies = {}) {
  function queryElements(selector) {
    const documentImpl = resolveDocument(dependencies);
    if (!documentImpl || typeof documentImpl.querySelectorAll !== "function") {
      return [];
    }
    return Array.from(documentImpl.querySelectorAll(selector));
  }
  function queryElement(selector) {
    const documentImpl = resolveDocument(dependencies);
    if (!documentImpl || typeof documentImpl.querySelector !== "function") {
      return null;
    }
    return documentImpl.querySelector(selector);
  }
  function getElementById(id) {
    const documentImpl = resolveDocument(dependencies);
    if (!documentImpl || typeof documentImpl.getElementById !== "function") {
      return null;
    }
    return documentImpl.getElementById(id);
  }
  function getNumericStyle(element, property) {
    const windowImpl = resolveWindow(dependencies);
    if (!windowImpl || typeof windowImpl.getComputedStyle !== "function") {
      return 0;
    }
    return Number.parseFloat(windowImpl.getComputedStyle(element)?.[property]) || 0;
  }
  function getCardElementByUid(uid) {
    if (!uid) {
      return null;
    }
    return queryElement(`.card[data-uid="${uid}"]`);
  }
  function getCardCenterByUid(uid) {
    return getElementCenter(getCardElementByUid(uid));
  }
  function getFieldRootCenter(fieldRootId = "automationduelfield") {
    return getElementCenter(getElementById(fieldRootId));
  }
  function getLpSlotCenter(player) {
    return getElementCenter(queryElement(`.lp-slot.p${player}`));
  }
  function getCardGhostStyle(uid) {
    const element = getCardElementByUid(uid), rect = element?.getBoundingClientRect?.();
    if (!rect) {
      return null;
    }
    const computedStyle = element ? resolveWindow(dependencies)?.getComputedStyle?.(element) : null;
    return {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: computedStyle?.transform && computedStyle.transform !== "none" ? computedStyle.transform : "",
      zIndex: 40
    };
  }
  return {
    getCardCenterByUid,
    getCardElementByUid,
    getCardGhostStyle,
    getFieldRootCenter,
    getLpSlotCenter,
    getNumericStyle,
    queryElement,
    queryElements
  };
}

// server/ui/components/duel/field.component.jsx
var defaultFieldViewport = createDuelFieldViewport();
function matchesFieldCardState(state, query) {
  if (!state || !query) {
    return false;
  }
  if (state.player !== Number(query.player)) {
    return false;
  }
  if (state.location !== query.location) {
    return false;
  }
  if (state.index !== Number(query.index)) {
    return false;
  }
  if (Number.isInteger(query.overlay_sequence)) {
    return Number(state.overlayindex || 0) === Number(query.overlay_sequence) + 1;
  }
  return true;
}
function setFieldCardImageState(cardImage, patch) {
  if (!cardImage?.state) {
    return;
  }
  cardImage.state = {
    ...cardImage.state,
    ...patch
  };
}
function removeFieldMapEntry(map, key) {
  const nextMap = { ...map };
  delete nextMap[key];
  return nextMap;
}
function setFieldZoneActive(zone, active) {
  if (!zone) {
    return zone;
  }
  if (Boolean(zone.active) === Boolean(active)) {
    return zone;
  }
  return {
    ...zone,
    active: Boolean(active)
  };
}
function normalizeFieldQuery(query) {
  if (!query || typeof query !== "object") {
    return null;
  }
  const player = Number(query.player), index = Number(query.index);
  if (!Number.isInteger(player) || typeof query.location !== "string" || !Number.isInteger(index)) {
    return null;
  }
  const output = {
    player,
    location: query.location,
    index
  };
  if (Number.isInteger(query.overlay_sequence)) {
    output.overlay_sequence = Number(query.overlay_sequence);
  } else if (Number.isInteger(query.overlayindex) && Number(query.overlayindex) > 0) {
    output.overlay_sequence = Number(query.overlayindex) - 1;
  }
  return output;
}
function FieldOverlayZone({ className, dataset = {}, style = {}, ariaHidden = null }) {
  return /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      className,
      "data-player": dataset.player,
      "data-location": dataset.location,
      "data-index": dataset.index,
      "data-uid": dataset.uid,
      "aria-hidden": ariaHidden,
      style
    }
  );
}
var fieldMethods = {
  normalizeActionSpinnerLocation(location) {
    if (location === "BANISH" || location === "BANISHED") {
      return "BANISHED";
    }
    return location;
  },
  getActionSpinnerKey(player, location, index = null) {
    return `action-spinner-player_${player}-${location}-${index === null ? "pile" : index}`;
  },
  getActionSpinnerDescriptors() {
    const descriptors = [];
    ["EXTRA", "GRAVE", "BANISHED"].forEach((location) => {
      for (let player = 0; player <= 1; player += 1) {
        descriptors.push({ player, location });
      }
    });
    ["MONSTERZONE", "SPELLZONE"].forEach((location) => {
      const maxIndex = location === "MONSTERZONE" ? 7 : 8;
      for (let player = 0; player <= 1; player += 1) {
        for (let index = 0; index < maxIndex; index += 1) {
          descriptors.push({ player, location, index });
        }
      }
    });
    return descriptors;
  },
  createActionSpinnerState() {
    const spinners = {};
    this.getActionSpinnerDescriptors().forEach(({ player, location, index }) => {
      spinners[this.getActionSpinnerKey(player, location, index ?? null)] = false;
    });
    return spinners;
  },
  getPileSnapshotKey(player, location) {
    return `${Number(player)}:${location}`;
  },
  rememberHydratedPiles(update) {
    const views = Array.isArray(update) ? update : [update];
    views.forEach((view, fallbackPlayer) => {
      if (!view || typeof view !== "object") {
        return;
      }
      Object.keys(view).forEach((location) => {
        const cards = Array.isArray(view[location]) ? view[location] : [];
        if (!cards.length) {
          return;
        }
        const snapshot = cards.map((card, fallbackIndex) => {
          const player = Number.isInteger(Number(card?.player)) ? Number(card.player) : Number(fallbackPlayer), index = Number.isInteger(Number(card?.index)) ? Number(card.index) : Number(fallbackIndex), [cardImage] = this.findPrimaryCardImages({
            player,
            location,
            index
          }), existingState = cardImage?.state || {};
          return {
            ...existingState,
            ...card,
            player,
            location,
            index,
            status: card?.status || existingState.status || "revealed"
          };
        });
        if (snapshot.length) {
          this.state.pileSnapshots[this.getPileSnapshotKey(snapshot[0].player, location)] = snapshot;
        }
      });
    });
  },
  buildActionSpinners() {
    function makeActionZone(player, location, index = null) {
      const key = this.getActionSpinnerKey(player, location, index), enabled = Boolean(this.state.actionSpinners[key]);
      return /* @__PURE__ */ import_react13.default.createElement(
        FieldOverlayZone,
        {
          key,
          className: [
            `p${player}`,
            location,
            Number.isInteger(index) ? `i${index}` : null,
            "actcover",
            enabled ? "enabled" : "disabled"
          ].filter(Boolean).join(" ")
        }
      );
    }
    return this.getActionSpinnerDescriptors().map(
      ({ player, location, index }) => makeActionZone.call(this, player, location, index ?? null)
    );
  },
  clearHydratedPiles(update) {
    const views = Array.isArray(update) ? update : [update];
    views.forEach((view, fallbackPlayer) => {
      if (!view || typeof view !== "object") {
        return;
      }
      Object.keys(view).forEach((location) => {
        const cards = Array.isArray(view[location]) ? view[location] : [];
        if (!cards.length) {
          return;
        }
        const firstCard = cards[0] || {}, player = Number.isInteger(Number(firstCard?.player)) ? Number(firstCard.player) : Number(fallbackPlayer);
        delete this.state.pileSnapshots[this.getPileSnapshotKey(player, location)];
      });
    });
  },
  getCardMetadata(cardId) {
    if (!Array.isArray(this.databaseSystem) || !cardId) {
      return {};
    }
    return this.databaseSystem.find((entry) => entry.id === cardId) || {};
  },
  cast(field, callback) {
    Object.keys(field).forEach((zone) => {
      field[zone].forEach(callback);
      field[zone].forEach(callback);
    });
  },
  collectCards(field) {
    const cards = [];
    if (Array.isArray(field)) {
      field.forEach((view) => {
        if (view && typeof view === "object") {
          this.cast(view, (card) => cards.push(card));
        }
      });
      return cards;
    }
    if (field && typeof field === "object") {
      this.cast(field, (card) => cards.push(card));
    }
    return cards;
  },
  buildFieldDisabledZones(zoneType, count) {
    const zones = [];
    for (let player = 0; player <= 1; player += 1) {
      for (let index = 0; index < count; index += 1) {
        zones.push({
          active: false,
          index,
          location: zoneType,
          player,
          uid: `field-disabled-player_${player}-${zoneType}-${index}`
        });
      }
    }
    return zones;
  },
  createFieldDisabledState() {
    const disabledZones = {}, zones = [].concat(this.buildFieldDisabledZones("MONSTERZONE", 7)).concat(this.buildFieldDisabledZones("SPELLZONE", 8));
    zones.forEach((zone) => {
      disabledZones[zone.uid] = zone;
    });
    return disabledZones;
  },
  scheduleEnterFade(cardImage, duration = 240) {
    if (!cardImage) {
      return;
    }
    if (cardImage.__enterFadeTimer) {
      clearTimeout(cardImage.__enterFadeTimer);
    }
    setFieldCardImageState(cardImage, { enterFade: true });
    cardImage.__enterFadeTimer = setTimeout(() => {
      setFieldCardImageState(cardImage, { enterFade: void 0 });
      cardImage.__enterFadeTimer = null;
      this.store.emit({ action: "RENDER" });
    }, duration);
  },
  queueExitFade(cardImage, duration = 220) {
    if (!cardImage?.state?.uid) {
      return;
    }
    const ghostStyle = this.viewport.getCardGhostStyle(cardImage.state.uid), ghostKey = `${cardImage.state.uid}-ghost-${Date.now()}-${Math.random().toString(16).slice(2)}`, ghost = CardImageState({
      state: Object.assign({}, cardImage.state, {
        uid: ghostKey,
        ghostOverlay: true,
        ghostStyle,
        exitFade: true
      })
    });
    this.state = {
      ...this.state,
      fadeCards: {
        ...this.state.fadeCards,
        [ghostKey]: ghost
      }
    };
    const cleanupTimer = setTimeout(() => {
      this.state = {
        ...this.state,
        fadeCards: removeFieldMapEntry(this.state.fadeCards, ghostKey)
      };
      this.fadeCleanupTimers.delete(cleanupTimer);
      this.store.emit({ action: "RENDER" });
    }, duration);
    this.fadeCleanupTimers.add(cleanupTimer);
  },
  syncField(field, replace = false) {
    const cards = this.collectCards(field).filter(
      (card) => card && card.location !== "INMATERIAL"
    ), previousCards = this.state.cards, nextCards = replace ? {} : this.state.cards, seenUids = /* @__PURE__ */ new Set();
    cards.forEach((card) => {
      let dbEntry = {};
      seenUids.add(card.uid);
      if (replace && previousCards[card.uid] && !nextCards[card.uid]) {
        nextCards[card.uid] = previousCards[card.uid];
      }
      if (!nextCards[card.uid]) {
        dbEntry = this.getCardMetadata(card.id);
        nextCards[card.uid] = CardImageState(
          { state: Object.assign({}, dbEntry, card) }
        );
        if (replace && this.fieldPrimed) {
          this.scheduleEnterFade(nextCards[card.uid]);
        }
      }
      if (nextCards[card.uid].state.id !== card.id) {
        dbEntry = this.getCardMetadata(card.id);
      }
      nextCards[card.uid].state = {
        ...nextCards[card.uid].state,
        ...dbEntry,
        ...card
      };
    });
    if (replace && this.fieldPrimed) {
      Object.keys(previousCards).forEach((uid) => {
        if (!seenUids.has(uid)) {
          this.queueExitFade(previousCards[uid]);
        }
      });
    }
    if (replace) {
      this.state = {
        ...this.state,
        cards: nextCards
      };
      this.fieldPrimed = true;
    }
    const count = {
      0: 0,
      1: 0
    };
    Object.keys(this.state.cards).forEach((uid) => {
      const cardImage = this.state.cards[uid];
      if (cardImage?.state?.location === "HAND") {
        count[cardImage.state.player] += 1;
      }
    });
    Object.keys(this.state.cards).forEach((uid) => {
      const cardImage = this.state.cards[uid];
      if (cardImage?.state?.location === "HAND") {
        setFieldCardImageState(cardImage, {
          handLocation: count[cardImage.state.player]
        });
      }
    });
    if (this.hoveredRelationSource) {
      this.applyRelationHighlights(this.hoveredRelationSource);
    }
  },
  updateField(update) {
    this.clearHydratedPiles(update);
    this.syncField(update, false);
  },
  hydrateField(update) {
    const views = Array.isArray(update) ? update : [update];
    let changed = false;
    this.rememberHydratedPiles(update);
    views.forEach((view, fallbackPlayer) => {
      if (!view || typeof view !== "object") {
        return;
      }
      Object.keys(view).forEach((location) => {
        const cards = Array.isArray(view[location]) ? view[location] : [];
        cards.forEach((card, fallbackIndex) => {
          const player = Number.isInteger(Number(card?.player)) ? Number(card.player) : Number(fallbackPlayer), index = Number.isInteger(Number(card?.index)) ? Number(card.index) : Number(fallbackIndex), [cardImage] = this.findPrimaryCardImages({
            player,
            location,
            index
          });
          if (!cardImage?.state) {
            return;
          }
          const dbEntry = this.getCardMetadata(card.id);
          setFieldCardImageState(cardImage, {
            ...dbEntry,
            ...card
          });
          changed = true;
        });
      });
    });
    if (changed) {
      this.store.emit({ action: "RENDER" });
    }
  },
  replaceField(update) {
    this.state = {
      ...this.state,
      pileSnapshots: {}
    };
    this.syncField(update, true);
  },
  setDisabledZones(zones = []) {
    const activeZoneKeys = new Set(
      (Array.isArray(zones) ? zones : []).map(
        (zone) => `field-disabled-player_${Number(zone?.player ?? 0)}-${zone?.location}-${Number(zone?.index ?? 0)}`
      )
    );
    let changed = false;
    const nextDisabledZones = {};
    Object.keys(this.state.disabledZones).forEach((uid) => {
      const nextZone = setFieldZoneActive(
        this.state.disabledZones[uid],
        activeZoneKeys.has(uid)
      );
      if (nextZone !== this.state.disabledZones[uid]) {
        changed = true;
      }
      nextDisabledZones[uid] = nextZone;
    });
    if (!changed) {
      return;
    }
    this.state = {
      ...this.state,
      disabledZones: nextDisabledZones
    };
    this.store.emit({ action: "RENDER" });
  },
  findCardImages(query) {
    return Object.values(this.state.cards).filter(
      (cardImage) => matchesFieldCardState(cardImage?.state, query)
    );
  },
  findPrimaryCardImages(query) {
    const normalized = normalizeFieldQuery(query);
    if (!normalized) {
      return [];
    }
    return Object.values(this.state.cards).filter((cardImage) => {
      if (!matchesFieldCardState(cardImage?.state, normalized)) {
        return false;
      }
      if (Number.isInteger(normalized.overlay_sequence)) {
        return true;
      }
      return Number(cardImage?.state?.overlayindex || 0) === 0;
    });
  },
  getCardElement(query) {
    const [cardImage] = this.findPrimaryCardImages(query);
    if (!cardImage?.state?.uid) {
      return null;
    }
    return this.viewport.getCardElementByUid(cardImage.state.uid);
  },
  getViewportCenter(query) {
    const [cardImage] = this.findPrimaryCardImages(query);
    if (!cardImage?.state?.uid) {
      return null;
    }
    return this.viewport.getCardCenterByUid(cardImage.state.uid);
  },
  getPileViewportCenter(player, location) {
    const cards = Object.values(this.state.cards).filter(
      (cardImage) => cardImage?.state?.player === Number(player) && cardImage?.state?.location === location && Number(cardImage?.state?.overlayindex || 0) === 0
    ).sort(
      (first, second) => Number(second?.state?.index || 0) - Number(first?.state?.index || 0)
    ), topCard = cards[0];
    if (topCard) {
      return this.viewport.getCardCenterByUid(topCard.state.uid);
    }
    return this.viewport.getFieldRootCenter("automationduelfield");
  },
  getDirectAttackViewportCenter(attackingPlayer = 0) {
    return this.viewport.getLpSlotCenter(attackingPlayer ? 0 : 1) || this.getPileViewportCenter(attackingPlayer ? 0 : 1, "DECK");
  },
  clearRelationHighlights() {
    this.hoveredRelationSource = null;
    Object.values(this.state.cards).forEach((cardImage) => {
      setFieldCardImageState(cardImage, {
        targetGlow: void 0,
        relationOverlay: void 0
      });
    });
  },
  applyRelationHighlights(query) {
    const normalized = normalizeFieldQuery(query), relatedTargets = [];
    this.clearRelationHighlights();
    if (!normalized) {
      return;
    }
    this.hoveredRelationSource = normalized;
    this.findPrimaryCardImages(normalized).forEach((cardImage) => {
      if (cardImage?.state?.equipCard) {
        setFieldCardImageState(cardImage, {
          relationOverlay: "equip"
        });
        relatedTargets.push(cardImage.state.equipCard);
      }
      if (Array.isArray(cardImage?.state?.cardTarget)) {
        cardImage.state.cardTarget.forEach((target) => {
          relatedTargets.push(target);
        });
      }
    });
    relatedTargets.forEach((target) => {
      this.findPrimaryCardImages(target).forEach((cardImage) => {
        setFieldCardImageState(cardImage, {
          targetGlow: true
        });
      });
    });
  },
  findCardImagesByChainIndex(chainIndex) {
    return Object.values(this.state.cards).filter(
      (cardImage) => Number(cardImage?.state?.chainOverlay?.index) === Number(chainIndex)
    );
  },
  updateChainOverlay(contract) {
    if (contract?.phase === "end") {
      this.clearChainOverlays();
      return;
    }
    const overlays = contract?.source ? this.findCardImages(contract.source) : this.findCardImagesByChainIndex(contract?.chainIndex), status = typeof contract?.phase === "string" ? contract.phase : "queued", chainIndex = Number(contract?.chainIndex || 0);
    overlays.forEach((cardImage) => {
      setFieldCardImageState(cardImage, {
        chainOverlay: {
          index: chainIndex,
          status
        }
      });
    });
    if (overlays.length) {
      this.store.emit({ action: "RENDER" });
    }
  },
  clearChainOverlays() {
    Object.values(this.state.cards).forEach((cardImage) => {
      setFieldCardImageState(cardImage, {
        chainOverlay: void 0
      });
    });
    this.store.emit({ action: "RENDER" });
  },
  pulseSelectionCards(cards = [], duration = 900) {
    const visibleDuration = Math.max(90, Number(duration || 900));
    const seen = /* @__PURE__ */ new Set();
    (Array.isArray(cards) ? cards : []).forEach((query) => {
      this.findCardImages(query).forEach((cardImage) => {
        if (!cardImage?.state?.uid || seen.has(cardImage.state.uid)) {
          return;
        }
        seen.add(cardImage.state.uid);
        if (cardImage.__selectionPulseTimer) {
          clearTimeout(cardImage.__selectionPulseTimer);
        }
        setFieldCardImageState(cardImage, {
          selectionPulse: true
        });
        cardImage.__selectionPulseTimer = setTimeout(() => {
          setFieldCardImageState(cardImage, {
            selectionPulse: void 0
          });
          cardImage.__selectionPulseTimer = null;
          this.store.emit({ action: "RENDER" });
        }, visibleDuration);
      });
    });
    if (seen.size) {
      this.store.emit({ action: "RENDER" });
    }
  },
  pulseTargetCards(cards = [], duration = 900) {
    const visibleDuration = Math.max(90, Number(duration || 900));
    const seen = /* @__PURE__ */ new Set();
    (Array.isArray(cards) ? cards : []).forEach((query) => {
      this.findCardImages(query).forEach((cardImage) => {
        if (!cardImage?.state?.uid || seen.has(cardImage.state.uid)) {
          return;
        }
        seen.add(cardImage.state.uid);
        if (cardImage.__targetPulseTimer) {
          clearTimeout(cardImage.__targetPulseTimer);
        }
        setFieldCardImageState(cardImage, {
          targetPulse: true
        });
        cardImage.__targetPulseTimer = setTimeout(() => {
          setFieldCardImageState(cardImage, {
            targetPulse: void 0
          });
          cardImage.__targetPulseTimer = null;
          this.store.emit({ action: "RENDER" });
        }, visibleDuration);
      });
    });
    if (seen.size) {
      this.store.emit({ action: "RENDER" });
    }
  },
  pulseAnnouncementCards(cards = [], duration = 1e3) {
    const visibleDuration = Math.max(1e3, Number(duration || 1e3));
    const seen = /* @__PURE__ */ new Set();
    (Array.isArray(cards) ? cards : []).forEach((query) => {
      this.findCardImages(query).forEach((cardImage) => {
        if (!cardImage?.state?.uid || seen.has(cardImage.state.uid)) {
          return;
        }
        seen.add(cardImage.state.uid);
        if (cardImage.__announcementFlashTimer) {
          clearTimeout(cardImage.__announcementFlashTimer);
        }
        setFieldCardImageState(cardImage, {
          flashCover: true
        });
        cardImage.__announcementFlashTimer = setTimeout(() => {
          setFieldCardImageState(cardImage, {
            flashCover: void 0
          });
          cardImage.__announcementFlashTimer = null;
          this.store.emit({ action: "RENDER" });
        }, visibleDuration);
      });
    });
    if (seen.size) {
      this.store.emit({ action: "RENDER" });
    }
  },
  pulseBattleOverlay(source, target, duration = 700) {
    const pulse = (query, role) => {
      this.findCardImages(query).forEach((cardImage) => {
        if (cardImage.__battlePulseTimer) {
          clearTimeout(cardImage.__battlePulseTimer);
        }
        setFieldCardImageState(cardImage, {
          battlePulse: role
        });
        cardImage.__battlePulseTimer = setTimeout(() => {
          setFieldCardImageState(cardImage, {
            battlePulse: void 0
          });
          cardImage.__battlePulseTimer = null;
          this.store.emit({ action: "RENDER" });
        }, duration);
      });
    };
    pulse(source, "source");
    pulse(target, "target");
    this.store.emit({ action: "RENDER" });
  },
  setPileCommandHints(hints = []) {
    const activeHints = new Set(
      (Array.isArray(hints) ? hints : []).filter((hint) => hint?.location).map((hint) => `${Number(hint.player ?? 0)}:${hint.location}`)
    );
    let changed = false;
    Object.values(this.state.cards).forEach((cardImage) => {
      const state = cardImage?.state;
      if (!state?.location) {
        return;
      }
      const shouldHint = activeHints.has(
        `${Number(state.player ?? 0)}:${state.location}`
      );
      if (shouldHint) {
        if (!state.commandHintPulse) {
          setFieldCardImageState(cardImage, {
            commandHintPulse: true
          });
          changed = true;
        }
        return;
      }
      if (state.commandHintPulse) {
        setFieldCardImageState(cardImage, {
          commandHintPulse: void 0
        });
        changed = true;
      }
    });
    if (changed) {
      this.store.emit({ action: "RENDER" });
    }
  },
  setActionSpinners(hints = []) {
    const activeHints = new Set(
      (Array.isArray(hints) ? hints : []).filter((hint) => hint?.location).map(
        (hint) => this.getActionSpinnerKey(
          Number(hint.player ?? 0),
          this.normalizeActionSpinnerLocation(hint.location),
          Number.isInteger(Number(hint.index)) ? Number(hint.index) : null
        )
      )
    );
    let changed = false;
    const nextActionSpinners = {
      ...this.state.actionSpinners
    };
    Object.keys(this.state.actionSpinners).forEach((key) => {
      const shouldEnable = activeHints.has(key);
      if (this.state.actionSpinners[key] !== shouldEnable) {
        nextActionSpinners[key] = shouldEnable;
        changed = true;
      }
    });
    if (changed) {
      this.state = {
        ...this.state,
        actionSpinners: nextActionSpinners
      };
      this.store.emit({ action: "RENDER" });
    }
  },
  getStackCards(query) {
    const normalized = normalizeFieldQuery(query);
    if (!normalized) {
      return [];
    }
    return Object.values(this.state.cards).filter(
      (cardImage) => cardImage?.state?.player === normalized.player && cardImage?.state?.location === normalized.location && cardImage?.state?.index === normalized.index
    ).sort(
      (first, second) => Number(first?.state?.overlayindex || 0) - Number(second?.state?.overlayindex || 0)
    );
  },
  getStackHost(query) {
    const host = this.getStackCards(query).find(
      (cardImage) => Number(cardImage?.state?.overlayindex || 0) === 0
    );
    return host?.state ? Object.assign({}, host.state) : null;
  },
  getOverlayViewerDeck(query) {
    return this.getStackCards(query).filter((cardImage) => Number(cardImage?.state?.overlayindex || 0) > 0).map((cardImage, materialIndex) => ({
      id: cardImage.state.id,
      uid: cardImage.state.uid,
      player: cardImage.state.player,
      location: "OVERLAY",
      index: materialIndex,
      type: cardImage.state.type,
      setcode: cardImage.state.setcode,
      position: cardImage.state.position,
      status: "revealed",
      name: cardImage.state.name,
      overlayindex: cardImage.state.overlayindex,
      hostLocation: cardImage.state.location,
      hostIndex: cardImage.state.index
    }));
  },
  disableSelection() {
    disableFieldSelection(this.state.selectors);
  },
  select(query) {
    selectFieldZones(this.state.selectors, query);
  },
  phase(value) {
    updatePhaseIndicator(this.state.phase, {
      phase: normalizePhaseIndicatorUpdate(value),
      battlephase: void 0,
      mainphase2: void 0,
      endphase: void 0
    });
  },
  getDeck(player, location) {
    const deck = Object.keys(this.state.cards).filter((guid) => {
      var cardImage = this.state.cards[guid];
      return cardImage.state.location === location && cardImage.state.player === player;
    }).map((guid) => {
      var cardImage = this.state.cards[guid];
      return {
        id: cardImage.state.id,
        uid: cardImage.state.uid,
        player: cardImage.state.player,
        location: cardImage.state.location,
        index: cardImage.state.index,
        type: cardImage.state.type,
        setcode: cardImage.state.setcode,
        position: cardImage.state.position,
        status: "revealed",
        name: cardImage.state.name
      };
    }).sort(
      (first, second) => Number(first.index || 0) - Number(second.index || 0)
    );
    const snapshot = this.state.pileSnapshots[this.getPileSnapshotKey(player, location)];
    if (!Array.isArray(snapshot) || !snapshot.length) {
      return deck;
    }
    const merged = /* @__PURE__ */ new Map();
    deck.forEach((card) => {
      merged.set(Number(card.index || 0), card);
    });
    snapshot.forEach((card) => {
      merged.set(Number(card.index || 0), {
        ...merged.get(Number(card.index || 0)) || {},
        ...card,
        player: Number.isInteger(Number(card?.player)) ? Number(card.player) : player,
        location: card?.location || location,
        index: Number.isInteger(Number(card?.index)) ? Number(card.index) : Number(merged.size),
        status: card?.status || "revealed"
      });
    });
    return Array.from(merged.values()).sort(
      (first, second) => Number(first.index || 0) - Number(second.index || 0)
    );
  },
  dispose() {
    this.fadeCleanupTimers.forEach((timer) => clearTimeout(timer));
    this.fadeCleanupTimers.clear();
    Object.values(this.state.cards).forEach((cardImage) => {
      if (cardImage?.__enterFadeTimer) {
        clearTimeout(cardImage.__enterFadeTimer);
        cardImage.__enterFadeTimer = null;
      }
      if (cardImage?.__selectionPulseTimer) {
        clearTimeout(cardImage.__selectionPulseTimer);
        cardImage.__selectionPulseTimer = null;
      }
      if (cardImage?.__targetPulseTimer) {
        clearTimeout(cardImage.__targetPulseTimer);
        cardImage.__targetPulseTimer = null;
      }
      if (cardImage?.__announcementFlashTimer) {
        clearTimeout(cardImage.__announcementFlashTimer);
        cardImage.__announcementFlashTimer = null;
      }
      if (cardImage?.__battlePulseTimer) {
        clearTimeout(cardImage.__battlePulseTimer);
        cardImage.__battlePulseTimer = null;
      }
    });
    this.state = {
      ...this.state,
      fadeCards: {}
    };
  }
};
function FieldState(state = {}, store, databaseSystem = [], dependencies = {}) {
  const controller = {
    store,
    databaseSystem,
    hoveredRelationSource: null,
    fieldPrimed: false,
    fadeCleanupTimers: /* @__PURE__ */ new Set(),
    viewport: dependencies.viewport || defaultFieldViewport
  };
  Object.assign(controller, fieldMethods);
  controller.state = {
    cards: {},
    fadeCards: {},
    pileSnapshots: {},
    actionSpinners: controller.createActionSpinnerState(),
    disabledZones: controller.createFieldDisabledState(),
    phase: {
      store,
      state: {
        opponentTurn: false,
        phase: normalizePhaseIndicatorUpdate(state?.info?.phase),
        battlephase: void 0,
        mainphase2: void 0,
        endphase: void 0
      }
    },
    selectors: {
      store,
      state: {
        activeZones: []
      }
    }
  };
  controller.replaceField(state?.field || {});
  return controller;
}

// server/ui/components/duel/sidechat.component.jsx
var import_react14 = __toESM(require_react(), 1);

// server/ui/components/duel/cardinfo.component.jsx
var import_react15 = __toESM(require_react(), 1);
var stMap = {
  2: "",
  4: "",
  130: " / Ritual",
  65538: " / Quick-Play",
  131074: " / Continuous",
  131076: " / Continuous",
  262146: " / Equip",
  524290: " / Field",
  1048580: " / Counter"
};
var fieldspell = {
  524290: " / Field"
};
var monsterMap = {
  17: "Normal",
  33: "Effect",
  65: "Fusion",
  97: "Fusion / Effect",
  129: "Ritual",
  161: "Ritual / Effect",
  545: "Spirit",
  673: "Ritual / Spirit / Effect",
  1057: "Union",
  2081: "Gemini / Effect",
  4113: "Tuner",
  4129: "Tuner / Effect",
  4161: "Fusion / Tuner",
  8193: "Synchro",
  8225: "Synchro / Effect",
  12321: "Synchro / Tuner / Effect",
  16401: "Token",
  2097185: "Flip / Effect",
  2101281: "Flip / Tuner / Effect",
  4194337: "Toon / Effect",
  8388609: "Xyz",
  8388641: "Xyz / Effect",
  16777233: "Pendulum / Normal",
  16777249: "Pendulum / Effect",
  16777313: "Fusion / Pendulum / Effect",
  16781313: "Pendulum / Tuner / Normal",
  16781345: "Pendulum / Tuner / Effect",
  16785441: "Synchro / Pendulum / Effect",
  18874401: "Pendulum / Flip / Effect",
  25165857: "Xyz / Pendulum / Effect",
  33554465: "Link / Effect",
  67108865: "Link"
};
var pendulumMap = {
  16777233: "Pendulum",
  16777249: "Pendulum / Effect",
  16777313: "Fusion / Pendulum / Effect",
  16781313: "Pendulum / Tuner / Normal",
  16781345: "Pendulum / Tuner / Effect",
  16785441: "Synchro / Pendulum / Effect",
  18874401: "Pendulum / Flip / Effect",
  25165857: "Xyz / Pendulum / Effect"
};
function updateCardInfo(controller, { id }) {
  controller.id = id;
  controller.info = controller.databaseSystem.find((entry) => entry.id === id) || {};
  return controller.info;
}
function disposeCardInfo(controller) {
  return controller;
}
function createCardInfoController(databaseSystem = []) {
  const controller = {
    databaseSystem,
    id: void 0,
    info: {}
  };
  controller.update = ({ id }) => updateCardInfo(controller, { id });
  controller.dispose = () => disposeCardInfo(controller);
  return controller;
}
function CardInfo(databaseSystem = []) {
  return createCardInfoController(databaseSystem);
}

// server/ui/components/duel/lifepoint.component.jsx
var import_react16 = __toESM(require_react(), 1);
function createLifepointState(state = {}) {
  const nextState = Object.assign({
    lifepoints: [8e3, 8e3],
    turn: 1,
    names: ["Player 1", "Player 2"],
    lpDeltas: {
      0: void 0,
      1: void 0
    },
    playerHints: {
      0: [],
      1: []
    },
    waiting: false
  }, state);
  return {
    ...nextState,
    maxLifepoints: Math.max(
      Number(nextState?.lifepoints?.[0]) || 0,
      Number(nextState?.lifepoints?.[1]) || 0,
      Number(nextState?.maxLifepoints || 0),
      8e3
    )
  };
}
function resolveLifepointStore(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function resolveLifepointController(target) {
  if (target?.state || target?.waiting !== void 0) {
    return target;
  }
  return target?.controller;
}
function normalizeLifepointUpdate(current, update = {}) {
  const nextState = {
    ...current,
    ...update,
    lpDeltas: update.lpDeltas || current.lpDeltas || {
      0: void 0,
      1: void 0
    },
    playerHints: update.playerHints || current.playerHints || {
      0: [],
      1: []
    }
  }, nextMax = Math.max(
    Number(nextState?.lifepoints?.[0]) || 0,
    Number(nextState?.lifepoints?.[1]) || 0,
    Number(current?.maxLifepoints || 0),
    8e3
  );
  return {
    ...nextState,
    maxLifepoints: nextMax
  };
}
function updateLifepointState(target, state) {
  const controller = resolveLifepointController(target), resolvedStore = resolveLifepointStore(target);
  if (!controller || !state) {
    return;
  }
  const currentState = createLifepointState({
    ...controller.state || {},
    waiting: Boolean(controller.waiting),
    maxLifepoints: controller.maxLifepoints
  });
  const nextState = normalizeLifepointUpdate(currentState, state);
  controller.state = {
    lifepoints: nextState.lifepoints,
    turn: nextState.turn,
    names: nextState.names,
    lpDeltas: nextState.lpDeltas,
    playerHints: nextState.playerHints
  };
  controller.maxLifepoints = nextState.maxLifepoints;
  resolvedStore?.emit?.({
    action: "UPDATE_LIFEPOINTS",
    state: nextState
  });
}
function pulseLifepointDelta(target, player, value, tone = "damage", duration = 1300) {
  const controller = resolveLifepointController(target), resolvedStore = resolveLifepointStore(target), numericPlayer = Number(player || 0), numericValue = Number(value || 0);
  if (!controller || !numericValue) {
    return;
  }
  const nextDeltas = Object.assign({}, controller.state?.lpDeltas || {});
  nextDeltas[numericPlayer] = {
    value: numericValue,
    tone,
    token: Date.now()
  };
  controller.state.lpDeltas = nextDeltas;
  resolvedStore?.emit?.({
    action: "PULSE_LIFEPOINT_DELTA",
    state: {
      player: numericPlayer,
      value: numericValue,
      tone,
      duration: Math.max(500, Number(duration || 1300)),
      token: Date.now()
    }
  });
}
function disposeLifepointState(target) {
  const controller = resolveLifepointController(target), resolvedStore = resolveLifepointStore(target);
  if (controller) {
    controller.waiting = false;
    if (controller.state) {
      controller.state.lpDeltas = {
        0: void 0,
        1: void 0
      };
    }
  }
  resolvedStore?.emit?.({
    action: "RESET_LIFEPOINTS"
  });
}

// server/ui/components/duel/announce.card.component.jsx
var import_react17 = __toESM(require_react(), 1);
function resolveDialogStore6(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function closeAnnounceCardDialog(target) {
  resolveDialogStore6(target)?.emit?.({ action: "CLOSE_ANNOUNCE_CARD_DIALOG" });
}

// server/ui/components/duel/controls.component.jsx
var import_react18 = __toESM(require_react(), 1);

// server/ui/components/duel/controls.component.module.scss
var controls_component_module_default = ".root {}\n";

// server/ui/components/duel/controls.component.jsx
var buttonDetails = {
  activatable_cards: { text: "Activate", id: 6 },
  activates: { text: "Activate", id: 6 },
  summonable_cards: { text: "Normal Summon", id: 1 },
  summons: { text: "Normal Summon", id: 1 },
  spsummonable_cards: { text: "Special Summon", id: 2 },
  special_summons: { text: "Special Summon", id: 2 },
  repositionable_cards: { text: "Flip", id: 3 },
  pos_changes: { text: "Flip", id: 3 },
  msetable_cards: { text: "Set MZ", id: 4 },
  monster_sets: { text: "Set MZ", id: 4 },
  ssetable_cards: { text: "Set ST", id: 5 },
  spell_sets: { text: "Set ST", id: 5 },
  select_options: { text: "Select", id: 7 },
  attackable_cards: { text: "Attack", id: 8 },
  attacks: { text: "Attack", id: 8 },
  chains: { text: "Activate", id: 0 },
  view_materials: { text: "View", id: 9 },
  view_pile: { text: "View", id: 10 },
  activate_pile: { text: "Activate", id: 11 },
  spsummon_pile: { text: "Special Summon", id: 12 }
};
var commandOptionKeys = [
  "summonable_cards",
  "summons",
  "spsummonable_cards",
  "special_summons",
  "repositionable_cards",
  "pos_changes",
  "msetable_cards",
  "monster_sets",
  "ssetable_cards",
  "spell_sets",
  "activatable_cards",
  "activates",
  "select_options",
  "attackable_cards",
  "attacks",
  "chains"
];
var pileActivateOptionKeys = ["activatable_cards", "activates", "chains"];
var pileSpecialSummonOptionKeys = ["spsummonable_cards", "special_summons"];
var fieldActivateOptionKeys = ["activatable_cards", "activates", "chains"];
var viewerModeByCardType = Object.freeze({
  activate_pile: "activate",
  spsummon_pile: "spsummon",
  view_materials: "view",
  view_pile: "view"
});
function getViewerSlot(viewerSlot) {
  const fallbackViewerSlot = typeof window !== "undefined" ? window.orientation || 0 : 0, resolvedViewerSlot = viewerSlot === void 0 ? fallbackViewerSlot : viewerSlot;
  return Number.isInteger(Number(resolvedViewerSlot)) ? Number(resolvedViewerSlot) : 0;
}
function checksetcode(obj, sc) {
  "use strict";
  var val = obj.setcode, hexA = val.toString(16), hexB = sc.toString(16);
  if (val === sc || parseInt(hexA.substr(hexA.length - 4), 16) === parseInt(hexB, 16) || parseInt(hexA.substr(hexA.length - 2), 16) === parseInt(hexB, 16) || (val >> 16).toString(16) === hexB) {
    return true;
  }
  return false;
}
function excludeTokens(card) {
  if (card.type === 16401 || card.type === 16417) {
    return false;
  }
  return true;
}
function hasKnownCardIdentity(id) {
  return !(id === void 0 || id === null || id === "" || id === "unknown");
}
function setControlButtonsState(controller, nextState) {
  controller.state = {
    ...controller.state,
    ...nextState
  };
}
function setControlButtonsInfo(controller, nextInfo) {
  controller.info = {
    ...controller.info,
    ...nextInfo
  };
}
function ControlActionButton({ text, onClick, className, style }) {
  return /* @__PURE__ */ import_react18.default.createElement(
    "button",
    {
      className,
      onClick,
      style
    },
    text
  );
}
function FloatingControlPanel({ coords, className, children }) {
  return /* @__PURE__ */ import_react18.default.createElement(
    "div",
    {
      style: {
        left: `${coords.x - 15}px`,
        top: `${coords.y - 15}px`,
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        textAlign: "center"
      },
      className: [controls_component_module_default.root, className].filter(Boolean).join(" ")
    },
    children
  );
}
function resolveViewerPlayer(player, viewerSlot = getViewerSlot()) {
  const normalizedPlayer = Number(player);
  if (!Number.isInteger(normalizedPlayer)) {
    return player;
  }
  return viewerSlot ? normalizedPlayer ? 0 : 1 : normalizedPlayer;
}
function commandOptionMatchesQuery(option, query, viewerSlot = getViewerSlot()) {
  if (!option || !query) {
    return false;
  }
  const queryPlayer = query.player === void 0 ? void 0 : resolveViewerPlayer(query.player, viewerSlot);
  return option.index === query.index && option.location === query.location && (option.player === void 0 || queryPlayer === void 0 || Number(option.player) === Number(queryPlayer)) && (option.id === void 0 || !hasKnownCardIdentity(option.id) || !hasKnownCardIdentity(query.id) || option.id === query.id);
}
function cardMatchesCommandFamilies(card, commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
  if (!card || !Array.isArray(commandOptions) || !commandFamilies.length) {
    return false;
  }
  return commandOptions.some(
    (option) => commandFamilies.includes(option?.type) && commandOptionMatchesQuery(option, card, viewerSlot)
  );
}
function optionMatchesPile(option, pileCard, viewerSlot = getViewerSlot()) {
  if (!option || !pileCard) {
    return false;
  }
  const pilePlayer = pileCard.player === void 0 ? void 0 : resolveViewerPlayer(pileCard.player, viewerSlot);
  return option.location === pileCard.location && (option.player === void 0 || pilePlayer === void 0 || Number(option.player) === Number(pilePlayer));
}
function annotatePileDeck(deck = [], commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
  return (Array.isArray(deck) ? deck : []).map((card) => ({
    ...card,
    actionable: cardMatchesCommandFamilies(card, commandOptions, commandFamilies, viewerSlot)
  }));
}
function buildPileActionDeck(deck = [], commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
  const cards = Array.isArray(deck) ? deck : [], pileCard = cards[0];
  if (!pileCard || !Array.isArray(commandOptions) || !commandFamilies.length) {
    return [];
  }
  return commandOptions.filter(
    (option) => commandFamilies.includes(option?.type) && optionMatchesPile(option, pileCard, viewerSlot)
  ).map((option) => {
    const matchedCard = cards.find((card) => commandOptionMatchesQuery(option, card, viewerSlot)) || cards.find(
      (card) => card?.location === option.location && Number(card?.index) === Number(option.index)
    ), resolvedId = hasKnownCardIdentity(option?.id) ? option.id : matchedCard?.id, viewerAnswer = {
      type: option.type,
      i: option.i
    };
    return {
      ...pileCard || {},
      ...matchedCard || {},
      ...resolvedId !== void 0 ? { id: resolvedId } : {},
      player: matchedCard?.player ?? pileCard.player,
      location: matchedCard?.location || pileCard.location,
      index: matchedCard?.index ?? option.index,
      actionable: true,
      viewerAnswer
    };
  }).filter((card) => card.viewerAnswer);
}
function getPileActionEntries(deck = [], commandOptions = [], viewerSlot = getViewerSlot()) {
  const cards = Array.isArray(deck) ? deck : [], resolvedViewerSlot = getViewerSlot(viewerSlot), list = [];
  if (!cards.length) {
    return list;
  }
  list.push({
    type: "view_pile",
    deck: annotatePileDeck(cards, commandOptions, commandOptionKeys, resolvedViewerSlot)
  });
  const activateDeck = buildPileActionDeck(cards, commandOptions, pileActivateOptionKeys, resolvedViewerSlot);
  if (activateDeck.length) {
    list.push({
      type: "activate_pile",
      deck: activateDeck
    });
  }
  const specialSummonDeck = buildPileActionDeck(cards, commandOptions, pileSpecialSummonOptionKeys, resolvedViewerSlot);
  if (specialSummonDeck.length) {
    list.push({
      type: "spsummon_pile",
      deck: specialSummonDeck
    });
  }
  return list;
}
function clickGameplayControlButton(store, card, uuid) {
  if (["view_materials", "view_pile", "activate_pile", "spsummon_pile"].includes(card.type)) {
    app.duel.closeRevealer();
    clearControlButtons(app.duel.controls);
    store.emit({
      action: "OPEN_IDLE_EXTRA_VIEWER",
      deck: Array.isArray(card.deck) ? card.deck : [],
      mode: viewerModeByCardType[card.type] || "view"
    });
    return;
  }
  store.emit({ action: "CONTROL_CLICK", card, uuid });
  app.duel.closeRevealer();
}
function GameplayControlButtonView({ store, card, info, uuid }) {
  return /* @__PURE__ */ import_react18.default.createElement(
    ControlActionButton,
    {
      key: info.text,
      onClick: () => clickGameplayControlButton(store, card, uuid),
      style: {
        display: "flex",
        width: "auto",
        zIndex: "350",
        textAlign: "center"
      },
      text: info.text
    }
  );
}
function getControlButtonsCommandOptions(controller) {
  return commandOptionKeys.flatMap(
    (type) => (Array.isArray(controller?.state?.[type]) ? controller.state[type] : []).map((option, index) => ({
      ...option,
      i: index,
      type
    }))
  );
}
function hasActionableControlCard(controller, query) {
  return getControlButtonsCommandOptions(controller).some((option) => commandOptionMatchesQuery(option, query));
}
function getActionableDeckForControls(controller, deck = []) {
  return annotatePileDeck(deck, getControlButtonsCommandOptions(controller), commandOptionKeys, getViewerSlot());
}
function getPileActionEntriesForControls(controller, deck = [], viewerSlot = getViewerSlot()) {
  return getPileActionEntries(deck, getControlButtonsCommandOptions(controller), viewerSlot);
}
function getIdleCommandPileHintsForControls(controller, viewerSlot = getViewerSlot()) {
  const localCanonicalPlayer = viewerSlot ? 1 : 0, pileLocations = new Set(
    getControlButtonsCommandOptions(controller).filter(
      (option) => ["EXTRA", "GRAVE", "BANISHED"].includes(option?.location) && (option.player === void 0 || Number(option.player) === 0)
    ).map((option) => option.location)
  );
  return Array.from(pileLocations).map((location) => ({
    player: localCanonicalPlayer,
    location
  }));
}
function getIdleCommandPileActionCoversForControls(controller, viewerSlot = getViewerSlot()) {
  const localCanonicalPlayer = viewerSlot ? 1 : 0, pileLocations = new Set(
    getControlButtonsCommandOptions(controller).filter(
      (option) => ["EXTRA", "GRAVE", "BANISHED"].includes(option?.location) && (option.player === void 0 || Number(option.player) === 0) && (pileActivateOptionKeys.includes(option?.type) || pileSpecialSummonOptionKeys.includes(option?.type))
    ).map((option) => option.location)
  );
  return Array.from(pileLocations).map((location) => ({
    player: localCanonicalPlayer,
    location
  }));
}
function getIdleCommandFieldActionCoversForControls(controller, viewerSlot = getViewerSlot()) {
  const localCanonicalPlayer = viewerSlot ? 1 : 0, seen = /* @__PURE__ */ new Set();
  return getControlButtonsCommandOptions(controller).filter(
    (option) => ["MONSTERZONE", "SPELLZONE"].includes(option?.location) && (option.player === void 0 || Number(option.player) === 0) && fieldActivateOptionKeys.includes(option?.type) && Number.isInteger(Number(option?.index))
  ).map((option) => ({
    player: localCanonicalPlayer,
    location: option.location,
    index: Number(option.index)
  })).filter((hint) => {
    const key = `${hint.player}:${hint.location}:${hint.index}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
function hideControlZones(controller) {
  const zones = controller?.state?.zones;
  if (!zones) {
    return;
  }
  setControlButtonsState(controller, {
    zones: Object.fromEntries(
      Object.entries(zones).map(([uid, zone]) => [
        uid,
        zone ? {
          ...zone,
          state: {
            ...zone.state,
            active: false
          }
        } : zone
      ])
    )
  });
}
function renderEnabledControlClasses(controller, enabledClasses, disabledClasses) {
  const buttons = [
    { text: "Flip Deck Over", options: ["filtered", "m-deck", "m-convulse"], onClick: function() {
      app.manualControls.manualFlipDeck();
    } },
    { text: "Reveal Deck", options: ["filtered", "m-deck"], onClick: function() {
      app.manualControls.manualRevealDeck();
    } },
    { text: "Reveal Top Card", options: ["filtered", "m-deck"], onClick: function() {
      app.manualControls.manualRevealTop();
    } },
    { text: "Reveal Bottom Card", options: ["filtered", "m-deck"], onClick: function() {
      app.manualControls.manualRevealBottom();
    } },
    { text: "Banish Top Card", options: ["filtered", "m-deck", "non-banish"], onClick: function() {
      app.manualControls.manualMillRemovedCard();
    } },
    { text: "Banish FaceDown", options: ["m-deck", "non-banish"], onClick: function() {
      app.manualControls.manualMillRemovedCardFaceDown();
    } },
    { text: "Excavate", options: ["filtered", "m-hand", "m-deck", "v-grave", "v-removed", "v-deck", "non-excavate"], onClick: function() {
      app.manualControls.manualToExcavate();
    } },
    { text: "Excavate Face-down", options: ["filtered", "m-deck"], onClick: function() {
      app.manualControls.manualExcavateTop();
    } },
    { text: "Shuffle Deck", options: ["m-deck"], onClick: function() {
      app.manualControls.manualShuffleDeck();
    } },
    { text: "View Deck", options: ["m-deck"], onClick: function() {
      app.manualControls.manualViewDeck();
    } },
    { text: "Mill", options: ["m-deck"], onClick: function() {
      app.manualControls.manualMill();
    } },
    { text: "Draw", options: ["m-deck"], onClick: function() {
      app.manualControls.manualDraw();
    } },
    { text: "View Graveyard", options: ["m-grave"], onClick: function() {
      app.manualControls.manualViewGrave();
    } },
    { text: "View Banished", options: ["m-removed"], onClick: function() {
      app.manualControls.manualViewBanished();
    } },
    { text: "View Extra Deck", options: ["m-extra", "m-extra-view"], onClick: function() {
      app.manualControls.manualViewExtra();
    } },
    { text: "Reveal Extra Deck", options: ["filtered", "m-extra"], onClick: function() {
      app.manualControls.manualRevealExtra();
    } },
    { text: "Reveal Random Card", options: ["filtered", "m-extra"], onClick: function() {
      app.manualControls.manualRevealExtraDeckRandom();
    } },
    { text: "View Excavated", options: ["m-excavated"], onClick: function() {
      app.manualControls.manualViewExcavated();
    } },
    { text: "Reveal Excavated", options: ["m-excavated"], onClick: function() {
      app.manualControls.manualRevealExcavated();
    } },
    { text: "Reveal Random Card", options: ["m-excavated"], onClick: function() {
      app.manualControls.manualRevealExcavatedRandom();
    } },
    { text: "To Bottom of Deck", options: ["filtered", "m-hand", "m-field", "st-field", "non-extra", "v-grave", "v-removed", "v-excavate", "non-deck"], onClick: function() {
      app.manualControls.manualToBottomOfDeck();
    } },
    { text: "To Top of Deck", options: ["m-hand", "m-field", "st-field", "non-extra", "v-grave", "v-removed", "v-excavate", "non-deck"], onClick: function() {
      app.manualControls.manualToTopOfDeck();
    } },
    { text: "To Opponents Hand", options: ["filtered", "m-hand", "m-field", "st-field", "non-extra"], onClick: function() {
      app.manualControls.manualToOpponentsHand();
    } },
    { text: "To Opponents Field", options: ["filtered", "m-hand", "m-field", "st-field", "v-deck ", "v-extra", "v-grave", "v-excavate", "v-removed"], onClick: function() {
      app.manualControls.manualToOpponent();
    } },
    { text: "Reveal", options: ["m-hand", "v-extra", "v-excavate"], onClick: function() {
      app.manualControls.manualRevealHandSingle();
    } },
    { text: "Banish", options: ["m-hand", "m-field", "st-field", "v-deck", "v-extra", "v-grave", "v-excavate"], onClick: function() {
      app.manualControls.manualToRemoved();
    } },
    { text: "Banish Face-down", options: ["filtered", "m-hand", "m-field", "st-field", "v-deck", "v-extra", "v-grave", "v-excavate"], onClick: function() {
      app.manualControls.manualToRemovedFacedown();
    } },
    { text: "To GY", options: ["m-hand", "m-field", "st-field", "v-deck", "v-removed", "v-extra", "v-excavate", "non-grave"], onClick: function() {
      app.manualControls.manualToGrave();
    } },
    { text: "Set in S/T", options: ["m-hand-st", "m-monster-st", "m-st-monster", "non-deck", "non-banished"], onClick: function() {
      app.manualControls.startSpellTargeting("set");
    } },
    { text: "Activate", options: ["m-hand-st"], onClick: function() {
      app.manualControls.startSpellTargeting("activate");
    } },
    { text: "To Hand", options: ["m-field", "st-field", "non-extra"], onClick: function() {
      app.manualControls.manualToHand();
    } },
    {
      text: "Reveal and Add to Hand",
      options: ["v-deck", "v-grave", "v-removed", "v-excavate", "v-extra-p non-extra"],
      onClick: function() {
        app.manualControls.manualToHand();
        app.manualControls.manualRevealHandSingle();
      }
    },
    { text: "To Extra Deck Face-up", options: ["m-hand-p", "m-monster-p", "m-monster-to-extra-faceup"], onClick: function() {
      app.manualControls.manualToExtraFaceUp();
    } },
    { text: "To Extra Deck", options: ["m-monster-extra", "v-monster-extra"], onClick: function() {
      app.manualControls.manualToExtra();
    } },
    { text: "SS in Defense", options: ["m-hand-m", "v-extra"], onClick: function() {
      app.manualControls.startSpecialSummon("def");
    } },
    { text: "SS in Attack", options: ["m-hand-m", "v-extra"], onClick: function() {
      app.manualControls.startSpecialSummon("atk");
    } },
    { text: "Set Monster", options: ["m-hand-m", "non-grave non-excavate", "non-banished", "non-deck"], onClick: function() {
      app.manualControls.startSpecialSummon("normaldef");
    } },
    { text: "Normal Summon", options: ["m-hand-m", "non-grave", "non-banished", "non-deck"], onClick: function() {
      app.manualControls.startSpecialSummon("normalatk");
    } },
    { text: "Activate Field Spell", options: ["m-hand-f"], onClick: function() {
      app.manualControls.manualActivateFieldSpell();
    } },
    { text: "Set Field Spell", options: ["m-hand-f"], onClick: function() {
      app.manualControls.manualActivateFieldSpellFaceDown();
    } },
    { text: "Flip Face-down", options: ["m-st"], onClick: function() {
      app.manualControls.manualSTFlipDown();
    } },
    { text: "Flip Face-up", options: ["m-st"], onClick: function() {
      app.manualControls.manualActivate();
    } },
    { text: "Move", options: ["m-monster", "m-st"], onClick: function() {
      app.manualControls.startSpecialSummon("generic");
    } },
    { text: "Add Counter", options: ["filtered", "m-monster", "m-st", "countercontroller"], onClick: function() {
      app.manualControls.manualAddCounter();
    } },
    { text: "Remove Counter", options: ["filtered", "m-monster", "m-st", "countercontroller"], onClick: function() {
      app.manualControls.manualRemoveCounter();
    } },
    { text: "View Xyz Materials", options: ["m-monster-xyz"], onClick: function() {
      app.manualControls.manualViewXYZMaterials();
    } },
    { text: "Overlay", options: ["m-monster", "m-monster-xyz", "v-monster-xyz"], onClick: function() {
      app.manualControls.startXYZSummon();
    } },
    { text: "Flip Face-up", options: ["m-monster", "toDefence"], onClick: function() {
      app.manualControls.manualToFaceUpDefence();
    } },
    { text: "Flip Face-down", options: ["m-monster"], onClick: function() {
      app.manualControls.manualToFaceDownDefence();
    } },
    { text: "To Attack", options: ["m-monster"], onClick: function() {
      app.manualControls.manualToAttack();
    } },
    { text: "To Defense", options: ["m-field", "toDefence"], onClick: function() {
      app.manualControls.manualToDefence();
    } },
    { text: "Remove Token", options: ["m-monster-token"], onClick: function() {
      app.manualControls.manualRemoveToken();
    } },
    { text: "To Left Pendulumn Zone", options: ["m-hand-p", "m-monster-p"], onClick: function() {
      app.manualControls.manualToPZoneL();
    } },
    { text: "To Right Pendulumn Zone", options: ["m-hand-p", "m-monster-p"], onClick: function() {
      app.manualControls.manualToPZoneR();
    } },
    { text: "Send to Deck Face-up", options: ["filtered", "m-parasite"], onClick: function() {
      app.manualControls.manualSendToDeckFaceup();
    } },
    { text: "Attack", options: ["a-field"], onClick: function() {
      app.manualControls.startAttack();
    } },
    { text: "Attack Directly", options: ["a-field"], onClick: function() {
      app.manualControls.manualAttackDirectly();
    } },
    { text: "Signal Effect", options: ["m-field", "st-field", "m-hand-m", "v-grave", "v-removed"], onClick: function() {
      app.manualControls.manualSignalEffect();
    } }
  ], elements = buttons.filter((button) => {
    return enabledClasses.some((prospect) => {
      return button.options.includes(prospect);
    });
  }).filter((button) => {
    return disabledClasses.every((prospect) => {
      return !button.options.includes(prospect);
    });
  }).map((button, i) => {
    const buttonClassName = button.options.join(" ");
    return /* @__PURE__ */ import_react18.default.createElement(
      ControlActionButton,
      {
        key: `mbutton${i}`,
        className: buttonClassName,
        onClick: button.onClick,
        style: {
          width: "auto",
          textAlign: "center"
        },
        text: button.text
      }
    );
  }).reverse();
  return /* @__PURE__ */ import_react18.default.createElement(
    FloatingControlPanel,
    {
      coords: controller.info.coords,
      className: controller.state.filter ? "button-filter" : "no-button-filter"
    },
    elements
  );
}
function manualDisplayControls(controller, query) {
  const enabledClasses = [], disabledClasses = [];
  if (query.location === "GRAVE") {
    if (query.status === "revealed") {
      enabledClasses.push("m-hand");
      if (monsterMap[query.type]) {
        enabledClasses.push("m-hand-m");
      }
      if ((stMap[query.type] || query.type === 2 || query.type === 4 || checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) && !fieldspell[query.type]) {
        enabledClasses.push("m-hand-st");
      }
      if (fieldspell[query.type]) {
        enabledClasses.push("m-hand-f");
      }
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
        enabledClasses.push("m-monster-p");
      }
      disabledClasses.push("non-grave");
    } else {
      enabledClasses.push("m-grave");
    }
    if (cardIs("link", query)) {
      disabledClasses.push("spdef");
    }
    if (pendulumMap[query.type]) {
      enabledClasses.push("m-monster-p");
    }
  }
  if (query.location === "MONSTERZONE") {
    enabledClasses.push("m-opponent");
    enabledClasses.push("m-field");
    enabledClasses.push("m-monster");
    if (cardIs("fusion", query) || cardIs("synchro", query) || cardIs("xyz", query) || cardIs("link", query)) {
      enabledClasses.push("m-monster-extra");
    }
    if (!(cardIs("fusion", query) || cardIs("synchro", query) || cardIs("xyz", query) || cardIs("link", query))) {
      enabledClasses.push("non-extra");
    }
    if (pendulumMap[query.type]) {
      enabledClasses.push("m-monster-p");
    }
    if (cardIs("xyz", query)) {
      enabledClasses.push("m-monster-xyz");
    }
    if (!excludeTokens(query)) {
      enabledClasses.push("m-monster-token");
      disabledClasses.push("non-extra", "m-monster-xyz", "non-deck", "non-banish", "non-hand", "overlayStack", "flipDownMonster", "banishcardfd", "non-grave");
    }
    if (checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) {
      enabledClasses.push("m-st-monster");
    }
    if (query.id === 27911549) {
      enabledClasses.push("m-parasite");
    }
    if (query.position === "FaceUpAttack") {
      enabledClasses.push("m-monster");
    }
    if (cardIs("link", query)) {
      disabledClasses.push("toDefence", "flipUpMonster", "flipDownMonster", "flipDown");
    }
    if (query.position === "FaceUpDefence") {
      disabledClasses.push("toDefence", "flipUpMonster");
    }
    if (!query.counters) {
      disabledClasses.push("#removeCounter");
    }
  }
  if (query.location === "SPELLZONE") {
    enabledClasses.push("st-field");
    if ((stMap[query.type] || query.type === 2 || query.type === 4) && !fieldspell[query.type]) {
      enabledClasses.push("m-st");
    }
    if (query.id === 62966332) {
      enabledClasses.push("m-convulse");
    }
    if (query.id === 63571750) {
      enabledClasses.push("m-pharaohstreasure");
    }
    if (pendulumMap[query.type]) {
      enabledClasses.push("m-monster-to-extra-faceup");
    }
  }
  if (query.location === "EXCAVATED") {
    if (query.status === "revealed") {
      enabledClasses.push("m-hand");
      if (monsterMap[query.type]) {
        enabledClasses.push("m-hand-m");
      }
      if ((stMap[query.type] || query.type === 2 || query.type === 4 || checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) && !fieldspell[query.type]) {
        enabledClasses.push("m-hand-st");
      }
      if (fieldspell[query.type]) {
        enabledClasses.push("m-hand-f");
      }
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
        enabledClasses.push("m-monster-p");
      }
    } else {
      enabledClasses.push("m-excavated");
    }
  }
  if (query.location === "EXTRA") {
    if (query.status === "revealed") {
      enabledClasses.push("v-removed");
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
        enabledClasses.push("m-monster-p");
      }
      if (monsterMap[query.type]) {
        enabledClasses.push("m-hand-m");
      }
      if ((stMap[query.type] || query.type === 2 || query.type === 4) && !fieldspell[query.type]) {
        enabledClasses.push("m-hand-st");
      }
      if (fieldspell[query.type]) {
        enabledClasses.push("m-hand-f");
      }
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
      }
      if (cardIs("fusion", query) || cardIs("synchro", query) || cardIs("xyz", query) || cardIs("link", query)) {
        enabledClasses.push("v-monster-extra");
      }
    } else {
      enabledClasses.push("m-extra-view");
      enabledClasses.push("m-extra");
      if (cardIs("link", query)) {
      }
    }
  }
  if (query.location === "BANISHED") {
    if (query.status === "revealed") {
      enabledClasses.push("v-removed");
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
        enabledClasses.push("m-monster-p");
      }
      if (monsterMap[query.type]) {
        enabledClasses.push("m-hand-m");
      }
      if ((stMap[query.type] || query.type === 2 || query.type === 4) && !fieldspell[query.type]) {
        enabledClasses.push("m-hand-st");
      }
      if (fieldspell[query.type]) {
        enabledClasses.push("m-hand-f");
      }
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
      }
      if (cardIs("fusion", query) || cardIs("synchro", query) || cardIs("xyz", query) || cardIs("link", query)) {
        enabledClasses.push("v-monster-extra");
      } else {
        enabledClasses.push("non-extra");
      }
    } else {
      enabledClasses.push("m-excavated");
    }
  }
  if (query.location === "DECK") {
    if (query.status === "revealed") {
      enabledClasses.push("m-hand");
      if (monsterMap[query.type]) {
        enabledClasses.push("m-hand-m");
      }
      if ((stMap[query.type] || query.type === 2 || query.type === 4 || checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) && !fieldspell[query.type]) {
        enabledClasses.push("m-hand-st");
      }
      if (fieldspell[query.type]) {
        enabledClasses.push("m-hand-f");
      }
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
        enabledClasses.push("m-monster-p");
      }
    } else {
      enabledClasses.push("m-deck");
    }
  }
  if (query.player !== window.orientation) {
    return;
  }
  if (query.location === "HAND") {
    enabledClasses.push("m-hand");
    if (monsterMap[query.type]) {
      enabledClasses.push("m-hand-m");
    }
    if ((stMap[query.type] || query.type === 2 || query.type === 4 || checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) && !fieldspell[query.type]) {
      enabledClasses.push("m-hand-st");
    }
    if (fieldspell[query.type]) {
      enabledClasses.push("m-hand-f");
    }
    if (pendulumMap[query.type]) {
      enabledClasses.push("m-hand-p");
      enabledClasses.push("m-monster-p");
    }
  }
  return renderEnabledControlClasses(controller, enabledClasses, disabledClasses);
}
function displayControlButtons(controller, list) {
  const elements = list.map((card) => {
    return /* @__PURE__ */ import_react18.default.createElement(
      GameplayControlButtonView,
      {
        key: `${card.type}-${card.id ?? card.uid ?? card.location}-${card.i ?? "x"}`,
        store: controller.store,
        card,
        info: buttonDetails[card.type],
        uuid: controller.state.uuid
      }
    );
  });
  return /* @__PURE__ */ import_react18.default.createElement(FloatingControlPanel, { coords: controller.info.coords }, elements);
}
function updateControlButtons(controller, newState) {
  setControlButtonsState(controller, newState);
  controller.store.emit({
    action: "ENABLE_PHASE",
    battlephase: controller.state.enableBattlePhase ? "enableBattlePhase" : false,
    mainphase2: controller.state.enableMainPhase2 ? "enableMainPhase2" : false,
    endphase: controller.state.enableEndPhase ? "enableEndPhase" : false
  });
  controller.store.emit({ action: "RENDER" });
}
function enableControlButtons(controller, query, coords) {
  setControlButtonsInfo(controller, {
    target: {
      id: query.id,
      uid: query.uid,
      index: query.index,
      location: query.location,
      type: query.type,
      player: query.player,
      pile: Boolean(query.pile),
      deck: Array.isArray(query.deck) ? query.deck : [],
      setcode: query.setcode,
      position: query.position,
      status: query.status,
      overlayMaterials: Array.isArray(query.overlayMaterials) ? query.overlayMaterials : []
    },
    coords
  });
  app.manualControls.manualActionReference = controller.info.target;
}
function clearControlButtons(controller) {
  setControlButtonsInfo(controller, {
    target: null
  });
}
function ControlButtonsState(store) {
  const controller = {
    store,
    state: {
      summonable_cards: [],
      spsummonable_cards: [],
      repositionable_cards: [],
      msetable_cards: [],
      ssetable_cards: [],
      activatable_cards: [],
      select_options: [],
      attackable_cards: []
    },
    info: {
      coords: {
        x: 0,
        y: 0
      },
      target: null
    }
  };
  controller.getCommandOptions = () => getControlButtonsCommandOptions(controller);
  controller.hasActionableCard = (query) => hasActionableControlCard(controller, query);
  controller.getActionableDeck = (deck = []) => getActionableDeckForControls(controller, deck);
  controller.getPileActionEntries = (deck = [], viewerSlot = getViewerSlot()) => getPileActionEntriesForControls(controller, deck, viewerSlot);
  controller.getIdleCommandPileHints = (viewerSlot = getViewerSlot()) => getIdleCommandPileHintsForControls(controller, viewerSlot);
  controller.getIdleCommandPileActionCovers = (viewerSlot = getViewerSlot()) => getIdleCommandPileActionCoversForControls(controller, viewerSlot);
  controller.getIdleCommandFieldActionCovers = (viewerSlot = getViewerSlot()) => getIdleCommandFieldActionCoversForControls(controller, viewerSlot);
  controller.hide = () => hideControlZones(controller);
  controller.renderEnabledClasses = (enabledClasses, disabledClasses) => renderEnabledControlClasses(controller, enabledClasses, disabledClasses);
  controller.manualDisplay = (query) => manualDisplayControls(controller, query);
  controller.display = (list) => displayControlButtons(controller, list);
  controller.update = (newState) => updateControlButtons(controller, newState);
  controller.enable = (query, coords) => enableControlButtons(controller, query, coords);
  controller.clear = () => clearControlButtons(controller);
  return controller;
}

// server/ui/components/duel/position.component.jsx
var import_react19 = __toESM(require_react(), 1);
function resolveDialogStore7(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function closeSelectPositionDialog(target) {
  resolveDialogStore7(target)?.emit?.({ action: "CLOSE_SELECT_POSITION_DIALOG" });
}

// server/ui/components/duel/reveal.component.jsx
var import_react20 = __toESM(require_react(), 1);
var REVEAL_LOCATION_LABELS2 = Object.freeze({
  BANISHED: "Banished",
  DECK: "Deck",
  EXTRA: "Extra Deck",
  EXCAVATED: "Excavated",
  FZONE: "Field Zone",
  GRAVE: "Graveyard",
  HAND: "Hand",
  MONSTERZONE: "Monster Zone",
  ONFIELD: "Field",
  OVERLAY: "Overlay Unit",
  PZONE: "Pendulum Zone",
  SPELLZONE: "Spell & Trap Zone"
});
function createEmptyRevealerState() {
  return {
    active: false,
    cards: [],
    mode: "select",
    dismissable: true
  };
}
function resolveDialogStore8(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerRevealer(target, state) {
  resolveDialogStore8(target)?.emit?.({
    action: "OPEN_REVEALER",
    state: {
      ...createEmptyRevealerState(),
      ...state,
      dismissable: state?.dismissable !== void 0 ? Boolean(state.dismissable) : true,
      active: true
    }
  });
}
function closeRevealer(target) {
  resolveDialogStore8(target)?.emit?.({ action: "CLOSE_REVEALER" });
}
function disposeRevealer(target) {
  closeRevealer(target);
}

// server/ui/components/duel/select.option.component.jsx
var import_react21 = __toESM(require_react(), 1);
function resolveDialogStore9(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function closeSelectOptionDialog(target) {
  resolveDialogStore9(target)?.emit?.({ action: "CLOSE_SELECT_OPTION_DIALOG" });
}

// server/ui/components/duel/view_decks.component.jsx
var import_react22 = __toESM(require_react(), 1);
function resolveDialogStore10(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function closeDeckDialog(target) {
  resolveDialogStore10(target)?.emit?.({ action: "CLOSE_DECK_DIALOG" });
}

// server/ui/components/duel/anouncement.component.jsx
var import_react23 = __toESM(require_react(), 1);
function resolveDialogStore11(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerFlasher(target, state = {}) {
  const resolvedStore = resolveDialogStore11(target);
  if (!resolvedStore) {
    return;
  }
  resolvedStore.emit({
    action: "OPEN_FLASHER",
    state: {
      ...state,
      active: true,
      duration: Math.max(120, Number(state?.duration || 500))
    }
  });
}
function disposeFlasher(target) {
  resolveDialogStore11(target)?.emit?.({ action: "CLOSE_FLASHER" });
}

// server/ui/components/duel/yesno.component.jsx
var import_react24 = __toESM(require_react(), 1);
function resolveDialogStore12(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function closeYesNoDialog(target) {
  resolveDialogStore12(target)?.emit?.({ action: "CLOSE_YESNO_DIALOG" });
}

// server/ui/services/duel-field-dom-effects.service.js
function normalizePlayerSlot(player) {
  const token = String(player ?? "");
  return token.startsWith("p") ? token.slice(1) : token;
}
function getPlayerClass(player) {
  return `p${normalizePlayerSlot(player)}`;
}
function toPixelString(value) {
  return `${value}px`;
}
function createDuelFieldDomEffectsService(dependencies = {}) {
  const viewport = dependencies.viewport || createDuelFieldViewport(), setTimeoutImpl = dependencies.setTimeout || globalThis.setTimeout?.bind(globalThis) || setTimeout, setIntervalImpl = dependencies.setInterval || globalThis.setInterval?.bind(globalThis) || setInterval, clearIntervalImpl = dependencies.clearInterval || globalThis.clearInterval?.bind(globalThis) || clearInterval, random = dependencies.random || Math.random;
  function getElements(selector) {
    return viewport.queryElements(selector);
  }
  function getNumericStyle(element, property) {
    return viewport.getNumericStyle(element, property);
  }
  function layoutHand(player) {
    const slot = normalizePlayerSlot(player), cards = getElements(`.p${slot}.HAND`), count = cards.length, factor = 75 / 0.8;
    for (let sequence = 0; sequence < count; sequence += 1) {
      const xCoord = count < 6 ? (5.5 * factor - 0.8 * factor * count) / 2 + 1.55 * factor + sequence * 0.8 * factor : 1.9 * factor + sequence * 4 * factor / (count - 1);
      getElements(`.p${slot}.HAND.i${sequence}`).forEach((card) => {
        card.style.left = toPixelString(xCoord);
      });
    }
  }
  function resetDeckStackMargins(player, deck) {
    getElements(`.card.${getPlayerClass(player)}.${deck}`).forEach((element) => {
      const index = Number(element.getAttribute("data-index") || 0);
      if (typeof element.setAttribute === "function") {
        element.setAttribute("style", "");
      }
      Object.assign(element.style, {
        webkitTransform: `translate3d(0,0,${index}px)`,
        zIndex: String(index)
      });
    });
  }
  function applyDeckShuffle(player, deck) {
    const playerClass = getPlayerClass(player), axis = playerClass === "p0" ? "left" : "right";
    resetDeckStackMargins(player, deck);
    getElements(`.card.${playerClass}.${deck}`).reverse().forEach((element) => {
      const cachedPosition = getNumericStyle(element, axis), randomOffset = Math.floor(random() * 100 - 50);
      element.style[axis] = toPixelString(cachedPosition - randomOffset);
    });
  }
  function shuffleDeck(player, deck) {
    const slot = normalizePlayerSlot(player), action = setIntervalImpl(() => {
      applyDeckShuffle(slot, deck);
      setTimeoutImpl(() => {
        resetDeckStackMargins(slot, deck);
      }, 50);
    }, 200);
    setTimeoutImpl(() => {
      clearIntervalImpl(action);
      resetDeckStackMargins(slot, deck);
      setTimeoutImpl(() => {
        layoutHand(slot);
      }, 500);
    }, 1e3);
    applyDeckShuffle(slot, deck);
  }
  function shuffleZone(player, location) {
    const cards = getElements(`.card.${getPlayerClass(player)}.${location}`).filter(
      (element) => Number(element.getAttribute("data-overlayindex") || 0) === 0
    );
    cards.forEach((element) => {
      const previousTransform = element.style.transform || "", offsetX = Math.floor(random() * 36 - 18), offsetY = Math.floor(random() * 18 - 9);
      element.dataset.shuffleTransform = previousTransform;
      element.style.transform = `${previousTransform} translate(${offsetX}px, ${offsetY}px)`.trim();
    });
    setTimeoutImpl(() => {
      cards.forEach((element) => {
        element.style.transform = element.dataset.shuffleTransform || "";
        delete element.dataset.shuffleTransform;
      });
    }, 350);
  }
  function shuffleTagSwap(player, zones = ["DECK", "HAND", "EXTRA"]) {
    zones.forEach((zone) => {
      shuffleDeck(player, zone);
    });
  }
  return {
    layoutHand,
    shuffleDeck,
    shuffleTagSwap,
    shuffleZone
  };
}
var defaultDuelFieldDomEffectsService = createDuelFieldDomEffectsService();

// server/ui/services/duel-presentation-layout.service.js
var summonModes = /* @__PURE__ */ new Set(["summon", "special_summon", "flip_summon"]);
function normalizePlacementNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
function resolveRevealDuration(duration) {
  return normalizePlacementNumber(duration, 1400);
}
function buildStackedRevealPlacements(anchor, count) {
  if (!anchor || !Number.isFinite(Number(anchor.x)) || !Number.isFinite(Number(anchor.y)) || count <= 0) {
    return [];
  }
  return Array.from({ length: count }, (_value, index) => ({
    x: anchor.x,
    y: anchor.y,
    offsetX: index * 22 - (count - 1) * 22 / 2,
    offsetY: index * -6,
    rotation: (index - (count - 1) / 2) * 4
  }));
}
function resolveAttackTargetAnchor(field, source, target) {
  const resolvedTarget = target || field.getDirectAttackViewportCenter(source?.player || 0);
  if (Array.isArray(resolvedTarget)) {
    return field.getViewportCenter(resolvedTarget[0]);
  }
  if (resolvedTarget?.x !== void 0) {
    return resolvedTarget;
  }
  return field.getViewportCenter(resolvedTarget);
}
function createDuelPresentationLayoutService() {
  function resolveAnnouncementPresentation(field, card) {
    const mode = typeof card?.mode === "string" ? card.mode : "legacy_preview", usesFullscreenFlasher = summonModes.has(mode) || !card?.source;
    if (!usesFullscreenFlasher) {
      return {
        type: "pulse",
        cards: [card.source],
        duration: 1e3
      };
    }
    return {
      type: "flasher",
      payload: Object.assign({}, card, {
        duration: Math.max(120, Number(card?.duration || 500)),
        sourceAnchor: card?.source ? field.getViewportCenter(card.source) : null
      })
    };
  }
  function resolveRevealPresentation(field, cards = [], options = {}) {
    if (!Array.isArray(cards) || !cards.length) {
      return null;
    }
    const call = options.call || "panel", player = normalizePlacementNumber(options.player, 0), duration = resolveRevealDuration(options.duration);
    if (call === "confirm_decktop" || call === "deck_top") {
      const anchor = field.getPileViewportCenter(player, "DECK"), placements = buildStackedRevealPlacements(anchor, cards.length);
      if (!placements.length) {
        return null;
      }
      return {
        cards,
        placements,
        duration,
        mode: call
      };
    }
    if (call === "confirm_extratop") {
      const anchor = field.getPileViewportCenter(player, "EXTRA"), placements = buildStackedRevealPlacements(anchor, cards.length);
      if (!placements.length) {
        return null;
      }
      return {
        cards,
        placements,
        duration,
        mode: call
      };
    }
    if (call === "confirm_cards") {
      const placements = cards.map((card) => {
        const center = field.getViewportCenter(card);
        if (!center) {
          return null;
        }
        return {
          x: center.x,
          y: center.y,
          offsetX: 0,
          offsetY: 0,
          rotation: 0
        };
      });
      if (!placements.every(Boolean)) {
        return null;
      }
      return {
        cards,
        placements,
        duration,
        mode: call
      };
    }
    return null;
  }
  function resolveAttackAnimation(field, source, target, duration = 720) {
    const from = field.getViewportCenter(source), to = resolveAttackTargetAnchor(field, source, target);
    if (!from || !to) {
      return null;
    }
    return {
      from,
      to,
      duration
    };
  }
  return {
    resolveAnnouncementPresentation,
    resolveAttackAnimation,
    resolveRevealPresentation
  };
}

// server/ui/services/duel-screen-controller.service.js
var defaultPresentationLayoutService = createDuelPresentationLayoutService();
function createDefaultLifepointState(store) {
  return {
    store,
    state: {
      lifepoints: [8e3, 8e3],
      turn: 1,
      names: ["Player 1", "Player 2"],
      lpDeltas: {
        0: null,
        1: null
      },
      playerHints: {
        0: [],
        1: []
      }
    },
    waiting: false,
    maxLifepoints: 8e3
  };
}
function createDuelScreenController(store, chat, databaseSystem, dependencies = {}) {
  const createFieldState = dependencies.createFieldState || ((state, nextStore, nextDatabaseSystem, fieldDependencies2 = {}) => FieldState(state, nextStore, nextDatabaseSystem, fieldDependencies2)), createCardInfo = dependencies.createCardInfo || ((nextDatabaseSystem) => CardInfo(nextDatabaseSystem)), createChainerState = dependencies.createChainerState || ((nextStore) => ChainerState(nextStore)), createControlButtonsState = dependencies.createControlButtonsState || ((nextStore) => ControlButtonsState(nextStore)), createLifepointState2 = dependencies.createLifepointState || ((nextStore) => createDefaultLifepointState(nextStore)), presentationLayoutService = dependencies.presentationLayoutService || defaultPresentationLayoutService, updateCardInfoImpl = dependencies.updateCardInfo || updateCardInfo, updateLifepointStateImpl = dependencies.updateLifepointState || updateLifepointState, updateControlButtonsImpl = dependencies.updateControlButtons || updateControlButtons, enableControlButtonsImpl = dependencies.enableControlButtons || enableControlButtons, getActionableDeckForControlsImpl = dependencies.getActionableDeckForControls || getActionableDeckForControls, getIdleCommandPileHintsForControlsImpl = dependencies.getIdleCommandPileHintsForControls || getIdleCommandPileHintsForControls, getIdleCommandPileActionCoversForControlsImpl = dependencies.getIdleCommandPileActionCoversForControls || getIdleCommandPileActionCoversForControls, getIdleCommandFieldActionCoversForControlsImpl = dependencies.getIdleCommandFieldActionCoversForControls || getIdleCommandFieldActionCoversForControls, triggerFlasherImpl = dependencies.triggerFlasher || triggerFlasher, triggerFieldRevealImpl = dependencies.triggerFieldReveal || triggerFieldReveal, triggerAttackAnimationImpl = dependencies.triggerAttackAnimation || triggerAttackAnimation, triggerPhaseBannerImpl = dependencies.triggerPhaseBanner || triggerPhaseBanner, triggerRevealerImpl = dependencies.triggerRevealer || triggerRevealer, triggerChainerImpl = dependencies.triggerChainer || triggerChainer, handleChainerQuestionImpl = dependencies.handleChainerQuestion || handleChainerQuestion, handleChainerSortQuestionImpl = dependencies.handleChainerSortQuestion || handleChainerSortQuestion, resetChainerDuelStateImpl = dependencies.resetChainerDuelState || resetChainerDuelState, closeChainerImpl = dependencies.closeChainer || closeChainer, closeRevealerImpl = dependencies.closeRevealer || closeRevealer, closeIdleExtraDeckViewerImpl = dependencies.closeIdleExtraDeckViewer || closeIdleExtraDeckViewer, closeDeckDialogImpl = dependencies.closeDeckDialog || closeDeckDialog, closeSelectPositionDialogImpl = dependencies.closeSelectPositionDialog || closeSelectPositionDialog, closeSelectAttributesDialogImpl = dependencies.closeSelectAttributesDialog || closeSelectAttributesDialog, closeAnnounceCardDialogImpl = dependencies.closeAnnounceCardDialog || closeAnnounceCardDialog, closeYesNoDialogImpl = dependencies.closeYesNoDialog || closeYesNoDialog, closeSelectOptionDialogImpl = dependencies.closeSelectOptionDialog || closeSelectOptionDialog, disposeCardInfoImpl = dependencies.disposeCardInfo || disposeCardInfo, disposeChainerImpl = dependencies.disposeChainer || disposeChainer, disposeAttackAnimationImpl = dependencies.disposeAttackAnimation || disposeAttackAnimation, disposePhaseBannerImpl = dependencies.disposePhaseBanner || disposePhaseBanner, disposeFieldRevealImpl = dependencies.disposeFieldReveal || disposeFieldReveal, disposeFlasherImpl = dependencies.disposeFlasher || disposeFlasher, disposeLifepointStateImpl = dependencies.disposeLifepointState || disposeLifepointState, disposeRevealerImpl = dependencies.disposeRevealer || disposeRevealer, disposeIdleExtraDeckViewerImpl = dependencies.disposeIdleExtraDeckViewer || disposeIdleExtraDeckViewer, isManualMode = dependencies.isManualMode || (() => Boolean(globalThis.app?.manual)), fieldDependencies = dependencies.fieldDependencies || {};
  function instantiateFieldState(state = { info: {}, field: {} }) {
    return createFieldState(state, store, databaseSystem, fieldDependencies);
  }
  let field = instantiateFieldState(), info = createCardInfo(databaseSystem), chainer = createChainerState(store), controls = createControlButtonsState(store), lifepoints = createLifepointState2(store), cleanup = () => {
  };
  const controller = {
    databaseSystem,
    state: {
      lastUpdate: {}
    },
    store,
    sidechat: chat
  };
  Object.defineProperties(controller, {
    field: {
      enumerable: true,
      get() {
        return field;
      },
      set(value) {
        field = value;
      }
    },
    info: {
      enumerable: true,
      get() {
        return info;
      },
      set(value) {
        info = value;
      }
    },
    chainer: {
      enumerable: true,
      get() {
        return chainer;
      },
      set(value) {
        chainer = value;
      }
    },
    controls: {
      enumerable: true,
      get() {
        return controls;
      },
      set(value) {
        controls = value;
      }
    },
    lifepoints: {
      enumerable: true,
      get() {
        return lifepoints;
      },
      set(value) {
        lifepoints = value;
      }
    },
    cleanup: {
      enumerable: true,
      get() {
        return cleanup;
      },
      set(value) {
        cleanup = typeof value === "function" ? value : () => {
        };
      }
    }
  });
  function clearDuelScreen() {
    controller.field = instantiateFieldState();
    resetChainerDuelStateImpl(controller.chainer);
  }
  function handleDuelManualCardClick(event) {
    enableControlButtonsImpl(controller.controls, event.card, { x: event.x, y: event.y });
    controller.store.emit({ action: "RENDER" });
    return event;
  }
  function handleDuelDeckCardClick(event) {
    enableControlButtonsImpl(controller.controls, event.card, { x: event.x, y: event.y });
    controller.store.emit({ action: "RENDER" });
    return event;
  }
  function handleDuelCardClick(event) {
    const overlayMaterials = controller.field.getOverlayViewerDeck(event.card), controlTarget = Number(event.card?.overlayindex || 0) > 0 ? controller.field.getStackHost(event.card) || event.card : event.card;
    if (isManualMode()) {
      return handleDuelManualCardClick(event);
    }
    if (!event.viewDeck && ["EXTRA", "GRAVE", "BANISHED"].includes(event.card.location)) {
      const deck = getActionableDeckForControlsImpl(
        controller.controls,
        controller.field.getDeck(event.card.player, event.card.location)
      );
      enableControlButtonsImpl(controller.controls, Object.assign({}, event.card, {
        pile: true,
        deck
      }), { x: event.x, y: event.y });
      controller.store.emit({ action: "RENDER" });
      return event;
    }
    if (event.card.location === "DECK") {
      return void 0;
    }
    enableControlButtonsImpl(controller.controls, Object.assign({}, controlTarget, {
      overlayMaterials
    }), { x: event.x, y: event.y });
    controller.store.emit({ action: "RENDER" });
    return event;
  }
  function handleDuelHover(event) {
    if (event?.clear) {
      controller.field.clearRelationHighlights();
      controller.store.emit({ action: "RENDER" });
      return null;
    }
    if (event?.card) {
      controller.field.applyRelationHighlights(event.card);
    }
    if (!event?.id) {
      controller.store.emit({ action: "RENDER" });
      return void 0;
    }
    const description = updateCardInfoImpl(controller.info, {
      id: event.id
    });
    controller.store.emit({ action: "RENDER" });
    return {
      id: event.id,
      description
    };
  }
  function updateDuelScreen(update) {
    updateLifepointStateImpl(controller.lifepoints, {
      lifepoints: update.lifepoints,
      turn: update.turn,
      names: update.names,
      playerHints: update.playerHints
    });
    controller.field.phase(update.phase);
  }
  function idleDuelScreen(commands) {
    updateControlButtonsImpl(controller.controls, commands);
    controller.field.setPileCommandHints(getIdleCommandPileHintsForControlsImpl(controller.controls));
    controller.field.setActionSpinners([
      ...getIdleCommandPileActionCoversForControlsImpl(controller.controls),
      ...getIdleCommandFieldActionCoversForControlsImpl(controller.controls)
    ]);
  }
  function flashDuelScreen(card) {
    const presentation = presentationLayoutService.resolveAnnouncementPresentation(controller.field, card);
    if (!presentation) {
      return;
    }
    if (presentation.type === "pulse") {
      controller.field.pulseAnnouncementCards(presentation.cards, presentation.duration);
      return;
    }
    triggerFlasherImpl(controller.store, presentation.payload);
  }
  function previewDuelReveal(cards = [], options = {}) {
    const presentation = presentationLayoutService.resolveRevealPresentation(controller.field, cards, options);
    if (!presentation) {
      return false;
    }
    triggerFieldRevealImpl(controller.store, presentation);
    return true;
  }
  function disposeDuelScreen() {
    controller.cleanup?.();
    controller.cleanup = () => {
    };
    disposeCardInfoImpl(controller.info);
    disposeChainerImpl(controller.chainer);
    disposeAttackAnimationImpl(controller.store);
    disposePhaseBannerImpl(controller.store);
    disposeFieldRevealImpl(controller.store);
    disposeFlasherImpl(controller.store);
    disposeLifepointStateImpl(controller.lifepoints);
    disposeRevealerImpl(controller.store);
    disposeIdleExtraDeckViewerImpl(controller.store);
    closeSelectPositionDialogImpl(controller.store);
    closeSelectAttributesDialogImpl(controller.store);
    closeAnnounceCardDialogImpl(controller.store);
    closeYesNoDialogImpl(controller.store);
    closeSelectOptionDialogImpl(controller.store);
    controller.field?.dispose?.();
  }
  function registerDuelScreenListeners() {
    const listeners = [
      controller.store.on("CARD_HOVER", (event) => handleDuelHover(event)),
      controller.store.on("DECK_CARD_CLICK", (event) => handleDuelDeckCardClick(event)),
      controller.store.on("CARD_CLICK", (event) => handleDuelCardClick(event))
    ];
    return () => {
      listeners.forEach((unsubscribe) => {
        unsubscribe?.();
      });
    };
  }
  controller.clear = () => clearDuelScreen();
  controller.onCardClick = (event) => handleDuelCardClick(event);
  controller.onManualCardClick = (event) => handleDuelManualCardClick(event);
  controller.onDeckCardClick = (event) => handleDuelDeckCardClick(event);
  controller.onHover = (event) => handleDuelHover(event);
  controller.update = (update) => updateDuelScreen(update);
  controller.updateField = (nextField) => controller.field.updateField(nextField);
  controller.hydrateField = (nextField) => controller.field.hydrateField(nextField);
  controller.replaceField = (nextField) => controller.field.replaceField(nextField);
  controller.setDisabledZones = (zones) => controller.field.setDisabledZones(zones);
  controller.idle = (commands) => idleDuelScreen(commands);
  controller.flash = (card) => flashDuelScreen(card);
  controller.reveal = (cards, state = {}) => triggerRevealerImpl(controller.store, { active: true, cards, ...state });
  controller.chain = (cards, state = {}) => triggerChainerImpl(controller.chainer, { active: true, cards, ...state });
  controller.handleChainQuestion = (options = {}, state = {}) => handleChainerQuestionImpl(controller.chainer, options, state);
  controller.handleSortChainQuestion = (options = {}, state = {}) => handleChainerSortQuestionImpl(controller.chainer, options, state);
  controller.clearChainQuestion = () => closeChainerImpl(controller.chainer);
  controller.resetChainState = () => resetChainerDuelStateImpl(controller.chainer);
  controller.closeRevealer = () => {
    closeRevealerImpl(controller.store);
    closeIdleExtraDeckViewerImpl(controller.store);
    closeDeckDialogImpl(controller.store);
  };
  controller.updateChainOverlay = (contract) => controller.field.updateChainOverlay(contract);
  controller.clearChainOverlays = () => controller.field.clearChainOverlays();
  controller.animateBattle = (source, target) => controller.field.pulseBattleOverlay(source, target);
  controller.animateAttack = (source, target, duration = 720) => {
    const animation = presentationLayoutService.resolveAttackAnimation(controller.field, source, target, duration);
    if (animation) {
      triggerAttackAnimationImpl(controller.store, animation);
    }
  };
  controller.showPhaseBanner = (text, duration) => {
    triggerPhaseBannerImpl(controller.store, {
      text,
      duration
    });
  };
  controller.previewReveal = (cards = [], options = {}) => previewDuelReveal(cards, options);
  controller.pulseLifepoints = (player, value, tone, duration) => pulseLifepointDelta(controller.lifepoints, player, value, tone, duration);
  controller.pulseSelectionCards = (cards, duration) => controller.field.pulseSelectionCards(cards, duration);
  controller.pulseTargetCards = (cards, duration) => controller.field.pulseTargetCards(cards, duration);
  controller.disableSelection = () => controller.field.disableSelection();
  controller.select = (query) => controller.field.select(query);
  controller.dispose = () => disposeDuelScreen();
  controller.cleanup = registerDuelScreenListeners();
  return controller;
}

// server/ui/components/duel/duel.component.jsx
function DuelScreenState(store, chat, databaseSystem, dependencies = {}) {
  return createDuelScreenController(store, chat, databaseSystem, dependencies);
}

// tests/unit/ui/duel.component.layout.test.js
function createStore() {
  const listeners = /* @__PURE__ */ new Map(), emitted = [];
  return {
    emitted,
    emit(message) {
      emitted.push(message);
      const handlers = listeners.get(message?.action) || [];
      handlers.slice().forEach((handler) => handler(message));
    },
    on(action, handler) {
      const next = listeners.get(action) || [];
      next.push(handler);
      listeners.set(action, next);
      return () => {
        const current = listeners.get(action) || [], filtered = current.filter((entry) => entry !== handler);
        if (filtered.length) {
          listeners.set(action, filtered);
          return;
        }
        listeners.delete(action);
      };
    }
  };
}
(0, import_node_test.default)("DuelScreenState routes flash, reveal, and attack presentation through the injected layout service", () => {
  const store = createStore(), layoutCalls = [], controller = DuelScreenState(store, {}, [], {
    presentationLayoutService: {
      resolveAnnouncementPresentation(field, card) {
        layoutCalls.push(["announcement", field, card]);
        return {
          type: "flasher",
          payload: {
            id: card.id,
            duration: 900,
            sourceAnchor: { x: 10, y: 20 }
          }
        };
      },
      resolveRevealPresentation(field, cards, options) {
        layoutCalls.push(["reveal", field, cards, options]);
        return {
          cards,
          placements: [{ x: 20, y: 30, offsetX: 0, offsetY: 0, rotation: 0 }],
          duration: 1400,
          mode: options.call || "panel"
        };
      },
      resolveAttackAnimation(field, source, target, duration) {
        layoutCalls.push(["attack", field, source, target, duration]);
        return {
          from: { x: 30, y: 40 },
          to: { x: 50, y: 60 },
          duration
        };
      }
    }
  });
  controller.flash({ id: 2001, source: { id: "source" } });
  import_strict.default.equal(controller.previewReveal([{ id: 3001 }], { call: "deck_top", player: 0 }), true);
  controller.animateAttack({ id: "source" }, { id: "target" }, 640);
  import_strict.default.equal(layoutCalls.length, 3);
  import_strict.default.equal(layoutCalls[0][0], "announcement");
  import_strict.default.equal(layoutCalls[0][1], controller.field);
  import_strict.default.deepEqual(layoutCalls[0][2], { id: 2001, source: { id: "source" } });
  import_strict.default.equal(layoutCalls[1][0], "reveal");
  import_strict.default.equal(layoutCalls[1][1], controller.field);
  import_strict.default.deepEqual(layoutCalls[1][2], [{ id: 3001 }]);
  import_strict.default.deepEqual(layoutCalls[1][3], { call: "deck_top", player: 0 });
  import_strict.default.equal(layoutCalls[2][0], "attack");
  import_strict.default.equal(layoutCalls[2][1], controller.field);
  import_strict.default.deepEqual(layoutCalls[2][2], { id: "source" });
  import_strict.default.deepEqual(layoutCalls[2][3], { id: "target" });
  import_strict.default.equal(layoutCalls[2][4], 640);
  import_strict.default.deepEqual(
    store.emitted.filter((message) => ["OPEN_FLASHER", "OPEN_FIELD_REVEAL", "OPEN_ATTACK_ANIMATION"].includes(message?.action)),
    [
      {
        action: "OPEN_FLASHER",
        state: {
          id: 2001,
          active: true,
          duration: 900,
          sourceAnchor: { x: 10, y: 20 }
        }
      },
      {
        action: "OPEN_FIELD_REVEAL",
        state: {
          active: true,
          cards: [{ id: 3001 }],
          placements: [{ x: 20, y: 30, offsetX: 0, offsetY: 0, rotation: 0 }],
          mode: "deck_top",
          stage: "priming",
          duration: 1400
        }
      },
      {
        action: "OPEN_ATTACK_ANIMATION",
        state: {
          active: true,
          from: { x: 30, y: 40 },
          to: { x: 50, y: 60 },
          stage: "priming",
          duration: 640
        }
      }
    ]
  );
  controller.dispose();
});
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.development.js:
  (**
   * @license React
   * react-dom.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
