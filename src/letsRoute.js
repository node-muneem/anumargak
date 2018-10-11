'use strict'

var getFirstMatche = require("./util").getFirstMatche;
var getAllMatches = require("./util").getAllMatches;
var doesMatch = require("./util").doesMatch;
var urlSlice = require("./util").urlSlice;
var namedExpressionsStore = require("./namedExpressionsStore");
var semverStore = require("./semver-store");
var processPathParameters = require("./../src/paramsProcessor");
var events = require('events');

var http = require('http')
var httpMethods = http.METHODS;

Anumargak.prototype.addNamedExpression = function (arg1, arg2) {
    this.namedExpressions.addNamedExpression(arg1, arg2);
}

const supportedEvents = [ "request", "found", "not found", "route", "default" ];

Anumargak.prototype._onEvent = function (eventName, fn) {
    let _name = eventName.toLowerCase();
    if(_name === "route"){
        _name = "found";
    }else if(_name === "default"){
        _name = "not found";
    }
    if( supportedEvents.indexOf(_name) === -1 ) throw Error(`Router: Unsupported event ${eventName}`);
    this.eventEmitter.on(_name, fn);
}

/**
 * Adds routes against the given method and URL
 * @param {string | array} method 
 * @param {string} url 
 * @param {function} fn 
 */
Anumargak.prototype.on = function (method, url, options, fn, extraData) {
    if (Array.isArray(url)) {
        for (var i = 0; i < url.length; i++) {
            this.on(method, url[i], options, fn, extraData);
        }
        return this;
    }

    if (typeof url === 'function') {
        this._onEvent(method, url);
        return this;
    } else if (typeof options === 'function' || Array.isArray(options)) {
        extraData = fn;
        fn = options;
        options = {};
    }

    if (typeof method === "string") {
        this._on(method, url, options, fn, extraData);
    } else if (Array.isArray(method)) {
        for (var i = 0; i < method.length; i++) {
            this._on(method[i], url, options, fn, extraData);
        }
    } else {
        throw Error("Invalid method argument. String or array is expected.");
    }
    
    return this;
}

var wildcardRegexStr = "\\/([^\\/:]*)\\*";
var enumRegexStr = ":([^\\/\\-\\(]+)-?(\\(([\\w\\|]+)\\))";



Anumargak.prototype._on = function (method, url, options, fn, extraData) {
    //validate for correct input
    if (httpMethods.indexOf(method) === -1) throw Error("Invalid method type " + method);

    url = this.normalizeUrl(url);
    this._addRoute(method, url, options, fn, extraData);
}

Anumargak.prototype.normalizeUrl = function (url) {
    //Normalize URL
    if (this.ignoreLeadingSlash) {
        if (url.startsWith("/") === false) {
            url = "/" + url;
        }
    }

    url = this.namedExpressions.replaceNamedExpression(url);

    var matches = getFirstMatche(url, wildcardRegexStr);
    if (matches) {
        url = url.substr(0, matches.index + 1) + matches[0].substr(1, matches[0].length - 2) +":*(.*)"
    }

    return url;
}

/*
paramas is useful in case of enum url where we know the parameter value in advance.
*/
Anumargak.prototype._addRoute = function (method, url, options, fn, extraData, params) {

    var done = this._checkForEnum(method, url, options, fn, extraData, params);
    if( done ) { //All the enumerated URLs are registered
        return;
    }else{
        if (url.indexOf(":") > 0) {//DYNAMIC
            this._addDynamic(method, url, options, fn, extraData, params);
        } else {//STATIC
            this._addStatic(method, url, options, fn, extraData, params);
        }
    }
}

/**
 * Check and register if given URL need enumerated params.
 * @param {string} method 
 * @param {string} url 
 * @param {object | function} options 
 * @param {function} fn 
 * @param {object} params 
 */
Anumargak.prototype._checkForEnum = function(method, url, options, fn, extraData, params){
    var matches = getFirstMatche(url, enumRegexStr);
    if (matches) {
        var name = matches[1];
        var pattern = matches[3];

        var arr = pattern.split("\|");
        for (var i = 0; i < arr.length; i++) {
            var newurl = url.replace(matches[0], arr[i]);
            if (params) {
                params = Object.assign({}, params);
                params[name] = arr[i];
            } else {
                params = {};
                params[name] = arr[i];
            }
            this.count--;
            this._addRoute(method, newurl, options, fn, extraData, params);
        }
        this.count++;
        return true;
    }
}

Anumargak.prototype._addStatic = function(method, url, options, fn, extraData, params){
    this.checkIfRegistered(this.staticRoutes, method, url, options, fn);

    this.count++;
    var routeHandlers = this.getRouteHandlers(this.staticRoutes[method][url], method, url, options, fn);
    this.staticRoutes[method][url] = { 
        fn : routeHandlers.handler,
        verMap: routeHandlers.verMap, 
        params: params,
        store: extraData
    };

    //this.staticRoutes[method][url] = { fn: fn, params: params };
    if (this.ignoreTrailingSlash) {
        if (url.endsWith("/")) {
            url = url.substr(0, url.length - 1);
        } else {
            url = url + "/";
        }
        
        var routeHandlers = this.getRouteHandlers(this.staticRoutes[method][url], method, url, options, fn);
        this.staticRoutes[method][url] = { 
            fn : routeHandlers.handler,
            verMap: routeHandlers.verMap, 
            params: params,
            store: extraData
        };

    }

}

