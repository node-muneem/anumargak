var Anumargak = require("./../src/letsRoute");

describe("Anumargak ", function () {
    it("QUICK FIND: should find versioned static url", function () {
        var router = Anumargak();

        router.on("GET", "/this/is/not/versioned", () => 5 );
        router.on("GET", "/this/is/versioned", () => 10 );
        router.on("GET", "/this/is/versioned", { version: '1.2.0' }, () => 30 );
        router.on("GET", "/this/is/versioned", { version: '1.2.3' }, () => 40 );
        router.on("GET", "/this/is/versioned", { version: '2.4.0' }, () => 50 );

        expect( Object.keys(router.staticRoutes.GET).length ).toEqual(2);
        expect( router.count).toEqual(5);

        expect( router.quickFind( { method: "GET", headers: {}, url: "/this/is/not/versioned" }).handler()).toEqual(5);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "1.2.0" }, url: "/this/is/not/versioned" }) ).toBeUndefined();
        expect( router.quickFind( { method: "GET", headers: {}, url: "/this/is/versioned" }).handler()).toEqual(10);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "1.2.0" }, url: "/this/is/versioned" } ).handler()).toEqual(30);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "1.2.3" }, url: "/this/is/versioned" }).handler()).toEqual(40);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "2.4.0" }, url: "/this/is/versioned" }).handler()).toEqual(50);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "1.2.x" }, url: "/this/is/versioned" }).handler()).toEqual(40);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' :  "1.x" }, url: "/this/is/versioned" }).handler()).toEqual(40);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "*"}, url: "/this/is/versioned" }).handler()).toEqual(50);
    });

    it("QUICK FIND: should register versioned static url without registering non-versioned URL first", function () {
        var router = Anumargak();

        router.on("GET", "/this/is/not/versioned", () => 5 );
        router.on("GET", "/this/is/versioned", { version: '1.2.0' }, () => 30 );
        router.on("GET", "/this/is/versioned", { version: '1.2.3' }, () => 40 );
        router.on("GET", "/this/is/versioned", { version: '2.4.0' }, () => 50 );
        router.on("GET", "/this/is/versioned", () => 10 );

        expect( Object.keys(router.staticRoutes.GET).length ).toEqual(2);
        expect( router.count).toEqual(5);

        expect( router.quickFind( { method: "GET", headers: {}, url: "/this/is/not/versioned" }).handler()).toEqual(5);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "1.2.0" }, url: "/this/is/not/versioned" }) ).toBeUndefined();
        expect( router.quickFind( { method: "GET", headers: {}, url: "/this/is/versioned" }).handler()).toEqual(10);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "1.2.0" }, url: "/this/is/versioned" } ).handler()).toEqual(30);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "1.2.3" }, url: "/this/is/versioned" }).handler()).toEqual(40);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "2.4.0" }, url: "/this/is/versioned" }).handler()).toEqual(50);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "1.2.x" }, url: "/this/is/versioned" }).handler()).toEqual(40);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' :  "1.x" }, url: "/this/is/versioned" }).handler()).toEqual(40);
        expect( router.quickFind( { method: "GET", headers: { 'accept-version' : "*"}, url: "/this/is/versioned" }).handler()).toEqual(50);
    });
    
    it("LOOKUP: should find versioned static url", function () {
        var router = Anumargak({
            defaultRoute : function(req, res){
                expect( req.url ).toEqual("/this/is/not/versioned");
                expect( req.headers ).toEqual( { 'accept-version' : "1.2.0" } );
            }
        });

        router.on("GET", "/this/is/not/versioned", (req, res) => {
            expect( req.url ).toEqual("/this/is/not/versioned");
            expect( res.statusCode ).toEqual(undefined);
        } );
        router.on("GET", "/this/is/versioned", (req, res) => {
            expect( req.url ).toEqual("/this/is/versioned");
            expect( res.statusCode ).toEqual(undefined);
        }  );
        router.on("GET", "/this/is/versioned", { version: '1.2.0' }, (req, res) => {
            expect( req.url ).toEqual("/this/is/versioned");
            expect( req.headers ).toEqual( { 'accept-version' : "1.2.0" } );
            expect( res.statusCode ).toEqual(undefined);
        } );
        router.on("GET", "/this/is/versioned", { version: '1.2.3' }, (req, res) => {
            expect( req.url ).toEqual("/this/is/versioned");
            expect( ["1.x", "1.2.x", "1.2.3"].indexOf( req.headers['accept-version'] ) ).toBeGreaterThan(-1);
            expect( res.statusCode ).toEqual(undefined);
        } );
        router.on("GET", "/this/is/versioned", { version: '2.4.0' }, (req, res) => {
            expect( req.url ).toEqual("/this/is/versioned");
            expect( ["*", "2.4.0"].indexOf( req.headers['accept-version'] ) ).toBeGreaterThan(-1);
            expect( res.statusCode ).toEqual(undefined);
        } );

        expect( Object.keys(router.staticRoutes.GET).length ).toEqual(2);
        expect( router.count).toEqual(5);

        router.lookup( { 
            method: "GET", headers: {}, url: "/this/is/not/versioned" 
        }, {});
        router.lookup( { 
            method: "GET", headers: { 'accept-version' : "1.2.0" }, url: "/this/is/not/versioned" 
        }, {});
        router.lookup( { 
            method: "GET", headers: {}, url: "/this/is/versioned"
        }, {});
        router.lookup( { 
            method: "GET", headers: { 'accept-version' : "1.2.0" }, url: "/this/is/versioned" 
        }, {});
        router.lookup( { 
            method: "GET", headers: { 'accept-version' : "1.2.3" }, url: "/this/is/versioned"
        }, {});
        router.lookup( { 
            method: "GET", headers: { 'accept-version' : "2.4.0" }, url: "/this/is/versioned"
        }, {});
        router.lookup( { 
            method: "GET", headers: { 'accept-version' : "1.2.x" }, url: "/this/is/versioned"
        }, {});
        router.lookup( { 
            method: "GET", headers: { 'accept-version' :  "1.x" }, url: "/this/is/versioned"
        }, {});
        router.lookup( { 
            method: "GET", headers: { 'accept-vehandlerrsion' : "*"}, url: "/this/is/versioned"
        }, {});
    });


    it("FIND: should find versioned static url", function () {
        var router = Anumargak();

        router.on("GET", "/this/is/not/versioned", () => 5 );
        router.on("GET", "/this/is/versioned", () => 10 );
        router.on("GET", "/this/is/versioned", { version: '1.2.0' }, () => 30 );
        router.on("GET", "/this/is/versioned", { version: '1.2.3' }, () => 40 );
        router.on("GET", "/this/is/versioned", { version: '2.4.0' }, () => 50 );

        expect( Object.keys(router.staticRoutes.GET).length ).toEqual(2);
        expect( router.count).toEqual(5);

        expect( router.find("GET", "/this/is/not/versioned").handler()).toEqual(5);
        expect( router.find("GET", "/this/is/not/versioned", "1.2.0").handler ).toEqual( undefined );
        expect( router.find("GET", "/this/is/versioned").handler()).toEqual(10);
        expect( router.find("GET", "/this/is/versioned", "1.2.0").handler()).toEqual(30);
        expect( router.find("GET", "/this/is/versioned", "1.2.3").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/versioned", "2.4.0").handler()).toEqual(50);
        expect( router.find("GET", "/this/is/versioned", "1.2.x").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/versioned", "1.x").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/versioned", "*").handler()).toEqual(50);
    });

    it("FIND: should find versioned enumerated url", function () {
        var router = Anumargak();

        router.on("GET", "/this/is/static", () => 5 );
        router.on("GET", "/this/is/:role(admin|staff)", () => 10 );
        router.on("GET", "/this/is/:role(admin|staff)", { version: '1.2.0' }, () => 30 );
        router.on("GET", "/this/is/:role(admin|staff)", { version: '1.2.3' }, () => 40 );
        router.on("GET", "/this/is/:role(admin|staff)", { version: '2.4.0' }, () => 50 );

        expect( Object.keys(router.staticRoutes.GET).length ).toEqual(3);
        expect( Object.keys(router.dynamicRoutes.GET).length ).toEqual(0);
        expect( router.count).toEqual(5);

        expect( router.find("GET", "/this/is/static").handler()).toEqual(5);
        expect( router.find("GET", "/this/is/admin").handler()).toEqual(10);
        expect( router.find("GET", "/this/is/admin", "1.2.0").handler()).toEqual(30);
        expect( router.find("GET", "/this/is/admin", "1.2.3").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/admin", "2.4.0").handler()).toEqual(50);
        expect( router.find("GET", "/this/is/admin", "1.2.x").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/admin", "1.x").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/admin", "*").handler()).toEqual(50);

        expect( router.find("GET", "/this/is/staff").handler()).toEqual(10);
        expect( router.find("GET", "/this/is/staff", "1.2.0").handler()).toEqual(30);
        expect( router.find("GET", "/this/is/staff", "1.2.3").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/staff", "2.4.0").handler()).toEqual(50);
        expect( router.find("GET", "/this/is/staff", "1.2.x").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/staff", "1.x").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/staff", "*").handler()).toEqual(50);
    });


    it("FIND: should find versioned dynamic url", function () {
        var router = Anumargak();

        router.on("GET", "/this/is/static", () => 5 );
        router.on("GET", "/this/is/:role([a-z]+)", () => 10 );
        router.on("GET", "/this/is/:role([a-z]+)", { version: '1.2.0' }, () => 30 );
        router.on("GET", "/this/is/:role([a-z]+)", { version: '1.2.3' }, () => 40 );
        router.on("GET", "/this/is/:role([a-z]+)", { version: '2.4.0' }, () => 50 );

        expect( Object.keys(router.staticRoutes.GET).length ).toEqual(1);
        expect( Object.keys(router.dynamicRoutes.GET).length ).toEqual(1);
        expect( router.count).toEqual(5);

        expect( router.find("GET", "/this/is/static").handler()).toEqual(5);
        expect( router.find("GET", "/this/is/admin").handler()).toEqual(10);
        expect( router.find("GET", "/this/is/admin", "1.2.0").handler()).toEqual(30);
        expect( router.find("GET", "/this/is/admin", "1.2.3").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/admin", "2.4.0").handler()).toEqual(50);
        expect( router.find("GET", "/this/is/admin", "1.2.x").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/admin", "1.x").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/admin", "*").handler()).toEqual(50);

        expect( router.find("GET", "/this/is/staff").handler()).toEqual(10);
        expect( router.find("GET", "/this/is/staff", "1.2.0").handler()).toEqual(30);
        expect( router.find("GET", "/this/is/staff", "1.2.3").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/staff", "2.4.0").handler()).toEqual(50);
        expect( router.find("GET", "/this/is/staff", "1.2.x").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/staff", "1.x").handler()).toEqual(40);
        expect( router.find("GET", "/this/is/staff", "*").handler()).toEqual(50);
    });

    it("LOOK: should look versioned static url", function () {
        var router = Anumargak();

        router.on("GET", "/this/is/static", (req) => {
            expect( req.headers["accept-version"] ).toEqual(undefined);
        } );
        router.on("GET", "/this/is/versioned", (req) => {
            expect( req.headers["accept-version"] ).toEqual(undefined);
        } );
        router.on("GET", "/this/is/versioned", { version: '1.2.0' }, (req) => {
            expect( req.headers["accept-version"] ).toEqual("1.2.0");
        } );
        router.on("GET", "/this/is/versioned", { version: '1.2.3' }, (req) => {
            expect( req.headers["accept-version"] ).toEqual("1.2.x");
        } );
        router.on("GET", "/this/is/versioned", { version: '2.4.0' }, (req) => {
            expect( req.headers["accept-version"] ).toEqual("*");
        } );

        router.lookup({
            method: "GET",
            url: "/this/is/static",
            headers: {}
        });

        router.lookup({
            method: "GET",
            url: "/this/is/versioned",
            headers: {}
        });

        router.lookup({
            method: "GET",
            url: "/this/is/versioned",
            headers: { "accept-version" : "1.2.0" }
        });

        router.lookup({
            method: "GET",
            url: "/this/is/versioned",
            headers: { "accept-version" : "1.2.x" }
        });

        router.lookup({
            method: "GET",
            url: "/this/is/versioned",
            headers: { "accept-version" : "*" }
        });

    });

    it("LOOK: should look versioned enumerated url", function () {
        var router = Anumargak();

        router.on("GET", "/this/is/static", (req) => {
            expect( req.headers["accept-version"] ).toEqual(undefined);
        } );
        router.on("GET", "/this/is/:role(admin|staff)", (req) => {
            expect( req.headers["accept-version"] ).toEqual(undefined);
        } );
        router.on("GET", "/this/is/:role(admin|staff)", { version: '1.2.0' }, (req) => {
            expect( req.headers["accept-version"] ).toEqual("1.2.0");
        } );
        router.on("GET", "/this/is/:role(admin|staff)", { version: '1.2.3' }, (req) => {
            expect( req.headers["accept-version"] ).toEqual("1.2.x");
        } );
        router.on("GET", "/this/is/:role(admin|staff)", { version: '2.4.0' }, (req) => {
            expect( req.headers["accept-version"] ).toEqual("*");
        } );

        router.lookup({
            method: "GET",
            url: "/this/is/static",
            headers: {}
        });

        router.lookup({
            method: "GET",
            url: "/this/is/staff",
            headers: {}
        });

        router.lookup({
            method: "GET",
            url: "/this/is/admin",
            headers: { "accept-version" : "1.2.0" }
        });

        router.lookup({
            method: "GET",
            url: "/this/is/staff",
            headers: { "accept-version" : "1.2.x" }
        });

        router.lookup({
            method: "GET",
            url: "/this/is/admin",
            headers: { "accept-version" : "*" }
        });
    });

    it("LOOK: should look versioned dynamic url", function () {
        var router = Anumargak();

        router.on("GET", "/this/is/static", (req) => {
            expect( req.headers["accept-version"] ).toEqual(undefined);
        } );
        router.on("GET", "/this/is/:role([a-z]+)", (req) => {
            expect( req.headers["accept-version"] ).toEqual(undefined);
        } );
        router.on("GET", "/this/is/:role([a-z]+)", { version: '1.2.0' }, (req) => {
            expect( req.headers["accept-version"] ).toEqual("1.2.0");
        } );
        router.on("GET", "/this/is/:role([a-z]+)", { version: '1.2.3' }, (req) => {
            expect( req.headers["accept-version"] ).toEqual("1.2.x");
        } );
        router.on("GET", "/this/is/:role([a-z]+)", { version: '2.4.0' }, (req) => {
            expect( req.headers["accept-version"] ).toEqual("*");
        } );

        router.lookup({
            method: "GET",
            url: "/this/is/static",
            headers: {}
        });

        router.lookup({
            method: "GET",
            url: "/this/is/staff",
            headers: {}
        });

        router.lookup({
            method: "GET",
            url: "/this/is/admin",
            headers: { "accept-version" : "1.2.0" }
        });

        router.lookup({
            method: "GET",
            url: "/this/is/staff",
            headers: { "accept-version" : "1.2.x" }
        });

        router.lookup({
            method: "GET",
            url: "/this/is/admin",
            headers: { "accept-version" : "*" }
        });
    });
});