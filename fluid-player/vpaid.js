(function() {
  "use strict";
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
    if (VPAIDCreative.handshakeVersion && typeof VPAIDCreative.handshakeVersion == "function" && VPAIDCreative.initAd && typeof VPAIDCreative.initAd == "function" && VPAIDCreative.startAd && typeof VPAIDCreative.startAd == "function" && VPAIDCreative.stopAd && typeof VPAIDCreative.stopAd == "function" && VPAIDCreative.skipAd && typeof VPAIDCreative.skipAd == "function" && VPAIDCreative.resizeAd && typeof VPAIDCreative.resizeAd == "function" && VPAIDCreative.pauseAd && typeof VPAIDCreative.pauseAd == "function" && VPAIDCreative.resumeAd && typeof VPAIDCreative.resumeAd == "function" && VPAIDCreative.expandAd && typeof VPAIDCreative.expandAd == "function" && VPAIDCreative.collapseAd && typeof VPAIDCreative.collapseAd == "function" && VPAIDCreative.subscribe && typeof VPAIDCreative.subscribe == "function" && VPAIDCreative.unsubscribe && typeof VPAIDCreative.unsubscribe == "function") {
      return true;
    }
    return false;
  };
  const createFrameScript = (currentAds, cssId) => {
    var _a, _b;
    return `<head><style>body{margin:0}</style></head><body><script type="text/javascript" id="${cssId}"  charset="UTF-8" src="${(_b = (_a = currentAds.ads.creatives[0]) == null ? void 0 : _a.mediaFiles[0]) == null ? void 0 : _b.fileURL}" async><\/script></body>`;
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
  const VPAIDCondition = (item) => {
    return item.apiFramework === "VPAID" && item.mimeType === "application/javascript";
  };
  var errorCodesVAST = /* @__PURE__ */ ((errorCodesVAST2) => {
    errorCodesVAST2["no active campaigns"] = "901";
    errorCodesVAST2["No ADS in VAST"] = "902";
    errorCodesVAST2["VAST retry limit"] = "903";
    errorCodesVAST2["Impression timeout "] = "905";
    errorCodesVAST2["Can't load VPAID"] = "906";
    errorCodesVAST2["VPAID is invalid"] = "907";
    errorCodesVAST2["VPAID timeout"] = "908";
    errorCodesVAST2["VPAID AdError"] = "909";
    errorCodesVAST2["Error on init player"] = "910";
    errorCodesVAST2["VAST error common"] = "911";
    errorCodesVAST2["No active campaign"] = "912";
    errorCodesVAST2["User left page"] = "913";
    errorCodesVAST2["Error restart player"] = "914";
    errorCodesVAST2["Network error"] = "915";
    errorCodesVAST2["User disable ads"] = "916";
    return errorCodesVAST2;
  })(errorCodesVAST || {});
  class GetVastError extends Error {
    constructor(message) {
      super(message);
      this.type = "GetVastError";
      this.message = "Common: Error then fetch and parse vast \n ";
    }
  }
  class PixelError extends Error {
    constructor(message) {
      super(message);
      this.type = "PixelError";
      this.message = "Error in matching user";
    }
  }
  class ReInitError extends Error {
    constructor(message) {
      super(message);
      this.name = "ReinitError";
    }
    toString() {
      return `[object ${this.name}]`;
    }
  }
  class TerminateError extends Error {
    constructor(message) {
      super(message);
      this.name = "TerminateError";
    }
    toString() {
      return `[object ${this.name}]`;
    }
  }
  const regFindDomen = /(http.?:\/\/[^\/]*\/)/;
  const regFindDomenNoHttp = /((www\.)?[a-z\-\d]+?[^_-]\.[a-z]{2,8})(?:\/?)/;
  const domainCutter = (fullURL, cutHttp = false) => {
    const regExpSelect = cutHttp ? regFindDomenNoHttp : regFindDomen;
    const domainRegFindResult = regExpSelect.exec(fullURL);
    const onlyDomain = Array.isArray(domainRegFindResult) ? domainRegFindResult[1] : domainRegFindResult;
    return onlyDomain;
  };
  const isTouchDevice = () => "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const log = (text2, isError) => {
    if (isError) {
      console.error("EXTENSION ERROR");
      console.log(text2);
      return;
    }
    console.log(`---=== ${text2} ===---`);
  };
  const checkIsMobile = () => {
    const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform);
    log("userAgentCheck");
    log(userAgentCheck);
    const toucheCheck = "ontouchstart" in document.documentElement && navigator.userAgent.match(/Mobi/);
    log("toucheCheck");
    log(toucheCheck);
    return userAgentCheck || toucheCheck;
  };
  const unsecuredCopyToClipboard = (text2) => {
    const textArea = document.createElement("textarea");
    textArea.value = text2;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Unable to copy to clipboard", err);
    }
    document.body.removeChild(textArea);
  };
  const copyToClipboard = (content) => {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(content);
    } else {
      unsecuredCopyToClipboard(content);
    }
  };
  function openFullscreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  var vastClient_minExports = {};
  var vastClient_min = {
    get exports() {
      return vastClient_minExports;
    },
    set exports(v) {
      vastClient_minExports = v;
    }
  };
  (function(module, exports) {
    !function(e, t) {
      t(exports);
    }(commonjsGlobal, function(e) {
      function t(e2, t2) {
        var r2 = Object.keys(e2);
        if (Object.getOwnPropertySymbols) {
          var i2 = Object.getOwnPropertySymbols(e2);
          t2 && (i2 = i2.filter(function(t3) {
            return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
          })), r2.push.apply(r2, i2);
        }
        return r2;
      }
      function r(e2) {
        for (var r2 = 1; r2 < arguments.length; r2++) {
          var i2 = null != arguments[r2] ? arguments[r2] : {};
          r2 % 2 ? t(Object(i2), true).forEach(function(t2) {
            s(e2, t2, i2[t2]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(i2)) : t(Object(i2)).forEach(function(t2) {
            Object.defineProperty(e2, t2, Object.getOwnPropertyDescriptor(i2, t2));
          });
        }
        return e2;
      }
      function i(e2) {
        return i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
          return typeof e3;
        } : function(e3) {
          return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
        }, i(e2);
      }
      function n(e2, t2) {
        if (!(e2 instanceof t2))
          throw new TypeError("Cannot call a class as a function");
      }
      function a(e2, t2) {
        for (var r2 = 0; r2 < t2.length; r2++) {
          var i2 = t2[r2];
          i2.enumerable = i2.enumerable || false, i2.configurable = true, "value" in i2 && (i2.writable = true), Object.defineProperty(e2, i2.key, i2);
        }
      }
      function o(e2, t2, r2) {
        return t2 && a(e2.prototype, t2), r2 && a(e2, r2), Object.defineProperty(e2, "prototype", { writable: false }), e2;
      }
      function s(e2, t2, r2) {
        return t2 in e2 ? Object.defineProperty(e2, t2, { value: r2, enumerable: true, configurable: true, writable: true }) : e2[t2] = r2, e2;
      }
      function l(e2, t2) {
        if ("function" != typeof t2 && null !== t2)
          throw new TypeError("Super expression must either be null or a function");
        e2.prototype = Object.create(t2 && t2.prototype, { constructor: { value: e2, writable: true, configurable: true } }), Object.defineProperty(e2, "prototype", { writable: false }), t2 && c(e2, t2);
      }
      function u(e2) {
        return u = Object.setPrototypeOf ? Object.getPrototypeOf : function(e3) {
          return e3.__proto__ || Object.getPrototypeOf(e3);
        }, u(e2);
      }
      function c(e2, t2) {
        return c = Object.setPrototypeOf || function(e3, t3) {
          return e3.__proto__ = t3, e3;
        }, c(e2, t2);
      }
      function d(e2, t2) {
        if (t2 && ("object" == typeof t2 || "function" == typeof t2))
          return t2;
        if (void 0 !== t2)
          throw new TypeError("Derived constructors may only return object or undefined");
        return function(e3) {
          if (void 0 === e3)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
          return e3;
        }(e2);
      }
      function p(e2) {
        var t2 = function() {
          if ("undefined" == typeof Reflect || !Reflect.construct)
            return false;
          if (Reflect.construct.sham)
            return false;
          if ("function" == typeof Proxy)
            return true;
          try {
            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
            })), true;
          } catch (e3) {
            return false;
          }
        }();
        return function() {
          var r2, i2 = u(e2);
          if (t2) {
            var n2 = u(this).constructor;
            r2 = Reflect.construct(i2, arguments, n2);
          } else
            r2 = i2.apply(this, arguments);
          return d(this, r2);
        };
      }
      function h(e2) {
        return function(e3) {
          if (Array.isArray(e3))
            return v(e3);
        }(e2) || function(e3) {
          if ("undefined" != typeof Symbol && null != e3[Symbol.iterator] || null != e3["@@iterator"])
            return Array.from(e3);
        }(e2) || function(e3, t2) {
          if (!e3)
            return;
          if ("string" == typeof e3)
            return v(e3, t2);
          var r2 = Object.prototype.toString.call(e3).slice(8, -1);
          "Object" === r2 && e3.constructor && (r2 = e3.constructor.name);
          if ("Map" === r2 || "Set" === r2)
            return Array.from(e3);
          if ("Arguments" === r2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r2))
            return v(e3, t2);
        }(e2) || function() {
          throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }();
      }
      function v(e2, t2) {
        (null == t2 || t2 > e2.length) && (t2 = e2.length);
        for (var r2 = 0, i2 = new Array(t2); r2 < t2; r2++)
          i2[r2] = e2[r2];
        return i2;
      }
      function f() {
        var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        return { id: e2.id || null, adId: e2.adId || null, sequence: e2.sequence || null, apiFramework: e2.apiFramework || null, universalAdIds: [], creativeExtensions: [] };
      }
      var m = ["ADCATEGORIES", "ADCOUNT", "ADPLAYHEAD", "ADSERVINGID", "ADTYPE", "APIFRAMEWORKS", "APPBUNDLE", "ASSETURI", "BLOCKEDADCATEGORIES", "BREAKMAXADLENGTH", "BREAKMAXADS", "BREAKMAXDURATION", "BREAKMINADLENGTH", "BREAKMINDURATION", "BREAKPOSITION", "CLICKPOS", "CLICKTYPE", "CLIENTUA", "CONTENTID", "CONTENTPLAYHEAD", "CONTENTURI", "DEVICEIP", "DEVICEUA", "DOMAIN", "EXTENSIONS", "GDPRCONSENT", "IFA", "IFATYPE", "INVENTORYSTATE", "LATLONG", "LIMITADTRACKING", "MEDIAMIME", "MEDIAPLAYHEAD", "OMIDPARTNER", "PAGEURL", "PLACEMENTTYPE", "PLAYERCAPABILITIES", "PLAYERSIZE", "PLAYERSTATE", "PODSEQUENCE", "REGULATIONS", "SERVERSIDE", "SERVERUA", "TRANSACTIONID", "UNIVERSALADID", "VASTVERSIONS", "VERIFICATIONVENDORS"];
      function g(e2) {
        var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, i2 = [], n2 = A(e2);
        for (var a2 in !t2.ERRORCODE || r2.isCustomCode || /^[0-9]{3}$/.test(t2.ERRORCODE) || (t2.ERRORCODE = 900), t2.CACHEBUSTING = E(Math.round(1e8 * Math.random())), t2.TIMESTAMP = (/* @__PURE__ */ new Date()).toISOString(), t2.RANDOM = t2.random = t2.CACHEBUSTING, t2)
          t2[a2] = b(t2[a2]);
        for (var o2 in n2) {
          var s2 = n2[o2];
          "string" == typeof s2 && i2.push(y(s2, t2));
        }
        return i2;
      }
      function y(e2, t2) {
        var r2 = (e2 = T(e2, t2)).match(/[^[\]]+(?=])/g);
        if (!r2)
          return e2;
        var i2 = r2.filter(function(e3) {
          return m.indexOf(e3) > -1;
        });
        return 0 === i2.length ? e2 : T(e2, i2 = i2.reduce(function(e3, t3) {
          return e3[t3] = -1, e3;
        }, {}));
      }
      function T(e2, t2) {
        var r2 = e2;
        for (var i2 in t2) {
          var n2 = t2[i2];
          r2 = r2.replace(new RegExp("(?:\\[|%%)(".concat(i2, ")(?:\\]|%%)"), "g"), n2);
        }
        return r2;
      }
      function A(e2) {
        return Array.isArray(e2) ? e2.map(function(e3) {
          return e3 && e3.hasOwnProperty("url") ? e3.url : e3;
        }) : e2;
      }
      function k(e2, t2) {
        for (var r2 = 0; r2 < t2.length; r2++)
          if (R(t2[r2], e2))
            return true;
        return false;
      }
      function R(e2, t2) {
        if (e2 && t2) {
          var r2 = Object.getOwnPropertyNames(e2), i2 = Object.getOwnPropertyNames(t2);
          return r2.length === i2.length && (e2.id === t2.id && e2.url === t2.url);
        }
        return false;
      }
      function b(e2) {
        return encodeURIComponent(e2).replace(/[!'()*]/g, function(e3) {
          return "%".concat(e3.charCodeAt(0).toString(16));
        });
      }
      function E(e2) {
        var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 8;
        return e2.toString().padStart(t2, "0");
      }
      var N = { track: function(e2, t2, r2) {
        g(e2, t2, r2).forEach(function(e3) {
          "undefined" != typeof window && null !== window && (new Image().src = e3);
        });
      }, resolveURLTemplates: g, extractURLsFromTemplates: A, containsTemplateObject: k, isTemplateObjectEqual: R, encodeURIComponentRFC3986: b, replaceUrlMacros: y, isNumeric: function(e2) {
        return !isNaN(parseFloat(e2)) && isFinite(e2);
      }, flatten: function e2(t2) {
        return t2.reduce(function(t3, r2) {
          return t3.concat(Array.isArray(r2) ? e2(r2) : r2);
        }, []);
      }, joinArrayOfUniqueTemplateObjs: function() {
        var e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [], r2 = Array.isArray(e2) ? e2 : [], i2 = Array.isArray(t2) ? t2 : [], n2 = r2.concat(i2);
        return n2.reduce(function(e3, t3) {
          return k(t3, e3) || e3.push(t3), e3;
        }, []);
      }, isValidTimeValue: function(e2) {
        return Number.isFinite(e2) && e2 >= -2;
      }, addLeadingZeros: E };
      function L(e2) {
        return -1 !== ["true", "TRUE", "True", "1"].indexOf(e2);
      }
      var w = { childByName: function(e2, t2) {
        var r2 = e2.childNodes;
        for (var i2 in r2) {
          var n2 = r2[i2];
          if (n2.nodeName === t2)
            return n2;
        }
      }, childrenByName: function(e2, t2) {
        var r2 = [], i2 = e2.childNodes;
        for (var n2 in i2) {
          var a2 = i2[n2];
          a2.nodeName === t2 && r2.push(a2);
        }
        return r2;
      }, resolveVastAdTagURI: function(e2, t2) {
        if (!t2)
          return e2;
        if (0 === e2.indexOf("//")) {
          var r2 = location.protocol;
          return "".concat(r2).concat(e2);
        }
        if (-1 === e2.indexOf("://")) {
          var i2 = t2.slice(0, t2.lastIndexOf("/"));
          return "".concat(i2, "/").concat(e2);
        }
        return e2;
      }, parseBoolean: L, parseNodeText: function(e2) {
        return e2 && (e2.textContent || e2.text || "").trim();
      }, copyNodeAttribute: function(e2, t2, r2) {
        var i2 = t2.getAttribute(e2);
        i2 && r2.setAttribute(e2, i2);
      }, parseAttributes: function(e2) {
        for (var t2 = e2.attributes, r2 = {}, i2 = 0; i2 < t2.length; i2++)
          r2[t2[i2].nodeName] = t2[i2].nodeValue;
        return r2;
      }, parseDuration: function(e2) {
        if (null == e2)
          return -1;
        if (N.isNumeric(e2))
          return parseInt(e2);
        var t2 = e2.split(":");
        if (3 !== t2.length)
          return -1;
        var r2 = t2[2].split("."), i2 = parseInt(r2[0]);
        2 === r2.length && (i2 += parseFloat("0.".concat(r2[1])));
        var n2 = parseInt(60 * t2[1]), a2 = parseInt(60 * t2[0] * 60);
        return isNaN(a2) || isNaN(n2) || isNaN(i2) || n2 > 3600 || i2 > 60 ? -1 : a2 + n2 + i2;
      }, splitVAST: function(e2) {
        var t2 = [], r2 = null;
        return e2.forEach(function(i2, n2) {
          if (i2.sequence && (i2.sequence = parseInt(i2.sequence, 10)), i2.sequence > 1) {
            var a2 = e2[n2 - 1];
            if (a2 && a2.sequence === i2.sequence - 1)
              return void (r2 && r2.push(i2));
            delete i2.sequence;
          }
          r2 = [i2], t2.push(r2);
        }), t2;
      }, assignAttributes: function(e2, t2) {
        if (e2)
          for (var r2 in e2) {
            var i2 = e2[r2];
            if (i2.nodeName && i2.nodeValue && t2.hasOwnProperty(i2.nodeName)) {
              var n2 = i2.nodeValue;
              "boolean" == typeof t2[i2.nodeName] && (n2 = L(n2)), t2[i2.nodeName] = n2;
            }
          }
      }, mergeWrapperAdData: function(e2, t2) {
        e2.errorURLTemplates = t2.errorURLTemplates.concat(e2.errorURLTemplates), e2.impressionURLTemplates = t2.impressionURLTemplates.concat(e2.impressionURLTemplates), e2.extensions = t2.extensions.concat(e2.extensions), t2.viewableImpression.length > 0 && (e2.viewableImpression = [].concat(h(e2.viewableImpression), h(t2.viewableImpression))), e2.followAdditionalWrappers = t2.followAdditionalWrappers, e2.allowMultipleAds = t2.allowMultipleAds, e2.fallbackOnNoAd = t2.fallbackOnNoAd;
        var r2 = (t2.creatives || []).filter(function(e3) {
          return e3 && "companion" === e3.type;
        }), i2 = r2.reduce(function(e3, t3) {
          return (t3.variations || []).forEach(function(t4) {
            (t4.companionClickTrackingURLTemplates || []).forEach(function(t5) {
              N.containsTemplateObject(t5, e3) || e3.push(t5);
            });
          }), e3;
        }, []);
        e2.creatives = r2.concat(e2.creatives);
        var n2 = t2.videoClickTrackingURLTemplates && t2.videoClickTrackingURLTemplates.length, a2 = t2.videoCustomClickURLTemplates && t2.videoCustomClickURLTemplates.length;
        e2.creatives.forEach(function(e3) {
          if (t2.trackingEvents && t2.trackingEvents[e3.type])
            for (var r3 in t2.trackingEvents[e3.type]) {
              var o2 = t2.trackingEvents[e3.type][r3];
              Array.isArray(e3.trackingEvents[r3]) || (e3.trackingEvents[r3] = []), e3.trackingEvents[r3] = e3.trackingEvents[r3].concat(o2);
            }
          "linear" === e3.type && (n2 && (e3.videoClickTrackingURLTemplates = e3.videoClickTrackingURLTemplates.concat(t2.videoClickTrackingURLTemplates)), a2 && (e3.videoCustomClickURLTemplates = e3.videoCustomClickURLTemplates.concat(t2.videoCustomClickURLTemplates)), !t2.videoClickThroughURLTemplate || null !== e3.videoClickThroughURLTemplate && void 0 !== e3.videoClickThroughURLTemplate || (e3.videoClickThroughURLTemplate = t2.videoClickThroughURLTemplate)), "companion" === e3.type && i2.length && (e3.variations || []).forEach(function(e4) {
            e4.companionClickTrackingURLTemplates = N.joinArrayOfUniqueTemplateObjs(e4.companionClickTrackingURLTemplates, i2);
          });
        }), t2.adVerifications && (e2.adVerifications = e2.adVerifications.concat(t2.adVerifications)), t2.blockedAdCategories && (e2.blockedAdCategories = e2.blockedAdCategories.concat(t2.blockedAdCategories));
      } };
      function U(e2, t2) {
        var r2 = function() {
          var e3 = f(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), t3 = e3.id, r3 = e3.adId, i2 = e3.sequence, n2 = e3.apiFramework;
          return { id: t3, adId: r3, sequence: i2, apiFramework: n2, type: "companion", required: null, variations: [] };
        }(t2);
        return r2.required = e2.getAttribute("required") || null, r2.variations = w.childrenByName(e2, "Companion").map(function(e3) {
          var t3 = function() {
            var e4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            return { id: e4.id || null, adType: "companionAd", width: e4.width || 0, height: e4.height || 0, assetWidth: e4.assetWidth || null, assetHeight: e4.assetHeight || null, expandedWidth: e4.expandedWidth || null, expandedHeight: e4.expandedHeight || null, apiFramework: e4.apiFramework || null, adSlotID: e4.adSlotID || null, pxratio: e4.pxratio || "1", renderingMode: e4.renderingMode || "default", staticResources: [], htmlResources: [], iframeResources: [], adParameters: null, xmlEncoded: null, altText: null, companionClickThroughURLTemplate: null, companionClickTrackingURLTemplates: [], trackingEvents: {} };
          }(w.parseAttributes(e3));
          t3.htmlResources = w.childrenByName(e3, "HTMLResource").reduce(function(e4, t4) {
            var r4 = w.parseNodeText(t4);
            return r4 ? e4.concat(r4) : e4;
          }, []), t3.iframeResources = w.childrenByName(e3, "IFrameResource").reduce(function(e4, t4) {
            var r4 = w.parseNodeText(t4);
            return r4 ? e4.concat(r4) : e4;
          }, []), t3.staticResources = w.childrenByName(e3, "StaticResource").reduce(function(e4, t4) {
            var r4 = w.parseNodeText(t4);
            return r4 ? e4.concat({ url: r4, creativeType: t4.getAttribute("creativeType") || null }) : e4;
          }, []), t3.altText = w.parseNodeText(w.childByName(e3, "AltText")) || null;
          var r3 = w.childByName(e3, "TrackingEvents");
          r3 && w.childrenByName(r3, "Tracking").forEach(function(e4) {
            var r4 = e4.getAttribute("event"), i3 = w.parseNodeText(e4);
            r4 && i3 && (Array.isArray(t3.trackingEvents[r4]) || (t3.trackingEvents[r4] = []), t3.trackingEvents[r4].push(i3));
          }), t3.companionClickTrackingURLTemplates = w.childrenByName(e3, "CompanionClickTracking").map(function(e4) {
            return { id: e4.getAttribute("id") || null, url: w.parseNodeText(e4) };
          }), t3.companionClickThroughURLTemplate = w.parseNodeText(w.childByName(e3, "CompanionClickThrough")) || null;
          var i2 = w.childByName(e3, "AdParameters");
          return i2 && (t3.adParameters = w.parseNodeText(i2), t3.xmlEncoded = i2.getAttribute("xmlEncoded") || null), t3;
        }), r2;
      }
      function C(e2) {
        return "linear" === e2.type;
      }
      function I(e2, t2) {
        var r2, i2 = function() {
          var e3 = f(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), t3 = e3.id, r3 = e3.adId, i3 = e3.sequence, n3 = e3.apiFramework;
          return { id: t3, adId: r3, sequence: i3, apiFramework: n3, type: "linear", duration: 0, skipDelay: null, mediaFiles: [], mezzanine: null, interactiveCreativeFile: null, closedCaptionFiles: [], videoClickThroughURLTemplate: null, videoClickTrackingURLTemplates: [], videoCustomClickURLTemplates: [], adParameters: null, icons: [], trackingEvents: {} };
        }(t2);
        i2.duration = w.parseDuration(w.parseNodeText(w.childByName(e2, "Duration")));
        var n2 = e2.getAttribute("skipoffset");
        if (null == n2)
          i2.skipDelay = null;
        else if ("%" === n2.charAt(n2.length - 1) && -1 !== i2.duration) {
          var a2 = parseInt(n2, 10);
          i2.skipDelay = i2.duration * (a2 / 100);
        } else
          i2.skipDelay = w.parseDuration(n2);
        var o2 = w.childByName(e2, "VideoClicks");
        if (o2) {
          var s2 = w.childByName(o2, "ClickThrough");
          i2.videoClickThroughURLTemplate = s2 ? { id: s2.getAttribute("id") || null, url: w.parseNodeText(s2) } : null, w.childrenByName(o2, "ClickTracking").forEach(function(e3) {
            i2.videoClickTrackingURLTemplates.push({ id: e3.getAttribute("id") || null, url: w.parseNodeText(e3) });
          }), w.childrenByName(o2, "CustomClick").forEach(function(e3) {
            i2.videoCustomClickURLTemplates.push({ id: e3.getAttribute("id") || null, url: w.parseNodeText(e3) });
          });
        }
        var l2 = w.childByName(e2, "AdParameters");
        l2 && (i2.adParameters = w.parseNodeText(l2)), w.childrenByName(e2, "TrackingEvents").forEach(function(e3) {
          w.childrenByName(e3, "Tracking").forEach(function(e4) {
            var t3 = e4.getAttribute("event"), n3 = w.parseNodeText(e4);
            if (t3 && n3) {
              if ("progress" === t3) {
                if (!(r2 = e4.getAttribute("offset")))
                  return;
                t3 = "%" === r2.charAt(r2.length - 1) ? "progress-".concat(r2) : "progress-".concat(Math.round(w.parseDuration(r2)));
              }
              Array.isArray(i2.trackingEvents[t3]) || (i2.trackingEvents[t3] = []), i2.trackingEvents[t3].push(n3);
            }
          });
        }), w.childrenByName(e2, "MediaFiles").forEach(function(e3) {
          w.childrenByName(e3, "MediaFile").forEach(function(e4) {
            i2.mediaFiles.push(function(e5) {
              var t4 = { id: null, fileURL: null, fileSize: 0, deliveryType: "progressive", mimeType: null, mediaType: null, codec: null, bitrate: 0, minBitrate: 0, maxBitrate: 0, width: 0, height: 0, apiFramework: null, scalable: null, maintainAspectRatio: null };
              t4.id = e5.getAttribute("id"), t4.fileURL = w.parseNodeText(e5), t4.deliveryType = e5.getAttribute("delivery"), t4.codec = e5.getAttribute("codec"), t4.mimeType = e5.getAttribute("type"), t4.mediaType = e5.getAttribute("mediaType") || "2D", t4.apiFramework = e5.getAttribute("apiFramework"), t4.fileSize = parseInt(e5.getAttribute("fileSize") || 0), t4.bitrate = parseInt(e5.getAttribute("bitrate") || 0), t4.minBitrate = parseInt(e5.getAttribute("minBitrate") || 0), t4.maxBitrate = parseInt(e5.getAttribute("maxBitrate") || 0), t4.width = parseInt(e5.getAttribute("width") || 0), t4.height = parseInt(e5.getAttribute("height") || 0);
              var r4 = e5.getAttribute("scalable");
              r4 && "string" == typeof r4 && (t4.scalable = w.parseBoolean(r4));
              var i3 = e5.getAttribute("maintainAspectRatio");
              i3 && "string" == typeof i3 && (t4.maintainAspectRatio = w.parseBoolean(i3));
              return t4;
            }(e4));
          });
          var t3 = w.childByName(e3, "InteractiveCreativeFile");
          t3 && (i2.interactiveCreativeFile = function(e4) {
            var t4 = function() {
              var e5 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
              return { type: e5.type || null, apiFramework: e5.apiFramework || null, variableDuration: w.parseBoolean(e5.variableDuration), fileURL: null };
            }(w.parseAttributes(e4));
            return t4.fileURL = w.parseNodeText(e4), t4;
          }(t3));
          var r3 = w.childByName(e3, "ClosedCaptionFiles");
          r3 && w.childrenByName(r3, "ClosedCaptionFile").forEach(function(e4) {
            var t4 = function() {
              var e5 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
              return { type: e5.type || null, language: e5.language || null, fileURL: null };
            }(w.parseAttributes(e4));
            t4.fileURL = w.parseNodeText(e4), i2.closedCaptionFiles.push(t4);
          });
          var n3, a3, o3, s3 = w.childByName(e3, "Mezzanine"), l3 = (n3 = s3, a3 = {}, o3 = false, ["delivery", "type", "width", "height"].forEach(function(e4) {
            n3 && n3.getAttribute(e4) ? a3[e4] = n3.getAttribute(e4) : o3 = true;
          }), o3 ? null : a3);
          if (l3) {
            var u3 = { id: null, fileURL: null, delivery: null, codec: null, type: null, width: 0, height: 0, fileSize: 0, mediaType: "2D" };
            u3.id = s3.getAttribute("id"), u3.fileURL = w.parseNodeText(s3), u3.delivery = l3.delivery, u3.codec = s3.getAttribute("codec"), u3.type = l3.type, u3.width = parseInt(l3.width, 10), u3.height = parseInt(l3.height, 10), u3.fileSize = parseInt(s3.getAttribute("fileSize"), 10), u3.mediaType = s3.getAttribute("mediaType") || "2D", i2.mezzanine = u3;
          }
        });
        var u2 = w.childByName(e2, "Icons");
        return u2 && w.childrenByName(u2, "Icon").forEach(function(e3) {
          i2.icons.push(function(e4) {
            var t3 = { program: null, height: 0, width: 0, xPosition: 0, yPosition: 0, apiFramework: null, offset: null, duration: 0, type: null, staticResource: null, htmlResource: null, iframeResource: null, pxratio: "1", iconClickThroughURLTemplate: null, iconClickTrackingURLTemplates: [], iconViewTrackingURLTemplate: null };
            t3.program = e4.getAttribute("program"), t3.height = parseInt(e4.getAttribute("height") || 0), t3.width = parseInt(e4.getAttribute("width") || 0), t3.xPosition = function(e5) {
              if (-1 !== ["left", "right"].indexOf(e5))
                return e5;
              return parseInt(e5 || 0);
            }(e4.getAttribute("xPosition")), t3.yPosition = function(e5) {
              if (-1 !== ["top", "bottom"].indexOf(e5))
                return e5;
              return parseInt(e5 || 0);
            }(e4.getAttribute("yPosition")), t3.apiFramework = e4.getAttribute("apiFramework"), t3.pxratio = e4.getAttribute("pxratio") || "1", t3.offset = w.parseDuration(e4.getAttribute("offset")), t3.duration = w.parseDuration(e4.getAttribute("duration")), w.childrenByName(e4, "HTMLResource").forEach(function(e5) {
              t3.type = e5.getAttribute("creativeType") || "text/html", t3.htmlResource = w.parseNodeText(e5);
            }), w.childrenByName(e4, "IFrameResource").forEach(function(e5) {
              t3.type = e5.getAttribute("creativeType") || 0, t3.iframeResource = w.parseNodeText(e5);
            }), w.childrenByName(e4, "StaticResource").forEach(function(e5) {
              t3.type = e5.getAttribute("creativeType") || 0, t3.staticResource = w.parseNodeText(e5);
            });
            var r3 = w.childByName(e4, "IconClicks");
            r3 && (t3.iconClickThroughURLTemplate = w.parseNodeText(w.childByName(r3, "IconClickThrough")), w.childrenByName(r3, "IconClickTracking").forEach(function(e5) {
              t3.iconClickTrackingURLTemplates.push({ id: e5.getAttribute("id") || null, url: w.parseNodeText(e5) });
            }));
            return t3.iconViewTrackingURLTemplate = w.parseNodeText(w.childByName(e4, "IconViewTracking")), t3;
          }(e3));
        }), i2;
      }
      function x(e2, t2) {
        var r2 = function() {
          var e3 = f(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), t3 = e3.id, r3 = e3.adId, i2 = e3.sequence, n2 = e3.apiFramework;
          return { id: t3, adId: r3, sequence: i2, apiFramework: n2, type: "nonlinear", variations: [], trackingEvents: {} };
        }(t2);
        return w.childrenByName(e2, "TrackingEvents").forEach(function(e3) {
          var t3, i2;
          w.childrenByName(e3, "Tracking").forEach(function(e4) {
            t3 = e4.getAttribute("event"), i2 = w.parseNodeText(e4), t3 && i2 && (Array.isArray(r2.trackingEvents[t3]) || (r2.trackingEvents[t3] = []), r2.trackingEvents[t3].push(i2));
          });
        }), w.childrenByName(e2, "NonLinear").forEach(function(e3) {
          var t3 = { id: null, width: 0, height: 0, expandedWidth: 0, expandedHeight: 0, scalable: true, maintainAspectRatio: true, minSuggestedDuration: 0, apiFramework: "static", adType: "nonLinearAd", type: null, staticResource: null, htmlResource: null, iframeResource: null, nonlinearClickThroughURLTemplate: null, nonlinearClickTrackingURLTemplates: [], adParameters: null };
          t3.id = e3.getAttribute("id") || null, t3.width = e3.getAttribute("width"), t3.height = e3.getAttribute("height"), t3.expandedWidth = e3.getAttribute("expandedWidth"), t3.expandedHeight = e3.getAttribute("expandedHeight"), t3.scalable = w.parseBoolean(e3.getAttribute("scalable")), t3.maintainAspectRatio = w.parseBoolean(e3.getAttribute("maintainAspectRatio")), t3.minSuggestedDuration = w.parseDuration(e3.getAttribute("minSuggestedDuration")), t3.apiFramework = e3.getAttribute("apiFramework"), w.childrenByName(e3, "HTMLResource").forEach(function(e4) {
            t3.type = e4.getAttribute("creativeType") || "text/html", t3.htmlResource = w.parseNodeText(e4);
          }), w.childrenByName(e3, "IFrameResource").forEach(function(e4) {
            t3.type = e4.getAttribute("creativeType") || 0, t3.iframeResource = w.parseNodeText(e4);
          }), w.childrenByName(e3, "StaticResource").forEach(function(e4) {
            t3.type = e4.getAttribute("creativeType") || 0, t3.staticResource = w.parseNodeText(e4);
          });
          var i2 = w.childByName(e3, "AdParameters");
          i2 && (t3.adParameters = w.parseNodeText(i2)), t3.nonlinearClickThroughURLTemplate = w.parseNodeText(w.childByName(e3, "NonLinearClickThrough")), w.childrenByName(e3, "NonLinearClickTracking").forEach(function(e4) {
            t3.nonlinearClickTrackingURLTemplates.push({ id: e4.getAttribute("id") || null, url: w.parseNodeText(e4) });
          }), r2.variations.push(t3);
        }), r2;
      }
      function S(e2) {
        var t2 = [];
        return e2.forEach(function(e3) {
          var r2 = O(e3);
          r2 && t2.push(r2);
        }), t2;
      }
      function O(e2) {
        if ("#comment" === e2.nodeName)
          return null;
        var t2, r2 = { name: null, value: null, attributes: {}, children: [] }, i2 = e2.attributes, n2 = e2.childNodes;
        if (r2.name = e2.nodeName, e2.attributes) {
          for (var a2 in i2)
            if (i2.hasOwnProperty(a2)) {
              var o2 = i2[a2];
              o2.nodeName && o2.nodeValue && (r2.attributes[o2.nodeName] = o2.nodeValue);
            }
        }
        for (var s2 in n2)
          if (n2.hasOwnProperty(s2)) {
            var l2 = O(n2[s2]);
            l2 && r2.children.push(l2);
          }
        if (0 === r2.children.length || 1 === r2.children.length && ["#cdata-section", "#text"].indexOf(r2.children[0].name) >= 0) {
          var u2 = w.parseNodeText(e2);
          "" !== u2 && (r2.value = u2), r2.children = [];
        }
        return null === (t2 = r2).value && 0 === Object.keys(t2.attributes).length && 0 === t2.children.length ? null : r2;
      }
      function D(e2) {
        var t2 = [];
        return e2.forEach(function(e3) {
          var r2, i2 = { id: e3.getAttribute("id") || null, adId: V(e3), sequence: e3.getAttribute("sequence") || null, apiFramework: e3.getAttribute("apiFramework") || null }, n2 = [];
          w.childrenByName(e3, "UniversalAdId").forEach(function(e4) {
            var t3 = { idRegistry: e4.getAttribute("idRegistry") || "unknown", value: w.parseNodeText(e4) };
            n2.push(t3);
          });
          var a2 = w.childByName(e3, "CreativeExtensions");
          for (var o2 in a2 && (r2 = S(w.childrenByName(a2, "CreativeExtension"))), e3.childNodes) {
            var s2 = e3.childNodes[o2], l2 = void 0;
            switch (s2.nodeName) {
              case "Linear":
                l2 = I(s2, i2);
                break;
              case "NonLinearAds":
                l2 = x(s2, i2);
                break;
              case "CompanionAds":
                l2 = U(s2, i2);
            }
            l2 && (n2 && (l2.universalAdIds = n2), r2 && (l2.creativeExtensions = r2), t2.push(l2));
          }
        }), t2;
      }
      function V(e2) {
        return e2.getAttribute("AdID") || e2.getAttribute("adID") || e2.getAttribute("adId") || null;
      }
      var P = { Wrapper: { subElements: ["VASTAdTagURI", "Impression"] }, BlockedAdCategories: { attributes: ["authority"] }, InLine: { subElements: ["AdSystem", "AdTitle", "Impression", "AdServingId", "Creatives"] }, Category: { attributes: ["authority"] }, Pricing: { attributes: ["model", "currency"] }, Verification: { oneOfinLineResources: ["JavaScriptResource", "ExecutableResource"], attributes: ["vendor"] }, UniversalAdId: { attributes: ["idRegistry"] }, JavaScriptResource: { attributes: ["apiFramework", "browserOptional"] }, ExecutableResource: { attributes: ["apiFramework", "type"] }, Tracking: { attributes: ["event"] }, Creatives: { subElements: ["Creative"] }, Creative: { subElements: ["UniversalAdId"] }, Linear: { subElements: ["MediaFiles", "Duration"] }, MediaFiles: { subElements: ["MediaFile"] }, MediaFile: { attributes: ["delivery", "type", "width", "height"] }, Mezzanine: { attributes: ["delivery", "type", "width", "height"] }, NonLinear: { oneOfinLineResources: ["StaticResource", "IFrameResource", "HTMLResource"], attributes: ["width", "height"] }, Companion: { oneOfinLineResources: ["StaticResource", "IFrameResource", "HTMLResource"], attributes: ["width", "height"] }, StaticResource: { attributes: ["creativeType"] }, Icons: { subElements: ["Icon"] }, Icon: { oneOfinLineResources: ["StaticResource", "IFrameResource", "HTMLResource"] } };
      function B(e2, t2) {
        if (P[e2.nodeName] && P[e2.nodeName].attributes) {
          var r2 = P[e2.nodeName].attributes.filter(function(t3) {
            return !e2.getAttribute(t3);
          });
          r2.length > 0 && j({ name: e2.nodeName, parentName: e2.parentNode.nodeName, attributes: r2 }, t2);
        }
      }
      function F(e2, t2, r2) {
        var i2 = P[e2.nodeName], n2 = !r2 && "Wrapper" !== e2.nodeName;
        if (i2 && !n2) {
          if (i2.subElements) {
            var a2 = i2.subElements.filter(function(t3) {
              return !w.childByName(e2, t3);
            });
            a2.length > 0 && j({ name: e2.nodeName, parentName: e2.parentNode.nodeName, subElements: a2 }, t2);
          }
          if (r2 && i2.oneOfinLineResources)
            i2.oneOfinLineResources.some(function(t3) {
              return w.childByName(e2, t3);
            }) || j({ name: e2.nodeName, parentName: e2.parentNode.nodeName, oneOfResources: i2.oneOfinLineResources }, t2);
        }
      }
      function M(e2) {
        return e2.children && 0 !== e2.children.length;
      }
      function j(e2, t2) {
        var r2 = e2.name, i2 = e2.parentName, n2 = e2.attributes, a2 = e2.subElements, o2 = e2.oneOfResources, s2 = "Element '".concat(r2, "'");
        t2("VAST-warning", { message: s2 += n2 ? " missing required attribute(s) '".concat(n2.join(", "), "' ") : a2 ? " missing required sub element(s) '".concat(a2.join(", "), "' ") : o2 ? " must provide one of the following '".concat(o2.join(", "), "' ") : " is empty", parentElement: i2, specVersion: 4.1 });
      }
      var W = { verifyRequiredValues: function e2(t2, r2, i2) {
        if (t2 && t2.nodeName)
          if ("InLine" === t2.nodeName && (i2 = true), B(t2, r2), M(t2)) {
            F(t2, r2, i2);
            for (var n2 = 0; n2 < t2.children.length; n2++)
              e2(t2.children[n2], r2, i2);
          } else
            0 === w.parseNodeText(t2).length && j({ name: t2.nodeName, parentName: t2.parentNode.nodeName }, r2);
      }, hasSubElements: M, emitMissingValueWarning: j, verifyRequiredAttributes: B, verifyRequiredSubElements: F };
      function q(e2, t2) {
        var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, i2 = r2.allowMultipleAds, n2 = r2.followAdditionalWrappers, a2 = e2.childNodes;
        for (var o2 in a2) {
          var s2 = a2[o2];
          if (-1 !== ["Wrapper", "InLine"].indexOf(s2.nodeName) && ("Wrapper" !== s2.nodeName || false !== n2)) {
            if (w.copyNodeAttribute("id", e2, s2), w.copyNodeAttribute("sequence", e2, s2), w.copyNodeAttribute("adType", e2, s2), "Wrapper" === s2.nodeName)
              return { ad: G(s2, t2), type: "WRAPPER" };
            if ("InLine" === s2.nodeName)
              return { ad: H(s2, t2, { allowMultipleAds: i2 }), type: "INLINE" };
          }
        }
      }
      function H(e2, t2) {
        var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, i2 = r2.allowMultipleAds;
        return false === i2 && e2.getAttribute("sequence") ? null : _(e2, t2);
      }
      function _(e2, t2) {
        var r2 = [];
        t2 && W.verifyRequiredValues(e2, t2);
        var i2 = e2.childNodes, n2 = function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          return { id: e3.id || null, sequence: e3.sequence || null, adType: e3.adType || null, adServingId: null, categories: [], expires: null, viewableImpression: [], system: null, title: null, description: null, advertiser: null, pricing: null, survey: null, errorURLTemplates: [], impressionURLTemplates: [], creatives: [], extensions: [], adVerifications: [], blockedAdCategories: [], followAdditionalWrappers: true, allowMultipleAds: false, fallbackOnNoAd: null };
        }(w.parseAttributes(e2));
        for (var a2 in i2) {
          var o2 = i2[a2];
          switch (o2.nodeName) {
            case "Error":
              n2.errorURLTemplates.push(w.parseNodeText(o2));
              break;
            case "Impression":
              n2.impressionURLTemplates.push({ id: o2.getAttribute("id") || null, url: w.parseNodeText(o2) });
              break;
            case "Creatives":
              n2.creatives = D(w.childrenByName(o2, "Creative"));
              break;
            case "Extensions":
              var s2 = w.childrenByName(o2, "Extension");
              n2.extensions = S(s2), n2.adVerifications.length || (r2 = Y(s2));
              break;
            case "AdVerifications":
              n2.adVerifications = z(w.childrenByName(o2, "Verification"));
              break;
            case "AdSystem":
              n2.system = { value: w.parseNodeText(o2), version: o2.getAttribute("version") || null };
              break;
            case "AdTitle":
              n2.title = w.parseNodeText(o2);
              break;
            case "AdServingId":
              n2.adServingId = w.parseNodeText(o2);
              break;
            case "Category":
              n2.categories.push({ authority: o2.getAttribute("authority") || null, value: w.parseNodeText(o2) });
              break;
            case "Expires":
              n2.expires = parseInt(w.parseNodeText(o2), 10);
              break;
            case "ViewableImpression":
              n2.viewableImpression.push(X(o2));
              break;
            case "Description":
              n2.description = w.parseNodeText(o2);
              break;
            case "Advertiser":
              n2.advertiser = { id: o2.getAttribute("id") || null, value: w.parseNodeText(o2) };
              break;
            case "Pricing":
              n2.pricing = { value: w.parseNodeText(o2), model: o2.getAttribute("model") || null, currency: o2.getAttribute("currency") || null };
              break;
            case "Survey":
              n2.survey = w.parseNodeText(o2);
              break;
            case "BlockedAdCategories":
              n2.blockedAdCategories.push({ authority: o2.getAttribute("authority") || null, value: w.parseNodeText(o2) });
          }
        }
        return r2.length && (n2.adVerifications = n2.adVerifications.concat(r2)), n2;
      }
      function G(e2, t2) {
        var r2 = _(e2, t2), i2 = e2.getAttribute("followAdditionalWrappers"), n2 = e2.getAttribute("allowMultipleAds"), a2 = e2.getAttribute("fallbackOnNoAd");
        r2.followAdditionalWrappers = !i2 || w.parseBoolean(i2), r2.allowMultipleAds = !!n2 && w.parseBoolean(n2), r2.fallbackOnNoAd = a2 ? w.parseBoolean(a2) : null;
        var o2 = w.childByName(e2, "VASTAdTagURI");
        if (o2 ? r2.nextWrapperURL = w.parseNodeText(o2) : (o2 = w.childByName(e2, "VASTAdTagURL")) && (r2.nextWrapperURL = w.parseNodeText(w.childByName(o2, "URL"))), r2.creatives.forEach(function(e3) {
          if (-1 !== ["linear", "nonlinear"].indexOf(e3.type)) {
            if (e3.trackingEvents) {
              r2.trackingEvents || (r2.trackingEvents = {}), r2.trackingEvents[e3.type] || (r2.trackingEvents[e3.type] = {});
              var t3 = function(t4) {
                var i4 = e3.trackingEvents[t4];
                Array.isArray(r2.trackingEvents[e3.type][t4]) || (r2.trackingEvents[e3.type][t4] = []), i4.forEach(function(i5) {
                  r2.trackingEvents[e3.type][t4].push(i5);
                });
              };
              for (var i3 in e3.trackingEvents)
                t3(i3);
            }
            e3.videoClickTrackingURLTemplates && (Array.isArray(r2.videoClickTrackingURLTemplates) || (r2.videoClickTrackingURLTemplates = []), e3.videoClickTrackingURLTemplates.forEach(function(e4) {
              r2.videoClickTrackingURLTemplates.push(e4);
            })), e3.videoClickThroughURLTemplate && (r2.videoClickThroughURLTemplate = e3.videoClickThroughURLTemplate), e3.videoCustomClickURLTemplates && (Array.isArray(r2.videoCustomClickURLTemplates) || (r2.videoCustomClickURLTemplates = []), e3.videoCustomClickURLTemplates.forEach(function(e4) {
              r2.videoCustomClickURLTemplates.push(e4);
            }));
          }
        }), r2.nextWrapperURL)
          return r2;
      }
      function z(e2) {
        var t2 = [];
        return e2.forEach(function(e3) {
          var r2 = { resource: null, vendor: null, browserOptional: false, apiFramework: null, type: null, parameters: null, trackingEvents: {} }, i2 = e3.childNodes;
          for (var n2 in w.assignAttributes(e3.attributes, r2), i2) {
            var a2 = i2[n2];
            switch (a2.nodeName) {
              case "JavaScriptResource":
              case "ExecutableResource":
                r2.resource = w.parseNodeText(a2), w.assignAttributes(a2.attributes, r2);
                break;
              case "VerificationParameters":
                r2.parameters = w.parseNodeText(a2);
            }
          }
          var o2 = w.childByName(e3, "TrackingEvents");
          o2 && w.childrenByName(o2, "Tracking").forEach(function(e4) {
            var t3 = e4.getAttribute("event"), i3 = w.parseNodeText(e4);
            t3 && i3 && (Array.isArray(r2.trackingEvents[t3]) || (r2.trackingEvents[t3] = []), r2.trackingEvents[t3].push(i3));
          }), t2.push(r2);
        }), t2;
      }
      function Y(e2) {
        var t2 = null, r2 = [];
        return e2.some(function(e3) {
          return t2 = w.childByName(e3, "AdVerifications");
        }), t2 && (r2 = z(w.childrenByName(t2, "Verification"))), r2;
      }
      function X(e2) {
        var t2 = {};
        t2.id = e2.getAttribute("id") || null;
        var r2 = e2.childNodes;
        for (var i2 in r2) {
          var n2 = r2[i2], a2 = n2.nodeName, o2 = w.parseNodeText(n2);
          if (("Viewable" === a2 || "NotViewable" === a2 || "ViewUndetermined" === a2) && o2) {
            var s2 = a2.toLowerCase();
            Array.isArray(t2[s2]) || (t2[s2] = []), t2[s2].push(o2);
          }
        }
        return t2;
      }
      var K = function() {
        function e2() {
          n(this, e2), this._handlers = [];
        }
        return o(e2, [{ key: "on", value: function(e3, t2) {
          if ("function" != typeof t2)
            throw new TypeError("The handler argument must be of type Function. Received type ".concat(i(t2)));
          if (!e3)
            throw new TypeError("The event argument must be of type String. Received type ".concat(i(e3)));
          return this._handlers.push({ event: e3, handler: t2 }), this;
        } }, { key: "once", value: function(e3, t2) {
          return this.on(e3, function(e4, t3, r2) {
            var i2 = { fired: false, wrapFn: void 0 };
            function n2() {
              i2.fired || (e4.off(t3, i2.wrapFn), i2.fired = true, r2.bind(e4).apply(void 0, arguments));
            }
            return i2.wrapFn = n2, n2;
          }(this, e3, t2));
        } }, { key: "off", value: function(e3, t2) {
          return this._handlers = this._handlers.filter(function(r2) {
            return r2.event !== e3 || r2.handler !== t2;
          }), this;
        } }, { key: "emit", value: function(e3) {
          for (var t2 = arguments.length, r2 = new Array(t2 > 1 ? t2 - 1 : 0), i2 = 1; i2 < t2; i2++)
            r2[i2 - 1] = arguments[i2];
          var n2 = false;
          return this._handlers.forEach(function(t3) {
            "*" === t3.event && (n2 = true, t3.handler.apply(t3, [e3].concat(r2))), t3.event === e3 && (n2 = true, t3.handler.apply(t3, r2));
          }), n2;
        } }, { key: "removeAllListeners", value: function(e3) {
          return e3 ? (this._handlers = this._handlers.filter(function(t2) {
            return t2.event !== e3;
          }), this) : (this._handlers = [], this);
        } }, { key: "listenerCount", value: function(e3) {
          return this._handlers.filter(function(t2) {
            return t2.event === e3;
          }).length;
        } }, { key: "listeners", value: function(e3) {
          return this._handlers.reduce(function(t2, r2) {
            return r2.event === e3 && t2.push(r2.handler), t2;
          }, []);
        } }, { key: "eventNames", value: function() {
          return this._handlers.map(function(e3) {
            return e3.event;
          });
        } }]), e2;
      }();
      var Q = { get: function(e2, t2, r2) {
        r2(new Error("Please bundle the library for node to use the node urlHandler"));
      } }, Z = 12e4;
      function J() {
        try {
          var e2 = new window.XMLHttpRequest();
          return "withCredentials" in e2 ? e2 : null;
        } catch (e3) {
          return null;
        }
      }
      function $(e2, t2, r2) {
        var i2 = r2 ? 408 : e2.status, n2 = r2 ? "XHRURLHandler: Request timed out after ".concat(e2.timeout, " ms (").concat(i2, ")") : "XHRURLHandler: ".concat(e2.statusText, " (").concat(i2, ")");
        t2(new Error(n2), null, { statusCode: i2 });
      }
      var ee = { get: function(e2, t2, r2) {
        if ("https:" === window.location.protocol && 0 === e2.indexOf("http://"))
          return r2(new Error("XHRURLHandler: Cannot go from HTTPS to HTTP."));
        try {
          var i2 = J();
          i2.open("GET", e2), i2.timeout = t2.timeout || Z, i2.withCredentials = t2.withCredentials || false, i2.overrideMimeType && i2.overrideMimeType("text/xml"), i2.onload = function() {
            return function(e3, t3) {
              200 === e3.status ? t3(null, e3.responseXML, { byteLength: e3.response.length, statusCode: e3.status }) : $(e3, t3, false);
            }(i2, r2);
          }, i2.onerror = function() {
            return $(i2, r2, false);
          }, i2.onabort = function() {
            return $(i2, r2, false);
          }, i2.ontimeout = function() {
            return $(i2, r2, true);
          }, i2.send();
        } catch (e3) {
          r2(new Error("XHRURLHandler: Unexpected error"));
        }
      }, supported: function() {
        return !!J();
      } };
      var te = { get: function(e2, t2, r2) {
        return r2 || ("function" == typeof t2 && (r2 = t2), t2 = {}), "undefined" == typeof window || null === window ? Q.get(e2, t2, r2) : ee.supported() ? ee.get(e2, t2, r2) : r2(new Error("Current context is not supported by any of the default URLHandlers. Please provide a custom URLHandler"));
      } };
      var re = 0, ie = 0, ne = function(e2, t2) {
        !e2 || !t2 || e2 <= 0 || t2 <= 0 || (ie = (ie * re + 8 * e2 / t2) / ++re);
      }, ae = { ERRORCODE: 900, extensions: [] }, oe = function(e2) {
        l(r2, e2);
        var t2 = p(r2);
        function r2() {
          var e3;
          return n(this, r2), (e3 = t2.call(this)).remainingAds = [], e3.parentURLs = [], e3.errorURLTemplates = [], e3.rootErrorURLTemplates = [], e3.maxWrapperDepth = null, e3.URLTemplateFilters = [], e3.fetchingOptions = {}, e3.parsingOptions = {}, e3;
        }
        return o(r2, [{ key: "addURLTemplateFilter", value: function(e3) {
          "function" == typeof e3 && this.URLTemplateFilters.push(e3);
        } }, { key: "removeURLTemplateFilter", value: function() {
          this.URLTemplateFilters.pop();
        } }, { key: "countURLTemplateFilters", value: function() {
          return this.URLTemplateFilters.length;
        } }, { key: "clearURLTemplateFilters", value: function() {
          this.URLTemplateFilters = [];
        } }, { key: "trackVastError", value: function(e3, t3) {
          for (var r3 = arguments.length, i2 = new Array(r3 > 2 ? r3 - 2 : 0), n2 = 2; n2 < r3; n2++)
            i2[n2 - 2] = arguments[n2];
          this.emit("VAST-error", Object.assign.apply(Object, [{}, ae, t3].concat(i2))), N.track(e3, t3);
        } }, { key: "getErrorURLTemplates", value: function() {
          return this.rootErrorURLTemplates.concat(this.errorURLTemplates);
        } }, { key: "getEstimatedBitrate", value: function() {
          return ie;
        } }, { key: "fetchVAST", value: function(e3) {
          var t3 = this, r3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0, i2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null, n2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
          return new Promise(function(a2, o2) {
            t3.URLTemplateFilters.forEach(function(t4) {
              e3 = t4(e3);
            }), t3.parentURLs.push(e3);
            var s2 = Date.now();
            t3.emit("VAST-resolving", { url: e3, previousUrl: i2, wrapperDepth: r3, maxWrapperDepth: t3.maxWrapperDepth, timeout: t3.fetchingOptions.timeout, wrapperAd: n2 }), t3.urlHandler.get(e3, t3.fetchingOptions, function(n3, l2) {
              var u2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, c2 = Math.round(Date.now() - s2), d2 = Object.assign({ url: e3, previousUrl: i2, wrapperDepth: r3, error: n3, duration: c2 }, u2);
              t3.emit("VAST-resolved", d2), ne(u2.byteLength, c2), n3 ? o2(n3) : a2(l2);
            });
          });
        } }, { key: "initParsingStatus", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          this.errorURLTemplates = [], this.fetchingOptions = { timeout: e3.timeout || Z, withCredentials: e3.withCredentials }, this.maxWrapperDepth = e3.wrapperLimit || 10, this.parentURLs = [], this.parsingOptions = { allowMultipleAds: e3.allowMultipleAds }, this.remainingAds = [], this.rootErrorURLTemplates = [], this.rootURL = "", this.urlHandler = e3.urlHandler || e3.urlhandler || te, this.vastVersion = null, ne(e3.byteLength, e3.requestDuration);
        } }, { key: "getRemainingAds", value: function(e3) {
          var t3 = this;
          if (0 === this.remainingAds.length)
            return Promise.reject(new Error("No more ads are available for the given VAST"));
          var r3 = e3 ? N.flatten(this.remainingAds) : this.remainingAds.shift();
          return this.errorURLTemplates = [], this.parentURLs = [], this.resolveAds(r3, { wrapperDepth: 0, url: this.rootURL }).then(function(e4) {
            return t3.buildVASTResponse(e4);
          });
        } }, { key: "getAndParseVAST", value: function(e3) {
          var t3 = this, r3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          return this.initParsingStatus(r3), this.URLTemplateFilters.forEach(function(t4) {
            e3 = t4(e3);
          }), this.rootURL = e3, this.fetchVAST(e3).then(function(i2) {
            return r3.previousUrl = e3, r3.isRootVAST = true, r3.url = e3, t3.parse(i2, r3).then(function(e4) {
              return t3.buildVASTResponse(e4);
            });
          });
        } }, { key: "parseVAST", value: function(e3) {
          var t3 = this, r3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          return this.initParsingStatus(r3), r3.isRootVAST = true, this.parse(e3, r3).then(function(e4) {
            return t3.buildVASTResponse(e4);
          });
        } }, { key: "buildVASTResponse", value: function(e3) {
          var t3, r3 = { ads: (t3 = { ads: e3, errorURLTemplates: this.getErrorURLTemplates(), version: this.vastVersion }).ads || [], errorURLTemplates: t3.errorURLTemplates || [], version: t3.version || null };
          return this.completeWrapperResolving(r3), r3;
        } }, { key: "parseVastXml", value: function(e3, t3) {
          var r3 = t3.isRootVAST, i2 = void 0 !== r3 && r3, n2 = t3.url, a2 = void 0 === n2 ? null : n2, o2 = t3.wrapperDepth, s2 = void 0 === o2 ? 0 : o2, l2 = t3.allowMultipleAds, u2 = t3.followAdditionalWrappers;
          if (!e3 || !e3.documentElement || "VAST" !== e3.documentElement.nodeName)
            throw this.emit("VAST-ad-parsed", { type: "ERROR", url: a2, wrapperDepth: s2 }), new Error("Invalid VAST XMLDocument");
          var c2 = [], d2 = e3.documentElement.childNodes, p2 = e3.documentElement.getAttribute("version");
          for (var h2 in i2 && p2 && (this.vastVersion = p2), d2) {
            var v2 = d2[h2];
            if ("Error" === v2.nodeName) {
              var f2 = w.parseNodeText(v2);
              i2 ? this.rootErrorURLTemplates.push(f2) : this.errorURLTemplates.push(f2);
            } else if ("Ad" === v2.nodeName) {
              if (this.vastVersion && parseFloat(this.vastVersion) < 3)
                l2 = true;
              else if (false === l2 && c2.length > 1)
                break;
              var m2 = q(v2, this.emit.bind(this), { allowMultipleAds: l2, followAdditionalWrappers: u2 });
              m2.ad ? (c2.push(m2.ad), this.emit("VAST-ad-parsed", { type: m2.type, url: a2, wrapperDepth: s2, adIndex: c2.length - 1, vastVersion: p2 })) : this.trackVastError(this.getErrorURLTemplates(), { ERRORCODE: 101 });
            }
          }
          return c2;
        } }, { key: "parse", value: function(e3) {
          var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, r3 = t3.url, i2 = void 0 === r3 ? null : r3, n2 = t3.resolveAll, a2 = void 0 === n2 || n2, o2 = t3.wrapperSequence, s2 = void 0 === o2 ? null : o2, l2 = t3.previousUrl, u2 = void 0 === l2 ? null : l2, c2 = t3.wrapperDepth, d2 = void 0 === c2 ? 0 : c2, p2 = t3.isRootVAST, h2 = void 0 !== p2 && p2, v2 = t3.followAdditionalWrappers, f2 = t3.allowMultipleAds, m2 = [];
          this.vastVersion && parseFloat(this.vastVersion) < 3 && h2 && (f2 = true);
          try {
            m2 = this.parseVastXml(e3, { isRootVAST: h2, url: i2, wrapperDepth: d2, allowMultipleAds: f2, followAdditionalWrappers: v2 });
          } catch (e4) {
            return Promise.reject(e4);
          }
          return 1 === m2.length && null != s2 && (m2[0].sequence = s2), false === a2 && (this.remainingAds = w.splitVAST(m2), m2 = this.remainingAds.shift()), this.resolveAds(m2, { wrapperDepth: d2, previousUrl: u2, url: i2 });
        } }, { key: "resolveAds", value: function() {
          var e3 = this, t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], r3 = arguments.length > 1 ? arguments[1] : void 0, i2 = r3.wrapperDepth, n2 = r3.previousUrl, a2 = r3.url, o2 = [];
          return n2 = a2, t3.forEach(function(t4) {
            var r4 = e3.resolveWrappers(t4, i2, n2);
            o2.push(r4);
          }), Promise.all(o2).then(function(t4) {
            var r4 = N.flatten(t4);
            if (!r4 && e3.remainingAds.length > 0) {
              var o3 = e3.remainingAds.shift();
              return e3.resolveAds(o3, { wrapperDepth: i2, previousUrl: n2, url: a2 });
            }
            return r4;
          });
        } }, { key: "resolveWrappers", value: function(e3, t3, r3) {
          var i2 = this;
          return new Promise(function(n2) {
            var a2;
            if (t3++, !e3.nextWrapperURL)
              return delete e3.nextWrapperURL, n2(e3);
            if (t3 >= i2.maxWrapperDepth || -1 !== i2.parentURLs.indexOf(e3.nextWrapperURL))
              return e3.errorCode = 302, delete e3.nextWrapperURL, n2(e3);
            e3.nextWrapperURL = w.resolveVastAdTagURI(e3.nextWrapperURL, r3), i2.URLTemplateFilters.forEach(function(t4) {
              e3.nextWrapperURL = t4(e3.nextWrapperURL);
            });
            var o2 = null !== (a2 = i2.parsingOptions.allowMultipleAds) && void 0 !== a2 ? a2 : e3.allowMultipleAds, s2 = e3.sequence;
            i2.fetchVAST(e3.nextWrapperURL, t3, r3, e3).then(function(a3) {
              return i2.parse(a3, { url: e3.nextWrapperURL, previousUrl: r3, wrapperSequence: s2, wrapperDepth: t3, followAdditionalWrappers: e3.followAdditionalWrappers, allowMultipleAds: o2 }).then(function(t4) {
                if (delete e3.nextWrapperURL, 0 === t4.length)
                  return e3.creatives = [], n2(e3);
                t4.forEach(function(t5) {
                  t5 && w.mergeWrapperAdData(t5, e3);
                }), n2(t4);
              });
            }).catch(function(t4) {
              e3.errorCode = 301, e3.errorMessage = t4.message, n2(e3);
            });
          });
        } }, { key: "completeWrapperResolving", value: function(e3) {
          if (0 === e3.ads.length)
            this.trackVastError(e3.errorURLTemplates, { ERRORCODE: 303 });
          else
            for (var t3 = e3.ads.length - 1; t3 >= 0; t3--) {
              var r3 = e3.ads[t3];
              (r3.errorCode || 0 === r3.creatives.length) && (this.trackVastError(r3.errorURLTemplates.concat(e3.errorURLTemplates), { ERRORCODE: r3.errorCode || 303 }, { ERRORMESSAGE: r3.errorMessage || "" }, { extensions: r3.extensions }, { system: r3.system }), e3.ads.splice(t3, 1));
            }
        } }]), r2;
      }(K), se = null, le = { data: {}, length: 0, getItem: function(e2) {
        return this.data[e2];
      }, setItem: function(e2, t2) {
        this.data[e2] = t2, this.length = Object.keys(this.data).length;
      }, removeItem: function(e2) {
        delete this.data[e2], this.length = Object.keys(this.data).length;
      }, clear: function() {
        this.data = {}, this.length = 0;
      } }, ue = function() {
        function e2() {
          n(this, e2), this.storage = this.initStorage();
        }
        return o(e2, [{ key: "initStorage", value: function() {
          if (se)
            return se;
          try {
            se = "undefined" != typeof window && null !== window ? window.localStorage || window.sessionStorage : null;
          } catch (e3) {
            se = null;
          }
          return se && !this.isStorageDisabled(se) || (se = le).clear(), se;
        } }, { key: "isStorageDisabled", value: function(e3) {
          var t2 = "__VASTStorage__";
          try {
            if (e3.setItem(t2, t2), e3.getItem(t2) !== t2)
              return e3.removeItem(t2), true;
          } catch (e4) {
            return true;
          }
          return e3.removeItem(t2), false;
        } }, { key: "getItem", value: function(e3) {
          return this.storage.getItem(e3);
        } }, { key: "setItem", value: function(e3, t2) {
          return this.storage.setItem(e3, t2);
        } }, { key: "removeItem", value: function(e3) {
          return this.storage.removeItem(e3);
        } }, { key: "clear", value: function() {
          return this.storage.clear();
        } }]), e2;
      }(), ce = function() {
        function e2(t2, r2, i2) {
          n(this, e2), this.cappingFreeLunch = t2 || 0, this.cappingMinimumTimeInterval = r2 || 0, this.defaultOptions = { withCredentials: false, timeout: 0 }, this.vastParser = new oe(), this.storage = i2 || new ue(), void 0 === this.lastSuccessfulAd && (this.lastSuccessfulAd = 0), void 0 === this.totalCalls && (this.totalCalls = 0), void 0 === this.totalCallsTimeout && (this.totalCallsTimeout = 0);
        }
        return o(e2, [{ key: "getParser", value: function() {
          return this.vastParser;
        } }, { key: "lastSuccessfulAd", get: function() {
          return this.storage.getItem("vast-client-last-successful-ad");
        }, set: function(e3) {
          this.storage.setItem("vast-client-last-successful-ad", e3);
        } }, { key: "totalCalls", get: function() {
          return this.storage.getItem("vast-client-total-calls");
        }, set: function(e3) {
          this.storage.setItem("vast-client-total-calls", e3);
        } }, { key: "totalCallsTimeout", get: function() {
          return this.storage.getItem("vast-client-total-calls-timeout");
        }, set: function(e3) {
          this.storage.setItem("vast-client-total-calls-timeout", e3);
        } }, { key: "hasRemainingAds", value: function() {
          return this.vastParser.remainingAds.length > 0;
        } }, { key: "getNextAds", value: function(e3) {
          return this.vastParser.getRemainingAds(e3);
        } }, { key: "get", value: function(e3) {
          var t2 = this, r2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, i2 = Date.now();
          return (r2 = Object.assign({}, this.defaultOptions, r2)).hasOwnProperty("resolveAll") || (r2.resolveAll = false), this.totalCallsTimeout < i2 ? (this.totalCalls = 1, this.totalCallsTimeout = i2 + 36e5) : this.totalCalls++, new Promise(function(n2, a2) {
            if (t2.cappingFreeLunch >= t2.totalCalls)
              return a2(new Error("VAST call canceled – FreeLunch capping not reached yet ".concat(t2.totalCalls, "/").concat(t2.cappingFreeLunch)));
            var o2 = i2 - t2.lastSuccessfulAd;
            if (o2 < 0)
              t2.lastSuccessfulAd = 0;
            else if (o2 < t2.cappingMinimumTimeInterval)
              return a2(new Error("VAST call canceled – (".concat(t2.cappingMinimumTimeInterval, ")ms minimum interval reached")));
            t2.vastParser.getAndParseVAST(e3, r2).then(function(e4) {
              return n2(e4);
            }).catch(function(e4) {
              return a2(e4);
            });
          });
        } }]), e2;
      }(), de = function(e2) {
        l(a2, e2);
        var t2 = p(a2);
        function a2(e3, r2, i2) {
          var o2, s2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
          for (var l2 in n(this, a2), (o2 = t2.call(this)).ad = r2, o2.creative = i2, o2.variation = s2, o2.muted = false, o2.impressed = false, o2.skippable = false, o2.trackingEvents = {}, o2.lastPercentage = 0, o2._alreadyTriggeredQuartiles = {}, o2.emitAlwaysEvents = ["creativeView", "start", "firstQuartile", "midpoint", "thirdQuartile", "complete", "resume", "pause", "rewind", "skip", "closeLinear", "close"], o2.creative.trackingEvents) {
            var u2 = o2.creative.trackingEvents[l2];
            o2.trackingEvents[l2] = u2.slice(0);
          }
          return C(o2.creative) ? o2._initLinearTracking() : o2._initVariationTracking(), e3 && o2.on("start", function() {
            e3.lastSuccessfulAd = Date.now();
          }), o2;
        }
        return o(a2, [{ key: "_initLinearTracking", value: function() {
          this.linear = true, this.skipDelay = this.creative.skipDelay, this.setDuration(this.creative.duration), this.clickThroughURLTemplate = this.creative.videoClickThroughURLTemplate, this.clickTrackingURLTemplates = this.creative.videoClickTrackingURLTemplates;
        } }, { key: "_initVariationTracking", value: function() {
          if (this.linear = false, this.skipDelay = -1, this.variation) {
            for (var e3 in this.variation.trackingEvents) {
              var t3 = this.variation.trackingEvents[e3];
              this.trackingEvents[e3] ? this.trackingEvents[e3] = this.trackingEvents[e3].concat(t3.slice(0)) : this.trackingEvents[e3] = t3.slice(0);
            }
            "nonLinearAd" === this.variation.adType ? (this.clickThroughURLTemplate = this.variation.nonlinearClickThroughURLTemplate, this.clickTrackingURLTemplates = this.variation.nonlinearClickTrackingURLTemplates, this.setDuration(this.variation.minSuggestedDuration)) : function(e4) {
              return "companionAd" === e4.adType;
            }(this.variation) && (this.clickThroughURLTemplate = this.variation.companionClickThroughURLTemplate, this.clickTrackingURLTemplates = this.variation.companionClickTrackingURLTemplates);
          }
        } }, { key: "setDuration", value: function(e3) {
          N.isValidTimeValue(e3) && (this.assetDuration = e3, this.quartiles = { firstQuartile: Math.round(25 * this.assetDuration) / 100, midpoint: Math.round(50 * this.assetDuration) / 100, thirdQuartile: Math.round(75 * this.assetDuration) / 100 });
        } }, { key: "setProgress", value: function(e3) {
          var t3 = this, r2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          if (N.isValidTimeValue(e3) && "object" === i(r2)) {
            var n2 = this.skipDelay || -1;
            if (-1 === n2 || this.skippable || (n2 > e3 ? this.emit("skip-countdown", n2 - e3) : (this.skippable = true, this.emit("skip-countdown", 0))), this.assetDuration > 0) {
              var a3 = Math.round(e3 / this.assetDuration * 100), o2 = [];
              if (e3 > 0) {
                o2.push("start");
                for (var s2 = this.lastPercentage; s2 < a3; s2++)
                  o2.push("progress-".concat(s2 + 1, "%"));
                for (var l2 in o2.push("progress-".concat(Math.round(e3))), this.quartiles)
                  this.isQuartileReached(l2, this.quartiles[l2], e3) && (o2.push(l2), this._alreadyTriggeredQuartiles[l2] = true);
                this.lastPercentage = a3;
              }
              o2.forEach(function(e4) {
                t3.track(e4, { macros: r2, once: true });
              }), e3 < this.progress && this.track("rewind", { macros: r2 });
            }
            this.progress = e3;
          }
        } }, { key: "isQuartileReached", value: function(e3, t3, r2) {
          var i2 = false;
          return t3 <= r2 && !this._alreadyTriggeredQuartiles[e3] && (i2 = true), i2;
        } }, { key: "setMuted", value: function(e3) {
          var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          "boolean" == typeof e3 && "object" === i(t3) && (this.muted !== e3 && this.track(e3 ? "mute" : "unmute", { macros: t3 }), this.muted = e3);
        } }, { key: "setPaused", value: function(e3) {
          var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          "boolean" == typeof e3 && "object" === i(t3) && (this.paused !== e3 && this.track(e3 ? "pause" : "resume", { macros: t3 }), this.paused = e3);
        } }, { key: "setFullscreen", value: function(e3) {
          var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          "boolean" == typeof e3 && "object" === i(t3) && (this.fullscreen !== e3 && this.track(e3 ? "fullscreen" : "exitFullscreen", { macros: t3 }), this.fullscreen = e3);
        } }, { key: "setExpand", value: function(e3) {
          var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          "boolean" == typeof e3 && "object" === i(t3) && (this.expanded !== e3 && (this.track(e3 ? "expand" : "collapse", { macros: t3 }), this.track(e3 ? "playerExpand" : "playerCollapse", { macros: t3 })), this.expanded = e3);
        } }, { key: "setSkipDelay", value: function(e3) {
          N.isValidTimeValue(e3) && (this.skipDelay = e3);
        } }, { key: "trackImpression", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && (this.impressed || (this.impressed = true, this.trackURLs(this.ad.impressionURLTemplates, e3), this.track("creativeView", { macros: e3 })));
        } }, { key: "error", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t3 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
          "object" === i(e3) && "boolean" == typeof t3 && this.trackURLs(this.ad.errorURLTemplates, e3, { isCustomCode: t3 });
        } }, { key: "errorWithCode", value: function(e3) {
          var t3 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
          "string" == typeof e3 && "boolean" == typeof t3 && (this.error({ ERRORCODE: e3 }, t3), console.log("The method errorWithCode is deprecated, please use vast tracker error method instead"));
        } }, { key: "complete", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && this.track("complete", { macros: e3 });
        } }, { key: "notUsed", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && (this.track("notUsed", { macros: e3 }), this.trackingEvents = []);
        } }, { key: "otherAdInteraction", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && this.track("otherAdInteraction", { macros: e3 });
        } }, { key: "acceptInvitation", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && this.track("acceptInvitation", { macros: e3 });
        } }, { key: "adExpand", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && this.track("adExpand", { macros: e3 });
        } }, { key: "adCollapse", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && this.track("adCollapse", { macros: e3 });
        } }, { key: "minimize", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && this.track("minimize", { macros: e3 });
        } }, { key: "verificationNotExecuted", value: function(e3) {
          var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          if ("string" == typeof e3 && "object" === i(t3)) {
            if (!this.ad || !this.ad.adVerifications || !this.ad.adVerifications.length)
              throw new Error("No adVerifications provided");
            if (!e3)
              throw new Error("No vendor provided, unable to find associated verificationNotExecuted");
            var r2 = this.ad.adVerifications.find(function(t4) {
              return t4.vendor === e3;
            });
            if (!r2)
              throw new Error("No associated verification element found for vendor: ".concat(e3));
            var n2 = r2.trackingEvents;
            if (n2 && n2.verificationNotExecuted) {
              var a3 = n2.verificationNotExecuted;
              this.trackURLs(a3, t3), this.emit("verificationNotExecuted", { trackingURLTemplates: a3 });
            }
          }
        } }, { key: "overlayViewDuration", value: function(e3) {
          var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          "string" == typeof e3 && "object" === i(t3) && (t3.ADPLAYHEAD = e3, this.track("overlayViewDuration", { macros: t3 }));
        } }, { key: "close", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && this.track(this.linear ? "closeLinear" : "close", { macros: e3 });
        } }, { key: "skip", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && this.track("skip", { macros: e3 });
        } }, { key: "load", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          "object" === i(e3) && this.track("loaded", { macros: e3 });
        } }, { key: "click", value: function() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null, t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          if ((null === e3 || "string" == typeof e3) && "object" === i(t3)) {
            this.clickTrackingURLTemplates && this.clickTrackingURLTemplates.length && this.trackURLs(this.clickTrackingURLTemplates, t3);
            var n2 = this.clickThroughURLTemplate || e3, a3 = r({}, t3);
            if (n2) {
              this.progress && (a3.ADPLAYHEAD = this.progressFormatted());
              var o2 = N.resolveURLTemplates([n2], a3)[0];
              this.emit("clickthrough", o2);
            }
          }
        } }, { key: "track", value: function(e3) {
          var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, r2 = t3.macros, n2 = void 0 === r2 ? {} : r2, a3 = t3.once, o2 = void 0 !== a3 && a3;
          if ("object" === i(n2)) {
            "closeLinear" === e3 && !this.trackingEvents[e3] && this.trackingEvents.close && (e3 = "close");
            var s2 = this.trackingEvents[e3], l2 = this.emitAlwaysEvents.indexOf(e3) > -1;
            s2 ? (this.emit(e3, { trackingURLTemplates: s2 }), this.trackURLs(s2, n2)) : l2 && this.emit(e3, null), o2 && (delete this.trackingEvents[e3], l2 && this.emitAlwaysEvents.splice(this.emitAlwaysEvents.indexOf(e3), 1));
          }
        } }, { key: "trackURLs", value: function(e3) {
          var t3, i2, n2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, a3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, o2 = r({}, n2);
          this.linear && (this.creative && this.creative.mediaFiles && this.creative.mediaFiles[0] && this.creative.mediaFiles[0].fileURL && (o2.ASSETURI = this.creative.mediaFiles[0].fileURL), this.progress && (o2.ADPLAYHEAD = this.progressFormatted())), null !== (t3 = this.creative) && void 0 !== t3 && null !== (i2 = t3.universalAdIds) && void 0 !== i2 && i2.length && (o2.UNIVERSALADID = this.creative.universalAdIds.map(function(e4) {
            return e4.idRegistry.concat(" ", e4.value);
          }).join(",")), this.ad && (this.ad.sequence && (o2.PODSEQUENCE = this.ad.sequence), this.ad.adType && (o2.ADTYPE = this.ad.adType), this.ad.adServingId && (o2.ADSERVINGID = this.ad.adServingId), this.ad.categories && this.ad.categories.length && (o2.ADCATEGORIES = this.ad.categories.map(function(e4) {
            return e4.value;
          }).join(",")), this.ad.blockedAdCategories && this.ad.blockedAdCategories.length && (o2.BLOCKEDADCATEGORIES = this.ad.blockedAdCategories)), N.track(e3, o2, a3);
        } }, { key: "convertToTimecode", value: function(e3) {
          if (!N.isValidTimeValue(e3))
            return "";
          var t3 = 1e3 * e3, r2 = Math.floor(t3 / 36e5), i2 = Math.floor(t3 / 6e4 % 60), n2 = Math.floor(t3 / 1e3 % 60), a3 = Math.floor(t3 % 1e3);
          return "".concat(N.addLeadingZeros(r2, 2), ":").concat(N.addLeadingZeros(i2, 2), ":").concat(N.addLeadingZeros(n2, 2), ".").concat(N.addLeadingZeros(a3, 3));
        } }, { key: "progressFormatted", value: function() {
          return this.convertToTimecode(this.progress);
        } }]), a2;
      }(K);
      e.VASTClient = ce, e.VASTParser = oe, e.VASTTracker = de, Object.defineProperty(e, "__esModule", { value: true });
    });
  })(vastClient_min, vastClient_minExports);
  const decodeURLs = (decode) => {
    return decode.map((encoded) => decodeURI(encoded));
  };
  const setCurrentAds = (props) => {
    const currentAds = {};
    currentAds.ads = props.restAds.ads[0];
    currentAds.ads.errorURLTemplates = decodeURLs(
      currentAds.ads.errorURLTemplates
    );
    currentAds.containVPAID = currentAds.ads.creatives[0].mediaFiles.some(VPAIDCondition);
    currentAds.tracker = new vastClient_minExports.VASTTracker(
      props.vastClient,
      currentAds.ads,
      currentAds.ads.creatives[0]
    );
    currentAds.vastClient = props.vastClient;
    return currentAds;
  };
  const getNextAds = async (vastClient) => {
    if (vastClient.hasRemainingAds()) {
      try {
        const restAds = await vastClient.getNextAds();
        return setCurrentAds({ vastClient, restAds });
      } catch (error) {
        if (vastClient.hasRemainingAds()) {
          return getNextAds(vastClient);
        } else
          throw new ReInitError(errorCodesVAST["No active campaign"]);
      }
    } else {
      throw new ReInitError(errorCodesVAST["No active campaign"]);
    }
  };
  const replaceMacro = (vastClient, widthAndHeight) => {
    const vastParser = vastClient.getParser();
    vastParser.addURLTemplateFilter((vastUrl) => {
      return vastUrl.replace("%5Bwidth%5D", `${widthAndHeight[0]}`).replace("%5Bheight%5D", `${widthAndHeight[1]}`).replace("%5Bpage_url%5D", `${document.location.href}`).replace(
        "%5Brandom%5D",
        `${Math.floor(Math.random() * (1e8 - 1) + 1)}`
      );
    });
  };
  function noop() {
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return /* @__PURE__ */ Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
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
  function subscribe$1(store, ...callbacks) {
    if (store == null) {
      return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe$1(store, callback));
  }
  function null_to_empty(value) {
    return value == null ? "" : value;
  }
  function set_store_value(store, ret, value) {
    store.set(value);
    return ret;
  }
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
    if (!node)
      return document;
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
  function empty() {
    return text("");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
    if (value == null)
      node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function to_number(value) {
    return value === "" ? null : +value;
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function set_data(text2, data) {
    data = "" + data;
    if (text2.wholeText !== data)
      text2.data = data;
  }
  function set_input_value(input, value) {
    input.value = value == null ? "" : value;
  }
  function set_style(node, key, value, important) {
    if (value === null) {
      node.style.removeProperty(key);
    } else {
      node.style.setProperty(key, value, important ? "important" : "");
    }
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
  const seen_callbacks = /* @__PURE__ */ new Set();
  let flushidx = 0;
  function flush() {
    const saved_component = current_component;
    do {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length)
        binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
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
  const outroing = /* @__PURE__ */ new Set();
  let outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros
      // parent group
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
  function transition_out(block, local, detach2, callback) {
    if (block && block.o) {
      if (outroing.has(block))
        return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach2)
            block.d(1);
          callback();
        }
      });
      block.o(local);
    } else if (callback) {
      callback();
    }
  }
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
          on_destroy.push(...new_on_destroy);
        } else {
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
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance2, create_fragment2, not_equal, props, append_styles2, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
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
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      // everything else
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles2 && append_styles2($$.root);
    let ready = false;
    $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i])
          $$.bound[i](value);
        if (ready)
          make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro)
        transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      flush();
    }
    set_current_component(parent_component);
  }
  class SvelteComponent {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
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
  function create_fragment$l(ctx) {
    let svg;
    let path;
    return {
      c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M2.653 21.887.777 19.954l8.693-8.956L.777 2.042 2.653.11 13.222 11 2.653 21.886Z");
        attr(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr(svg, "viewBox", "0 0 14 22");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(svg);
      }
    };
  }
  let Skip$2 = class Skip extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment$l, safe_not_equal, {});
    }
  };
  const SkipIcon = Skip$2;
  function create_fragment$k(ctx) {
    let svg;
    let path0;
    let path1;
    return {
      c() {
        svg = svg_element("svg");
        path0 = svg_element("path");
        path1 = svg_element("path");
        attr(path0, "d", "M6.37 5.074H0v4.921h1.603V6.73H6.37V5.074Z");
        attr(path1, "d", "M8.277.2H0l1.69 1.654h6.587c1.733 0 3.12 1.48 3.12 3.266s-1.387 3.267-3.12 3.267h-1.95l-1.56 1.611h3.51c2.6 0 4.723-2.221 4.723-4.921C13 2.42 10.92.199 8.277.199Z");
        attr(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr(svg, "viewBox", "0 0 13 10");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path0);
        append(svg, path1);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(svg);
      }
    };
  }
  class Df extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment$k, safe_not_equal, {});
    }
  }
  const DfIcon = Df;
  function create_fragment$j(ctx) {
    let svg;
    let path;
    return {
      c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M5.4 7.8h1.2V9H5.4V7.8Zm0-4.8h1.2v3.6H5.4V3Zm.594-3A5.997 5.997 0 0 0 0 6c0 3.312 2.682 6 5.994 6A6.003 6.003 0 0 0 12 6c0-3.312-2.688-6-6.006-6ZM6 10.8A4.799 4.799 0 0 1 1.2 6c0-2.652 2.148-4.8 4.8-4.8 2.652 0 4.8 2.148 4.8 4.8 0 2.652-2.148 4.8-4.8 4.8Z");
        attr(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr(svg, "viewBox", "0 0 12 12");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(svg);
      }
    };
  }
  class Info extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment$j, safe_not_equal, {});
    }
  }
  const InfoIcon = Info;
  function create_fragment$i(ctx) {
    let svg;
    let path;
    return {
      c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M7.368 0H1.053C.473 0 0 .49 0 1.09v7.637h1.053V1.091h6.315V0Zm1.58 2.182h-5.79c-.58 0-1.053.49-1.053 1.09v7.637c0 .6.474 1.091 1.053 1.091h5.79C9.525 12 10 11.51 10 10.91V3.272c0-.6-.474-1.091-1.053-1.091Zm0 8.727h-5.79V3.273h5.79v7.636Z");
        attr(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr(svg, "viewBox", "0 0 10 12");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(svg);
      }
    };
  }
  class Copy extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment$i, safe_not_equal, {});
    }
  }
  const CopyIcon = Copy;
  function create_fragment$h(ctx) {
    let svg;
    let path;
    return {
      c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M4.546 9 0 4.734l1.137-1.067 3.409 3.2L11.863 0 13 1.067 8.773 5.033 4.546 9Z");
        attr(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr(svg, "viewBox", "0 0 13 9");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(svg);
      }
    };
  }
  class Check extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment$h, safe_not_equal, {});
    }
  }
  const CheckIcon = Check;
  function create_fragment$g(ctx) {
    let svg;
    let path;
    return {
      c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "fill-rule", "evenodd");
        attr(path, "d", "M1.427-.001.037 1.438l4.788 4.64L4 6.925H0v6.158h4l5 5.13v-8.088l2 1.938v2.046a4.17 4.17 0 0 0 1.212-.87l1.817 1.76A6.968 6.968 0 0 1 11 16.89v2.114a8.939 8.939 0 0 0 4.482-2.597l4.168 4.04 1.389-1.439L1.427 0ZM11 7.316l2.491 2.405A4.62 4.62 0 0 0 11 5.9v1.417Zm4.752 4.588 1.6 1.545A9.411 9.411 0 0 0 18 10.004c0-4.392-2.99-8.066-7-9v2.114c2.89.883 5 3.633 5 6.886 0 .658-.086 1.295-.248 1.9Zm-8.555-8.26L9 5.385v-3.59l-1.803 1.85Z");
        attr(path, "clip-rule", "evenodd");
        attr(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr(svg, "viewBox", "0 0 22 21");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(svg);
      }
    };
  }
  class Mute extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment$g, safe_not_equal, {});
    }
  }
  const MuteIcon = Mute;
  function create_fragment$f(ctx) {
    let svg;
    let path;
    return {
      c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M0 36.907h12.222L27.5 52.586V2.414L12.222 18.093H0v18.814Zm33.611-21.95v25.086C38.133 37.91 41.25 33.05 41.25 27.5a14.114 14.114 0 0 0-7.639-12.543Zm0-8.497c8.83 2.696 15.278 11.1 15.278 21.04S42.442 45.844 33.61 48.54V55C45.864 52.147 55 40.92 55 27.5S45.864 2.853 33.611 0v6.46Z");
        attr(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr(svg, "viewBox", "0 0 55 55");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(svg);
      }
    };
  }
  class Sound extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment$f, safe_not_equal, {});
    }
  }
  const SoundIcon = Sound;
  function create_fragment$e(ctx) {
    let svg;
    let path;
    return {
      c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "m0 20 8-5V5L0 0v20Zm8-5 8-5-8-5v10Z");
        attr(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr(svg, "viewBox", "0 0 16 20");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(svg);
      }
    };
  }
  let Play$2 = class Play extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment$e, safe_not_equal, {});
    }
  };
  const PlayIcon = Play$2;
  function create_fragment$d(ctx) {
    let svg;
    let path;
    return {
      c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", "M0 20h5V0H0v20Zm11.25 0h5V0h-5v20Z");
        attr(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr(svg, "viewBox", "0 0 17 20");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(svg);
      }
    };
  }
  class Pause extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment$d, safe_not_equal, {});
    }
  }
  const PauseIcon = Pause;
  function create_fragment$c(ctx) {
    let svg;
    let path0;
    let path1;
    let path2;
    let path3;
    let path4;
    return {
      c() {
        svg = svg_element("svg");
        path0 = svg_element("path");
        path1 = svg_element("path");
        path2 = svg_element("path");
        path3 = svg_element("path");
        path4 = svg_element("path");
        attr(path0, "d", "M0 7.5h2.5v-5h5V0H0v7.5Z");
        attr(path1, "d", "M0 7.5h2.5v-5h5V0H0v7.5ZM12.5 0v2.5h5v5H20V0h-7.5Z");
        attr(path2, "d", "M12.5 0v2.5h5v5H20V0h-7.5Zm5 17.5h-5V20H20v-7.5h-2.5v5Z");
        attr(path3, "d", "M17.5 17.5h-5V20H20v-7.5h-2.5v5Zm-15-5H0V20h7.5v-2.5h-5v-5Z");
        attr(path4, "d", "M2.5 12.5H0V20h7.5v-2.5h-5v-5Z");
        attr(svg, "xmlns", "http://www.w3.org/2000/svg");
        attr(svg, "viewBox", "0 0 20 20");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path0);
        append(svg, path1);
        append(svg, path2);
        append(svg, path3);
        append(svg, path4);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(svg);
      }
    };
  }
  class Fullscreen extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment$c, safe_not_equal, {});
    }
  }
  const FullScreenIcon = Fullscreen;
  const callEvent = (context) => (eventType, message) => {
    if (eventType in context.eventsCallbacks) {
      const callback = context.eventsCallbacks[eventType];
      log(eventType);
      if (typeof callback === "function") {
        message ? callback(message) : callback("");
      }
    }
  };
  const clickAction = (context) => {
    var _a, _b, _c;
    const { tracker } = context;
    const clickUrl = String(
      (_c = (_b = (_a = context.ads) == null ? void 0 : _a.creatives[0]) == null ? void 0 : _b.videoClickThroughURLTemplate) == null ? void 0 : _c.url
    );
    if (tracker) {
      tracker.click();
    }
    window.open(clickUrl);
    callEvent(context)("AdClickThru");
  };
  const subscriber_queue = [];
  function writable(value, start = noop) {
    let stop;
    const subscribers = /* @__PURE__ */ new Set();
    function set(new_value) {
      if (safe_not_equal(value, new_value)) {
        value = new_value;
        if (stop) {
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
    function update2(fn) {
      set(fn(value));
    }
    function subscribe2(run2, invalidate = noop) {
      const subscriber = [run2, invalidate];
      subscribers.add(subscriber);
      if (subscribers.size === 1) {
        stop = start(set) || noop;
      }
      run2(value);
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0) {
          stop();
          stop = null;
        }
      };
    }
    return { set, update: update2, subscribe: subscribe2 };
  }
  const controls_store = {};
  const controlsStore = writable(controls_store);
  const duration_time = 0;
  const durationStore = writable(duration_time);
  const error_store = null;
  const errorStore = writable(error_store);
  const current_time = 0;
  const currentTimeVPAID = writable(current_time);
  const play_value = true;
  const playStore = writable(play_value);
  const current_volume = 0;
  const volumeStore = writable(current_volume);
  function add_css$9(target) {
    append_styles(target, "svelte-1i2wwjr", ".w.svelte-1i2wwjr{background:rgba(0, 0, 0, 0.5);backdrop-filter:blur(2px);color:#fff;max-width:auto;z-index:999;outline:none;position:absolute;left:12px;cursor:pointer;width:auto;border:none;font-family:Arial, Helvetica, sans-serif}.w.svelte-1i2wwjr:hover{background:rgba(0, 0, 0, 0.9)}.w.svelte-1i2wwjr{padding:4px 4px}@media screen and (min-width: 380px){.w.svelte-1i2wwjr{padding:calc(4px + 6 * (100vw - 380px) / 3459) calc(4px + 12 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.w.svelte-1i2wwjr{padding:10px 16px}}.w.svelte-1i2wwjr{min-width:86px}@media screen and (min-width: 380px){.w.svelte-1i2wwjr{min-width:calc(86px + 412 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.w.svelte-1i2wwjr{min-width:498px}}.w.svelte-1i2wwjr{bottom:44px}@media screen and (min-width: 380px){.w.svelte-1i2wwjr{bottom:calc(44px + 279 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.w.svelte-1i2wwjr{bottom:323px}}.d.svelte-1i2wwjr{width:100%;display:grid;grid-template-columns:auto auto;align-items:center}.d--icon.svelte-1i2wwjr{width:28px}@media screen and (min-width: 380px){.d--icon.svelte-1i2wwjr{width:calc(28px + 44 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.d--icon.svelte-1i2wwjr{width:72px}}.d-t.svelte-1i2wwjr{display:flex;justify-content:center;align-items:center;overflow:hidden;text-decoration:none;text-overflow:ellipsis;vertical-align:middle;white-space:nowrap}.d-t.svelte-1i2wwjr{padding:8px 11px}@media screen and (min-width: 380px){.d-t.svelte-1i2wwjr{padding:calc(8px + 24 * (100vw - 380px) / 3459) calc(11px + 14 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.d-t.svelte-1i2wwjr{padding:32px 25px}}.d-t.svelte-1i2wwjr{font-size:12px}@media screen and (min-width: 380px){.d-t.svelte-1i2wwjr{font-size:calc(12px + 28 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.d-t.svelte-1i2wwjr{font-size:40px}}.d--button.svelte-1i2wwjr{display:flex;justify-content:center;align-items:center;background:#0649cb;border-color:#0649cb;border-radius:2px;cursor:pointer;margin-left:auto}.d--button.svelte-1i2wwjr{padding:13px 19px}@media screen and (min-width: 380px){.d--button.svelte-1i2wwjr{padding:calc(13px + 35 * (100vw - 380px) / 3459) calc(19px + 101 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.d--button.svelte-1i2wwjr{padding:48px 120px}}.d--button.svelte-1i2wwjr{font-size:10px}@media screen and (min-width: 380px){.d--button.svelte-1i2wwjr{font-size:calc(10px + 44 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.d--button.svelte-1i2wwjr{font-size:54px}}.d--button.svelte-1i2wwjr{min-width:86px}@media screen and (min-width: 380px){.d--button.svelte-1i2wwjr{min-width:calc(86px + 68 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.d--button.svelte-1i2wwjr{min-width:154px}}");
  }
  function create_if_block$a(ctx) {
    let button;
    let div1;
    let t0;
    let div0;
    let mounted;
    let dispose;
    let if_block = (
      /*iframeWidth*/
      ctx[1] > 400 && create_if_block_1$4(ctx)
    );
    return {
      c() {
        button = element("button");
        div1 = element("div");
        if (if_block)
          if_block.c();
        t0 = space();
        div0 = element("div");
        div0.textContent = `${/*isEngLang*/
        ctx[3] ? "Go" : "Перейти"}`;
        attr(div0, "class", "d--button svelte-1i2wwjr");
        attr(div1, "class", "d svelte-1i2wwjr");
        attr(button, "class", "w svelte-1i2wwjr");
      },
      m(target, anchor) {
        insert(target, button, anchor);
        append(button, div1);
        if (if_block)
          if_block.m(div1, null);
        append(div1, t0);
        append(div1, div0);
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*click_handler*/
            ctx[7]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (
          /*iframeWidth*/
          ctx2[1] > 400
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block_1$4(ctx2);
            if_block.c();
            if_block.m(div1, t0);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d(detaching) {
        if (detaching)
          detach(button);
        if (if_block)
          if_block.d();
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_1$4(ctx) {
    let div1;
    let t0;
    let div0;
    let if_block = (
      /*icon*/
      ctx[4] && create_if_block_2$1(ctx)
    );
    return {
      c() {
        div1 = element("div");
        if (if_block)
          if_block.c();
        t0 = space();
        div0 = element("div");
        div0.textContent = `${/*title*/
        ctx[5]}`;
        attr(div0, "class", "d-t--label");
        attr(div1, "class", "d-t svelte-1i2wwjr");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        if (if_block)
          if_block.m(div1, null);
        append(div1, t0);
        append(div1, div0);
      },
      p(ctx2, dirty) {
        if (
          /*icon*/
          ctx2[4]
        )
          if_block.p(ctx2, dirty);
      },
      d(detaching) {
        if (detaching)
          detach(div1);
        if (if_block)
          if_block.d();
      }
    };
  }
  function create_if_block_2$1(ctx) {
    let img;
    let img_src_value;
    return {
      c() {
        img = element("img");
        attr(img, "class", "d--icon svelte-1i2wwjr");
        if (!src_url_equal(img.src, img_src_value = /*icon*/
        ctx[4]))
          attr(img, "src", img_src_value);
        attr(img, "alt", "ads-logo");
      },
      m(target, anchor) {
        insert(target, img, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(img);
      }
    };
  }
  function create_fragment$b(ctx) {
    let if_block_anchor;
    let if_block = (
      /*$controlsStore*/
      ctx[2].actionButton && create_if_block$a(ctx)
    );
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (
          /*$controlsStore*/
          ctx2[2].actionButton
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block$a(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$c($$self, $$props, $$invalidate) {
    let iframeWidth;
    let $controlsStore;
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(2, $controlsStore = $$value));
    var _a, _b, _c, _d;
    let { currentAds = {} } = $$props;
    let { context = {} } = $$props;
    const isEngLang = /en/g.test(navigator.language);
    const creative = (_a = currentAds === null || currentAds === void 0 ? void 0 : currentAds.ads) === null || _a === void 0 ? void 0 : _a.creatives[0];
    const icon = (_b = creative === null || creative === void 0 ? void 0 : creative.icons[0]) === null || _b === void 0 ? void 0 : _b.staticResource;
    const rootElement = document.body ? document.body : document.documentElement;
    const title = ((_c = currentAds === null || currentAds === void 0 ? void 0 : currentAds.ads) === null || _c === void 0 ? void 0 : _c.title) ? (_d = currentAds === null || currentAds === void 0 ? void 0 : currentAds.ads) === null || _d === void 0 ? void 0 : _d.title : "";
    const isTouchDeviceConst = isTouchDevice();
    onMount(() => {
      var _a2, _b2;
      if (!isTouchDeviceConst) {
        (_a2 = context.slot) === null || _a2 === void 0 ? void 0 : _a2.addEventListener("mouseenter", () => {
        });
        (_b2 = context.slot) === null || _b2 === void 0 ? void 0 : _b2.addEventListener("mouseleave", () => {
          setTimeout(
            () => {
            },
            3e3
          );
        });
      }
      const changeVPAIDHeight = () => {
        const newWidth = rootElement.getBoundingClientRect().width;
        $$invalidate(1, iframeWidth = newWidth);
      };
      const observer = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          changeVPAIDHeight();
        });
      });
      observer.observe(rootElement);
      return () => {
        observer.disconnect();
      };
    });
    const click_handler = () => {
      clickAction(context);
    };
    $$self.$$set = ($$props2) => {
      if ("currentAds" in $$props2)
        $$invalidate(6, currentAds = $$props2.currentAds);
      if ("context" in $$props2)
        $$invalidate(0, context = $$props2.context);
    };
    $$invalidate(1, iframeWidth = rootElement.getBoundingClientRect().width);
    return [
      context,
      iframeWidth,
      $controlsStore,
      isEngLang,
      icon,
      title,
      currentAds,
      click_handler
    ];
  }
  class Action extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$c, create_fragment$b, safe_not_equal, { currentAds: 6, context: 0 }, add_css$9);
    }
  }
  const ActionSvelte = Action;
  function add_css$8(target) {
    append_styles(target, "svelte-17h1day", ".w.svelte-17h1day{z-index:9991;text-shadow:none;width:100%;position:absolute;top:0;height:100%;left:0;background-color:rgba(0, 0, 0, 0);direction:ltr;cursor:pointer;padding:0;margin:0;outline:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;display:flex;justify-content:left;align-items:center;text-align:left;border:none}.d.svelte-17h1day{display:flex;flex-wrap:wrap;color:#fff;align-items:center;position:absolute;bottom:18px;padding:8px;border-radius:3px;background-color:#000;left:18px}");
  }
  function create_if_block$9(ctx) {
    let div1;
    let div0;
    let mounted;
    let dispose;
    return {
      c() {
        div1 = element("div");
        div0 = element("div");
        div0.textContent = `${/*goLabel*/
        ctx[4]} 
      ${/*domain*/
        ctx[3]}`;
        attr(div0, "class", "d svelte-17h1day");
        attr(
          div1,
          "title",
          /*goLabel*/
          ctx[4]
        );
        set_style(
          div1,
          "opacity",
          /*opacity*/
          ctx[1]
        );
        attr(div1, "class", "w svelte-17h1day");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        if (!mounted) {
          dispose = listen(
            div1,
            "click",
            /*click_handler*/
            ctx[6]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & /*opacity*/
        2) {
          set_style(
            div1,
            "opacity",
            /*opacity*/
            ctx2[1]
          );
        }
      },
      d(detaching) {
        if (detaching)
          detach(div1);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment$a(ctx) {
    let if_block_anchor;
    let if_block = (
      /*$controlsStore*/
      ctx[2].fullScreenClick && create_if_block$9(ctx)
    );
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (
          /*$controlsStore*/
          ctx2[2].fullScreenClick
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block$9(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$b($$self, $$props, $$invalidate) {
    let $controlsStore;
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(2, $controlsStore = $$value));
    var _a;
    let { currentAds = {} } = $$props;
    let { context = {} } = $$props;
    const isEngLang = /en/g.test(navigator.language);
    const creative = (_a = currentAds === null || currentAds === void 0 ? void 0 : currentAds.ads) === null || _a === void 0 ? void 0 : _a.creatives[0];
    const isTouchDeviceConst = isTouchDevice();
    let opacity = isTouchDeviceConst ? 0.5 : 0;
    const display = () => {
      $$invalidate(1, opacity = 0.5);
    };
    const hide = () => {
      $$invalidate(1, opacity = 0);
    };
    onMount(() => {
      var _a2, _b;
      if (!isTouchDeviceConst) {
        (_a2 = context.slot) === null || _a2 === void 0 ? void 0 : _a2.addEventListener("mouseenter", display);
        (_b = context.slot) === null || _b === void 0 ? void 0 : _b.addEventListener("mouseleave", hide);
      }
    });
    onDestroy(() => {
      var _a2, _b;
      if (!isTouchDeviceConst) {
        (_a2 = context.slot) === null || _a2 === void 0 ? void 0 : _a2.removeEventListener("mouseenter", display);
        (_b = context.slot) === null || _b === void 0 ? void 0 : _b.removeEventListener("mouseleave", hide);
      }
    });
    const clickUrl = creative.videoClickThroughURLTemplate;
    const domain = domainCutter(
      String(clickUrl === null || clickUrl === void 0 ? void 0 : clickUrl.url),
      true
    ) || "";
    const goLabel = isEngLang ? "Go" : "Перейти";
    const click_handler = () => {
      clickAction(context);
    };
    $$self.$$set = ($$props2) => {
      if ("currentAds" in $$props2)
        $$invalidate(5, currentAds = $$props2.currentAds);
      if ("context" in $$props2)
        $$invalidate(0, context = $$props2.context);
    };
    return [context, opacity, $controlsStore, domain, goLabel, currentAds, click_handler];
  }
  class Full_screen_click extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$b, create_fragment$a, safe_not_equal, { currentAds: 5, context: 0 }, add_css$8);
    }
  }
  const FullScreenClickSvelte = Full_screen_click;
  function add_css$7(target) {
    append_styles(target, "svelte-1kywygu", '.g.svelte-1kywygu.svelte-1kywygu{height:48px;padding-bottom:50px;top:0;background-position:top;width:100%;position:absolute;background-repeat:repeat-x;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==);transition:opacity 0.25s cubic-bezier(0, 0, 0.2, 1);pointer-events:none;z-index:9990;box-sizing:content-box}.header.svelte-1kywygu.svelte-1kywygu{position:absolute;display:block;content:"Ads";color:rgb(238, 238, 238);width:100%;z-index:9992;width:100%;padding:12px 12px 0 16px;box-sizing:border-box;top:0;background:none;border:none;font-family:Arial, Helvetica, sans-serif}.d-text.svelte-1kywygu.svelte-1kywygu{display:flex;justify-content:center;align-items:center;margin-right:auto;margin-left:10px;color:rgb(238, 238, 238)}.d-text.svelte-1kywygu.svelte-1kywygu{font-size:14px}@media screen and (min-width: 380px){.d-text.svelte-1kywygu.svelte-1kywygu{font-size:calc(14px + 50 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.d-text.svelte-1kywygu.svelte-1kywygu{font-size:64px}}.d--full.svelte-1kywygu.svelte-1kywygu{display:grid;grid-template-columns:calc(38px + 87 * (100vw - 380px) / 3459) 1fr calc(30px + 58 * (100vw - 380px) / 3459)}.d-short.svelte-1kywygu.svelte-1kywygu{display:grid;grid-template-columns:1fr 48px}.d-icon.svelte-1kywygu.svelte-1kywygu{z-index:9992}.d-icon.svelte-1kywygu.svelte-1kywygu{width:38px}@media screen and (min-width: 960px){.d-icon.svelte-1kywygu.svelte-1kywygu{width:calc(38px + 87 * (100vw - 960px) / 2879)}}@media screen and (min-width: 3839px){.d-icon.svelte-1kywygu.svelte-1kywygu{width:125px}}.d-ads.svelte-1kywygu.svelte-1kywygu{text-transform:uppercase;font-weight:700;color:#fff;background:none;border:none;padding:0}.d-ads.svelte-1kywygu.svelte-1kywygu{font-size:10px}@media screen and (min-width: 380px){.d-ads.svelte-1kywygu.svelte-1kywygu{font-size:calc(10px + 28 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.d-ads.svelte-1kywygu.svelte-1kywygu{font-size:38px}}.d-ads.svelte-1kywygu.svelte-1kywygu:hover{text-shadow:#fff 0px 0px 12px}.m.svelte-1kywygu.svelte-1kywygu{position:absolute;padding:14px;right:15px;top:40px;display:flex;background-color:#000;border-radius:2px;border:none;flex-direction:column;align-items:flex-start;min-width:135px;fill:#fff}.m.svelte-1kywygu>button.svelte-1kywygu{display:grid;grid-template-columns:calc(12px + 16 * (100vw - 380px) / 3459) auto;align-items:center;justify-content:left;cursor:pointer;gap:11px;width:100%;color:#fff;font-weight:400;text-align:left;background:none;border:none;min-height:32px}.m.svelte-1kywygu>button.svelte-1kywygu{font-size:12px}@media screen and (min-width: 380px){.m.svelte-1kywygu>button.svelte-1kywygu{font-size:calc(12px + 6 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.m.svelte-1kywygu>button.svelte-1kywygu{font-size:18px}}.m.svelte-1kywygu>button.svelte-1kywygu:hover{color:#0649cb;fill:#0649cb}.m.svelte-1kywygu>button .m-icon.svelte-1kywygu{color:#fff;margin-right:11px}.m.svelte-1kywygu>button .m-icon.svelte-1kywygu{width:12px}@media screen and (min-width: 380px){.m.svelte-1kywygu>button .m-icon.svelte-1kywygu{width:calc(12px + 16 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.m.svelte-1kywygu>button .m-icon.svelte-1kywygu{width:28px}}');
  }
  function create_if_block$8(ctx) {
    let div0;
    let t0;
    let div2;
    let div1;
    let t1;
    let t2;
    let button;
    let t4;
    let current;
    let mounted;
    let dispose;
    let if_block0 = (
      /*iconUrl*/
      ctx[3] && create_if_block_4(ctx)
    );
    let if_block1 = (
      /*descriptionText*/
      ctx[4] && create_if_block_3(ctx)
    );
    let if_block2 = (
      /*showMenu*/
      ctx[1] && create_if_block_1$3(ctx)
    );
    return {
      c() {
        div0 = element("div");
        t0 = space();
        div2 = element("div");
        div1 = element("div");
        if (if_block0)
          if_block0.c();
        t1 = space();
        if (if_block1)
          if_block1.c();
        t2 = space();
        button = element("button");
        button.textContent = `${/*ads*/
        ctx[6]}`;
        t4 = space();
        if (if_block2)
          if_block2.c();
        attr(div0, "class", "g svelte-1kywygu");
        attr(button, "class", "d-ads svelte-1kywygu");
        attr(div1, "class", null_to_empty(
          /*iconUrl*/
          ctx[3] ? "d--full" : "d-short"
        ) + " svelte-1kywygu");
        attr(div2, "class", "header svelte-1kywygu");
      },
      m(target, anchor) {
        insert(target, div0, anchor);
        insert(target, t0, anchor);
        insert(target, div2, anchor);
        append(div2, div1);
        if (if_block0)
          if_block0.m(div1, null);
        append(div1, t1);
        if (if_block1)
          if_block1.m(div1, null);
        append(div1, t2);
        append(div1, button);
        append(div1, t4);
        if (if_block2)
          if_block2.m(div1, null);
        current = true;
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*click_handler*/
            ctx[12]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (
          /*iconUrl*/
          ctx2[3]
        )
          if_block0.p(ctx2, dirty);
        if (
          /*descriptionText*/
          ctx2[4]
        )
          if_block1.p(ctx2, dirty);
        if (
          /*showMenu*/
          ctx2[1]
        ) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
            if (dirty & /*showMenu*/
            2) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block_1$3(ctx2);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(div1, null);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, () => {
            if_block2 = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block2);
        current = true;
      },
      o(local) {
        transition_out(if_block2);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div0);
        if (detaching)
          detach(t0);
        if (detaching)
          detach(div2);
        if (if_block0)
          if_block0.d();
        if (if_block1)
          if_block1.d();
        if (if_block2)
          if_block2.d();
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_4(ctx) {
    let img;
    let img_src_value;
    return {
      c() {
        img = element("img");
        attr(img, "class", "d-icon svelte-1kywygu");
        if (!src_url_equal(img.src, img_src_value = /*iconUrl*/
        ctx[3]))
          attr(img, "src", img_src_value);
        attr(img, "alt", "ads-logo");
      },
      m(target, anchor) {
        insert(target, img, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(img);
      }
    };
  }
  function create_if_block_3(ctx) {
    let div;
    return {
      c() {
        div = element("div");
        div.textContent = `${/*descriptionText*/
        ctx[4]}`;
        attr(div, "class", "d-text svelte-1kywygu");
      },
      m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function create_if_block_1$3(ctx) {
    let div2;
    let button0;
    let div0;
    let dficon;
    let t0;
    let t1;
    let t2;
    let button1;
    let div1;
    let current_block_type_index;
    let if_block;
    let t3;
    let t4_value = (
      /*isReported*/
      (ctx[0] ? (
        /*reportMessage*/
        ctx[9]
      ) : (
        /*abuse*/
        ctx[8]
      )) + ""
    );
    let t4;
    let t5;
    let button2;
    let copyicon;
    let t6;
    let t7_value = (
      /*erid*/
      (ctx[5] || "") + ""
    );
    let t7;
    let current;
    let mounted;
    let dispose;
    dficon = new DfIcon({});
    const if_block_creators = [create_if_block_2, create_else_block$2];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (
        /*isReported*/
        ctx2[0]
      )
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    copyicon = new CopyIcon({});
    return {
      c() {
        div2 = element("div");
        button0 = element("button");
        div0 = element("div");
        create_component(dficon.$$.fragment);
        t0 = space();
        t1 = text(
          /*adsHeader*/
          ctx[7]
        );
        t2 = space();
        button1 = element("button");
        div1 = element("div");
        if_block.c();
        t3 = space();
        t4 = text(t4_value);
        t5 = space();
        button2 = element("button");
        create_component(copyicon.$$.fragment);
        t6 = text("\n            Erid ");
        t7 = text(t7_value);
        attr(div0, "class", "m-icon svelte-1kywygu");
        attr(button0, "class", "svelte-1kywygu");
        attr(div1, "class", "m-icon svelte-1kywygu");
        attr(button1, "class", "svelte-1kywygu");
        attr(button2, "class", "svelte-1kywygu");
        attr(div2, "class", "m svelte-1kywygu");
      },
      m(target, anchor) {
        insert(target, div2, anchor);
        append(div2, button0);
        append(button0, div0);
        mount_component(dficon, div0, null);
        append(button0, t0);
        append(button0, t1);
        append(div2, t2);
        append(div2, button1);
        append(button1, div1);
        if_blocks[current_block_type_index].m(div1, null);
        append(button1, t3);
        append(button1, t4);
        append(div2, t5);
        append(div2, button2);
        mount_component(copyicon, button2, null);
        append(button2, t6);
        append(button2, t7);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              button0,
              "click",
              /*click_handler_1*/
              ctx[13]
            ),
            listen(
              button1,
              "click",
              /*click_handler_2*/
              ctx[14]
            ),
            listen(
              button2,
              "click",
              /*click_handler_3*/
              ctx[15]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2);
        if (current_block_type_index !== previous_block_index) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          }
          transition_in(if_block, 1);
          if_block.m(div1, null);
        }
        if ((!current || dirty & /*isReported*/
        1) && t4_value !== (t4_value = /*isReported*/
        (ctx2[0] ? (
          /*reportMessage*/
          ctx2[9]
        ) : (
          /*abuse*/
          ctx2[8]
        )) + ""))
          set_data(t4, t4_value);
      },
      i(local) {
        if (current)
          return;
        transition_in(dficon.$$.fragment, local);
        transition_in(if_block);
        transition_in(copyicon.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(dficon.$$.fragment, local);
        transition_out(if_block);
        transition_out(copyicon.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div2);
        destroy_component(dficon);
        if_blocks[current_block_type_index].d();
        destroy_component(copyicon);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_else_block$2(ctx) {
    let infoicon;
    let current;
    infoicon = new InfoIcon({});
    return {
      c() {
        create_component(infoicon.$$.fragment);
      },
      m(target, anchor) {
        mount_component(infoicon, target, anchor);
        current = true;
      },
      i(local) {
        if (current)
          return;
        transition_in(infoicon.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(infoicon.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(infoicon, detaching);
      }
    };
  }
  function create_if_block_2(ctx) {
    let checkicon;
    let current;
    checkicon = new CheckIcon({});
    return {
      c() {
        create_component(checkicon.$$.fragment);
      },
      m(target, anchor) {
        mount_component(checkicon, target, anchor);
        current = true;
      },
      i(local) {
        if (current)
          return;
        transition_in(checkicon.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(checkicon.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(checkicon, detaching);
      }
    };
  }
  function create_fragment$9(ctx) {
    let if_block_anchor;
    let current;
    let if_block = (
      /*$controlsStore*/
      ctx[2].header && create_if_block$8(ctx)
    );
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (
          /*$controlsStore*/
          ctx2[2].header
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & /*$controlsStore*/
            4) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$8(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$a($$self, $$props, $$invalidate) {
    let showMenu;
    let $controlsStore;
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(2, $controlsStore = $$value));
    var _a, _b, _c, _d;
    let { context = {} } = $$props;
    let { currentAds = {} } = $$props;
    const isEngLang = /en/g.test(navigator.language);
    const iconUrl = (_c = (_b = (_a = currentAds.ads) === null || _a === void 0 ? void 0 : _a.creatives[0]) === null || _b === void 0 ? void 0 : _b.icons[0]) === null || _c === void 0 ? void 0 : _c.staticResource;
    const descriptionText = (_d = currentAds.ads) === null || _d === void 0 ? void 0 : _d.description;
    const erid = context.parameters.erid;
    const ads = isEngLang ? "Ads" : "Реклама";
    const adsHeader = isEngLang ? "Advertising from DF" : "Реклама от DF";
    const abuse = isEngLang ? "Incorrect display" : "Некорректное отображение";
    let isReported = false;
    const reportMessage = isEngLang ? "Thank you!" : "Спасибо!";
    const click_handler = () => $$invalidate(1, showMenu = !showMenu);
    const click_handler_1 = () => window.open("https://digitalfrontier.net/", "_blank");
    const click_handler_2 = () => $$invalidate(0, isReported = true);
    const click_handler_3 = () => {
      copyToClipboard(erid || "");
    };
    $$self.$$set = ($$props2) => {
      if ("context" in $$props2)
        $$invalidate(10, context = $$props2.context);
      if ("currentAds" in $$props2)
        $$invalidate(11, currentAds = $$props2.currentAds);
    };
    $$invalidate(1, showMenu = false);
    return [
      isReported,
      showMenu,
      $controlsStore,
      iconUrl,
      descriptionText,
      erid,
      ads,
      adsHeader,
      abuse,
      reportMessage,
      context,
      currentAds,
      click_handler,
      click_handler_1,
      click_handler_2,
      click_handler_3
    ];
  }
  class Header extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$a, create_fragment$9, safe_not_equal, { context: 10, currentAds: 11 }, add_css$7);
    }
  }
  const HeaderSvelte = Header;
  const SKIP_DEFAULT_TIMEOUT = 30;
  function add_css$6(target) {
    append_styles(target, "svelte-bl12ns", ".skip.svelte-bl12ns{display:flex;justify-content:center;align-items:center;background:rgba(0, 0, 0, 0.5);backdrop-filter:blur(2px);color:#fff;position:absolute;z-index:9992;fill:rgb(46, 46, 46);cursor:pointer;outline:none;border:none;bottom:28px;right:1em;font-family:Arial, Helvetica, sans-serif}.skip.svelte-bl12ns{font-size:12px}@media screen and (min-width: 380px){.skip.svelte-bl12ns{font-size:calc(12px + 42 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.skip.svelte-bl12ns{font-size:54px}}.skip.svelte-bl12ns{padding:8px 11px}@media screen and (min-width: 380px){.skip.svelte-bl12ns{padding:calc(8px + 24 * (100vw - 380px) / 3459) calc(11px + 13 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.skip.svelte-bl12ns{padding:32px 24px}}.skip.svelte-bl12ns:hover{background:rgba(0, 0, 0, 0.9)}.skip.svelte-bl12ns{bottom:44px}@media screen and (min-width: 380px){.skip.svelte-bl12ns{bottom:calc(44px + 279 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.skip.svelte-bl12ns{bottom:323px}}.icon.svelte-bl12ns{display:flex;justify-content:center;align-items:center;fill:#fff;margin-left:15px}.icon.svelte-bl12ns{width:8px}@media screen and (min-width: 380px){.icon.svelte-bl12ns{width:calc(8px + 20 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.icon.svelte-bl12ns{width:28px}}");
  }
  function create_if_block$7(ctx) {
    let button;
    let div0;
    let t1;
    let t2;
    let div1;
    let skipicon;
    let button_disabled_value;
    let current;
    let mounted;
    let dispose;
    let if_block = (
      /*skipCountdown*/
      ctx[1] > 0.3 && create_if_block_1$2(ctx)
    );
    skipicon = new SkipIcon({});
    return {
      c() {
        button = element("button");
        div0 = element("div");
        div0.textContent = `${/*isEngLang*/
        ctx[4] ? "Skip " : "Пропустить "}`;
        t1 = space();
        if (if_block)
          if_block.c();
        t2 = space();
        div1 = element("div");
        create_component(skipicon.$$.fragment);
        set_style(div0, "white-space", "break-spaces");
        attr(div1, "class", "icon svelte-bl12ns");
        attr(button, "class", "skip svelte-bl12ns");
        button.disabled = button_disabled_value = /*skipCountdown*/
        ctx[1] !== 0;
      },
      m(target, anchor) {
        insert(target, button, anchor);
        append(button, div0);
        append(button, t1);
        if (if_block)
          if_block.m(button, null);
        append(button, t2);
        append(button, div1);
        mount_component(skipicon, div1, null);
        current = true;
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*click_handler*/
            ctx[10]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (
          /*skipCountdown*/
          ctx2[1] > 0.3
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block_1$2(ctx2);
            if_block.c();
            if_block.m(button, t2);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        if (!current || dirty & /*skipCountdown*/
        2 && button_disabled_value !== (button_disabled_value = /*skipCountdown*/
        ctx2[1] !== 0)) {
          button.disabled = button_disabled_value;
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(skipicon.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(skipicon.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(button);
        if (if_block)
          if_block.d();
        destroy_component(skipicon);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_1$2(ctx) {
    let span;
    let t;
    return {
      c() {
        span = element("span");
        t = text(
          /*skipCountdown*/
          ctx[1]
        );
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
      },
      p(ctx2, dirty) {
        if (dirty & /*skipCountdown*/
        2)
          set_data(
            t,
            /*skipCountdown*/
            ctx2[1]
          );
      },
      d(detaching) {
        if (detaching)
          detach(span);
      }
    };
  }
  function create_fragment$8(ctx) {
    let if_block_anchor;
    let current;
    let if_block = (
      /*isDrawSkipCondition*/
      ctx[3] && !/*notDrawCondition*/
      ctx[2] && create_if_block$7(ctx)
    );
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (
          /*isDrawSkipCondition*/
          ctx2[3] && !/*notDrawCondition*/
          ctx2[2]
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & /*isDrawSkipCondition, notDrawCondition*/
            12) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$7(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$9($$self, $$props, $$invalidate) {
    let duration;
    let isCreativeLong;
    let isDrawSkipCondition;
    let notDrawCondition;
    let skipCountdown;
    let $controlsStore;
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(9, $controlsStore = $$value));
    var _a;
    let { currentAds } = $$props;
    let { context = {} } = $$props;
    const isEngLang = /en/g.test(navigator.language);
    const creative = currentAds.ads.creatives[0];
    const skipTime = creative.skipDelay ? Number(creative.skipDelay) > 30 ? SKIP_DEFAULT_TIMEOUT : creative.skipDelay : SKIP_DEFAULT_TIMEOUT;
    let unsubscribeFromTimeStore = currentTimeVPAID.subscribe((progressTime) => {
      if (progressTime > skipTime) {
        $$invalidate(1, skipCountdown = 0);
      } else {
        $$invalidate(1, skipCountdown = skipTime - Math.floor(progressTime));
      }
    });
    let unsubscribeFromDurationStore = durationStore.subscribe((durationValue) => {
      $$invalidate(7, duration = durationValue);
    });
    onDestroy(() => {
      unsubscribeFromTimeStore();
      unsubscribeFromDurationStore();
    });
    const click_handler = () => {
      skipAd(context)();
    };
    $$self.$$set = ($$props2) => {
      if ("currentAds" in $$props2)
        $$invalidate(5, currentAds = $$props2.currentAds);
      if ("context" in $$props2)
        $$invalidate(0, context = $$props2.context);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & /*context, _a*/
      65) {
        $$invalidate(7, duration = Number($$invalidate(6, _a = context.videoSlot) === null || _a === void 0 ? void 0 : _a.duration));
      }
      if ($$self.$$.dirty & /*duration*/
      128) {
        $$invalidate(8, isCreativeLong = duration > SKIP_DEFAULT_TIMEOUT);
      }
      if ($$self.$$.dirty & /*$controlsStore, isCreativeLong*/
      768) {
        $$invalidate(3, isDrawSkipCondition = $controlsStore.skip || isCreativeLong);
      }
      if ($$self.$$.dirty & /*duration*/
      128) {
        $$invalidate(2, notDrawCondition = skipTime >= duration);
      }
    };
    $$invalidate(1, skipCountdown = skipTime);
    return [
      context,
      skipCountdown,
      notDrawCondition,
      isDrawSkipCondition,
      isEngLang,
      currentAds,
      _a,
      duration,
      isCreativeLong,
      $controlsStore,
      click_handler
    ];
  }
  class Skip extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$9, create_fragment$8, safe_not_equal, { currentAds: 5, context: 0 }, add_css$6);
    }
  }
  const Skip$1 = Skip;
  function add_css$5(target) {
    append_styles(target, "svelte-153sf60", '.w.svelte-153sf60 a[href^="tel:"].svelte-153sf60{color:#fff;font-size:14px;font-weight:900;line-height:24px;font-family:Arial, Helvetica, sans-serif}.w.svelte-153sf60.svelte-153sf60{z-index:1009;max-width:45%;text-shadow:none;color:#fff;position:absolute;background:rgba(0, 0, 0, 0.7);border:1px solid rgba(255, 255, 255, 0.5);bottom:28px;left:12px;fill:rgb(46, 46, 46);direction:ltr;cursor:pointer;padding:2px 6px 2px 10px;outline:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;height:calc(max-content + 10px);width:auto;text-align:left}@media(max-width: 500px){.w.svelte-153sf60.svelte-153sf60{padding:5px;height:auto}.w.svelte-153sf60 a[href^="tel:"].svelte-153sf60{font-size:10px}}');
  }
  function create_if_block$6(ctx) {
    let button;
    let a;
    let t_value = (
      /*$controlsStore*/
      ctx[1].tel + ""
    );
    let t;
    return {
      c() {
        button = element("button");
        a = element("a");
        t = text(t_value);
        attr(a, "href", `tel:+${/*telForHref*/
        ctx[2]}`);
        attr(a, "class", "svelte-153sf60");
        set_style(button, "background", "rgba(0, 0, 0, " + /*opacity*/
        ctx[0] + ")");
        attr(button, "class", "w svelte-153sf60");
      },
      m(target, anchor) {
        insert(target, button, anchor);
        append(button, a);
        append(a, t);
      },
      p(ctx2, dirty) {
        if (dirty & /*$controlsStore*/
        2 && t_value !== (t_value = /*$controlsStore*/
        ctx2[1].tel + ""))
          set_data(t, t_value);
        if (dirty & /*opacity*/
        1) {
          set_style(button, "background", "rgba(0, 0, 0, " + /*opacity*/
          ctx2[0] + ")");
        }
      },
      d(detaching) {
        if (detaching)
          detach(button);
      }
    };
  }
  function create_fragment$7(ctx) {
    let if_block_anchor;
    let if_block = !!/*$controlsStore*/
    ctx[1].tel && create_if_block$6(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (!!/*$controlsStore*/
        ctx2[1].tel) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block$6(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$8($$self, $$props, $$invalidate) {
    let $controlsStore;
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(1, $controlsStore = $$value));
    let { context = {} } = $$props;
    const isTouchDeviceConst = isTouchDevice();
    let opacity = isTouchDeviceConst ? 0.6 : 0.4;
    const telForHref = onlyNumbersFromString($controlsStore.tel);
    onMount(() => {
      var _a, _b;
      if (!isTouchDeviceConst) {
        (_a = context.slot) === null || _a === void 0 ? void 0 : _a.addEventListener("mouseenter", () => {
          $$invalidate(0, opacity = 1);
        });
        (_b = context.slot) === null || _b === void 0 ? void 0 : _b.addEventListener("mouseleave", () => {
          $$invalidate(0, opacity = 0.4);
        });
      }
    });
    $$self.$$set = ($$props2) => {
      if ("context" in $$props2)
        $$invalidate(3, context = $$props2.context);
    };
    return [opacity, $controlsStore, telForHref, context];
  }
  class Tel extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$8, create_fragment$7, safe_not_equal, { context: 3 }, add_css$5);
    }
  }
  const Tel$1 = Tel;
  function add_css$4(target) {
    append_styles(target, "svelte-1x5fr7j", ".w.svelte-1x5fr7j{z-index:9991;width:100%;height:100%;position:absolute;top:0;left:0;cursor:pointer;padding:0;margin:0}");
  }
  function create_if_block$5(ctx) {
    let div;
    let mounted;
    let dispose;
    return {
      c() {
        div = element("div");
        attr(div, "class", "w svelte-1x5fr7j");
        set_style(div, "opacity", "0");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (!mounted) {
          dispose = listen(
            div,
            "click",
            /*click_handler*/
            ctx[2]
          );
          mounted = true;
        }
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(div);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment$6(ctx) {
    let if_block_anchor;
    let if_block = !/*$controlsStore*/
    ctx[1].tel && /*$controlsStore*/
    ctx[1].transparentClick && create_if_block$5(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (!/*$controlsStore*/
        ctx2[1].tel && /*$controlsStore*/
        ctx2[1].transparentClick) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block$5(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$7($$self, $$props, $$invalidate) {
    let $controlsStore;
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(1, $controlsStore = $$value));
    let { context = {} } = $$props;
    const click_handler = () => {
      clickAction(context);
    };
    $$self.$$set = ($$props2) => {
      if ("context" in $$props2)
        $$invalidate(0, context = $$props2.context);
    };
    return [context, $controlsStore, click_handler];
  }
  class Transparent_click extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$7, create_fragment$6, safe_not_equal, { context: 0 }, add_css$4);
    }
  }
  const TransparentClickSvelte = Transparent_click;
  function add_css$3(target) {
    append_styles(target, "svelte-1xmm6nf", ".p.svelte-1xmm6nf{bottom:0;appearance:none;display:block;color:var(--p-df-color);height:4px;background:rgba(255, 255, 255, 0.5);outline:none;border:none;position:absolute;width:97%;margin:0 1.5%;left:0;z-index:8}@media(min-width: 960px){.p.svelte-1xmm6nf{bottom:calc(48px + 142 * (100vw - 380px) / 3459)}}.p.svelte-1xmm6nf::-webkit-progress-bar{background:rgba(255, 255, 255, 0.5)}.p.svelte-1xmm6nf::-webkit-progress-value{background:#0649cb}.p.svelte-1xmm6nf::-moz-progress-bar{background:#0649cb}");
  }
  function create_if_block$4(ctx) {
    let progress2;
    let progress_value_value;
    return {
      c() {
        progress2 = element("progress");
        attr(progress2, "class", "p svelte-1xmm6nf");
        attr(progress2, "max", "100");
        progress2.value = progress_value_value = /*progressTime*/
        ctx[1] / /*duration*/
        ctx[0] * 100 || 0;
      },
      m(target, anchor) {
        insert(target, progress2, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & /*progressTime, duration*/
        3 && progress_value_value !== (progress_value_value = /*progressTime*/
        ctx2[1] / /*duration*/
        ctx2[0] * 100 || 0)) {
          progress2.value = progress_value_value;
        }
      },
      d(detaching) {
        if (detaching)
          detach(progress2);
      }
    };
  }
  function create_fragment$5(ctx) {
    let if_block_anchor;
    let if_block = (
      /*$controlsStore*/
      ctx[2].progress && create_if_block$4(ctx)
    );
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (
          /*$controlsStore*/
          ctx2[2].progress
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block$4(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$6($$self, $$props, $$invalidate) {
    let duration;
    let progressTime;
    let $controlsStore;
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(2, $controlsStore = $$value));
    let unsubscribeFromTimeStore = currentTimeVPAID.subscribe((value) => {
      $$invalidate(1, progressTime = value);
    });
    let unsubscribeFromDurationStore = durationStore.subscribe((durationValue) => {
      $$invalidate(0, duration = durationValue);
    });
    onDestroy(() => {
      unsubscribeFromTimeStore();
      unsubscribeFromDurationStore();
    });
    $$invalidate(0, duration = 0);
    $$invalidate(1, progressTime = 0);
    return [duration, progressTime, $controlsStore];
  }
  class Progress extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$6, create_fragment$5, safe_not_equal, {}, add_css$3);
    }
  }
  const Progress$1 = Progress;
  function add_css$2(target) {
    append_styles(target, "svelte-1lsf82f", ".range.svelte-1lsf82f.svelte-1lsf82f{position:relative;background-color:#fff;width:5em;display:none;height:min-content;animation-duration:3s;animation-name:slidein}.v.svelte-1lsf82f.svelte-1lsf82f{display:flex;align-items:center}.range.svelte-1lsf82f.svelte-1lsf82f:focus{outline:none}.v.svelte-1lsf82f:hover .range.svelte-1lsf82f{display:block}.range.svelte-1lsf82f.svelte-1lsf82f::-webkit-slider-runnable-track{width:5em;height:2px;color:#000;border-radius:3px}.range.svelte-1lsf82f.svelte-1lsf82f::-webkit-slider-thumb{-webkit-appearance:none;border:none;height:12px;width:12px;border-radius:510%;background:#fff;border:2px solid #fff;margin-top:-5px;cursor:pointer}.range.svelte-1lsf82f.svelte-1lsf82f::-ms-fill-lower{background-color:#fff}.range.svelte-1lsf82f.svelte-1lsf82f::-ms-fill-upper{background-color:#000}.range.svelte-1lsf82f.svelte-1lsf82f::-moz-range-progress{background-color:#fff}.range.svelte-1lsf82f.svelte-1lsf82f::-moz-range-track{background-color:#000}");
  }
  function create_if_block$3(ctx) {
    let div;
    let button;
    let current_block_type_index;
    let if_block;
    let t;
    let input;
    let current;
    let mounted;
    let dispose;
    const if_block_creators = [create_if_block_1$1, create_else_block$1];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (
        /*$volumeStore*/
        ctx2[0] === 0
      )
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        div = element("div");
        button = element("button");
        if_block.c();
        t = space();
        input = element("input");
        attr(button, "class", "c-b");
        attr(input, "class", "range svelte-1lsf82f");
        attr(input, "type", "range");
        attr(input, "max", "1");
        attr(input, "min", "0");
        attr(input, "step", "0.01");
        attr(div, "class", "v svelte-1lsf82f");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, button);
        if_blocks[current_block_type_index].m(button, null);
        append(div, t);
        append(div, input);
        set_input_value(
          input,
          /*$volumeStore*/
          ctx[0]
        );
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              button,
              "click",
              /*click_handler*/
              ctx[2]
            ),
            listen(
              input,
              "change",
              /*input_change_input_handler*/
              ctx[3]
            ),
            listen(
              input,
              "input",
              /*input_change_input_handler*/
              ctx[3]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2);
        if (current_block_type_index !== previous_block_index) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          }
          transition_in(if_block, 1);
          if_block.m(button, null);
        }
        if (dirty & /*$volumeStore*/
        1) {
          set_input_value(
            input,
            /*$volumeStore*/
            ctx2[0]
          );
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        if_blocks[current_block_type_index].d();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_else_block$1(ctx) {
    let soundicon;
    let current;
    soundicon = new SoundIcon({});
    return {
      c() {
        create_component(soundicon.$$.fragment);
      },
      m(target, anchor) {
        mount_component(soundicon, target, anchor);
        current = true;
      },
      i(local) {
        if (current)
          return;
        transition_in(soundicon.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(soundicon.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(soundicon, detaching);
      }
    };
  }
  function create_if_block_1$1(ctx) {
    let muteicon;
    let current;
    muteicon = new MuteIcon({});
    return {
      c() {
        create_component(muteicon.$$.fragment);
      },
      m(target, anchor) {
        mount_component(muteicon, target, anchor);
        current = true;
      },
      i(local) {
        if (current)
          return;
        transition_in(muteicon.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(muteicon.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(muteicon, detaching);
      }
    };
  }
  function create_fragment$4(ctx) {
    let if_block_anchor;
    let current;
    let if_block = (
      /*$controlsStore*/
      ctx[1].volume && create_if_block$3(ctx)
    );
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (
          /*$controlsStore*/
          ctx2[1].volume
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & /*$controlsStore*/
            2) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$3(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$5($$self, $$props, $$invalidate) {
    let $volumeStore;
    let $controlsStore;
    component_subscribe($$self, volumeStore, ($$value) => $$invalidate(0, $volumeStore = $$value));
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(1, $controlsStore = $$value));
    console.log("volumeStore");
    console.log($volumeStore);
    const click_handler = () => {
      set_store_value(volumeStore, $volumeStore = $volumeStore === 0 ? 0.5 : 0, $volumeStore);
    };
    function input_change_input_handler() {
      $volumeStore = to_number(this.value);
      volumeStore.set($volumeStore);
    }
    return [$volumeStore, $controlsStore, click_handler, input_change_input_handler];
  }
  class Volume extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$5, create_fragment$4, safe_not_equal, {}, add_css$2);
    }
  }
  const Volume$1 = Volume;
  function add_css$1(target) {
    append_styles(target, "svelte-1cla8ka", ".c.svelte-1cla8ka{bottom:15px;display:flex;position:absolute;width:97%;margin:0 1.5%;z-index:6;justify-content:space-between}@media(min-width: 1900px){.c.svelte-1cla8ka{bottom:26px}}@media(min-width: 3800px){.c.svelte-1cla8ka{bottom:75px}}.c-r.svelte-1cla8ka,.c-l.svelte-1cla8ka{display:flex;gap:26px}.c-b{fill:#fff;fill:#fff;cursor:pointer;width:46px;height:100%;opacity:0.9;display:inline-block;width:40px;-webkit-transition:opacity 0.1s cubic-bezier(0.4, 0, 1, 1);transition:opacity 0.1s cubic-bezier(0.4, 0, 1, 1);overflow:hidden;-webkit-box-flex:0;-webkit-flex:0 0 auto;-moz-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto;outline:0;border:none;background-color:transparent;padding:0}.c-b{width:16px}@media screen and (min-width: 380px){.c-b{width:calc(16px + 39 * (100vw - 380px) / 3459)}}@media screen and (min-width: 3839px){.c-b{width:55px}}.controls--svg--fill{fill:#fff}");
  }
  function create_if_block$2(ctx) {
    let progress2;
    let t0;
    let div2;
    let div0;
    let play;
    let t1;
    let volume2;
    let t2;
    let div1;
    let screen;
    let current;
    progress2 = new Progress$1({});
    play = new Play$1({ props: { context: (
      /*context*/
      ctx[0]
    ) } });
    volume2 = new Volume$1({});
    screen = new Screen$1({ props: { context: (
      /*context*/
      ctx[0]
    ) } });
    return {
      c() {
        create_component(progress2.$$.fragment);
        t0 = space();
        div2 = element("div");
        div0 = element("div");
        create_component(play.$$.fragment);
        t1 = space();
        create_component(volume2.$$.fragment);
        t2 = space();
        div1 = element("div");
        create_component(screen.$$.fragment);
        attr(div0, "class", "c-l svelte-1cla8ka");
        attr(div1, "class", "c-r svelte-1cla8ka");
        attr(div2, "class", "c svelte-1cla8ka");
      },
      m(target, anchor) {
        mount_component(progress2, target, anchor);
        insert(target, t0, anchor);
        insert(target, div2, anchor);
        append(div2, div0);
        mount_component(play, div0, null);
        append(div0, t1);
        mount_component(volume2, div0, null);
        append(div2, t2);
        append(div2, div1);
        mount_component(screen, div1, null);
        current = true;
      },
      p(ctx2, dirty) {
        const play_changes = {};
        if (dirty & /*context*/
        1)
          play_changes.context = /*context*/
          ctx2[0];
        play.$set(play_changes);
        const screen_changes = {};
        if (dirty & /*context*/
        1)
          screen_changes.context = /*context*/
          ctx2[0];
        screen.$set(screen_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(progress2.$$.fragment, local);
        transition_in(play.$$.fragment, local);
        transition_in(volume2.$$.fragment, local);
        transition_in(screen.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(progress2.$$.fragment, local);
        transition_out(play.$$.fragment, local);
        transition_out(volume2.$$.fragment, local);
        transition_out(screen.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(progress2, detaching);
        if (detaching)
          detach(t0);
        if (detaching)
          detach(div2);
        destroy_component(play);
        destroy_component(volume2);
        destroy_component(screen);
      }
    };
  }
  function create_fragment$3(ctx) {
    let if_block_anchor;
    let current;
    let if_block = (
      /*$controlsStore*/
      ctx[1].videoControls && create_if_block$2(ctx)
    );
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (
          /*$controlsStore*/
          ctx2[1].videoControls
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & /*$controlsStore*/
            2) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$2(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$4($$self, $$props, $$invalidate) {
    let $controlsStore;
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(1, $controlsStore = $$value));
    let { context = {} } = $$props;
    $$self.$$set = ($$props2) => {
      if ("context" in $$props2)
        $$invalidate(0, context = $$props2.context);
    };
    return [context, $controlsStore];
  }
  class Video_controls extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$4, create_fragment$3, safe_not_equal, { context: 0 }, add_css$1);
    }
  }
  const VideoControls = Video_controls;
  function create_if_block$1(ctx) {
    let button;
    let current_block_type_index;
    let if_block;
    let current;
    let mounted;
    let dispose;
    const if_block_creators = [create_if_block_1, create_else_block];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (
        /*playState*/
        ctx2[1]
      )
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        button = element("button");
        if_block.c();
        attr(button, "class", "c-b");
      },
      m(target, anchor) {
        insert(target, button, anchor);
        if_blocks[current_block_type_index].m(button, null);
        current = true;
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*click_handler*/
            ctx[3]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2);
        if (current_block_type_index !== previous_block_index) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          }
          transition_in(if_block, 1);
          if_block.m(button, null);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(button);
        if_blocks[current_block_type_index].d();
        mounted = false;
        dispose();
      }
    };
  }
  function create_else_block(ctx) {
    let playicon;
    let current;
    playicon = new PlayIcon({});
    return {
      c() {
        create_component(playicon.$$.fragment);
      },
      m(target, anchor) {
        mount_component(playicon, target, anchor);
        current = true;
      },
      i(local) {
        if (current)
          return;
        transition_in(playicon.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(playicon.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(playicon, detaching);
      }
    };
  }
  function create_if_block_1(ctx) {
    let pauseicon;
    let current;
    pauseicon = new PauseIcon({});
    return {
      c() {
        create_component(pauseicon.$$.fragment);
      },
      m(target, anchor) {
        mount_component(pauseicon, target, anchor);
        current = true;
      },
      i(local) {
        if (current)
          return;
        transition_in(pauseicon.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(pauseicon.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(pauseicon, detaching);
      }
    };
  }
  function create_fragment$2(ctx) {
    let if_block_anchor;
    let current;
    let if_block = (
      /*$controlsStore*/
      ctx[2].playButton && create_if_block$1(ctx)
    );
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (
          /*$controlsStore*/
          ctx2[2].playButton
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & /*$controlsStore*/
            4) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$1(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$3($$self, $$props, $$invalidate) {
    let playState;
    let $controlsStore;
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(2, $controlsStore = $$value));
    let { context = {} } = $$props;
    let unsubscribeFromPlayStore = playStore.subscribe((value) => {
      $$invalidate(1, playState = value);
    });
    onDestroy(() => {
      unsubscribeFromPlayStore();
    });
    const click_handler = () => {
      console.log(playState);
      playState ? context.pauseAd() : context.startAd();
    };
    $$self.$$set = ($$props2) => {
      if ("context" in $$props2)
        $$invalidate(0, context = $$props2.context);
    };
    $$invalidate(1, playState = true);
    return [context, playState, $controlsStore, click_handler];
  }
  class Play extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$3, create_fragment$2, safe_not_equal, { context: 0 });
    }
  }
  const Play$1 = Play;
  function create_if_block(ctx) {
    let button;
    let fullscreenicon;
    let current;
    let mounted;
    let dispose;
    fullscreenicon = new FullScreenIcon({});
    return {
      c() {
        button = element("button");
        create_component(fullscreenicon.$$.fragment);
        attr(button, "class", "c-b");
      },
      m(target, anchor) {
        insert(target, button, anchor);
        mount_component(fullscreenicon, button, null);
        current = true;
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*click_handler*/
            ctx[2]
          );
          mounted = true;
        }
      },
      p: noop,
      i(local) {
        if (current)
          return;
        transition_in(fullscreenicon.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(fullscreenicon.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(button);
        destroy_component(fullscreenicon);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment$1(ctx) {
    let if_block_anchor;
    let current;
    let if_block = (
      /*$controlsStore*/
      ctx[1].fullScreen && create_if_block(ctx)
    );
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (
          /*$controlsStore*/
          ctx2[1].fullScreen
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & /*$controlsStore*/
            2) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance$2($$self, $$props, $$invalidate) {
    let $controlsStore;
    component_subscribe($$self, controlsStore, ($$value) => $$invalidate(1, $controlsStore = $$value));
    let { context = {} } = $$props;
    const click_handler = (event) => {
      event.stopPropagation();
      context.expandAd();
    };
    $$self.$$set = ($$props2) => {
      if ("context" in $$props2)
        $$invalidate(0, context = $$props2.context);
    };
    return [context, $controlsStore, click_handler];
  }
  class Screen extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$2, create_fragment$1, safe_not_equal, { context: 0 });
    }
  }
  const Screen$1 = Screen;
  function instance$1($$self, $$props, $$invalidate) {
    let { context = {} } = $$props;
    let unsubscribeFromVolumeStore = volumeStore.subscribe((value) => {
      context.setAdVolume(value);
    });
    onMount(() => {
    });
    onDestroy(() => {
      unsubscribeFromVolumeStore();
    });
    $$self.$$set = ($$props2) => {
      if ("context" in $$props2)
        $$invalidate(0, context = $$props2.context);
    };
    return [context];
  }
  class Main extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$1, null, safe_not_equal, { context: 0 });
    }
  }
  const Main$1 = Main;
  const drawUi = (context) => {
    new Main$1({
      target: context.slot,
      props: {
        context
      }
    });
    new ActionSvelte({
      target: context.slot,
      props: {
        currentAds: {
          ads: context.ads,
          containVPAID: true,
          tracker: context.tracker,
          vastClient: context.vastClient
        },
        context
      }
    });
    new HeaderSvelte({
      target: context.slot,
      props: {
        currentAds: {
          ads: context.ads,
          containVPAID: true,
          tracker: context.tracker,
          vastClient: context.vastClient
        },
        context
      }
    });
    new FullScreenClickSvelte({
      target: context.slot,
      props: {
        currentAds: {
          ads: context.ads,
          containVPAID: true,
          tracker: context.tracker,
          vastClient: context.vastClient
        },
        context
      }
    });
    new TransparentClickSvelte({
      target: context.slot,
      props: {
        context
      }
    });
    new Skip$1({
      target: context.slot,
      props: {
        currentAds: {
          ads: context.ads,
          containVPAID: true,
          tracker: context.tracker,
          vastClient: context.vastClient
        },
        context
      }
    });
    new Tel$1({
      target: context.slot,
      props: {
        context
      }
    });
    new VideoControls({
      target: context.slot,
      props: {
        context
      }
    });
  };
  const PROMISE_TIME_OUT = 1500;
  const matchUser = async (context) => {
    const { pixels } = context.parameters;
    if (!pixels) {
      return Promise.resolve();
    }
    return new Promise((resolveGlobal) => {
      Promise.allSettled(
        pixels == null ? void 0 : pixels.map(({ pixel }) => {
          log(pixel);
          return Promise.race([
            fetch(pixel, { mode: "no-cors", credentials: "include" }),
            new Promise((_resolve, reject) => {
              setTimeout(() => {
                reject(new PixelError());
              }, PROMISE_TIME_OUT);
            })
          ]);
        })
      ).then(async (result) => {
        log(result);
        await Promise.all(
          result.map(async (linkResult, index) => {
            if ((linkResult == null ? void 0 : linkResult.status) === "rejected") {
              log(`Try to fetch ERROR ${pixels[index].error}`);
              return fetch(pixels[index].error, {
                mode: "no-cors",
                credentials: "include"
              }).catch((error) => log(error, true));
            }
            return Promise.resolve();
          })
        );
        resolveGlobal("");
      });
    });
  };
  const instanceOfCookieMatching = (object) => {
    if (object !== null && typeof object === "object") {
      return "pixels" in object && Array.isArray(object.pixels) && "vast_link" in object && typeof object.vast_link === "string";
    }
    return false;
  };
  const instanceOfDf = (object) => {
    if (object !== null && typeof object === "object") {
      return "vast_link" in object && typeof object.vast_link === "string";
    }
    return false;
  };
  const controller = new AbortController();
  const fetchVast = async (props) => {
    const vastClient = new vastClient_minExports.VASTClient();
    const options = {
      withCredentials: true,
      wrapperLimit: 7,
      /** Returns a Promise which either resolves with a VASTResponse
       * or rejects with an Error. The resolved VASTResponse
       * can contain either a single Ad or AdPod or all the remaining Ads
       * if all parameter is passed as true.
       * By default the fully parsed VASTResponse contains all the
       * Ads contained in the VAST resource. It's possible to get only
       * the first Ad or AdPod and then get the remaining ones on demand
       * by passing resolveAll: false in the options parameter. */
      resolveAll: false,
      urlHandler: {
        get: (url, options2, cb) => {
          const corsMode = props.corsMode || (options2.withCredentials ? "cors" : "no-cors");
          const optCredentialValue = options2.withCredentials ? "include" : "omit";
          const timeoutId = setTimeout(() => controller.abort(), options2.timeout);
          fetch(url, {
            mode: corsMode,
            credentials: optCredentialValue,
            signal: controller.signal
          }).then((response) => {
            clearTimeout(timeoutId);
            return response.text();
          }).then(
            (str) => new window.DOMParser().parseFromString(str, "text/xml")
          ).then((xml) => cb(null, xml)).catch((err) => cb(err));
        }
      }
    };
    replaceMacro(vastClient, props.widthAndHeight);
    let currentAds;
    try {
      currentAds = setCurrentAds({
        restAds: await vastClient.get(props.url, options),
        vastClient
      });
      return currentAds;
    } catch (error) {
      log(currentAds);
      log(error, true);
      return getNextAds(vastClient).then((nextAds) => {
        if (!nextAds)
          throw new GetVastError();
        return nextAds;
      });
    }
  };
  let vpaidCounter = 0;
  const DF_NETWORK_AD_SYSTEM = "Ad Server Digital Frontier";
  const fetchCreativeDataWithMatch = async (context, creativeData) => {
    var _a;
    if (vpaidCounter > 2) {
      throw new Error("to many vpaids");
    }
    context.parameters = JSON.parse(creativeData.AdParameters);
    if (instanceOfCookieMatching(context.parameters)) {
      let matchResult;
      try {
        matchResult = await matchUser(context);
      } catch (error) {
        if (matchResult instanceof PixelError) {
          log(matchResult.message, true);
        }
      }
    }
    if (instanceOfDf(context.parameters)) {
      const currentAds = await fetchVast({
        url: context.parameters.vast_link,
        widthAndHeight: [context.attributes.width, context.attributes.height],
        corsMode: context.parameters.cors_mode
      });
      console.log(currentAds);
      const adSystem = typeof currentAds.ads.system === "object" ? (_a = currentAds.ads.system) == null ? void 0 : _a.value : currentAds.ads.system;
      if (currentAds.containVPAID && adSystem === DF_NETWORK_AD_SYSTEM) {
        log("Contain CUSTOM VPAID");
        context.parameters = currentAds.ads.creatives[0].adParameters;
        vpaidCounter += 1;
        await fetchCreativeDataWithMatch(context, {
          AdParameters: typeof context.parameters === "string" ? context.parameters : JSON.stringify(context.parameters)
        });
      }
      context.tracker = currentAds.tracker;
      context.ads = currentAds.ads;
      context.containVPAID = currentAds.containVPAID;
    }
  };
  const actionButton = true;
  const transparentClick = false;
  const fullScreenClick = false;
  const tel = false;
  const header = true;
  const progress = true;
  const volume = true;
  const playButton = true;
  const videoControls = true;
  const fullScreen = false;
  const jsonConfig = {
    actionButton,
    transparentClick,
    fullScreenClick,
    tel,
    header,
    progress,
    volume,
    playButton,
    videoControls,
    fullScreen
  };
  const updateVideoPlayerSize = (context) => () => {
    context.videoSlot.setAttribute("width", `${context.attributes.width}px`);
    context.videoSlot.setAttribute("height", `${context.attributes.height}px`);
  };
  const updateVideoSlot = (context) => () => {
    var _a, _b;
    if (context.videoSlot == null) {
      context.videoSlot = document.createElement("video");
      context.slot.appendChild(context.videoSlot);
    }
    context.videoSlot.muted = false;
    context.videoSlot.autoplay = true;
    context.videoSlot.playsInline = true;
    context.videoSlot.setAttribute("x-webkit-airplay", "allow");
    context.videoSlot.setAttribute("webkit-playsinline", "true");
    updateVideoPlayerSize(context)();
    if ((_a = context.parameters) == null ? void 0 : _a.videos) {
      const videos = context.parameters.videos;
      for (let i = 0; i < videos.length; i++) {
        if (context.videoSlot.canPlayType((_b = videos[i]) == null ? void 0 : _b.mimetype) != "") {
          context.videoSlot.setAttribute("src", videos[i].url);
          break;
        }
      }
    }
  };
  const setPresetUI = (ui) => {
    controlsStore.set({
      actionButton: !!ui,
      header: !!ui,
      fullScreenClick: !!ui
    });
  };
  const setTargetUI = (ui) => {
    controlsStore.set({
      actionButton: !!ui.actionButton,
      header: !!ui.header,
      fullScreenClick: !!ui.fullScreenClick,
      transparentClick: !!ui.transparentClick,
      skip: !!ui.skip,
      tel: ui.tel
    });
  };
  const setUI = (event) => {
    const ui = event.showUI;
    if (typeof ui === "boolean") {
      return setPresetUI(ui);
    }
    if (typeof ui === "object") {
      return setTargetUI(ui);
    }
  };
  const listenEvents = (opt) => {
    let isImpressed2 = false;
    const trackImpressedFn = () => {
      if (!isImpressed2) {
        isImpressed2 = true;
        track.trackImpression();
        send("AdImpression");
      }
    };
    const send = callEvent(opt.context);
    const track = opt.vastTracker;
    const events = {
      AdLoaded: () => {
        log("VPAID COOKIE AdLoaded, sending adUnit.startAd()");
        opt.adUnit.startAd();
        send("AdLoaded");
      },
      AdStarted: () => {
        trackImpressedFn();
        send("AdStarted");
      },
      AdVolumeChange: () => {
        log("VPAID AdVolumeChange");
        opt.video.addEventListener("volumechange", (e) => {
          track.setMuted(e.target.muted);
        });
        send("AdVolumeChange");
      },
      AdVideoStart: () => {
        log("VPAID AdVideoStart");
        trackImpressedFn();
      },
      AdPlaying: () => {
        log("VPAID COOKIE AdPlaying");
        try {
          opt.adUnit.setAdVolume(0);
        } catch (error) {
          if (error instanceof Error) {
            log(`Set volume error  - ${error}`, true);
          }
          log(`Set volume error - common`);
        }
        track.setPaused(false);
        send("AdPlaying");
      },
      AdError: (e) => {
        log("VPAID COOKIE AdErro");
        log(String(e), true);
        errorStore.set(new TerminateError(errorCodesVAST["VPAID AdError"]));
      },
      AdLog: (event) => {
        log(`VPAID COOKIE AdLog`);
        if (typeof event === "string") {
          log(event);
          return send("AdLog", event);
        }
        if (Object.prototype.hasOwnProperty.call(event, "showUI")) {
          setUI(event);
        }
      },
      AdImpression: () => {
        log("IMPRASSION VPAID COOKIE");
        isImpressed2 = true;
        track.trackImpression();
        send("AdImpression");
      },
      AdStopped: () => {
        log("VPAID COOKIE send STOPED");
        send("AdStopped");
      },
      AdVideoComplete: () => {
        log("VPAID COOKIE VIDEO COMPLETE");
        track.complete();
        send("AdVideoComplete");
      },
      AdUserClose: () => {
        log("VPAID COOKIE EVENT AdUserClose");
        track.complete();
        send("AdUserClose");
      },
      AdPaused: () => {
        log("VPAID COOKIE SEND AdPaused");
        track.setPaused(true);
        send("AdPaused");
      },
      AdClickThru: (url) => {
        log(`AdClickThru - ${url}`);
        track.click();
        send("AdClickThru");
      },
      AdVideoFirstQuartile: () => {
        log("VPAID COOKIE send AdVideoFirstQuartile");
        track.setProgress(25);
        send("AdVideoFirstQuartile");
      },
      AdVideoMidpoint: () => {
        log("VPAID COOKIE send AdVideoMidpoint");
        track.setProgress(50);
        send("AdVideoMidpoint");
      },
      AdVideoThirdQuartile: () => {
        log("VPAID COOKIE send AdVideoThirdQuartile");
        track.setProgress(75);
        send("AdVideoThirdQuartile");
      },
      AdSkipped: () => {
        log("VPAID COOKIE send AdSkipped");
        opt.context.skipAd();
        send("AdSkipped");
      }
    };
    return events;
  };
  function add_css(target) {
    append_styles(target, "svelte-192d6y3", ".iframe.svelte-192d6y3{border:0px;margin:0px;opacity:1;padding:0px;height:100%;position:relative;width:100%;top:0;left:0}");
  }
  function create_fragment(ctx) {
    let iframe;
    return {
      c() {
        iframe = element("iframe");
        attr(iframe, "sandbox", "allow-same-origin allow-scripts allow-popups");
        attr(iframe, "title", "vpaid");
        attr(iframe, "class", "iframe svelte-192d6y3");
      },
      m(target, anchor) {
        insert(target, iframe, anchor);
        ctx[2](iframe);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(iframe);
        ctx[2](null);
      }
    };
  }
  function instance($$self, $$props, $$invalidate) {
    let { param = {
      isMuted: false,
      currentAds: {},
      config: {},
      widthAndHeight: [0, 0],
      video: document.createElement("video"),
      wrapper: document.createElement("div"),
      container: document.createElement("div"),
      context: {}
    } } = $$props;
    let observerVpaidUnsubscribe = new Function();
    let iframeVpaid;
    let events;
    let adUnit;
    let eventName;
    function onLoad() {
      adUnit = iframeVpaid.contentWindow.getVPAIDAd();
      if (!checkSpec(adUnit)) {
        errorStore.set(new TerminateError(errorCodesVAST["VPAID is invalid"]));
      }
      adUnit.handshakeVersion("2.0");
      adUnit.initAd(
        param.widthAndHeight[0],
        param.widthAndHeight[0] * param.config.aspect_ratio,
        "normal",
        -1,
        {
          AdParameters: param.currentAds.ads.creatives[0].adParameters
        },
        {
          slot: param.wrapper,
          videoSlot: param.video,
          videoSlotCanAutoPlay: true
        }
      );
      observerVpaidUnsubscribe = watchForVpaidSize({
        container: param.wrapper,
        ASPECT_RATIO: param.config.aspect_ratio,
        adUnit
      });
      events = listenEvents({
        video: param.video,
        adUnit,
        vastTracker: param.currentAds.tracker,
        looped: param.config.looped,
        context: param.context
      });
      for (eventName in events) {
        adUnit.subscribe(events[eventName], eventName);
      }
      bindToVastActions(adUnit, param.currentAds.tracker);
    }
    onMount(() => {
      const cssId = "df-vpaid";
      const frameContext = iframeVpaid.contentWindow;
      frameContext === null || frameContext === void 0 ? void 0 : frameContext.document.write(createFrameScript(param.currentAds, cssId));
      const script = frameContext === null || frameContext === void 0 ? void 0 : frameContext.document.querySelector(`script`);
      script === null || script === void 0 ? void 0 : script.addEventListener("load", onLoad);
      script === null || script === void 0 ? void 0 : script.addEventListener("error", () => errorStore.set(new TerminateError(errorCodesVAST["Can't load VPAID"])));
      const is_safari = navigator.userAgent.indexOf("Safari") > -1;
      if (is_safari) {
        frameContext === null || frameContext === void 0 ? void 0 : frameContext.document.close();
      }
      errorStore.subscribe((errorInStore) => {
        var _a, _b;
        if (errorInStore === null) {
          return;
        }
        const errorCode = parseInt(String(errorInStore === null || errorInStore === void 0 ? void 0 : errorInStore.message)) > 900 ? errorInStore === null || errorInStore === void 0 ? void 0 : errorInStore.message : errorCodesVAST[errorInStore === null || errorInStore === void 0 ? void 0 : errorInStore.message] || "900";
        const trackError = () => {
          callEvent(param.context)("AdError", "vpaid error");
          param.currentAds.tracker.errorWithCode(errorCode, parseInt(errorCode) > 901 ? true : false);
        };
        if (errorInStore instanceof TerminateError) {
          log(errorInStore, true);
          log("TERMINATE PLAYER");
          trackError();
          try {
            (_b = (_a = param.wrapper) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(param.wrapper);
          } catch (removeChildError) {
            log(removeChildError, true);
          }
        }
      });
    });
    onDestroy(() => {
      log("unsubscribe from VPAID events");
      param.currentAds.tracker.close();
      for (eventName in events) {
        adUnit.unsubscribe(events[eventName], eventName);
      }
      observerVpaidUnsubscribe();
    });
    function iframe_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        iframeVpaid = $$value;
        $$invalidate(0, iframeVpaid);
      });
    }
    $$self.$$set = ($$props2) => {
      if ("param" in $$props2)
        $$invalidate(1, param = $$props2.param);
    };
    return [iframeVpaid, param, iframe_binding];
  }
  class Vpaid_svelte extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance, create_fragment, safe_not_equal, { param: 1 }, add_css);
    }
  }
  const VpaidSvelte = Vpaid_svelte;
  const initAds = (context) => {
    if (context.containVPAID) {
      log("DETECT VPAID");
      updateVideoSlot(context)();
      new VpaidSvelte({
        target: context.slot,
        props: {
          param: {
            isMuted: false,
            currentAds: {
              ads: context.ads,
              containVPAID: true,
              tracker: context.tracker,
              vastClient: context.vastClient
            },
            config: { aspect_ratio: 0.5625, looped: false },
            widthAndHeight: [context.attributes.width, context.attributes.height],
            video: context.videoSlot,
            wrapper: context.slot,
            container: context.slot,
            context
          }
        }
      });
    } else {
      log({
        ...jsonConfig,
        isMobile: !!checkIsMobile(),
        skip: getAdSkippableState(context)()
      });
      controlsStore.set({
        ...jsonConfig,
        isMobile: !!checkIsMobile(),
        skip: getAdSkippableState(context)()
      });
      if (context.ads.creatives) {
        context.parameters.videos = context.ads.creatives[0].mediaFiles.map((file) => ({
          mimetype: file.mimeType || "",
          url: file.fileURL || ""
        }));
      }
      updateVideoSlot(context)();
    }
    drawUi(context);
  };
  const onlyNumbersFromString = (str) => {
    return String(str).replace(/\D/g, "");
  };
  const removeAll = (context) => () => {
    setTimeout(() => {
      log("Remove all action");
      if (context.slot !== null) {
        context.slot.innerHTML = "";
      }
      context.isDestroyed = true;
    }, 75);
  };
  let isImpressed$1 = false;
  const subscribeToVideo = (context) => {
    const video = context.videoSlot;
    const send = callEvent(context);
    const pauseAction = () => {
      if (context.tracker)
        context.tracker.setPaused(true);
      send("AdPaused");
    };
    const endAction = () => {
      if (context.tracker)
        context.tracker.complete();
      setTimeout(() => {
        send("AdVideoComplete");
        removeAll(context)();
      }, 250);
    };
    const playAction = () => {
      if (context.tracker) {
        if (!isImpressed$1) {
          context.tracker.trackImpression();
          isImpressed$1 = true;
        }
        context.tracker.setPaused(false);
      }
      if (!isImpressed$1) {
        send("AdImpression");
      }
      send("AdPlaying");
    };
    const errorAction = (error) => {
      if (context.tracker) {
        if (error instanceof Error) {
          log(error.message, true);
        }
        const errorCode = parseInt(error == null ? void 0 : error.message) > 900 ? error == null ? void 0 : error.message : errorCodesVAST[error == null ? void 0 : error.message] || "900";
        context.tracker.errorWithCode(errorCode, parseInt(errorCode) > 901);
      }
      send("AdError", "video error");
      removeAll(context)();
    };
    const volumeAction = (e) => {
      const targetVideo = e.target;
      if (context.tracker) {
        context.tracker.setMuted(targetVideo.muted);
      }
      context.attributes.volume = targetVideo.volume;
      send("AdVolumeChange");
    };
    video.addEventListener("play", playAction);
    video.addEventListener("pause", pauseAction);
    video.addEventListener("ended", endAction);
    video.addEventListener("error", errorAction);
    video.addEventListener("volumechange", volumeAction);
    video.addEventListener("click", () => clickAction(context));
  };
  let isSetOnceActions = false;
  let durationSettled = false;
  let isImpressed = false;
  const timeUpdateHandler = (context) => () => {
    var _a, _b;
    if (!isImpressed) {
      (_a = context.tracker) == null ? void 0 : _a.trackImpression();
      isImpressed = true;
    }
    if (context.lastQuartileIndex >= context.quartileEvents.length) {
      return;
    }
    const video = context.videoSlot;
    currentTimeVPAID.set(video.currentTime);
    durationStore.set(
      isFinite(video.duration) && video.duration ? video.duration : 10
    );
    if (context.tracker) {
      context.tracker.setProgress(video.currentTime);
      if (!durationSettled && !Number.isNaN(video.duration)) {
        durationSettled = true;
        log(`ADS DURATION = ${video.duration}`);
        context.tracker.setDuration(video.duration);
      }
    }
    if (!isSetOnceActions) {
      isSetOnceActions = true;
      subscribeToVideo(context);
    }
    const percentPlayed = video.currentTime * 100 / video.duration;
    if (percentPlayed >= ((_b = context.quartileEvents[context.lastQuartileIndex]) == null ? void 0 : _b.value)) {
      const lastQuartileEvent = context.quartileEvents[context.lastQuartileIndex].event;
      log(`VPAID COOKIE TRACK ${lastQuartileEvent}`);
      const callback = context.eventsCallbacks[lastQuartileEvent];
      if (video.currentTime === video.duration && context.tracker) {
        context.tracker.complete();
      }
      if (typeof callback === "function") {
        callback();
      }
      context.lastQuartileIndex += 1;
    }
  };
  const collapseAd = (context) => () => {
    callEvent(context)("AdUserMinimize");
    openFullscreen(context.videoSlot);
    context.attributes.expanded = false;
  };
  const expandAd = (context) => () => {
    callEvent(context)("AdExpanded");
    context.attributes.expanded = true;
    openFullscreen(context.videoSlot);
  };
  const getAdAttribute = (context, attr2) => () => context.attributes[attr2];
  const handshakeVersion = (_version) => "2.0";
  const stopAd = (context) => () => {
    if (context.isDestroyed)
      return;
    const callback = callEvent(context);
    setTimeout(() => {
      callback("AdStopped");
      removeAll(context)();
    }, 250);
  };
  const initAd = (context) => async (width, height, viewMode, desiredBitrate, creativeData, environmentVars) => {
    context.attributes.width = width;
    context.attributes.height = height;
    context.attributes.viewMode = viewMode;
    context.attributes.desiredBitrate = desiredBitrate;
    if (!environmentVars) {
      callEvent(context)("AdError", "slot and videoSlot must be define");
      throw new Error("slot and videoSlot must be define");
    }
    context.slot = environmentVars.slot;
    context.videoSlot = environmentVars.videoSlot;
    if (creativeData) {
      try {
        await fetchCreativeDataWithMatch(context, creativeData);
        await initAds(context);
      } catch (error) {
        if (error instanceof Error) {
          log(error, true);
          callEvent(context)("AdError", error.message);
        } else {
          callEvent(context)("AdError", "fetch vast error");
        }
        removeAll(context)();
      }
    } else {
      log("Remove player");
      callEvent(context)("AdError", "no AdParameters");
      return removeAll(context)();
    }
    context.videoSlot.addEventListener(
      "timeupdate",
      timeUpdateHandler(context),
      false
    );
    const isMuted = context.videoSlot.muted;
    const targetVolume = context.videoSlot.volume || isMuted ? 0 : 0.75;
    volumeStore.set(isMuted ? 0 : targetVolume);
    context.videoSlot.addEventListener("ended", stopAd(context), false);
    callEvent(context)("AdLoaded");
  };
  const pauseAd = (context) => () => {
    context.videoSlot.pause();
    playStore.set(false);
    callEvent(context)("AdPaused");
  };
  const resizeAd = (context) => (width, height, viewMode) => {
    context.attributes.width = width;
    context.attributes.height = height;
    context.attributes.viewMode = viewMode;
    updateVideoPlayerSize(context)();
    callEvent(context)("AdSizeChange");
  };
  const resumeAd = (context) => () => {
    context.videoSlot.play().then(() => {
      callEvent(context)("AdResumed");
    }).catch((error) => console.log(error));
  };
  const setAdVolume = (context) => (value) => {
    context.videoSlot.volume = value;
    callEvent(context)("AdVolumeChange");
  };
  const skipAd = (context) => () => {
    if (context.isDestroyed)
      return;
    const { tracker } = context;
    if (tracker)
      tracker.skip();
    setTimeout(() => {
      callEvent(context)("AdSkipped");
      removeAll(context)();
    }, 250);
  };
  const startAd = (context) => () => {
    const video = context.videoSlot;
    log("startAd event");
    const isPlaying = !video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA;
    log(`isPlaying = ${isPlaying}`);
    if (!isPlaying) {
      context.videoSlot.play().then(() => {
        callEvent(context)("AdImpression");
        callEvent(context)("AdStarted");
        playStore.set(true);
      }).catch((error) => {
        var _a;
        context.videoSlot.muted = true;
        (_a = context.videoSlot) == null ? void 0 : _a.play();
        log(error, true);
      });
    } else {
      callEvent(context)("AdStarted");
    }
  };
  const subscribe = (context) => (aCallback, eventName, aContext) => {
    const callBack = aCallback.bind(aContext);
    context.eventsCallbacks[eventName] = callBack;
  };
  const unsubscribe = (context) => (eventName) => {
    context.eventsCallbacks[eventName] = () => void 0;
  };
  const getAdSkippableState = (context) => () => {
    var _a;
    return context.attributes.skippableState || Number((_a = context.ads.creatives[0]) == null ? void 0 : _a.skipDelay) > 0;
  };
  class VPAID {
    constructor() {
      this.slot = document.createElement("div");
      this.videoSlot = document.createElement("video");
      this.eventsCallbacks = {};
      this.ads = {};
      this.containVPAID = false;
      this.isDestroyed = false;
      this.attributes = {
        companions: "",
        desiredBitrate: 256,
        duration: 30,
        expanded: false,
        height: 0,
        icons: "",
        linear: true,
        remainingTime: 10,
        skippableState: false,
        viewMode: "normal",
        width: 0,
        volume: 1
      };
      this.quartileEvents = [
        { event: "AdVideoStart", value: 0 },
        { event: "AdVideoFirstQuartile", value: 25 },
        { event: "AdVideoMidpoint", value: 50 },
        { event: "AdVideoThirdQuartile", value: 75 },
        { event: "AdVideoComplete", value: 100 }
      ];
      this.lastQuartileIndex = 0;
      this.parameters = {
        overlay: "",
        videos: [{ url: "", mimetype: "" }],
        vast_link: ""
      };
      this.handshakeVersion = handshakeVersion;
      this.initAd = initAd(this);
      this.startAd = startAd(this);
      this.stopAd = stopAd(this);
      this.skipAd = skipAd(this);
      this.setAdVolume = setAdVolume(this);
      this.resizeAd = resizeAd(this);
      this.pauseAd = pauseAd(this);
      this.resumeAd = resumeAd(this);
      this.expandAd = expandAd(this);
      this.collapseAd = collapseAd(this);
      this.subscribe = subscribe(this);
      this.unsubscribe = unsubscribe(this);
      this.getAdVolume = getAdAttribute(this, "volume");
      this.getAdWidth = getAdAttribute(this, "width");
      this.getAdExpanded = getAdAttribute(this, "expanded");
      this.getAdSkippableState = getAdAttribute(this, "skippableState");
      this.getAdHeight = getAdAttribute(this, "height");
      this.getAdRemainingTime = getAdAttribute(this, "remainingTime");
      this.getAdDuration = getAdAttribute(this, "duration");
      this.getAdCompanions = getAdAttribute(this, "companions");
      this.getAdIcons = getAdAttribute(this, "icons");
      this.getAdLinear = getAdAttribute(this, "linear");
    }
  }
  window.getVPAIDAd = function() {
    return new VPAID();
  };
})();
