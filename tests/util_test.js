var util = require('../src/util');

/* 
/this/is/sample?q1=val&q2=val3
/this/is/sample#q1=val&q2=val3
/this/is/sample?q1=val&q2=val3#q1=val&q2=val3
/this/is/sample?q1=val&q2=val3#q1=val#q2=val3 //# => q1=val#q2=val3
*/

describe("urlSlice", function() {
    var urlSlice = util.urlSlice;

    it("should seperate url path from query params and fragment", function() {

        var result = urlSlice("/this/is/sample?q1=val&q2=val3")
        expect(result.url).toEqual("/this/is/sample");

    });
  
    it("should handle urls with query string", function() {

        var result = urlSlice("/this/is/sample?q1=val&q2=val3");
        expect(result.url).toEqual("/this/is/sample");
        expect(result.queryStr).toEqual("q1=val&q2=val3");

    });

    it("should handle urls with hash", function() {

        var result = urlSlice("/this/is/sample#q1=val&q2=val3");
        expect(result.url).toEqual("/this/is/sample");
        expect(result.hashStr).toEqual("q1=val&q2=val3");
      
    });

    it("should handle urls with both query string and hash", function() {
      
        var result = urlSlice("/this/is/sample?q1=val&q2=val3#q2=val2&q3=val4");
        expect(result.url).toEqual("/this/is/sample");
        expect(result.queryStr).toEqual("q1=val&q2=val3");
        expect(result.hashStr).toEqual("q2=val2&q3=val4");
        
    })

});