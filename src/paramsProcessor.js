
var safeRegex = require('safe-regex');

function processPathParameters(url, allowUnsafeRegex){
    var paramNames = [];
    for(var i=0; i< url.length; i++){
        var paramStart = url.indexOf(":");
        if( paramStart === -1) break;

        var paramEnd = readUntil( url, paramStart, ['(', '/', ':'] );
        var paramName = url.substring(paramStart + 1, paramEnd);
        
        var pattern = ""; 
        var appliedPattern = "([^\\/]+)"; 
        if( url[paramEnd] === '('){
            var patternEnd = readUntilClosingParentheses( url, paramEnd)  + 1;
            pattern = url.substring(paramEnd, patternEnd);
            if(pattern.indexOf(":") > -1) throw Error("Path parameters are not allowed to have collon :.");
            else if ( !allowUnsafeRegex && !safeRegex(pattern) ){
                throw Error( `${pattern} seems unsafe.`);
            }
            appliedPattern = pattern;
            i = patternEnd;
        }

        url = url.replace( ':' + paramName + pattern , appliedPattern);
        if(paramName.endsWith("-") ){//consecutive params are separated by '-'
            paramName = paramName.slice(0, -1);
        }
        paramNames.push( paramName );
    }

    return {
        url : url,
        paramNames : paramNames
    }
}

function readUntil(str, start, charArr ){
    for(var i=start + 1; i< str.length; i++){
        if( charArr.indexOf( str[i] ) > -1 ){
            return i;
        }
    }
    return i;
}

function readUntilClosingParentheses(str, start){
    var count = 0;
    for(var i=start + 1; i< str.length; i++){
        if( str[i] === ')'){
            if( count === 0 ){
                return i;
            }else{
                count--;
            }
        } else if( str[i] === '(' ) {
            count++;
        }
    }
    return i;
}

module.exports = processPathParameters;