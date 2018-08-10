var processPathParameters = require("./../src/paramsProcessor");

//default : param with no pattern
//regex : param with some pattern specified
//unsafe : param with unsafe regex pattern

describe("paramsProcessor", function() {
    
    it("should extract default boundary param", function() {
        var result = processPathParameters("/this/is/:boundaryparam")
        expect(result.url).toEqual( "/this/is/([^\\/]+)" );
        expect(result.paramNames).toEqual( ["boundaryparam"] );

        var result = processPathParameters("/this/is/:boundaryparam/")
        expect(result.url).toEqual( "/this/is/([^\\/]+)/" );
        expect(result.paramNames).toEqual( ["boundaryparam"] );

    });

    it("should extract default in-between param", function() {
        
        var result = processPathParameters("/this/is/:boundaryparam/last")
        expect(result.url).toEqual( "/this/is/([^\\/]+)/last" );
        expect(result.paramNames).toEqual( ["boundaryparam"] );

    });

    it("should extract multiple params", function() {
        var result = processPathParameters("/this/is/:boundary/:param")
        expect(result.url).toEqual( "/this/is/([^\\/]+)/([^\\/]+)" );
        expect(result.paramNames).toEqual( ["boundary","param"] );

    });

    it("should extract multiple consecutive params", function() {
        var result = processPathParameters("/this/is/:boundary:param")
        expect(result.url).toEqual( "/this/is/([^\\/]+)([^\\/]+)" );
        expect(result.paramNames).toEqual( ["boundary","param"] );

    });

    it("should extract multiple consecutive regex params", function() {
        var result = processPathParameters("/this/is/:boundary(this):param(that)")
        expect(result.url).toEqual( "/this/is/(this)(that)" );
        expect(result.paramNames).toEqual( ["boundary","param"] );

    });

    it("should throw error if a regex params has : in pattern", function() {
        expect(() => {
            processPathParameters("/this/is/:boundary(thi:s):param(that)")
        }).toThrowError("Path parameters are not allowed to have collon :.");

    });

    it("should extract regex param", function() {
        var result = processPathParameters("/this/is/:param(\\d+)" );
        expect(result.url).toEqual( "/this/is/(\\d+)" );
        expect(result.paramNames).toEqual( ["param"] );

        var result = processPathParameters("/this/is/:param(\\d+)/" );
        expect(result.url).toEqual( "/this/is/(\\d+)/" );
        expect(result.paramNames).toEqual( ["param"] );

    });

    it("should extract regex param has some string after", function() {
        var result = processPathParameters("/this/is/:param(\\d+)ing" );
        expect(result.url).toEqual( "/this/is/(\\d+)ing" );
        expect(result.paramNames).toEqual( ["param"] );

        var result = processPathParameters("/this/is/:param(\\d+)ing/" );
        expect(result.url).toEqual( "/this/is/(\\d+)ing/" );
        expect(result.paramNames).toEqual( ["param"] );

    });

    it("should extract multiple consecutive regex params  has some string after", function() {
        var result = processPathParameters("/this/is/:boundary(this)h:param(that)m")
        expect(result.url).toEqual( "/this/is/(this)h(that)m" );
        expect(result.paramNames).toEqual( ["boundary","param"] );

    });


    it("should throw error on unsafe regex param", function() {
        expect ( () => {
            processPathParameters("/this/is/:dynamic((a+){10}y)/:other(some|thing)" );
        }).toThrowError("((a+){10}y) seems unsafe.");
    });

    it("should extract unsafe regex param if unsafe regex are allowed", function() {
        var result = processPathParameters("/this/is/:dynamic((a+){10}y)/:other(some|thing)" , true);
        expect(result.url).toEqual( "/this/is/((a+){10}y)/(some|thing)");
        expect(result.paramNames).toEqual( ["dynamic", "other"] );
    });
    
    it("should extract for wildcard", function() {
        var result = processPathParameters("/this/is/:*(dyna.*)" , true);
        expect(result.url).toEqual( "/this/is/(dyna.*)");
        expect(result.paramNames).toEqual( ["*"]);
    });
    
});