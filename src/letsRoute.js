
var { getAllMatches, urlSlice} = require("./util");

var paramRegexStr = ":([^\\/\\-\\(]+)-?(\\(.*?\\))?";

var methods = ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS", "PATCH", "TRACE", "CONNECT"];

/**
 * Adds routes against the given method and URL
 * @param {string} method 
 * @param {string} url 
 * @param {function} fn 
 */
Rasta.prototype.on = function(method,url,fn){
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

Rasta.prototype._on = function(method,url,fn){
    if(methods.indexOf(method) === -1) throw Error("Invalid method type "+method);
    var matches = getAllMatches(url,paramRegexStr);
    if(matches.length > 0){
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
        }
        var regex = new RegExp("^"+url+"$");
        this.dynamicRoutes[method][url] = { regex: regex, fn: fn, params: params};
    }else{
        this.staticRoutes[method][url] = fn;
    }
}

Rasta.prototype.find = function(method,url){
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


Rasta.prototype.lookup = function(req,res){
    var method = req.method;
    var url = urlSlice(req.url);

    var fn = this.staticRoutes[method][url];
    if(fn) return fn(req,res);
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
                return this.dynamicRoutes[method][ urlRegex[i] ].fn (req,res,params);
            }
        }
    }
    return this.defaultFn(req,res);
}

function Rasta(options){
    if(!(this instanceof Rasta )) return new Rasta(options);
    
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

    if(options && options.defaultRoute){
        this.defaultFn = options.defaultRoute;
    }
}

module.exports = Rasta;