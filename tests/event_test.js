var Anumargak = require("./../src/letsRoute");

describe("Anumargak events", function () {

    it("should emit found and request event when the route is registered", function (done) {
        var router = Anumargak();

        var seq = [];
        router.on("request", () => {
            seq.push("request");
        }).on("found", () => {
            seq.push("found");
        }).on("not found", () => {
            seq.push("not found");
        }).on("route", () => {
            seq.push("route");
        }).on("default", () => {
            seq.push("default");
        })

        function callback (req){
            expect(req._path).toEqual("/this/is/static");
            expect(seq).toEqual(["request", "found", "route"]);
            done();
        }

        router.on("GET", "/this/is/static", callback);
        
        var req = {
            method: "GET",
            url: "/this/is/static",
            headers: {}
        }

        router.lookup(req);

    });
    it("should emit not-found  and request event when the route is not registered", function (done) {
        var seq = [];
        function notFound(req){
            expect(req._path).toEqual("/this/is/static2");
            expect(seq).toEqual(["request", "not found", "default"]);
            done();
        }
        
        var router = Anumargak({
            defaultRoute : notFound
        });

        
        router.on("request", () => {
            seq.push("request");
        }).on("found", () => {
            seq.push("found");
        }).on("not found", () => {
            seq.push("not found");
        }).on("route", () => {
            seq.push("route");
        }).on("default", () => {
            seq.push("default");
        })

        router.on("GET", "/this/is/static", () => {
            done.fail();
        });
        
        var req = {
            method: "GET",
            url: "/this/is/static2",
            headers: {}
        }

        router.lookup(req);
    });
    it("should throw error for unsupported events", function () {
        var router = Anumargak();

        expect(() => {
            router.on("other", () => {})
        }).toThrowError("Router: Unsupported event other");

    });

});