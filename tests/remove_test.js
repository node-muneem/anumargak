var Anumargak = require("./../src/letsRoute");

describe("Anumargak remove route", function() {
    
    it("should remove static URLs", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/static", () => 30);
        anumargak.on("HEAD", "/this/is/static", () => 30);

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(1);
        expect(Object.keys(anumargak.staticRoutes.HEAD).length).toEqual(1);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("GET", "/this/is/static").handler()).toEqual(30);
        expect(anumargak.find("HEAD", "/this/is/static").handler()).toEqual(30);

        anumargak.off("GET", "/this/is/static");
        anumargak.off("HEAD", "/this/is/static");

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(0);
        expect(Object.keys(anumargak.staticRoutes.HEAD).length).toEqual(0);
        expect(anumargak.count).toEqual(0);

        expect(anumargak.find("GET", "/this/is/static") ).toEqual( null );
        expect(anumargak.find("HEAD", "/this/is/static") ).toEqual( null );
    });

    it("should remove dynamic URLs", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic", () => 30);
        anumargak.on("HEAD", "/this/is/:dynamic", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.HEAD).length).toEqual(1);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("GET", "/this/is/dynamic").handler()).toEqual(30);
        expect(anumargak.find("HEAD", "/this/is/dynamic").handler()).toEqual(30);

        anumargak.off("GET", "/this/is/:dynamic");
        anumargak.off("HEAD", "/this/is/:dynamic");

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(0);
        expect(Object.keys(anumargak.staticRoutes.HEAD).length).toEqual(0);
        expect(anumargak.count).toEqual(0);

        expect(anumargak.find("GET", "/this/is/dynamic") ).toEqual( null );
        expect(anumargak.find("HEAD", "/this/is/dynamic") ).toEqual( null );
    });

    it("should remove wildchar URLs", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/*/rest/url", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET","/this/is/dynamic").handler()).toEqual(30);
        expect(anumargak.find("GET","/this/is/dynamic/url").handler()).toEqual(30);
        expect(anumargak.find("GET","/this/is/*").handler()).toEqual(30);
        expect(anumargak.find("GET","/this/is/").handler()).toEqual(30);

        anumargak.off("GET", "/this/is/*/rest/url");

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(0);
        expect(anumargak.count).toEqual(0);

        expect(anumargak.find("GET","/this/is/dynamic") ).toEqual( null );
        expect(anumargak.find("GET","/this/is/dynamic/url") ).toEqual( null );
        expect(anumargak.find("GET","/this/is/*") ).toEqual( null );
        expect(anumargak.find("GET","/this/is/") ).toEqual( null );

    });

    it("should remove versioned URLs", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/versioned", () => 10 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.0' }, () => 30 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.1' }, () => 30 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.2' }, () => 30 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.3' }, () => 30 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.4' }, () => 30 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.5' }, () => 40 );
        anumargak.on("GET", "/this/is/versioned", { version: '2.1.0' }, () => 50 );
        anumargak.on("GET", "/this/is/versioned", { version: '2.2.0' }, () => 50 );
        anumargak.on("GET", "/this/is/versioned", { version: '2.3.0' }, () => 50 );
        anumargak.on("GET", "/this/is/versioned", { version: '2.4.0' }, () => 50 );

        expect( Object.keys(anumargak.staticRoutes.GET).length ).toEqual(1);
        expect( anumargak.count).toEqual(11);
        
        anumargak.off("GET", "/this/is/versioned", "1.2.x");

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(5); 

        anumargak.off("GET", "/this/is/versioned", "2.1.0");

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(4);
        
        anumargak.off("GET", "/this/is/versioned", "2.x");

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1); 

        anumargak.off("GET", "/this/is/versioned"); //it'll delete all the versions

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(0);
        expect(anumargak.count).toEqual(0); 

    });

    it("should remove versioned URLs", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/versioned", () => 10 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.0' }, () => 30 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.1' }, () => 30 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.2' }, () => 30 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.3' }, () => 30 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.4' }, () => 30 );
        anumargak.on("GET", "/this/is/versioned", { version: '1.2.5' }, () => 40 );
        anumargak.on("GET", "/this/is/versioned", { version: '2.1.0' }, () => 50 );
        anumargak.on("GET", "/this/is/versioned", { version: '2.2.0' }, () => 50 );
        anumargak.on("GET", "/this/is/versioned", { version: '2.3.0' }, () => 50 );
        anumargak.on("GET", "/this/is/versioned", { version: '2.4.0' }, () => 50 );

        anumargak.off("GET", "/this/is/versioned"); //it'll delete all the versions

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(0);
        expect(anumargak.count).toEqual(0); 

    });


    it("should remove dynamic versioned URLs", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:versioned", () => 10 );
        anumargak.on("GET", "/this/is/:versioned", { version: '1.2.0' }, () => 30 );
        anumargak.on("GET", "/this/is/:versioned", { version: '1.2.1' }, () => 30 );
        anumargak.on("GET", "/this/is/:versioned", { version: '1.2.2' }, () => 30 );
        anumargak.on("GET", "/this/is/:versioned", { version: '1.2.3' }, () => 30 );
        anumargak.on("GET", "/this/is/:versioned", { version: '1.2.4' }, () => 30 );
        anumargak.on("GET", "/this/is/:versioned", { version: '1.2.5' }, () => 40 );
        anumargak.on("GET", "/this/is/:versioned", { version: '2.1.0' }, () => 50 );
        anumargak.on("GET", "/this/is/:versioned", { version: '2.2.0' }, () => 50 );
        anumargak.on("GET", "/this/is/:versioned", { version: '2.3.0' }, () => 50 );
        anumargak.on("GET", "/this/is/:versioned", { version: '2.4.0' }, () => 50 );

        expect( Object.keys(anumargak.staticRoutes.GET).length ).toEqual(0);
        expect( Object.keys(anumargak.dynamicRoutes.GET).length ).toEqual(1);
        expect( anumargak.count).toEqual(11);
        
        anumargak.off("GET", "/this/is/:versioned", "1.2.x");

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(5); 

        anumargak.off("GET", "/this/is/:versioned", "2.1.0");

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(4);
        
        anumargak.off("GET", "/this/is/:versioned", "2.x");

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1); 

        anumargak.off("GET", "/this/is/:versioned"); //it'll delete all the versions

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(0);
        expect(anumargak.count).toEqual(0); 

    });

    it("should remove enumerated URLs", function() {
        var anumargak = Anumargak();

        anumargak.on("GET", "/login/as/:role(admin|user|staff)", () => 30);
        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(3);
        expect(anumargak.count).toEqual(1); 

        anumargak.off("GET", "/login/as/:role(admin|user|staff)"); //it'll delete all the versions

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(0);
        expect(anumargak.count).toEqual(0); 

    });


    it("should remove routes with named expressions", function() {
        var anumargak = Anumargak();

        anumargak.addNamedExpression("num", "\\d+");
        
        expect(anumargak.namedExpressions.count() ).toEqual(1);
        
        anumargak.on("GET", "/this/is/static", () => 30);
        anumargak.get("/this/is/:phone(:num:)", () => 50);

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(2); 
        
        anumargak.off("GET", "/this/is/:phone(:num:)");
        
        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(0);
        expect(anumargak.count).toEqual(1); 
    });
});