Anumargak.prototype._addDynamic = function(method, url, options, fn, extraData, params){
    var normalizedUrl = this.normalizeDynamicUrl(url);
    url = normalizedUrl.url;
    
    this.checkIfRegistered(this.dynamicRoutes, method, url, options, fn);
    var routeHandlers = this.getRouteHandlers(this.dynamicRoutes[method][url], method, url, options, fn);
    
    var regex = new RegExp("^" + url + "$");
    this.dynamicRoutes[method][url] = { 
        fn: routeHandlers.handler,
        regex: regex, 
        verMap: routeHandlers.verMap, 
        params: params || {}, 
        paramNames: normalizedUrl.paramNames ,
        store: extraData
    };  
    this.count++;  
}

Anumargak.prototype.normalizeDynamicUrl = function (url) {
    var result = processPathParameters(url, this.allowUnsafeRegex);
    
    if ( this.ignoreTrailingSlash) {
        if (result.url.endsWith("/")) {
            result.url = result.url + "?";
        } else {
            result.url = result.url + "/?";
        }
    }

    return {
        paramNames : result.paramNames,
        url : result.url
    };
}

Anumargak.prototype.getRouteHandlers = function (route, method, url, options, fn) {
    if(options.version){
        var verMap, handler;
        if( route ){
            if( route.verMap ){
                verMap = route.verMap;
            }else{
                verMap = new semverStore();
            }
            if (route.fn){
                handler = route.fn;
            }
        }else{
            verMap = new semverStore();
        }
        verMap.set( options.version, fn );

        return { 
            handler: handler,
            verMap: verMap, 
        };    
    }else{
        return { 
            handler: fn
        };
    }
}

Anumargak.prototype.checkIfRegistered = function (arr, method, url, options, fn) {
    var result = this.isRegistered(arr, method, url);
    if (result) {
        if(options.version){//check if the version is same
            var route;
            if( this.dynamicRoutes[method][result] ){
                route = this.dynamicRoutes[method][result];
            }else {
                route = this.staticRoutes[method][result];
            }

            if(route.verMap && route.verMap.get( options.version )){
                throw Error(`Given route is matching with already registered route`);
            }
        }else{
            throw Error(`Given route is matching with already registered route`);
        }
    }
}

//var urlPartsRegex = new RegExp("(\\/\\(.*?\\)|\\/[^\\(\\)\\/]+)");
var urlPartsRegex = new RegExp(/(\/\(.*?\)|\/[^\(\)\/]+)/g);

Anumargak.prototype.isRegistered = function (arr, method, url) {
    if (arr[method][url]) {//exact route is already registered
        return url;
    } else {
        //check if tricky similar route is already registered
        //"/this/path/:is/dynamic"
        //"/this/:path/is/dynamic"
        var urls = Object.keys( arr[method] );
        //var givenUrlParts = getAllMatches(url, urlPartsRegex);
        var givenUrlParts = getAllMatches(url, urlPartsRegex);
        for (var u_i in urls) {//compare against all the registered URLs
            //var urlParts = getAllMatches(urls[u_i], urlPartsRegex);
            var urlParts = getAllMatches(urls[u_i], urlPartsRegex);
            if (urlParts.length !== givenUrlParts.length) {
                continue;
            } else {
                var matchUrl = true;
                for (var urlPart_i in urlParts) {
                    if (doesMatch(urlParts[urlPart_i][1], givenUrlParts[urlPart_i][1])) {
                        continue
                    } else {
                        matchUrl = false;
                        break;
                    }
                }
                if (matchUrl) {
                    return urls[u_i];
                }
            }
        }

        return false;
    }
}


Anumargak.prototype.quickFind = function (method, url, version) {
    url = urlSlice(url).url;
    var result = this.staticRoutes[method][url];
    if (result) {
        return {
            handler: this.getHandler(result, version),
            store : result.store
        }
    }else {
        var urlRegex = Object.keys(this.dynamicRoutes[method]);
        for (var i = 0; i < urlRegex.length; i++) {
            if (this.dynamicRoutes[method][urlRegex[i]].regex.exec(url)){
                var result = this.dynamicRoutes[method][ urlRegex[i] ];
                return {
                        handler: this.getHandler( result, version),
                        //params: result.params,
                        store:    result.store
                    }
            }
        }
    }
    return null;
}

Anumargak.prototype.lookup = async function (req, res) {
    this.eventEmitter.emit("request", req, res);
    var method = req.method;
    
    var version = req.headers['accept-version'];

    var result = this.find(method, req.url, version);
    req._path = {
        url : result.urlData.url,
        params : result.params,
    }; 
    req._queryStr = result.urlData.queryStr;
    req._hashStr = result.urlData.hashStr;

    if(result.handler){
        this.eventEmitter.emit("found", req, res);
        if(Array.isArray(result.handler) ){
            const len = result.handler.length;
            for(let i=0; i<len;i++){
                if( !res.finished ) {
                    await result.handler[i](req, res, result.store);
                }else{
                    break;
                }
            }
        }else{
            result.handler(req, res, result.store);
        }
        this.eventEmitter.emit("end", req, res);

    }else{
        this.eventEmitter.emit("not found", req, res);
        this.defaultFn(req, res);
    }
}

