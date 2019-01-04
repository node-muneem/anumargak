'use strict';

var RandExp = require('randexp');

RandExp.prototype.randInt = (a, b) => {
    return a;
}

exports.doesMatch = function (a, b) {
    var a_IsRegex = a.indexOf("(") > 0;
    var b_IsRegex = b.indexOf("(") > 0;

    if (a_IsRegex && b_IsRegex) {
        //genetate random string for both regex and pass to the other regex

        var aRegex = new RegExp(a);
        var bRegex = new RegExp(b);

        var aRand = new RandExp(aRegex).gen();
        var bRand = new RandExp(bRegex).gen();

        if (aRand === bRand) {
            return true;
        } else {
            return exports.doesMatch(a, bRand) || exports.doesMatch(aRand, b);
        }

    } else if (!a_IsRegex && b_IsRegex) {
        return new RegExp(b).test(a);
    } else if (a_IsRegex && !b_IsRegex) {
        return new RegExp(a).test(b);
    } else /* if(a_IsRegex && b_IsRegex) */ {
        return a === b;
    }
}

exports.getFirstMatche = function (string, regex_str) {
    var regex = new RegExp(regex_str);
    return regex.exec(string);
}

exports.getAllMatches = function (string, regex_str) {
    //var regex = new RegExp(regex_str, "g");
    var regex = new RegExp(regex_str);
    return exports.getAllRegexMatches(string, regex);
}

exports.getAllRegexMatches = function (string, regex) {
    var matches = [];
    var match;
    while (match = regex.exec(string)) {
        var allmatches = [];
        for (var i in match) {
            var submatch = match[i];
            allmatches.push(submatch);
        }
        matches.push(allmatches);
    }
    return matches;
}

/* exports.urlSlice = function (url) {
    var index = url.indexOf("?");
    if (index > 0) return url.substr(0, index);
    var index = url.indexOf("#");
    if (index > 0) return url.substr(0, index);
    return url;
} */

exports.urlSlice = function (url, startIndex) {
    var result = {
        url : url
    };
    for (var i = startIndex, len = url.length; i < len; i++) {
        if ( url[i] === '?' || url[i] === ';') {
            var fragmentIndex = url.indexOf('#', i + 1);
            if (fragmentIndex < 0) {
                fragmentIndex = len;
            } else {
                result.hashStr = url.substring(fragmentIndex + 1);
            }
            result.url = url.substring(0, i);
            result.queryStr = url.substring(i + 1, fragmentIndex);
            break;
        } else if (url[i] === '#') {
            result.url = url.substring(0, i)
            result.hashStr = url.substring(i + 1);
            break;
        } 
    }
    return result;
}

//exports.urlSlice("/this/is/sample?q1=val&q2=val3#q2=val2&q3=val4");