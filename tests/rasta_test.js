var Rasta = require("./../src/letsRoute");

describe("Fast Track", function() {
    it("should find static url", function() {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/static", () => 30);
        rasta.on("HEAD", "/this/is/static", () => 30);

        /* expect(rasta.staticRoutes.GET["/this/is/static"]()).toEqual(30);
        expect(rasta.staticRoutes.HEAD["/this/is/static"]()).toEqual(30); */

        expect(rasta.find("GET","/this/is/static")()).toEqual(30);
        expect(rasta.find("HEAD","/this/is/static")()).toEqual(30);
    });

    it("should lookup static url", function(done) {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/static", (req,res) => {
            done();
        });

        rasta.lookup({
            method: "GET",
            url: "/this/is/static"}
        );
    });

    it("should set dynamic url", function() {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/:dynamic", () => 30);
        rasta.on("HEAD", "/this/is/:dynamic", () => 30);

        /* expect(rasta.dynamicRoutes.GET["/this/is/([^\\/]+)"]()).toEqual(30);
        expect(rasta.dynamicRoutes.HEAD["/this/is/([^\\/]+)"]()).toEqual(30); */

        expect(rasta.find("GET","/this/is/dynamic")()).toEqual(30);
        expect(rasta.find("HEAD","/this/is/dynamic")()).toEqual(30);
    });

    it("should set multiple urls under the same route ", function() {
        var rasta = Rasta();

        rasta.on("HEAD", "/this/is/:dynamic", () => 30)
        rasta.on("HEAD", "/this/is/:dynamic/2", () => 50)
        
        /* expect(rasta.dynamicRoutes.HEAD["/this/is/([^\\/]+)"]()).toEqual(30);
        expect(rasta.dynamicRoutes.HEAD["/this/is/([^\\/]+)/2"]()).toEqual(50); */

        expect(rasta.find("HEAD","/this/is/dynamic")()).toEqual(30);
        expect(rasta.find("HEAD","/this/is/dynamic/2")()).toEqual(50);
    });

    it("should overwrite  same route ", function() {
        var rasta = Rasta();

        rasta.on("HEAD", "/this/is/:dynamic", () => 30)
        rasta.on("HEAD", "/this/is/:dynamic", () => 50)

        /* expect(rasta.dynamicRoutes.HEAD["/this/is/([^\\/]+)"]()).toEqual(50); */

        expect(rasta.find("HEAD","/this/is/dynamic")()).toEqual(50);
    });

    it("should set dynamic url with two parameters", function() {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);

        /* expect(rasta.dynamicRoutes.GET["/this/is/([^\\/]+)/with/(\\d+)"]()).toEqual(30); */

        expect(rasta.find("GET","/this/is/dynamic/with/123")()).toEqual(30);
    });

    //TODO: change the regex to identify consecutive params
    it("should set dynamic url with two consecutive parameters", function() {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/:dynamic/with/:two-:params", () => 30)

        /* expect(rasta.dynamicRoutes.GET["/this/is/([^\\/]+)/with/([^\\/]+)([^\\/]+)"]()).toEqual(30); */

        expect(rasta.find("GET","/this/is/dynamic/with/twoparams")()).toEqual(30);
    });

    it("should set dynamic url with two consecutive parameters with pattern", function() {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/:dynamic/with/:two(\\d+):params", () => 30);

        /* expect(rasta.dynamicRoutes.GET["/this/is/([^\\/]+)/with/(\\d+)([^\\/]+)"]()).toEqual(30); */

        expect(rasta.find("GET","/this/is/dynamic/with/123pattern")()).toEqual(30);
    });

    it("should set dynamic url with parameter with val", function() {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", () => 30);
        rasta.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", () => 50)

        /* expect(rasta.dynamicRoutes.GET["/this/is/([^\\/]+)/with/(\\d+)rest"]()).toEqual(30);
        expect(rasta.dynamicRoutes.GET["/example/at/(^\\d{2})h(^\\d{2})m"]()).toEqual(50); */

        expect(rasta.find("GET","/this/is/dynamic/with/123rest")()).toEqual(30);
        expect(rasta.find("GET","/example/at/32h48m")()).toEqual(50);
    });

    it("should set dynamic url with parameter with val", function() {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", () => 30);
        rasta.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", () => 50)

        /* expect(rasta.dynamicRoutes.GET["/this/is/([^\\/]+)/with/(\\d+)rest"]()).toEqual(30);
        expect(rasta.dynamicRoutes.GET["/example/at/(^\\d{2})h(^\\d{2})m"]()).toEqual(50); */

        expect(rasta.find("GET","/this/is/dynamic/with/123rest")()).toEqual(30);
        expect(rasta.find("GET","/example/at/32h48m")()).toEqual(50);
    });

    it("should lookup for correct function", function(done) {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", 
            (req,res,params) => {
                expect(params).toEqual({
                    dynamic : "dynamic",
                    two : "123"
                });
                done();
            }
        );
        rasta.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", 
            (req,res,params) => {
                expect(params).toEqual({
                    hour : "32",
                    minute : "48"
                });
                done();
            }
        );

        var req = {
            method : "GET",
            url : "/this/is/dynamic/with/123rest"
        }

        rasta.lookup(req) ;

        var req = {
            method : "GET",
            url : "/example/at/32h48m"
        }

        rasta.lookup(req) ;
        /* expect(rasta.lookup(req,res) ).toEqual(30);
        expect(rasta.find("GET","/example/at/32h48m")()).toEqual(50); */
    });

    
    it("should find correct function leaving query paramaters apart", function() {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);

        expect(rasta.find("GET","/this/is/dynamic/with/123?ignore=me")() ).toEqual(30);
        expect(rasta.find("GET","/this/is/dynamic/with/123#ignoreme")() ).toEqual(30);
    });

    it("should lookup correct function leaving query paramaters apart", function(done) {
        var rasta = Rasta();
        
        rasta.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", 
            (req,res,params) => {
                expect(params).toEqual({
                    dynamic : "dynamic",
                    two : "123"
                });
                done();
            }
        );
        
        var req = {
            method : "GET",
            url : "/this/is/dynamic/with/123rest?ignore=me"
        }
        
        rasta.lookup(req) ;
        
        var req = {
            method : "GET",
            url : "/this/is/dynamic/with/123rest#ignoreme"
        }
        
        rasta.lookup(req) ;
    });

    it("should support similar route path with different parameter", function() {
        var rasta = Rasta();

        rasta.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);
        rasta.on("GET", "/this/is/:dynamic/with/:pattern([a-z]+)", () => 50);

        expect(rasta.find("GET","/this/is/dynamic/with/123")() ).toEqual(30);
        expect(rasta.find("GET","/this/is/dynamic/with/string")() ).toEqual(50);
    });

    /* it("should support wild card ", function(done) {
        var rasta = Rasta();
        
        rasta.on("GET", "/this/is/:dynamic/with/ * /anything/here?ignore=me", 
            (req,res,params) => {
                expect(params).toEqual({
                    dynamic : "dynamic",
                    "*" : "string"
                });
                done();
        });
        rasta.lookup({
            url: "/this/is/dynamic/with/string",
            method : "GET"
        });
    });  */

    it("should set multiple methos is an array is passed", function() {
        var rasta = Rasta();

        rasta.on(["GET", "HEAD"], "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);

        expect(rasta.find("GET","/this/is/dynamic/with/123")() ).toEqual(30);
        expect(rasta.find("HEAD","/this/is/dynamic/with/123")() ).toEqual(30);
    });

    it("should throw error on invalid argument type", function() {
        var rasta = Rasta();

        expect(() => {
            rasta.on({ method: "GET"}, "/this/is/:dynamic/with/:pattern(\\d+)", () => {});
        }).toThrowError("Invalid method argument. String or array is expected.");
    });

    it("should throw error on invalid method type", function() {
        var rasta = Rasta();

        expect(() => {
            rasta.on("OTHER", "/this/is/:dynamic/with/:pattern(\\d+)", () => {});
        }).toThrowError("Invalid method type OTHER");
    });

    it("should find default function when no rout matches", function() {
        var rasta = Rasta({
            defaultRoute : () => 50
        });

        rasta.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => {});
        
        expect(rasta.find("GET", "/this/is/not/registered")()).toEqual(50);

    });

    it("should look up default function when no rout matches", function(done) {
        var rasta = Rasta({
            defaultRoute : (req,res) => {
                done();
            }
        });

        rasta.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => {});
        
        rasta.lookup({
            method : "GET", 
            url: "/this/is/not/registered"
        });

    });

});