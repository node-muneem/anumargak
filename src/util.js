exports.getFirstMatche = function(string, regex_str) {
    var regex = new RegExp(regex_str);
    return regex.exec(string);
}

exports.getAllMatches = function(string, regex_str) {
    var regex = new RegExp(regex_str,"g");
    return exports.getAllRegexMatches(string,regex);
}

exports.getAllRegexMatches = function(string, regex) {
    var matches = [];
    var match;
    while (match = regex.exec(string)) {
        var allmatches = [];
        for(var i in match){
            var submatch = match[i];
            allmatches.push(submatch);
        }
      matches.push(allmatches);
    }
    return matches;
}

exports.urlSlice = function(url){
    var index = url.indexOf("?");
    if(index > 0) return url.substr(0,index);
    var index = url.indexOf("#");
    if(index > 0) return url.substr(0,index);
    return url;
}
