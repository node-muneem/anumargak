
var { getFirstMatche, getAllMatches, doesMatch, urlSlice } = require("./util");
var namedExpressionsStore = require("./namedExpressionsStore");

var httpMethods = ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS", "PATCH", "TRACE", "CONNECT", "COPY", "LINK", "UNLINK", "PURGE", "LOCK", "UNLOCK", "PROPFIND", "VIEW"];


Anumargak.prototype.addNamedExpression = function (arg1, arg2) {
    this.namedExpressions.addNamedExpression(arg1, arg2);
}

/**
 * Adds routes against the given method and URL
 * @param {string} method 
 * @param {string} url 
 * @param {function} fn 
 */
Anumargak.prototype.on = function (method, url, fn) {

    if (typeof method === "string") {
        this._on(method, url, fn);
    } else if (Array.isArray(method)) {
        for (var i = 0; i < method.length; i++) {
            this._on(method[i], url, fn);
        }
    } else {
        throw Error("Invalid method argument. String or array is expected.");
    }
}

var wildcardRegexStr = "\\/([^\\/:]*)\\*";
var paramRegexStr = ":([^\\/\\-\\(]+)-?(\\(.*?\\))?";
var enumRegexStr = ":([^\\/\\-\\(]+)-?(\\(([\\w\\|]+)\\))";


Anumargak.prototype._on = function (method, url, fn) {
    if (httpMethods.indexOf(method) === -1) throw Error("Invalid method type " + method);
    this.count += 1;

    if (this.ignoreLeadingSlash) {
        if (url.startsWith("/") === false) {
            url = "/" + url;
        }
    }

    url = this.namedExpressions.replaceNamedExpression(url);

    var matches = getFirstMatche(url, wildcardRegexStr);
    if (matches) {
        url = url.substr(0, matches.index + 1) + ":*(" + matches[0].substr(1, matches[0].length - 2) + ".*)"
    }

    this.__on(method, url, fn);
}

/*
paramas is useful in case of enum url where we know the parameter value in advance.
*/
Anumargak.prototype.__on = function (method, url, fn, params) {

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
            this.__on(method, newurl, fn, params);
        }
        return;
    }

    var matches = getAllMatches(url, paramRegexStr);
    if (matches.length > 0) {//DYNAMIC
        var paramsArr = [];
        for (var i = 0; i < matches.length; i++) {
            var name = matches[i][1];
            var pattern = matches[i][2];

            paramsArr.push(name);
            if (pattern) {
                if (name === "*" && pattern !== "(.*)") {
                    var breakIndex = pattern.indexOf(".*");
                    url = url.replace(matches[i][0], pattern.substr(1, breakIndex - 1) + "(.*)");
                } else {
                    url = url.replace(matches[i][0], pattern);
                }
            } else {
                url = url.replace(matches[i][0], "([^\\/]+)");
            }
            if (this.ignoreTrailingSlash) {
                if (url.endsWith("/")) {
                    url = url + "?";
                } else {
                    url = url + "/?";
                }
            }
        }
        var regex = new RegExp("^" + url + "$");
        this.checkIffRegistered(this.dynamicRoutes, method, url);
        this.dynamicRoutes[method][url] = { regex: regex, fn: fn, params: params || {}, paramsArr: paramsArr };
    } else {//STATIC
        this.checkIffRegistered(this.staticRoutes, method, url);
        this.staticRoutes[method][url] = { fn: fn, params: params };
        if (this.ignoreTrailingSlash) {
            if (url.endsWith("/")) {
                url = url.substr(0, url.length - 1);
            } else {
                url = url + "/";
            }
            this.staticRoutes[method][url] = { fn: fn, params: params };
        }
    }
}


Anumargak.prototype.checkIffRegistered = function (arr, method, url) {
    var result = this.isRegistered(arr, method, url);
    if (result) {
        if (!this.overwriteAllow) {
            throw Error(`Given route is matching with already registered route`);
        } else {
            //in case of dynamic URL previous URL must be deleted
            if (this.dynamicRoutes[method][result]) {
                delete this.dynamicRoutes[method][result];
            }
            this.count--;
        }
    } else {
        //don't do anything  
    }

}

var urlPartsRegex = new RegExp("(\\/\\(.*?\\)|\\/[^\\(\\)\\/]+)");