Anumargak.prototype.find = function (method, url, version) {
    const urlData = urlSlice(url);
    var result = this.staticRoutes[method][urlData.url];
    if (result) {
        return { 
            handler: this.getHandler(result, version), 
            params: result.params,
            store: result.store,
            urlData : urlData
        };
    }else {
        var urlRegex = Object.keys(this.dynamicRoutes[method]);
        for (var i = 0; i < urlRegex.length; i++) {
            var route = this.dynamicRoutes[method][urlRegex[i]];
            var matches = route.regex.exec(urlData.url);
            var params = route.params;
            if (matches) {
                for (var m_i = 1; m_i < matches.length; m_i++) {
                    params[route.paramNames[m_i - 1]] = matches[m_i];
                }

                var result = this.dynamicRoutes[method][urlRegex[i]];
                return { 
                    handler: this.getHandler(result, version),
                    params: params,
                    store: result.store,
                    urlData : urlData
                };
            }
        }
    }
    return {
        urlData : urlData
    };
}

Anumargak.prototype.getHandler = function (route, version) {
    if(version){
        return route.verMap.get(version);
    }else{
        return route.fn;
    }
}

Anumargak.prototype.off = function (method, url, version) {
    url = this.normalizeUrl(url);

    var done = this.removeEnum(method, url);
    if(done) return;

    var hasPathParam = url.indexOf(":");
    var result;
    if ( hasPathParam > -1) {//DYNAMIC
        url = this.normalizeDynamicUrl(url).url;
        result = this.isRegistered(this.dynamicRoutes, method, url);
    } else {//STATIC
        result = this.isRegistered(this.staticRoutes, method, url);
    }

    if (result) {
        if(version ){
            var route;
            if( this.dynamicRoutes[method][result] ){
                route = this.dynamicRoutes[method][result];
            }else {
                route = this.staticRoutes[method][result];
            }

            if(route.verMap && route.verMap.get( version )){
                var delCount = route.verMap.delete( version );
                this.count -= delCount;
            }
        }else{
            if( this.dynamicRoutes[method][result] ){
                if( this.dynamicRoutes[method][result].verMap ){
                    this.count -= this.dynamicRoutes[method][result].verMap.count();
                }
                delete this.dynamicRoutes[method][result];
                this.count--;
            }else {
                if( this.staticRoutes[method][result].verMap ){
                    this.count -= this.staticRoutes[method][result].verMap.count();
                }
                delete this.staticRoutes[method][result];
                this.count--;
            }
        }
    }

}

Anumargak.prototype.removeEnum = function(method, url){
    var matches = getFirstMatche(url, enumRegexStr);
    if (matches) {
        var name = matches[1];
        var pattern = matches[3];

        var arr = pattern.split("\|");
        for (var i = 0; i < arr.length; i++) {
            var newurl = url.replace(matches[0], arr[i]);
            this.off(method, newurl);
            this.count++;
        }
        this.count--;
        return true ;
    }
}

/* 
Anumargak.prototype.print = function(){
    var urlTree = {

    }

    for(var i=0; i < httpMethods.length; i++){
        this.staticRoutes [ httpMethods[i] ]
    }
}
 */

//register shorthand methods
for (var index in httpMethods) {
    const methodName = httpMethods[index];
    const methodNameInSmall = methodName.toLowerCase();
  
    Anumargak.prototype[methodNameInSmall] = function (url, options, fn, store) {
      return this.on(methodName, url, options, fn, store);
    }
}

Anumargak.prototype.all = function (url, options, fn, store) {
    this.on(httpMethods, url, options, fn, store);
}

function Anumargak(options) {
    if (!(this instanceof Anumargak)) return new Anumargak(options);

    options = options || {};
    this.count = 0;
    this.namedExpressions = namedExpressionsStore();
    this.eventEmitter = new events.EventEmitter();

    this.allowUnsafeRegex = options.allowUnsafeRegex || false;
    this.dynamicRoutes = {};
    this.staticRoutes = {};

    for (var index in http.METHODS) {
        const methodName = httpMethods[index];
        this.dynamicRoutes [ methodName ] = {};
        this.staticRoutes [ methodName ] = {};
    }
    
    if (options) {
        if (options.defaultRoute) {
            this.defaultFn = options.defaultRoute;
        }else{
            this.defaultFn = defaultRoute;
        }
        this.ignoreTrailingSlash = options.ignoreTrailingSlash || false;
        this.ignoreLeadingSlash = options.ignoreLeadingSlash || true;
        this.overwriteAllow = options.overwriteAllow || false;
    }

    
}

function defaultRoute(req, res) {
    res.statusCode = 404
    res.end()
}
module.exports = Anumargak;
