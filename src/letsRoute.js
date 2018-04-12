
var { getFirstMatche,getAllMatches, urlSlice} = require("./util");



var httpMethods = ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS", "PATCH", "TRACE", "CONNECT", "COPY", "LINK", "UNLINK", "PURGE", "LOCK", "UNLOCK", "PROPFIND", "VIEW"];

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
    if(httpMethods.indexOf(method) === -1) throw Error("Invalid method type "+method);
    if(this.find(method,url)){
        this.count --;
    }
    this.count +=1;
    this.__on(method,url,fn);
}

var paramRegexStr = ":([^\\/\\-\\(]+)-?(\\(.*?\\))?";
var enumRegexStr = ":([^\\/\\-\\(]+)-?(\\(([\\w\\|]+)\\))";

Anumargak.prototype.__on = function(method,url,fn,params){
    
    var matches = getFirstMatche(url,enumRegexStr);
    if(matches){
        var name = matches[1];
        var pattern = matches[3];

        var arr = pattern.split("\|");
        for(var i=0; i< arr.length; i++){
            var newurl = url.replace(matches[0],arr[i]);    
            if(params){
                params = Object.assign({},params);
                params[name] = arr[i];
            }else{
                params = {};
                params[name] = arr[i];
            }
            this.__on(method,newurl,fn,params);
        }
        return;
    }

    var matches = getAllMatches(url,paramRegexStr);
    if(matches.length > 0){//DYNAMIC
        var paramsArr = [];
        for(var i=0; i< matches.length; i++){
            var name = matches[i][1];
            var pattern = matches[i][2];

            paramsArr.push(name);
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
        this.dynamicRoutes[method][url] = { regex: regex, fn: fn, params: params || {}, paramsArr : paramsArr};
    }else{//STATIC
        this.staticRoutes[method][url] = { fn : fn, params: params };
        if(this.ignoreTrailingSlash){
            if(url.endsWith("/")){
                url = url.substr(0,url.length-1);
            }else{
                url = url + "/";
            }
            this.staticRoutes[method][url] = { fn : fn, params: params };
        }
    }
}

Anumargak.prototype.find = function(method,url){
    url = urlSlice(url);
    var result = this.staticRoutes[method][url];
    if(result) return result.fn;
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
    var result = this.staticRoutes[method][url];
    if(result) return { fn : result.fn, params: result.params };
    else{
        var urlRegex = Object.keys(this.dynamicRoutes[method]);
        for(var i = 0; i<urlRegex.length;i++){
            var route = this.dynamicRoutes[method][ urlRegex[i] ];
            var matches = route.regex.exec(url);
            var params = route.params;
            if(matches){
                for(var m_i=1; m_i< matches.length; m_i++){
                    params[ route.paramsArr[m_i-1] ] = matches[m_i] ;
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