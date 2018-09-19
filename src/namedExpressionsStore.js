'use strict'

var getAllMatches = require("./util").getAllMatches;

function NamedExpressionsStore(){
    if(!(this instanceof NamedExpressionsStore)) return new NamedExpressionsStore();
    this.namedExpression = {};
}

NamedExpressionsStore.prototype.count = function(){
    return Object.keys(this.namedExpression).length;
}

/**
 * Adds named expression to a namedExpression object which can be used directly in params
 * @param {string | object} handledByArgumentsObject 
 */
NamedExpressionsStore.prototype.addNamedExpression = function () {

    var firstParam = arguments[0];
    if (typeof firstParam === "string" && typeof arguments[1] === "string") {
        this.namedExpression[firstParam] = arguments[1];
    } else if (typeof firstParam === "object" && Object.prototype.toString.call(firstParam) === "[object Object]") {
        for (var key in firstParam) {
            this.namedExpression[key] = firstParam[key];
        }
    } else {
        throw Error("Invalid method argument. Two parameters of type String or only object is expected.");
    }
}

/**
 * Replace named expressions with actual regular expressions
 * @param {string} url 
 */
NamedExpressionsStore.prototype.replaceNamedExpression= function (url) {
    //var namedExpressionRegexStr = "\\(:(.*?):\\)";
    var namedExpressionRegexStr = /\(:(.*?):\)/g;
    var namedExpressionMatches = getAllMatches(url, namedExpressionRegexStr);

    if (namedExpressionMatches && namedExpressionMatches.length > 0) {
        for (var i = 0; i < namedExpressionMatches.length; i++) {
            var matchedNamedKey = namedExpressionMatches[i][1];
            if (this.namedExpression[matchedNamedKey]) {
                url = url.replace(":" + matchedNamedKey + ":", this.namedExpression[matchedNamedKey]);
            } else {
                throw Error("Usage of named expression in url as " + matchedNamedKey + ". Define it using addNamedExpression method before using in URLs.");
            }
        }
    }

    return url;
}

module.exports = NamedExpressionsStore;