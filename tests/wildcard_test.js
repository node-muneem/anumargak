var Anumargak = require("./../src/letsRoute");

describe("Anumargak wildchar", function() {
    
    it("FIND: should capture rest url when /*/", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/*/rest/url", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET","/this/is/dynamic")()).toEqual(30);
        expect(anumargak.find("GET","/this/is/dynamic/url")()).toEqual(30);
        expect(anumargak.find("GET","/this/is/*")()).toEqual(30);
        expect(anumargak.find("GET","/this/is/")()).toEqual(30);
    });

    it("FIND: should capture rest url when /*some/", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/*rest/url", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET","/this/is/dynamic")()).toEqual(30);
        expect(anumargak.find("GET","/this/is/dynamic/url")()).toEqual(30);
        expect(anumargak.find("GET","/this/is/*")()).toEqual(30);
        expect(anumargak.find("GET","/this/is/")()).toEqual(30);
    });

    it("FIND: should capture rest url when /some*/", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/dyna*/rest/url", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET","/this/is/dynamic")()).toEqual(30);
        expect(anumargak.find("GET","/this/is/dynamic/url")()).toEqual(30);
        expect(anumargak.find("GET","/this/is/*")).toEqual(undefined);
        expect(anumargak.find("GET","/this/is/")).toEqual(undefined);
    });

    it("FIND: should capture rest url when /some*/", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/dyna*rest/url", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET","/this/is/dynamic")()).toEqual(30);
        expect(anumargak.find("GET","/this/is/dynamic/url")()).toEqual(30);
        expect(anumargak.find("GET","/this/is/*")).toEqual(undefined);
        expect(anumargak.find("GET","/this/is/")).toEqual(undefined);
    });

    it("FIND: should capture rest url when there is already a parameter ahead", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/:param/is/*/rest/url", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET","/this/test/is/dynamic")()).toEqual(30);
        expect(anumargak.find("GET","/this/test/is/dynamic/url")()).toEqual(30);
        expect(anumargak.find("GET","/this/test/is/*")()).toEqual(30);
        expect(anumargak.find("GET","/this/test/is/")()).toEqual(30);
    });

    it("LOOKUP: should capture rest url when /some*/", function(done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/dyna*/with/:two(\\d+)rest", 
            (req,res,params) => {
                expect(params).toEqual({
                    "*" : "mic/with/123rest"
                });
                done();
            }
        );
        
        var req = {
            method : "GET",
            url : "/this/is/dynamic/with/123rest?ignore=me",
            headers: {}
        }
        
        anumargak.lookup(req) ;

    });

    it("LOOKUP: should capture rest url when /*/", function(done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/*/with/:two(\\d+)rest", 
            (req,res,params) => {
                expect(params).toEqual({
                    "*" : "dynamic/with/123rest"
                });
                done();
            }
        );
        
        var req = {
            method : "GET",
            url : "/this/is/dynamic/with/123rest?ignore=me",
            headers: {}
        }
        
        anumargak.lookup(req) ;
    });

    it("LOOKUP: should capture rest url when /some*some/", function(done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/dyna*mic/with/:two(\\d+)rest", 
            (req,res,params) => {
                expect(params).toEqual({
                    "*" : "test/with/"
                });
                done();
            }
        );
        
        var req = {
            method : "GET",
            url : "/this/is/dynatest/with/?ignore=me",
            headers: {}
        }
        
        anumargak.lookup(req) ;
    });

    it("LOOKUP: should capture rest url when already a parameter ahead", function(done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/:param/is/dyna*mic/with/:two(\\d+)rest", 
            (req,res,params) => {
                expect(params).toEqual({
                    "*" : "test/with/",
                    "param" : "test"
                });
                done();
            }
        );
        
        var req = {
            method : "GET",
            url : "/this/test/is/dynatest/with/?ignore=me",
            headers: {}
        }
        
        anumargak.lookup(req) ;
    });

    it("LOOKUP: should not capture but match when there is no value of param", function(done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/dyna*", 
            (req,res,params) => {
                expect(params).toEqual({
                    "*" : ""
                });
                done();
            }
        );
        
        var req = {
            method : "GET",
            url : "/this/is/dyna",
            headers: {}
        }
        
        anumargak.lookup(req) ;
    });
});