Anumargak.prototype.isRegistered = function (arr, method, url) {
    if (arr[method][url]) {//exact route is already registered
        return url;
    } else {
        //check if tricky similar route is already registered
        //"/this/path/:is/dynamic"
        //"/this/:path/is/dynamic"
        var urls = Object.keys(arr[method]);
        var givenUrlParts = getAllMatches(url, urlPartsRegex);
        for (var u_i in urls) {//compare against all the registered URLs
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


Anumargak.prototype.find = function (method, url) {
    url = urlSlice(url);
    var result = this.staticRoutes[method][url];
    if (result) return result.fn;
    else {
        var urlRegex = Object.keys(this.dynamicRoutes[method]);
        for (var i = 0; i < urlRegex.length; i++) {
            if (this.dynamicRoutes[method][urlRegex[i]].regex.exec(url))
                return this.dynamicRoutes[method][urlRegex[i]].fn;
        }
    }
    return this.defaultFn;
}


Anumargak.prototype.lookup = function (req, res) {
    var method = req.method;
    var url = urlSlice(req.url);

    var result = this._lookup(url, method);
    result.fn(req, res, result.params);
}

Anumargak.prototype._lookup = function (url, method) {
    var result = this.staticRoutes[method][url];
    if (result) return { fn: result.fn, params: result.params };
    else {
        var urlRegex = Object.keys(this.dynamicRoutes[method]);
        for (var i = 0; i < urlRegex.length; i++) {
            var route = this.dynamicRoutes[method][urlRegex[i]];
            var matches = route.regex.exec(url);
            var params = route.params;
            if (matches) {
                for (var m_i = 1; m_i < matches.length; m_i++) {
                    params[route.paramsArr[m_i - 1]] = matches[m_i];
                }
                return { fn: this.dynamicRoutes[method][urlRegex[i]].fn, params: params };
            }
        }
    }
    return { fn: this.defaultFn };
}

/**
 * Adds routes for GET method and URL
 * @param {string} url 
 * @param {function} fn 
 */
Anumargak.prototype.get = function (url, fn) {
    this.on("GET", url, fn);
}
/**
 * Adds routes for HEAD method and URL
 * @param {string} url 
 * @param {function} fn 
 */
Anumargak.prototype.head = function (url, fn) {
    this.on("HEAD", url, fn);
}
/**
 * Adds routes for PUT method and URL
 * @param {string} url 
 * @param {function} fn 
 */
Anumargak.prototype.put = function (url, fn) {
    this.on("PUT", url, fn);
}
/**
 * Adds routes for POST method and URL
 * @param {string} url 
 * @param {function} fn 
 */
Anumargak.prototype.post = function (url, fn) {
    this.on("POST", url, fn);
}
/**
 * Adds routes for DELETE method and URL
 * @param {string} url 
 * @param {function} fn 
 */
Anumargak.prototype.delete = function (url, fn) {
    this.on("DELETE", url, fn);
}

function Anumargak(options) {
    if (!(this instanceof Anumargak)) return new Anumargak(options);
    this.count = 0;
    this.namedExpressions = namedExpressionsStore();
    this.dynamicRoutes = {
        GET: {},
        HEAD: {},
        PUT: {},
        POST: {},
        DELETE: {},
        OPTIONS: {},
        PATCH: {},
        TRACE: {},
        CONNECT: {},
        COPY: {},
        LINK: {},
        UNLINK: {},
        PURGE: {},
        LOCK: {},
        UNLOCK: {},
        PROPFIND: {},
        VIEW: {}
    }

    this.staticRoutes = {
        GET: {},
        HEAD: {},
        PUT: {},
        POST: {},
        DELETE: {},
        OPTIONS: {},
        PATCH: {},
        TRACE: {},
        CONNECT: {},
        COPY: {},
        LINK: {},
        UNLINK: {},
        PURGE: {},
        LOCK: {},
        UNLOCK: {},
        PROPFIND: {},
        VIEW: {}
    }

    if (options) {
        if (options.defaultRoute) {
            this.defaultFn = options.defaultRoute;
        }
        this.ignoreTrailingSlash = options.ignoreTrailingSlash || false;
        this.ignoreLeadingSlash = options.ignoreLeadingSlash || true;
        this.overwriteAllow = options.overwriteAllow || false;
    }
}

module.exports = Anumargak;