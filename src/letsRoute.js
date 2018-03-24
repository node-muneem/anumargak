
var { getAllMatches, urlSlice} = require("./util");

var paramRegexStr = ":([^\\/\\-\\(]+)-?(\\(.*?\\))?";

var methods = ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS", "PATCH", "TRACE", "CONNECT"];

/**
 * Adds routes against the given method and URL
 * @param {string} method 
 * @param {string} url 
 * @param {function} fn 
 */
Anumargak.prototype.on = function(method,url,fn){
    if(typeof method === "string"){
        this._on(method,url,fn);
    }else if(Array.isArray(method)){
        for(var i=0;i<method.length;i++){
            this._on(method[i],url,fn);
        }
    }else{
        throw Error("Invalid method argument. String or array is expected.");
    }
}

Anumargak.prototype._on = function(method,url,fn){
    if(methods.indexOf(method) === -1) throw Error("Invalid method type "+method);
    var matches = getAllMatches(url,paramRegexStr);
    if(matches.length > 0){
        this.count +=1;
        var params = [];
        for(var i=0; i< matches.length; i++){
            var name = matches[i][1];
            var pattern = matches[i][2];
            params.push(name);
            if(pattern){
                url = url.replace(matches[i][0],pattern);
            }else{
                url = url.replace(matches[i][0],"([^\\/]+)");
            }
            if(this.ignoreTrailingSlash){
                if(url.endsWith("/")){
                    url = url + "?";
                }else{
                    url = url + "/?";
                }
            }
        }
        var regex = new RegExp("^"+url+"$");
        this.dynamicRoutes[method][url] = { regex: regex, fn: fn, params: params};
    }else{
        this.count +=1;
        this.staticRoutes[method][url] = fn;
        if(this.ignoreTrailingSlash){
            if(url.endsWith("/")){
                url = url.substr(0,url.length-1);
            }else{
                url = url + "/";
            }
            this.staticRoutes[method][url] = fn;
        }
    }
}

Anumargak.prototype.find = function(method,url){
    url = urlSlice(url);
    var fn = this.staticRoutes[method][url];
    if(fn) return fn;
    else{
        var urlRegex = Object.keys(this.dynamicRoutes[method]);
        for(var i = 0; i<urlRegex.length;i++){
            if(this.dynamicRoutes[method][ urlRegex[i] ].regex.exec(url) ) 
                return this.dynamicRoutes[method][ urlRegex[i] ].fn;
        }
    }
    return this.defaultFn;
}


Anumargak.prototype.lookup = function(req,res){
    var method = req.method;
    var url = urlSlice(req.url);
    
    var result = this._lookup(url,method);
    result.fn(req,res,result.params);
}

Anumargak.prototype._lookup = function(url,method){
    var fn = this.staticRoutes[method][url];
    if(fn) return { fn : fn };
    else{
        var urlRegex = Object.keys(this.dynamicRoutes[method]);
        for(var i = 0; i<urlRegex.length;i++){
            var route = this.dynamicRoutes[method][ urlRegex[i] ];
            var matches = route.regex.exec(url);
            var params = {};
            if(matches){
                for(var m_i=1; m_i< matches.length; m_i++){
                    params[ route.params[m_i-1] ] = matches[m_i] ;
                }
                return { fn: this.dynamicRoutes[method][ urlRegex[i] ].fn , params : params};
            }
        }
    }
    return { fn : this.defaultFn };
}

function Anumargak(options){
    if(!(this instanceof Anumargak )) return new Anumargak(options);
    this.count = 0;
    this.dynamicRoutes = {
        GET : {},
        HEAD : {},
        PUT : {},
        POST : {},
        DELETE : {},
        OPTIONS : {},
        PATCH : {},
        TRACK : {},
        CONNECT : {}
    }

    this.staticRoutes = {
        GET : {},
        HEAD : {},
        PUT : {},
        POST : {},
        DELETE : {},
        OPTIONS : {},
        PATCH : {},
        TRACK : {},
        CONNECT : {}
    }

    if(options){
        if(options.defaultRoute){
            this.defaultFn = options.defaultRoute;
        }
        this.ignoreTrailingSlash = options.ignoreTrailingSlash || false;
    }
}

module.exports = Anumargak;