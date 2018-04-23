var Anumargak = require("./../src/letsRoute");

describe("Anumargak ", function() {
    it("should find static url", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/static", () => 30);
        anumargak.on("HEAD", "/this/is/static", () => 30);

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(1);
        expect(Object.keys(anumargak.staticRoutes.HEAD).length).toEqual(1);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("GET","/this/is/static")()).toEqual(30);
        expect(anumargak.find("HEAD","/this/is/static")()).toEqual(30);
    });

    it("should lookup static url", function(done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/static", (req,res) => {
            done();
        });

        anumargak.lookup({
            method: "GET",
            url: "/this/is/static"}
        );
    });

    it("should set dynamic url", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic", () => 30);
        anumargak.on("HEAD", "/this/is/:dynamic", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.HEAD).length).toEqual(1);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("GET","/this/is/dynamic")()).toEqual(30);
        expect(anumargak.find("HEAD","/this/is/dynamic")()).toEqual(30);
    }); 

    it("should set multiple urls under the same route ", function() {
        var anumargak = Anumargak();

        anumargak.on("HEAD", "/this/is/:dynamic", () => 30)
        anumargak.on("HEAD", "/this/is/:dynamic/2", () => 50)
        
        expect(Object.keys(anumargak.dynamicRoutes.HEAD).length).toEqual(2);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("HEAD","/this/is/dynamic")()).toEqual(30);
        expect(anumargak.find("HEAD","/this/is/dynamic/2")()).toEqual(50);
    });

    it("should overwrite  same route ", function() {
        var anumargak = Anumargak({
            overwriteAllow: true
        });

        anumargak.on("HEAD", "/this/is/:dynamic", () => 30)
        anumargak.on("HEAD", "/this/is/:dynamic", () => 50)

        expect(Object.keys(anumargak.dynamicRoutes.HEAD).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("HEAD","/this/is/dynamic")()).toEqual(50);
    });

    it("should overwrite  same route ", function() {
        var anumargak = Anumargak();

        anumargak.on("HEAD", "/this/is/:dynamic", () => 30)
        expect(() => {
            anumargak.on("HEAD", "/this/is/:dynamic", () => 50)
        }).toThrowError("Given route is matching with already registered route");

    });

    it("FIND: should overwrite similar URLs", function() {
        var anumargak = Anumargak({
            overwriteAllow: true
        });

        anumargak.on("GET", "/this/path/:is/dynamic", () => 50);
        anumargak.on("GET", "/this/:path/is/dynamic", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET","/this/test/is/dynamic")()).toEqual(30);
        expect(anumargak.find("GET","/this/path/isalso/dynamic")).toEqual(undefined);
        expect(anumargak.find("GET","/this/path/is/dynamic")()).toEqual(30);
    });

    it("should set dynamic url with two parameters", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET","/this/is/dynamic/with/123")()).toEqual(30);
    });

    //TODO: change the regex to identify consecutive params
    it("should set dynamic url with two consecutive parameters", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two-:params", () => 30)

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET","/this/is/dynamic/with/twoparams")()).toEqual(30);
    });

    it("should set dynamic url with two consecutive parameters with pattern", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+):params", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET","/this/is/dynamic/with/123pattern")()).toEqual(30);
    });

    it("should set dynamic url with parameter with val", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", () => 30);
        anumargak.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", () => 50)

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(2);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("GET","/this/is/dynamic/with/123rest")()).toEqual(30);
        expect(anumargak.find("GET","/example/at/32h48m")()).toEqual(50);
    });

    it("should set dynamic url with parameter with val", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", () => 30);
        anumargak.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", () => 50)

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(2);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("GET","/this/is/dynamic/with/123rest")()).toEqual(30);
        expect(anumargak.find("GET","/example/at/32h48m")()).toEqual(50);
    });

    it("should lookup for correct function", function(done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", 
            (req,res,params) => {
                expect(params).toEqual({
                    dynamic : "dynamic",
                    two : "123"
                });
                done();
            }
        );
        anumargak.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", 
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

        anumargak.lookup(req) ;

        var req = {
            method : "GET",
            url : "/example/at/32h48m"
        }

        anumargak.lookup(req) ;
        
    });

    
    it("should find correct function leaving query paramaters apart", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);

        expect(anumargak.find("GET","/this/is/dynamic/with/123?ignore=me")() ).toEqual(30);
        expect(anumargak.find("GET","/this/is/dynamic/with/123#ignoreme")() ).toEqual(30);
    });

    it("should lookup correct function leaving query paramaters apart", function(done) {
        var anumargak = Anumargak();
        
        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", 
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
        
        anumargak.lookup(req) ;
        
        var req = {
            method : "GET",
            url : "/this/is/dynamic/with/123rest#ignoreme"
        }
        
        anumargak.lookup(req) ;
    });

    it("should support similar route path with different parameter", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);
        anumargak.on("GET", "/this/is/:dynamic/with/:pattern([a-z]+)", () => 50);

        expect(anumargak.find("GET","/this/is/dynamic/with/123")() ).toEqual(30);
        expect(anumargak.find("GET","/this/is/dynamic/with/string")() ).toEqual(50);
    });

    /* const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    it("should lookup for aync callback", function(done) {
        var anumargak = Anumargak({
            ignoreTrailingSlash: true
        });

        async function callback (){
            await sleep(100);
            done();
        }
        anumargak.on("GET", "/this/is/static",callback);
        
        anumargak.lookup({
            method: "GET", 
            url: "/this/is/static"});
    }); */

});