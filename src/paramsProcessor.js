'use strict'

const safeRegex = require('safe-regex');

function processPathParameters(url, allowUnsafeRegex){
    const paramNames = [];
    for(let index=0; index< url.length; index++){
        const paramStartIndex = url.indexOf(":");
        if( paramStartIndex === -1) break;

        const paramEndIndex = readUntil( url, paramStartIndex, ['(', '/', ':'] );
        let paramName = url.substring(paramStartIndex + 1, paramEndIndex);
        
        var pattern = ""; 
        let appliedPattern = "([^\\/]+)"; 
        if( url[paramEndIndex] === '('){
            const patternEndIndex = readUntilClosingParentheses( url, paramEndIndex)  + 1;
            pattern = url.substring(paramEndIndex, patternEndIndex);
            if(pattern.indexOf(":") > -1) throw Error("Path parameters are not allowed to have collon :.");
            else if ( !allowUnsafeRegex && !safeRegex(pattern) ){
                throw Error( `${pattern} seems unsafe.`);
            }
            appliedPattern = pattern;
            index = patternEndIndex;
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

/**
 * Process url part for regex patterns
 * @param {string} url 
 * @param {boolean} allowUnsafeRegex 
 * @returns {object} {
        patterns : patterns,
        paramNames : paramNames
    }
 */
function processPathParameter(url, allowUnsafeRegex){
    const paramNames = [];
    const patterns = [];
    for(let index=0; index< url.length; index++){
        const paramStartIndex = url.indexOf(":");
        if( paramStartIndex === -1) break;

        const paramEndIndex = readUntil( url, paramStartIndex, ['(', '/', ':'] );
        let paramName = url.substring(paramStartIndex + 1, paramEndIndex);
        
        var pattern = ""; 
        let appliedPattern = "([^\\/]+)"; 
        if( url[paramEndIndex] === '('){
            const patternEndIndex = readUntilClosingParentheses( url, paramEndIndex)  + 1;
            pattern = url.substring(paramEndIndex, patternEndIndex);
            if(pattern.indexOf(":") > -1) throw Error("Path parameters are not allowed to have collon :.");
            else if ( !allowUnsafeRegex && !safeRegex(pattern) ){
                throw Error( `${pattern} seems unsafe.`);
            }
            appliedPattern = pattern;
            index = patternEndIndex;
        }

        patterns.push( appliedPattern);
        url =  url.replace( ':' + paramName + pattern , appliedPattern);
        if(paramName.endsWith("-") ){//consecutive params are separated by '-'
            paramName = paramName.slice(0, -1);
        }
        paramNames.push( paramName );
    }

    return {
        pattern: url,
        patterns : patterns,
        paramNames : paramNames
    }
}

/**
 * find the starting index of char from given char array
 * @param {String} str 
 * @param {Number} start 
 * @param {Array} charArr 
 */
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

module.exports = {
    processPathParameters : processPathParameters,
    processPathParameter : processPathParameter
}