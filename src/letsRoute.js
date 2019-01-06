'use strict'

const getFirstMatche = require("./util").getFirstMatche;
const getAllMatches = require("./util").getAllMatches;
const doesPatternMatch = require("./util").doesMatch;
const {urlSlice, urlBreak, breakUrlInPartsObject, breakInUrlParts} = require("./util");
const namedExpressionsStore = require("./namedExpressionsStore");
const semverStore = require("./semver-store");
const { processPathParameters, processPathParameter} = require("./../src/paramsProcessor");
const events = require('events');

const http = require('http')
const httpMethods = http.METHODS;

Anumargak.prototype.addNamedExpression = function (arg1, arg2) {
    this.namedExpressions.addNamedExpression(arg1, arg2);
}

const supportedEvents = [ "request", "found", "not found", "route", "default" , "end"];

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
        if( method.toLocaleLowerCase() === 'all'){
            this.all(url, options, fn, extraData);
        }else{
            this._on(method, url, options, fn, extraData);
        }
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

    //check for wild-char
    const wildCharIndex = url.indexOf('*');
    if( wildCharIndex !== -1){
        url = url.substring(0, wildCharIndex+1);
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
        if (url.indexOf(":") === -1 && url.indexOf("*") === -1) {//STATIC
            this._addStatic(method, url, options, fn, extraData, params);
        } else {//DYNAMIC
            this._addDynamic(method, url, options, fn, extraData, params);
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
    
    this.__addStatic(method, url, options, fn, extraData, params);
    this._setMinUrlLength( url.length );
    this.count++;
    if (this.ignoreTrailingSlash) {
        if (url.endsWith("/")) {
            url = url.substr(0, url.length - 1);
        } else {
            url = url + "/";
        }
        this.__addStatic(method, url, options, fn, extraData, params);
    }

}

Anumargak.prototype.__addStatic = function(method, url, options, fn, extraData, params){
    const node = this.staticRoutes[method];
    const data = {
        handler: fn,
        extraData: extraData
    }

    if( node[url] ){ //matching route
        if(options.version){
            if(node[url].verMap){
                if(node[url].verMap.get(options.version)){
                    throw Error(`Trying to register a duplicate route: ${url}, ${options.version}`);
                }else{
                    node[url].verMap.set( options.version, data );    
                }
            }else{
                node[url].verMap = new semverStore();
                node[url].verMap.set( options.version, data );
            }
        }else{
            throw Error(`Trying to register a duplicate route: ${url}`);
        }
    }else{
        node[url] = {
            data : data
        }
    }
    node[url].params = params;
}

Anumargak.prototype._addDynamic = function(method, url, options, fn, extraData, params){
    const data = {
        handler: fn,
        extraData: extraData
    };

    let indexOfFirstPathParam = url.indexOf(":");
    if( indexOfFirstPathParam === -1){ // wildcard without param
        indexOfFirstPathParam = url.indexOf("*");
    }
    this._setMinUrlLength( indexOfFirstPathParam );

    const spilitedUrl = breakInUrlParts(url);
    let node = this.dynamicRoutes[method]; //root node
    let pathIndex = 0;
    //if( spilitedUrl[0] === "") pathIndex = 1;

    let matchingPath = true;
    for(; pathIndex < spilitedUrl.length; pathIndex++ ){
        const urlPart = spilitedUrl[pathIndex];
        const wildCardIndex = urlPart.indexOf("*");
        let currentNode;
        if( wildCardIndex !== -1){//wildchar
            if( node[urlPart] 
                || (urlPart === "/*" && ( node.next || Object.keys(node).length > 0)  ) //it'll override all the paths of this depth
            ){ 
                break;
            }else{
                //it is hard to find similar pattern so allow registration
                node[urlPart] = {
                    startsWith: urlPart.substr(0, wildCardIndex)
                }
                node = node[urlPart];
                matchingPath = false;
            }
            break;
        }else if( urlPart[1] === ":"){//dynamic pattern
            const pathParams = processPathParameter( urlPart, this.allowUnsafeRegex );
            
            if( node[ pathParams.pattern ] ) { //exact match present
                currentNode = node[ pathParams.pattern ]
            }else{ //similar pattern
                const patternKeys =  Object.keys(node);
                for( let k_i = 0; k_i < patternKeys.length; k_i++) {
                    const savedPattern = patternKeys[k_i];
                    if( doesPatternMatch(savedPattern, pathParams.pattern) ){
                        currentNode = node[ savedPattern ];
                        
                    }
                }
            }
            if( !currentNode) {
                node[pathParams.pattern] = {};
                currentNode = node[pathParams.pattern];
                currentNode.regex = new RegExp(`^${pathParams.pattern}$`);
                currentNode.pattern = pathParams.pattern;
                currentNode.paramNames = pathParams.paramNames;
                matchingPath = false;
            }
        }else{//fixed
            if( !node[ urlPart] ) {
                node[ urlPart] = {};
                currentNode = node[urlPart]; 
                matchingPath = false;  
            }else{
                currentNode = node[ urlPart ];
            }
        }

        //move next
        if( pathIndex + 1  !== spilitedUrl.length){
            if( !currentNode.next ) currentNode.next = {};
            node = currentNode.next;
        }else{
            node = currentNode;
            break;
        }
    }

    if( matchingPath ){ //duplicate path
        if(options.version){
            if(node.verMap){
                if(node.verMap.get(options.version)){
                    throw Error(`Trying to register a duplicate route: ${url}, ${options.version}`);
                }else{
                    node.verMap.set( options.version, data );    
                }
            }else{
                node.verMap = new semverStore();
                node.verMap.set( options.version, data );
            }
        }else{
            throw Error(`Trying to register a duplicate route: ${url}`);
        }
    }else{
        if(options.version){
            node.verMap = new semverStore();
            node.verMap.set( options.version, data );
        }else{
            node.data = data;
        }
    }

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

Anumargak.prototype.getRouteHandlers = function (route, version, fn) {
    if(version){
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
        verMap.set( version, fn );

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
                    if (doesPatternMatch(urlParts[urlPart_i][1], givenUrlParts[urlPart_i][1])) {
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


Anumargak.prototype.quickFind = function (req, res) {
    const method = req.method;
    const version = req.headers['accept-version'];

    const url = urlSlice(req.url, this.minUrlLength);//remove query & hash string

    let result = this.staticRoutes[method][url];
    if (result) {
        return this.buildQuickResponse(result, version);
    }else {
        const spilitedUrl = breakUrlInPartsObject(url);
        let node = this.dynamicRoutes[method]; //root node
        let pathIndex = 0;

        for(; pathIndex < spilitedUrl.length; pathIndex++ ){
            const urlPart = spilitedUrl[pathIndex].val;

            if( node[ urlPart ] ){
                if( node [urlPart].next )
                    node = node [urlPart].next;
                else{
                    node = node [urlPart]
                    break;
                }
            }else{ // dymapic path param
                const patternKeys =  Object.keys(node);
                for( let k_i = 0; k_i < patternKeys.length; k_i++) {
                    const savedPattern = node[ patternKeys[k_i] ];
                    if(savedPattern.startsWith) {//wildchar
                        if(urlPart.startsWith (savedPattern.startsWith) ){//wildcard
                            return this.buildQuickResponse(savedPattern, version);
                        }
                    }else{
                        const matches = savedPattern.regex.test( urlPart)
                        if( matches ){
                            if( savedPattern.next )
                                node = savedPattern.next;
                            else{
                                node = savedPattern
                            }
                            break;
                        }
                    }
                }
            }
        }

        return this.buildQuickResponse(node, version);
    }
}

Anumargak.prototype.buildQuickResponse = function(node, version){
    const data = this.getHandler( node, version);

    if( !data ) return null;
    else{
        return {
            handler: data.handler,
            store : data.store
        }
    }
}

Anumargak.prototype.lookup = async function (req, res) {
    this.eventEmitter.emit("request", req, res); //unnecessary
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
        this.eventEmitter.emit("found", req, res); //unnecessary
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
        
        this.eventEmitter.emit("end", req, res); //unnecessary

    }else{
        this.eventEmitter.emit("not found", req, res); //unnecessary
        this.defaultFn(req, res);
    }
}

Anumargak.prototype.find = function (method, url, version) {

    const urlData = urlBreak(url, this.minUrlLength);//extract query & hash string

    let result = this.staticRoutes[method][urlData.url];
    if (result) {
        return this.buildResponse(result, version, urlData, result.params);
    }else {
        const spilitedUrl = breakUrlInPartsObject(urlData.url);
        let node = this.dynamicRoutes[method]; //root node
        let pathIndex = 0;
        const params = {};
        for(; pathIndex < spilitedUrl.length; pathIndex++ ){
            const urlPart = spilitedUrl[pathIndex].val;

            if( node[ urlPart ] ){
                if( node [urlPart].next )
                    node = node [urlPart].next;
                else{
                    node = node [urlPart]
                    break;
                }
            }else{ // dymapic path param
                const patternKeys =  Object.keys(node);
                for( let k_i = 0; k_i < patternKeys.length; k_i++) {
                    const savedPattern = node[ patternKeys[k_i] ];
                    if(savedPattern.startsWith) {//wildchar
                        if(urlPart.startsWith (savedPattern.startsWith) ){//wildcard
                            params["*"] = urlData.url.substring( savedPattern.startsWith);
                            return this.buildResponse(savedPattern, version, urlData, params);
                        }
                    }else{//dynamic pattern
                        const matches = savedPattern.regex.exec( urlPart);
                        if( matches ){
                            for (var m_i = 1; m_i < matches.length; m_i++) {
                                params[ savedPattern.paramNames[m_i - 1] ] = matches[m_i];
                            }
                            if( savedPattern.next )
                                node = savedPattern.next;
                            else{
                                node = savedPattern
                            }
                            break;
                        }
                    }
                }
            }
        }

        return this.buildResponse(node, version, urlData, params);
    }
}

Anumargak.prototype.buildResponse = function(node, version, urlData, params){
    const data = this.getHandler( node, version);

    if( !data ) {
        return {
            urlData : urlData
        }
    }else{
        return {
            handler: data.handler,
            store : data.extraData,
            params: params,
            urlData : urlData
        }
    }
}

Anumargak.prototype.findOld = function (method, url, version) {
    const urlData = urlBreak(url, this.minUrlLength);
    let result = this.staticRoutes[method][urlData.url];
    if (result) {
        const handler = this.getHandler(result, version);
        if( !handler ) {
            return {
                urlData : urlData
            };
        }else{
            return { 
                handler: handler,
                params: result.params,
                store: result.store,
                urlData : urlData
            };
        }

    }else {
        var urlRegex = Object.keys(this.dynamicRoutes[method]);
        for (var i = 0; i < urlRegex.length; i++) {
            var route = this.dynamicRoutes[method][urlRegex[i]];
            var matches = route.regex.exec( urlData.url );
            var params = route.params;
            if (matches) {
                const handler = this.getHandler(node, version);
                if( !handler ) {
                    return {
                        urlData : urlData
                    };
                }else{
                    for (var m_i = 1; m_i < matches.length; m_i++) {
                        params[route.paramNames[m_i - 1]] = matches[m_i];
                    }
                    return { 
                        handler: handler,
                        params: params,
                        store: route.store,
                        urlData : urlData
                    };
                }
            }
        }
    }
    return {
        urlData : urlData
    };
}

Anumargak.prototype.getHandler = function (route, version) {
    if(version){
        if( !route.verMap ) return;
        return route.verMap.get(version);
    }else{
        return route.data;
    }
}

Anumargak.prototype.off = function (method, url, version, silence) {
    url = this.normalizeUrl(url);

    var done = this.removeEnum(method, url);
    if(done) return;

    var result;
    let notFound = false;
    if (url.indexOf(":") === -1 && url.indexOf("*") === -1) {//STATIC
        const result = this.staticRoutes[method][url];
        if(result){
            if(version ){
                if(route.verMap && route.verMap.get( version )){
                    var delCount = route.verMap.delete( version );
                    this.count -= delCount;
                }else{
                    notFound = true;
                }
            }else{
                delete result.data;
                this.count--;
            }
        }else{
            notFound = true;
        }
    } else {//DYNAMIC
        const spilitedUrl = breakUrlInPartsObject(urlData.url);
        let node = this.dynamicRoutes[method]; //root node
        let pathIndex = 0;
        const params = {};
        for(; pathIndex < spilitedUrl.length; pathIndex++ ){
            const urlPart = spilitedUrl[pathIndex].val;

            if( node[ urlPart ] ){
                if( node [urlPart].next )
                    node = node [urlPart].next;
                else{
                    node = node [urlPart]
                    break;
                }
                if(node.startsWith){//wildchar
                    break;
                }
            }else if( node['*'] ){
                const data = this.getHandler(node['*'], version);
                if( !data ) {
                    return {
                        urlData : urlData
                    }
                }else{
                    return {
                        handler: data.handler,
                        store : data.extraData,
                        params: {
                            "*" : urlData.url.substring( node['*'].startsWith)
                        },
                        urlData : urlData
                    }
                }

            }else{ // dymapic path param
                const patternKeys =  Object.keys(node);
                for( let k_i = 0; k_i < patternKeys.length; k_i++) {
                    const savedPattern = node[ patternKeys[k_i] ];
                    const matches = savedPattern.regex.exec( urlPart);
                    if( matches ){
                        for (var m_i = 1; m_i < matches.length; m_i++) {
                            params[ savedPattern.paramNames[m_i - 1] ] = matches[m_i];
                        }
                        if( savedPattern.next )
                            node = savedPattern.next;
                        else{
                            node = savedPattern
                        }
                        break;
                    }
                }
            }
        }

        const data = this.getHandler( node, version);

        if( !data ) {
            return {
                urlData : urlData
            }
        }else{
            return {
                handler: data.handler,
                store : data.extraData,
                params: params,
                urlData : urlData
            }
        }
    }

    if(!silence && notFound) throw Error("Route you're trying to remove doesn't exist:");

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

Anumargak.prototype._setMinUrlLength =  function (num){
    if( num > 0 && num < this.minUrlLength) this.minUrlLength = num;
}

function Anumargak(options) {
    if (!(this instanceof Anumargak)) return new Anumargak(options);

    options = options || {};
    this.count = 0;
    this.minUrlLength = 0;
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
