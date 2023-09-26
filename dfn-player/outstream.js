(function () {
  "use strict";

  /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  const getWitdhAndHeight = (props) => {
    var _a;
    const width =
      ((_a = props.parentNode) === null || _a === void 0
        ? void 0
        : _a.offsetWidth) || 0;
    const height = Number(width * props.aspect_ratio);
    return [width, height];
  };

  function noop() {}
  function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
      loc: { file, line, column, char },
    };
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a
      ? b == b
      : a !== b || (a && typeof a === "object") || typeof a === "function";
  }
  let src_url_equal_anchor;
  function src_url_equal(element_src, url) {
    if (!src_url_equal_anchor) {
      src_url_equal_anchor = document.createElement("a");
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== "function") {
      throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
  }
  function subscribe(store, ...callbacks) {
    if (store == null) {
      return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
  }
  function null_to_empty(value) {
    return value == null ? "" : value;
  }

  const is_client = typeof window !== "undefined";
  let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
  function append(target, node) {
    target.appendChild(node);
  }
  function append_styles(target, style_sheet_id, styles) {
    const append_styles_to = get_root_for_style(target);
    if (!append_styles_to.getElementById(style_sheet_id)) {
      const style = element("style");
      style.id = style_sheet_id;
      style.textContent = styles;
      append_stylesheet(append_styles_to, style);
    }
  }
  function get_root_for_style(node) {
    if (!node) return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
      return root;
    }
    return node.ownerDocument;
  }
  function append_stylesheet(node, style) {
    append(node.head || node, style);
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    node.parentNode.removeChild(node);
  }
  function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
      if (iterations[i]) iterations[i].d(detaching);
    }
  }
  function element(name) {
    return document.createElement(name);
  }
  function svg_element(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function children(element) {
    return Array.from(element.childNodes);
  }
  function set_style(node, key, value, important) {
    if (value === null) {
      node.style.removeProperty(key);
    } else {
      node.style.setProperty(key, value, important ? "important" : "");
    }
  }
  function custom_event(
    type,
    detail,
    { bubbles = false, cancelable = false } = {}
  ) {
    const e = document.createEvent("CustomEvent");
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
  }

  let current_component;
  function set_current_component(component) {
    current_component = component;
  }
  function get_current_component() {
    if (!current_component)
      throw new Error("Function called outside component initialization");
    return current_component;
  }
  function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
  }
  function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
  }

  const dirty_components = [];
  const binding_callbacks = [];
  const render_callbacks = [];
  const flush_callbacks = [];
  const resolved_promise = Promise.resolve();
  let update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  function add_flush_callback(fn) {
    flush_callbacks.push(fn);
  }
  // flush() calls callbacks in this order:
  // 1. All beforeUpdate callbacks, in order: parents before children
  // 2. All bind:this callbacks, in reverse order: children before parents.
  // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
  //    for afterUpdates called during the initial onMount, which are called in
  //    reverse order: children before parents.
  // Since callbacks might update component values, which could trigger another
  // call to flush(), the following steps guard against this:
  // 1. During beforeUpdate, any updated components will be added to the
  //    dirty_components array and will cause a reentrant call to flush(). Because
  //    the flush index is kept outside the function, the reentrant call will pick
  //    up where the earlier call left off and go through all dirty components. The
  //    current_component value is saved and restored so that the reentrant call will
  //    not interfere with the "parent" flush() call.
  // 2. bind:this callbacks cannot trigger new flush() calls.
  // 3. During afterUpdate, any updated components will NOT have their afterUpdate
  //    callback called a second time; the seen_callbacks set, outside the flush()
  //    function, guarantees this behavior.
  const seen_callbacks = new Set();
  let flushidx = 0; // Do *not* move this inside the flush() function
  function flush() {
    const saved_component = current_component;
    do {
      // first, call beforeUpdate functions
      // and update components
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length) binding_callbacks.pop()();
      // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          // ...so guard against infinite loops
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  const outroing = new Set();
  let outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros, // parent group
    };
  }
  function check_outros() {
    if (!outros.r) {
      run_all(outros.c);
    }
    outros = outros.p;
  }
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach, callback) {
    if (block && block.o) {
      if (outroing.has(block)) return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach) block.d(1);
          callback();
        }
      });
      block.o(local);
    } else if (callback) {
      callback();
    }
  }

  const globals =
    typeof window !== "undefined"
      ? window
      : typeof globalThis !== "undefined"
      ? globalThis
      : global;

  function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
      component.$$.bound[index] = callback;
      callback(component.$$.ctx[index]);
    }
  }
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      // onMount happens before the initial afterUpdate
      add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
          on_destroy.push(...new_on_destroy);
        } else {
          // Edge case - component was destroyed immediately,
          // most likely as a result of a binding initialising
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      // TODO null out other refs, including component.$$ (but need to
      // preserve final state?)
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
  }
  function init(
    component,
    options,
    instance,
    create_fragment,
    not_equal,
    props,
    append_styles,
    dirty = [-1]
  ) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = (component.$$ = {
      fragment: null,
      ctx: null,
      // state
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(
        options.context || (parent_component ? parent_component.$$.context : [])
      ),
      // everything else
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root,
    });
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
      ? instance(component, options.props || {}, (i, ret, ...rest) => {
          const value = rest.length ? rest[0] : ret;
          if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
            if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
            if (ready) make_dirty(component, i);
          }
          return ret;
        })
      : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        const nodes = children(options.target);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }
      if (options.intro) transition_in(component.$$.fragment);
      mount_component(
        component,
        options.target,
        options.anchor,
        options.customElement
      );
      flush();
    }
    set_current_component(parent_component);
  }
  /**
   * Base class for Svelte components. Used when dev=false.
   */
  class SvelteComponent {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks =
        this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  }

  function dispatch_dev(type, detail) {
    document.dispatchEvent(
      custom_event(type, Object.assign({ version: "3.49.0" }, detail), {
        bubbles: true,
      })
    );
  }
  function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
  }
  function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
  }
  function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
  }
  function listen_dev(
    node,
    event,
    handler,
    options,
    has_prevent_default,
    has_stop_propagation
  ) {
    const modifiers =
      options === true
        ? ["capture"]
        : options
        ? Array.from(Object.keys(options))
        : [];
    if (has_prevent_default) modifiers.push("preventDefault");
    if (has_stop_propagation) modifiers.push("stopPropagation");
    dispatch_dev("SvelteDOMAddEventListener", {
      node,
      event,
      handler,
      modifiers,
    });
    const dispose = listen(node, event, handler, options);
    return () => {
      dispatch_dev("SvelteDOMRemoveEventListener", {
        node,
        event,
        handler,
        modifiers,
      });
      dispose();
    };
  }
  function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
      dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
  }
  function prop_dev(node, property, value) {
    node[property] = value;
    dispatch_dev("SvelteDOMSetProperty", { node, property, value });
  }
  function set_data_dev(text, data) {
    data = "" + data;
    if (text.wholeText === data) return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
  }
  function validate_each_argument(arg) {
    if (
      typeof arg !== "string" &&
      !(arg && typeof arg === "object" && "length" in arg)
    ) {
      let msg = "{#each} only iterates over array-like objects.";
      if (typeof Symbol === "function" && arg && Symbol.iterator in arg) {
        msg += " You can use a spread to convert this iterable into an array.";
      }
      throw new Error(msg);
    }
  }
  function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
      if (!~keys.indexOf(slot_key)) {
        console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
      }
    }
  }
  /**
   * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
   */
  class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
      if (!options || (!options.target && !options.$$inline)) {
        throw new Error("'target' is a required option");
      }
      super();
    }
    $destroy() {
      super.$destroy();
      this.$destroy = () => {
        console.warn("Component was already destroyed"); // eslint-disable-line no-console
      };
    }
    $capture_state() {}
    $inject_state() {}
  }

  var errorCodesVAST;
  (function (errorCodesVAST) {
    errorCodesVAST["no active campaigns"] = "901";
    errorCodesVAST["No ADS in VAST"] = "902";
    errorCodesVAST["VAST retry limit"] = "903";
    errorCodesVAST["Impression timeout "] = "905";
    errorCodesVAST["Can't load VPAID"] = "906";
    errorCodesVAST["VPAID is invalid"] = "907";
    errorCodesVAST["VPAID timeout"] = "908";
    errorCodesVAST["VPAID AdError"] = "909";
    errorCodesVAST["Error on init player"] = "910";
    errorCodesVAST["VAST error common"] = "911";
    errorCodesVAST["No active campaign"] = "912";
    errorCodesVAST["User left page"] = "913";
    errorCodesVAST["Error restart player"] = "914";
    errorCodesVAST["Network error"] = "915";
    errorCodesVAST["User disable ads"] = "916";
  })(errorCodesVAST || (errorCodesVAST = {}));

  class TerminateError extends Error {
    constructor(message) {
      super(message);
      this.name = "TerminateError";
    }
    toString() {
      return `[object ${this.name}]`;
    }
  }

  const videoMimeTypes = [
    "video/mp4",
    "video/x-flv",
    "video/mpeg",
    "video/ogg",
    "video/quicktime",
    "video/webm",
  ];
  const isVideoMimeType = (chekingType) =>
    videoMimeTypes.some((type) => type === chekingType);
  const configCreativesForVideo = (mediaFiles, MEDIA_QUERYS) => {
    if (
      (mediaFiles === null || mediaFiles === void 0
        ? void 0
        : mediaFiles.length) === 1 &&
      isVideoMimeType(String(mediaFiles[0].mimeType))
    ) {
      return [
        {
          src: mediaFiles[0].fileURL,
          type: mediaFiles[0].mimeType,
          media: "all",
          poster: "",
        },
      ];
    }
    const sortedMedia =
      mediaFiles === null || mediaFiles === void 0
        ? void 0
        : mediaFiles.sort((a, b) => {
            return a.width < b.width ? -1 : 1;
          });
    return sortedMedia === null || sortedMedia === void 0
      ? void 0
      : sortedMedia.reduce((creatives, creative, index) => {
          if (isVideoMimeType(String(creative.mimeType)))
            creatives.push({
              src: creative.fileURL,
              type: creative.mimeType,
              media: MEDIA_QUERYS[index],
              poster: "",
            });
          return creatives;
        }, []);
  };

  const isVisible = (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top > -rect.height / 2 &&
      rect.bottom <= document.documentElement.clientHeight + rect.height / 2
    );
  };

  class ReinitError extends Error {
    constructor(message) {
      super(message);
      this.name = "ReinitError";
    }
    toString() {
      return `[object ${this.name}]`;
    }
  }

  // eslint-disable-next-line @typescript-eslint/triple-slash-reference
  /// <reference path="vast-client.d.ts" />

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(
          target,
          Object.getOwnPropertyDescriptors(source)
        );
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(
            target,
            key,
            Object.getOwnPropertyDescriptor(source, key)
          );
        });
      }
    }

    return target;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj &&
          typeof Symbol === "function" &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? "symbol"
          : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true,
      },
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf
      ? Object.getPrototypeOf
      : function _getPrototypeOf(o) {
          return o.__proto__ || Object.getPrototypeOf(o);
        };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf =
      Object.setPrototypeOf ||
      function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
      };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(
        Reflect.construct(Boolean, [], function () {})
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called"
      );
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError(
        "Derived constructors may only return object or undefined"
      );
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
        result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function createAd() {
    var adAttributes =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      id: adAttributes.id || null,
      sequence: adAttributes.sequence || null,
      adType: adAttributes.adType || null,
      adServingId: null,
      categories: [],
      expires: null,
      viewableImpression: {},
      system: null,
      title: null,
      description: null,
      advertiser: null,
      pricing: null,
      survey: null,
      // @deprecated in VAST 4.1
      errorURLTemplates: [],
      impressionURLTemplates: [],
      creatives: [],
      extensions: [],
      adVerifications: [],
      blockedAdCategories: [],
      followAdditionalWrappers: true,
      allowMultipleAds: false,
      fallbackOnNoAd: null,
    };
  }

  function createAdVerification() {
    return {
      resource: null,
      vendor: null,
      browserOptional: false,
      apiFramework: null,
      type: null,
      parameters: null,
      trackingEvents: {},
    };
  }

  function createCompanionAd() {
    var creativeAttributes =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      id: creativeAttributes.id || null,
      adType: "companionAd",
      width: creativeAttributes.width || 0,
      height: creativeAttributes.height || 0,
      assetWidth: creativeAttributes.assetWidth || null,
      assetHeight: creativeAttributes.assetHeight || null,
      expandedWidth: creativeAttributes.expandedWidth || null,
      expandedHeight: creativeAttributes.expandedHeight || null,
      apiFramework: creativeAttributes.apiFramework || null,
      adSlotID: creativeAttributes.adSlotID || null,
      pxratio: creativeAttributes.pxratio || "1",
      renderingMode: creativeAttributes.renderingMode || "default",
      staticResources: [],
      htmlResources: [],
      iframeResources: [],
      adParameters: null,
      xmlEncoded: null,
      altText: null,
      companionClickThroughURLTemplate: null,
      companionClickTrackingURLTemplates: [],
      trackingEvents: {},
    };
  }
  function isCompanionAd(ad) {
    return ad.adType === "companionAd";
  }

  function createCreative() {
    var creativeAttributes =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      id: creativeAttributes.id || null,
      adId: creativeAttributes.adId || null,
      sequence: creativeAttributes.sequence || null,
      apiFramework: creativeAttributes.apiFramework || null,
      universalAdId: {
        value: null,
        idRegistry: "unknown",
      },
      creativeExtensions: [],
    };
  }

  function createCreativeCompanion() {
    var creativeAttributes =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _createCreative = createCreative(creativeAttributes),
      id = _createCreative.id,
      adId = _createCreative.adId,
      sequence = _createCreative.sequence,
      apiFramework = _createCreative.apiFramework;

    return {
      id: id,
      adId: adId,
      sequence: sequence,
      apiFramework: apiFramework,
      type: "companion",
      required: null,
      variations: [],
    };
  }

  var supportedMacros = [
    "ADCATEGORIES",
    "ADCOUNT",
    "ADPLAYHEAD",
    "ADSERVINGID",
    "ADTYPE",
    "APIFRAMEWORKS",
    "APPBUNDLE",
    "ASSETURI",
    "BLOCKEDADCATEGORIES",
    "BREAKMAXADLENGTH",
    "BREAKMAXADS",
    "BREAKMAXDURATION",
    "BREAKMINADLENGTH",
    "BREAKMINDURATION",
    "BREAKPOSITION",
    "CLICKPOS",
    "CLICKTYPE",
    "CLIENTUA",
    "CONTENTID",
    "CONTENTPLAYHEAD", // @deprecated VAST 4.1
    "CONTENTURI",
    "DEVICEIP",
    "DEVICEUA",
    "DOMAIN",
    "EXTENSIONS",
    "GDPRCONSENT",
    "IFA",
    "IFATYPE",
    "INVENTORYSTATE",
    "LATLONG",
    "LIMITADTRACKING",
    "MEDIAMIME",
    "MEDIAPLAYHEAD",
    "OMIDPARTNER",
    "PAGEURL",
    "PLACEMENTTYPE",
    "PLAYERCAPABILITIES",
    "PLAYERSIZE",
    "PLAYERSTATE",
    "PODSEQUENCE",
    "REGULATIONS",
    "SERVERSIDE",
    "SERVERUA",
    "TRANSACTIONID",
    "UNIVERSALADID",
    "VASTVERSIONS",
    "VERIFICATIONVENDORS",
  ];

  function track(URLTemplates, macros, options) {
    var URLs = resolveURLTemplates(URLTemplates, macros, options);
    URLs.forEach(function (URL) {
      if (typeof window !== "undefined" && window !== null) {
        var i = new Image();
        i.src = URL;
      }
    });
  }
  /**
   * Replace the provided URLTemplates with the given values
   *
   * @param {Array} URLTemplates - An array of tracking url templates.
   * @param {Object} [macros={}] - An optional Object of parameters to be used in the tracking calls.
   * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
   */

  function resolveURLTemplates(URLTemplates) {
    var macros =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var resolvedURLs = [];
    var URLArray = extractURLsFromTemplates(URLTemplates); // Set default value for invalid ERRORCODE

    if (
      macros["ERRORCODE"] &&
      !options.isCustomCode &&
      !/^[0-9]{3}$/.test(macros["ERRORCODE"])
    ) {
      macros["ERRORCODE"] = 900;
    } // Calc random/time based macros

    macros["CACHEBUSTING"] = leftpad(
      Math.round(Math.random() * 1.0e8).toString()
    );
    macros["TIMESTAMP"] = new Date().toISOString(); // RANDOM/random is not defined in VAST 3/4 as a valid macro tho it's used by some adServer (Auditude)

    macros["RANDOM"] = macros["random"] = macros["CACHEBUSTING"];

    for (var macro in macros) {
      macros[macro] = encodeURIComponentRFC3986(macros[macro]);
    }

    for (var URLTemplateKey in URLArray) {
      var resolveURL = URLArray[URLTemplateKey];

      if (typeof resolveURL !== "string") {
        continue;
      }

      resolvedURLs.push(replaceUrlMacros(resolveURL, macros));
    }

    return resolvedURLs;
  }
  /**
   * Replace the macros tracking url with their value.
   * If no value is provided for a supported macro and it exists in the url,
   * it will be replaced by -1 as described by the VAST 4.1 iab specifications
   *
   * @param {String} url - Tracking url.
   * @param {Object} macros - Object of macros to be replaced in the tracking calls
   */

  function replaceUrlMacros(url, macros) {
    url = replaceMacrosValues(url, macros); // match any macros from the url that was not replaced

    var remainingMacros = url.match(/[^[\]]+(?=])/g);

    if (!remainingMacros) {
      return url;
    }

    var supportedRemainingMacros = remainingMacros.filter(function (macro) {
      return supportedMacros.indexOf(macro) > -1;
    });

    if (supportedRemainingMacros.length === 0) {
      return url;
    }

    supportedRemainingMacros = supportedRemainingMacros.reduce(function (
      accumulator,
      macro
    ) {
      accumulator[macro] = -1;
      return accumulator;
    },
    {});
    return replaceMacrosValues(url, supportedRemainingMacros);
  }
  /**
   * Replace the macros tracking url with their value.
   *
   * @param {String} url - Tracking url.
   * @param {Object} macros - Object of macros to be replaced in the tracking calls
   */

  function replaceMacrosValues(url, macros) {
    var replacedMacrosUrl = url;

    for (var key in macros) {
      var value = macros[key]; // this will match [${key}] and %%${key}%% and %5B{key}%5D and replace it

      replacedMacrosUrl = replacedMacrosUrl.replace(
        new RegExp("(?:\\[|%{2}|%5B)(".concat(key, ")(?:\\]|%{2}|%5D)"), "g"),
        value
      );
    }

    return replacedMacrosUrl;
  }
  /**
   * Extract the url/s from the URLTemplates.
   *   If the URLTemplates is an array of urls
   *   If the URLTemplates object has a url property
   *   If the URLTemplates is a single string
   *
   * @param {Array|String} URLTemplates - An array|string of url templates.
   */

  function extractURLsFromTemplates(URLTemplates) {
    if (Array.isArray(URLTemplates)) {
      return URLTemplates.map(function (URLTemplate) {
        return URLTemplate && URLTemplate.hasOwnProperty("url")
          ? URLTemplate.url
          : URLTemplate;
      });
    }

    return URLTemplates;
  }
  /**
   * Returns a boolean after checking if the object exists in the array.
   *   true - if the object exists, false otherwise
   *
   * @param {Object} obj - The object who existence is to be checked.
   * @param {Array} list - List of objects.
   */

  function containsTemplateObject(obj, list) {
    for (var i = 0; i < list.length; i++) {
      if (isTemplateObjectEqual(list[i], obj)) {
        return true;
      }
    }

    return false;
  }
  /**
   * Returns a boolean after comparing two Template objects.
   *   true - if the objects are equivalent, false otherwise
   *
   * @param {Object} obj1
   * @param {Object} obj2
   */

  function isTemplateObjectEqual(obj1, obj2) {
    if (obj1 && obj2) {
      var obj1Properties = Object.getOwnPropertyNames(obj1);
      var obj2Properties = Object.getOwnPropertyNames(obj2); // If number of properties is different, objects are not equivalent

      if (obj1Properties.length !== obj2Properties.length) {
        return false;
      }

      if (obj1.id !== obj2.id || obj1.url !== obj2.url) {
        return false;
      }

      return true;
    }

    return false;
  } // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent

  function encodeURIComponentRFC3986(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return "%".concat(c.charCodeAt(0).toString(16));
    });
  }

  function leftpad(input) {
    var len =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
    var str = String(input);

    if (str.length < len) {
      return (
        range(0, len - str.length, false)
          .map(function () {
            return "0";
          })
          .join("") + str
      );
    }

    return str;
  }

  function range(left, right, inclusive) {
    var result = [];
    var ascending = left < right;
    var end = !inclusive ? right : ascending ? right + 1 : right - 1;

    for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
      result.push(i);
    }

    return result;
  }

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(
        Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
      );
    }, []);
  }
  /**
   * Joins two arrays of objects without duplicates
   *
   * @param {Array} arr1
   * @param {Array} arr2
   *
   * @return {Array}
   */

  function joinArrayOfUniqueTemplateObjs() {
    var arr1 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var arr2 =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var firstArr = Array.isArray(arr1) ? arr1 : [];
    var secondArr = Array.isArray(arr2) ? arr2 : [];
    var arr = firstArr.concat(secondArr);
    return arr.reduce(function (res, val) {
      if (!containsTemplateObject(val, res)) {
        res.push(val);
      }

      return res;
    }, []);
  }

  var util = {
    track: track,
    resolveURLTemplates: resolveURLTemplates,
    extractURLsFromTemplates: extractURLsFromTemplates,
    containsTemplateObject: containsTemplateObject,
    isTemplateObjectEqual: isTemplateObjectEqual,
    encodeURIComponentRFC3986: encodeURIComponentRFC3986,
    replaceUrlMacros: replaceUrlMacros,
    leftpad: leftpad,
    range: range,
    isNumeric: isNumeric,
    flatten: flatten,
    joinArrayOfUniqueTemplateObjs: joinArrayOfUniqueTemplateObjs,
  };

  /**
   * This module provides support methods to the parsing classes.
   */

  /**
   * Returns the first element of the given node which nodeName matches the given name.
   * @param  {Node} node - The node to use to find a match.
   * @param  {String} name - The name to look for.
   * @return {Object|undefined}
   */

  function childByName(node, name) {
    var childNodes = node.childNodes;

    for (var childKey in childNodes) {
      var child = childNodes[childKey];

      if (child.nodeName === name) {
        return child;
      }
    }
  }
  /**
   * Returns all the elements of the given node which nodeName match the given name.
   * @param  {Node} node - The node to use to find the matches.
   * @param  {String} name - The name to look for.
   * @return {Array}
   */

  function childrenByName(node, name) {
    var children = [];
    var childNodes = node.childNodes;

    for (var childKey in childNodes) {
      var child = childNodes[childKey];

      if (child.nodeName === name) {
        children.push(child);
      }
    }

    return children;
  }
  /**
   * Converts relative vastAdTagUri.
   * @param  {String} vastAdTagUrl - The url to resolve.
   * @param  {String} originalUrl - The original url.
   * @return {String}
   */

  function resolveVastAdTagURI(vastAdTagUrl, originalUrl) {
    if (!originalUrl) {
      return vastAdTagUrl;
    }

    if (vastAdTagUrl.indexOf("//") === 0) {
      var _location = location,
        protocol = _location.protocol;
      return "".concat(protocol).concat(vastAdTagUrl);
    }

    if (vastAdTagUrl.indexOf("://") === -1) {
      // Resolve relative URLs (mainly for unit testing)
      var baseURL = originalUrl.slice(0, originalUrl.lastIndexOf("/"));
      return "".concat(baseURL, "/").concat(vastAdTagUrl);
    }

    return vastAdTagUrl;
  }
  /**
   * Converts a boolean string into a Boolean.
   * @param  {String} booleanString - The boolean string to convert.
   * @return {Boolean}
   */

  function parseBoolean(booleanString) {
    return ["true", "TRUE", "True", "1"].indexOf(booleanString) !== -1;
  }
  /**
   * Parses a node text (for legacy support).
   * @param  {Object} node - The node to parse the text from.
   * @return {String}
   */

  function parseNodeText(node) {
    return node && (node.textContent || node.text || "").trim();
  }
  /**
   * Copies an attribute from a node to another.
   * @param  {String} attributeName - The name of the attribute to clone.
   * @param  {Object} nodeSource - The source node to copy the attribute from.
   * @param  {Object} nodeDestination - The destination node to copy the attribute at.
   */

  function copyNodeAttribute(attributeName, nodeSource, nodeDestination) {
    var attributeValue = nodeSource.getAttribute(attributeName);

    if (attributeValue) {
      nodeDestination.setAttribute(attributeName, attributeValue);
    }
  }
  /**
   * Converts element attributes into an object, where object key is attribute name
   * and object value is attribute value
   * @param {Element} element
   * @returns {Object}
   */

  function parseAttributes(element) {
    var nodeAttributes = element.attributes;
    var attributes = {};

    for (var i = 0; i < nodeAttributes.length; i++) {
      attributes[nodeAttributes[i].nodeName] = nodeAttributes[i].nodeValue;
    }

    return attributes;
  }
  /**
   * Parses a String duration into a Number.
   * @param  {String} durationString - The dureation represented as a string.
   * @return {Number}
   */

  function parseDuration(durationString) {
    if (durationString === null || typeof durationString === "undefined") {
      return -1;
    } // Some VAST doesn't have an HH:MM:SS duration format but instead jus the number of seconds

    if (util.isNumeric(durationString)) {
      return parseInt(durationString);
    }

    var durationComponents = durationString.split(":");

    if (durationComponents.length !== 3) {
      return -1;
    }

    var secondsAndMS = durationComponents[2].split(".");
    var seconds = parseInt(secondsAndMS[0]);

    if (secondsAndMS.length === 2) {
      seconds += parseFloat("0.".concat(secondsAndMS[1]));
    }

    var minutes = parseInt(durationComponents[1] * 60);
    var hours = parseInt(durationComponents[0] * 60 * 60);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds) ||
      minutes > 60 * 60 ||
      seconds > 60
    ) {
      return -1;
    }

    return hours + minutes + seconds;
  }
  /**
   * Splits an Array of ads into an Array of Arrays of ads.
   * Each subarray contains either one ad or multiple ads (an AdPod)
   * @param  {Array} ads - An Array of ads to split
   * @return {Array}
   */

  function splitVAST(ads) {
    var splittedVAST = [];
    var lastAdPod = null;
    ads.forEach(function (ad, i) {
      if (ad.sequence) {
        ad.sequence = parseInt(ad.sequence, 10);
      } // The current Ad may be the next Ad of an AdPod

      if (ad.sequence > 1) {
        var lastAd = ads[i - 1]; // check if the current Ad is exactly the next one in the AdPod

        if (lastAd && lastAd.sequence === ad.sequence - 1) {
          lastAdPod && lastAdPod.push(ad);
          return;
        } // If the ad had a sequence attribute but it was not part of a correctly formed
        // AdPod, let's remove the sequence attribute

        delete ad.sequence;
      }

      lastAdPod = [ad];
      splittedVAST.push(lastAdPod);
    });
    return splittedVAST;
  }
  /**
   * Parses the attributes and assign them to object
   * @param  {Object} attributes attribute
   * @param  {Object} verificationObject with properties which can be assigned
   */

  function assignAttributes(attributes, verificationObject) {
    if (attributes) {
      for (var attrKey in attributes) {
        var attribute = attributes[attrKey];

        if (
          attribute.nodeName &&
          attribute.nodeValue &&
          verificationObject.hasOwnProperty(attribute.nodeName)
        ) {
          var value = attribute.nodeValue;

          if (typeof verificationObject[attribute.nodeName] === "boolean") {
            value = parseBoolean(value);
          }

          verificationObject[attribute.nodeName] = value;
        }
      }
    }
  }
  /**
   * Merges the data between an unwrapped ad and his wrapper.
   * @param  {Ad} unwrappedAd - The 'unwrapped' Ad.
   * @param  {Ad} wrapper - The wrapper Ad.
   * @return {void}
   */

  function mergeWrapperAdData(unwrappedAd, wrapper) {
    unwrappedAd.errorURLTemplates = wrapper.errorURLTemplates.concat(
      unwrappedAd.errorURLTemplates
    );
    unwrappedAd.impressionURLTemplates = wrapper.impressionURLTemplates.concat(
      unwrappedAd.impressionURLTemplates
    );
    unwrappedAd.extensions = wrapper.extensions.concat(unwrappedAd.extensions); // values from the child wrapper will be overridden

    unwrappedAd.followAdditionalWrappers = wrapper.followAdditionalWrappers;
    unwrappedAd.allowMultipleAds = wrapper.allowMultipleAds;
    unwrappedAd.fallbackOnNoAd = wrapper.fallbackOnNoAd;
    var wrapperCompanions = (wrapper.creatives || []).filter(function (
      creative
    ) {
      return creative && creative.type === "companion";
    });
    var wrapperCompanionClickTracking = wrapperCompanions.reduce(function (
      result,
      creative
    ) {
      (creative.variations || []).forEach(function (variation) {
        (variation.companionClickTrackingURLTemplates || []).forEach(function (
          companionClickTrackingURLTemplate
        ) {
          if (
            !util.containsTemplateObject(
              companionClickTrackingURLTemplate,
              result
            )
          ) {
            result.push(companionClickTrackingURLTemplate);
          }
        });
      });
      return result;
    },
    []);
    unwrappedAd.creatives = wrapperCompanions.concat(unwrappedAd.creatives);
    var wrapperHasVideoClickTracking =
      wrapper.videoClickTrackingURLTemplates &&
      wrapper.videoClickTrackingURLTemplates.length;
    var wrapperHasVideoCustomClick =
      wrapper.videoCustomClickURLTemplates &&
      wrapper.videoCustomClickURLTemplates.length;
    unwrappedAd.creatives.forEach(function (creative) {
      // merge tracking events
      if (wrapper.trackingEvents && wrapper.trackingEvents[creative.type]) {
        for (var eventName in wrapper.trackingEvents[creative.type]) {
          var urls = wrapper.trackingEvents[creative.type][eventName];

          if (!Array.isArray(creative.trackingEvents[eventName])) {
            creative.trackingEvents[eventName] = [];
          }

          creative.trackingEvents[eventName] =
            creative.trackingEvents[eventName].concat(urls);
        }
      }

      if (creative.type === "linear") {
        // merge video click tracking url
        if (wrapperHasVideoClickTracking) {
          creative.videoClickTrackingURLTemplates =
            creative.videoClickTrackingURLTemplates.concat(
              wrapper.videoClickTrackingURLTemplates
            );
        } // merge video custom click url

        if (wrapperHasVideoCustomClick) {
          creative.videoCustomClickURLTemplates =
            creative.videoCustomClickURLTemplates.concat(
              wrapper.videoCustomClickURLTemplates
            );
        } // VAST 2.0 support - Use Wrapper/linear/clickThrough when Inline/Linear/clickThrough is null

        if (
          wrapper.videoClickThroughURLTemplate &&
          (creative.videoClickThroughURLTemplate === null ||
            typeof creative.videoClickThroughURLTemplate === "undefined")
        ) {
          creative.videoClickThroughURLTemplate =
            wrapper.videoClickThroughURLTemplate;
        }
      } // pass wrapper companion trackers to all companions

      if (
        creative.type === "companion" &&
        wrapperCompanionClickTracking.length
      ) {
        (creative.variations || []).forEach(function (variation) {
          variation.companionClickTrackingURLTemplates =
            util.joinArrayOfUniqueTemplateObjs(
              variation.companionClickTrackingURLTemplates,
              wrapperCompanionClickTracking
            );
        });
      }
    }); // As specified by VAST specs unwrapped ads should contains wrapper adVerification script

    if (wrapper.adVerifications) {
      unwrappedAd.adVerifications = unwrappedAd.adVerifications.concat(
        wrapper.adVerifications
      );
    }

    if (wrapper.blockedAdCategories) {
      unwrappedAd.blockedAdCategories = unwrappedAd.blockedAdCategories.concat(
        wrapper.blockedAdCategories
      );
    }
  }

  var parserUtils = {
    childByName: childByName,
    childrenByName: childrenByName,
    resolveVastAdTagURI: resolveVastAdTagURI,
    parseBoolean: parseBoolean,
    parseNodeText: parseNodeText,
    copyNodeAttribute: copyNodeAttribute,
    parseAttributes: parseAttributes,
    parseDuration: parseDuration,
    splitVAST: splitVAST,
    assignAttributes: assignAttributes,
    mergeWrapperAdData: mergeWrapperAdData,
  };

  /**
   * This module provides methods to parse a VAST CompanionAd Element.
   */

  /**
   * Parses a CompanionAd.
   * @param  {Object} creativeElement - The VAST CompanionAd element to parse.
   * @param  {Object} creativeAttributes - The attributes of the CompanionAd (optional).
   * @return {Object} creative - The creative object.
   */

  function parseCreativeCompanion(creativeElement, creativeAttributes) {
    var creative = createCreativeCompanion(creativeAttributes);
    creative.required = creativeElement.getAttribute("required") || null;
    creative.variations = parserUtils
      .childrenByName(creativeElement, "Companion")
      .map(function (companionResource) {
        var companionAd = createCompanionAd(
          parserUtils.parseAttributes(companionResource)
        );
        companionAd.htmlResources = parserUtils
          .childrenByName(companionResource, "HTMLResource")
          .reduce(function (urls, resource) {
            var url = parserUtils.parseNodeText(resource);
            return url ? urls.concat(url) : urls;
          }, []);
        companionAd.iframeResources = parserUtils
          .childrenByName(companionResource, "IFrameResource")
          .reduce(function (urls, resource) {
            var url = parserUtils.parseNodeText(resource);
            return url ? urls.concat(url) : urls;
          }, []);
        companionAd.staticResources = parserUtils
          .childrenByName(companionResource, "StaticResource")
          .reduce(function (urls, resource) {
            var url = parserUtils.parseNodeText(resource);
            return url
              ? urls.concat({
                  url: url,
                  creativeType: resource.getAttribute("creativeType") || null,
                })
              : urls;
          }, []);
        companionAd.altText =
          parserUtils.parseNodeText(
            parserUtils.childByName(companionResource, "AltText")
          ) || null;
        var trackingEventsElement = parserUtils.childByName(
          companionResource,
          "TrackingEvents"
        );

        if (trackingEventsElement) {
          parserUtils
            .childrenByName(trackingEventsElement, "Tracking")
            .forEach(function (trackingElement) {
              var eventName = trackingElement.getAttribute("event");
              var trackingURLTemplate =
                parserUtils.parseNodeText(trackingElement);

              if (eventName && trackingURLTemplate) {
                if (!Array.isArray(companionAd.trackingEvents[eventName])) {
                  companionAd.trackingEvents[eventName] = [];
                }

                companionAd.trackingEvents[eventName].push(trackingURLTemplate);
              }
            });
        }

        companionAd.companionClickTrackingURLTemplates = parserUtils
          .childrenByName(companionResource, "CompanionClickTracking")
          .map(function (clickTrackingElement) {
            return {
              id: clickTrackingElement.getAttribute("id") || null,
              url: parserUtils.parseNodeText(clickTrackingElement),
            };
          });
        companionAd.companionClickThroughURLTemplate =
          parserUtils.parseNodeText(
            parserUtils.childByName(companionResource, "CompanionClickThrough")
          ) || null;
        var adParametersElement = parserUtils.childByName(
          companionResource,
          "AdParameters"
        );

        if (adParametersElement) {
          companionAd.adParameters =
            parserUtils.parseNodeText(adParametersElement);
          companionAd.xmlEncoded =
            adParametersElement.getAttribute("xmlEncoded") || null;
        }

        return companionAd;
      });
    return creative;
  }

  function createCreativeLinear() {
    var creativeAttributes =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _createCreative = createCreative(creativeAttributes),
      id = _createCreative.id,
      adId = _createCreative.adId,
      sequence = _createCreative.sequence,
      apiFramework = _createCreative.apiFramework;

    return {
      id: id,
      adId: adId,
      sequence: sequence,
      apiFramework: apiFramework,
      type: "linear",
      duration: 0,
      skipDelay: null,
      mediaFiles: [],
      mezzanine: null,
      interactiveCreativeFile: null,
      closedCaptionFiles: [],
      videoClickThroughURLTemplate: null,
      videoClickTrackingURLTemplates: [],
      videoCustomClickURLTemplates: [],
      adParameters: null,
      icons: [],
      trackingEvents: {},
    };
  }
  function isCreativeLinear(ad) {
    return ad.type === "linear";
  }

  function createClosedCaptionFile() {
    var closedCaptionAttributes =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      type: closedCaptionAttributes.type || null,
      language: closedCaptionAttributes.language || null,
      fileURL: null,
    };
  }

  function createIcon() {
    return {
      program: null,
      height: 0,
      width: 0,
      xPosition: 0,
      yPosition: 0,
      apiFramework: null,
      offset: null,
      duration: 0,
      type: null,
      staticResource: null,
      htmlResource: null,
      iframeResource: null,
      pxratio: "1",
      iconClickThroughURLTemplate: null,
      iconClickTrackingURLTemplates: [],
      iconViewTrackingURLTemplate: null,
    };
  }

  function createInteractiveCreativeFile() {
    var interactiveCreativeAttributes =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      type: interactiveCreativeAttributes.type || null,
      apiFramework: interactiveCreativeAttributes.apiFramework || null,
      variableDuration: parserUtils.parseBoolean(
        interactiveCreativeAttributes.variableDuration
      ),
      fileURL: null,
    };
  }

  function createMediaFile() {
    return {
      id: null,
      fileURL: null,
      fileSize: 0,
      deliveryType: "progressive",
      mimeType: null,
      mediaType: null,
      codec: null,
      bitrate: 0,
      minBitrate: 0,
      maxBitrate: 0,
      width: 0,
      height: 0,
      apiFramework: null,
      // @deprecated in VAST 4.1. <InteractiveCreativeFile> should be used instead.
      scalable: null,
      maintainAspectRatio: null,
    };
  }

  function createMezzanine() {
    return {
      id: null,
      fileURL: null,
      delivery: null,
      codec: null,
      type: null,
      width: 0,
      height: 0,
      fileSize: 0,
      mediaType: "2D",
    };
  }

  /**
   * This module provides methods to parse a VAST Linear Element.
   */

  /**
   * Parses a Linear element.
   * @param  {Object} creativeElement - The VAST Linear element to parse.
   * @param  {any} creativeAttributes - The attributes of the Linear (optional).
   * @return {Object} creative - The creativeLinear object.
   */

  function parseCreativeLinear(creativeElement, creativeAttributes) {
    var offset;
    var creative = createCreativeLinear(creativeAttributes);
    creative.duration = parserUtils.parseDuration(
      parserUtils.parseNodeText(
        parserUtils.childByName(creativeElement, "Duration")
      )
    );
    var skipOffset = creativeElement.getAttribute("skipoffset");

    if (typeof skipOffset === "undefined" || skipOffset === null) {
      creative.skipDelay = null;
    } else if (
      skipOffset.charAt(skipOffset.length - 1) === "%" &&
      creative.duration !== -1
    ) {
      var percent = parseInt(skipOffset, 10);
      creative.skipDelay = creative.duration * (percent / 100);
    } else {
      creative.skipDelay = parserUtils.parseDuration(skipOffset);
    }

    var videoClicksElement = parserUtils.childByName(
      creativeElement,
      "VideoClicks"
    );

    if (videoClicksElement) {
      var videoClickThroughElement = parserUtils.childByName(
        videoClicksElement,
        "ClickThrough"
      );

      if (videoClickThroughElement) {
        creative.videoClickThroughURLTemplate = {
          id: videoClickThroughElement.getAttribute("id") || null,
          url: parserUtils.parseNodeText(videoClickThroughElement),
        };
      } else {
        creative.videoClickThroughURLTemplate = null;
      }

      parserUtils
        .childrenByName(videoClicksElement, "ClickTracking")
        .forEach(function (clickTrackingElement) {
          creative.videoClickTrackingURLTemplates.push({
            id: clickTrackingElement.getAttribute("id") || null,
            url: parserUtils.parseNodeText(clickTrackingElement),
          });
        });
      parserUtils
        .childrenByName(videoClicksElement, "CustomClick")
        .forEach(function (customClickElement) {
          creative.videoCustomClickURLTemplates.push({
            id: customClickElement.getAttribute("id") || null,
            url: parserUtils.parseNodeText(customClickElement),
          });
        });
    }

    var adParamsElement = parserUtils.childByName(
      creativeElement,
      "AdParameters"
    );

    if (adParamsElement) {
      creative.adParameters = parserUtils.parseNodeText(adParamsElement);
    }

    parserUtils
      .childrenByName(creativeElement, "TrackingEvents")
      .forEach(function (trackingEventsElement) {
        parserUtils
          .childrenByName(trackingEventsElement, "Tracking")
          .forEach(function (trackingElement) {
            var eventName = trackingElement.getAttribute("event");
            var trackingURLTemplate =
              parserUtils.parseNodeText(trackingElement);

            if (eventName && trackingURLTemplate) {
              if (eventName === "progress") {
                offset = trackingElement.getAttribute("offset");

                if (!offset) {
                  return;
                }

                if (offset.charAt(offset.length - 1) === "%") {
                  eventName = "progress-".concat(offset);
                } else {
                  eventName = "progress-".concat(
                    Math.round(parserUtils.parseDuration(offset))
                  );
                }
              }

              if (!Array.isArray(creative.trackingEvents[eventName])) {
                creative.trackingEvents[eventName] = [];
              }

              creative.trackingEvents[eventName].push(trackingURLTemplate);
            }
          });
      });
    parserUtils
      .childrenByName(creativeElement, "MediaFiles")
      .forEach(function (mediaFilesElement) {
        parserUtils
          .childrenByName(mediaFilesElement, "MediaFile")
          .forEach(function (mediaFileElement) {
            creative.mediaFiles.push(parseMediaFile(mediaFileElement));
          });
        var interactiveCreativeElement = parserUtils.childByName(
          mediaFilesElement,
          "InteractiveCreativeFile"
        );

        if (interactiveCreativeElement) {
          creative.interactiveCreativeFile = parseInteractiveCreativeFile(
            interactiveCreativeElement
          );
        }

        var closedCaptionElements = parserUtils.childByName(
          mediaFilesElement,
          "ClosedCaptionFiles"
        );

        if (closedCaptionElements) {
          parserUtils
            .childrenByName(closedCaptionElements, "ClosedCaptionFile")
            .forEach(function (closedCaptionElement) {
              var closedCaptionFile = createClosedCaptionFile(
                parserUtils.parseAttributes(closedCaptionElement)
              );
              closedCaptionFile.fileURL =
                parserUtils.parseNodeText(closedCaptionElement);
              creative.closedCaptionFiles.push(closedCaptionFile);
            });
        }

        var mezzanineElement = parserUtils.childByName(
          mediaFilesElement,
          "Mezzanine"
        );
        var requiredAttributes = getRequiredAttributes(mezzanineElement, [
          "delivery",
          "type",
          "width",
          "height",
        ]);

        if (requiredAttributes) {
          var mezzanine = createMezzanine();
          mezzanine.id = mezzanineElement.getAttribute("id");
          mezzanine.fileURL = parserUtils.parseNodeText(mezzanineElement);
          mezzanine.delivery = requiredAttributes.delivery;
          mezzanine.codec = mezzanineElement.getAttribute("codec");
          mezzanine.type = requiredAttributes.type;
          mezzanine.width = parseInt(requiredAttributes.width, 10);
          mezzanine.height = parseInt(requiredAttributes.height, 10);
          mezzanine.fileSize = parseInt(
            mezzanineElement.getAttribute("fileSize"),
            10
          );
          mezzanine.mediaType =
            mezzanineElement.getAttribute("mediaType") || "2D";
          creative.mezzanine = mezzanine;
        }
      });
    var iconsElement = parserUtils.childByName(creativeElement, "Icons");

    if (iconsElement) {
      parserUtils
        .childrenByName(iconsElement, "Icon")
        .forEach(function (iconElement) {
          creative.icons.push(parseIcon(iconElement));
        });
    }

    return creative;
  }
  /**
   * Parses the MediaFile element from VAST.
   * @param  {Object} mediaFileElement - The VAST MediaFile element.
   * @return {Object} - Parsed mediaFile object.
   */

  function parseMediaFile(mediaFileElement) {
    var mediaFile = createMediaFile();
    mediaFile.id = mediaFileElement.getAttribute("id");
    mediaFile.fileURL = parserUtils.parseNodeText(mediaFileElement);
    mediaFile.deliveryType = mediaFileElement.getAttribute("delivery");
    mediaFile.codec = mediaFileElement.getAttribute("codec");
    mediaFile.mimeType = mediaFileElement.getAttribute("type");
    mediaFile.mediaType = mediaFileElement.getAttribute("mediaType") || "2D";
    mediaFile.apiFramework = mediaFileElement.getAttribute("apiFramework");
    mediaFile.fileSize = parseInt(
      mediaFileElement.getAttribute("fileSize") || 0
    );
    mediaFile.bitrate = parseInt(mediaFileElement.getAttribute("bitrate") || 0);
    mediaFile.minBitrate = parseInt(
      mediaFileElement.getAttribute("minBitrate") || 0
    );
    mediaFile.maxBitrate = parseInt(
      mediaFileElement.getAttribute("maxBitrate") || 0
    );
    mediaFile.width = parseInt(mediaFileElement.getAttribute("width") || 0);
    mediaFile.height = parseInt(mediaFileElement.getAttribute("height") || 0);
    var scalable = mediaFileElement.getAttribute("scalable");

    if (scalable && typeof scalable === "string") {
      mediaFile.scalable = parserUtils.parseBoolean(scalable);
    }

    var maintainAspectRatio = mediaFileElement.getAttribute(
      "maintainAspectRatio"
    );

    if (maintainAspectRatio && typeof maintainAspectRatio === "string") {
      mediaFile.maintainAspectRatio =
        parserUtils.parseBoolean(maintainAspectRatio);
    }

    return mediaFile;
  }
  /**
   * Parses the InteractiveCreativeFile element from VAST MediaFiles node.
   * @param  {Object} interactiveCreativeElement - The VAST InteractiveCreativeFile element.
   * @return {Object} - Parsed interactiveCreativeFile object.
   */

  function parseInteractiveCreativeFile(interactiveCreativeElement) {
    var interactiveCreativeFile = createInteractiveCreativeFile(
      parserUtils.parseAttributes(interactiveCreativeElement)
    );
    interactiveCreativeFile.fileURL = parserUtils.parseNodeText(
      interactiveCreativeElement
    );
    return interactiveCreativeFile;
  }
  /**
   * Parses the Icon element from VAST.
   * @param  {Object} iconElement - The VAST Icon element.
   * @return {Object} - Parsed icon object.
   */

  function parseIcon(iconElement) {
    var icon = createIcon();
    icon.program = iconElement.getAttribute("program");
    icon.height = parseInt(iconElement.getAttribute("height") || 0);
    icon.width = parseInt(iconElement.getAttribute("width") || 0);
    icon.xPosition = parseXPosition(iconElement.getAttribute("xPosition"));
    icon.yPosition = parseYPosition(iconElement.getAttribute("yPosition"));
    icon.apiFramework = iconElement.getAttribute("apiFramework");
    icon.pxratio = iconElement.getAttribute("pxratio") || "1";
    icon.offset = parserUtils.parseDuration(iconElement.getAttribute("offset"));
    icon.duration = parserUtils.parseDuration(
      iconElement.getAttribute("duration")
    );
    parserUtils
      .childrenByName(iconElement, "HTMLResource")
      .forEach(function (htmlElement) {
        icon.type = htmlElement.getAttribute("creativeType") || "text/html";
        icon.htmlResource = parserUtils.parseNodeText(htmlElement);
      });
    parserUtils
      .childrenByName(iconElement, "IFrameResource")
      .forEach(function (iframeElement) {
        icon.type = iframeElement.getAttribute("creativeType") || 0;
        icon.iframeResource = parserUtils.parseNodeText(iframeElement);
      });
    parserUtils
      .childrenByName(iconElement, "StaticResource")
      .forEach(function (staticElement) {
        icon.type = staticElement.getAttribute("creativeType") || 0;
        icon.staticResource = parserUtils.parseNodeText(staticElement);
      });
    var iconClicksElement = parserUtils.childByName(iconElement, "IconClicks");

    if (iconClicksElement) {
      icon.iconClickThroughURLTemplate = parserUtils.parseNodeText(
        parserUtils.childByName(iconClicksElement, "IconClickThrough")
      );
      parserUtils
        .childrenByName(iconClicksElement, "IconClickTracking")
        .forEach(function (iconClickTrackingElement) {
          icon.iconClickTrackingURLTemplates.push({
            id: iconClickTrackingElement.getAttribute("id") || null,
            url: parserUtils.parseNodeText(iconClickTrackingElement),
          });
        });
    }

    icon.iconViewTrackingURLTemplate = parserUtils.parseNodeText(
      parserUtils.childByName(iconElement, "IconViewTracking")
    );
    return icon;
  }
  /**
   * Parses an horizontal position into a String ('left' or 'right') or into a Number.
   * @param  {String} xPosition - The x position to parse.
   * @return {String|Number}
   */

  function parseXPosition(xPosition) {
    if (["left", "right"].indexOf(xPosition) !== -1) {
      return xPosition;
    }

    return parseInt(xPosition || 0);
  }
  /**
   * Parses an vertical position into a String ('top' or 'bottom') or into a Number.
   * @param  {String} yPosition - The x position to parse.
   * @return {String|Number}
   */

  function parseYPosition(yPosition) {
    if (["top", "bottom"].indexOf(yPosition) !== -1) {
      return yPosition;
    }

    return parseInt(yPosition || 0);
  }
  /**
   * Getting required attributes from element
   * @param  {Object} element - DOM element
   * @param  {Array} attributes - list of attributes
   * @return {Object|null} null if a least one element not present
   */

  function getRequiredAttributes(element, attributes) {
    var values = {};
    var error = false;
    attributes.forEach(function (name) {
      if (!element || !element.getAttribute(name)) {
        error = true;
      } else {
        values[name] = element.getAttribute(name);
      }
    });
    return error ? null : values;
  }

  function createCreativeNonLinear() {
    var creativeAttributes =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _createCreative = createCreative(creativeAttributes),
      id = _createCreative.id,
      adId = _createCreative.adId,
      sequence = _createCreative.sequence,
      apiFramework = _createCreative.apiFramework;

    return {
      id: id,
      adId: adId,
      sequence: sequence,
      apiFramework: apiFramework,
      type: "nonlinear",
      variations: [],
      trackingEvents: {},
    };
  }

  function createNonLinearAd() {
    return {
      id: null,
      width: 0,
      height: 0,
      expandedWidth: 0,
      expandedHeight: 0,
      scalable: true,
      maintainAspectRatio: true,
      minSuggestedDuration: 0,
      apiFramework: "static",
      adType: "nonLinearAd",
      type: null,
      staticResource: null,
      htmlResource: null,
      iframeResource: null,
      nonlinearClickThroughURLTemplate: null,
      nonlinearClickTrackingURLTemplates: [],
      adParameters: null,
    };
  }
  function isNonLinearAd(ad) {
    return ad.adType === "nonLinearAd";
  }

  /**
   * This module provides methods to parse a VAST NonLinear Element.
   */

  /**
   * Parses a NonLinear element.
   * @param  {any} creativeElement - The VAST NonLinear element to parse.
   * @param  {any} creativeAttributes - The attributes of the NonLinear (optional).
   * @return {Object} creative - The CreativeNonLinear object.
   */

  function parseCreativeNonLinear(creativeElement, creativeAttributes) {
    var creative = createCreativeNonLinear(creativeAttributes);
    parserUtils
      .childrenByName(creativeElement, "TrackingEvents")
      .forEach(function (trackingEventsElement) {
        var eventName, trackingURLTemplate;
        parserUtils
          .childrenByName(trackingEventsElement, "Tracking")
          .forEach(function (trackingElement) {
            eventName = trackingElement.getAttribute("event");
            trackingURLTemplate = parserUtils.parseNodeText(trackingElement);

            if (eventName && trackingURLTemplate) {
              if (!Array.isArray(creative.trackingEvents[eventName])) {
                creative.trackingEvents[eventName] = [];
              }

              creative.trackingEvents[eventName].push(trackingURLTemplate);
            }
          });
      });
    parserUtils
      .childrenByName(creativeElement, "NonLinear")
      .forEach(function (nonlinearResource) {
        var nonlinearAd = createNonLinearAd();
        nonlinearAd.id = nonlinearResource.getAttribute("id") || null;
        nonlinearAd.width = nonlinearResource.getAttribute("width");
        nonlinearAd.height = nonlinearResource.getAttribute("height");
        nonlinearAd.expandedWidth =
          nonlinearResource.getAttribute("expandedWidth");
        nonlinearAd.expandedHeight =
          nonlinearResource.getAttribute("expandedHeight");
        nonlinearAd.scalable = parserUtils.parseBoolean(
          nonlinearResource.getAttribute("scalable")
        );
        nonlinearAd.maintainAspectRatio = parserUtils.parseBoolean(
          nonlinearResource.getAttribute("maintainAspectRatio")
        );
        nonlinearAd.minSuggestedDuration = parserUtils.parseDuration(
          nonlinearResource.getAttribute("minSuggestedDuration")
        );
        nonlinearAd.apiFramework =
          nonlinearResource.getAttribute("apiFramework");
        parserUtils
          .childrenByName(nonlinearResource, "HTMLResource")
          .forEach(function (htmlElement) {
            nonlinearAd.type =
              htmlElement.getAttribute("creativeType") || "text/html";
            nonlinearAd.htmlResource = parserUtils.parseNodeText(htmlElement);
          });
        parserUtils
          .childrenByName(nonlinearResource, "IFrameResource")
          .forEach(function (iframeElement) {
            nonlinearAd.type = iframeElement.getAttribute("creativeType") || 0;
            nonlinearAd.iframeResource =
              parserUtils.parseNodeText(iframeElement);
          });
        parserUtils
          .childrenByName(nonlinearResource, "StaticResource")
          .forEach(function (staticElement) {
            nonlinearAd.type = staticElement.getAttribute("creativeType") || 0;
            nonlinearAd.staticResource =
              parserUtils.parseNodeText(staticElement);
          });
        var adParamsElement = parserUtils.childByName(
          nonlinearResource,
          "AdParameters"
        );

        if (adParamsElement) {
          nonlinearAd.adParameters = parserUtils.parseNodeText(adParamsElement);
        }

        nonlinearAd.nonlinearClickThroughURLTemplate =
          parserUtils.parseNodeText(
            parserUtils.childByName(nonlinearResource, "NonLinearClickThrough")
          );
        parserUtils
          .childrenByName(nonlinearResource, "NonLinearClickTracking")
          .forEach(function (clickTrackingElement) {
            nonlinearAd.nonlinearClickTrackingURLTemplates.push({
              id: clickTrackingElement.getAttribute("id") || null,
              url: parserUtils.parseNodeText(clickTrackingElement),
            });
          });
        creative.variations.push(nonlinearAd);
      });
    return creative;
  }

  function createExtension() {
    return {
      name: null,
      value: null,
      attributes: {},
      children: [],
    };
  }
  function isEmptyExtension(extension) {
    return (
      extension.value === null &&
      Object.keys(extension.attributes).length === 0 &&
      extension.children.length === 0
    );
  }

  /**
   * Parses an array of Extension elements.
   * @param  {Node[]} extensions - The array of extensions to parse.
   * @param  {String} type - The type of extensions to parse.(Ad|Creative)
   * @return {AdExtension[]|CreativeExtension[]} - The nodes parsed to extensions
   */

  function parseExtensions(extensions) {
    var exts = [];
    extensions.forEach(function (extNode) {
      var ext = _parseExtension(extNode);

      if (ext) {
        exts.push(ext);
      }
    });
    return exts;
  }
  /**
   * Parses an extension child node
   * @param {Node} extNode - The extension node to parse
   * @return {AdExtension|CreativeExtension|null} - The node parsed to extension
   */

  function _parseExtension(extNode) {
    // Ignore comments
    if (extNode.nodeName === "#comment") return null;
    var ext = createExtension();
    var extNodeAttrs = extNode.attributes;
    var childNodes = extNode.childNodes;
    ext.name = extNode.nodeName; // Parse attributes

    if (extNode.attributes) {
      for (var extNodeAttrKey in extNodeAttrs) {
        if (extNodeAttrs.hasOwnProperty(extNodeAttrKey)) {
          var extNodeAttr = extNodeAttrs[extNodeAttrKey];

          if (extNodeAttr.nodeName && extNodeAttr.nodeValue) {
            ext.attributes[extNodeAttr.nodeName] = extNodeAttr.nodeValue;
          }
        }
      }
    } // Parse all children

    for (var childNodeKey in childNodes) {
      if (childNodes.hasOwnProperty(childNodeKey)) {
        var parsedChild = _parseExtension(childNodes[childNodeKey]);

        if (parsedChild) {
          ext.children.push(parsedChild);
        }
      }
    }
    /*
        Only parse value of Nodes with only eather no children or only a cdata or text
        to avoid useless parsing that would result to a concatenation of all children
      */

    if (
      ext.children.length === 0 ||
      (ext.children.length === 1 &&
        ["#cdata-section", "#text"].indexOf(ext.children[0].name) >= 0)
    ) {
      var txt = parserUtils.parseNodeText(extNode);

      if (txt !== "") {
        ext.value = txt;
      } // Remove the children if it's a cdata or simply text to avoid useless children

      ext.children = [];
    } // Only return not empty objects to not pollute extentions

    return isEmptyExtension(ext) ? null : ext;
  }

  /**
   * Parses the creatives from the Creatives Node.
   * @param  {any} creativeNodes - The creative nodes to parse.
   * @return {Array<Creative>} - An array of Creative objects.
   */

  function parseCreatives(creativeNodes) {
    var creatives = [];
    creativeNodes.forEach(function (creativeElement) {
      var creativeAttributes = {
        id: creativeElement.getAttribute("id") || null,
        adId: parseCreativeAdIdAttribute(creativeElement),
        sequence: creativeElement.getAttribute("sequence") || null,
        apiFramework: creativeElement.getAttribute("apiFramework") || null,
      };
      var universalAdId;
      var universalAdIdElement = parserUtils.childByName(
        creativeElement,
        "UniversalAdId"
      );

      if (universalAdIdElement) {
        universalAdId = {
          idRegistry:
            universalAdIdElement.getAttribute("idRegistry") || "unknown",
          value: parserUtils.parseNodeText(universalAdIdElement),
        };
      }

      var creativeExtensions;
      var creativeExtensionsElement = parserUtils.childByName(
        creativeElement,
        "CreativeExtensions"
      );

      if (creativeExtensionsElement) {
        creativeExtensions = parseExtensions(
          parserUtils.childrenByName(
            creativeExtensionsElement,
            "CreativeExtension"
          )
        );
      }

      for (var creativeTypeElementKey in creativeElement.childNodes) {
        var creativeTypeElement =
          creativeElement.childNodes[creativeTypeElementKey];
        var parsedCreative = void 0;

        switch (creativeTypeElement.nodeName) {
          case "Linear":
            parsedCreative = parseCreativeLinear(
              creativeTypeElement,
              creativeAttributes
            );
            break;

          case "NonLinearAds":
            parsedCreative = parseCreativeNonLinear(
              creativeTypeElement,
              creativeAttributes
            );
            break;

          case "CompanionAds":
            parsedCreative = parseCreativeCompanion(
              creativeTypeElement,
              creativeAttributes
            );
            break;
        }

        if (parsedCreative) {
          if (universalAdId) {
            parsedCreative.universalAdId = universalAdId;
          }

          if (creativeExtensions) {
            parsedCreative.creativeExtensions = creativeExtensions;
          }

          creatives.push(parsedCreative);
        }
      }
    });
    return creatives;
  }
  /**
   * Parses the creative adId Attribute.
   * @param  {any} creativeElement - The creative element to retrieve the adId from.
   * @return {String|null}
   */

  function parseCreativeAdIdAttribute(creativeElement) {
    return (
      creativeElement.getAttribute("AdID") || // VAST 2 spec
      creativeElement.getAttribute("adID") || // VAST 3 spec
      creativeElement.getAttribute("adId") || // VAST 4 spec
      null
    );
  }

  var requiredValues = {
    Wrapper: {
      subElements: ["VASTAdTagURI", "Impression"],
    },
    BlockedAdCategories: {
      attributes: ["authority"],
    },
    InLine: {
      subElements: [
        "AdSystem",
        "AdTitle",
        "Impression",
        "AdServingId",
        "Creatives",
      ],
    },
    Category: {
      attributes: ["authority"],
    },
    Pricing: {
      attributes: ["model", "currency"],
    },
    Verification: {
      oneOfinLineResources: ["JavaScriptResource", "ExecutableResource"],
      attributes: ["vendor"],
    },
    UniversalAdId: {
      attributes: ["idRegistry"],
    },
    JavaScriptResource: {
      attributes: ["apiFramework", "browserOptional"],
    },
    ExecutableResource: {
      attributes: ["apiFramework", "type"],
    },
    Tracking: {
      attributes: ["event"],
    },
    Creatives: {
      subElements: ["Creative"],
    },
    Creative: {
      subElements: ["UniversalAdId"],
    },
    Linear: {
      subElements: ["MediaFiles", "Duration"],
    },
    MediaFiles: {
      subElements: ["MediaFile"],
    },
    MediaFile: {
      attributes: ["delivery", "type", "width", "height"],
    },
    Mezzanine: {
      attributes: ["delivery", "type", "width", "height"],
    },
    NonLinear: {
      oneOfinLineResources: [
        "StaticResource",
        "IFrameResource",
        "HTMLResource",
      ],
      attributes: ["width", "height"],
    },
    Companion: {
      oneOfinLineResources: [
        "StaticResource",
        "IFrameResource",
        "HTMLResource",
      ],
      attributes: ["width", "height"],
    },
    StaticResource: {
      attributes: ["creativeType"],
    },
    Icons: {
      subElements: ["Icon"],
    },
    Icon: {
      oneOfinLineResources: [
        "StaticResource",
        "IFrameResource",
        "HTMLResource",
      ],
    },
  };

  /**
   * Verify node required values and also verify recursively all his child nodes.
   * Trigger warnings if a node required value is missing.
   * @param  {Node} node - The node element.
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @emits  VASTParser#VAST-warning
   * @param  {undefined|Boolean} [isAdInline] - Passed recursively to itself. True if the node is contained inside a inLine tag.
   */

  function verifyRequiredValues(node, emit, isAdInline) {
    if (!node || !node.nodeName) {
      return;
    }

    if (node.nodeName === "InLine") {
      isAdInline = true;
    }

    verifyRequiredAttributes(node, emit);

    if (hasSubElements(node)) {
      verifyRequiredSubElements(node, emit, isAdInline);

      for (var i = 0; i < node.children.length; i++) {
        verifyRequiredValues(node.children[i], emit, isAdInline);
      }
    } else if (parserUtils.parseNodeText(node).length === 0) {
      emitMissingValueWarning(
        {
          name: node.nodeName,
          parentName: node.parentNode.nodeName,
        },
        emit
      );
    }
  }
  /**
   * Verify and trigger warnings if node required attributes are not set.
   * @param  {Node} node - The node element.
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @emits  VASTParser#VAST-warning
   */

  function verifyRequiredAttributes(node, emit) {
    if (
      !requiredValues[node.nodeName] ||
      !requiredValues[node.nodeName].attributes
    ) {
      return;
    }

    var requiredAttributes = requiredValues[node.nodeName].attributes;
    var missingAttributes = requiredAttributes.filter(function (attributeName) {
      return !node.getAttribute(attributeName);
    });

    if (missingAttributes.length > 0) {
      emitMissingValueWarning(
        {
          name: node.nodeName,
          parentName: node.parentNode.nodeName,
          attributes: missingAttributes,
        },
        emit
      );
    }
  }
  /**
   * Verify and trigger warnings if node required sub element are not set.
   * @param  {Node} node - The node element
   * @param  {Boolean} isAdInline - True if node is contained in a inline
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @emits  VASTParser#VAST-warning
   */

  function verifyRequiredSubElements(node, emit, isAdInline) {
    var required = requiredValues[node.nodeName]; // Do not verify subelement if node is a child of wrapper, but verify it if node is the Wrapper itself
    // Wrapper child have no required subElement. (Only InLine does)

    var isInWrapperButNotWrapperItself =
      !isAdInline && node.nodeName !== "Wrapper";

    if (!required || isInWrapperButNotWrapperItself) {
      return;
    }

    if (required.subElements) {
      var requiredSubElements = required.subElements;
      var missingSubElements = requiredSubElements.filter(function (
        subElementName
      ) {
        return !parserUtils.childByName(node, subElementName);
      });

      if (missingSubElements.length > 0) {
        emitMissingValueWarning(
          {
            name: node.nodeName,
            parentName: node.parentNode.nodeName,
            subElements: missingSubElements,
          },
          emit
        );
      }
    } // When InLine format is used some nodes (i.e <NonLinear>, <Companion>, or <Icon>)
    // require at least one of the following resources: StaticResource, IFrameResource, HTMLResource

    if (!isAdInline || !required.oneOfinLineResources) {
      return;
    }

    var resourceFound = required.oneOfinLineResources.some(function (resource) {
      return parserUtils.childByName(node, resource);
    });

    if (!resourceFound) {
      emitMissingValueWarning(
        {
          name: node.nodeName,
          parentName: node.parentNode.nodeName,
          oneOfResources: required.oneOfinLineResources,
        },
        emit
      );
    }
  }
  /**
   * Check if a node has sub elements.
   * @param  {Node} node - The node element.
   * @returns {Boolean}
   */

  function hasSubElements(node) {
    return node.children && node.children.length !== 0;
  }
  /**
   * Trigger Warning if a element is empty or has missing attributes/subelements/resources
   * @param  {Object} missingElement - Object containing missing elements and values
   * @param  {String} missingElement.name - The name of element containing missing values
   * @param  {String} missingElement.parentName - The parent name of element containing missing values
   * @param  {Array} missingElement.attributes - The array of missing attributes
   * @param  {Array} missingElement.subElements - The array of missing sub elements
   * @param  {Array} missingElement.oneOfResources - The array of resources in which at least one must be provided by the element
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @emits  VastParser#VAST-warning
   */

  function emitMissingValueWarning(_ref, emit) {
    var name = _ref.name,
      parentName = _ref.parentName,
      attributes = _ref.attributes,
      subElements = _ref.subElements,
      oneOfResources = _ref.oneOfResources;
    var message = "Element '".concat(name, "'");

    if (attributes) {
      message += " missing required attribute(s) '".concat(
        attributes.join(", "),
        "' "
      );
    } else if (subElements) {
      message += " missing required sub element(s) '".concat(
        subElements.join(", "),
        "' "
      );
    } else if (oneOfResources) {
      message += " must provide one of the following '".concat(
        oneOfResources.join(", "),
        "' "
      );
    } else {
      message += " is empty";
    }

    emit("VAST-warning", {
      message: message,
      parentElement: parentName,
      specVersion: 4.1,
    });
  }

  var parserVerification = {
    verifyRequiredValues: verifyRequiredValues,
    hasSubElements: hasSubElements,
    emitMissingValueWarning: emitMissingValueWarning,
    verifyRequiredAttributes: verifyRequiredAttributes,
    verifyRequiredSubElements: verifyRequiredSubElements,
  };

  /**
   * This module provides methods to parse a VAST Ad Element.
   */

  /**
   * Parses an Ad element (can either be a Wrapper or an InLine).
   * @param  {Object} adElement - The VAST Ad element to parse.
   * @param  {Function} emit - Emit function used to trigger Warning event
   * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits  VASTParser#VAST-warning
   * @return {Object|undefined} - Object containing the ad and if it is wrapper/inline
   */

  function parseAd(adElement, emit) {
    var _ref =
        arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      allowMultipleAds = _ref.allowMultipleAds,
      followAdditionalWrappers = _ref.followAdditionalWrappers;

    var childNodes = adElement.childNodes;

    for (var adTypeElementKey in childNodes) {
      var adTypeElement = childNodes[adTypeElementKey];

      if (["Wrapper", "InLine"].indexOf(adTypeElement.nodeName) === -1) {
        continue;
      }

      if (
        adTypeElement.nodeName === "Wrapper" &&
        followAdditionalWrappers === false
      ) {
        continue;
      }

      parserUtils.copyNodeAttribute("id", adElement, adTypeElement);
      parserUtils.copyNodeAttribute("sequence", adElement, adTypeElement);
      parserUtils.copyNodeAttribute("adType", adElement, adTypeElement);

      if (adTypeElement.nodeName === "Wrapper") {
        return {
          ad: parseWrapper(adTypeElement, emit),
          type: "WRAPPER",
        };
      } else if (adTypeElement.nodeName === "InLine") {
        return {
          ad: parseInLine(adTypeElement, emit, {
            allowMultipleAds: allowMultipleAds,
          }),
          type: "INLINE",
        };
      }
    }
  }
  /**
   * Parses an Inline
   * @param  {Object} adElement Element - The VAST Inline element to parse.
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits  VASTParser#VAST-warning
   * @return {Object} ad - The ad object.
   */

  function parseInLine(adElement, emit) {
    var _ref2 =
        arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      allowMultipleAds = _ref2.allowMultipleAds;

    // if allowMultipleAds is set to false by wrapper attribute
    // only the first stand-alone Ad (with no sequence values) in the
    // requested VAST response is allowed so we won't parse ads with sequence
    if (allowMultipleAds === false && adElement.getAttribute("sequence")) {
      return null;
    }

    return parseAdElement(adElement, emit);
  }
  /**
   * Parses an ad type (Inline or Wrapper)
   * @param  {Object} adTypeElement - The VAST Inline or Wrapper element to parse.
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @emits  VASTParser#VAST-warning
   * @return {Object} ad - The ad object.
   */

  function parseAdElement(adTypeElement, emit) {
    var adVerificationsFromExtensions = [];

    if (emit) {
      parserVerification.verifyRequiredValues(adTypeElement, emit);
    }

    var childNodes = adTypeElement.childNodes;
    var ad = createAd(parserUtils.parseAttributes(adTypeElement));

    for (var nodeKey in childNodes) {
      var node = childNodes[nodeKey];

      switch (node.nodeName) {
        case "Error":
          ad.errorURLTemplates.push(parserUtils.parseNodeText(node));
          break;

        case "Impression":
          ad.impressionURLTemplates.push({
            id: node.getAttribute("id") || null,
            url: parserUtils.parseNodeText(node),
          });
          break;

        case "Creatives":
          ad.creatives = parseCreatives(
            parserUtils.childrenByName(node, "Creative")
          );
          break;

        case "Extensions": {
          var extNodes = parserUtils.childrenByName(node, "Extension");
          ad.extensions = parseExtensions(extNodes);
          /*
                OMID specify adVerifications should be in extensions for VAST < 4.0
                To avoid to put them on two different places in two different format we reparse it
                from extensions the same way than for an AdVerifications node.
              */

          if (!ad.adVerifications.length) {
            adVerificationsFromExtensions =
              _parseAdVerificationsFromExtensions(extNodes);
          }

          break;
        }

        case "AdVerifications":
          ad.adVerifications = _parseAdVerifications(
            parserUtils.childrenByName(node, "Verification")
          );
          break;

        case "AdSystem":
          ad.system = {
            value: parserUtils.parseNodeText(node),
            version: node.getAttribute("version") || null,
          };
          break;

        case "AdTitle":
          ad.title = parserUtils.parseNodeText(node);
          break;

        case "AdServingId":
          ad.adServingId = parserUtils.parseNodeText(node);
          break;

        case "Category":
          ad.categories.push({
            authority: node.getAttribute("authority") || null,
            value: parserUtils.parseNodeText(node),
          });
          break;

        case "Expires":
          ad.expires = parseInt(parserUtils.parseNodeText(node), 10);
          break;

        case "ViewableImpression":
          ad.viewableImpression = _parseViewableImpression(node);
          break;

        case "Description":
          ad.description = parserUtils.parseNodeText(node);
          break;

        case "Advertiser":
          ad.advertiser = {
            id: node.getAttribute("id") || null,
            value: parserUtils.parseNodeText(node),
          };
          break;

        case "Pricing":
          ad.pricing = {
            value: parserUtils.parseNodeText(node),
            model: node.getAttribute("model") || null,
            currency: node.getAttribute("currency") || null,
          };
          break;

        case "Survey":
          ad.survey = parserUtils.parseNodeText(node);
          break;

        case "BlockedAdCategories":
          ad.blockedAdCategories.push({
            authority: node.getAttribute("authority") || null,
            value: parserUtils.parseNodeText(node),
          });
          break;
      }
    }

    if (adVerificationsFromExtensions.length) {
      ad.adVerifications = ad.adVerifications.concat(
        adVerificationsFromExtensions
      );
    }

    return ad;
  }
  /**
   * Parses a Wrapper element without resolving the wrapped urls.
   * @param  {Object} wrapperElement - The VAST Wrapper element to be parsed.
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @emits  VASTParser#VAST-warning
   * @return {Ad}
   */

  function parseWrapper(wrapperElement, emit) {
    var ad = parseAdElement(wrapperElement, emit);
    var followAdditionalWrappersValue = wrapperElement.getAttribute(
      "followAdditionalWrappers"
    );
    var allowMultipleAdsValue = wrapperElement.getAttribute("allowMultipleAds");
    var fallbackOnNoAdValue = wrapperElement.getAttribute("fallbackOnNoAd");
    ad.followAdditionalWrappers = followAdditionalWrappersValue
      ? parserUtils.parseBoolean(followAdditionalWrappersValue)
      : true;
    ad.allowMultipleAds = allowMultipleAdsValue
      ? parserUtils.parseBoolean(allowMultipleAdsValue)
      : false;
    ad.fallbackOnNoAd = fallbackOnNoAdValue
      ? parserUtils.parseBoolean(fallbackOnNoAdValue)
      : null;
    var wrapperURLElement = parserUtils.childByName(
      wrapperElement,
      "VASTAdTagURI"
    );

    if (wrapperURLElement) {
      ad.nextWrapperURL = parserUtils.parseNodeText(wrapperURLElement);
    } else {
      wrapperURLElement = parserUtils.childByName(
        wrapperElement,
        "VASTAdTagURL"
      );

      if (wrapperURLElement) {
        ad.nextWrapperURL = parserUtils.parseNodeText(
          parserUtils.childByName(wrapperURLElement, "URL")
        );
      }
    }

    ad.creatives.forEach(function (wrapperCreativeElement) {
      if (["linear", "nonlinear"].indexOf(wrapperCreativeElement.type) !== -1) {
        // TrackingEvents Linear / NonLinear
        if (wrapperCreativeElement.trackingEvents) {
          if (!ad.trackingEvents) {
            ad.trackingEvents = {};
          }

          if (!ad.trackingEvents[wrapperCreativeElement.type]) {
            ad.trackingEvents[wrapperCreativeElement.type] = {};
          }

          var _loop = function _loop(eventName) {
            var urls = wrapperCreativeElement.trackingEvents[eventName];

            if (
              !Array.isArray(
                ad.trackingEvents[wrapperCreativeElement.type][eventName]
              )
            ) {
              ad.trackingEvents[wrapperCreativeElement.type][eventName] = [];
            }

            urls.forEach(function (url) {
              ad.trackingEvents[wrapperCreativeElement.type][eventName].push(
                url
              );
            });
          };

          for (var eventName in wrapperCreativeElement.trackingEvents) {
            _loop(eventName);
          }
        } // ClickTracking

        if (wrapperCreativeElement.videoClickTrackingURLTemplates) {
          if (!Array.isArray(ad.videoClickTrackingURLTemplates)) {
            ad.videoClickTrackingURLTemplates = [];
          } // tmp property to save wrapper tracking URLs until they are merged

          wrapperCreativeElement.videoClickTrackingURLTemplates.forEach(
            function (item) {
              ad.videoClickTrackingURLTemplates.push(item);
            }
          );
        } // ClickThrough

        if (wrapperCreativeElement.videoClickThroughURLTemplate) {
          ad.videoClickThroughURLTemplate =
            wrapperCreativeElement.videoClickThroughURLTemplate;
        } // CustomClick

        if (wrapperCreativeElement.videoCustomClickURLTemplates) {
          if (!Array.isArray(ad.videoCustomClickURLTemplates)) {
            ad.videoCustomClickURLTemplates = [];
          } // tmp property to save wrapper tracking URLs until they are merged

          wrapperCreativeElement.videoCustomClickURLTemplates.forEach(function (
            item
          ) {
            ad.videoCustomClickURLTemplates.push(item);
          });
        }
      }
    });

    if (ad.nextWrapperURL) {
      return ad;
    }
  }
  /**
   * Parses the AdVerifications Element.
   * @param  {Array} verifications - The array of verifications to parse.
   * @return {Array<Object>}
   */

  function _parseAdVerifications(verifications) {
    var ver = [];
    verifications.forEach(function (verificationNode) {
      var verification = createAdVerification();
      var childNodes = verificationNode.childNodes;
      parserUtils.assignAttributes(verificationNode.attributes, verification);

      for (var nodeKey in childNodes) {
        var node = childNodes[nodeKey];

        switch (node.nodeName) {
          case "JavaScriptResource":
          case "ExecutableResource":
            verification.resource = parserUtils.parseNodeText(node);
            parserUtils.assignAttributes(node.attributes, verification);
            break;

          case "VerificationParameters":
            verification.parameters = parserUtils.parseNodeText(node);
            break;
        }
      }

      var trackingEventsElement = parserUtils.childByName(
        verificationNode,
        "TrackingEvents"
      );

      if (trackingEventsElement) {
        parserUtils
          .childrenByName(trackingEventsElement, "Tracking")
          .forEach(function (trackingElement) {
            var eventName = trackingElement.getAttribute("event");
            var trackingURLTemplate =
              parserUtils.parseNodeText(trackingElement);

            if (eventName && trackingURLTemplate) {
              if (!Array.isArray(verification.trackingEvents[eventName])) {
                verification.trackingEvents[eventName] = [];
              }

              verification.trackingEvents[eventName].push(trackingURLTemplate);
            }
          });
      }

      ver.push(verification);
    });
    return ver;
  }
  /**
   * Parses the AdVerifications Element from extension for versions < 4.0
   * @param  {Array<Node>} extensions - The array of extensions to parse.
   * @return {Array<Object>}
   */

  function _parseAdVerificationsFromExtensions(extensions) {
    var adVerificationsNode = null,
      adVerifications = []; // Find the first (and only) AdVerifications node from extensions

    extensions.some(function (extension) {
      return (adVerificationsNode = parserUtils.childByName(
        extension,
        "AdVerifications"
      ));
    }); // Parse it if we get it

    if (adVerificationsNode) {
      adVerifications = _parseAdVerifications(
        parserUtils.childrenByName(adVerificationsNode, "Verification")
      );
    }

    return adVerifications;
  }
  /**
   * Parses the ViewableImpression Element.
   * @param  {Object} viewableImpressionNode - The ViewableImpression node element.
   * @return {Object} viewableImpression - The viewableImpression object
   */

  function _parseViewableImpression(viewableImpressionNode) {
    var viewableImpression = {};
    viewableImpression.id = viewableImpressionNode.getAttribute("id") || null;
    var viewableImpressionChildNodes = viewableImpressionNode.childNodes;

    for (var viewableImpressionElementKey in viewableImpressionChildNodes) {
      var viewableImpressionElement =
        viewableImpressionChildNodes[viewableImpressionElementKey];
      var viewableImpressionNodeName = viewableImpressionElement.nodeName;
      var viewableImpressionNodeValue = parserUtils.parseNodeText(
        viewableImpressionElement
      );

      if (
        (viewableImpressionNodeName !== "Viewable" &&
          viewableImpressionNodeName !== "NotViewable" &&
          viewableImpressionNodeName !== "ViewUndetermined") ||
        !viewableImpressionNodeValue
      ) {
        continue;
      } else {
        var viewableImpressionNodeNameLower =
          viewableImpressionNodeName.toLowerCase();

        if (
          !Array.isArray(viewableImpression[viewableImpressionNodeNameLower])
        ) {
          viewableImpression[viewableImpressionNodeNameLower] = [];
        }

        viewableImpression[viewableImpressionNodeNameLower].push(
          viewableImpressionNodeValue
        );
      }
    }

    return viewableImpression;
  }

  var EventEmitter = /*#__PURE__*/ (function () {
    function EventEmitter() {
      _classCallCheck(this, EventEmitter);

      this._handlers = [];
    }
    /**
     * Adds the event name and handler function to the end of the handlers array.
     * No checks are made to see if the handler has already been added.
     * Multiple calls passing the same combination of event name and handler will result in the handler being added,
     * and called, multiple times.
     * @param {String} event
     * @param {Function} handler
     * @returns {EventEmitter}
     */

    _createClass(EventEmitter, [
      {
        key: "on",
        value: function on(event, handler) {
          if (typeof handler !== "function") {
            throw new TypeError(
              "The handler argument must be of type Function. Received type ".concat(
                _typeof(handler)
              )
            );
          }

          if (!event) {
            throw new TypeError(
              "The event argument must be of type String. Received type ".concat(
                _typeof(event)
              )
            );
          }

          this._handlers.push({
            event: event,
            handler: handler,
          });

          return this;
        },
        /**
         * Adds a one-time handler function for the named event.
         * The next time event is triggered, this handler is removed and then invoked.
         * @param {String} event
         * @param {Function} handler
         * @returns {EventEmitter}
         */
      },
      {
        key: "once",
        value: function once(event, handler) {
          return this.on(event, onceWrap(this, event, handler));
        },
        /**
         * Removes all instances for the specified handler from the handler array for the named event.
         * @param {String} event
         * @param {Function} handler
         * @returns {EventEmitter}
         */
      },
      {
        key: "off",
        value: function off(event, handler) {
          this._handlers = this._handlers.filter(function (item) {
            return item.event !== event || item.handler !== handler;
          });
          return this;
        },
        /**
         * Synchronously calls each of the handlers registered for the named event,
         * in the order they were registered, passing the supplied arguments to each.
         * @param {String} event
         * @param  {any[]} args
         * @returns {Boolean} true if the event had handlers, false otherwise.
         */
      },
      {
        key: "emit",
        value: function emit(event) {
          for (
            var _len = arguments.length,
              args = new Array(_len > 1 ? _len - 1 : 0),
              _key = 1;
            _key < _len;
            _key++
          ) {
            args[_key - 1] = arguments[_key];
          }

          var called = false;

          this._handlers.forEach(function (item) {
            if (item.event === "*") {
              called = true;
              item.handler.apply(item, [event].concat(args));
            }

            if (item.event === event) {
              called = true;
              item.handler.apply(item, args);
            }
          });

          return called;
        },
        /**
         * Removes all listeners, or those of the specified named event.
         * @param {String} event
         * @returns {EventEmitter}
         */
      },
      {
        key: "removeAllListeners",
        value: function removeAllListeners(event) {
          if (!event) {
            this._handlers = [];
            return this;
          }

          this._handlers = this._handlers.filter(function (item) {
            return item.event !== event;
          });
          return this;
        },
        /**
         * Returns the number of listeners listening to the named event.
         * @param {String} event
         * @returns {Number}
         */
      },
      {
        key: "listenerCount",
        value: function listenerCount(event) {
          return this._handlers.filter(function (item) {
            return item.event === event;
          }).length;
        },
        /**
         * Returns a copy of the array of listeners for the named event including those created by .once().
         * @param {String} event
         * @returns {Function[]}
         */
      },
      {
        key: "listeners",
        value: function listeners(event) {
          return this._handlers.reduce(function (listeners, item) {
            if (item.event === event) {
              listeners.push(item.handler);
            }

            return listeners;
          }, []);
        },
        /**
         * Returns an array listing the events for which the emitter has registered handlers.
         * @returns {String[]}
         */
      },
      {
        key: "eventNames",
        value: function eventNames() {
          return this._handlers.map(function (item) {
            return item.event;
          });
        },
      },
    ]);

    return EventEmitter;
  })();

  function onceWrap(target, event, handler) {
    var state = {
      fired: false,
      wrapFn: undefined,
    };

    function onceWrapper() {
      if (!state.fired) {
        target.off(event, state.wrapFn);
        state.fired = true;
        handler.bind(target).apply(void 0, arguments);
      }
    }

    state.wrapFn = onceWrapper;
    return onceWrapper;
  }

  // This mock module is loaded in stead of the original NodeURLHandler module
  // when bundling the library for environments which are not node.
  // This allows us to avoid bundling useless node components and have a smaller build.
  function get$2(url, options, cb) {
    cb(
      new Error("Please bundle the library for node to use the node urlHandler")
    );
  }

  var nodeURLHandler = {
    get: get$2,
  };

  var DEFAULT_TIMEOUT = 120000;

  function supported() {
    return true;
  }

  function handleLoad(xml, cb) {
    cb(null, xml, {
      byteLength: xml === null || xml === void 0 ? void 0 : xml.length,
      statusCode: 200,
    });
  }
  /**
   *  Timeout promise create
   */

  var Timeout = /*#__PURE__*/ (function () {
    function Timeout() {
      var config =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, Timeout);

      this.timeout = config.seconds || DEFAULT_TIMEOUT;
      this.timeoutID = undefined;
    }

    _createClass(Timeout, [
      {
        key: "start",
        get: function get() {
          var _this = this;

          return new Promise(function (_, reject) {
            _this.timeoutID = setTimeout(function () {
              var message = "XHRURLHandler: Request timed out after ".concat(
                _this.timeout,
                " ms (408)"
              );
              reject(new Error(message));
            }, _this.timeout);
          });
        },
      },
      {
        key: "clear",
        value: function clear() {
          this.timeoutID && clearTimeout(this.timeoutID);
        },
      },
    ]);

    return Timeout;
  })();

  function get$1(url, options, cb) {
    if (window.location.protocol === "https:" && url.indexOf("http://") === 0) {
      return cb(new Error("XHRURLHandler: Cannot go from HTTPS to HTTP."));
    }

    var optCredentialValue = options.withCredentials ? "include" : "omit";
    var corsMode = options.withCredentials ? "cors" : "no-cors";
    var timeOutPromise = new Timeout({
      seconds: options.timeout,
    });

    try {
      Promise.race([
        fetch(url, {
          mode: corsMode,
          credentials: optCredentialValue,
        }),
        timeOutPromise.start,
      ])
        .then(function (response) {
          if (response.status === 200) {
            return response.text();
          } else {
            var errorMessage = "XHRURLHandler: "
              .concat(response.statusText, " (")
              .concat(response.status, ")");
            reject(new Error(errorMessage));
          }
        })
        .then(function (str) {
          return new window.DOMParser().parseFromString(str, "text/xml");
        })
        .then(function (xml) {
          handleLoad(xml, cb);
          resolve();
        })
        ["catch"](function (error) {
          return cb(new Error(error.message));
        });
    } catch (error) {
      cb(new Error("XHRURLHandler: Unexpected error"));
    }
  }

  var XHRURLHandler = {
    get: get$1,
    supported: supported,
  };

  function get(url, options, cb) {
    // Allow skip of the options param
    if (!cb) {
      if (typeof options === "function") {
        cb = options;
      }

      options = {};
    }

    if (typeof window === "undefined" || window === null) {
      return nodeURLHandler.get(url, options, cb);
    } else {
      return XHRURLHandler.get(url, options, cb);
    }
  }

  var urlHandler = {
    get: get,
  };

  function createVASTResponse(_ref) {
    var ads = _ref.ads,
      errorURLTemplates = _ref.errorURLTemplates,
      version = _ref.version;
    return {
      ads: ads || [],
      errorURLTemplates: errorURLTemplates || [],
      version: version || null,
    };
  }

  /*
      We decided to put the estimated bitrate separated from classes to persist it between different instances of vast client/parser
    */
  var estimatedBitrateCount = 0;
  var estimatedBitrate = 0;
  /**
   * Calculate average estimated bitrate from the previous values and new entries
   * @param {Number} byteLength - The length of the response in bytes.
   * @param {Number} duration - The duration of the request in ms.
   */

  var updateEstimatedBitrate = function updateEstimatedBitrate(
    byteLength,
    duration
  ) {
    if (!byteLength || !duration || byteLength <= 0 || duration <= 0) {
      return;
    } // We want the bitrate in kb/s, byteLength are in bytes and duration in ms, just need to convert the byteLength because kb/s = b/ms

    var bitrate = (byteLength * 8) / duration;
    estimatedBitrate =
      (estimatedBitrate * estimatedBitrateCount + bitrate) /
      ++estimatedBitrateCount;
  };

  var DEFAULT_MAX_WRAPPER_DEPTH = 10;
  var DEFAULT_EVENT_DATA = {
    ERRORCODE: 900,
    extensions: [],
  };
  /**
   * This class provides methods to fetch and parse a VAST document.
   * @export
   * @class VASTParser
   * @extends EventEmitter
   */

  var VASTParser = /*#__PURE__*/ (function (_EventEmitter) {
    _inherits(VASTParser, _EventEmitter);

    var _super = _createSuper(VASTParser);

    /**
     * Creates an instance of VASTParser.
     * @constructor
     */
    function VASTParser() {
      var _this;

      _classCallCheck(this, VASTParser);

      _this = _super.call(this);
      _this.remainingAds = [];
      _this.parentURLs = [];
      _this.errorURLTemplates = [];
      _this.rootErrorURLTemplates = [];
      _this.maxWrapperDepth = null;
      _this.URLTemplateFilters = [];
      _this.fetchingOptions = {};
      _this.parsingOptions = {};
      return _this;
    }
    /**
     * Adds a filter function to the array of filters which are called before fetching a VAST document.
     * @param  {function} filter - The filter function to be added at the end of the array.
     * @return {void}
     */

    _createClass(VASTParser, [
      {
        key: "addURLTemplateFilter",
        value: function addURLTemplateFilter(filter) {
          if (typeof filter === "function") {
            this.URLTemplateFilters.push(filter);
          }
        },
        /**
         * Removes the last element of the url templates filters array.
         * @return {void}
         */
      },
      {
        key: "removeURLTemplateFilter",
        value: function removeURLTemplateFilter() {
          this.URLTemplateFilters.pop();
        },
        /**
         * Returns the number of filters of the url templates filters array.
         * @return {Number}
         */
      },
      {
        key: "countURLTemplateFilters",
        value: function countURLTemplateFilters() {
          return this.URLTemplateFilters.length;
        },
        /**
         * Removes all the filter functions from the url templates filters array.
         * @return {void}
         */
      },
      {
        key: "clearURLTemplateFilters",
        value: function clearURLTemplateFilters() {
          this.URLTemplateFilters = [];
        },
        /**
         * Tracks the error provided in the errorCode parameter and emits a VAST-error event for the given error.
         * @param  {Array} urlTemplates - An Array of url templates to use to make the tracking call.
         * @param  {Object} errorCode - An Object containing the error data.
         * @param  {Object} data - One (or more) Object containing additional data.
         * @emits  VASTParser#VAST-error
         * @return {void}
         */
      },
      {
        key: "trackVastError",
        value: function trackVastError(urlTemplates, errorCode) {
          for (
            var _len = arguments.length,
              data = new Array(_len > 2 ? _len - 2 : 0),
              _key = 2;
            _key < _len;
            _key++
          ) {
            data[_key - 2] = arguments[_key];
          }

          this.emit(
            "VAST-error",
            Object.assign.apply(
              Object,
              [{}, DEFAULT_EVENT_DATA, errorCode].concat(data)
            )
          );
          util.track(urlTemplates, errorCode);
        },
        /**
         * Returns an array of errorURLTemplates for the VAST being parsed.
         * @return {Array}
         */
      },
      {
        key: "getErrorURLTemplates",
        value: function getErrorURLTemplates() {
          return this.rootErrorURLTemplates.concat(this.errorURLTemplates);
        },
        /**
         * Returns the estimated bitrate calculated from all previous requests
         * @returns The average of all estimated bitrates in kb/s.
         */
      },
      {
        key: "getEstimatedBitrate",
        value: function getEstimatedBitrate() {
          return estimatedBitrate;
        },
        /**
         * Fetches a VAST document for the given url.
         * Returns a Promise which resolves,rejects according to the result of the request.
         * @param  {String} url - The url to request the VAST document.
         * @param {Number} wrapperDepth - how many times the current url has been wrapped
         * @param {String} previousUrl - url of the previous VAST
         * @emits  VASTParser#VAST-resolving
         * @emits  VASTParser#VAST-resolved
         * @return {Promise}
         */
      },
      {
        key: "fetchVAST",
        value: function fetchVAST(url) {
          var _this2 = this;

          var wrapperDepth =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : 0;
          var previousUrl =
            arguments.length > 2 && arguments[2] !== undefined
              ? arguments[2]
              : null;
          return new Promise(function (resolve, reject) {
            // Process url with defined filter
            _this2.URLTemplateFilters.forEach(function (filter) {
              url = filter(url);
            });

            _this2.parentURLs.push(url);

            var timeBeforeGet = Date.now();

            _this2.emit("VAST-resolving", {
              url: url,
              previousUrl: previousUrl,
              wrapperDepth: wrapperDepth,
              maxWrapperDepth: _this2.maxWrapperDepth,
              timeout: _this2.fetchingOptions.timeout,
            });

            _this2.urlHandler.get(
              url,
              _this2.fetchingOptions,
              function (error, xml) {
                var details =
                  arguments.length > 2 && arguments[2] !== undefined
                    ? arguments[2]
                    : {};
                var deltaTime = Math.round(Date.now() - timeBeforeGet);
                var info = Object.assign(
                  {
                    url: url,
                    previousUrl: previousUrl,
                    wrapperDepth: wrapperDepth,
                    error: error,
                    duration: deltaTime,
                  },
                  details
                );

                _this2.emit("VAST-resolved", info);

                updateEstimatedBitrate(details.byteLength, deltaTime);

                if (error) {
                  reject(error);
                } else {
                  resolve(xml);
                }
              }
            );
          });
        },
        /**
         * Inits the parsing properties of the class with the custom values provided as options.
         * @param {Object} options - The options to initialize a parsing sequence
         */
      },
      {
        key: "initParsingStatus",
        value: function initParsingStatus() {
          var options =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.errorURLTemplates = [];
          this.fetchingOptions = {
            timeout: options.timeout || DEFAULT_TIMEOUT,
            withCredentials: options.withCredentials,
          };
          this.maxWrapperDepth =
            options.wrapperLimit || DEFAULT_MAX_WRAPPER_DEPTH;
          this.parentURLs = [];
          this.parsingOptions = {
            allowMultipleAds: options.allowMultipleAds,
          };
          this.remainingAds = [];
          this.rootErrorURLTemplates = [];
          this.rootURL = "";
          this.urlHandler =
            options.urlHandler || options.urlhandler || urlHandler;
          this.vastVersion = null;
          updateEstimatedBitrate(options.byteLength, options.requestDuration);
        },
        /**
         * Resolves the next group of ads. If all is true resolves all the remaining ads.
         * @param  {Boolean} all - If true all the remaining ads are resolved
         * @return {Promise}
         */
      },
      {
        key: "getRemainingAds",
        value: function getRemainingAds(all) {
          var _this3 = this;

          if (this.remainingAds.length === 0) {
            return Promise.reject(
              new Error("No more ads are available for the given VAST")
            );
          }

          var ads = all
            ? util.flatten(this.remainingAds)
            : this.remainingAds.shift();
          this.errorURLTemplates = [];
          this.parentURLs = [];
          return this.resolveAds(ads, {
            wrapperDepth: 0,
            url: this.rootURL,
          }).then(function (resolvedAds) {
            return _this3.buildVASTResponse(resolvedAds);
          });
        },
        /**
         * Fetches and parses a VAST for the given url.
         * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
         * @param  {String} url - The url to request the VAST document.
         * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
         * @emits  VASTParser#VAST-resolving
         * @emits  VASTParser#VAST-resolved
         * @emits  VASTParser#VAST-warning
         * @return {Promise}
         */
      },
      {
        key: "getAndParseVAST",
        value: function getAndParseVAST(url) {
          var _this4 = this;

          var options =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};
          this.initParsingStatus(options);
          this.URLTemplateFilters.forEach(function (filter) {
            url = filter(url);
          });
          this.rootURL = url;
          return this.fetchVAST(url).then(function (xml) {
            options.previousUrl = url;
            options.isRootVAST = true;
            options.url = url;
            return _this4.parse(xml, options).then(function (ads) {
              return _this4.buildVASTResponse(ads);
            });
          });
        },
        /**
         * Parses the given xml Object into a VASTResponse.
         * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
         * @param  {Object} vastXml - An object representing a vast xml document.
         * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
         * @emits  VASTParser#VAST-resolving
         * @emits  VASTParser#VAST-resolved
         * @emits  VASTParser#VAST-warning
         * @return {Promise}
         */
      },
      {
        key: "parseVAST",
        value: function parseVAST(vastXml) {
          var _this5 = this;

          var options =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};
          this.initParsingStatus(options);
          options.isRootVAST = true;
          return this.parse(vastXml, options).then(function (ads) {
            return _this5.buildVASTResponse(ads);
          });
        },
        /**
         * Builds a VASTResponse which can be returned.
         * @param  {Array} ads - An Array of unwrapped ads
         * @return {Object}
         */
      },
      {
        key: "buildVASTResponse",
        value: function buildVASTResponse(ads) {
          var response = createVASTResponse({
            ads: ads,
            errorURLTemplates: this.getErrorURLTemplates(),
            version: this.vastVersion,
          });
          this.completeWrapperResolving(response);
          return response;
        },
        /**
         * Parses the given xml Object into an array of ads
         * Returns the array or throws an `Error` if an invalid VAST XML is provided
         * @param  {Object} vastXml - An object representing an xml document.
         * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
         * @emits  VASTParser#VAST-warning
         * @emits VASTParser#VAST-ad-parsed
         * @return {Array}
         * @throws {Error} `vastXml` must be a valid VAST XMLDocument
         */
      },
      {
        key: "parseVastXml",
        value: function parseVastXml(vastXml, _ref) {
          var _ref$isRootVAST = _ref.isRootVAST,
            isRootVAST = _ref$isRootVAST === void 0 ? false : _ref$isRootVAST,
            _ref$url = _ref.url,
            url = _ref$url === void 0 ? null : _ref$url,
            _ref$wrapperDepth = _ref.wrapperDepth,
            wrapperDepth = _ref$wrapperDepth === void 0 ? 0 : _ref$wrapperDepth,
            allowMultipleAds = _ref.allowMultipleAds,
            followAdditionalWrappers = _ref.followAdditionalWrappers;

          // check if is a valid VAST document
          if (
            !vastXml ||
            !vastXml.documentElement ||
            vastXml.documentElement.nodeName !== "VAST"
          ) {
            this.emit("VAST-ad-parsed", {
              type: "ERROR",
              url: url,
              wrapperDepth: wrapperDepth,
            });
            throw new Error("Invalid VAST XMLDocument");
          }

          var ads = [];
          var childNodes = vastXml.documentElement.childNodes;
          /* Only parse the version of the Root VAST for now because we don't know yet how to
           * handle some cases like multiple wrappers in the same vast
           */

          var vastVersion = vastXml.documentElement.getAttribute("version");

          if (isRootVAST) {
            if (vastVersion) this.vastVersion = vastVersion;
          } // Fill the VASTResponse object with ads and errorURLTemplates

          for (var nodeKey in childNodes) {
            var node = childNodes[nodeKey];

            if (node.nodeName === "Error") {
              var errorURLTemplate = parserUtils.parseNodeText(node); // Distinguish root VAST url templates from ad specific ones

              isRootVAST
                ? this.rootErrorURLTemplates.push(errorURLTemplate)
                : this.errorURLTemplates.push(errorURLTemplate);
            } else if (node.nodeName === "Ad") {
              // allowMultipleAds was introduced in VAST 3
              // for retrocompatibility set it to true
              if (this.vastVersion && parseFloat(this.vastVersion) < 3) {
                allowMultipleAds = true;
              } else if (allowMultipleAds === false && ads.length > 1) {
                // if wrapper allowMultipleAds is set to false only the first stand-alone Ad
                // (with no sequence values) in the requested VAST response is allowed
                break;
              }

              var result = parseAd(node, this.emit.bind(this), {
                allowMultipleAds: allowMultipleAds,
                followAdditionalWrappers: followAdditionalWrappers,
              });

              if (result.ad) {
                ads.push(result.ad);
                this.emit("VAST-ad-parsed", {
                  type: result.type,
                  url: url,
                  wrapperDepth: wrapperDepth,
                  adIndex: ads.length - 1,
                  vastVersion: vastVersion,
                });
              } else {
                // VAST version of response not supported.
                this.trackVastError(this.getErrorURLTemplates(), {
                  ERRORCODE: 101,
                });
              }
            }
          }

          return ads;
        },
        /**
         * Parses the given xml Object into an array of unwrapped ads.
         * Returns a Promise which resolves with the array or rejects with an error according to the result of the parsing.
         * @param {Object} vastXml - An object representing an xml document.
         * @param {Object} options - An optional Object of parameters to be used in the parsing process.
         * @emits VASTParser#VAST-resolving
         * @emits VASTParser#VAST-resolved
         * @emits VASTParser#VAST-warning
         * @return {Promise}
         */
      },
      {
        key: "parse",
        value: function parse(vastXml) {
          var _ref2 =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : {},
            _ref2$url = _ref2.url,
            url = _ref2$url === void 0 ? null : _ref2$url,
            _ref2$resolveAll = _ref2.resolveAll,
            resolveAll = _ref2$resolveAll === void 0 ? true : _ref2$resolveAll,
            _ref2$wrapperSequence = _ref2.wrapperSequence,
            wrapperSequence =
              _ref2$wrapperSequence === void 0 ? null : _ref2$wrapperSequence,
            _ref2$previousUrl = _ref2.previousUrl,
            previousUrl =
              _ref2$previousUrl === void 0 ? null : _ref2$previousUrl,
            _ref2$wrapperDepth = _ref2.wrapperDepth,
            wrapperDepth =
              _ref2$wrapperDepth === void 0 ? 0 : _ref2$wrapperDepth,
            _ref2$isRootVAST = _ref2.isRootVAST,
            isRootVAST = _ref2$isRootVAST === void 0 ? false : _ref2$isRootVAST,
            followAdditionalWrappers = _ref2.followAdditionalWrappers,
            allowMultipleAds = _ref2.allowMultipleAds;

          var ads = []; // allowMultipleAds was introduced in VAST 3 as wrapper attribute
          // for retrocompatibility set it to true for vast pre-version 3

          if (
            this.vastVersion &&
            parseFloat(this.vastVersion) < 3 &&
            isRootVAST
          ) {
            allowMultipleAds = true;
          }

          try {
            ads = this.parseVastXml(vastXml, {
              isRootVAST: isRootVAST,
              url: url,
              wrapperDepth: wrapperDepth,
              allowMultipleAds: allowMultipleAds,
              followAdditionalWrappers: followAdditionalWrappers,
            });
          } catch (e) {
            return Promise.reject(e);
          }
          /* Keep wrapper sequence value to not break AdPod when wrapper contain only one Ad.
          e.g,for a AdPod containing :
          - Inline with sequence=1
          - Inline with sequence=2
          - Wrapper with sequence=3 wrapping a Inline with sequence=1
          once parsed we will obtain :
          - Inline sequence 1,
          - Inline sequence 2,
          - Inline sequence 3
          */

          if (
            ads.length === 1 &&
            wrapperSequence !== undefined &&
            wrapperSequence !== null
          ) {
            ads[0].sequence = wrapperSequence;
          } // Split the VAST in case we don't want to resolve everything at the first time

          if (resolveAll === false) {
            this.remainingAds = parserUtils.splitVAST(ads); // Remove the first element from the remaining ads array, since we're going to resolve that element

            ads = this.remainingAds.shift();
          }

          return this.resolveAds(ads, {
            wrapperDepth: wrapperDepth,
            previousUrl: previousUrl,
            url: url,
          });
        },
        /**
         * Resolves an Array of ads, recursively calling itself with the remaining ads if a no ad
         * response is returned for the given array.
         * @param {Array} ads - An array of ads to resolve
         * @param {Object} options - An options Object containing resolving parameters
         * @return {Promise}
         */
      },
      {
        key: "resolveAds",
        value: function resolveAds() {
          var _this6 = this;

          var ads =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : [];

          var _ref3 = arguments.length > 1 ? arguments[1] : undefined,
            wrapperDepth = _ref3.wrapperDepth,
            previousUrl = _ref3.previousUrl,
            url = _ref3.url;

          var resolveWrappersPromises = [];
          previousUrl = url;
          ads.forEach(function (ad) {
            var resolveWrappersPromise = _this6.resolveWrappers(
              ad,
              wrapperDepth,
              previousUrl
            );

            resolveWrappersPromises.push(resolveWrappersPromise);
          });
          return Promise.all(resolveWrappersPromises).then(function (
            unwrappedAds
          ) {
            var resolvedAds = util.flatten(unwrappedAds);

            if (!resolvedAds && _this6.remainingAds.length > 0) {
              var remainingAdsToResolve = _this6.remainingAds.shift();

              return _this6.resolveAds(remainingAdsToResolve, {
                wrapperDepth: wrapperDepth,
                previousUrl: previousUrl,
                url: url,
              });
            }

            return resolvedAds;
          });
        },
        /**
         * Resolves the wrappers for the given ad in a recursive way.
         * Returns a Promise which resolves with the unwrapped ad or rejects with an error.
         * @param {Object} ad - An ad object to be unwrapped.
         * @param {Number} wrapperDepth - The reached depth in the wrapper resolving chain.
         * @param {String} previousUrl - The previous vast url.
         * @return {Promise}
         */
      },
      {
        key: "resolveWrappers",
        value: function resolveWrappers(ad, wrapperDepth, previousUrl) {
          var _this7 = this;

          return new Promise(function (resolve) {
            var _this7$parsingOptions;

            // Going one level deeper in the wrapper chain
            wrapperDepth++; // We already have a resolved VAST ad, no need to resolve wrapper

            if (!ad.nextWrapperURL) {
              delete ad.nextWrapperURL;
              return resolve(ad);
            }

            if (
              wrapperDepth >= _this7.maxWrapperDepth ||
              _this7.parentURLs.indexOf(ad.nextWrapperURL) !== -1
            ) {
              // Wrapper limit reached, as defined by the video player.
              // Too many Wrapper responses have been received with no InLine response.
              ad.errorCode = 302;
              delete ad.nextWrapperURL;
              return resolve(ad);
            } // Get full URL

            ad.nextWrapperURL = parserUtils.resolveVastAdTagURI(
              ad.nextWrapperURL,
              previousUrl
            );

            _this7.URLTemplateFilters.forEach(function (filter) {
              ad.nextWrapperURL = filter(ad.nextWrapperURL);
            }); // If allowMultipleAds is set inside the parameter 'option' of public method
            // override the vast value by the one provided

            var allowMultipleAds =
              (_this7$parsingOptions =
                _this7.parsingOptions.allowMultipleAds) !== null &&
              _this7$parsingOptions !== void 0
                ? _this7$parsingOptions
                : ad.allowMultipleAds; // sequence doesn't carry over in wrapper element

            var wrapperSequence = ad.sequence;

            _this7
              .fetchVAST(ad.nextWrapperURL, wrapperDepth, previousUrl)
              .then(function (xml) {
                return _this7
                  .parse(xml, {
                    url: ad.nextWrapperURL,
                    previousUrl: previousUrl,
                    wrapperSequence: wrapperSequence,
                    wrapperDepth: wrapperDepth,
                    followAdditionalWrappers: ad.followAdditionalWrappers,
                    allowMultipleAds: allowMultipleAds,
                  })
                  .then(function (unwrappedAds) {
                    delete ad.nextWrapperURL;

                    if (unwrappedAds.length === 0) {
                      // No ads returned by the wrappedResponse, discard current <Ad><Wrapper> creatives
                      ad.creatives = [];
                      return resolve(ad);
                    }

                    unwrappedAds.forEach(function (unwrappedAd) {
                      if (unwrappedAd) {
                        parserUtils.mergeWrapperAdData(unwrappedAd, ad);
                      }
                    });
                    resolve(unwrappedAds);
                  });
              })
              ["catch"](function (err) {
                // Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element.
                // (URI was either unavailable or reached a timeout as defined by the video player.)
                ad.errorCode = 301;
                ad.errorMessage = err.message;
                resolve(ad);
              });
          });
        },
        /**
         * Takes care of handling errors when the wrappers are resolved.
         * @param {Object} vastResponse - A resolved VASTResponse.
         */
      },
      {
        key: "completeWrapperResolving",
        value: function completeWrapperResolving(vastResponse) {
          // We've to wait for all <Ad> elements to be parsed before handling error so we can:
          // - Send computed extensions data
          // - Ping all <Error> URIs defined across VAST files
          // No Ad case - The parser never bump into an <Ad> element
          if (vastResponse.ads.length === 0) {
            this.trackVastError(vastResponse.errorURLTemplates, {
              ERRORCODE: 303,
            });
          } else {
            for (var index = vastResponse.ads.length - 1; index >= 0; index--) {
              // - Error encountered while parsing
              // - No Creative case - The parser has dealt with soma <Ad><Wrapper> or/and an <Ad><Inline> elements
              // but no creative was found
              var ad = vastResponse.ads[index];

              if (ad.errorCode || ad.creatives.length === 0) {
                this.trackVastError(
                  ad.errorURLTemplates.concat(vastResponse.errorURLTemplates),
                  {
                    ERRORCODE: ad.errorCode || 303,
                  },
                  {
                    ERRORMESSAGE: ad.errorMessage || "",
                  },
                  {
                    extensions: ad.extensions,
                  },
                  {
                    system: ad.system,
                  }
                );
                vastResponse.ads.splice(index, 1);
              }
            }
          }
        },
      },
    ]);

    return VASTParser;
  })(EventEmitter);

  var storage = null;
  /**
   * This Object represents a default storage to be used in case no other storage is available.
   * @constant
   * @type {Object}
   */

  var DEFAULT_STORAGE = {
    data: {},
    length: 0,
    getItem: function getItem(key) {
      return this.data[key];
    },
    setItem: function setItem(key, value) {
      this.data[key] = value;
      this.length = Object.keys(this.data).length;
    },
    removeItem: function removeItem(key) {
      delete this.data[key];
      this.length = Object.keys(this.data).length;
    },
    clear: function clear() {
      this.data = {};
      this.length = 0;
    },
  };
  /**
   * This class provides an wrapper interface to the a key-value storage.
   * It uses localStorage, sessionStorage or a custom storage if none of the two is available.
   * @export
   * @class Storage
   */

  var Storage = /*#__PURE__*/ (function () {
    /**
     * Creates an instance of Storage.
     * @constructor
     */
    function Storage() {
      _classCallCheck(this, Storage);

      this.storage = this.initStorage();
    }
    /**
     * Provides a singleton instance of the wrapped storage.
     * @return {Object}
     */

    _createClass(Storage, [
      {
        key: "initStorage",
        value: function initStorage() {
          if (storage) {
            return storage;
          }

          try {
            storage =
              typeof window !== "undefined" && window !== null
                ? window.localStorage || window.sessionStorage
                : null;
          } catch (storageError) {
            storage = null;
          }

          if (!storage || this.isStorageDisabled(storage)) {
            storage = DEFAULT_STORAGE;
            storage.clear();
          }

          return storage;
        },
        /**
         * Check if storage is disabled (like in certain cases with private browsing).
         * In Safari (Mac + iOS) when private browsing is ON, localStorage is read only
         * http://spin.atomicobject.com/2013/01/23/ios-private-browsing-localstorage/
         * @param {Object} testStorage - The storage to check.
         * @return {Boolean}
         */
      },
      {
        key: "isStorageDisabled",
        value: function isStorageDisabled(testStorage) {
          var testValue = "__VASTStorage__";

          try {
            testStorage.setItem(testValue, testValue);

            if (testStorage.getItem(testValue) !== testValue) {
              testStorage.removeItem(testValue);
              return true;
            }
          } catch (e) {
            return true;
          }

          testStorage.removeItem(testValue);
          return false;
        },
        /**
         * Returns the value for the given key. If the key does not exist, null is returned.
         * @param  {String} key - The key to retrieve the value.
         * @return {any}
         */
      },
      {
        key: "getItem",
        value: function getItem(key) {
          return this.storage.getItem(key);
        },
        /**
         * Adds or updates the value for the given key.
         * @param  {String} key - The key to modify the value.
         * @param  {any} value - The value to be associated with the key.
         * @return {any}
         */
      },
      {
        key: "setItem",
        value: function setItem(key, value) {
          return this.storage.setItem(key, value);
        },
        /**
         * Removes an item for the given key.
         * @param  {String} key - The key to remove the value.
         * @return {any}
         */
      },
      {
        key: "removeItem",
        value: function removeItem(key) {
          return this.storage.removeItem(key);
        },
        /**
         * Removes all the items from the storage.
         */
      },
      {
        key: "clear",
        value: function clear() {
          return this.storage.clear();
        },
      },
    ]);

    return Storage;
  })();

  /**
   * This class provides methods to fetch and parse a VAST document using VASTParser.
   * In addition it provides options to skip consecutive calls based on constraints.
   * @export
   * @class VASTClient
   */

  var VASTClient = /*#__PURE__*/ (function () {
    /**
     * Creates an instance of VASTClient.
     * @param  {Number} cappingFreeLunch - The number of first calls to skip.
     * @param  {Number} cappingMinimumTimeInterval - The minimum time interval between two consecutive calls.
     * @param  {Storage} customStorage - A custom storage to use instead of the default one.
     * @constructor
     */
    function VASTClient(
      cappingFreeLunch,
      cappingMinimumTimeInterval,
      customStorage
    ) {
      _classCallCheck(this, VASTClient);

      this.cappingFreeLunch = cappingFreeLunch || 0;
      this.cappingMinimumTimeInterval = cappingMinimumTimeInterval || 0;
      this.defaultOptions = {
        withCredentials: false,
        timeout: 0,
      };
      this.vastParser = new VASTParser();
      this.storage = customStorage || new Storage(); // Init values if not already set

      if (this.lastSuccessfulAd === undefined) {
        this.lastSuccessfulAd = 0;
      }

      if (this.totalCalls === undefined) {
        this.totalCalls = 0;
      }

      if (this.totalCallsTimeout === undefined) {
        this.totalCallsTimeout = 0;
      }
    }

    _createClass(VASTClient, [
      {
        key: "getParser",
        value: function getParser() {
          return this.vastParser;
        },
      },
      {
        key: "lastSuccessfulAd",
        get: function get() {
          return this.storage.getItem("vast-client-last-successful-ad");
        },
        set: function set(value) {
          this.storage.setItem("vast-client-last-successful-ad", value);
        },
      },
      {
        key: "totalCalls",
        get: function get() {
          return this.storage.getItem("vast-client-total-calls");
        },
        set: function set(value) {
          this.storage.setItem("vast-client-total-calls", value);
        },
      },
      {
        key: "totalCallsTimeout",
        get: function get() {
          return this.storage.getItem("vast-client-total-calls-timeout");
        },
        set: function set(value) {
          this.storage.setItem("vast-client-total-calls-timeout", value);
        },
        /**
         * Returns a boolean indicating if there are more ads to resolve for the current parsing.
         * @return {Boolean}
         */
      },
      {
        key: "hasRemainingAds",
        value: function hasRemainingAds() {
          return this.vastParser.remainingAds.length > 0;
        },
        /**
         * Resolves the next group of ads. If all is true resolves all the remaining ads.
         * @param  {Boolean} all - If true all the remaining ads are resolved
         * @return {Promise}
         */
      },
      {
        key: "getNextAds",
        value: function getNextAds(all) {
          return this.vastParser.getRemainingAds(all);
        },
        /**
         * Gets a parsed VAST document for the given url, applying the skipping rules defined.
         * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
         * @param  {String} url - The url to use to fecth the VAST document.
         * @param  {Object} options - An optional Object of parameters to be applied in the process.
         * @return {Promise}
         */
      },
      {
        key: "get",
        value: function get(url) {
          var _this = this;

          var options =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};
          var now = Date.now();
          options = Object.assign({}, this.defaultOptions, options); // By default the client resolves only the first Ad or AdPod

          if (!options.hasOwnProperty("resolveAll")) {
            options.resolveAll = false;
          } // Check totalCallsTimeout (first call + 1 hour), if older than now,
          // reset totalCalls number, by this way the client will be eligible again
          // for freelunch capping

          if (this.totalCallsTimeout < now) {
            this.totalCalls = 1;
            this.totalCallsTimeout = now + 60 * 60 * 1000;
          } else {
            this.totalCalls++;
          }

          return new Promise(function (resolve, reject) {
            if (_this.cappingFreeLunch >= _this.totalCalls) {
              return reject(
                new Error(
                  "VAST call canceled \u2013 FreeLunch capping not reached yet "
                    .concat(_this.totalCalls, "/")
                    .concat(_this.cappingFreeLunch)
                )
              );
            }

            var timeSinceLastCall = now - _this.lastSuccessfulAd; // Check timeSinceLastCall to be a positive number. If not, this mean the
            // previous was made in the future. We reset lastSuccessfulAd value

            if (timeSinceLastCall < 0) {
              _this.lastSuccessfulAd = 0;
            } else if (timeSinceLastCall < _this.cappingMinimumTimeInterval) {
              return reject(
                new Error(
                  "VAST call canceled \u2013 (".concat(
                    _this.cappingMinimumTimeInterval,
                    ")ms minimum interval reached"
                  )
                )
              );
            }

            _this.vastParser
              .getAndParseVAST(url, options)
              .then(function (response) {
                return resolve(response);
              })
              ["catch"](function (err) {
                return reject(err);
              });
          });
        },
      },
    ]);

    return VASTClient;
  })();

  /**
   * The default skip delay used in case a custom one is not provided
   * @constant
   * @type {Number}
   */

  var DEFAULT_SKIP_DELAY = -1;
  /**
   * This class provides methods to track an ad execution.
   *
   * @export
   * @class VASTTracker
   * @extends EventEmitter
   */

  var VASTTracker = /*#__PURE__*/ (function (_EventEmitter) {
    _inherits(VASTTracker, _EventEmitter);

    var _super = _createSuper(VASTTracker);

    /**
     * Creates an instance of VASTTracker.
     *
     * @param {VASTClient} client - An instance of VASTClient that can be updated by the tracker. [optional]
     * @param {Ad} ad - The ad to track.
     * @param {Creative} creative - The creative to track.
     * @param {Object} [variation=null] - An optional variation of the creative.
     * @constructor
     */
    function VASTTracker(client, ad, creative) {
      var _this;

      var variation =
        arguments.length > 3 && arguments[3] !== undefined
          ? arguments[3]
          : null;

      _classCallCheck(this, VASTTracker);

      _this = _super.call(this);
      _this.ad = ad;
      _this.creative = creative;
      _this.variation = variation;
      _this.muted = false;
      _this.impressed = false;
      _this.skippable = false;
      _this.trackingEvents = {}; // We need to keep the last percentage of the tracker in order to
      // calculate to trigger the events when the VAST duration is short

      _this.lastPercentage = 0;
      _this._alreadyTriggeredQuartiles = {}; // Tracker listeners should be notified with some events
      // no matter if there is a tracking URL or not

      _this.emitAlwaysEvents = [
        "creativeView",
        "start",
        "firstQuartile",
        "midpoint",
        "thirdQuartile",
        "complete",
        "resume",
        "pause",
        "rewind",
        "skip",
        "closeLinear",
        "close",
      ]; // Duplicate the creative's trackingEvents property so we can alter it

      for (var eventName in _this.creative.trackingEvents) {
        var events = _this.creative.trackingEvents[eventName];
        _this.trackingEvents[eventName] = events.slice(0);
      } // Nonlinear and companion creatives provide some tracking information at a variation level
      // While linear creatives provided that at a creative level. That's why we need to
      // differentiate how we retrieve some tracking information.

      if (isCreativeLinear(_this.creative)) {
        _this._initLinearTracking();
      } else {
        _this._initVariationTracking();
      } // If the tracker is associated with a client we add a listener to the start event
      // to update the lastSuccessfulAd property.

      if (client) {
        _this.on("start", function () {
          client.lastSuccessfulAd = Date.now();
        });
      }

      return _this;
    }
    /**
     * Init the custom tracking options for linear creatives.
     *
     * @return {void}
     */

    _createClass(VASTTracker, [
      {
        key: "_initLinearTracking",
        value: function _initLinearTracking() {
          this.linear = true;
          this.skipDelay = this.creative.skipDelay;
          this.setDuration(this.creative.duration);
          this.clickThroughURLTemplate =
            this.creative.videoClickThroughURLTemplate;
          this.clickTrackingURLTemplates =
            this.creative.videoClickTrackingURLTemplates;
        },
        /**
         * Init the custom tracking options for nonlinear and companion creatives.
         * These options are provided in the variation Object.
         *
         * @return {void}
         */
      },
      {
        key: "_initVariationTracking",
        value: function _initVariationTracking() {
          this.linear = false;
          this.skipDelay = DEFAULT_SKIP_DELAY; // If no variation has been provided there's nothing else to set

          if (!this.variation) {
            return;
          } // Duplicate the variation's trackingEvents property so we can alter it

          for (var eventName in this.variation.trackingEvents) {
            var events = this.variation.trackingEvents[eventName]; // If for the given eventName we already had some trackingEvents provided by the creative
            // we want to keep both the creative trackingEvents and the variation ones

            if (this.trackingEvents[eventName]) {
              this.trackingEvents[eventName] = this.trackingEvents[
                eventName
              ].concat(events.slice(0));
            } else {
              this.trackingEvents[eventName] = events.slice(0);
            }
          }

          if (isNonLinearAd(this.variation)) {
            this.clickThroughURLTemplate =
              this.variation.nonlinearClickThroughURLTemplate;
            this.clickTrackingURLTemplates =
              this.variation.nonlinearClickTrackingURLTemplates;
            this.setDuration(this.variation.minSuggestedDuration);
          } else if (isCompanionAd(this.variation)) {
            this.clickThroughURLTemplate =
              this.variation.companionClickThroughURLTemplate;
            this.clickTrackingURLTemplates =
              this.variation.companionClickTrackingURLTemplates;
          }
        },
        /**
         * Sets the duration of the ad and updates the quartiles based on that.
         *
         * @param  {Number} duration - The duration of the ad.
         */
      },
      {
        key: "setDuration",
        value: function setDuration(duration) {
          this.assetDuration = duration; // beware of key names, theses are also used as event names

          this.quartiles = {
            firstQuartile: Math.round(25 * this.assetDuration) / 100,
            midpoint: Math.round(50 * this.assetDuration) / 100,
            thirdQuartile: Math.round(75 * this.assetDuration) / 100,
          };
        },
        /**
         * Sets the duration of the ad and updates the quartiles based on that.
         * This is required for tracking time related events.
         *
         * @param {Number} progress - Current playback time in seconds.
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#start
         * @emits VASTTracker#skip-countdown
         * @emits VASTTracker#progress-[0-100]%
         * @emits VASTTracker#progress-[currentTime]
         * @emits VASTTracker#rewind
         * @emits VASTTracker#firstQuartile
         * @emits VASTTracker#midpoint
         * @emits VASTTracker#thirdQuartile
         */
      },
      {
        key: "setProgress",
        value: function setProgress(progress) {
          var _this2 = this;

          var macros =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};
          var skipDelay = this.skipDelay || DEFAULT_SKIP_DELAY;

          if (skipDelay !== -1 && !this.skippable) {
            if (skipDelay > progress) {
              this.emit("skip-countdown", skipDelay - progress);
            } else {
              this.skippable = true;
              this.emit("skip-countdown", 0);
            }
          }

          if (this.assetDuration > 0) {
            var percent = Math.round((progress / this.assetDuration) * 100);
            var events = [];

            if (progress > 0) {
              events.push("start");

              for (var i = this.lastPercentage; i < percent; i++) {
                events.push("progress-".concat(i + 1, "%"));
              }

              events.push("progress-".concat(Math.round(progress)));

              for (var quartile in this.quartiles) {
                if (
                  this.isQuartileReached(
                    quartile,
                    this.quartiles[quartile],
                    progress
                  )
                ) {
                  events.push(quartile);
                  this._alreadyTriggeredQuartiles[quartile] = true;
                }
              }

              this.lastPercentage = percent;
            }

            events.forEach(function (eventName) {
              _this2.track(eventName, {
                macros: macros,
                once: true,
              });
            });

            if (progress < this.progress) {
              this.track("rewind", {
                macros: macros,
              });
            }
          }

          this.progress = progress;
        },
        /**
         * Checks if a quartile has been reached without have being triggered already.
         *
         * @param {String} quartile - Quartile name
         * @param {Number} time - Time offset, when this quartile is reached in seconds.
         * @param {Number} progress - Current progress of the ads in seconds.
         *
         * @return {Boolean}
         */
      },
      {
        key: "isQuartileReached",
        value: function isQuartileReached(quartile, time, progress) {
          var quartileReached = false; // if quartile time already reached and never triggered

          if (time <= progress && !this._alreadyTriggeredQuartiles[quartile]) {
            quartileReached = true;
          }

          return quartileReached;
        },
        /**
         * Updates the mute state and calls the mute/unmute tracking URLs.
         *
         * @param {Boolean} muted - Indicates if the video is muted or not.
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#mute
         * @emits VASTTracker#unmute
         */
      },
      {
        key: "setMuted",
        value: function setMuted(muted) {
          var macros =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          if (this.muted !== muted) {
            this.track(muted ? "mute" : "unmute", {
              macros: macros,
            });
          }

          this.muted = muted;
        },
        /**
         * Update the pause state and call the resume/pause tracking URLs.
         *
         * @param {Boolean} paused - Indicates if the video is paused or not.
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#pause
         * @emits VASTTracker#resume
         */
      },
      {
        key: "setPaused",
        value: function setPaused(paused) {
          var macros =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          if (this.paused !== paused) {
            this.track(paused ? "pause" : "resume", {
              macros: macros,
            });
          }

          this.paused = paused;
        },
        /**
         * Updates the fullscreen state and calls the fullscreen tracking URLs.
         *
         * @param {Boolean} fullscreen - Indicates if the video is in fulscreen mode or not.
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#fullscreen
         * @emits VASTTracker#exitFullscreen
         */
      },
      {
        key: "setFullscreen",
        value: function setFullscreen(fullscreen) {
          var macros =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          if (this.fullscreen !== fullscreen) {
            this.track(fullscreen ? "fullscreen" : "exitFullscreen", {
              macros: macros,
            });
          }

          this.fullscreen = fullscreen;
        },
        /**
         * Updates the expand state and calls the expand/collapse tracking URLs.
         *
         * @param {Boolean} expanded - Indicates if the video is expanded or not.
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#expand
         * @emits VASTTracker#playerExpand
         * @emits VASTTracker#collapse
         * @emits VASTTracker#playerCollapse
         */
      },
      {
        key: "setExpand",
        value: function setExpand(expanded) {
          var macros =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          if (this.expanded !== expanded) {
            this.track(expanded ? "expand" : "collapse", {
              macros: macros,
            });
            this.track(expanded ? "playerExpand" : "playerCollapse", {
              macros: macros,
            });
          }

          this.expanded = expanded;
        },
        /**
         * Must be called if you want to overwrite the <Linear> Skipoffset value.
         * This will init the skip countdown duration. Then, every time setProgress() is called,
         * it will decrease the countdown and emit a skip-countdown event with the remaining time.
         * Do not call this method if you want to keep the original Skipoffset value.
         *
         * @param {Number} duration - The time in seconds until the skip button is displayed.
         */
      },
      {
        key: "setSkipDelay",
        value: function setSkipDelay(duration) {
          if (typeof duration === "number") {
            this.skipDelay = duration;
          }
        },
        /**
         * Tracks an impression (can be called only once).
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#creativeView
         */
      },
      {
        key: "trackImpression",
        value: function trackImpression() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};

          if (!this.impressed) {
            this.impressed = true;
            this.trackURLs(this.ad.impressionURLTemplates, macros);
            this.track("creativeView", {
              macros: macros,
            });
          }
        },
        /**
         * Send a request to the URI provided by the VAST <Error> element.
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
         */
      },
      {
        key: "error",
        value: function error() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          var isCustomCode =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : false;
          this.trackURLs(this.ad.errorURLTemplates, macros, {
            isCustomCode: isCustomCode,
          });
        },
        /**
         * Send a request to the URI provided by the VAST <Error> element.
         * If an [ERRORCODE] macro is included, it will be substitute with errorCode.
         * @deprecated
         * @param {String} errorCode - Replaces [ERRORCODE] macro. [ERRORCODE] values are listed in the VAST specification.
         * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
         */
      },
      {
        key: "errorWithCode",
        value: function errorWithCode(errorCode) {
          var isCustomCode =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : false;
          this.error(
            {
              ERRORCODE: errorCode,
            },
            isCustomCode
          ); //eslint-disable-next-line

          console.log(
            "The method errorWithCode is deprecated, please use vast tracker error method instead"
          );
        },
        /**
         * Must be called when the user watched the linear creative until its end.
         * Calls the complete tracking URLs.
         *
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#complete
         */
      },
      {
        key: "complete",
        value: function complete() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.track("complete", {
            macros: macros,
          });
        },
        /**
         * Must be called if the ad was not and will not be played
         * This is a terminal event; no other tracking events should be sent when this is used.
         * Calls the notUsed tracking URLs.
         *
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#notUsed
         */
      },
      {
        key: "notUsed",
        value: function notUsed() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.track("notUsed", {
            macros: macros,
          });
          this.trackingEvents = [];
        },
        /**
         * An optional metric that can capture all other user interactions
         * under one metric such as hover-overs, or custom clicks. It should NOT replace
         * clickthrough events or other existing events like mute, unmute, pause, etc.
         * Calls the otherAdInteraction tracking URLs.
         *
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#otherAdInteraction
         */
      },
      {
        key: "otherAdInteraction",
        value: function otherAdInteraction() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.track("otherAdInteraction", {
            macros: macros,
          });
        },
        /**
         * Must be called if the user clicked or otherwise activated a control used to
         * pause streaming content,* which either expands the ad within the player’s
         * viewable area or “takes-over” the streaming content area by launching
         * additional portion of the ad.
         * Calls the acceptInvitation tracking URLs.
         *
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#acceptInvitation
         */
      },
      {
        key: "acceptInvitation",
        value: function acceptInvitation() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.track("acceptInvitation", {
            macros: macros,
          });
        },
        /**
         * Must be called if user activated a control to expand the creative.
         * Calls the adExpand tracking URLs.
         *
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#adExpand
         */
      },
      {
        key: "adExpand",
        value: function adExpand() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.track("adExpand", {
            macros: macros,
          });
        },
        /**
         * Must be called when the user activated a control to reduce the creative to its original dimensions.
         * Calls the adCollapse tracking URLs.
         *
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#adCollapse
         */
      },
      {
        key: "adCollapse",
        value: function adCollapse() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.track("adCollapse", {
            macros: macros,
          });
        },
        /**
         * Must be called if the user clicked or otherwise activated a control used to minimize the ad.
         * Calls the minimize tracking URLs.
         *
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#minimize
         */
      },
      {
        key: "minimize",
        value: function minimize() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.track("minimize", {
            macros: macros,
          });
        },
        /**
         * Must be called if the player did not or was not able to execute the provided
         * verification code.The [REASON] macro must be filled with reason code
         * Calls the verificationNotExecuted tracking URL of associated verification vendor.
         *
         * @param {String} vendor - An identifier for the verification vendor. The recommended format is [domain]-[useCase], to avoid name collisions. For example, "company.com-omid".
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#verificationNotExecuted
         */
      },
      {
        key: "verificationNotExecuted",
        value: function verificationNotExecuted(vendor) {
          var macros =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          if (
            !this.ad ||
            !this.ad.adVerifications ||
            !this.ad.adVerifications.length
          ) {
            throw new Error("No adVerifications provided");
          }

          if (!vendor) {
            throw new Error(
              "No vendor provided, unable to find associated verificationNotExecuted"
            );
          }

          var vendorVerification = this.ad.adVerifications.find(function (
            verifications
          ) {
            return verifications.vendor === vendor;
          });

          if (!vendorVerification) {
            throw new Error(
              "No associated verification element found for vendor: ".concat(
                vendor
              )
            );
          }

          var vendorTracking = vendorVerification.trackingEvents;

          if (vendorTracking && vendorTracking.verificationNotExecuted) {
            var verifsNotExecuted = vendorTracking.verificationNotExecuted;
            this.trackURLs(verifsNotExecuted, macros);
            this.emit("verificationNotExecuted", {
              trackingURLTemplates: verifsNotExecuted,
            });
          }
        },
        /**
         * The time that the initial ad is displayed. This time is based on
         * the time between the impression and either the completed length of display based
         * on the agreement between transactional parties or a close, minimize, or accept
         * invitation event.
         * The time will be passed using [ADPLAYHEAD] macros for VAST 4.1
         * Calls the overlayViewDuration tracking URLs.
         *
         * @param {String} duration - The time that the initial ad is displayed.
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#overlayViewDuration
         */
      },
      {
        key: "overlayViewDuration",
        value: function overlayViewDuration(duration) {
          var macros =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};
          macros["ADPLAYHEAD"] = duration;
          this.track("overlayViewDuration", {
            macros: macros,
          });
        },
        /**
         * Must be called when the player or the window is closed during the ad.
         * Calls the `closeLinear` (in VAST 3.0 and 4.1) and `close` tracking URLs.
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         *
         * @emits VASTTracker#closeLinear
         * @emits VASTTracker#close
         */
      },
      {
        key: "close",
        value: function close() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.track(this.linear ? "closeLinear" : "close", {
            macros: macros,
          });
        },
        /**
         * Must be called when the skip button is clicked. Calls the skip tracking URLs.
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         *
         * @emits VASTTracker#skip
         */
      },
      {
        key: "skip",
        value: function skip() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.track("skip", {
            macros: macros,
          });
        },
        /**
         * Must be called then loaded and buffered the creative’s media and assets either fully
         * or to the extent that it is ready to play the media
         * Calls the loaded tracking URLs.
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         *
         * @emits VASTTracker#loaded
         */
      },
      {
        key: "load",
        value: function load() {
          var macros =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          this.track("loaded", {
            macros: macros,
          });
        },
        /**
         * Must be called when the user clicks on the creative.
         * It calls the tracking URLs and emits a 'clickthrough' event with the resolved
         * clickthrough URL when done.
         *
         * @param {String} [fallbackClickThroughURL=null] - an optional clickThroughURL template that could be used as a fallback
         * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
         * @emits VASTTracker#clickthrough
         */
      },
      {
        key: "click",
        value: function click() {
          var fallbackClickThroughURL =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : null;
          var macros =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          if (
            this.clickTrackingURLTemplates &&
            this.clickTrackingURLTemplates.length
          ) {
            this.trackURLs(this.clickTrackingURLTemplates, macros);
          } // Use the provided fallbackClickThroughURL as a fallback

          var clickThroughURLTemplate =
            this.clickThroughURLTemplate || fallbackClickThroughURL; // clone second usage of macros, which get mutated inside resolveURLTemplates

          var clonedMacros = _objectSpread2({}, macros);

          if (clickThroughURLTemplate) {
            if (this.progress) {
              clonedMacros["ADPLAYHEAD"] = this.progressFormatted();
            }

            var clickThroughURL = util.resolveURLTemplates(
              [clickThroughURLTemplate],
              clonedMacros
            )[0];
            this.emit("clickthrough", clickThroughURL);
          }
        },
        /**
         * Calls the tracking URLs for the given eventName and emits the event.
         *
         * @param {String} eventName - The name of the event.
         * @param {Object} [macros={}] - An optional Object of parameters(vast macros) to be used in the tracking calls.
         * @param {Boolean} [once=false] - Boolean to define if the event has to be tracked only once.
         *
         */
      },
      {
        key: "track",
        value: function track(eventName) {
          var _ref =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : {},
            _ref$macros = _ref.macros,
            macros = _ref$macros === void 0 ? {} : _ref$macros,
            _ref$once = _ref.once,
            once = _ref$once === void 0 ? false : _ref$once;

          // closeLinear event was introduced in VAST 3.0
          // Fallback to vast 2.0 close event if necessary
          if (
            eventName === "closeLinear" &&
            !this.trackingEvents[eventName] &&
            this.trackingEvents["close"]
          ) {
            eventName = "close";
          }

          var trackingURLTemplates = this.trackingEvents[eventName];
          var isAlwaysEmitEvent = this.emitAlwaysEvents.indexOf(eventName) > -1;

          if (trackingURLTemplates) {
            this.emit(eventName, {
              trackingURLTemplates: trackingURLTemplates,
            });
            this.trackURLs(trackingURLTemplates, macros);
          } else if (isAlwaysEmitEvent) {
            this.emit(eventName, null);
          }

          if (once) {
            delete this.trackingEvents[eventName];

            if (isAlwaysEmitEvent) {
              this.emitAlwaysEvents.splice(
                this.emitAlwaysEvents.indexOf(eventName),
                1
              );
            }
          }
        },
        /**
         * Calls the tracking urls templates with the given macros .
         *
         * @param {Array} URLTemplates - An array of tracking url templates.
         * @param {Object} [macros ={}] - An optional Object of parameters to be used in the tracking calls.
         * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
         */
      },
      {
        key: "trackURLs",
        value: function trackURLs(URLTemplates) {
          var macros =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};
          var options =
            arguments.length > 2 && arguments[2] !== undefined
              ? arguments[2]
              : {};

          //Avoid mutating the object received in parameters.
          var givenMacros = _objectSpread2({}, macros);

          if (this.linear) {
            if (
              this.creative &&
              this.creative.mediaFiles &&
              this.creative.mediaFiles[0] &&
              this.creative.mediaFiles[0].fileURL
            ) {
              givenMacros["ASSETURI"] = this.creative.mediaFiles[0].fileURL;
            }

            if (this.progress) {
              givenMacros["ADPLAYHEAD"] = this.progressFormatted();
            }
          }

          if (
            this.creative &&
            this.creative.universalAdId &&
            this.creative.universalAdId.idRegistry &&
            this.creative.universalAdId.value
          ) {
            givenMacros["UNIVERSALADID"] = ""
              .concat(this.creative.universalAdId.idRegistry, " ")
              .concat(this.creative.universalAdId.value);
          }

          if (this.ad) {
            if (this.ad.sequence) {
              givenMacros["PODSEQUENCE"] = this.ad.sequence;
            }

            if (this.ad.adType) {
              givenMacros["ADTYPE"] = this.ad.adType;
            }

            if (this.ad.adServingId) {
              givenMacros["ADSERVINGID"] = this.ad.adServingId;
            }

            if (this.ad.categories && this.ad.categories.length) {
              givenMacros["ADCATEGORIES"] = this.ad.categories
                .map(function (categorie) {
                  return categorie.value;
                })
                .join(",");
            }

            if (
              this.ad.blockedAdCategories &&
              this.ad.blockedAdCategories.length
            ) {
              givenMacros["BLOCKEDADCATEGORIES"] = this.ad.blockedAdCategories;
            }
          }

          util.track(URLTemplates, givenMacros, options);
        },
        /**
         * Formats time in seconds to VAST timecode (e.g. 00:00:10.000)
         *
         * @param {Number} timeInSeconds - Number in seconds
         * @return {String}
         */
      },
      {
        key: "convertToTimecode",
        value: function convertToTimecode(timeInSeconds) {
          var progress = timeInSeconds * 1000;
          var hours = Math.floor(progress / (60 * 60 * 1000));
          var minutes = Math.floor((progress / (60 * 1000)) % 60);
          var seconds = Math.floor((progress / 1000) % 60);
          var milliseconds = Math.floor(progress % 1000);
          return ""
            .concat(util.leftpad(hours, 2), ":")
            .concat(util.leftpad(minutes, 2), ":")
            .concat(util.leftpad(seconds, 2), ".")
            .concat(util.leftpad(milliseconds, 3));
        },
        /**
         * Formats time progress in a readable string.
         *
         * @return {String}
         */
      },
      {
        key: "progressFormatted",
        value: function progressFormatted() {
          return this.convertToTimecode(this.progress);
        },
      },
    ]);

    return VASTTracker;
  })(EventEmitter);

  const VPAIDCondition = (item) => {
    return (
      item.apiFramework === "VPAID" &&
      item.mimeType === "application/javascript"
    );
  };

  const decodeURLs = (decode) => {
    return decode.map((encoded) => decodeURI(encoded));
  };
  const setCurrentAds = (props) => {
    const currentAds = {};
    currentAds.ads = props.restAds.ads[0];
    currentAds.ads.errorURLTemplates = decodeURLs(
      currentAds.ads.errorURLTemplates
    );
    currentAds.containVPAID =
      currentAds.ads.creatives[0].mediaFiles.some(VPAIDCondition);
    currentAds.tracker = new VASTTracker(
      props.vastClient,
      currentAds.ads,
      currentAds.ads.creatives[0]
    );
    currentAds.vastClient = props.vastClient;
    return currentAds;
  };

  const getNextAds = (vastClient) =>
    __awaiter(void 0, void 0, void 0, function* () {
      if (vastClient.hasRemainingAds()) {
        try {
          const restAds = yield vastClient.getNextAds();
          return setCurrentAds({ vastClient, restAds: restAds });
        } catch (error) {
          if (vastClient.hasRemainingAds()) {
            return getNextAds(vastClient);
          } else throw new ReinitError(errorCodesVAST["No active campaign"]);
        }
      } else {
        throw new ReinitError(errorCodesVAST["No active campaign"]);
      }
    });

  /* outstream/src/icon-close.svelte generated by Svelte v3.49.0 */

  const file$4 = "outstream/src/icon-close.svelte";

  function add_css$4(target) {
    append_styles(
      target,
      "svelte-1o88tea",
      ".df--close.svelte-1o88tea{z-index:2;transition:all 0.2s linear;margin-right:14px;border:none;background:none;cursor:pointer;margin-left:auto;color:var(--color--line);float:var(--floating)}.df--close--svg.svelte-1o88tea{width:0.8rem}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi1jbG9zZS5zdmVsdGUiLCJtYXBwaW5ncyI6IkFBNEJFLFVBQUEsZUFBQSxDQUFBLEFBQ0UsT0FBQSxDQUFBLENBQVUsQ0FDVixVQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxNQUEyQixDQUMzQixZQUFBLENBQUEsSUFBa0IsQ0FDbEIsTUFBQSxDQUFBLElBQVksQ0FDWixVQUFBLENBQUEsSUFBZ0IsQ0FDaEIsTUFBQSxDQUFBLE9BQWUsQ0FDZixXQUFBLENBQUEsSUFBaUIsQ0FDakIsS0FBQSxDQUFBLElBQUEsYUFBQSxDQUF5QixDQUN6QixLQUFBLENBQUEsSUFBQSxVQUFBLENBQXNCLEFBQ3hCLENBQUEsQUFDQSxlQUFBLGVBQUEsQ0FBQSxBQUNFLEtBQUEsQ0FBQSxNQUFhLEFBQ2YsQ0FBQSIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJpY29uLWNsb3NlLnN2ZWx0ZSJdfQ== */"
    );
  }

  function create_fragment$4(ctx) {
    let button;
    let svg;
    let title;
    let t;
    let g1;
    let g0;
    let path;
    let mounted;
    let dispose;

    const block = {
      c: function create() {
        button = element("button");
        svg = svg_element("svg");
        title = svg_element("title");
        t = text("close icon");
        g1 = svg_element("g");
        g0 = svg_element("g");
        path = svg_element("path");
        add_location(title, file$4, 16, 5, 371);
        attr_dev(
          path,
          "d",
          "M9.47,8,15.7,1.77A1.05,1.05,0,0,0,15.7.3a1.05,1.05,0,0,0-1.47,0L8,6.53,1.77.3A1.05,1.05,0,0,0,.3.3a1.05,1.05,0,0,0,0,1.47L6.53,8,.3,14.23a1.05,1.05,0,0,0,0,1.47A1.06,1.06,0,0,0,1,16a1,1,0,0,0,.73-.3L8,9.47l6.23,6.23A1,1,0,0,0,15,16a1.06,1.06,0,0,0,.74-.3,1.05,1.05,0,0,0,0-1.47Z"
        );
        add_location(path, file$4, 18, 9, 418);
        add_location(g0, file$4, 17, 7, 406);
        add_location(g1, file$4, 16, 30, 396);
        attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr_dev(svg, "class", "df--close--svg svelte-1o88tea");
        attr_dev(svg, "viewBox", "0 0 16 16");
        add_location(svg, file$4, 12, 2, 271);
        attr_dev(button, "class", "df--close svelte-1o88tea");
        attr_dev(button, "aria-label", "close");
        set_style(
          button,
          "margin",
          /*floating_css*/ ctx[1] ? "8px 0 8px 8px" : "0 8px"
        );
        set_style(button, "--floating", /*floating_css*/ ctx[1]);
        add_location(button, file$4, 4, 0, 98);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, button, anchor);
        append_dev(button, svg);
        append_dev(svg, title);
        append_dev(title, t);
        append_dev(svg, g1);
        append_dev(g1, g0);
        append_dev(g0, path);

        if (!mounted) {
          dispose = listen_dev(
            button,
            "click",
            function () {
              if (is_function(/*onClick*/ ctx[0]))
                /*onClick*/ ctx[0].apply(this, arguments);
            },
            false,
            false,
            false
          );

          mounted = true;
        }
      },
      p: function update(new_ctx, [dirty]) {
        ctx = new_ctx;

        if (dirty & /*floating_css*/ 2) {
          set_style(
            button,
            "margin",
            /*floating_css*/ ctx[1] ? "8px 0 8px 8px" : "0 8px"
          );
        }

        if (dirty & /*floating_css*/ 2) {
          set_style(button, "--floating", /*floating_css*/ ctx[1]);
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(button);
        mounted = false;
        dispose();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$4.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$4($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("Icon_close", slots, []);

    let { onClick = () => {} } = $$props;

    let { floating_css = "initial" } = $$props;
    const writable_props = ["onClick", "floating_css"];

    Object.keys($$props).forEach((key) => {
      if (
        !~writable_props.indexOf(key) &&
        key.slice(0, 2) !== "$$" &&
        key !== "slot"
      )
        console.warn(`<Icon_close> was created with unknown prop '${key}'`);
    });

    $$self.$$set = ($$props) => {
      if ("onClick" in $$props) $$invalidate(0, (onClick = $$props.onClick));
      if ("floating_css" in $$props)
        $$invalidate(1, (floating_css = $$props.floating_css));
    };

    $$self.$capture_state = () => ({ onClick, floating_css });

    $$self.$inject_state = ($$props) => {
      if ("onClick" in $$props) $$invalidate(0, (onClick = $$props.onClick));
      if ("floating_css" in $$props)
        $$invalidate(1, (floating_css = $$props.floating_css));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [onClick, floating_css];
  }

  class Icon_close extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(
        this,
        options,
        instance$4,
        create_fragment$4,
        safe_not_equal,
        { onClick: 0, floating_css: 1 },
        add_css$4
      );

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Icon_close",
        options,
        id: create_fragment$4.name,
      });
    }

    get onClick() {
      throw new Error(
        "<Icon_close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set onClick(value) {
      throw new Error(
        "<Icon_close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get floating_css() {
      throw new Error(
        "<Icon_close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set floating_css(value) {
      throw new Error(
        "<Icon_close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* outstream/src/icon-reinit.svelte generated by Svelte v3.49.0 */

  const file$3 = "outstream/src/icon-reinit.svelte";

  function add_css$3(target) {
    append_styles(
      target,
      "svelte-1ufu57m",
      ".df--reinit.svelte-1ufu57m{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);display:none !important;border-radius:unset;z-index:5;padding:0;margin:0;width:100%;height:101% !important;border-radius:0 !important;grid-area:1/-1;border:none;outline:none;cursor:pointer}.df--reinit--svg.svelte-1ufu57m{width:2rem !important}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi1yZWluaXQuc3ZlbHRlIiwibWFwcGluZ3MiOiJBQTBCRSxXQUFBLGVBQUEsQ0FBQSxBQUNFLFFBQUEsQ0FBQSxRQUFrQixDQUNsQixHQUFBLENBQUEsR0FBUSxDQUNSLElBQUEsQ0FBQSxHQUFTLENBQ1QsU0FBQSxDQUFBLFVBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxDQUFnQyxDQUNoQyxPQUFBLENBQUEsSUFBQSxDQUFBLFVBQXdCLENBQ3hCLGFBQUEsQ0FBQSxLQUFvQixDQUNwQixPQUFBLENBQUEsQ0FBVSxDQUNWLE9BQUEsQ0FBQSxDQUFVLENBQ1YsTUFBQSxDQUFBLENBQVMsQ0FDVCxLQUFBLENBQUEsSUFBVyxDQUNYLE1BQUEsQ0FBQSxJQUFBLENBQUEsVUFBdUIsQ0FDdkIsYUFBQSxDQUFBLENBQUEsQ0FBQSxVQUEyQixDQUMzQixTQUFBLENBQUEsQ0FBQSxDQUFBLEVBQWUsQ0FDZixNQUFBLENBQUEsSUFBWSxDQUNaLE9BQUEsQ0FBQSxJQUFhLENBQ2IsTUFBQSxDQUFBLE9BQWUsQUFDakIsQ0FBQSxBQUNBLGdCQUFBLGVBQUEsQ0FBQSxBQUNFLEtBQUEsQ0FBQSxJQUFBLENBQUEsVUFBc0IsQUFDeEIsQ0FBQSIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJpY29uLXJlaW5pdC5zdmVsdGUiXX0= */"
    );
  }

  function create_fragment$3(ctx) {
    let button;
    let svg;
    let g1;
    let g0;
    let path;
    let mounted;
    let dispose;

    const block = {
      c: function create() {
        button = element("button");
        svg = svg_element("svg");
        g1 = svg_element("g");
        g0 = svg_element("g");
        path = svg_element("path");
        attr_dev(
          path,
          "d",
          "M30.67,0A23.36,23.36,0,0,0,7.34,23.33v.08L2.73,16.46A1.48,1.48,0,0,0,.67,16,1.47,1.47,0,0,0,.25,18.1L7,28.18A1.45,1.45,0,0,0,8,28.83h.18a1.49,1.49,0,0,0,1-.38l9.31-8.39a1.49,1.49,0,1,0-2-2.21l-6.18,5.58v-.11a20.37,20.37,0,1,1,6,14.4,1.48,1.48,0,0,0-2.1,2.1A23.33,23.33,0,1,0,30.67,0Z"
        );
        add_location(path, file$3, 16, 9, 354);
        add_location(g0, file$3, 15, 7, 342);
        add_location(g1, file$3, 14, 5, 332);
        attr_dev(svg, "class", "df--reinit--svg svelte-1ufu57m");
        attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr_dev(svg, "viewBox", "0 0 54 46.67");
        add_location(svg, file$3, 10, 2, 228);
        attr_dev(button, "class", "df--reinit svelte-1ufu57m");
        attr_dev(button, "aria-label", "reinit");
        add_location(button, file$3, 4, 0, 121);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, button, anchor);
        append_dev(button, svg);
        append_dev(svg, g1);
        append_dev(g1, g0);
        append_dev(g0, path);
        /*button_binding*/ ctx[2](button);

        if (!mounted) {
          dispose = listen_dev(
            button,
            "click",
            function () {
              if (is_function(/*onClick*/ ctx[1]))
                /*onClick*/ ctx[1].apply(this, arguments);
            },
            false,
            false,
            false
          );

          mounted = true;
        }
      },
      p: function update(new_ctx, [dirty]) {
        ctx = new_ctx;
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(button);
        /*button_binding*/ ctx[2](null);
        mounted = false;
        dispose();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$3.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$3($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("Icon_reinit", slots, []);

    let { onClick = () => {} } = $$props;

    let { reinitButton = document.createElement("button") } = $$props;
    const writable_props = ["onClick", "reinitButton"];

    Object.keys($$props).forEach((key) => {
      if (
        !~writable_props.indexOf(key) &&
        key.slice(0, 2) !== "$$" &&
        key !== "slot"
      )
        console.warn(`<Icon_reinit> was created with unknown prop '${key}'`);
    });

    function button_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        reinitButton = $$value;
        $$invalidate(0, reinitButton);
      });
    }

    $$self.$$set = ($$props) => {
      if ("onClick" in $$props) $$invalidate(1, (onClick = $$props.onClick));
      if ("reinitButton" in $$props)
        $$invalidate(0, (reinitButton = $$props.reinitButton));
    };

    $$self.$capture_state = () => ({ onClick, reinitButton });

    $$self.$inject_state = ($$props) => {
      if ("onClick" in $$props) $$invalidate(1, (onClick = $$props.onClick));
      if ("reinitButton" in $$props)
        $$invalidate(0, (reinitButton = $$props.reinitButton));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [reinitButton, onClick, button_binding];
  }

  class Icon_reinit extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(
        this,
        options,
        instance$3,
        create_fragment$3,
        safe_not_equal,
        { onClick: 1, reinitButton: 0 },
        add_css$3
      );

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Icon_reinit",
        options,
        id: create_fragment$3.name,
      });
    }

    get onClick() {
      throw new Error(
        "<Icon_reinit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set onClick(value) {
      throw new Error(
        "<Icon_reinit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get reinitButton() {
      throw new Error(
        "<Icon_reinit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set reinitButton(value) {
      throw new Error(
        "<Icon_reinit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  const getStyleVar = (config) => {
    const configVars = {
      "color--line": config.lineColor,
    };
    switch (config.skin) {
      case "dark":
        return Object.assign(Object.assign({}, configVars), {
          "color--icon": "rgb(236, 236, 236)",
          "color--add": "#fff",
          "collor--bg": "rgba(0, 0, 0, 0.53);",
          "color--stroke": "#fff",
        });
      case "white":
        return Object.assign(Object.assign({}, configVars), {
          "color--icon": "rgb(46, 46, 46)",
          "color--add": "rgb(109, 109, 109)",
          "collor--bg": "rgb(236, 236, 236)",
          "color--stroke": "#000",
        });
      default:
        return Object.assign(Object.assign({}, configVars), {
          "color--icon": "rgb(236, 236, 236)",
          "color--add": "#fff",
          "collor--bg": "rgba(0, 0, 0, 0.53);",
          "color--stroke": "#fff",
        });
    }
  };

  const subscriber_queue = [];
  /**
   * Create a `Writable` store that allows both updating and reading by subscription.
   * @param {*=}value initial value
   * @param {StartStopNotifier=}start start and stop notifications for subscriptions
   */
  function writable(value, start = noop) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
      if (safe_not_equal(value, new_value)) {
        value = new_value;
        if (stop) {
          // store is ready
          const run_queue = !subscriber_queue.length;
          for (const subscriber of subscribers) {
            subscriber[1]();
            subscriber_queue.push(subscriber, value);
          }
          if (run_queue) {
            for (let i = 0; i < subscriber_queue.length; i += 2) {
              subscriber_queue[i][0](subscriber_queue[i + 1]);
            }
            subscriber_queue.length = 0;
          }
        }
      }
    }
    function update(fn) {
      set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
      const subscriber = [run, invalidate];
      subscribers.add(subscriber);
      if (subscribers.size === 1) {
        stop = start(set) || noop;
      }
      run(value);
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0) {
          stop();
          stop = null;
        }
      };
    }
    return { set, update, subscribe };
  }

  const complite_value = false;
  const compliteStore = writable(complite_value);

  const duration_value = 0;
  const duration = writable(duration_value);

  class AdsError extends Error {
    constructor() {
      super();
      this.name = "AdsError";
    }
    toString() {
      return `[object ${this.name}]`;
    }
  }

  const error_store = null;
  const errorStore = writable(error_store);

  const impression_value = false;
  const impressionStore = writable(impression_value);

  const retry_store = 0;
  const retryStore = writable(retry_store);

  const current_time = 0;
  const currentTime = writable(current_time);

  const video_store = document.createElement("video");
  const videoStore = writable(video_store);

  const replaceMacro = (vastClient, widthAndHeight) => {
    const vastParser = vastClient.getParser();
    vastParser.addURLTemplateFilter((vastUrl) => {
      return vastUrl
        .replace("%5Bwidth%5D", `${widthAndHeight[0]}`)
        .replace("%5Bheight%5D", `${widthAndHeight[1]}`)
        .replace("%5Bpage_url%5D", `${document.location.href}`)
        .replace(
          "%5Brandom%5D",
          `${Math.floor(Math.random() * (100000000 - 1) + 1)}`
        );
    });
  };

  const fetchVast = (props) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const vastClient = new VASTClient();
      const options = {
        withCredentials: true,
        wrapperLimit: 7,
        resolveAll: false,
      };
      replaceMacro(vastClient, props.widthAndHeight);
      const curretnAds = setCurrentAds({
        restAds: yield vastClient.get(props.url, options),
        vastClient,
      });
      return curretnAds;
    });

  const log = (text, isError) => {
    if (isError) {
      console.error("EXTENSION ERROR");
      console.log(text);
      return;
    }
    console.log(`---=== ${text} ===---`);
  };

  const ASPECT_RATIO = 0.5625;
  const MEDIA_QUERYS = [
    "screen and (min-width:340px)",
    "screen and (min-width:1280px)",
    "screen and (min-width:1920px)",
  ];
  const PLAYER_CLASS = "df-player";
  const TEST_BUILD_URL = "https://vst.dftest2.tbhost.org";
  // const TEST_BUILD_URL = "http://localhost:3333";
  const PROD_BUILD_URL = "https://vst.dfnetwork.link";

  let isImpressed = false;
  const autoPlayPause = (video, tracker) => {
    if (isVisible(video)) {
      tracker.setPaused(false);
      tracker.setDuration(1);
      video
        .play()
        .then(() => {
          if (!isImpressed) {
            tracker.trackImpression();
            isImpressed = true;
          }
          tracker.setPaused(false);
        })
        .catch((error) => {
          console.error(`Ошибка старта видео ${error}`);
        });
    } else {
      video.pause();
      tracker.setPaused(true);
    }
  };

  /* outstream/src/video.svelte generated by Svelte v3.49.0 */

  const { Error: Error_1, window: window_1 } = globals;
  const file$2 = "outstream/src/video.svelte";

  function add_css$2(target) {
    append_styles(
      target,
      "svelte-1nckh4",
      ".df--video.svelte-1nckh4{width:100% !important;max-height:100%;object-fit:cover;grid-area:1/ -1}.df--video.svelte-1nckh4:hover{cursor:pointer}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW8uc3ZlbHRlIiwibWFwcGluZ3MiOiJBQW1ORSxVQUFBLGNBQUEsQ0FBQSxBQUNFLEtBQUEsQ0FBQSxJQUFBLENBQUEsVUFBc0IsQ0FDdEIsVUFBQSxDQUFBLElBQWdCLENBQ2hCLFVBQUEsQ0FBQSxLQUFpQixDQUNqQixTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBZ0IsQUFDbEIsQ0FBQSxBQUNBLHdCQUFBLE1BQUEsQUFBQSxDQUFBLEFBQ0UsTUFBQSxDQUFBLE9BQWUsQUFDakIsQ0FBQSIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJ2aWRlby5zdmVsdGUiXX0= */"
    );
  }

  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[20] = list[i];
    return child_ctx;
  }

  // (130:2) {#each props.videoSources as source}
  function create_each_block(ctx) {
    let source;
    let source_src_value;
    let source_type_value;
    let source_media_value;

    const block = {
      c: function create() {
        source = element("source");
        if (
          !src_url_equal(
            source.src,
            (source_src_value = /*source*/ ctx[20].src)
          )
        )
          attr_dev(source, "src", source_src_value);
        attr_dev(source, "type", (source_type_value = /*source*/ ctx[20].type));

        attr_dev(
          source,
          "media",
          (source_media_value =
            navigator.userAgent.search(/Edge/) > 0
              ? ""
              : /*source*/ ctx[20].media)
        );

        add_location(source, file$2, 130, 4, 4625);
      },
      m: function mount(target, anchor) {
        insert_dev(target, source, anchor);
      },
      p: function update(ctx, dirty) {
        if (
          dirty & /*props*/ 1 &&
          !src_url_equal(
            source.src,
            (source_src_value = /*source*/ ctx[20].src)
          )
        ) {
          attr_dev(source, "src", source_src_value);
        }

        if (
          dirty & /*props*/ 1 &&
          source_type_value !== (source_type_value = /*source*/ ctx[20].type)
        ) {
          attr_dev(source, "type", source_type_value);
        }

        if (
          dirty & /*props*/ 1 &&
          source_media_value !==
            (source_media_value =
              navigator.userAgent.search(/Edge/) > 0
                ? ""
                : /*source*/ ctx[20].media)
        ) {
          attr_dev(source, "media", source_media_value);
        }
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(source);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block.name,
      type: "each",
      source: "(130:2) {#each props.videoSources as source}",
      ctx,
    });

    return block;
  }

  function create_fragment$2(ctx) {
    let video;
    let video_muted_value;
    let video_updating = false;
    let video_animationframe;
    let mounted;
    let dispose;
    let each_value = /*props*/ ctx[0].videoSources;
    validate_each_argument(each_value);
    let each_blocks = [];

    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }

    function video_timeupdate_handler() {
      cancelAnimationFrame(video_animationframe);

      if (!video.paused) {
        video_animationframe = raf(video_timeupdate_handler);
        video_updating = true;
      }

      /*video_timeupdate_handler*/ ctx[15].call(video);
    }

    const block = {
      c: function create() {
        video = element("video");

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        attr_dev(video, "class", "df--video svelte-1nckh4");
        video.muted = video_muted_value = /*props*/ ctx[0].isMuted;
        attr_dev(video, "preload", "metadata");
        video.playsInline = true;
        attr_dev(video, "x-webkit-airplay", "allow");
        attr_dev(video, "webkit-playsinline", "");
        video.controls = false;
        video.autoplay = true;
        set_style(video, "height", /*videoHeight*/ ctx[1]);
        attr_dev(
          video,
          "poster",
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQEAAAAACwAAAAAAQABAAACAkQBADs="
        );
        add_location(video, file$2, 106, 0, 3924);
      },
      l: function claim(nodes) {
        throw new Error_1(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, video, anchor);

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(video, null);
        }

        /*video_binding*/ ctx[14](video);

        if (!mounted) {
          dispose = [
            listen_dev(
              window_1,
              "scroll",
              /*setVideoHeightAndPlayPause*/ ctx[13],
              false,
              false,
              false
            ),
            listen_dev(
              window_1,
              "resize",
              /*setVideoHeightAndPlayPause*/ ctx[13],
              false,
              false,
              false
            ),
            listen_dev(
              video,
              "canplay",
              /*loaded*/ ctx[11],
              false,
              false,
              false
            ),
            listen_dev(
              video,
              "play",
              /*playAction*/ ctx[5],
              false,
              false,
              false
            ),
            listen_dev(
              video,
              "play",
              /*playActionOnce*/ ctx[4],
              { once: true },
              false,
              false
            ),
            listen_dev(
              video,
              "pause",
              /*pauseAction*/ ctx[7],
              false,
              false,
              false
            ),
            listen_dev(
              video,
              "error",
              /*errorAction*/ ctx[6],
              false,
              false,
              false
            ),
            listen_dev(
              video,
              "click",
              /*clickAction*/ ctx[10],
              false,
              false,
              false
            ),
            listen_dev(
              video,
              "volumechange",
              /*volumeAction*/ ctx[9],
              false,
              false,
              false
            ),
            listen_dev(video, "timeupdate", video_timeupdate_handler),
            listen_dev(
              video,
              "mouseover",
              /*otherAdInteraction*/ ctx[12],
              false,
              false,
              false
            ),
            listen_dev(
              video,
              "ended",
              /*endedAction*/ ctx[8],
              false,
              false,
              false
            ),
          ];

          mounted = true;
        }
      },
      p: function update(ctx, [dirty]) {
        if (dirty & /*props, navigator*/ 1) {
          each_value = /*props*/ ctx[0].videoSources;
          validate_each_argument(each_value);
          let i;

          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context(ctx, each_value, i);

            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(video, null);
            }
          }

          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }

          each_blocks.length = each_value.length;
        }

        if (
          dirty & /*props*/ 1 &&
          video_muted_value !== (video_muted_value = /*props*/ ctx[0].isMuted)
        ) {
          prop_dev(video, "muted", video_muted_value);
        }

        if (dirty & /*videoHeight*/ 2) {
          set_style(video, "height", /*videoHeight*/ ctx[1]);
        }

        if (
          !video_updating &&
          dirty & /*$currentTime*/ 8 &&
          !isNaN(/*$currentTime*/ ctx[3])
        ) {
          video.currentTime = /*$currentTime*/ ctx[3];
        }

        video_updating = false;
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(video);
        destroy_each(each_blocks, detaching);
        /*video_binding*/ ctx[14](null);
        mounted = false;
        run_all(dispose);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$2.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$2($$self, $$props, $$invalidate) {
    let $videoStore;
    let $compliteStore;
    let $duration;
    let $currentTime;
    validate_store(videoStore, "videoStore");
    component_subscribe($$self, videoStore, ($$value) =>
      $$invalidate(2, ($videoStore = $$value))
    );
    validate_store(compliteStore, "compliteStore");
    component_subscribe($$self, compliteStore, ($$value) =>
      $$invalidate(17, ($compliteStore = $$value))
    );
    validate_store(duration, "duration");
    component_subscribe($$self, duration, ($$value) =>
      $$invalidate(18, ($duration = $$value))
    );
    validate_store(currentTime, "currentTime");
    component_subscribe($$self, currentTime, ($$value) =>
      $$invalidate(3, ($currentTime = $$value))
    );
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("Video", slots, []);

    let {
      props = {
        isMuted: true,
        videoSources: [
          {
            src: "",
            type: "video/mp4",
            media: "",
            poster: "",
          },
        ],
        currentAds: {},
        looped: "true",
        reinitButton: document.createElement("button"),
        config: {},
      },
    } = $$props;

    let videoHeight = "";
    const playActionOnce = () => props.currentAds.tracker.trackImpression();

    const playAction = () => {
      props.currentAds.tracker.setPaused(false);
    };

    const errorAction = (error) => {
      if (error instanceof Error) {
        log(
          `Error in source video - ${
            (error === null || error === void 0 ? void 0 : error.message) ||
            error
          }`
        );
      }

      errorStore.set(new AdsError());
    };

    const pauseAction = () => props.currentAds.tracker.setPaused(true);

    const endedAction = () => {
      isComplited ? "" : props.currentAds.tracker.complete();
      isComplited = true;
      log("PLAYER ended");

      const reinitAction = () => {
        props.reinitButton.setAttribute("style", "display:block !important");
        $videoStore.setAttribute("preload", "none");
        $videoStore.load();
      };

      props.looped === "true" ? $videoStore.play() : reinitAction();
    };

    const volumeAction = (e) => {
      props.currentAds.tracker.setMuted(e.target.muted);
    };

    const clickAction = () => {
      var _a, _b;

      props.currentAds.tracker.click(
        (_b =
          (_a = props.currentAds.ads.creatives[0]) === null || _a === void 0
            ? void 0
            : _a.videoClickThroughURLTemplate) === null || _b === void 0
          ? void 0
          : _b.url
      );
    };

    let unsubscribeTimeUp = currentTime.subscribe((progressTime) => {
      props.currentAds.tracker.setProgress(progressTime);
    });

    const loaded = () => {
      duration.set($videoStore.duration);
      props.currentAds.tracker.setDuration($duration);
      props.currentAds.tracker.load();
    };

    const otherAdInteraction = () => {
      props.currentAds.tracker.otherAdInteraction();
    };

    onMount(() => {
      var _a;
      const tracker = props.currentAds.tracker;
      autoPlayPause($videoStore, tracker);

      (_a = props.reinitButton) === null || _a === void 0
        ? void 0
        : _a.addEventListener("click", () => {
            $videoStore.setAttribute("preload", "none");
            $videoStore.load();
          });

      tracker.on("clickthrough", (url) => {
        window.open(url);
      });

      tracker.on("creativeView", () => {
        impressionStore.set(true);
        log(`creativeView`);
      });

      tracker.on("complete", () => {
        compliteStore.set(true);
      });

      const lastSource = $videoStore.querySelector("source:last-child");

      lastSource === null || lastSource === void 0
        ? void 0
        : lastSource.addEventListener("error", errorAction);
    });

    onDestroy(() => {
      var _a;
      unsubscribeTimeUp();

      (_a = $videoStore.querySelector("source:last-child")) === null ||
      _a === void 0
        ? void 0
        : _a.removeEventListener("error", errorAction);
    });

    let isComplited = false;

    const setVideoHeightAndPlayPause = () => {
      $$invalidate(
        1,
        (videoHeight =
          `${
            getWitdhAndHeight({
              aspect_ratio: props.config.aspect_ratio || ASPECT_RATIO,
              parentNode: $videoStore,
            })[1]
          }px` || "100%")
      );

      props.looped === "false" && $compliteStore
        ? ""
        : autoPlayPause($videoStore, props.currentAds.tracker);
    };

    const writable_props = ["props"];

    Object.keys($$props).forEach((key) => {
      if (
        !~writable_props.indexOf(key) &&
        key.slice(0, 2) !== "$$" &&
        key !== "slot"
      )
        console.warn(`<Video> was created with unknown prop '${key}'`);
    });

    function video_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        $videoStore = $$value;
        videoStore.set($videoStore);
      });
    }

    function video_timeupdate_handler() {
      $currentTime = this.currentTime;
      currentTime.set($currentTime);
    }

    $$self.$$set = ($$props) => {
      if ("props" in $$props) $$invalidate(0, (props = $$props.props));
    };

    $$self.$capture_state = () => ({
      onDestroy,
      onMount,
      AdsError,
      getWitdhAndHeight,
      log,
      ASPECT_RATIO,
      autoPlayPause,
      compliteStore,
      duration,
      errorStore,
      impressionStore,
      currentTime,
      videoStore,
      props,
      videoHeight,
      playActionOnce,
      playAction,
      errorAction,
      pauseAction,
      endedAction,
      volumeAction,
      clickAction,
      unsubscribeTimeUp,
      loaded,
      otherAdInteraction,
      isComplited,
      setVideoHeightAndPlayPause,
      $videoStore,
      $compliteStore,
      $duration,
      $currentTime,
    });

    $$self.$inject_state = ($$props) => {
      if ("props" in $$props) $$invalidate(0, (props = $$props.props));
      if ("videoHeight" in $$props)
        $$invalidate(1, (videoHeight = $$props.videoHeight));
      if ("unsubscribeTimeUp" in $$props)
        unsubscribeTimeUp = $$props.unsubscribeTimeUp;
      if ("isComplited" in $$props) isComplited = $$props.isComplited;
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [
      props,
      videoHeight,
      $videoStore,
      $currentTime,
      playActionOnce,
      playAction,
      errorAction,
      pauseAction,
      endedAction,
      volumeAction,
      clickAction,
      loaded,
      otherAdInteraction,
      setVideoHeightAndPlayPause,
      video_binding,
      video_timeupdate_handler,
    ];
  }

  class Video extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(
        this,
        options,
        instance$2,
        create_fragment$2,
        safe_not_equal,
        { props: 0 },
        add_css$2
      );

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Video",
        options,
        id: create_fragment$2.name,
      });
    }

    get props() {
      throw new Error_1(
        "<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set props(value) {
      throw new Error_1(
        "<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  const bindToVastActions = (adUnit, vastTracker) => {
    vastTracker.on("start", () => {
      console.log("--== TO VPAID start AD, starting timer on 8s");
      adUnit.startAd();
    });
    vastTracker.on("skip", () => {
      adUnit.skipAd();
    });
  };

  const checkSpec = (VPAIDCreative) => {
    if (
      VPAIDCreative.handshakeVersion &&
      typeof VPAIDCreative.handshakeVersion == "function" &&
      VPAIDCreative.initAd &&
      typeof VPAIDCreative.initAd == "function" &&
      VPAIDCreative.startAd &&
      typeof VPAIDCreative.startAd == "function" &&
      VPAIDCreative.stopAd &&
      typeof VPAIDCreative.stopAd == "function" &&
      VPAIDCreative.skipAd &&
      typeof VPAIDCreative.skipAd == "function" &&
      VPAIDCreative.resizeAd &&
      typeof VPAIDCreative.resizeAd == "function" &&
      VPAIDCreative.pauseAd &&
      typeof VPAIDCreative.pauseAd == "function" &&
      VPAIDCreative.resumeAd &&
      typeof VPAIDCreative.resumeAd == "function" &&
      VPAIDCreative.expandAd &&
      typeof VPAIDCreative.expandAd == "function" &&
      VPAIDCreative.collapseAd &&
      typeof VPAIDCreative.collapseAd == "function" &&
      VPAIDCreative.subscribe &&
      typeof VPAIDCreative.subscribe == "function" &&
      VPAIDCreative.unsubscribe &&
      typeof VPAIDCreative.unsubscribe == "function"
    ) {
      return true;
    }
    return false;
  };

  const createFrameScript = (currentAds, cssId) => {
    var _a, _b;
    return `<head><style>body{margin:0}</style></head><body><script type="text/javascript" id="${cssId}"  charset="UTF-8" src="${
      (_b =
        (_a = currentAds.ads.creatives[0]) === null || _a === void 0
          ? void 0
          : _a.mediaFiles[0]) === null || _b === void 0
        ? void 0
        : _b.fileURL
    }" async></script></body>`;
  };

  const watchForVpaidSize = (props) => {
    const changeVPAIDHeight = () => {
      const parentWidth = props.container.offsetWidth;
      const videoHeight = parentWidth * props.ASPECT_RATIO;
      props.adUnit.resizeAd(parentWidth, videoHeight, "normal");
    };
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        changeVPAIDHeight();
      });
    });
    observer.observe(props.container, { subtree: true, childList: true });
    return () => {
      observer.disconnect();
    };
  };

  const listenEvents = (opt) => {
    let isImpressed = false;
    const reinitAction = () => {
      opt.reinitButton.setAttribute("style", "display:block !important");
      opt.video.setAttribute("preload", "none");
      opt.video.load();
    };
    const track = opt.vastTracker;
    const events = {
      AdLoaded: () => {
        log("Outstream AdLoaded");
        const checkVisibleInterval = setInterval(() => {
          if (isImpressed) {
            return clearInterval(checkVisibleInterval);
          }
          if (isVisible(opt.video)) {
            opt.adUnit.startAd();
            return clearInterval(checkVisibleInterval);
          }
        }, 100);
      },
      AdVolumeChange: () => {
        log("Outstream AdVolumeChange");
        opt.video.addEventListener("volumechange", (e) => {
          track.setMuted(e.target.muted);
        });
      },
      AdVideoStart: () => {
        log("Outstream AdVideoStart");
        if (!isImpressed) {
          isImpressed = true;
          track.trackImpression();
        }
      },
      AdPlaying: () => {
        log("Outstream COOKIE AdPlaying");
        try {
          opt.adUnit.setAdVolume(0);
        } catch (error) {
          console.log("----===== Set volume error  - " + error);
        }
      },
      AdError: (e) => {
        log("Outstream COOKIE AdErro");
        log(String(e), true);
        errorStore.set(new AdsError());
      },
      AdLog: (e) => {
        log(`Outstream COOKIE AdLog`);
        log(e);
      },
      AdImpression: () => {
        log("IMPRASSION Outstream COOKIE");
        isImpressed = true;
        track.trackImpression();
      },
      AdStopped: () => {
        log("Outstream COOKIE send STOPED");
      },
      AdVideoComplete: () => {
        log("Outstream COOKIE VIDEO COMPLETE");
        log(`Is looped - ${opt.looped}`);
        track.complete();
        setTimeout(reinitAction, 175);
      },
      AdUserClose: () => {
        log("Outstream COOKIE EVENT AdUserClose");
        track.complete();
        reinitAction();
      },
      AdPaused: () => {
        log("Outstream COOKIE SEND AdPaused");
      },
      AdClickThru: (url) => {
        log(`AdClickThru - ${url}`);
        track.click(url);
      },
      AdVideoFirstQuartile: () => {
        log("Outstream COOKIE send AdVideoFirstQuartile");
        track.setProgress(25);
      },
      AdVideoMidpoint: () => {
        log("Outstream COOKIE send AdVideoMidpoint");
        track.setProgress(50);
      },
      AdVideoThirdQuartile: () => {
        log("Outstream COOKIE send AdVideoThirdQuartile");
        track.setProgress(75);
      },
      AdSkipped: () => {
        log("Outstream COOKIE send AdSkipped");
        track.skip();
      },
    };
    return events;
  };

  /* outstream/src/vpaid.svelte generated by Svelte v3.49.0 */
  const file$1 = "outstream/src/vpaid.svelte";

  function add_css$1(target) {
    append_styles(
      target,
      "svelte-1jcgo50",
      ".iframe.svelte-1jcgo50{border:0px;margin:0px;opacity:1;padding:0px;height:0;position:absolute;width:0;top:0;left:0}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnBhaWQuc3ZlbHRlIiwibWFwcGluZ3MiOiJBQStKRSxPQUFBLGVBQUEsQ0FBQSxBQUNFLE1BQUEsQ0FBQSxHQUFXLENBQ1gsTUFBQSxDQUFBLEdBQVcsQ0FDWCxPQUFBLENBQUEsQ0FBVSxDQUNWLE9BQUEsQ0FBQSxHQUFZLENBQ1osTUFBQSxDQUFBLENBQVMsQ0FDVCxRQUFBLENBQUEsUUFBa0IsQ0FDbEIsS0FBQSxDQUFBLENBQVEsQ0FDUixHQUFBLENBQUEsQ0FBTSxDQUNOLElBQUEsQ0FBQSxDQUFPLEFBQ1QsQ0FBQSIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJ2cGFpZC5zdmVsdGUiXX0= */"
    );
  }

  function create_fragment$1(ctx) {
    let iframe;

    const block = {
      c: function create() {
        iframe = element("iframe");
        attr_dev(
          iframe,
          "sandbox",
          "allow-same-origin allow-scripts allow-popups"
        );
        attr_dev(iframe, "title", "vpaid");
        attr_dev(iframe, "class", "iframe svelte-1jcgo50");
        add_location(iframe, file$1, 94, 0, 4149);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, iframe, anchor);
        /*iframe_binding*/ ctx[2](iframe);
      },
      p: noop,
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(iframe);
        /*iframe_binding*/ ctx[2](null);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$1.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$1($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("Vpaid", slots, []);

    var __awaiter =
      (this && this.__awaiter) ||
      function (thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P
            ? value
            : new P(function (resolve) {
                resolve(value);
              });
        }

        return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }

          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }

          function step(result) {
            result.done
              ? resolve(result.value)
              : adopt(result.value).then(fulfilled, rejected);
          }

          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };

    let {
      props = {
        isMuted: true,
        currentAds: {},
        config: {},
        widthAndHeight: [0, 0],
        video: document.createElement("video"),
        wrapper: document.createElement("div"),
        container: document.createElement("div"),
        reinitButton: document.createElement("button"),
      },
    } = $$props;

    let iframeVpaid;
    let events;
    let adUnit;

    let observerVpaidUnsub = () => {};

    let eventName;

    function onLoad() {
      var _a;
      log("VPAID LOAD, from outstream player");

      adUnit =
        (_a = iframeVpaid.contentWindow) === null || _a === void 0
          ? void 0
          : _a.getVPAIDAd();

      if (!checkSpec(adUnit)) {
        errorStore.set(new AdsError());
      }

      adUnit.handshakeVersion("2.0");
      const aspectRatio = props.config.aspect_ratio || ASPECT_RATIO;

      adUnit.initAd(
        props.widthAndHeight[0],
        props.widthAndHeight[0] * aspectRatio,
        "normal",
        -1,
        {
          AdParameters: props.currentAds.ads.creatives[0].adParameters,
        },
        {
          slot: props.wrapper,
          videoSlot: props.video,
          videoSlotCanAutoPlay: true,
        }
      );

      observerVpaidUnsub = watchForVpaidSize({
        container: props.wrapper,
        ASPECT_RATIO: aspectRatio,
        adUnit,
      });

      events = listenEvents({
        video: props.video,
        adUnit,
        vastTracker: props.currentAds.tracker,
        looped: props.config.looped,
        reinitButton: props.reinitButton,
      });

      for (eventName in events) {
        log("Subscribe to " + eventName);
        adUnit.subscribe(events[eventName], eventName);
      }

      bindToVastActions(adUnit, props.currentAds.tracker);
    }

    onMount(() =>
      __awaiter(void 0, void 0, void 0, function* () {
        log("VPAID Svelte init, from outstream player");
        const cssId = "df-vpaid";
        const frameContext = iframeVpaid.contentWindow;

        frameContext === null || frameContext === void 0
          ? void 0
          : frameContext.document.write(
              createFrameScript(props.currentAds, cssId)
            );

        const script =
          frameContext === null || frameContext === void 0
            ? void 0
            : frameContext.document.querySelector(`script`);

        script === null || script === void 0
          ? void 0
          : script.addEventListener("load", onLoad);

        script === null || script === void 0
          ? void 0
          : script.addEventListener("error", () =>
              errorStore.set(
                new ReinitError(errorCodesVAST["Can't load VPAID"])
              )
            );

        const is_safari = navigator.userAgent.indexOf("Safari") > -1;

        if (is_safari) {
          frameContext === null || frameContext === void 0
            ? void 0
            : frameContext.document.close();
        }
      })
    );

    onDestroy(() => {
      log("unsubscribe from VPAID events");
      props.currentAds.tracker.close();

      for (eventName in events) {
        adUnit.unsubscribe(events[eventName], eventName);
      }

      observerVpaidUnsub();
    });

    const writable_props = ["props"];

    Object.keys($$props).forEach((key) => {
      if (
        !~writable_props.indexOf(key) &&
        key.slice(0, 2) !== "$$" &&
        key !== "slot"
      )
        console.warn(`<Vpaid> was created with unknown prop '${key}'`);
    });

    function iframe_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        iframeVpaid = $$value;
        $$invalidate(0, iframeVpaid);
      });
    }

    $$self.$$set = ($$props) => {
      if ("props" in $$props) $$invalidate(1, (props = $$props.props));
    };

    $$self.$capture_state = () => ({
      __awaiter,
      onDestroy,
      onMount,
      AdsError,
      errorCodesVAST,
      ReinitError,
      log,
      bindToVastActions,
      checkSpec,
      createFrameScript,
      watchForVpaidSize,
      ASPECT_RATIO,
      errorStore,
      listenEvents,
      props,
      iframeVpaid,
      events,
      adUnit,
      observerVpaidUnsub,
      eventName,
      onLoad,
    });

    $$self.$inject_state = ($$props) => {
      if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
      if ("props" in $$props) $$invalidate(1, (props = $$props.props));
      if ("iframeVpaid" in $$props)
        $$invalidate(0, (iframeVpaid = $$props.iframeVpaid));
      if ("events" in $$props) events = $$props.events;
      if ("adUnit" in $$props) adUnit = $$props.adUnit;
      if ("observerVpaidUnsub" in $$props)
        observerVpaidUnsub = $$props.observerVpaidUnsub;
      if ("eventName" in $$props) eventName = $$props.eventName;
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [iframeVpaid, props, iframe_binding];
  }

  class Vpaid extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(
        this,
        options,
        instance$1,
        create_fragment$1,
        safe_not_equal,
        { props: 1 },
        add_css$1
      );

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Vpaid",
        options,
        id: create_fragment$1.name,
      });
    }

    get props() {
      throw new Error(
        "<Vpaid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set props(value) {
      throw new Error(
        "<Vpaid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* outstream/src/App.svelte generated by Svelte v3.49.0 */

  const { Object: Object_1, console: console_1 } = globals;
  const file = "outstream/src/App.svelte";

  function add_css(target) {
    append_styles(
      target,
      "svelte-1y4c37f",
      '.progress-wrapper.svelte-1y4c37f.svelte-1y4c37f{position:relative;width:100%;display:flex;align-items:center}.progress.svelte-1y4c37f.svelte-1y4c37f{width:100%;height:6px;border-radius:0px;overflow:hidden;position:absolute;margin:0 !important}.progress-bar.svelte-1y4c37f.svelte-1y4c37f{display:block;height:100%;background:var(--color--line);background-size:300% 100%}.df-wrapper.svelte-1y4c37f.svelte-1y4c37f{margin:80px 0 50px 0;position:relative}.df__fly.svelte-1y4c37f.svelte-1y4c37f{position:fixed;bottom:10px;right:10px;z-index:9999999;max-width:300px}.df.svelte-1y4c37f.svelte-1y4c37f{left:0;width:100%;height:100%;grid-area:1/-1}.df-header.svelte-1y4c37f.svelte-1y4c37f{position:absolute;top:-60px;display:block;content:"Ads";font-size:0.75rem;color:var(--color--line);width:100%}.df-line.svelte-1y4c37f.svelte-1y4c37f{background:var(--color--line);height:1px;width:100%}.df-header-ads.svelte-1y4c37f.svelte-1y4c37f{width:100%;display:flex;justify-content:center;align-items:center}.df-header-ads-text.svelte-1y4c37f.svelte-1y4c37f{padding:0 5px;z-index:1}.df-header-ads-description-text.svelte-1y4c37f.svelte-1y4c37f{font-size:1rem;font-weight:bold;margin-right:auto;margin-left:10px;color:var(--color--line)}.df-header-ads-description.svelte-1y4c37f.svelte-1y4c37f{display:flex;align-items:center;justify-content:space-between;margin-top:5px;padding:0 5px}.df-header-ads-description-icon.svelte-1y4c37f.svelte-1y4c37f{max-width:36px}.df.svelte-1y4c37f button.svelte-1y4c37f{color:var(--color--line);background:none;border:none;cursor:pointer;border-radius:50%;outline:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;display:flex;justify-content:center;align-items:center}.df--controls.svelte-1y4c37f.svelte-1y4c37f{display:flex;list-style:none;width:100%;justify-content:flex-end;box-sizing:border-box;align-items:center;position:absolute;bottom:-35px;font-size:0.75rem;color:var(--color--line);width:100%}.df-svg-hider.svelte-1y4c37f.svelte-1y4c37f{opacity:1 !important;transition:opacity 0.1s cubic-bezier(0.4, 0, 1, 1)}.df--controls--mute--svg.svelte-1y4c37f.svelte-1y4c37f{width:1.8rem;color:var(--color--line);z-index:5}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLnN2ZWx0ZSIsIm1hcHBpbmdzIjoiQUFnU0UsaUJBQUEsOEJBQUEsQ0FBQSxBQUNFLFFBQUEsQ0FBQSxRQUFrQixDQUNsQixLQUFBLENBQUEsSUFBVyxDQUNYLE9BQUEsQ0FBQSxJQUFhLENBQ2IsV0FBQSxDQUFBLE1BQW1CLEFBQ3JCLENBQUEsQUFDQSxTQUFBLDhCQUFBLENBQUEsQUFDRSxLQUFBLENBQUEsSUFBVyxDQUNYLE1BQUEsQ0FBQSxHQUFXLENBQ1gsYUFBQSxDQUFBLEdBQWtCLENBQ2xCLFFBQUEsQ0FBQSxNQUFnQixDQUNoQixRQUFBLENBQUEsUUFBa0IsQ0FDbEIsTUFBQSxDQUFBLENBQUEsQ0FBQSxVQUFvQixBQUN0QixDQUFBLEFBRUEsYUFBQSw4QkFBQSxDQUFBLEFBQ0UsT0FBQSxDQUFBLEtBQWMsQ0FDZCxNQUFBLENBQUEsSUFBWSxDQUNaLFVBQUEsQ0FBQSxJQUFBLGFBQUEsQ0FBOEIsQ0FDOUIsZUFBQSxDQUFBLElBQUEsQ0FBQSxJQUEwQixBQUM1QixDQUFBLEFBQ0EsV0FBQSw4QkFBQSxDQUFBLEFBQ0UsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQXFCLENBQ3JCLFFBQUEsQ0FBQSxRQUFrQixBQUNwQixDQUFBLEFBQ0EsUUFBQSw4QkFBQSxDQUFBLEFBQ0UsUUFBQSxDQUFBLEtBQWUsQ0FDZixNQUFBLENBQUEsSUFBWSxDQUNaLEtBQUEsQ0FBQSxJQUFXLENBQ1gsT0FBQSxDQUFBLE9BQWdCLENBQ2hCLFNBQUEsQ0FBQSxLQUFnQixBQUNsQixDQUFBLEFBQ0EsR0FBQSw4QkFBQSxDQUFBLEFBQ0UsSUFBQSxDQUFBLENBQU8sQ0FDUCxLQUFBLENBQUEsSUFBVyxDQUNYLE1BQUEsQ0FBQSxJQUFZLENBQ1osU0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFlLEFBQ2pCLENBQUEsQUFDQSxVQUFBLDhCQUFBLENBQUEsQUFDRSxRQUFBLENBQUEsUUFBa0IsQ0FDbEIsR0FBQSxDQUFBLEtBQVUsQ0FDVixPQUFBLENBQUEsS0FBYyxDQUNkLE9BQUEsQ0FBQSxLQUFjLENBQ2QsU0FBQSxDQUFBLE9BQWtCLENBQ2xCLEtBQUEsQ0FBQSxJQUFBLGFBQUEsQ0FBeUIsQ0FDekIsS0FBQSxDQUFBLElBQVcsQUFDYixDQUFBLEFBQ0EsUUFBQSw4QkFBQSxDQUFBLEFBQ0UsVUFBQSxDQUFBLElBQUEsYUFBQSxDQUE4QixDQUM5QixNQUFBLENBQUEsR0FBVyxDQUNYLEtBQUEsQ0FBQSxJQUFXLEFBQ2IsQ0FBQSxBQUNBLGNBQUEsOEJBQUEsQ0FBQSxBQUNFLEtBQUEsQ0FBQSxJQUFXLENBQ1gsT0FBQSxDQUFBLElBQWEsQ0FDYixlQUFBLENBQUEsTUFBdUIsQ0FDdkIsV0FBQSxDQUFBLE1BQW1CLEFBQ3JCLENBQUEsQUFDQSxtQkFBQSw4QkFBQSxDQUFBLEFBQ0UsT0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFjLENBQ2QsT0FBQSxDQUFBLENBQVUsQUFDWixDQUFBLEFBQ0EsK0JBQUEsOEJBQUEsQ0FBQSxBQUNFLFNBQUEsQ0FBQSxJQUFlLENBQ2YsV0FBQSxDQUFBLElBQWlCLENBQ2pCLFlBQUEsQ0FBQSxJQUFrQixDQUNsQixXQUFBLENBQUEsSUFBaUIsQ0FDakIsS0FBQSxDQUFBLElBQUEsYUFBQSxDQUF5QixBQUMzQixDQUFBLEFBQ0EsMEJBQUEsOEJBQUEsQ0FBQSxBQUNFLE9BQUEsQ0FBQSxJQUFhLENBQ2IsV0FBQSxDQUFBLE1BQW1CLENBQ25CLGVBQUEsQ0FBQSxhQUE4QixDQUM5QixVQUFBLENBQUEsR0FBZSxDQUNmLE9BQUEsQ0FBQSxDQUFBLENBQUEsR0FBYyxBQUNoQixDQUFBLEFBQ0EsK0JBQUEsOEJBQUEsQ0FBQSxBQUNFLFNBQUEsQ0FBQSxJQUFlLEFBQ2pCLENBQUEsQUFDQSxrQkFBQSxDQUFBLE1BQUEsZUFBQSxDQUFBLEFBQ0UsS0FBQSxDQUFBLElBQUEsYUFBQSxDQUF5QixDQUN6QixVQUFBLENBQUEsSUFBZ0IsQ0FDaEIsTUFBQSxDQUFBLElBQVksQ0FFWixNQUFBLENBQUEsT0FBZSxDQUNmLGFBQUEsQ0FBQSxHQUFrQixDQUNsQixPQUFBLENBQUEsSUFBYSxDQUNiLHNCQUFBLENBQUEsV0FBbUMsQ0FDbkMsdUJBQUEsQ0FBQSxTQUFrQyxDQUNsQyxPQUFBLENBQUEsSUFBYSxDQUNiLGVBQUEsQ0FBQSxNQUF1QixDQUN2QixXQUFBLENBQUEsTUFBbUIsQUFDckIsQ0FBQSxBQUVBLGFBQUEsOEJBQUEsQ0FBQSxBQUNFLE9BQUEsQ0FBQSxJQUFhLENBQ2IsVUFBQSxDQUFBLElBQWdCLENBQ2hCLEtBQUEsQ0FBQSxJQUFXLENBQ1gsZUFBQSxDQUFBLFFBQXlCLENBQ3pCLFVBQUEsQ0FBQSxVQUFzQixDQUN0QixXQUFBLENBQUEsTUFBbUIsQ0FDbkIsUUFBQSxDQUFBLFFBQWtCLENBQ2xCLE1BQUEsQ0FBQSxLQUFhLENBQ2IsU0FBQSxDQUFBLE9BQWtCLENBQ2xCLEtBQUEsQ0FBQSxJQUFBLGFBQUEsQ0FBeUIsQ0FDekIsS0FBQSxDQUFBLElBQVcsQUFDYixDQUFBLEFBRUEsYUFBQSw4QkFBQSxDQUFBLEFBQ0UsT0FBQSxDQUFBLENBQUEsQ0FBQSxVQUFxQixDQUNyQixVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBbUQsQUFDckQsQ0FBQSxBQUNBLHdCQUFBLDhCQUFBLENBQUEsQUFDRSxLQUFBLENBQUEsTUFBYSxDQUNiLEtBQUEsQ0FBQSxJQUFBLGFBQUEsQ0FBeUIsQ0FDekIsT0FBQSxDQUFBLENBQVUsQUFDWixDQUFBIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIkFwcC5zdmVsdGUiXX0= */'
    );
  }

  // (123:2) {#if isDisplayPlayer}
  function create_if_block(ctx) {
    let t0;
    let div;
    let t1;
    let video;
    let t2;
    let iconreinit;
    let updating_reinitButton;
    let t3;
    let current_block_type_index;
    let if_block2;
    let div_class_value;
    let current;
    let if_block0 = !(/*isFlying*/ ctx[4]) && create_if_block_3(ctx);
    let if_block1 = /*isFlyyingMode*/ ctx[10] && create_if_block_2(ctx);

    video = new Video({
      props: {
        props: {
          isMuted: /*isMuted*/ ctx[5],
          videoSources: /*videoSources*/ ctx[14],
          looped: String(/*config*/ ctx[0].looped),
          reinitButton: /*reinitButton*/ ctx[6],
          currentAds: /*currentAds*/ ctx[1],
          config: /*config*/ ctx[0],
        },
      },
      $$inline: true,
    });

    function iconreinit_reinitButton_binding(value) {
      /*iconreinit_reinitButton_binding*/ ctx[26](value);
    }

    let iconreinit_props = { onClick: /*reinitAction*/ ctx[17] };

    if (/*reinitButton*/ ctx[6] !== void 0) {
      iconreinit_props.reinitButton = /*reinitButton*/ ctx[6];
    }

    iconreinit = new Icon_reinit({ props: iconreinit_props, $$inline: true });
    binding_callbacks.push(() =>
      bind(iconreinit, "reinitButton", iconreinit_reinitButton_binding)
    );
    const if_block_creators = [create_if_block_1, create_else_block];
    const if_blocks = [];

    function select_block_type(ctx, dirty) {
      if (!(/*currentAds*/ ctx[1].containVPAID)) return 0;
      return 1;
    }

    current_block_type_index = select_block_type(ctx);
    if_block2 = if_blocks[current_block_type_index] =
      if_block_creators[current_block_type_index](ctx);

    const block = {
      c: function create() {
        if (if_block0) if_block0.c();
        t0 = space();
        div = element("div");
        if (if_block1) if_block1.c();
        t1 = space();
        create_component(video.$$.fragment);
        t2 = space();
        create_component(iconreinit.$$.fragment);
        t3 = space();
        if_block2.c();
        attr_dev(
          div,
          "class",
          (div_class_value =
            "" +
            (null_to_empty(/*isFlyyingMode*/ ctx[10] ? "df__fly" : "df") +
              " svelte-1y4c37f"))
        );
        add_location(div, file, 158, 4, 6193);
      },
      m: function mount(target, anchor) {
        if (if_block0) if_block0.m(target, anchor);
        insert_dev(target, t0, anchor);
        insert_dev(target, div, anchor);
        if (if_block1) if_block1.m(div, null);
        append_dev(div, t1);
        mount_component(video, div, null);
        append_dev(div, t2);
        mount_component(iconreinit, div, null);
        append_dev(div, t3);
        if_blocks[current_block_type_index].m(div, null);
        current = true;
      },
      p: function update(ctx, dirty) {
        if (!(/*isFlying*/ ctx[4])) {
          if (if_block0) {
            if_block0.p(ctx, dirty);

            if (dirty[0] & /*isFlying*/ 16) {
              transition_in(if_block0, 1);
            }
          } else {
            if_block0 = create_if_block_3(ctx);
            if_block0.c();
            transition_in(if_block0, 1);
            if_block0.m(t0.parentNode, t0);
          }
        } else if (if_block0) {
          group_outros();

          transition_out(if_block0, 1, 1, () => {
            if_block0 = null;
          });

          check_outros();
        }

        if (/*isFlyyingMode*/ ctx[10]) {
          if (if_block1) {
            if_block1.p(ctx, dirty);

            if (dirty[0] & /*isFlyyingMode*/ 1024) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block_2(ctx);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(div, t1);
          }
        } else if (if_block1) {
          group_outros();

          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });

          check_outros();
        }

        const video_changes = {};

        if (dirty[0] & /*isMuted, config, reinitButton, currentAds*/ 99)
          video_changes.props = {
            isMuted: /*isMuted*/ ctx[5],
            videoSources: /*videoSources*/ ctx[14],
            looped: String(/*config*/ ctx[0].looped),
            reinitButton: /*reinitButton*/ ctx[6],
            currentAds: /*currentAds*/ ctx[1],
            config: /*config*/ ctx[0],
          };

        video.$set(video_changes);
        const iconreinit_changes = {};

        if (!updating_reinitButton && dirty[0] & /*reinitButton*/ 64) {
          updating_reinitButton = true;
          iconreinit_changes.reinitButton = /*reinitButton*/ ctx[6];
          add_flush_callback(() => (updating_reinitButton = false));
        }

        iconreinit.$set(iconreinit_changes);
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx);

        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx, dirty);
        } else {
          group_outros();

          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });

          check_outros();
          if_block2 = if_blocks[current_block_type_index];

          if (!if_block2) {
            if_block2 = if_blocks[current_block_type_index] =
              if_block_creators[current_block_type_index](ctx);
            if_block2.c();
          } else {
            if_block2.p(ctx, dirty);
          }

          transition_in(if_block2, 1);
          if_block2.m(div, null);
        }

        if (
          !current ||
          (dirty[0] & /*isFlyyingMode*/ 1024 &&
            div_class_value !==
              (div_class_value =
                "" +
                (null_to_empty(/*isFlyyingMode*/ ctx[10] ? "df__fly" : "df") +
                  " svelte-1y4c37f")))
        ) {
          attr_dev(div, "class", div_class_value);
        }
      },
      i: function intro(local) {
        if (current) return;
        transition_in(if_block0);
        transition_in(if_block1);
        transition_in(video.$$.fragment, local);
        transition_in(iconreinit.$$.fragment, local);
        transition_in(if_block2);
        current = true;
      },
      o: function outro(local) {
        transition_out(if_block0);
        transition_out(if_block1);
        transition_out(video.$$.fragment, local);
        transition_out(iconreinit.$$.fragment, local);
        transition_out(if_block2);
        current = false;
      },
      d: function destroy(detaching) {
        if (if_block0) if_block0.d(detaching);
        if (detaching) detach_dev(t0);
        if (detaching) detach_dev(div);
        if (if_block1) if_block1.d();
        destroy_component(video);
        destroy_component(iconreinit);
        if_blocks[current_block_type_index].d();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block.name,
      type: "if",
      source: "(123:2) {#if isDisplayPlayer}",
      ctx,
    });

    return block;
  }

  // (125:4) {#if !isFlying}
  function create_if_block_3(ctx) {
    let div4;
    let div3;
    let div0;
    let t0;
    let div1;
    let t2;
    let div2;
    let t3;
    let t4;
    let current;
    let if_block0 = /*isShortHeader*/ ctx[16] && create_if_block_7(ctx);
    let if_block1 = !(/*isShortHeader*/ ctx[16]) && create_if_block_4(ctx);

    const block = {
      c: function create() {
        div4 = element("div");
        div3 = element("div");
        div0 = element("div");
        t0 = space();
        div1 = element("div");
        div1.textContent = `${/*isEngLang*/ ctx[15] ? "Ads" : "Реклама"}`;
        t2 = space();
        div2 = element("div");
        t3 = space();
        if (if_block0) if_block0.c();
        t4 = space();
        if (if_block1) if_block1.c();
        attr_dev(div0, "class", "df-line svelte-1y4c37f");
        add_location(div0, file, 127, 10, 5123);
        attr_dev(div1, "class", "df-header-ads-text svelte-1y4c37f");
        add_location(div1, file, 128, 10, 5161);
        attr_dev(div2, "class", "df-line svelte-1y4c37f");
        add_location(div2, file, 129, 10, 5241);
        attr_dev(div3, "class", "df-header-ads svelte-1y4c37f");
        add_location(div3, file, 126, 8, 5085);
        attr_dev(div4, "class", "df-header svelte-1y4c37f");
        set_style(
          div4,
          "top",
          /*isShortHeader*/ (ctx[16] ? "-35" : "-60") + "px"
        );
        add_location(div4, file, 125, 6, 5007);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div4, anchor);
        append_dev(div4, div3);
        append_dev(div3, div0);
        append_dev(div3, t0);
        append_dev(div3, div1);
        append_dev(div3, t2);
        append_dev(div3, div2);
        append_dev(div3, t3);
        if (if_block0) if_block0.m(div3, null);
        append_dev(div4, t4);
        if (if_block1) if_block1.m(div4, null);
        current = true;
      },
      p: function update(ctx, dirty) {
        if (/*isShortHeader*/ ctx[16]) if_block0.p(ctx, dirty);
        if (!(/*isShortHeader*/ ctx[16])) if_block1.p(ctx, dirty);
      },
      i: function intro(local) {
        if (current) return;
        transition_in(if_block0);
        transition_in(if_block1);
        current = true;
      },
      o: function outro(local) {
        transition_out(if_block0);
        transition_out(if_block1);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div4);
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_3.name,
      type: "if",
      source: "(125:4) {#if !isFlying}",
      ctx,
    });

    return block;
  }

  // (131:10) {#if isShortHeader}
  function create_if_block_7(ctx) {
    let iconclose;
    let t;
    let div;
    let current;

    iconclose = new Icon_close({
      props: { onClick: /*func*/ ctx[23] },
      $$inline: true,
    });

    const block = {
      c: function create() {
        create_component(iconclose.$$.fragment);
        t = space();
        div = element("div");
        attr_dev(div, "class", "df-line svelte-1y4c37f");
        set_style(div, "max-width", "10px");
        add_location(div, file, 134, 12, 5422);
      },
      m: function mount(target, anchor) {
        mount_component(iconclose, target, anchor);
        insert_dev(target, t, anchor);
        insert_dev(target, div, anchor);
        current = true;
      },
      p: function update(ctx, dirty) {
        const iconclose_changes = {};
        if (dirty[0] & /*wrapper*/ 128)
          iconclose_changes.onClick = /*func*/ ctx[23];
        iconclose.$set(iconclose_changes);
      },
      i: function intro(local) {
        if (current) return;
        transition_in(iconclose.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(iconclose.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        destroy_component(iconclose, detaching);
        if (detaching) detach_dev(t);
        if (detaching) detach_dev(div);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_7.name,
      type: "if",
      source: "(131:10) {#if isShortHeader}",
      ctx,
    });

    return block;
  }

  // (138:8) {#if !isShortHeader}
  function create_if_block_4(ctx) {
    let div;
    let t0;
    let t1;
    let iconclose;
    let current;
    let if_block0 =
      /*creative*/ ctx[13]?.icons[0]?.staticResource && create_if_block_6(ctx);
    let if_block1 =
      /*currentAds*/ ctx[1].ads.description && create_if_block_5(ctx);

    iconclose = new Icon_close({
      props: { onClick: /*func_1*/ ctx[24] },
      $$inline: true,
    });

    const block = {
      c: function create() {
        div = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        if (if_block1) if_block1.c();
        t1 = space();
        create_component(iconclose.$$.fragment);
        attr_dev(div, "class", "df-header-ads-description svelte-1y4c37f");
        add_location(div, file, 138, 10, 5544);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (if_block0) if_block0.m(div, null);
        append_dev(div, t0);
        if (if_block1) if_block1.m(div, null);
        append_dev(div, t1);
        mount_component(iconclose, div, null);
        current = true;
      },
      p: function update(ctx, dirty) {
        if (/*creative*/ ctx[13]?.icons[0]?.staticResource)
          if_block0.p(ctx, dirty);

        if (/*currentAds*/ ctx[1].ads.description) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block_5(ctx);
            if_block1.c();
            if_block1.m(div, t1);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }

        const iconclose_changes = {};
        if (dirty[0] & /*wrapper*/ 128)
          iconclose_changes.onClick = /*func_1*/ ctx[24];
        iconclose.$set(iconclose_changes);
      },
      i: function intro(local) {
        if (current) return;
        transition_in(iconclose.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(iconclose.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
        destroy_component(iconclose);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_4.name,
      type: "if",
      source: "(138:8) {#if !isShortHeader}",
      ctx,
    });

    return block;
  }

  // (140:12) {#if creative?.icons[0]?.staticResource}
  function create_if_block_6(ctx) {
    let img;
    let img_src_value;

    const block = {
      c: function create() {
        img = element("img");
        attr_dev(img, "class", "df-header-ads-description-icon svelte-1y4c37f");
        if (
          !src_url_equal(
            img.src,
            (img_src_value = /*creative*/ ctx[13]?.icons[0]?.staticResource)
          )
        )
          attr_dev(img, "src", img_src_value);
        attr_dev(img, "alt", "ads-logo");
        add_location(img, file, 140, 14, 5651);
      },
      m: function mount(target, anchor) {
        insert_dev(target, img, anchor);
      },
      p: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(img);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_6.name,
      type: "if",
      source: "(140:12) {#if creative?.icons[0]?.staticResource}",
      ctx,
    });

    return block;
  }

  // (147:12) {#if currentAds.ads.description}
  function create_if_block_5(ctx) {
    let div;
    let t_value = /*currentAds*/ ctx[1].ads.description + "";
    let t;

    const block = {
      c: function create() {
        div = element("div");
        t = text(t_value);
        attr_dev(div, "class", "df-header-ads-description-text svelte-1y4c37f");
        add_location(div, file, 147, 14, 5895);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, t);
      },
      p: function update(ctx, dirty) {
        if (
          dirty[0] & /*currentAds*/ 2 &&
          t_value !== (t_value = /*currentAds*/ ctx[1].ads.description + "")
        )
          set_data_dev(t, t_value);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_5.name,
      type: "if",
      source: "(147:12) {#if currentAds.ads.description}",
      ctx,
    });

    return block;
  }

  // (160:6) {#if isFlyyingMode}
  function create_if_block_2(ctx) {
    let iconclose;
    let current;

    iconclose = new Icon_close({
      props: {
        onClick: /*func_2*/ ctx[25],
        floating_css: "right",
      },
      $$inline: true,
    });

    const block = {
      c: function create() {
        create_component(iconclose.$$.fragment);
      },
      m: function mount(target, anchor) {
        mount_component(iconclose, target, anchor);
        current = true;
      },
      p: function update(ctx, dirty) {
        const iconclose_changes = {};
        if (dirty[0] & /*config*/ 1)
          iconclose_changes.onClick = /*func_2*/ ctx[25];
        iconclose.$set(iconclose_changes);
      },
      i: function intro(local) {
        if (current) return;
        transition_in(iconclose.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(iconclose.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        destroy_component(iconclose, detaching);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_2.name,
      type: "if",
      source: "(160:6) {#if isFlyyingMode}",
      ctx,
    });

    return block;
  }

  // (215:6) {:else}
  function create_else_block(ctx) {
    let vpaid;
    let current;

    vpaid = new Vpaid({
      props: {
        props: {
          isMuted: /*isMuted*/ ctx[5],
          reinitButton: /*reinitButton*/ ctx[6],
          currentAds: /*currentAds*/ ctx[1],
          config: /*config*/ ctx[0],
          widthAndHeight: /*widthAndHeight*/ ctx[2],
          video: /*$videoStore*/ ctx[12],
          wrapper: /*wrapper*/ ctx[7],
          container: /*container*/ ctx[3],
        },
      },
      $$inline: true,
    });

    const block = {
      c: function create() {
        create_component(vpaid.$$.fragment);
      },
      m: function mount(target, anchor) {
        mount_component(vpaid, target, anchor);
        current = true;
      },
      p: function update(ctx, dirty) {
        const vpaid_changes = {};

        if (
          dirty[0] &
          /*isMuted, reinitButton, currentAds, config, widthAndHeight, $videoStore, wrapper, container*/ 4335
        )
          vpaid_changes.props = {
            isMuted: /*isMuted*/ ctx[5],
            reinitButton: /*reinitButton*/ ctx[6],
            currentAds: /*currentAds*/ ctx[1],
            config: /*config*/ ctx[0],
            widthAndHeight: /*widthAndHeight*/ ctx[2],
            video: /*$videoStore*/ ctx[12],
            wrapper: /*wrapper*/ ctx[7],
            container: /*container*/ ctx[3],
          };

        vpaid.$set(vpaid_changes);
      },
      i: function intro(local) {
        if (current) return;
        transition_in(vpaid.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(vpaid.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        destroy_component(vpaid, detaching);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_else_block.name,
      type: "else",
      source: "(215:6) {:else}",
      ctx,
    });

    return block;
  }

  // (181:6) {#if !currentAds.containVPAID}
  function create_if_block_1(ctx) {
    let div4;
    let div2;
    let div0;
    let t0;
    let div1;
    let span;
    let t1;
    let button;
    let svg;
    let path0;
    let path1;
    let path1_class_value;
    let button_class_value;
    let t2;
    let div3;
    let mounted;
    let dispose;

    const block = {
      c: function create() {
        div4 = element("div");
        div2 = element("div");
        div0 = element("div");
        t0 = space();
        div1 = element("div");
        span = element("span");
        t1 = space();
        button = element("button");
        svg = svg_element("svg");
        path0 = svg_element("path");
        path1 = svg_element("path");
        t2 = space();
        div3 = element("div");
        attr_dev(div0, "class", "df-line svelte-1y4c37f");
        add_location(div0, file, 183, 12, 6863);
        attr_dev(span, "class", "progress-bar svelte-1y4c37f");
        set_style(span, "width", /*progressWidth*/ ctx[9] + "%");
        add_location(span, file, 185, 14, 6940);
        attr_dev(div1, "class", "progress svelte-1y4c37f");
        add_location(div1, file, 184, 12, 6903);
        attr_dev(div2, "class", "progress-wrapper svelte-1y4c37f");
        add_location(div2, file, 182, 10, 6820);
        attr_dev(
          path0,
          "d",
          "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z"
        );
        add_location(path0, file, 203, 14, 7491);
        attr_dev(
          path1,
          "class",
          (path1_class_value =
            "" +
            (null_to_empty(/*isMuted*/ ctx[5] ? "df-svg-hider" : "") +
              " svelte-1y4c37f"))
        );
        attr_dev(path1, "d", "M 9.25,9 7.98,10.27 24.71,27 l 1.27,-1.27 Z");
        set_style(path1, "opacity", "0");
        add_location(path1, file, 206, 14, 7828);
        attr_dev(svg, "class", "df--controls--mute--svg svelte-1y4c37f");
        attr_dev(svg, "version", "1.1");
        attr_dev(svg, "viewBox", "0 0 36 36");
        attr_dev(svg, "width", "100%");
        add_location(svg, file, 197, 12, 7323);

        attr_dev(
          button,
          "class",
          (button_class_value =
            "df--controls--mute--button " +
            /*isMuted*/ (ctx[5] ? "df--controls--mute--button__mute" : "") +
            " svelte-1y4c37f")
        );

        attr_dev(button, "aria-label", "mute");
        add_location(button, file, 188, 10, 7053);
        attr_dev(div3, "class", "df-line svelte-1y4c37f");
        set_style(div3, "max-width", "8px");
        add_location(div3, file, 212, 10, 8047);
        attr_dev(div4, "class", "df--controls svelte-1y4c37f");
        add_location(div4, file, 181, 8, 6783);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div4, anchor);
        append_dev(div4, div2);
        append_dev(div2, div0);
        append_dev(div2, t0);
        append_dev(div2, div1);
        append_dev(div1, span);
        append_dev(div4, t1);
        append_dev(div4, button);
        append_dev(button, svg);
        append_dev(svg, path0);
        append_dev(svg, path1);
        append_dev(div4, t2);
        append_dev(div4, div3);

        if (!mounted) {
          dispose = listen_dev(
            button,
            "click",
            /*click_handler*/ ctx[27],
            false,
            false,
            false
          );
          mounted = true;
        }
      },
      p: function update(ctx, dirty) {
        if (dirty[0] & /*progressWidth*/ 512) {
          set_style(span, "width", /*progressWidth*/ ctx[9] + "%");
        }

        if (
          dirty[0] & /*isMuted*/ 32 &&
          path1_class_value !==
            (path1_class_value =
              "" +
              (null_to_empty(/*isMuted*/ ctx[5] ? "df-svg-hider" : "") +
                " svelte-1y4c37f"))
        ) {
          attr_dev(path1, "class", path1_class_value);
        }

        if (
          dirty[0] & /*isMuted*/ 32 &&
          button_class_value !==
            (button_class_value =
              "df--controls--mute--button " +
              /*isMuted*/ (ctx[5] ? "df--controls--mute--button__mute" : "") +
              " svelte-1y4c37f")
        ) {
          attr_dev(button, "class", button_class_value);
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(div4);
        mounted = false;
        dispose();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1.name,
      type: "if",
      source: "(181:6) {#if !currentAds.containVPAID}",
      ctx,
    });

    return block;
  }

  function create_fragment(ctx) {
    let div;
    let div_style_value;
    let current;
    let mounted;
    let dispose;
    let if_block = /*isDisplayPlayer*/ ctx[8] && create_if_block(ctx);

    const block = {
      c: function create() {
        div = element("div");
        if (if_block) if_block.c();
        attr_dev(div, "class", "df-wrapper svelte-1y4c37f");
        attr_dev(
          div,
          "style",
          (div_style_value =
            "" +
            /*cssVarStyles*/ (ctx[11] +
              "; height: " +
              /*widthAndHeight*/ ctx[2][1] +
              "px;"))
        );
        add_location(div, file, 117, 0, 4813);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (if_block) if_block.m(div, null);
        /*div_binding*/ ctx[28](div);
        current = true;

        if (!mounted) {
          dispose = [
            listen_dev(
              window,
              "scroll",
              /*scroll_handler*/ ctx[21],
              false,
              false,
              false
            ),
            listen_dev(
              window,
              "resize",
              /*resize_handler*/ ctx[22],
              false,
              false,
              false
            ),
          ];

          mounted = true;
        }
      },
      p: function update(ctx, dirty) {
        if (/*isDisplayPlayer*/ ctx[8]) {
          if (if_block) {
            if_block.p(ctx, dirty);

            if (dirty[0] & /*isDisplayPlayer*/ 256) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block(ctx);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(div, null);
          }
        } else if (if_block) {
          group_outros();

          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });

          check_outros();
        }

        if (
          !current ||
          (dirty[0] & /*cssVarStyles, widthAndHeight*/ 2052 &&
            div_style_value !==
              (div_style_value =
                "" +
                /*cssVarStyles*/ (ctx[11] +
                  "; height: " +
                  /*widthAndHeight*/ ctx[2][1] +
                  "px;")))
        ) {
          attr_dev(div, "style", div_style_value);
        }
      },
      i: function intro(local) {
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o: function outro(local) {
        transition_out(if_block);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
        if (if_block) if_block.d();
        /*div_binding*/ ctx[28](null);
        mounted = false;
        run_all(dispose);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance($$self, $$props, $$invalidate) {
    let cssVarStyles;
    let isFlyyingMode;
    let $impressionStore;
    let $compliteStore;
    let $duration;
    let $videoStore;
    validate_store(impressionStore, "impressionStore");
    component_subscribe($$self, impressionStore, ($$value) =>
      $$invalidate(19, ($impressionStore = $$value))
    );
    validate_store(compliteStore, "compliteStore");
    component_subscribe($$self, compliteStore, ($$value) =>
      $$invalidate(20, ($compliteStore = $$value))
    );
    validate_store(duration, "duration");
    component_subscribe($$self, duration, ($$value) =>
      $$invalidate(30, ($duration = $$value))
    );
    validate_store(videoStore, "videoStore");
    component_subscribe($$self, videoStore, ($$value) =>
      $$invalidate(12, ($videoStore = $$value))
    );
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("App", slots, []);

    var __awaiter =
      (this && this.__awaiter) ||
      function (thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P
            ? value
            : new P(function (resolve) {
                resolve(value);
              });
        }

        return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }

          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }

          function step(result) {
            result.done
              ? resolve(result.value)
              : adopt(result.value).then(fulfilled, rejected);
          }

          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };

    var _a;
    let { widthAndHeight } = $$props;
    let { config } = $$props;
    let { currentAds } = $$props;
    let { url } = $$props;
    let { container } = $$props;
    const creative = currentAds.ads.creatives[0];
    const videoSources = configCreativesForVideo(
      creative.mediaFiles,
      config.media_querys
    );
    const isEngLang = /en/g.test(navigator.language);
    const styles = getStyleVar(config);
    let isMuted = true;
    let reinitButton = document.createElement("button");
    let wrapper = document.createElement("div");
    let isDisplayPlayer = true;
    let progressWidth = 0;

    let isShortHeader =
      !((_a =
        creative === null || creative === void 0
          ? void 0
          : creative.icons[0]) === null || _a === void 0
        ? void 0
        : _a.staticResource) && !currentAds.ads.description;

    currentTime.subscribe((value) => {
      $$invalidate(9, (progressWidth = (value / $duration) * 100 || 0));
    });

    const reinitAction = () => {
      currentAds.tracker.close();

      retryStore.update((value) => {
        const newValue = value + 1;

        if (newValue > parseInt(String(config.retrays))) {
          console.log(parseInt(String(config.retrays)));
          console.log(newValue);
          errorStore.set(
            new TerminateError(errorCodesVAST["VAST retry limit"])
          );
        } else {
          $$invalidate(8, (isDisplayPlayer = false));

          fetchVast({ url, widthAndHeight }).then((vast) => {
            $$invalidate(1, (currentAds = vast));
            $$invalidate(8, (isDisplayPlayer = true));
          });
        }

        return newValue;
      });
    };

    let isFlying = false;

    errorStore.subscribe((error) =>
      __awaiter(void 0, void 0, void 0, function* () {
        var _b;

        if (error === null) {
          return;
        }

        const errorCode =
          parseInt(
            error === null || error === void 0 ? void 0 : error.message
          ) > 900
            ? error === null || error === void 0
              ? void 0
              : error.message
            : errorCodesVAST[
                error === null || error === void 0 ? void 0 : error.message
              ] || "900";

        const trackError = () => {
          currentAds.tracker.errorWithCode(
            errorCode,
            parseInt(errorCode) > 901 ? true : false
          );
        };

        switch (
          error === null || error === void 0 ? void 0 : error.toString()
        ) {
          case `[object TerminateError]`:
            console.log("---=== TERMINATE PLAYER ===---");
            trackError();
            $$invalidate(8, (isDisplayPlayer = false));
            try {
              (_b = wrapper.parentNode) === null || _b === void 0
                ? void 0
                : _b.removeChild(wrapper);
            } catch (error) {
              console.log(error);
            }
            break;
          case `[object ReinitError]`:
            trackError();
            reinitAction();
            break;
          case `[object AdsError]`:
            const newxtAds = yield getNextAds(currentAds.vastClient);
            if (newxtAds) {
              $$invalidate(1, (currentAds = newxtAds));
            }
            break;
        }
      })
    );

    const writable_props = [
      "widthAndHeight",
      "config",
      "currentAds",
      "url",
      "container",
    ];

    Object_1.keys($$props).forEach((key) => {
      if (
        !~writable_props.indexOf(key) &&
        key.slice(0, 2) !== "$$" &&
        key !== "slot"
      )
        console_1.warn(`<App> was created with unknown prop '${key}'`);
    });

    const scroll_handler = () => {
      $$invalidate(4, (isFlying = !isVisible(wrapper)));
    };

    const resize_handler = () => {
      $$invalidate(4, (isFlying = !isVisible(wrapper)));
    };

    const func = () => wrapper.parentNode?.removeChild(wrapper);
    const func_1 = () => wrapper.parentNode?.removeChild(wrapper);

    const func_2 = () => {
      $$invalidate(0, (config.fly = false), config);
    };

    function iconreinit_reinitButton_binding(value) {
      reinitButton = value;
      $$invalidate(6, reinitButton);
    }

    const click_handler = () => {
      $$invalidate(5, (isMuted = !isMuted));
    };

    function div_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        wrapper = $$value;
        $$invalidate(7, wrapper);
      });
    }

    $$self.$$set = ($$props) => {
      if ("widthAndHeight" in $$props)
        $$invalidate(2, (widthAndHeight = $$props.widthAndHeight));
      if ("config" in $$props) $$invalidate(0, (config = $$props.config));
      if ("currentAds" in $$props)
        $$invalidate(1, (currentAds = $$props.currentAds));
      if ("url" in $$props) $$invalidate(18, (url = $$props.url));
      if ("container" in $$props)
        $$invalidate(3, (container = $$props.container));
    };

    $$self.$capture_state = () => ({
      __awaiter,
      _a,
      errorCodesVAST,
      TerminateError,
      configCreativesForVideo,
      isVisible,
      getNextAds,
      IconClose: Icon_close,
      IconReinit: Icon_reinit,
      getStyleVar,
      compliteStore,
      duration,
      errorStore,
      impressionStore,
      retryStore,
      currentTime,
      videoStore,
      fetchVast,
      Video,
      Vpaid,
      widthAndHeight,
      config,
      currentAds,
      url,
      container,
      creative,
      videoSources,
      isEngLang,
      styles,
      isMuted,
      reinitButton,
      wrapper,
      isDisplayPlayer,
      progressWidth,
      isShortHeader,
      reinitAction,
      isFlying,
      isFlyyingMode,
      cssVarStyles,
      $impressionStore,
      $compliteStore,
      $duration,
      $videoStore,
    });

    $$self.$inject_state = ($$props) => {
      if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
      if ("_a" in $$props) _a = $$props._a;
      if ("widthAndHeight" in $$props)
        $$invalidate(2, (widthAndHeight = $$props.widthAndHeight));
      if ("config" in $$props) $$invalidate(0, (config = $$props.config));
      if ("currentAds" in $$props)
        $$invalidate(1, (currentAds = $$props.currentAds));
      if ("url" in $$props) $$invalidate(18, (url = $$props.url));
      if ("container" in $$props)
        $$invalidate(3, (container = $$props.container));
      if ("isMuted" in $$props) $$invalidate(5, (isMuted = $$props.isMuted));
      if ("reinitButton" in $$props)
        $$invalidate(6, (reinitButton = $$props.reinitButton));
      if ("wrapper" in $$props) $$invalidate(7, (wrapper = $$props.wrapper));
      if ("isDisplayPlayer" in $$props)
        $$invalidate(8, (isDisplayPlayer = $$props.isDisplayPlayer));
      if ("progressWidth" in $$props)
        $$invalidate(9, (progressWidth = $$props.progressWidth));
      if ("isShortHeader" in $$props)
        $$invalidate(16, (isShortHeader = $$props.isShortHeader));
      if ("isFlying" in $$props) $$invalidate(4, (isFlying = $$props.isFlying));
      if ("isFlyyingMode" in $$props)
        $$invalidate(10, (isFlyyingMode = $$props.isFlyyingMode));
      if ("cssVarStyles" in $$props)
        $$invalidate(11, (cssVarStyles = $$props.cssVarStyles));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    $$self.$$.update = () => {
      if (
        $$self.$$.dirty[0] &
        /*config, isFlying, $compliteStore, $impressionStore*/ 1572881
      ) {
        $$invalidate(
          10,
          (isFlyyingMode =
            config.fly && isFlying && !$compliteStore && $impressionStore)
        );
      }
    };

    $$invalidate(
      11,
      (cssVarStyles = Object.entries(styles)
        .map(([key, value]) => `--${key}:${value}`)
        .join(";"))
    );

    return [
      config,
      currentAds,
      widthAndHeight,
      container,
      isFlying,
      isMuted,
      reinitButton,
      wrapper,
      isDisplayPlayer,
      progressWidth,
      isFlyyingMode,
      cssVarStyles,
      $videoStore,
      creative,
      videoSources,
      isEngLang,
      isShortHeader,
      reinitAction,
      url,
      $impressionStore,
      $compliteStore,
      scroll_handler,
      resize_handler,
      func,
      func_1,
      func_2,
      iconreinit_reinitButton_binding,
      click_handler,
      div_binding,
    ];
  }

  class App extends SvelteComponentDev {
    constructor(options) {
      super(options);

      init(
        this,
        options,
        instance,
        create_fragment,
        safe_not_equal,
        {
          widthAndHeight: 2,
          config: 0,
          currentAds: 1,
          url: 18,
          container: 3,
        },
        add_css,
        [-1, -1]
      );

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "App",
        options,
        id: create_fragment.name,
      });

      const { ctx } = this.$$;
      const props = options.props || {};

      if (
        /*widthAndHeight*/ ctx[2] === undefined &&
        !("widthAndHeight" in props)
      ) {
        console_1.warn(
          "<App> was created without expected prop 'widthAndHeight'"
        );
      }

      if (/*config*/ ctx[0] === undefined && !("config" in props)) {
        console_1.warn("<App> was created without expected prop 'config'");
      }

      if (/*currentAds*/ ctx[1] === undefined && !("currentAds" in props)) {
        console_1.warn("<App> was created without expected prop 'currentAds'");
      }

      if (/*url*/ ctx[18] === undefined && !("url" in props)) {
        console_1.warn("<App> was created without expected prop 'url'");
      }

      if (/*container*/ ctx[3] === undefined && !("container" in props)) {
        console_1.warn("<App> was created without expected prop 'container'");
      }
    }

    get widthAndHeight() {
      throw new Error(
        "<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set widthAndHeight(value) {
      throw new Error(
        "<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get config() {
      throw new Error(
        "<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set config(value) {
      throw new Error(
        "<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get currentAds() {
      throw new Error(
        "<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set currentAds(value) {
      throw new Error(
        "<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get url() {
      throw new Error(
        "<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set url(value) {
      throw new Error(
        "<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get container() {
      throw new Error(
        "<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set container(value) {
      throw new Error(
        "<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  const selectNetwork = (config) => {
    console.log(config.test);

    return "https://r.admon.pro/tags/ozon_09_23_infinix_batonchiki.xml?sid=%7Bsid%7D&scid=%7Bscid%7D&cid=%7Bcid%7D&crid=%7Bcrid%7D&traffictype=%7Btraffictype%7D&adformat=%7Badformat%7D";
    // return config.link || config.test === "true"
    //   ? `${TEST_BUILD_URL}/${config.sourceId}${
    //       config.subId === "" ? "" : "?subid=" + config.subId
    //     }`
    //   : `${PROD_BUILD_URL}/${config.sourceId}${
    //       config.subId === "" ? "" : "?subid=" + config.subId
    //     }`;
  };

  const containers = document.querySelectorAll(`.${PLAYER_CLASS}`);
  const initPlayers = () =>
    __awaiter(void 0, void 0, void 0, function* () {
      for (const container of Array.from(containers)) {
        const set = container.dataset;
        const config = {
          media_querys: set.media_querys || MEDIA_QUERYS,
          aspect_ratio: parseInt(String(set.aspect_ratio)) || ASPECT_RATIO,
          looped: set.looped || "true",
          retrays: set.retrays || 2,
          userId: set.userId || "",
          siteId: set.siteId || "",
          subId: set.subId || "",
          prId: set.prId || "",
          sourceId: set.sourceId || "",
          fly: set.fly || "false",
          test: set.test || "false",
          lineColor: set.lineColor || "rgb(80, 79, 79)",
          link: set.link,
        };
        const playerLink = selectNetwork(config);
        const widthAndHeight = getWitdhAndHeight({
          aspect_ratio: config.aspect_ratio,
          parentNode: container,
        });
        const initPlayerInstans = (currentRetray) =>
          __awaiter(void 0, void 0, void 0, function* () {
            if (currentRetray > parseInt(String(config.retrays))) return;
            console.log("init player " + currentRetray);
            try {
              const currentAds = yield fetchVast({
                url: playerLink,
                widthAndHeight,
              });
              const mutateConfig = Object.assign(Object.assign({}, config), {
                retrays: parseInt(String(config.retrays)) - currentRetray,
              });
              new App({
                target: container,
                props: {
                  config: mutateConfig,
                  currentAds: currentAds,
                  container: container,
                  widthAndHeight,
                  url: playerLink,
                },
              });
              return true;
            } catch (error) {
              console.log(error);
              setTimeout(() => initPlayerInstans(currentRetray + 1), 1000);
            }
          });
        initPlayerInstans(0);
      }
    });
  console.log("Version 1.0.1");
  initPlayers();
})();
//# sourceMappingURL=outstream.js.map
